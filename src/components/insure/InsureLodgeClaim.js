import { Component, css, html } from 'platform/elements';
import { Router } from 'platform/core';

/**
 * Lodge Claim screen, entry point to AgilePoint process
 * @class InsureLodgeClaim
 * @extends {Component}
 */
class InsureLodgeClaim extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this._router = Router.getInstance();
	}

	// ---------------
	// EVENT HANDLERS
	// --------------


	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			`
		];
	}

	_webTemplate() {
		return html`
		<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
			<capitec-title-bar type="insure"
				style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
				<capitec-icon size="title" icon="system/back-white" @click="${() => this._back()}" data-automation-id="????">
				</capitec-icon>
				<capitec-label label="Lodge Claim" type="title"></capitec-label>
			</capitec-title-bar>
			<capitec-card style="padding: 20px; min-height: 500px;">
				<iframe
					src="https://confluence.capitecbank.co.za:8443/login.action?os_destination=%2Fpages%2Fviewpage.action%3FspaceKey%3DCPT%26title%3DOmni-channel%2BWeb%2BPlatform%2B-%2BCLI&permissionViolation=true"
					height="600px" frameBorder="0">
		
				</iframe>
			</capitec-card>
		</capitec-content-box>`;
	}
}

window.customElements.define(`insure-lodge-claim`, InsureLodgeClaim);