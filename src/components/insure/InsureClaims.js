import { Component, css, html } from 'platform/elements';
import { Router } from 'platform/core';

class InsureClaims extends Component {

	constructor() {
		super();
		this._router = Router.getInstance();
	}

	_back() {
		// this._router.navigateByPath(`/landing`);
	}

	_lodgeClaim() {
		// this._router.navigateByPath(`/insure-lodge-claim`);
	}

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			`
		];
	}

	/**
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		<capitec-content-box layout="vertical" halign="stretch" valign="top" gap="clear">
			<capitec-title-bar type="insure"
				style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
				<img class="left-arrow-icon" src="/images/insure/left-arrow.svg" @click="${() => this._back()}" />
				<capitec-label label="Claims" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="Lodge Claim" type="white" @click="${() => this._lodgeClaim()}"></capitec-button>
			</capitec-title-bar>
			<capitec-card style="padding: 20px; min-height: 100vh;">
				All my pretty claims
			</capitec-card>
		</capitec-content-box>`;
	}
}

window.customElements.define(`insure-claims`, InsureClaims);