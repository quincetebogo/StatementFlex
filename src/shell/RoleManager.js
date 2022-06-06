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
		
		this.roles = Array.isArray(this._securityContext.roles) ? this._securityContext.roles : [];
	}

	// Indicates if an agent is with Helpdest role
	get isHelpDeskAgent() {
		// TO DO: `help-desk` is not the finalized wording, Needs to be updated once CS is ready to send helpdesk role in the token.
		
		return this.roles && this.roles.includes(`helpdesk-agent`);
	}

};