/**
 * Model to use for auditing.
 * 
 * ```js 
 *  import { AuditModel } from 'platform/core' 
 * ```
 */
export class AuditModel {

    /**
     * Creates an instance of AuditModel.
     * 
     * @param {String} status End result of the method call or event on the interface. Value options are "Success", "Failed" or "Timeout".
     * @param {String} method Method name where the audit entry originates from.
     * @param {String} [error] In the case where the status value is "Failed", this is an optional field to store a short description of the reason for the error.
     * @param {String} [data] Additional content to log.
     * @param {String} [activity] Reference to the activity that is relevant from a Risk, Security or Governance point of view. Will by default be set to the method if not provided.
	 * @readonly
     */
	constructor(status, method, error, data, activity) {

        /**
         * End result of the method call or event on the interface, e.g. "Success".
         * @type {String}
         * @readonly
         */
		this.status = status;

        /**
         * Method name where the audit entry originates from.
         * @type {String}
         * @readonly
         */
		this.method = method;

        /**
         * Reference to the activity that is relevant from a Risk, Security or Governance point of view. Will by default be set to the method if not provided
         * @type {String}
         * @readonly
         */
		this.activity = activity || method;

        /**
         * A descriptive name of the interface (boundary or architectural articulation point) where the activity occurred.
         * @type {String}
         * @readonly
         */
		this.interfaceName = method;

        /**
         * Short description of the reason for the error.
         * @type {String}
         * @readonly
         */
		this.error = error;

        /**
         * Additional content to log.
         * @type {String|Object}
         * @readonly
         */
		this.data = data;

        /**
         * Username that performed the audit call, e.g. CP000000.
         * @type {String}
         * @ignore
         */
		this.accountRef = null;

        /**
         * Timestamp of the audit call in ISO 8601 format, e.g. 2019-05-06T14:50:23Z.
         * @type {String}
         * @ignore
         */
		this.startTimeStamp = null;

        /**
         * IDP associated with the security context, e.g. "keycloak".
         * @type {String}
         * @ignore
         */
		this.idpRef = null;

        /**
         * A descriptive text of the reporting building block which is logging the audit log entry. This will be set to the application name
         * @type {String}
         * @ignore
         */
		this.originator = null;

		this.ref = null; // Optional, could in future be set to the session ref for the current tab/user session

		
		/**
		 * The type of platform the component is built on.
		 * @type {String}
		 * @ignore
		 */
		this.platformType = null;
		
		/**
		 * The version of the Platform the component is built on
		 * @type {String} 
		 * @ignore
		 */
		this.platformVersion = null;

		/**
		 * The version of the running component
		 * @type {String}
		 * @ignore
		 */
		this.componentVersion = null;

		/**
		 * Indentify the interface type. Is it a API, User interface, file or DB
		 */
		this.interfaceType = `User interface`;

		Object.seal(this);
	}
}