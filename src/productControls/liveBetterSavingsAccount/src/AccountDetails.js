import { Component, css, html } from 'platform/elements';
import 'app/components/common/HorizonLabel';

/**
 * Account details screen for Live better flow
 *
 * Events Raised
 * -------------
 * 
 * back
 * 
 * @export
 * @class AccountDetails
 * @extends {Component}
 */

 export class AccountDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TO DO: Account details to be passed from landing screen once CS call is implemented.
		this.accountDetails = null;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} accountDetails Data for the Account details screen from Live Better
	 *
	 * @readonly
	 * @static
	 * @memberof AccountDetails
	 */
	static get properties() {
		return {
			accountDetails: { type: Object }
		};
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
				capitec-title-bar {
					height: 80px;
					width: 1062px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 10px 24px 6px 16px;
					--theme-titlebar-item-gap: 0px;
					--theme-type-primary-background: url(../images/liveBetter/LBB_bg-1092x80.png);
				}
				
				.left-arrow {
					padding-bottom: 26px;
					cursor: pointer;
				}

				.alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-width: 1032px;
					--theme-alert-banner-font-weight: 600;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-icon-margin-right: 12px;
					--theme-alert-banner-icon-margin-left: 16px;
				}

				.alert-banner-paragraph {
					display: inline-block;
					font-weight: 400;
					color: #3A3A3A;
				}
				
				.sub-header {
					height: 24px;
					margin-bottom: 8px;
				}

				.details-vertical {
					width: auto;
					height: auto;
					margin-bottom: 24px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-layout-gap-spacing: 0px;
				}

				.details-horizontal {
					padding-left: 15px;
				}

				horizon-label {
					height: 64px;
					width: 205px;
					padding: 12px 8px 12px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}

				capitec-label {
					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 18px;
					--theme-label-font-weight: 600;
					margin-left: 16px;
				}

				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-text-height: 32px;
					--horizon-label-text-font-weight: 600;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-weight: 500;
					padding: 6px 33px 6px 16px;
					height: 64px;
					width: 218px;
				}

				.title-style {
					margin-left: 8px;

					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--horizon-label-text-line-height: 32px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-value-line-height: 47px;
				}

				.col-3 {
					width: 158px;
				}

				.capitec-image {
					width: 22px;
					height: 21px;
				}
				
				.toggle-group {
					width: 205px;
					height: 60px;

					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					--theme-toggle-label-spacing: 2px;
					--theme-toggle-track-inset: 1px;
					padding-left: 18px;
				}
				.toggle-group > capitec-toggle {
					--theme-toggle-label-spacing: 6px;
				}

				.toggle-label {
					margin-left: 0px;
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
					data-automation-id="live-better-account-details-title"
					type="primary">
						<img
						src="src/productControls/liveBetterSavingsAccount/images/left-arrow.svg"
						@click="${() => this._back()}"
						class="left-arrow"/>
						<horizon-label
							class="main-title"
							label="Account Details"
							value="1633824509">
						</horizon-label>
				</capitec-title-bar>

				<capitec-content-box>
					${this._renderAlertBanner()}
					${this._renderAccountDetails()}
					${this._renderAutomaticSavings()}
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderAlertBanner() {
		return html`
			<capitec-alert-banner 
				type="info" 
				class="alert-banner"
				label="Notify Client:">
					<p class="alert-banner-paragraph">
						You can only fund this account with Benefits Partner cash backs and Capitec cash backs
					</p>
			</capitec-alert-banner>
		`;
	}

	_renderAccountDetails() {
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
				<capitec-group class="sub-header" layout="horizontal" gap="clear" halign="left" valign="center">
					<capitec-image src="src/productControls/liveBetterSavingsAccount/images/AccountDetails.svg"></capitec-image>
					<capitec-label
						label="Account details"
						class="title-style"
						type="title">
					</capitec-label>
				</capitec-group>
				<capitec-group 
					class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<horizon-label 
							data-automation-id="live-better-account-details-account-number"
							label="Account number" 
							value="1633824509">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-available-balance" 
							label="Available balance" 
							value="R150.00">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-rate"
							class="col-3"
							label="Interest rate" 
							value="3.25%">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-june"
							label="Interest earned in June" 
							value="R12.50">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-may"
							label="Interest earned in May" 
							value="R15.50">
						</horizon-label>
				</capitec-group>

				<capitec-group 
					class="details-horizontal"
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<horizon-label 
							data-automation-id="live-better-account-details-interest-tax-year"
							label="Interest tax year" 
							value="R340.00">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-date-opened"
							label="Date opened" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
							class="col-3"
							data-automation-id="live-better-account-details-status"
							label="Status" 
							value="Active">
						</horizon-label>
				</capitec-group>
		</capitec-content-box>
		`;
	}

	_renderAutomaticSavings() {
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
				<capitec-group class="sub-header" layout="horizontal" gap="clear" halign="left" valign="center">
					<capitec-image src="src/productControls/liveBetterSavingsAccount/images/AutomaticSavings.svg"></capitec-image>
						<capitec-label 
							label="Automatic savings"
							type="title"
							class="title-style">
						</capitec-label>
				</capitec-group>
				<capitec-group 
					class="details-horizontal"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="top">
						<capitec-group class="toggle-group" layout="vertical" gap="none" halign="left" valign="center">
							<capitec-label label="Round-up" class="toggle-label"></capitec-label>
							<capitec-toggle label="R5.00" checked></capitec-toggle>
						</capitec-group>
						<horizon-label 
							data-automation-id="live-better-account-details-last-update-round-up"
							label="Last update" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-round-up-accounts"
							label="Round-up account(s)" 
							value="Savings Account">
						</horizon-label>
				</capitec-group>

				<capitec-group
					class="details-horizontal"
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<capitec-group class="toggle-group" layout="vertical" gap="none" halign="left" valign="center">
							<capitec-label label="Interest Sweep" class="toggle-label"></capitec-label>
							<capitec-toggle label="On" checked></capitec-toggle>
						</capitec-group>
						<horizon-label 
							data-automation-id="live-better-account-details-last-update-interest-sweep"
							label="Last update" 
							value="12 May 2021">
						</horizon-label>
				</capitec-group>
		</capitec-content-box>
		`;
	}
 }

 customElements.define(`capitec-pc-live-better-account-details`, AccountDetails);