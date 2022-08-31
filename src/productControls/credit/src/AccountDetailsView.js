import { Component, css, html } from 'platform/elements';

import 'app/components/common/HorizonLabel';

/**
 * Account details screen for Credit products 
 * Common view for credit card, access facility & term loan products.
 *
 * Events Raised
 * -------------
 *
 * back
 *
 * @export
 * @class AccountDetailsView
 * @extends {Component}
 */

 export class AccountDetailsView extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.accountDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} accountDetails - holds account details
	 *
	 * @readonly
	 * @static
	 * @memberof AccountDetailsView
	 */

	static get properties() {
		return {
			accountDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	// ---------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					height: 888px;
				}
				/* Title bar styles */
				.header {
					height: 80px;
					width: 1062px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 10px 24px 6px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 6px 33px 6px 16px;
					height: 64px;
					width: auto;
				}
				.left-arrow {
					cursor: pointer;
					margin-bottom: 24px;
				}
				/* Content styles */
				.details-vertical {
					width: auto;
					height: 808px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-layout-gap-spacing: 0px;
				}
				capitec-title-bar {
					height: 32px;

					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: #F7F7F7;
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
				}
				horizon-alert-banner {
					padding: 16px 16px 0px 16px;
				}
				.details-vertical > capitec-title-bar:not(:first-child) {
					margin-top: 16px;
				}
				horizon-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px 0px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				horizon-label[value="Active"][label="Account status"] {
					width: 33%;
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="In arrears"][label="Account status"] {
					width: 33%;
					--horizon-label-value-color: #a5132a;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-title-bar
					class="header"
					data-automation-id="account-details-title"
					type="credit">
						<capitec-image
							src="/images/liveBetter/left-arrow.svg"
							@click="${() => this._back()}"
							class="left-arrow">
						</capitec-image>
						<horizon-label
							class="main-title"
							label="${this.accountDetails.title}"
							value="${this.accountDetails.accountNumber}">
						</horizon-label>
				</capitec-title-bar>
				${this._renderContent()}
			</capitec-card>
		`;
	}

	_renderContent() {
		return html`
			<capitec-content-box
				class="details-vertical" 
				layout="vertical"
				gap="none"
				halign="stretch"
				valign="top">
					${this._renderArrearsAlertBanner()}
					${this._renderOverview()}
					${this._renderArrears()}
					${this._renderRepayment()}
					${this._renderInsurance()}
			</capitec-content-box>
		`;
	}

	_renderArrearsAlertBanner() {
		return !this.accountDetails.arrears
			? html``
			: html`
				<horizon-alert-banner
					type="error"
					header="Notify: "
					label="${this.accountDetails.title} is in arrears ${this.accountDetails.arrears[`Total arrears amount`]}">
				</horizon-alert-banner>`;
	}

	_renderOverview() {
		return html`
			<capitec-title-bar
				type="default"
				label="Overview">
			</capitec-title-bar>
			<capitec-group
				layout="horizontal"
				gap="none"
				halign="left"
				valign="top"
				wrap>
					${this._renderFields(this.accountDetails.overview)}
			</capitec-group>
		`;
	}

	_renderArrears() {
		return !this.accountDetails.arrears
			? html``
			: html`
				<capitec-title-bar
					type="default"
					label="Arrears">
				</capitec-title-bar>
				<capitec-group
					layout="horizontal"
					gap="none"
					halign="left"
					valign="top"
					wrap>
						${this._renderFields(this.accountDetails.arrears)}
				</capitec-group>`;
	}

	_renderRepayment() {
		return html`
			<capitec-title-bar
				type="default"
				label="Repayment">
			</capitec-title-bar>
			<capitec-group
				layout="horizontal"
				gap="none"
				halign="left"
				valign="top"
				wrap>
					${this._renderFields(this.accountDetails.repayment)}
			</capitec-group>
		`;
	}

	_renderInsurance() {
		return html`
			<capitec-title-bar
				type="default"
				label="Insurance">
			</capitec-title-bar>
			<capitec-group
				layout="horizontal"
				gap="none"
				halign="left"
				valign="top"
				wrap>
					${this._renderFields(this.accountDetails.insurance)}
			</capitec-group>`;
	}

	_renderFields(fields) {

		return Object.entries(fields).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					label="${label}"
					value="${value}"
					data-automation-id="budget-account-details-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
	}

	_kisokTemplate() {
		return this._webTemplate();
	}
 }

 customElements.define(`capitec-pc-account-details-view`, AccountDetailsView);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-pc-account-details-view ... @back="${this._handler}"></capitec-pc-account-details-view>
 *
 * @event AccountDetailsView#back
 * @type {Object} - N/A
 */