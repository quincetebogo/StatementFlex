import Helpers from './internals/Helpers.js';
import Security from './Security.js';

/**
 * Exposes runtime security information.
 * 
 * ```js 
 *  import { SecurityContext } from 'platform/core'; 
 * ``` 
 */
export class SecurityContext {

	/**
	 * @static
	 * @returns {SecurityContext} Singleton
	 */
	static getInstance() {
		return this.instance || (this.instance = new SecurityContext());
	}

	/**
	 * @hideconstructor
	 */
	constructor() {
		return Helpers.getProxy(this);
	}

	/**
	* Full name of the logged in user, e.g. John Doe.
	* @type {String}
	* @readonly
	*/
	get fullName() {
		return Security.getTokenValue(`name`);
	}

	/**
	* First name of the logged in user, e.g. John.
	* @type {String}
	* @readonly
	*/
	get firstName() {
		return Security.getTokenValue(`given_name`);
	}

	/**
	* Last name of the logged in user, e.g. Doe.
	* @type {String}
	* @readonly
	*/
	get lastName() {
		return Security.getTokenValue(`family_name`);
	}

	/**
	* Email address of the logged in user, e.g. someone@somewhere.com.
	* @type {String}
	* @readonly
	*/
	get email() {

		if (Security.idp === `azure`) {
			return Security.getTokenValue(`unique_name`);
		}

		return Security.getTokenValue(`email`);
	}

	/**
	* Identifier of the logged in user, e.g. CP000000.
	* @type {String}
	* @readonly
	*/
	get username() {

		if (Security.idp === `azure`) {
			return Security.getTokenValue(`upn`);
		}

		return Security.getTokenValue(`preferred_username`);
	}

	/**
	* Role(s) of the logged in user.
	* @type {Array<String>}
	* @readonly
	*/
	get roles() {
		return Security.getTokenValue(`roles`);
	}

	/**
	* Name of the trusted IDP, e.g keycloak.
	* @type {String}
	* @readonly
	*/
	get idp() {
		return Security.idp;
	}
}

export default SecurityContext.getInstance();