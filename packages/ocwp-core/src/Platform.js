import Auditer from './Auditer.js';
import Configuration from './Configuration.js';
import EventAggregator from './EventAggregator.js';
import Security from './Security.js';

/**
 * Bootstrap the platform's runtime configuration and authentication capabilities.
 * 
 * ```js 
 * import { Platform } from 'platform/core'; 
 *  ```  
 * 
 * @hideconstructor
 */
export class Platform {

	/**
	 * Initialises the platform by performing the following:
	 * 
	 * 1. Initialise the runtime configuration.
	 * 2. Initialise the authentication flow (if specified), which includes obtaining an identity token from one of the trusted IDPs.
	 * 
	 * NOTE: This method call is only required once within the context of the application, but as early as possible.
	 * 
	 * @example
	 * Platform.init({security: true});
	 * 
	 * @param {Object} [options] Platform init options.
	 * @param {Boolean} [options.security=true] When true, enables the default authentication flow. 
	 * 
	 * @static
	 * @returns {void}
	 */
	static init(options) {

		/** @private */
		this._options = options;

		// Attempt to create default options if are none provided.
		if (!this._options) {
			this._options = {
				security: true
			};
		}

		// Set the security setting on the global platform object.
		window.platform = {
			security: this._options.security
		};

		// Init config
		Configuration
			.init()
			.then(() => {

				// Attempt to init security, if specified, using additional config.
				if (this._options.security) {
					Promise
						.all([
							Configuration.getSetting(`idp`),
							Configuration.getSetting(`runtime.environment`),
							Configuration.getSetting(`runtime.idp`),
							Configuration.getSetting(`platform.application.idp`)
						])
						.then(([idp, environment, idpConfig, projectIdpSettings]) => {
							this._initSecurity(idp, environment, idpConfig, projectIdpSettings.client, projectIdpSettings.aud);
						});
				}
			});
	}

	/**
	 * Internal helper for security, DO NOT call this directly.
	 *
	 * @param {String} idp Name of IDP
	 * @param {String} env Name of environment
	 * @param {Object} idpConfig IDP config to use
	 * @param {String} client Application's IDP client name
	 * @param {String} aud Application's IDP audience name (Azure only)
	 * 
	 * @static
	 * @private
	 * @ignore
	 * @returns {void}
	 */
	static _initSecurity(idp, env, idpConfig, client, aud) {

		// Initialise Security flow.
		Security.init(idp, env, idpConfig, client, aud);

		Security.onAuthSuccess(() => {

			// Attempt to write audit entry.
			Auditer
				.success(`Platform.init()`, `User authentication successful`, `Authentication`)
				.catch(() => {
					console.warn(`Unable to write audit entry for successful user authentication via channel service.`);
				});

			// Publish DEPRECATED event to remain backwards compatible.
			if (Security.isAuthenticated && EventAggregator.eventLookup[`platform-security-context-updated`]) {
				console.warn(`EventAggregator event 'platform-security-context-updated' subscription(s) found. This event has been DEPRECATED in favor of Platform.onUserLoginSuccess(..)`);
				EventAggregator.publish(`platform-security-context-updated`);
			}

			// If the user provided a callback, call it.
			if (this.userLoginSuccessCallback) {
				this.userLoginSuccessCallback();
			} else {
				console.warn(`Authentication success, no callback!`);
			}
		});

		Security.onAuthError(() => {

			// Attempt to write audit entry.
			Auditer
				.failed(`Platform.init()`, `User authentication failed`, null, `Authentication`)
				.catch(() => {
					console.warn(`Unable to write audit entry for unsuccessful user authentication via channel service.`);
				});

			// Publish DEPRECATED event to remain backwards compatible.	
			if (EventAggregator.eventLookup[`platform-security-user-login-error`]) {
				console.warn(`EventAggregator event 'platform-security-user-login-error' subscription(s) found. This event has been DEPRECATED in favor of Platform.onUserLoginError(..)`);
				EventAggregator.publish(`platform-security-user-login-error`);
			}

			// If the user provided a callback, call it.
			if (this.userLoginErrorCallback) {
				this.userLoginErrorCallback();
			} else {
				console.warn(`Authentication error, no callback!`);
			}
		});

		Security.onAuthLogout(() => {

			// Attempt to write audit entry.
			Auditer
				.failed(`Platform.init()`, `User authentication logout`, null, `Authentication`)
				.catch(() => {
					console.warn(`Unable to write audit entry for unsuccessful user authentication via channel service.`);
				});

			// Publish DEPRECATED event to remain backwards compatible.		
			if (EventAggregator.eventLookup[`platform-security-user-logged-out`]) {
				console.warn(`EventAggregator event 'platform-security-user-logged-out' subscription(s) found. This event has been DEPRECATED in favor of Platform.onUserLoggedOut(..)`);
				EventAggregator.publish(`platform-security-user-logged-out`);
			}

			// If the user provided a callback, call it.
			if (this.userLoggedOutCallback) {
				this.userLoggedOutCallback();
			} else {
				console.warn(`Authentication logout, no callback!`);
			}
		});
	}

	/**
	 * Raised when the user is logged in.
	 * 
	 * @example
	 * Platform.onUserLoginSuccess(() => this._handleUserLoginSuccess());
	 *
	 * @static
	 * @param {Function} callback Consumer's handler.
	 * @returns {void}
	 */
	static onUserLoginSuccess(callback) {
		this.userLoginSuccessCallback = callback;
	}

	/**
	 * Raised when the user's login attempt failed.
	 *
	 * @example
	 * Platform.onUserLoginError(() => this._handleUserLoginError());
	 * 
	 * @static
	 * @param {Function} callback Consumer's handler.
	 * @returns {void}
	 */
	static onUserLoginError(callback) {
		this.userLoginErrorCallback = callback;
	}

	/**
	 * Raised when the user is logged out.
	 * 
	 * @example
	 * Platform.onUserLoggedOut(() => this._handleUserLoggedOut());
	 *
	 * @static
	 * @param {Function} callback Consumer's handler.
	 * @returns {void}
	 */
	static onUserLoggedOut(callback) {
		this.userLoggedOutCallback = callback;
	}
}