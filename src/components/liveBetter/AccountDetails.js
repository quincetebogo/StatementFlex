import { Component, css, html } from 'platform/elements';
import 'app/components/common/HorizonLabel';

/**
 * Savings Account View REMEMBER TO UPDATE
 *
 * Events Raised
 * -------------
 * 
 * option-click
 * 
 * @export
 * @class SavingsAccount
 * @extends {Component}
 */

 export class AccountDetails extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

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
	 * @property {Object} accountDetails Data for the Savings Account Landing Page display
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

	// EVENT HANDLERS
	// --------------
	// --------------
	// PUBLIC METHODS
	// --------------
	// ---------------
	// PRIVATE METHODS
	// ---------------
	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`

				capitec-title-bar {
					--theme-type-primary-background: url(../../images/liveBetter/LBB_bg-1092x80.png);
					height: 80px;
					width: 1062px;
				}

				capitec-modal {
					height: 581px;
					--theme-modal-free-max-width: 572px;
					--theme-modal-body-box-shadow: 0px;

					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-background-color: #009de0;

					--theme-modal-footer-padding: 0px 0px 0px 0px;
				}

				/* Styles to display background color of header as a gradient*/
				.header-gradient {
					width: 572px;
					border-radius: 4px 4px 0px 0px;
					position: absolute;
					left: -551px;
					top: -44px;					
					background: linear-gradient(90deg, #0084D5 0%, #009DE0 100%);
					--theme-label-title-font-size: 18px;
					--theme-titlebar-padding: 20px 16px;
					--theme-label-font-family: 'Hind Vadodara semibold';
				}

				.header-gradient {
					line-height: 64px;
					padding-left: 16px;
					--theme-label-default-font-size: 18px;
					--theme-label-font-color: #ffffff;
					letter-spacing: 0;
					--theme-label-font-family: 'Hind Vadodara SemiBold';
				}

				/* Account details Styles */
				.details-vertical {
					width: 989px;
					height: 177px; 
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 8px;
					--theme-layout-gap-spacing: 0px;
				}

				.details-horizontal {
					--theme-layout-gap-spacing: 9px;
					padding-left: 15px;
				}

				horizon-label {
					height: 56px;
					padding: 12px 8px 10px 16px;

					--horizon-label-text-height: 12px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-weight: 600;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
					
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-margin-top: 2px;
				}

				capitec-icon {
					--theme-icon-size-medium: 24px;
				}

				capitec-label {
					--theme-label-font-color: #3a3a3a;
					--theme-label-title-font-size: 18px;
					--theme-label-font-weight: 600;
					margin-left: 16px;
				}

				.main-title {
					--horizon-label-text-font-size: 24px;
					--horizon-label-text-line-height: 26px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-text-color: #ffffff;
					--horizon-label-value-line-height: 47px;
    				--horizon-label-value-color: #ffffff;
					padding: 6px 33px 6px 7px;
				}

				.title-style {
					margin-left: 8px;
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--horizon-label-text-line-height: 32px;
					--horizon-label-text-line-width: 168px;
					--horizon-label-value-line-height: 47px;
				}

				.col-1 {
					width: 192px;
					height: 50px;
					--horizon-label-text-font-weight: 0;
				}

				/* Footer */
				div[slot="footer"] {
					width: 572px;
					border-top: 1px solid #E1E1E1;
					padding: 7px 16px 8px 0px;
				}

				capitec-button {
					height: 48px;
					width: 87px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}

				.alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-width: 1032px;
					--theme-alert-banner-font-weight: 600;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-layout-gap-spacing: 8px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-icon-margin-right: 12px;
					--theme-alert-banner-icon-margin-left: 16px;
				}

				.alert-banner-paragraph {
					display: inline-block;
					font-weight: 400;
					color: #3A3A3A;
				}

				capitec-alert-banner-label {
					color: #3A3A3A;
				}

				.toggle-group {
					width: 192px;
					height: 42px;
                    padding: 24px 8px 10px 44px;
                }

				.toggle-group {
                    --theme-label-font-color: #3A3A3A;
                    --theme-label-font-size: 16px;
                    --theme-label-font-weight: 600;
                    --theme-toggle-label-spacing: 2px;
                    --theme-toggle-track-inset: 1px;
					padding-left: 15px;
                }

				.toggle-label {
					margin-left: 0px;
				}

				.left-arrow {
					padding: 4px 0px 20px 0px;
				}

				.card {
					height: 888px;
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
				<capitec-title-bar type="primary">
					<img
					src="/images/insure/left-arrow.svg"
					@click="${() => this._back()}"
					data-automation-id="live-better-account-details-left-arrow"
					class="left-arrow"/>
					<horizon-label
						class="main-title"
						label="Account Details"
						value="1633824509">
					</horizon-label>
				</capitec-title-bar>

				<capitec-content-box>
				<capitec-alert-banner 
					type="info" 
					class="alert-banner"
					label="Notify Client:">
						<p class="alert-banner-paragraph">
							You can only fund this account with Benefits Partner cash backs and Capitec cash backs
						</p>
				</capitec-alert-banner>
					${this._renderAccountDetails()}
					${this._renderAutomaticSavings()}
				</capitec-content-box>

			</capitec-card>
		`;
	}

	_renderAccountDetails(){
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-image src="/images/liveBetter/AccountDetails.svg"></capitec-image>
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
							class="col-1" 
							label="Account number" 
							value="1633824509">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-available-balance"
							class="col-1" 
							label="Available balance" 
							value="R150.00">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-rate"
							class="col-1" 
							label="Interest rate" 
							value="3.25%">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-june"
							class="col-1" 
							label="Interest earned in June" 
							value="R12.50">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-may"
							class="col-1" 
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
							class="col-1" 
							label="Interest tax year" 
							value="R340.00">
						</horizon-label>	
						<horizon-label 
							data-automation-id="live-better-account-details-date-opened"
							class="col-1" 
							label="Date opened" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
						class="col-1"
							data-automation-id="live-better-account-details-status"
							label="Status" 
							value="Active">
						</horizon-label>			
				</capitec-group>				
		</capitec-content-box>
		`;
	}

	_renderAutomaticSavings(){
		return html`
		<capitec-content-box
			class="details-vertical" 
			layout="vertical" 
			gap="clear" 
			halign="left" 
			valign="top">
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
			<capitec-image src="/images/liveBetter/AutomaticSavings.svg"></capitec-image>
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
							class="col-1" 
							label="Last update" 
							value="12 May 2021">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-round-up-accounts"
							class="col-1" 
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
							class="col-1" 
							label="Last update" 
							value="12 May 2021">
						</horizon-label>			
				</capitec-group>				
		</capitec-content-box>
		`;
	}
 }

 customElements.define(`horizon-live-better-account-details`, AccountDetails);
