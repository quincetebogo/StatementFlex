import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/common/RadioButtonGroup';

const ROUNDUP_VALUES = [2, 5, 10];
const ERROR_MESSAGES = {
	ALERT_BANNER: `You must choose a Round-up amount and account.`,
	ALERT_ROUNDUP_VALUE: `You must choose a Round-up amount.`,
	ALERT_ROUNDUP_ACC: `You must choose a Round-up account.`,
	ROUNDUP_ON: `You must choose an option to switch Round-up on.`
};

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

		this.isRoundUpActive = false;
		this.isInterestSweepActive = false;
		this.roundUpValue = ``;
		this.roundUpAccounts = [];
		this.errorMessage = ``;
	}

	// -----------
	// PROPERTIES
	// -----------
	static get properties() {
		return {
			automaticSavingsDetails: { type: Object },

			isRoundUpActive: { state: true },
			isInterestSweepActive: { state: true },
			roundUpValue: { state: true },
			errorMessage: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.isRoundUpActive = this.automaticSavingsDetails.accountRoundUpActive;
		this.isInterestSweepActive = this.automaticSavingsDetails.accountInterestSweepActive;
		this.roundUpValue = this.automaticSavingsDetails.roundupValue;
		this.roundUpAccounts = [...this.automaticSavingsDetails.activatedRoundUpAccountNums];
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
		if (!this._isValid()) {
			return false;
		}

		this.dispatchEvent(new CustomEvent(`update`, { 
			detail: {
				updatedDetails: this.updatedDetails
			}
		}));
	}

	_toggleRoundUpActive() {
		this.isRoundUpActive = !this.isRoundUpActive;
		this.errorMessage = ``;

		this.dispatchEvent(new CustomEvent(`round-up`, {}));
	}

	_toggleInterestSweep() {
		this.isInterestSweepActive = !this.isInterestSweepActive;
		
		this.dispatchEvent(new CustomEvent(`interest-sweep`, {}));
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	_selectRoundUpAmount(e, value) {
		if (e.detail.new) {
			this.roundUpValue = value; 
			this.errorMessage = ``;
		}
	}

	_selectedRoundUpAccounts(e, account) {
		if (e.detail.new) {
			this.roundUpAccounts.push(account.accountNumber);
			this.automaticSavingsDetails.activatedRoundUpAccounts.push(account);
		} else {
			const index = this.roundUpAccounts.findIndex(item => item === account.accountNumber);
			const parIndex = this.automaticSavingsDetails.activatedRoundUpAccounts.findIndex(item => item.accountNumber === account.accountNumber);
			
			this.roundUpAccounts.splice(index, 1);
			this.automaticSavingsDetails.activatedRoundUpAccounts.splice(parIndex, 1);
		}
		this.errorMessage = ``;
		this.requestUpdate();
	}

	_isUpdated() {
		this.updatedDetails = {};


		if (this.automaticSavingsDetails.actualRoundUpStatus !== this.isRoundUpActive) {
			this.updatedDetails.accountRoundUpActive = this.isRoundUpActive;
		}

		if (this.automaticSavingsDetails.actualInterestSweepStatus !== this.isInterestSweepActive) {
			this.updatedDetails.accountInterestSweepActive = this.isInterestSweepActive;
		}

		if (this.automaticSavingsDetails.roundupValue !== this.roundUpValue) {
			this.updatedDetails.roundUpValue = this.roundUpValue;
		}

		if (this.roundUpAccounts.length !== this.automaticSavingsDetails.activatedRoundUpAccountNums.length ||
			!this.roundUpAccounts.every(item => this.automaticSavingsDetails.activatedRoundUpAccountNums.includes(item))) {
				this.updatedDetails.activatedRoundUpAccountNums = this.roundUpAccounts;
				this.updatedDetails.activatedRoundUpAccounts = this.automaticSavingsDetails.activatedRoundUpAccounts;
		}
		return Object.keys(this.updatedDetails).length > 0;
		}

	_isValid() {
		if (!this.isRoundUpActive) {
			return true;
		}

		if (!this.roundUpValue && !this.roundUpAccounts.length) {
			this.errorMessage = ERROR_MESSAGES.ALERT_BANNER;
			return false;
		}
		if (!this.roundUpValue) {
			this.errorMessage = ERROR_MESSAGES.ALERT_ROUNDUP_VALUE;
		}
		if (!this.roundUpAccounts.length) {
			this.errorMessage = ERROR_MESSAGES.ALERT_ROUNDUP_ACC;
		}

		return !this.errorMessage;
	}
	
	_formatAccountName(accountName) {
		const name = accountName.toLowerCase();
		return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
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
					background: url(/images/liveBetter/lbb-bg-64px.png);
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
				horizon-alert-banner {
					width: 100%;

					--theme-alert-banner-width: 840px;
					--theme-alert-banner-font-weight: 600;
					--theme-layout-gap-spacing: 20px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-toast-icon-margin: 0px 12px 0px 16px;
				}
				horizon-alert-banner[type="info"] {
					--theme-alert-banner-info-background-color: #DAF2F4;
				}
				horizon-alert-banner[type="error"] {
					--theme-alert-banner-info-background-color: rgba(165,19,42,0.15);
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
				.section-alert-banner {
					--theme-alert-banner-height: 40px;
					--theme-layout-gap-spacing: 0px;
				}
				horizon-alert-banner > p {
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
						<capitec-image src="/images/liveBetter/automatic-savings-white.svg"></capitec-image>
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
		return !this.errorMessage
			? html`
				<horizon-alert-banner
					data-automation-id="manage-automatic-savings-info-banner"
					type="info"
					header="Notify client: "
					label="Your Round-up and Interest Sweep values will always be transferred from your main savings account">
				</horizon-alert-banner>`
			: html`
				<horizon-alert-banner
					data-automation-id="manage-automatic-savings-error-banner"
					type="error"
					header="Notify client: "
					label="${this.errorMessage}">
				</horizon-alert-banner>`;
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
					@value-change="${() => this._toggleRoundUpActive()}">
				</capitec-toggle>
			</capitec-group>
		`;
	}

	_renderSetRoundUpAmount() {
		return this.isRoundUpActive
			? html`
				<capitec-group
					layout="vertical"
					halign="left" 
					valign="center" 
					gap="clear">
						<capitec-title-bar
							type="default"
							label="Set Round-up amount"
							class="other-options">
						</capitec-title-bar>

						${!this.roundUpValue && this.errorMessage
							? html`
								<horizon-alert-banner
									data-automation-id="manage-automatic-savings-error-banner"
									class="section-alert-banner"
									type="error"
									header="Notify client: "
									label="${ERROR_MESSAGES.ALERT_ROUNDUP_VALUE}">
								</horizon-alert-banner>`
							: html``}

						<capitec-radio-group 
							data-automation-id="manage-automatic-savings-radio-amount" 
							class="round-up-amount">
								${ROUNDUP_VALUES.map(value => html`
									<capitec-radio 
										label="${formatCurrency(value)}" 
										?checked="${this.automaticSavingsDetails.roundupValue === value}"
										@value-change="${(e) => this._selectRoundUpAmount(e, value)}">
									</capitec-radio>
								`)}
						</capitec-radio-group>
				</capitec-group>`
			: html``;
	}

	_renderActiveRoundUpAccounts() {
		return this.isRoundUpActive
			? html`
				<capitec-group 
					layout="vertical" 
					gap="none" 
					halign="left" 
					valign="center"
					class="group-accounts">
						<capitec-title-bar
							type="default"
							label="Activate Round-up on these accounts"
							class="other-options">
						</capitec-title-bar>
						${!this.roundUpAccounts.length && this.errorMessage
							? html`
								<horizon-alert-banner
									data-automation-id="manage-automatic-savings-error-banner"
									class="section-alert-banner"
									type="error"
									header="Notify client: "
									label="${ERROR_MESSAGES.ALERT_ROUNDUP_ACC}">
								</horizon-alert-banner>`
							: html``}

						${this.automaticSavingsDetails.roundUpAccounts.map(account => html`
							<capitec-check 
								class="account-check-box"
								label="${this._formatAccountName(account.accountName)}"
								?checked="${this.automaticSavingsDetails.activatedRoundUpAccounts.find(activeAccount => activeAccount.accountNumber === account.accountNumber)}"
								@value-change="${(e) => this._selectedRoundUpAccounts(e, account)}">
							</capitec-check>
						`)}
				</capitec-group>`
			: html``;
	}

	_renderInterestSweep() {
		return html`
		<capitec-group class="card-header ${this.isInterestSweepActive ? `` : `header-off`}" gap="clear" halign="left" valign="center" layout="horizontal">
			<img src='/images/liveBetter/interest-sweep.svg'/>
			<capitec-label type="title" label="Interest Sweep. Supercharge your interest"></capitec-label>
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
						@value-change="${() => this._toggleInterestSweep()}">
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
					?disabled="${!this._isUpdated()}"
					@click="${() => this._update()}">
				</capitec-button>

			</capitec-group>
		`;
	}

}

window.customElements.define(`horizon-manage-automatic-savings`, ManageAutomaticSavings);