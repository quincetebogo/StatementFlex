/**
 * Model to use for logging.
 * 
 * ```js 
 *  import { LogModel } from 'platform/core' 
 * ```
 */
export class LogModel {

    /**
     * Creates an instance of LogModel.
     * 
     * @param {"debug"|"info"|"warn"|"error"|"fatal"} logLevel Log level, e.g. "debug".
     * @param {String} message Message to logout
     * @param {String} method Calling member that log is being called from.
     * @param {String} [correlationId=null] Correlation Id for log context. Auto generated if not provided.
	 * @readonly
     */
	constructor(logLevel, message, method, correlationId = null) {

        /**
         * Log level e.g. "debug".
         * @type {"debug"|"info"|"warn"|"error"|"fatal"}
         * @readonly
         */
		this.logLevel = logLevel;

        /**
         * Log message to logout.
         * @type {String}
         * @readonly
         */
		this.message = message;

        /**
         * Calling member that log is being called from
         * @type {String}
         * @readonly
         */
		this.method = method;

        /**
         * Correlation Id for log context. Auto generated if not provided.
         * @type {String}
         * @readonly
         */
		this.correlationId = correlationId || null;

		Object.seal(this);
	}
}