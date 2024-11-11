import { Constants } from './internals/Constants.js';
import { HttpClient } from './HttpClient.js';
import { LogModel } from './models/LogModel.js';
import LogStore from './stores/LogStore.js';
import { Utilities } from './Utilities.js';

/**
 * Facilitates logging via channel service.
 * 
 * ```js 
 * import { Logger } from 'platform/core'; 
 * ```  
 * 
 */
export class Logger {

	/**
	 * @static
	 * @returns {Logger} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new Logger());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {

		this._retryLogsSchedule();
	}

	/**
	 * Log "debug" entry via channel service.
	 *
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	debug(message, method, correlationId = null) {
		this._validateLog(message, method, correlationId);
		this.log(`debug`, message, method, correlationId);
	}

	/**
	 * Log "info" entry via channel service.
	 *
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	info(message, method, correlationId = null) {
		this._validateLog(message, method, correlationId);
		this.log(`info`, message, method, correlationId);

	}

	/**
	 * Log "warn" entry via channel service.
	 *
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	warn(message, method, correlationId = null) {
		this._validateLog(message, method, correlationId);
		this.log(`warn`, message, method, correlationId);
	}

	/**
	 * Log "error" entry via channel service.
	 *
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	error(message, method, correlationId = null) {
		this._validateLog(message, method, correlationId);
		this.log(`error`, message, method, correlationId);
	}

	/**
	 * Log "fatal" entry via channel service.
	 *
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for HttpRequest. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	fatal(message, method, correlationId = null) {
		this._validateLog(message, method, correlationId);
		return this.log(`fatal`, message, method, correlationId);
	}

	/**
	 * Log via channel service. Supported log levels are:
	 *
	 * @param {"debug"|"info"|"warn"|"error"|"fatal"} logLevel Log level, e.g. "debug".
	 * @param {String} message Message to log out.
	 * @param {String} method Calling member that log is being called from.
	 * @param {String} [correlationId=null] Correlation Id for log context. Auto generated if not provided
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	async log(logLevel, message, method, correlationId = null) {

		// Only publish if security is enabled.
		if (!window.platform.security) {
			return;
		}

		const logModel = new LogModel(logLevel, message, method, correlationId);
		try {
			await this._postLog(logModel);
		} catch (error) {
			console.warn(`Unable to log. Will attempt to retry.`);
			LogStore.pushRetryQueue(`logger`, logModel);
		}
	}

	_retryLogsSchedule() {

		setInterval(async () => {
			const queue = LogStore.getRetryQueue(`logger`);
			if (!queue || !queue.length) {
				return;
			}

			let logModel;
			while ((logModel = LogStore.shiftRetryQueue(`logger`)) !== undefined) {

				try {
					// Required to disable eslint no-await-in-loop because items need to be processed sequentially. 
					// eslint-disable-next-line no-await-in-loop
					await this._postLog(logModel);
				} catch (error) {
					// Add failed entry to front of queue to preserve order.
					LogStore.unshiftRetryQueue(`logger`, logModel);
					break;
				}
			}
		}, Constants.log.LOG_RETRY_INTERVAL);
	}

	async _postLog(logModel) {
		await HttpClient.getInstance().post(`/platform/logger/v1/log`, logModel, null, logModel.correlationId);
	}

	_validateLog(message, method = null, correlationId = null) {

		if (!message) {
			throw new Error(`Log "message" not provided`);
		} else if (typeof message === `object`) {
			message = JSON.stringify(message);

		} else if (!Utilities.isString(message)) {
			throw new Error(`Log "message" not of type string`);
		}

		if (method && !Utilities.isString(method)) {
			throw new Error(`Log "method" not of type string`);
		}

		if (correlationId && !Utilities.isString(correlationId)) {
			throw new Error(`Log "correlationId" not of type string`);
		}
	}

}

export default Logger.getInstance();