import { v4, validate } from 'uuid';
import { Constants } from './internals/Constants.js';
import { HttpClient } from './HttpClient.js';
import LogStore from './stores/LogStore.js';
import { Utilities } from './Utilities.js';


/**
 * A class that provides the ability to capture business telemetry events. 
 * Events can be captured either individually or within a span.
 * 
 * ```js 
 * import { Telemetry } from 'platform/core'; 
 * ```
 * 
 */
export class Telemetry {

	/**
	 * @static
	 * @returns {Telemetry} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new Telemetry());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {
		this._retryTelemetrySchedule(Constants.telemetry.TELEMETRY_EVENT);
		this._retryTelemetrySchedule(Constants.telemetry.SPAN_START_EVENT);
		this._retryTelemetrySchedule(Constants.telemetry.SPAN_END_EVENT);
	}

	/**
	 * Capture an event, can either be standalone or part of a span.
	 *
	 * @param {TelemetryEventModel} params Parameters for the method.
	 * 
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	async event(params) {

		// Only publish if security is enabled.
		if (!window.platform.security) {
			return;
		}

		this._validateTelemetryEventParams(params);

		// Generate the timestamp
		params.timestamp = new Date().toISOString();

		try {
			await this._postTelemetryEvent(params, true);
		} catch (error) {
			console.warn(`Unable to log telemetry event via channel service. Will attempt to retry.`);
			LogStore.pushRetryQueue(Constants.telemetry.TELEMETRY_EVENT, params);
		}
	}

	/**
	 * Capture a start event for a span. 
	 *
	 * @param {TelemetrySpanStartModel} params Parameters for the method.
	 * 
	 * @returns {Promise<string>} Promise of the created span id.
	 */
	async spanStart(params) {

		// Only publish if security is enabled.
		if (!window.platform.security) {
			return;
		}

		this._validateSpanStartParams(params, false);

		// Generate the timestamp.
		params.timestamp = new Date().toISOString();

		// Generate the spanId.
		params.spanId = v4();

		try {
			await this._postSpanStartEvent(params, true);
		} catch (error) {
			console.warn(`Unable to log start span event via channel service. Will attempt to retry.`);
			LogStore.pushRetryQueue(Constants.telemetry.SPAN_START_EVENT, params);
		}

		return params.spanId;
	}

	/**
	 * Capture a corresponding end event of a previously started span.
	 *
	 * @param {TelemetrySpanEndModel} params Parameters for the method.
	 * 
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	async spanEnd(params) {

		// Only publish if security is enabled.
		if (!window.platform.security) {
			return;
		}
		
		this._validateSpanEndParams(params);

		// Generate the timestamp.
		params.timestamp = new Date().toISOString();

		try {
			await this._postSpanEndEvent(params, true);
		} catch (error) {
			console.warn(`Unable to log end span event via channel service. Will attempt to retry.`);
			LogStore.pushRetryQueue(Constants.telemetry.SPAN_END_EVENT, params);
		}
	}

	_retryTelemetrySchedule(telemetryType) {
		setInterval(async () => {
			const queue = LogStore.getRetryQueue(telemetryType);
			if (!queue || !queue.length) {
				return;
			}

			let telemetryKey;
			while ((telemetryKey = LogStore.shiftRetryQueue(telemetryType)) !== undefined) {

				try {
					// Required to disable eslint no-await-in-loop because items need to be processed sequentially.
					// eslint-disable-next-line no-await-in-loop
					switch (telemetryType) {
						case Constants.telemetry.TELEMETRY_EVENT:
							// Required to disable eslint no-await-in-loop because items need to be processed sequentially.
							// eslint-disable-next-line no-await-in-loop
							await this._postTelemetryEvent(telemetryKey);
							break;
						case Constants.telemetry.SPAN_START_EVENT:
							// Required to disable eslint no-await-in-loop because items need to be processed sequentially.
							// eslint-disable-next-line no-await-in-loop
							await this._postSpanStartEvent(telemetryKey);
							break;
						case Constants.telemetry.SPAN_END_EVENT:
							// Required to disable eslint no-await-in-loop because items need to be processed sequentially.
							// eslint-disable-next-line no-await-in-loop
							await this._postSpanEndEvent(telemetryKey);

							break;
						default:
							break;
					}
				} catch (error) {
					// Add failed entry to front of queue to preserve order.
					LogStore.unshiftRetryQueue(telemetryType, telemetryKey);
					break;
				}
			}
		}, Constants.telemetry.TELEMETRY_RETRY_INTERVAL);
	}

	_validateTelemetryParams(params) {

		if (!params) {
			throw new Error(`"params" not provided`);
		}

		if (!params.eventName) {
			throw new Error(`"params.eventName" not provided`);
		}

		if (!Utilities.isString(params.eventName)) {
			throw new Error(`"params.eventName" not of type string`);
		}
		
		if (!params.eventType) {
			throw new Error(`"params.eventType" not provided`);
		}

		if (params.eventType !== `system` && params.eventType !== `person`) {
			throw new Error(`"params.eventType" invalid`);
		}

		if (!params.eventOriginator) {
			throw new Error(`"params.eventOriginator" not provided`);
		}

		if (!Utilities.isString(params.eventOriginator)) {
			throw new Error(`"params.eventOriginator" not of type string`);
		}

		if (!params.tags) {
			throw new Error(`"params.tags" not provided`);
		}

		if (!Array.isArray(params.tags)) {
			throw new Error(`"params.tags" invalid`);
		}

		if (params.baggage && (!Array.isArray(params.baggage) || !params.baggage.every(item => {

			if (!item.key || !Utilities.isString(item.key)) {
				return false;
			}

			if (item.value) {
				return Utilities.isString(item.value);
			}

			return true;

		}))) {
			throw new Error(`"params.baggage" invalid`);
		}
		
	}

	_validateTelemetryEventParams(params) {

		this._validateTelemetryParams(params);

		if (!params.traceId) {
			throw new Error(`"params.traceId" not provided`);
		}

		if (Utilities.isEmptyObject(params.traceId) || !validate(params.traceId)) {
			throw new Error(`"params.traceId" not valid uuid`);
		}

		if (params.spanId && (Utilities.isEmptyObject(params.spanId) || !validate(params.spanId))) {
			throw new Error(`"params.spanId" is not a valid uuid`);
		}
	}

	_validateSpanStartParams(params, requireSpanId = false) {

		this._validateTelemetryParams(params);

		if (!params.traceId) {
			throw new Error(`"params.traceId" not provided`);
		}

		if (Utilities.isEmptyObject(params.traceId) || !validate(params.traceId)) {
			throw new Error(`"params.traceId" is not a valid uuid`);
		}

		if (requireSpanId) {
			if (!params.spanId) {
				throw new Error(`"params.spanId" not available`);
			}

			if (Utilities.isEmptyObject(params.spanId) || !validate(params.spanId)) {
				throw new Error(`"params.spanId" is not a valid uuid`);
			}
		}
	}

	_validateSpanEndParams(params) {

		this._validateTelemetryParams(params);

		if (!params.spanId) {
			throw new Error(`"params.spanId" not provided`);
		}

		if (Utilities.isEmptyObject(params.spanId) || !validate(params.spanId)) {
			throw new Error(`"params.spanId" is not a valid uuid`);
		}

	}

	async _postSpanStartEvent(params, skipValidation = false) {

		let valid = true;
		if (!skipValidation) {
			try {
				this._validateSpanStartParams(params, true);

			} catch (error) {
				valid = false;
				console.error(error, params);
			}
		}

		if (valid) {
			await HttpClient.getInstance().post(`/platform/telemetry/v1/span/start`, params);
		}
	}

	async _postTelemetryEvent(params, skipValidation = false) {
		let valid = true;

		if (!skipValidation) {
			try {
				this._validateTelemetryEventParams(params);
			} catch (error) {
				valid = false;
				console.error(error, params);
			}
		}

		if (valid) {
			await HttpClient.getInstance().post(`/platform/telemetry/v1/event`, params);
		}
	}

	async _postSpanEndEvent(params, skipValidation = false) {
		let valid = true;
		if (!skipValidation) {
			try {
				this._validateSpanEndParams(params);
			} catch (error) {
				valid = false;
				console.error(error, params);
			}
		}

		if (valid) {
			await HttpClient.getInstance().post(`/platform/telemetry/v1/span/end`, params);
		}
	}

}

export default Telemetry.getInstance();