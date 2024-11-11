import { Configuration } from './Configuration.js';
import { Constants } from './internals/Constants.js';
import { HttpClient } from './HttpClient.js';
import LogStore from './stores/LogStore.js';
import { MetricProcessor } from './MetricProcessor.js';


/** Base class for a reusable service (API wrapper or proxy class) within an application.
 * 
 * ```js 
 * import { Service } from 'platform/core'; 
 * ``` 
 * 
 * @example
 * export class PetService extends Service { 
 * 
 *   constructor() {
 *     super({ 
 *       baseUrlKey: `petChannelServiceUrl`, 
 *       name: `PetService`
 *     });
 *   }
 *  
 *   getPets() {
 *     return super.httpClient.request({
 *       method: `GET`,
 *       url: `/pets`
 *     });
 *   }
 * }
 */
export class Service {

	/**
	 * Base class constructor that scaffolds reusable {@link HttpClient} with metric support 
	 * using {@link MetricProcessor}.
	 * 
	 * @param {ServiceParameters} parameters Constructor parameters.
	 */
	constructor(parameters) {

		this._context = parameters.name;

		this._metricProcessor = MetricProcessor.getInstance(this._context);
		this._metricProcessor.onBadMetricPublishCallback((data) => this._handleBadMetric(data), this._context);
		this._metricProcessor.onGoodMetricsPublishCallback((data) => this._handleGoodMetrics(data), this._context);

		this._httpClient = HttpClient
			.getInstance(Configuration
				.getInstance()
				.getSetting(parameters.baseUrlKey), this._context);

		this._retryMetricSchedule();
	}

	/**
	 * Gets the reusable instance to use for secure API requests. This instance
	 * utilises the "baseUrlKey" value provided in the constructor as base URL 
	 * and if specified will require relative paths (e.g. "/pets").
	 *
	 * @readonly
	 * @type {HttpClient}
	 */
	get httpClient() {
		return this._httpClient;
	}

	/**
	 * Send the "bad" metric to the hosting service.
	 *
	 * @param {SingleContextualMetric} badMetric Processed metric.
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _handleBadMetric(badMetric) {

		if (!badMetric ||
			!badMetric.context ||
			!badMetric.metric) {
			throw new Error(`"badMetric" parameter object must be supplied with appropriate values.`);
		}

		if (badMetric.context !== this._context) {
			return;
		}

		// Enrich metric
		badMetric.metric.originator = await Configuration.getInstance().getSetting(`platform.application.name`);

		return new Promise((resolve) => {
			setTimeout(async () => {
				// console.log(`BAD`);
				try {
					await this._postSingleMetric(badMetric.metric);
				} catch (error) {
					console.warn(`Unable to send metric via channel service. Will attempt to retry.`);
					LogStore.pushRetryQueue(`metrics`, { batch: false, metric: badMetric.metric });
				}
				resolve();
			}, 1);
		});
	}

	/**
	 * Send the "good" metrics to the hosting service.
	 *
	 * @param {MultiContextualMetrics} goodMetrics Processed metrics.
	 * @returns {Promise<void>} Promise for the completed execution.
	 */
	async _handleGoodMetrics(goodMetrics) {

		if (!goodMetrics ||
			!goodMetrics.context ||
			!goodMetrics.metrics ||
			(!Array.isArray(goodMetrics.metrics) || goodMetrics.metrics.length === 0)) {
			throw new Error(`"goodMetrics" parameter object must be supplied with appropriate values.`);
		}

		if (goodMetrics.context !== this._context) {
			return;
		}

		const appName = await Configuration.getInstance().getSetting(`platform.application.name`);

		// Enrich metrics
		for (const metric of goodMetrics.metrics) {
			metric.originator = appName;
		}

		return new Promise((resolve) => {
			setTimeout(async () => {
				// console.log(`GOOD ${goodMetrics.metrics.length}`);
				try {
					await this._postBatchMetric(goodMetrics.metrics);
				} catch (error) {
					console.warn(`Unable to send batch metrics via channel service. Will attempt to retry.`);
					LogStore.pushRetryQueue(`metrics`, { batch: true, metrics: goodMetrics.metrics });
				}
				resolve();
			}, 1);
		});
	}

	_retryMetricSchedule() {
		setInterval(async () => {
			const queue = LogStore.getRetryQueue(`metrics`);
			if (!queue || !queue.length) {
				return;
			}

			let logModel;
			while ((logModel = LogStore.shiftRetryQueue(`metrics`)) !== undefined) {

				try {
					// Required to disable eslint no-await-in-loop because items need to be processed sequentially. 
					if (logModel.batch === true) {
						// eslint-disable-next-line no-await-in-loop
						await this._postBatchMetric(logModel.metrics);
					} else {
						// eslint-disable-next-line no-await-in-loop
						await this._postSingleMetric(logModel.metric);
					}

				} catch (error) {
					// Add failed entry to front of queue to preserve order.
					LogStore.unshiftRetryQueue(`metrics`, logModel);
					break;
				}
			}
		}, Constants.metrics.METRIC_RETRY_INTERVAL);
	}

	async _postSingleMetric(metric) {
		await HttpClient.getInstance().post(`/platform/metric/v1/single`, metric);
	}

	async _postBatchMetric(metrics) {
		await HttpClient.getInstance().post(`/platform/metric/v1/batch`, metrics);
	}
}