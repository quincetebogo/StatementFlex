import { Component, css, html } from 'platform/elements';
import { Logger, NavigationContext } from 'platform/core';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { CreditService } from 'app/services/CreditService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { PRODUCTS } from 'app/constants/Credit';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonPDFViewer';
import 'app/components/common/OptionButton';
import 'app/components/common/StepperModal';
import 'app/dialogs/credit/PaidUpLetter';
import 'app/components/common/HorizonProductTile'; 

/**
 * This component implements the Paid Up Accounts Page for favourite landing page
 *
 * 
 * @export
 * @class PaidUpAccounts
 * @extends {Component}
 * 
 */

const CREDIT_TYPES = [`All`, `Term Loan`, `Credit`, `Access Facility`];

export class PaidUpAccounts extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.callerInformation = {};

		this.accountsInfo = [];
		this.selectedAccounts = [];
		this.filteredData = [];
		this.isBusy = false;
		this.selectedLabel = `Select all`;
		this.showPaidUpLetter = false;

		this.searchText = ``;
		this.searchCreditType = ``;

		this.logger = Logger.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.creditService = new CreditService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @param {object} accountsInfo List of Paid Up Letters accounts
	 * 
	 * @readonly
	 * @static
	 * @memberof PaidUpAccounts
	 */

	 static get properties() {
		return {
			accountsInfo: { type: Array },

			isBusy: { state: true },
			filteredData: { state: true },
			selectedLabel: { state: true },
			showPaidUpLetter: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.callerInformation = this.horizonStore.getCallerInformation();
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		if (this.accountsInfo.length > 0) {
			this.accountsInfo = this.accountsInfo.map(item => {
				item.selected = false;
				return item;
			});

			this.filteredData = this.accountsInfo;
		}
	}

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	
		this._telemetry.endSpan(CreditEvents.CREDIT_PAID_UP_LETTER, {});
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _showPaidUpLetter () {

		this.selectedAccounts = this.accountsInfo.filter(item => item.selected);
		const accountNumbers = this.selectedAccounts.map(item => item.accountNumber);
	
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_SEND, {
			"list-of-accounts": this.selectedAccounts,
			"account-numbers": accountNumbers
		});

		const returnValue = await this.creditService.getPaidUpLetter(this.callerInformation.cifNumber, accountNumbers);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve client paid up letter from credit service.`, `_initialise`, returnValue.correlationId);
			return;
		}

		this.encodedPDFs = returnValue.result.document.data;
		
		this._telemetry.startSpan(CreditEvents.CREDIT_PAID_UP_LETTER_POP_UP, {});
		
		this.showPaidUpLetter = !this.showPaidUpLetter;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler() {
		this.horizonRouter.navigateToSystemError();
	}

	_searchText(event) {
		if (event.detail.action === `clear`) {
			this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_TEXT_FILTER_CLEAR, {});
		}

		this.searchText = event.detail.new;
		this._search();
	}

	_filter(event) {
		this.searchCreditType = event.detail.new;
		this._search();
		this._focusOutFilter();
	}

	_focusOutFilter() {
		if (this.searchText || this.searchCreditType) {
			this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_FILTER_SELECTION, {
				"search-by-text": this.searchText,
				"credit-type": this.searchCreditType
			});
		}
	}

	_search() {
		this.filteredData = this.accountsInfo;
	
		if (this.searchCreditType !== `Account type` && this.searchCreditType !== `All`) {
			this.filteredData = this.filteredData.filter(item => item.type.toLowerCase().indexOf(this.searchCreditType.toLowerCase()) !== -1);
		}

		if (this.searchText) {
			const searchText = this.searchText.split(` `);
			const searchResult = searchText.map(key => {
				if (key !== ``) {
						return this.filteredData.filter(item => item.productTypeDescription.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
														item.accountNumber.startsWith(key) ||
														parseFloat(this._deformatCurrency(item.creditLimit)).toFixed(2).startsWith(key));
				}
				return [];
			});
			
			this.filteredData = Array.from(new Set([...searchResult.flat()]));
		}
	}

	_checkBox(e, accountDetails) {
		accountDetails.selected = e.detail.new;

		const accountsSelected = this._numberOfAccountsSelected();

		if (accountsSelected === 0) {
			this.selectedLabel = `Select all`;
		} else if (accountsSelected === 1) {
			this.selectedLabel = `1 account selected`;
		} else {
			this.selectedLabel = `${accountsSelected} accounts selected`;
		}
	}

	_selectAll() {
		if (this.filteredData.every(item => item.selected)) {
			this._deselect();
		} else {
			this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_SELECT_ALL, {});

			this.filteredData.forEach(item => item.selected = true);
			this.selectedLabel = `${this._numberOfAccountsSelected()} accounts selected`;
		}
	}

	_deselect() {
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_DESELECT_ALL, {});

		this.selectedLabel = `Select all`;
		this.filteredData.forEach(item => item.selected = false);
	}

	_backToLandingPage() {
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_POP_UP_CANCEL, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER,
			"next-screen": TelemetryScreen.PAID_UP_LETTER_ACCOUNTS 
		});

		this.showPaidUpLetter = !this.showPaidUpLetter;
	}

	async _sendPaidUpLetter(event) {

		const creditProducts = {
			[PRODUCTS.CREDIT_CARD]: `CreditCard`,
			[PRODUCTS.ACCESS_FACILITY]: `AccessFacility`,
			[PRODUCTS.TERM_LOAN]: `TermLoan`
		 };

		 this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_POP_UP_SEND, {
			"screen": TelemetryScreen.CREDIT_PAID_UP_LETTER,
			"email address": event.detail.emailAddress,
			"next-screen": TelemetryScreen.PAID_UP_LETTER_ACCOUNTS 
		});

		const nonNullSelectedAccounts = this.selectedAccounts.filter(item => !isNullorEmpty(item));
		const selectedAccountNumbers = nonNullSelectedAccounts.map((item) => item.accountNumber);

		const returnValue = await this.creditService.emailPaidUpLetter(this.callerInformation.cifNumber, selectedAccountNumbers, event.detail.emailAddress, () => true);

		let sendStatusList;

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.selectedAccounts = nonNullSelectedAccounts;
		screenDetails.emailAddress = event.detail.emailAddress;

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to send paid up letter.`, `_sendPaidUpLetter`, returnValue.correlationId);

			sendStatusList = selectedAccountNumbers.map((accountNumber) => {

				const itemDetails = nonNullSelectedAccounts.find(selectedAccount => selectedAccount.accountNumber === accountNumber);
	
				const sendStatus = {
					accountNumber: accountNumber,
					creditType: creditProducts[itemDetails.type],
					productTypeDescription: itemDetails.productTypeDescription,
					sentStatus: false
				};
	
				return sendStatus;
			});

			screenDetails.emailStatus = sendStatusList;
			this.horizonStore.setScreenDetails(screenDetails);
			this.horizonRouter.navigatePaidUpLetterFailure();
			return;
		}

		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `paid-up-accounts`);

		sendStatusList = returnValue.result.sendStatusList.accountNumbers;
		sendStatusList = sendStatusList.map((accountNumber) => {

			const itemDetails = nonNullSelectedAccounts.find(selectedAccount => selectedAccount.accountNumber === accountNumber);

			const sendStatus = {
				accountNumber: accountNumber,
				creditType: creditProducts[itemDetails.type],
				productTypeDescription: itemDetails.productTypeDescription,
				sentStatus: true
			};

			return sendStatus;
		});
		
		screenDetails.emailStatus = sendStatusList;
		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonRouter.navigatePaidUpLetterSuccess();
	}

	// Removing currency formating for better search results
	_deformatCurrency(value) {
		const amount = value.split(`R`)[1].replaceAll(` `, ``);
		return amount;
	}
	
	_numberOfAccountsSelected() {
		return this.accountsInfo.filter(item => item.selected).length;
	}
	
	_isAnyAccountSelected() {
		return this.accountsInfo.filter(item => item.selected).length > 0;
	}

	_viewPDF(event) {
		this._telemetry.logEvent(CreditEvents.CREDIT_PAID_UP_LETTER_POP_UP_VIEW_DOCUMENT, {
			"cifNumber": this.callerInformation.cifNumber,
			"accountNumber": event.detail.accountNumber,
			"accountType": event.detail.type
		});
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${ALERTBANNER_CSS}
				capitec-card {
					width:100%;
					height:var(--horizon-panel-height);
				}

				/* Title bar styles */
				capitec-title-bar {
					width: 1062px;
					--theme-titlebar-padding: 0px;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-title-bar > capitec-icon {
					margin: 0px 16px 0px 23px;
				}

				/* Action and search bar styles */
				capitec-action-bar {
					--theme-actionbar-padding: 8px 16px;
					--theme-actionbar-item-gap: 0px;
					--theme-actionbar-border: 1px solid rgb(225, 225, 225);
					--theme-actionbar-shadow: 0px;
				}
				capitec-search-field {
					width: 337px;
					margin-right: 16px;
					--theme-input-label-font-size: 15px;
					--theme-input-label-font-color: #959595;
				}
				capitec-select {
					width: 194px;
					--theme-input-label-font-size: 16px;
				}

				/* Main content */
				.main-content-box{
					height:689px;
				}
				.choose-account{
					--theme-label-subtitle-font-size: 20px;
					--theme-label-subtitle-font-weight: 600;
					margin-bottom: 16px;
				}
				horizon-label{
					width: 182px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				.vertical-line{
					height: 50px;
					width: 1px;
					background-color: #E1E1E1;
					margin-right: 16px;
				}
				.accounts{
					height: 64px;
					padding: 0px 0px 0px 16px;
					border: 1px solid #E1E1E1;
					padding-left: 16px;
					border-radius: 4px;
				}

				/* Button bar styles */
				capitec-button-bar {
					--theme-buttonbar-padding: 6px 16px 6px 24px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-button-bar > capitec-check {
					line-height: 48px;
					margin-right: 16px;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
				}
				capitec-hyperlink {
					line-height: 48px;
					--theme-font-weight: 600;
					--theme-hyperlink-color: #009DE0;
				}

				/* No accounts found for paid up letter styles */
				.no-result-group {
					width: 100%;
					height: 80%;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
			${this._renderPaidUpLetter()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="center-section" >
				<capitec-title-bar>
					<capitec-icon 
						size="small"
						icon="system/arrow-left-action"
						@click="${() => this._back()}">
					</capitec-icon>

					<capitec-label label="Paid Up Letter" type="title"></capitec-label>
				</capitec-title-bar>

				${this._renderPaidUpAccounts()}
				${this._renderFooter()}
				
			</capitec-card>`;
	}

	_renderPaidUpAccounts() {
		return html`
			<capitec-group layout="vertical" halign="left" valign="top" gap="2">
				<capitec-action-bar
					?hidden="${this.accountsInfo.length === 0}">
					<capitec-search-field
						label="Search loan, amount or account number"
						@key-input="${(e) => this._searchText(e)}"
						@focusout="${(e) => this._focusOutFilter()}">
					</capitec-search-field>

					<capitec-select 
						label="Account type" 
						.items="${CREDIT_TYPES}" 
						display-field="text"
						filter-id="select"
						@value-change = "${(e) => this._filter(e)}">
					</capitec-select>
				</capitec-action-bar>

				${this._renderAccountInfoTile()}
				
			</capitec-group>`;
	}

	_renderAccountInfoTile () {
		return this.filteredData.length > 0
		? html`
			<capitec-content-box class="main-content-box" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="choose-account"
						type="subtitle" 
						label="Choose an account">
				</capitec-label>

				${this.filteredData.map(item => html` 
					<capitec-group class="accounts" layout="horizontal" gap="clear" valign="center">
						<capitec-check 
							data="${item}"
							@value-changed=${(e) => this._checkBox(e, item)}
							?checked="${item.selected}">
						</capitec-check>
						<horizon-label
								label="${item.productTypeDescription}"
								value="${item.accountNumber}">
						</horizon-label>

						<div class="vertical-line"></div>

						<horizon-label
							label="Credit taken up"
							value="${item.creditLimit}">
						</horizon-label>
						<horizon-label
							label="Installment"
							value="${item.repayAmount ?? item.nextRepayment}">
						</horizon-label>
					</capitec-group>`)}

			</capitec-content-box>`
			: html`
				${this._renderNoResults()}`;
	}

	_renderNoResults() {
		return html`
			<capitec-content-box class="main-content-box" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-group
						class="no-result-group"
						layout="vertical"
						halign="center"
						valign="center"
						gap="none">
						<img
							src="platform/illustrations/history.svg"/>
						<capitec-label
							class="no-results"
							label="${this.accountsInfo.length > 0 ? `No Results found` : `You have no Paid Up Letters available`}"
							type="strong">
						</capitec-label>
				</capitec-group>
			</capitec-content-box>`;
	}
	
	_renderFooter() {
		return html`
			<capitec-button-bar
				?hidden="${this.filteredData.length === 0}">
				<capitec-check
					label="${this.selectedLabel}"
					?indeterminate="${this._isAnyAccountSelected()}"
					?checked="${this.accountsInfo.every(item => item.selected)}"
					@value-change="${e => this._selectAll()}">
				</capitec-check>
				
				<capitec-hyperlink
					label="Deselect All"
					?hidden="${!this._isAnyAccountSelected()}"
					@click="${() => this._deselect()}">
				</capitec-hyperlink>

				<capitec-spacer></capitec-spacer>
				
				<capitec-button 
					type="primary" 
					label="Send Paid Up Letter(s)" 
					?hidden=${!this._isAnyAccountSelected()}
					@click="${() => this._showPaidUpLetter()}">
				</capitec-button>
			</capitec-button-bar>`;
	}
	
	_renderPaidUpLetter() {
		return this.showPaidUpLetter
		? html`
			<horizon-paid-up-letter-dialog
				.landingPageInfo="${this.landingPageInfo}"
				.selectedAccounts="${this.selectedAccounts}"
				.encodedPDFs="${this.encodedPDFs}"
				registeredEmailId="${this.callerInformation.emailId}"
				@view-pdf="${(event) => this._viewPDF(event)}"
				@on-unloading="${() => this._telemetry.endSpan(CreditEvents.CREDIT_PAID_UP_LETTER_POP_UP, {})}"
				@cancel="${() => this._backToLandingPage()}"
				@send="${(e) => this._sendPaidUpLetter(e)}">
			</horizon-paid-up-letter-dialog>
		`
		: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="paid-up-account-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}

customElements.define(`horizon-paid-up-accounts`, PaidUpAccounts);