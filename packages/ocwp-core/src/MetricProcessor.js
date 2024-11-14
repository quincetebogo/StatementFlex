import { Constants } from './internals/Constants.js';
import { Mutex } from 'async-mutex';
import { Utilities } from './Utilities.js';

/**
 * Processes metrics generated for HTTP requests. This is based on the
 * centralised enterprise monitoring standards, whereby an SLA provided
 * for an HTTP request gets interpreted and dispatched to a consumer via
 * definable callbacks. 
 * 
 * **IMPORTANT:** It is not recommended to use this class directly. 
 * Instead utilising {@link Service} will automatically orchestrates combined 
 * usage of the {@link HttpClient} and {@link MetricProcessor} in order to 
 * capture, process and dispatch metrics. It is STRONGLY recommended to 
 * utilise {@link Service}, as a service base class, for all HTTP requests.
 * 
 * ```js 
 * import { MetricProcessor } from 'platform/core'; 
 * ```  
 * 
 */
export class MetricProcessor {

	/**
	 * @param {String} context Unique contextual name.
	 * 
	 * @static
	 * @returns {MetricProcessor} Singleton
	 */
	static getInstance(context) {

		if (!context) {
			throw new TypeError(`"context" parameter value must be supplied`);
		}

		if (!this.instance) {
			this.instance = new MetricProcessor(context);
		}

		// Initialise the context-specific maps on this instance.
		this.instance._setContext(context);

		return this.instance;
	}

	/**
	 * @hideconstructor
	 */
	constructor() {

		// Prepare the mutex object used for "locking" collections.
		this._mutex = new Mutex();

		// Prepare the context-keyed maps
		this._contextMetrics = new Map();
		this._contextDurations = new Map();
		this._contextBadMetricCallbacks = new Map();
		this._contextGoodMetricCallbacks = new Map();
	}

	/**
	 * Raised when a "bad" metric is dispatched.
	 *
	 * @param {Function} callback Remote handler.
	 * @param {String} context Unique contextual name.
	 * 
	 * @example
	 * metricProcessor.onBadMetricPublishCallback((d) => this._handleBadMetric(d), "some-context");
	 * 
	 * @returns {void}
	 */
	onBadMetricPublishCallback(callback, context) {

		if (!callback) {
			throw new TypeError(`"callback" parameter value must be supplied`);
		}

		if (!context) {
			throw new TypeError(`"context" parameter value must be supplied`);
		}

		this._contextBadMetricCallbacks.set(context, callback);
	}

	/**
	 * Raised when "good" metrics are dispatched.
	 *
	 * @example
	 * metricProcessor.onGoodMetricsPublishCallback((d) => this._handleGoodMetrics(d), "some-context");
	 * 
	 * @param {Function} callback Remote handler.
	 * @param {String} context Unique contextual name.
	 * 
	 * @returns {void}
	 */
	onGoodMetricsPublishCallback(callback, context) {

		if (!callback) {
			throw new TypeError(`"callback" parameter value must be supplied`);
		}

		if (!context) {
			throw new TypeError(`"context" parameter value must be supplied`);
		}

		this._contextGoodMetricCallbacks.set(context, callback);
	}

	/**
	 * Determines the SLA for a provided metric and determines the 
	 * various successful and unsuccessful outcomes.
	 *
	 * @param {Metric} metric Raw metric object instance to process.
	 * @param {Boolean} timedOut When true, means that the HTTP request timed out.
	 * 
	 * @returns {void}
	 */
	processMetric(metric, timedOut) {

		if (!metric) {
			throw new TypeError(`"metric" parameter value must be supplied.`);
		}

		if (!metric.duration) {
			throw new TypeError(`"metric.duration" parameter value must be supplied.`);
		}

		if (!metric.sla) {
			throw new TypeError(`"metric.sla" parameter value must be supplied.`);
		}

		if (!metric.context || !this._contextMetrics.get(metric.context)) {
			throw new TypeError(`"metric.context" parameter value must be supplied and must match an existing context.`);
		}

		// Determine SLA outcome.
		const withinSLA = metric.duration < metric.sla;

		if (withinSLA) {

			metric.status = `Success`;

			// Completed successfully (including business failures) within SLA, aggregate metric.
			// Lock the mutex to handle concurrency.
			this._mutex
				.acquire()
				.then((release) => {
					try {

						const aggregatedMetrics = this._contextMetrics.get(metric.context);
						aggregatedMetrics.push(metric);

						if (aggregatedMetrics.length === Constants.metrics.AGGREGATION_MAX_COUNT) {
							this._dispatchGoodMetrics(Utilities.deepCopy(aggregatedMetrics), metric.context);
						}

					} finally {
						release();
					}
				});

		} else {

			metric.status = timedOut ? `Timeout` : `Failed`;

			// Completed unsuccessfully within SLA, send metric OR
			// Completed successfully outside SLA, send metric OR
			// Completed unsuccessfully outside SLA, send metric OR
			// Undetermined outcome, send metric.
			this._dispatchBadMetric(metric, metric.context);
		}
	}

	/**
	 * Dispatches "bad" processed metric.
	 *
	 * @param {Metric} metric Metric object containing HTTP request detail.
	 * @param {String} context Unique contextual name.
	 * 
	 * @private
	 * @ignore
	 * @returns {void}
	 */
	_dispatchBadMetric(metric, context) {

		/** @type {SingleContextualMetric} */
		const payload = {
			context,
			metric
		};

		const badMetricCallback = this._contextBadMetricCallbacks.get(context);
		if (!badMetricCallback) {
			throw new ReferenceError(`[MetricProcessor] - No callback defined to receive "bad" metric.`);
		}

		badMetricCallback(payload);
	}

	/**
	 * Dispatches "good" processed metrics.
	 *
	 * @param {Array<Metric>} metrics Metric objects containing HTTP request detail.
	 * @param {String} context Unique contextual name.
	 * 
	 * @private
	 * @ignore
	 * @returns {void}
	 */
	_dispatchGoodMetrics(metrics, context) {

		if (metrics.length > 0) {

			/** @type {MultiContextualMetrics} */
			const payload = {
				context,
				metrics
			};

			const goodMetricsCallback = this._contextGoodMetricCallbacks.get(context);
			if (!goodMetricsCallback) {
				throw new ReferenceError(`[MetricProcessor] - No callback defined to receive "good" metrics.`);
			}

			goodMetricsCallback(payload);
		}

		this._setContext(context, true);
	}

	/**
	 * Creates an object for the unique name supplied.
	 *
	 * @param {String} context Unique contextual name.
	 * @param {Boolean} [force=false] When true, forces object (re)creation.
	 * 
	 * @private
	 * @ignore
	 * @returns {void}
	 */
	_setContext(context, force = false) {

		if (!this._contextMetrics.get(context) || force) {

			// Set the array that must hold aggregated "good" metrics.
			this._contextMetrics.set(context, []);

			// Clear the timer (if any).
			clearTimeout(this._contextDurations.get(context));

			// Set the timer that will attempt to publish aggregated "good" metrics after X amount of time.
			this._contextDurations.set(context, setTimeout(() => {

				// Use the class-level mutex to prevent concurrent array mutations, while performing
				// a publish + resetting the array.
				this._mutex
					.acquire()
					.then((release) => {
						try {
							this._dispatchGoodMetrics(this._contextMetrics.get(context), context);
						} finally {
							release();
						}
					});
			}, Constants.metrics.AGGREGATION_MAX_TIME));
		}
	}
}