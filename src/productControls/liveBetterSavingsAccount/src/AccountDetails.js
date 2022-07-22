import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import 'app/components/common/HorizonLabel';

const ACCOUNT_TYPE = {
	300: `Savings Account`,
	200: `Savings Plan`,
	201: `FixedTerm Plan`,
	100: `Credit Card`,
	210: `Live Better Savings Account`
};

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

		this.accountDetails = null;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.dispatchEvent(new CustomEvent(`unloading`));
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

	_toggleRoundUp(event) {
		this.dispatchEvent(new CustomEvent(`round-up`, {
			detail: {
				roundUpStatus: event.detail.new
			}
		}));
	}

	_toggleInterestSweep(event) {
		this.dispatchEvent(new CustomEvent(`interest-sweep`, {
			detail: {
				interestSweepStatus: event.detail.new
			}
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
		if (!date) {
			return `-`;
		}

		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${this.getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	// Get month name using month as a number (0 = Jan, 1 = Feb,... )
	getMonthName(month) {
		const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
		return monthNames.slice(month)[0];
	}

	// Get all the account names for which round-up is active
	_getActivatedRoundUpAccounts(activatedRoundUpAccounts) {
		const accountsList = activatedRoundUpAccounts.map(account => ACCOUNT_TYPE[account.accountType]);
		return accountsList.join(`, `);
	}

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
					--theme-type-primary-background: url(../images/liveBetter/lbb-bg-1092x80.png);
				}
				
				.left-arrow {
					padding-bottom: 26px;
					cursor: pointer;
				}

				.alert-banner {
					--theme-alert-banner-width: 1032px;
					--theme-alert-banner-font-weight: 600;
					--theme-alert-banner-info-background-color: #DAF2F4;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-toast-icon-margin: 0px 12px 0px 16px;
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
				.accounts-list {
					width: auto;
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
						src="/images/liveBetter/left-arrow.svg"
						@click="${() => this._back()}"
						class="left-arrow"/>
						<horizon-label
							class="main-title"
							label="Account Details"
							value="${this.accountDetails.accountNumber}">
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
			<horizon-alert-banner 
				type="info" 
				class="alert-banner"
				header="Notify Client: "
				label="You can only fund this account with Benefits Partner cash backs and Capitec cash backs">
			</horizon-alert-banner>
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
					<capitec-image src="/images/liveBetter/account-details.svg"></capitec-image>
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
							value="${this.accountDetails.accountNumber}">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-available-balance" 
							label="Available balance" 
							value="${formatCurrency(this.accountDetails.accountAvailableBalance)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-rate"
							class="col-3"
							label="Interest rate" 
							value="${this.accountDetails.interestRatePercentage}%">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-june"
							label="Interest earned in ${this.getMonthName(new Date().getMonth())}" 
							value="${formatCurrency(this.accountDetails.interestCurrentMonth)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-interest-in-may"
							label="Interest earned in ${this.getMonthName(new Date().getMonth() - 1)}" 
							value="${formatCurrency(this.accountDetails.interestReceivedLastMonth)}">
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
							value="${formatCurrency(this.accountDetails.interestForTheTaxYear)}">
						</horizon-label>
						<horizon-label 
							data-automation-id="live-better-account-details-date-opened"
							label="Date opened" 
							value="${this._formatDate(this.accountDetails.dateOpened)}">
						</horizon-label>
						<horizon-label 
							class="col-3"
							data-automation-id="live-better-account-details-status"
							label="Status" 
							value="${this.accountDetails.accountStatus}">
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
					<capitec-image src="/images/liveBetter/automatic-savings.svg"></capitec-image>
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
						<capitec-group 
							class="toggle-group" 
							layout="vertical" 
							gap="none" 
							halign="left" 
							valign="center">
								<capitec-label 
									label="Round-up" 
									class="toggle-label">
								</capitec-label>
								<capitec-toggle 
									label="${formatCurrency(this.accountDetails.roundupValue)}" 
									?checked="${this.accountDetails.accountRoundUpActive}"
									@value-change="${(event) => this._toggleRoundUp(event)}">
								</capitec-toggle>
						</capitec-group>
						<horizon-label 
							data-automation-id="live-better-account-details-last-update-round-up"
							label="Last update" 
							value="${this._formatDate(this.accountDetails.roundupActivationDate)}">
						</horizon-label>
						<horizon-label 
							class="accounts-list"
							data-automation-id="live-better-account-details-round-up-accounts"
							label="Round-up account(s)" 
							value="${this._getActivatedRoundUpAccounts(this.accountDetails.activatedRoundUpAccounts)}">
						</horizon-label>
				</capitec-group>

				<capitec-group
					class="details-horizontal"
					layout="horizontal"
					gap="none" 
					halign="left" 
					valign="center">
						<capitec-group 
							class="toggle-group" 
							layout="vertical" 
							gap="none" 
							halign="left" 
							valign="center">
								<capitec-label 
									label="Interest Sweep" 
									class="toggle-label">
								</capitec-label>
								<capitec-toggle 
									label="${this.accountDetails.accountInterestSweepActive ? `On` : `Off`}"
									?checked="${this.accountDetails.accountInterestSweepActive}"
									@value-change="${(event) => this._toggleInterestSweep(event)}">
								</capitec-toggle>
						</capitec-group>
						<horizon-label 
							data-automation-id="live-better-account-details-last-update-interest-sweep"
							label="Last update" 
							value="${this._formatDate(this.accountDetails.interestSweepActivationDate)}">
						</horizon-label>
				</capitec-group>
		</capitec-content-box>
		`;
	}
 }

 customElements.define(`capitec-pc-live-better-account-details`, AccountDetails);

 /**
 * When left arrow on the title bar is clicked to go back
 *
 * @example
 * <capitec-pc-live-better-account-details ... @back="${this._handler}"></capitec-pc-live-better-account-details>
 *
 * @event AccountDetails#back
 * @type {Object} - N/A
 */