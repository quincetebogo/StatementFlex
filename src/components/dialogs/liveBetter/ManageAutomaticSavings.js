import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/common/RadioButtonGroup';

const ROUNDUP_VALUES = [2, 5, 10];

/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServices
 * @extends {Component}
 */
export class ManageAutomaticSavings extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -----------
	// PROPERTIES
	// -----------
	static get properties() {
		return {
			accountDetails: { type: Object },
			isRoundUpActive: { state: true },
			isInterestSweepActive: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.isRoundUpActive = this.accountDetails.accountRoundUpActive;
		this.isInterestSweepActive = this.accountDetails.accountInterestSweepActive;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_update() {
		this.accountDetails.accountRoundUpActive = this.isRoundUpActive;
		this.accountDetails.accountInterestSweepActive = this.isInterestSweepActive;

		this.dispatchEvent(new CustomEvent(`update`, { detail: { updatedRoundupDetails: this.accountDetails } }));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_selectRoundUpAmount(e, value) {
		if (e.detail.new) {
			this.accountDetails.roundupValue = value; 
		}
	}

	_selectedRoundUpAccounts(e, account) {
		if (e.detail.new) {
			this.accountDetails.activatedRoundUpAccounts.push(account);
			return;
		}
		this.accountDetails.activatedRoundUpAccounts.splice(this.accountDetails.activatedRoundUpAccounts.indexOf(account), 1);
	}

	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					width:872px;
					height:850px;
					--theme-modal-free-max-width: 873px;
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
					width: 874px;
					height: 64px;
					border-radius: 4px 4px 0px 0px;
					position: absolute;
					left: -852px;
					top: -44px;
					background: url(/images/liveBetter/LBB_bg_64px.png);
					--theme-label-title-font-size: 18px;
					--theme-titlebar-padding: 20px 16px;
					--theme-titlebar-item-gap: 0px;
				}

				.header-gradient > capitec-label {
					padding-left: 12px;
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #ffffff;
				}
				capitec-alert-banner[type="info"] {
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 12px;
				}
				capitec-label[type="title"] {
					--theme-label-title-font-size: 16px;
					--theme-label-title-font-weight: 600;
					padding-left: 7px;
				}
				.main-container {
					height: 754px;
					width: auto;
					border-bottom: 1px solid #E1E1E1;
				}
				.alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-width: 840px;
					--theme-alert-banner-font-weight: 600;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-layout-gap-spacing: 20px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-icon-margin-right: 12px;
				}
				.alert-banner > p {
					display: inline-block;
					font-weight: 400;
					color: #3A3A3A;
				}
				capitec-title-bar {
					--theme-titlebar-padding: 12px 16px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				.header-off {
					background-color: #F7F7F7;
				}
				.round-up-amount {
					padding: 0px 16px 16px 16px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-radio {
					margin-top: 16px;
				}
				.account-check-box {
					height: 24px;
					margin: 16px 16px 0px 16px;
				}
				#id-toggle-label {
					--theme-layout-gap-spacing: 8px;
					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 15px;
					--theme-label-font-color: #3A3A3A;
				}
				#id-interest-sweep{
					--theme-card-min-width: 840px;
    				--theme-card-min-height: 48px;
					--theme-layout-gap-spacing: 0px;
				}
				#id-round-up{
					--theme-card-min-width: 840px;
    				--theme-card-min-height: 48px;
					--theme-layout-gap-spacing: 0px;
					margin-bottom: 16px;
					height: auto;
				}
				.group-accounts {
					margin-bottom: 23px;
				}
				.hide-group {
					display: none;
				}
				.show-group {
					display: block;
				}
				.other-options {
					height: 32px;
					--theme-titlebar-min-height: 32px;
					--theme-layout-gap-spacing: 0px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;
					border-top: 1px solid rgb(225, 225, 225);
					border-bottom: 1px solid rgb(225, 225, 225);
					}
				.card-header {
					height: 48px;
					padding: 15px;
				}
				div[slot="footer"] {
					width: auto;
					padding: 7px 16px 8px 0px;
				}
				capitec-button {
					height: 48px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
				#button-update {
					width: 101px;
				}
				#button-cancel {
					width: 96px;
				}
				
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<capitec-title-bar data-automation-id="manage-automatic-savings-image" type="primary" class="header-gradient">
						<capitec-image src="src/productControls/liveBetterSavingsAccount/images/Automatic-savings-white.svg"></capitec-image>
						<capitec-label label="Manage Automatic Savings"></capitec-label>
					</capitec-title-bar>
				</div>
				<div slot="body">
					<capitec-content-box class="main-container">
						
						${this._renderAlertBanner()}
						
						<capitec-card id="id-round-up">
							${this._renderRoundUpSaveToggle()}
							${this._renderSetRoundUpAmount()}
							${this._renderActiveRoundUpAccounts()}
						</capitec-card>
						
						<capitec-card id="id-interest-sweep">
							${this._renderInterestSweep()}
						</capitec-card>
					
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		return html`
			<capitec-alert-banner data-automation-id="manage-automatic-savings-alert-banner" class="alert-banner" type="info">
				<strong>Notify client:</strong>
				<p class="alert-banner-paragraph">Your Round-up and Interest Sweep values will always be transferred from your main savings account</p>
			</capitec-alert-banner>
		`;
	}

	_renderRoundUpSaveToggle() {
		return html`
		<capitec-group class="card-header ${this.isRoundUpActive ? `` : `header-off`}" gap="clear" halign="left" valign="center" layout="horizontal">
			<img src='/images/liveBetter/round-up.svg'/>
			<capitec-label type="title" label="Round-up. Save a little every time you spend"></capitec-label>
			<capitec-spacer></capitec-spacer>
					<capitec-label
						id="id-toggle-label"
						label="${this.isRoundUpActive ? `On` : `Off`}"
						type="default">
					</capitec-label>
				<capitec-toggle 
					data-automation-id="manage-automatic-savings-toggle" 
					id="id-toggle" 
					?checked="${this.isRoundUpActive}"
					@value-change="${() => this.isRoundUpActive = !this.isRoundUpActive}">
				</capitec-toggle>
			</capitec-group>
		`;
	}

	_renderSetRoundUpAmount() {
		return html`
			<capitec-group 
				layout="vertical"
				halign="left" 
				valign="center" 
				gap="clear"
				class="${this.isRoundUpActive ? `show-group` : `hide-group`}">
					<capitec-title-bar
						type="default"
						label="Set Round-up amount"
						class="other-options">
					</capitec-title-bar>

					<capitec-radio-group 
						data-automation-id="manage-automatic-savings-radio-amount" 
						class="round-up-amount">
							${ROUNDUP_VALUES.map(value => html`
								<capitec-radio 
									label="${formatCurrency(value)}" 
									?checked="${this.accountDetails.roundupValue === value}"
									@value-change="${(e) => this._selectRoundUpAmount(e, value)}">
								</capitec-radio>
							`)}
					</capitec-radio-group>
			</capitec-group>
		`;
	}

	_renderActiveRoundUpAccounts() {
		return html`
			<capitec-group 
				layout="vertical" 
				gap="none" 
				halign="left" 
				valign="center"
				class="${this.isRoundUpActive ? `show-group` : `hide-group`} group-accounts">
					<capitec-title-bar
						type="default"
						label="Active round-up accounts"
						class="other-options">
					</capitec-title-bar>
						${this.accountDetails.roundUpAccounts.map(account => html`
							<capitec-check 
								class="account-check-box"
								label="${account.accountName}"
								?checked="${this.accountDetails.activatedRoundUpAccounts.find(activeAccount => activeAccount.accountNumber === account.accountNumber)}"
								@value-change="${(e) => this._selectedRoundUpAccounts(e, account)}">
							</capitec-check>
						`)}
			</capitec-group>
		`;
	}

	_renderInterestSweep() {
		return html`
		<capitec-group class="card-header ${this.isInterestSweepActive ? `` : `header-off`}" gap="clear" halign="left" valign="center" layout="horizontal">
			<img src='/images/liveBetter/interest-sweep.svg'/>
			<capitec-label type="title" label="Intrest Sweep. SuperCharge your interest"></capitec-label>
			<capitec-spacer></capitec-spacer>
					<capitec-label
						id="id-toggle-label"
						label="${this.isInterestSweepActive ? `On` : `Off`}"
						type="default">
					</capitec-label>
					<capitec-toggle 
						data-automation-id="manage-automatic-savings-toggle" 
						id="id-toggle"
						?checked="${this.isInterestSweepActive}"
						@value-change="${() => this.isInterestSweepActive = !this.isInterestSweepActive}">
				</capitec-toggle>
		</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">

				<capitec-button
					id="button-cancel"
					data-automation-id="manage-automatic-savings-cancel"
					label="Cancel"
					@click="${() => this._cancel()}">
				</capitec-button>

				<capitec-button
					id="button-update"
					data-automation-id="manage-automatic-savings-update"
					type="primary" 
					label="Update"
					@click="${() => this._update()}">
				</capitec-button>

			</capitec-group>
		`;
	}

}

window.customElements.define(`horizon-manage-automatic-savings`, ManageAutomaticSavings);