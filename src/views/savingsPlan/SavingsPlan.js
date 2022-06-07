import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, STATUS_TAG, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { formatStringAsPascalCase, getMonthName } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { Configuration } from 'platform/core';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { SavingsPlanEvents, TRANSACTION_ENQUIRY_EVENTS } from 'app/constants/telemetry/events/SavingsPlan';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/dialogs/taxCertificates/TaxCertificates';
import 'app/dialogs/statements/Statements';
import 'app/components/common/TransactionHistory';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/quickTransactions/TaxCertificateLanding';

import 'app/views/savingsPlan/FlexibleSavingsPlan';
import 'app/views/savingsPlan/FixedTermSavingsPlan';

import 'app/views/savingsPlan/SavingsPlanServiceError';
import 'app/views/savingsPlan/SavingsPlanUnverifiedPage';

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

const TAX_TYPE = {
	IT3B: `iT3BTaxCertificates`,
	IT3S: `iT3STaxCertificates`
};

const NINETY_DAYS = 7777000000;

//TODO: Transaction History needs be formed as per Savings plan type (FLEXIBLE_SAVINGS, FIXED_TERM_MULTIPLE_DEPOSITS, FIXED_TERM_SINGLE_DEPOSIT)
const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `FLEXIBLE_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

/**
 * Savings Plan View
 *
 * Events Raised
 * --------------
 * 
 * @export
 * @class SavingsPlan
 * @extends {SavingsPlan}
 * 
 */

export class SavingsPlan extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.savingsPlanDetails = [];
		this.configuration = Configuration.getInstance();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.selectedAccountNumber = ``;
		this.taxCertType = ``;
		this.taxCertificateDetails = null;
		this.transactionHistory = [];

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.accountViewType = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = async (option, savePlanDetails, saveType) => {

			const statements = () => this._getStatements(savePlanDetails.accountNumber, saveType);
			const taxCertificates = () => this._taxCertificates(savePlanDetails.accountNumber, savePlanDetails.accountName);
			const productEnquiry = () => this._productEnquiry();
			const interestRates = () => this._interestRates();
			const transactionHistory = () => this._transactionHistory(savePlanDetails, saveType);

			const actions = {
				'statements': statements,
				'tax-certificate': taxCertificates,
				'product-enquiry': productEnquiry,
				'interest-rates': interestRates,
				'transaction-history': transactionHistory,
				
			};

			if (actions[option]) {
				await super._inicidentManager_(`${option}-save`, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}
		};
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			landingPageInfo: { state: true },
			accountViewType: { state: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	_verifyNowClick() {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_VIEW_INFO, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});
		this._verifyClick();
	}
	
	async _clientVerified(event) {
		super._clientVerified(event);

		await this._initialise();
	}

	async _accountDetails(type, accNumber) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_NUMBER_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS
		});
		this.accountViewType = type;

		const flexibleSavePlan = () => this._getFlexibleSavePlan(accNumber);
		const fixedTermSavePlan = () => this._getFixedTermSavePlan(accNumber);

		const saveProducts = {
			'flexible-save-plan': flexibleSavePlan,
			'fixed-term-save-plan': fixedTermSavePlan
		};

		if (saveProducts[this.accountViewType]) {
			await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
			await super.createAndClassifySubsIncident();
			
			return saveProducts[this.accountViewType]();
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsAccountService.savingsPlanLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);
			 
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to retrieve client Savings plan details from service.`, `_initialise`, returnValue.correlationId);
				this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
				return;
			}

			if (returnValue.succeeded && returnValue.result) {
                this.landingPageInfo = returnValue.result;
				this.savingsPlanDetails = returnValue.result.savingsPlans;
				this._formatSavingsPlanDetails();

				this._updateLeftBar();
				
				if (this.savingsPlanDetails.length === 0) {
					this.horizonRouter.navigateToProductInfo(`SavingsPlan`);
					return;
				}
				
				await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
				await super.createAndClassifySubsIncident(null, false);
			} 

			this._telemetry.startSpan(SavingsPlanEvents.SAVINGS_PLAN, {
				"screen": TelemetryScreen.SAVINGS_PLAN_LANDING
			});
		}

			this.renderMode = RENDER_MODE.MAIN_PAGE;
			this.endCallContext = `LandingPage`;
			this._performReturnToScreen();
		}

	_updateLeftBar() {
		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	_performReturnToScreen() {
		const returnToScreen = this.horizonStore.getReturnToScreen();

		if (returnToScreen && returnToScreen.optionalData) {
			this.eventAggregator.publish(`horizon-return-to-screen`, { option: returnToScreen.optionalData });
		}

		this.horizonStore.clearReturnScreen();
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_formatSavingsPlanDetails() {
		const flexibleSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.feesLastMonth = item.feesLastMonth ? formatCurrency(item.feesLastMonth) : `-`;

			item.maturityDate = `-`;
			item.dateOpened = this._formatDate(item.dateOpened);
			item.lastUpdate = this._formatDate(item.lastUpdate);

			item.planName = formatStringAsPascalCase(item.planName);
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		const fixedSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.availableContributions = formatCurrency(item.availableContributions);
			item.contributionLimit = formatCurrency(item.contributionLimit);
			item.totalContributions = formatCurrency(item.totalContributions);

			item.maturityDate = this._formatDate(item.maturityDate);
			item.dateOpened = this._formatDate(item.dateOpened);
			item.dateFixed = this._formatDate(item.dateFixed);
			item.lastUpdate = this._formatDate(item.lastUpdate);
			
			item.planName = formatStringAsPascalCase(item.planName);
			item.depositeType = `${formatStringAsPascalCase(item.planType)} ${item.interestOption === `R` ? `- Reinvest` : ``}`;
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		this.savingsPlanDetails = [...flexibleSavingsPlanDetails, ...fixedSavingsPlanDetails];
	}

	_backFromAccountDetails() {
		// TO DO: This function to be used when clicked back from account details screen.
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_DETAILS_CLOSE, {
			"screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}
	
	_getStatements(accNumber) {
		const accountDetails = this.savingsPlanDetails.find(savingsPlan => savingsPlan.accountNumber === accNumber);
	
		const productInfo = ACCOUNT_INTCAT_ENUM[accountDetails.accountType][accountDetails.interestCategory] || ACCOUNT_INTCAT_ENUM[accountDetails.accountType];
		const accName = accountDetails.planName.toLowerCase();

		this.clientProducts = [
			{
				'accountNumber': accountDetails.accountNumber,
				'accountName': `${accName.charAt(0).toUpperCase()}${accName.slice(1)}`,
				'accountType': accountDetails.planType,
				'accountOpenDate': accountDetails.accountOpenDate,
				'type': productInfo.type,
				'category': productInfo.category,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order,
				'choosePeriod': productInfo.choosePeriod
			}
		];
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_STATEMENTS
		});
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_backToLandingPage() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _taxCertificates(accNumber, accountName) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_TAX_CERTIFICATE_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_TAX_CERTIFICATE
		});

		const returnValue = await this.quickTransactionService.getTaxCertificate(this.callerInformation.cifNumber, () => true);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get load tax certificates information`, `_taxCertificates`, returnValue.correlationId);
			this.horizonRouter.navigateToTaxCertificateServiceError();
			return;
		}

		this.taxCertificateDetails = returnValue.result;
		this.hasTaxCertificate = this.taxCertificateDetails.iT3BTaxCertificates.length + this.taxCertificateDetails.iT3STaxCertificates.length > 0;

		if (this.hasTaxCertificate) {
			this.taxCertType = accountName.toLowerCase().replaceAll(` `, ``).includes(`tax-free`) ? TAX_TYPE.IT3S : TAX_TYPE.IT3B;
			this.selectedAccountNumber = accNumber;
			this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
			return;
		}

		this.renderMode = RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/`);
	}

	async _interestRates() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/rates-and-fees/`);
	}

	async _transactionHistory(savePlanDetails, saveType) {
		await this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_TRANSACTION_HISTORY, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.TRANSACTION_HISTORY
		})

		this.savePlanDetails = savePlanDetails;

		await super.createAndClassifySubsIncident();
		await this._getTransactionHistory(null, null, null, savePlanDetails, saveType);
	}

	async _getTransactionHistory(startDate, endDate, startAtIndex, savePlanDetails, saveType) {

		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: savePlanDetails.accountNumber,
			accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
			startDate: startDate || TRANSACTION_HISTORY.START_DATE,
			endDate: endDate || TRANSACTION_HISTORY.END_DATE,
			startAtIndex: startAtIndex || TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		//TODO : New CS for SavingsPlan needs to be called here.
		const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
									.map((item) => {
										const date = new Date(Date.parse(item.transactionDate));
							
										item.tranDate = date;
										item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
										item.formatedAmount = formatCurrency(item.amount);
										item.formatedBalance = formatCurrency(item.balance);
							
										return item;
									});
			this.transactionHistory.push(...formattedTrans);

			//TODO: Form the accountDetails object based on the new CS developed for SavingsPlan
			this.accountDetails = {
				"Account number": savePlanDetails.accountNumber,
				"Balance": formatCurrency(savePlanDetails.currentBalance),
				"Available balance": formatCurrency(savePlanDetails.availableBalance),
				"Pending amount": `R1000`,//formatCurrency(this.landingPageInfo.accountPendingAmount),
				"Interest": `${savePlanDetails.interestRate}%`,
				"Status": savePlanDetails.accountStatus
			};
			this.endCallContext = `TransactionHistory`;
			this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
		}
	}

	async _statementsAccConfirmed(event) {
		// const need = `statements-${event.detail.account}`;

		// await super._inicidentManager_(need, () => this._toggleBusyFlag());
	}
	
	_getFlexibleSavePlan(accNumber) {
		// TO DO: "flexibleAccountDetails" details to be pulled and formated from services
		this.flexibleAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	_getFixedTermSavePlan(accNumber) {
		// TO DO: "fixedTermAccountDetails" details to be pulled and formated from services
		this.fixedTermAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _findBranch() {
		const branchLocatorUrl = await this.configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}

	_setIncidentDone() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_unloadTransactionHistory() {
		this.endCallContext = `LandingPage`;
		this.transactionHistory = [];
		this._setIncidentDone();
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	 static get styles() {
		return [
			super.styles,
			css`
			.save-plan{
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderLandingPage()}
			${this._renderSavingsPlanServiceError()}
			${this._renderFlexibleDetailsView()}
			${this._renderFixedTermDetailsView()}
			${this._renderStatements()}
			${this._renderTaxCertificate()}
			${this._renderTaxCertificateNotAvailable()}
			${this._renderTransactionHistory()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE || 
				this.renderMode === RENDER_MODE.STATEMENTS ||
				this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				${this._renderSavingsPlanVerifiedLandingPage()}
				${this._renderSavingsPlanUnverifiedPage()}`
			: html``;
	}
	
	_renderSavingsPlanVerifiedLandingPage() {
		return this.verificationStatus === `verified` 
		? html`
			<capitec-pc-savings-plan
				.savingsPlanDetails="${this.savingsPlanDetails}"

				@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.planDetails, e.detail.saveType)}"
				@view-info="${() => this._productEnquiry()}"
				@account-details="${(e) => this._accountDetails(e.detail.accountType, e.detail.accountNumber)}">
			</capitec-pc-savings-plan>`
		: html``;
	}

	_renderSavingsPlanUnverifiedPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-savings-plans-unverified-page
					class="save-plan"
					@verify-now= "${() => this._verifyClick()}"
					@product-enquiry="${() => this._productEnquiry()}">
				</horizon-savings-plans-unverified-page>`
			: html``;
	}

	_renderSavingsPlanServiceError() {
		return this.renderMode === RENDER_MODE.SERVICE_UNAVAILABLE
			? html`
				<horizon-savings-plans-service-error
					class="save-plan"
					@find-branch= "${() => this._findBranch()}">
				</horizon-savings-plans-service-error>`
			: html``;
	}

	_renderFlexibleDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FLEXIBLE
			? html`
				<capitec-flexible-savings-plan-details
					.flexibleAccountDetails="${this.flexibleAccountDetails}"

					@back="${() => this._setIncidentDone()}">
				</capitec-flexible-savings-plan-details>
			`
			: html``;
	}

	_renderFixedTermDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FIXED_TERM
			? html`
				<capitec-fixed-term-savings-plan-details
					.fixedTermAccountDetails="${this.fixedTermAccountDetails}"

					@back="${() => this._setIncidentDone()}">
				</capitec-fixed-term-savings-plan-details>`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.clientProducts="${this.clientProducts}"
					registeredEmailId="${this.callerInformation.emailId}"
					type="${ACCOUNT_TYPES.SAVINGS_PLAN}"
					@cancel="${() => this._backToLandingPage()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				<horizon-tax-certificate
					.taxCertificateDetails="${this.taxCertificateDetails}"
					cifNumber="${this.callerInformation.cifNumber}"
					accountNumber="${this.selectedAccountNumber}"
					type="${this.taxCertType}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-tax-certificate>
			`
			: html``;
	}

	_renderTaxCertificateNotAvailable() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE
		? html`
			<horizon-tax-certificate-landing
				@back="${() => this._backToLandingPage()}">
			</horizon-tax-certificate-landing>
			`
		: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY
			? html`
				<horizon-transaction-history
					.transactionHistory="${this.transactionHistory}"
					.accountDetails="${this.accountDetails}"
					.savePlanDetails="${this.savePlanDetails}"
					type="${ACCOUNT_TYPES.SAVINGS_PLAN}"
					.renderTableColumns="${() => this._renderTransHistoryColumns()}"
					.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
					.getTransactionHistory="${(startDate, endDate, startAtIndex, savePlanDetails) => this._getTransactionHistory(startDate, endDate, startAtIndex, savePlanDetails)}"
					.disposeData="${() => this.transactionHistory = []}"

					@error-handler = "${() => this._errorHandler()}"
					@back="${() => this._setIncidentDone()}"
					@unloading="${() => this._unloadTransactionHistory()}">
				</horizon-transaction-history>`
			: html``;
	}

	_renderTransHistoryColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="transactionDate"
				type="date"
				size="156px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="410px;">
			</capitec-table-column>
			<capitec-table-column
				label="Transaction Status"
				field="transactionStatus"
				size="144px;"
				.renderer="${(item, fieldName, value) => this._renderTransactionStatus(value)}">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				size="158px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Balance"
				field="formatedBalance"
				size="130px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderTransactionStatus(value) {
		return value === `Processed`
			? html``
			: html`
				<div style="${unsafeCSS(STATUS_TAG.tagContainer)} ${unsafeCSS(STATUS_TAG.tagType)}">
					<div style="${unsafeCSS(STATUS_TAG.tagLabel).toString()}">${value}</div>
				</div>`;
	}

	_renderTransactionDetails(item) {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_INFO, {
			'journal-no': item.journalNumber
		});

		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: ${item.description}"
				data-automation-id="transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transactionType ? item.transactionType : `-`}"
					data-automation-id="transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount ? item.transferAccount : `-`}"
					data-automation-id="transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${this._formatDate(item.postingDate)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${this._formatDate(item.processDate)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode ? item.transactionCode : `-`}"
					data-automation-id="transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : `-`}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : `-`}"
					data-automation-id="transaction-history-item-card-auth-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : `-`}"
					data-automation-id="transaction-history-item-journal-number">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : `-`}"
					data-automation-id="transaction-history-item-terminalID">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : `-`}"
					data-automation-id="transaction-history-item-cashback">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : `-`}"
					data-automation-id="transaction-history-item-branch">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : `-`}"
					data-automation-id="transaction-history-item-teller">
				</horizon-label>
			</capitec-group>
		`;
	}

}

customElements.define(`horizon-savings-plan`, SavingsPlan);