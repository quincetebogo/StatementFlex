import { Configuration, SecurityContext } from 'platform/core';
import { ORG_UNITS, ROLES_TO_ORG_UNITS } from 'app/constants/Common';

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

	get isAuthorised() {
		const isAuthorised = this.roles.includes(`helpdesk-agent`) || this.roles.includes(`clientcare-agent`) || this.roles.includes(`capitecconnect-agent`) || this.roles.includes(`capitecconnect-teamleader`) || this.roles.includes(`insure-agent`) || this.roles.includes(`insure-administrator`)
		return isAuthorised;
	}

	get isInsureAgent() {
		return this.roles && this.roles.includes(`insure-agent`);
	}

	get isInsureAdministrator() {
		return this.roles && this.roles.includes(`insure-administrator`);
	}

	get isCapitecConnectTeamleader() {
		return this.roles && this.roles.includes(`capitecconnect-teamleader`);
	}

	get isCapitecConnectAgent() {
		return this.roles && this.roles.includes(`capitecconnect-agent`);
	}

	get isClientCareAgent() {
		return this.roles && this.roles.includes(`clientcare-agent`);
	}

	get orgUnit() {
		const filteredAndSorted = this.roles
			.map((role) => ROLES_TO_ORG_UNITS[role]) // Map the roles to their corresponding orgUnit objects
			.filter(Boolean) // Remove any undefined elements in case a role is not found in rolesToOrgUnits
			.sort((a, b) => a.order - b.order); // Sort the orgUnit objects based on the order property

		if (filteredAndSorted.length > 0) {
			return filteredAndSorted[0].orgUnit;
		};

		// Defaults to client care when filtered roles are empty - Yet to confirm
		return ORG_UNITS.CLIENT_CARE;
	}

	async isSearchClientEnabled() {
		if (this.isAuthorised) {
			const searchClientEnabledByConfig = await this._configuration.getSetting(`searchClientOptionEnabled`);
			const searchClientEnabledByGroup = this.roles.map(element => element.toLowerCase()).includes(`hzn_search_button_enabled`);

			return searchClientEnabledByConfig || searchClientEnabledByGroup;
		}
		return false;
	}
};