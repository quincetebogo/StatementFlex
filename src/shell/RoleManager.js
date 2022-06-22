import { Configuration } from 'platform/core';
import { SecurityContext } from 'platform/core';

/**
 * Agent role details records the details related to the role of an agent using Horizon.
 * This object is stored in state only for the current call.
 *
 * @export
 * @class RoleManager
 * @extends {}
 */

 export class RoleManager {
	
	static getInstance() {
		return this.instance || (this.instance = new RoleManager());
	}

	constructor() {
		
		if (this.instance) {
			return this.instance;
		}
		
		this._securityContext = SecurityContext.getInstance();
		this._configuration = Configuration.getInstance();
		
		this.roles = Array.isArray(this._securityContext.roles) ? this._securityContext.roles : [];
	}

	// Indicates if an agent is with Helpdest role
	get isHelpDeskAgent() {
		
		return this.roles && this.roles.includes(`helpdesk-agent`);
	}

	async isSearchClientEnabled() {
		const searchSearchEnabledByConfig = await this._configuration.getSetting(`searchClientOptionEnabled`);
		const searchClientEnabledByGroup = this.roles && this.roles.includes(`HZN_SEARCH_BUTTON_ENABLED`);

		return searchSearchEnabledByConfig || searchClientEnabledByGroup;
	}

};