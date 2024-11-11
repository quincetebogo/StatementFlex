import { AuditModel } from './models/AuditModel.js';
import Configuration from './Configuration.js';
import { Constants } from './internals/Constants.js';
import { DateTime } from 'luxon';
import { HttpClient } from './HttpClient.js';
import LogStore from './stores/LogStore.js';
import SecurityContext from './SecurityContext.js';
import { Utilities } from './Utilities.js';

/**
 * Facilitates auditing via Channel Service.
 * 
 * ```js 
 * import { Auditer } from 'platform/core'; 
 * ```
 * 
 * @hideconstructor
 */
export class Auditer {

	/**
	 * @static
	 * @returns {Auditer} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new Auditer());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {
		this._retryAuditsSchedule();
	}

	/**
	 * Log "success" audit entry via Channel Service.
	 *
	 * @param {String} method Method name where the audit entry originates from.
	 * @param {String} [data] Additional content to log.
	 * @param {String} [activity] Reference to the activity that is relevant from a Risk, Security or Governance point of view. Will by default be set to the method if not provided
	 * 
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	success(method, data, activity) {
		this._validateAudit(method, activity, data);

		return this.audit(new AuditModel(`Success`, method, null, data, activity));
	}

	/**
	 * Log "failed" audit entry via Channel Service.
	 *
	 * @param {String} method Method name where the audit entry originates from.
	 * @param {String} [error] Short description of the reason for the error.
	 * @param {String} [data] Additional content to log.
	 * @param {String} [activity] Reference to the activity that is relevant from a Risk, Security or Governance point of view. Will by default be set to the method if not provided
	 * 
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	failed(method, error, data, activity) {
		this._validateAudit(method, activity, data, error);

		return this.audit(new AuditModel(`Failed`, method, error, data, activity));
	}

	/**
	 * Log audit entry via Channel Service.
	 *
	 * @param {AuditModel} audit Instance to pass in
	 * @returns {Promise<void>} Promise of the completed method call.
	 */
	async audit(audit) {

		// Only publish if security is enabled.
		if (!window.platform.security) {
			return;
		}

		if (audit &&
			audit instanceof AuditModel &&
			audit.method) {

			audit.startTimeStamp = DateTime.utc().toISO();
			audit.accountRef = SecurityContext.username;
			audit.idpRef = await Configuration.getSetting(`runtime.idp.${SecurityContext.idp}.auth-server-url`);
			audit.originator = await Configuration.getSetting(`platform.application.name`);
			audit.platformVersion = await Configuration.getSetting(`platform.version`);
			audit.componentVersion = await Configuration.getSetting(`platform.application.version`);

		} else {
			throw new TypeError(`Invalid model`);
		}

		try {
			await this._postAudit(audit);
		} catch (error) {
			console.warn(`Unable to audit via channel service. Will attempt to retry.`);
			LogStore.pushRetryQueue(`audit`, audit);
		}
	}

	_retryAuditsSchedule() {

		setInterval(async () => {
			const queue = LogStore.getRetryQueue(`audit`);
			if (!queue || !queue.length) {
				return;
			}

			let auditModel;
			while ((auditModel = LogStore.shiftRetryQueue(`audit`)) !== undefined) {

				try {
					// Required to disable eslint no-await-in-loop because items need to be processed sequentially.
					// eslint-disable-next-line no-await-in-loop
					await this._postAudit(auditModel);
				} catch (error) {
					// Add failed entry to front of queue to preserve order.
					LogStore.unshiftRetryQueue(`audit`, auditModel);
					break;
				}
			}
		}, Constants.log.LOG_RETRY_INTERVAL);
	}

	async _postAudit(auditModel) {
		await HttpClient.getInstance().post(`/platform/auditer/v1/audit`, auditModel);
	}

	_validateAudit(method, activity, data = null, error = null) {

		if (!method) {
			throw new Error(`Audit log "method" not provided`);
		} else if (!Utilities.isString(method)) {
			throw new Error(`Audit log "method" not of type string`);
		}

		if (!activity) {
			throw new Error(`Audit log "activity" not provided`);
		} else if (!Utilities.isString(activity)) {
			throw new Error(`Audit log "activity" not of type string`);
		}

		if (data && !Utilities.isString(data)) {
			throw new Error(`Audit log "data" not of type string`);
		}

		if (error && !Utilities.isString(error)) {
			throw new Error(`Audit log "error" not of type string`);
		}

	}
}

export default Auditer.getInstance();