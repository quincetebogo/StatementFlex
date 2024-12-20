import { ACCOUNT_TYPES, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { Configuration, SecurityContext } from 'platform/core';
import { EXPANDER_LABEL, STATUS_TAG, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { STATEMENT_EVENTS, SavingsAccLandingPage, TRANSACTION_ENQUIRY_EVENTS } from 'app/constants/telemetry/events/SavingsAccount';
import { css, html, unsafeCSS } from 'platform/elements';
import { formatDate, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/TransactionHistory';
import 'app/components/savingsAccount/SavingAccount';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/savingsAccount/MainSavingsAccountDetails';
import 'app/components/disputes/Disputes';

const DATE_TIME_FORMAT = `dd mmm yyy hh:mm:ss`;
const DATE_ONLY = `dd mmm yyyy`;
// ninety days in milliseconds
const NINETY_DAYS = 7777000000;
const SAVINGS_ACCOUNT = 300;

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

/**
 * Savings Account View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class SavingsAccount
 * @extends {SavingsAccountBase}
 */
export class SavingsAccountLandingPage extends SavingsAccountBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.transactionHistory = [];
		this.accountDetails = null;
		this.clientProducts = null;
		// this.savingsAccountDetails = [];
		this.savingsDetails = {};
		// private properites
		this._loading = true;
		this.tranToDispute = {};
		this.disputeQuestion = {};
		this.cueSheetIncident = {};

		this.returnToScreen = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._optionClick(e.option));

		this.securityContext = SecurityContext.getInstance();
		this.isDisputableWithdrawal = true;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetryStartSpan(SavingsAccLandingPage.SAVINGS_ACCOUNT, TelemetryScreen.SAVINGS_ACCOUNT);
		this._initialise();

		this._optionClick = (option, data) => {

			const transactionHistory = () => this._transactionHistory();
			const debiCheck = () => this._debiCheck();
			const statements = () => this._getStatements();
			const more = () => this._more();
			const cardDisputes = () => this._cardDisputeTransaction();

			const actions = {
				'transaction-history': transactionHistory,
				'debi-check-viewInfo': debiCheck,
				'statements-transact': statements,
				'card-disputes': cardDisputes,
				'more': more
			};

			if (actions[option]) {
				this.horizonIncidentManager.setCurrentNeed(option);
				return actions[option]();
			}
		};
	}

	disconnectedCallback() {
		this.returnToScreen.dispose();
		super.disconnectedCallback();
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			_loading: { state: true },
			renderMode: { type: Number, attribute: false }
		};
	}

	get cardClassificationType() {
		return [`CARD_AUTH_SETTLED`, `CARD_AUTH_FINANCIAL`, `FINANCIAL`, `CARD_AUTHORISATION`];
	}

	get cardSpendGroupToDispute() {
		return [`CASH_WITHDRAWAL`, `CARD_TRANSACTION`, `CARD_SUBSCRIPTION`, `CARD_SUBSCRIPTION_FOR_EXCLUDED_MERCHANTS`, `CARD_AUTHORISATION_TRANSACTION`];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_checkboxChange(e, item) {
		item.checked = e.detail.new;
		this.requestUpdate();
	}

	_transactionSelectAll(e) {
		this.transactionHistory = this.transactionHistory.map(t => {
			if (e.detail.filteredDisputableTransID.includes(t.transactionId)) {
				t.checked = e.detail.new;
			}
			return t;
		});
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	_unloadTransactionHistory() {
		this.endCallContext = `LandingPage`;
		this.transactionHistory = [];

		// await this.horizonIncidentManager.classifyIncident(() => this._toggleBusyFlag());

		// this._setIncidentDone();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;

		if (this.callerInformation.verificationStatus === `unverified`) {
			this.horizonRouter.navigateToProductInfo(`SavingsAccount`);
		} else {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsService.savingsAccountLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);

			if (returnValue.succeeded) {
				this.landingPageInfo = returnValue.result;

				// Do not create subs inc on performing return to screen
				if (!this.horizonStore.getReturnToScreen()) {
					this.horizonIncidentManager.setCurrentNeed(LANDING_PAGE_NEEDS.SAVINGS_ACCOUNT);
					await this.createAndClassifySubIncident(null, false);

					// setting inc status to not started for landing page needs
					this._setIncidentNotstarted();
				} else if (this.horizonStore.getScreenDetails()?.returningFromScreen === `card-disputes-success-done`) {
					this.horizonStore.clearScreenDetails();
					this.horizonStore.clearReturnScreen();
				}

				// Now we can update the information on the product buttons
				this._updateLeftBar();
				this.endCallContext = `LandingPage`;
				this.renderMode = RENDER_MODE.MAIN_PAGE;
			}
		}
		this._loading = false;
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
	}

	async _transactionHistory() {
		await this._telemetry.logEvent(SavingsAccLandingPage.SAVINGS_ACC_TRANSACTION_HISTORY, {
			"screen": TelemetryScreen.SAVINGS_ACCOUNT,
			"next-screen": TelemetryScreen.TRANSACTION_HISTORY
		});

		// await this.createAndClassifySubIncident(null, false);
		await this._getTransactionHistory();
	}

	async _getTransactionHistory(startDate, endDate, startAtIndex) {
		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.landingPageInfo.accountNumber,
			accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
			startDate: startDate || TRANSACTION_HISTORY.START_DATE,
			endDate: endDate || TRANSACTION_HISTORY.END_DATE,
			startAtIndex: startAtIndex || TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		const returnValue = await this.savingsService.savingsAccountTransactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
				.map((item) => {
					const date = new Date(Date.parse(item.transactionDate));
					const today = new Date();
					const _540thDateFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 540);
					const isDisputable = this.cardClassificationType.includes(item.transactionStatus) && this.cardSpendGroupToDispute.includes(item.spendGroup); // To replace 4060 transCode check
					item.description = item.statementDescription;
					item.tranDate = date;
					item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
					item.formatedAmount = formatCurrency(item.amount);
					item.formatedBalance = formatCurrency(item.balance);
					item.isDomesticWithdrawl = () => item.spendGroup === `CASH_WITHDRAWAL` && isNullorEmpty(item.currency);
					item.isTranDateOlderThan540 = () => item.tranDate < _540thDateFromNow;
					item.hideDisputeBtn = item.disputeFlag || !isDisputable || item.isTranDateOlderThan540() || item.isDomesticWithdrawl();
					item.checked = false;
					item.disableCheck = item.hideDisputeBtn;
					return item;
				});
			this.transactionHistory.push(...formattedTrans);
			this.accountDetails = {
				"Account number": this.landingPageInfo.accountNumber,
				"Balance": formatCurrency(this.landingPageInfo.accountBalance),
				"Available balance": formatCurrency(this.landingPageInfo.accountAvailableBalance),
				"Pending amount": formatCurrency(this.landingPageInfo.accountPendingAmount),
				"Interest": `${this.landingPageInfo.interestRatePercentage}%`,
				"Status": this.landingPageInfo.accountStatus
			};
			this.endCallContext = `TransactionHistory`;
			this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
		}
	}

	_more() {
		// Functionality to option 'more' comes here
	}

	async _productEnquiry(event, type) {
		if (event.detail.enquiry === `product-enquiry`) {
			const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
			window.open(`${globalOneUrl}${type}`);
		}
	}

	_exitTransactionHistory() {
		// this._setIncidentDone();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_getStatements() {
		this._telemetry.logEvent(SavingsAccLandingPage.SAVINGS_ACC_STATEMENTS, {
			screen: TelemetryScreen.SAVINGS_ACCOUNT,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		const productInfo = ACCOUNT_INTCAT_ENUM[SAVINGS_ACCOUNT];
		this.clientProducts = [
			{
				'accountNumber': this.landingPageInfo.accountNumber,
				'accountName': productInfo.name,
				'accountType': SAVINGS_ACCOUNT,
				'accountOpenDate': this.landingPageInfo.accountOpenDate,
				'name': productInfo.name,
				'type': productInfo.type,
				'category': productInfo.category,
				'subCategory': productInfo.subCategory,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order,
				'choosePeriod': productInfo.choosePeriod
			}
		];
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_cancelStatements() {
		this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS);
		super._backToLandingPage();
	}

	_getCurrentMonth() {
		const newdate = new Date();
		return `${getMonthName(newdate.getMonth())}`;
	}

	_getPreviousMonth() {
		const newdate = new Date();
		return `${getMonthName(newdate.getMonth() - 1)}`;
	}

	async _accountDetails(savingsLandingDetails) {
		this._telemetry.logEvent(SavingsAccLandingPage.SAVINGS_ACC_INFO, {
			screen: TelemetryScreen.SAVINGS_ACCOUNT,
			nextScreen: TelemetryScreen.SAVINGS_ACCOUNT_INFO
		});

		this.horizonIncidentManager.setCurrentNeed(LANDING_PAGE_NEEDS.SAVINGS_ACCOUNT);

		await this.createAndClassifySubIncident(null, false);

		this.savingsDetails = {
			"accountNumber": savingsLandingDetails.accountNumber,
			"Current balance": savingsLandingDetails.accountBalance === 0 ? `-` : formatCurrency(savingsLandingDetails.accountBalance),
			"Available balance": savingsLandingDetails.accountAvailableBalance === 0 ? `-` : formatCurrency(savingsLandingDetails.accountAvailableBalance),
			"Interest rate": `${savingsLandingDetails.interestRatePercentage}%`,
			[`Accrued interest ${this._getCurrentMonth()}`]: savingsLandingDetails.accruedInterestCurrentMonth,
			[`Accrued interest ${this._getPreviousMonth()}`]: savingsLandingDetails.accruedInterestLastMonth,
			"Interest earned tax year": savingsLandingDetails.interestEarned,
			"Posting restrictions": savingsLandingDetails.postingRestrictions === `N` ? `No` : `Yes`,
			"Pending amount": savingsLandingDetails.accountPendingAmount === 0 ? `-` : formatCurrency(savingsLandingDetails.accountPendingAmount),
			"Amount on hold": savingsLandingDetails.holds === 0 ? `-` : formatCurrency(savingsLandingDetails.holds),
			"Date opened": savingsLandingDetails.accountOpenDate ? this._formatDate(savingsLandingDetails.accountOpenDate) : `-`,
			"Last updated": savingsLandingDetails.lastUpdate ? this._formatDate(savingsLandingDetails.lastUpdate) : `-`,
			"Account status": savingsLandingDetails.accountStatus
		};

		this.renderMode = RENDER_MODE.SAVINGS_ACCOUNT_DETAILS;
		this.endCallContext = `BalanceEnquiry`;
	}

	_cancelAccountView() {
		this._telemetry.logEvent(SavingsAccLandingPage.SAVINGS_ACC_DETAILS_VIEW_CLOSE, {
			screen: TelemetryScreen.SAVINGS_ACCOUNT_INFO,
			nextScreen: TelemetryScreen.SAVINGS_ACCOUNT
		});
		this._setIncidentDone();
	}

	async _cardDisputeTransaction() {
		this.tranToDispute = this.transactionHistory.filter(t => t.checked);

		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_CLICK, {
			transactionId: this.tranToDispute.map(t => t.transactionId),
			cardAuthType: this.tranToDispute.map(t => t.cardAuthType)
		});

		this.cueSheetIncident = await this.horizonIncidentManager.createPrimaryInc((ex) => this._errorHandler(ex));
		const returnValue = await this._getFirstQusToDispute();

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get cue sheet questions to dispute`, `_cardDisputeTransaction`, returnValue.correlationId);
			return;
		}

		this.disputeQuestion = returnValue.result;
		this.renderMode = RENDER_MODE.DISPUTE_TRANSACTION;
	}

	async _getFirstQusToDispute() {
		const request = {
			"transactions": this.tranToDispute.map((item) => ({
				transactionID: item.transactionId,
				transactionPostingDate: item.postingDate
			})),
			"incident": this.cueSheetIncident,
			"cifNumber": this.callerInformation.cifNumber,
			"accountNumber": this.landingPageInfo.accountNumber,
			"agentId": `${this.securityContext.username}`
		};
		const returnValue = await this.savingsService.getFirstQuestion(request);
		return returnValue;
	}

	async _getNextQusToDispute(request) {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_NEXT, {
			cueSheetId: request.cueSheetId,
			caseId: request.caseId,
			answerId: request.answerId
		});

		const returnValue = await this.savingsService.getNextQuestion(request, () => true);
		this.disputeQuestion = returnValue.result;

		return returnValue;
	}

	async _cancelDisputeTrans() {
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_CANCEL);
		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE);

		this.disputeQuestion = {};
		/* Remove during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.NOT_STARTED;
		*/
		this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
	}

	async _disputeOutcome(event) {
		await this.createAndClassifySubIncident();
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_CONFIRM, {});

		this.disputeQuestion = {};
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.clientAnswerWording = event.detail.clientAnswerWording;
		screenDetails.agentAnswerWording = event.detail.agentAnswerWording;

		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `transaction-history`);

		this.horizonRouter.navigateToDisputesSuccess();
	}

	async _restartDispute() {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE_RESTART);

		const returnValue = await this._getFirstQusToDispute();
		return returnValue;
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
			.savingsaccount{
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSavingsLandingPage()}
			${this._renderTransactionHistory()}
			${this._renderSavingsAccountDetails()}
			${super._webTemplate(ACCOUNT_TYPES.SAVINGS_ACCOUNT)}
			${this._renderDisputeTransModal()}
		`;
	}

	_renderSavingsLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE ||
			this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-savings-account
					class="savingsaccount"
					.landingPageInfo = "${this.landingPageInfo}"
					.shouldDisableByRole="${need => this._shouldDisableByRole(need)}"
					.showTooltip="${need => this._showTooltip(need)}"
					.getTooltipMessage="${(need) => this._getTooltipMessage(need)}"
					@option-click="${(event) => this._optionClick(event.detail.option)}"
					@savings-enquiry="${(event) => this._productEnquiry(event, `transact`)}"
					@account-details="${() => this._accountDetails(this.landingPageInfo)}">
				</horizon-savings-account>`
			: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY ||
			this.renderMode === RENDER_MODE.DISPUTE_TRANSACTION
			? html`
			<horizon-transaction-history
				.transactionHistory="${this.transactionHistory}"
				.accountDetails="${this.accountDetails}"
				type="${ACCOUNT_TYPES.SAVINGS_ACCOUNT}"
				.renderTableColumns="${() => this._renderTransHistoryColumns()}"
				.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
				.getTransactionHistory="${(startDate, endDate, startAtIndex) => this._getTransactionHistory(startDate, endDate, startAtIndex)}"
				.disposeData="${() => this.transactionHistory = []}"

				@error-handler = "${() => this._errorHandler()}"
				@back="${() => this._exitTransactionHistory()}"
				@unloading="${() => this._unloadTransactionHistory()}"
				@select-all="${(e) => this._transactionSelectAll(e)}"
				@dispute-transactions="${() => this._optionClick(`card-disputes`)}">
			</horizon-transaction-history>`
			: html``;
	}

	_renderTransHistoryColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="checked"
				.renderer="${(item, fieldName, value) => this._renderCheckbox(item, fieldName, value)}"
				size="150px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="410px;">
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

	_renderCheckbox(item, fieldName, value) {
		return this.roleManager.isClientCareAgent || this.roleManager.isHelpDeskAgent
			? html`
			<capitec-check
				?checked="${value}"
				?disabled="${item.disableCheck}"
				label="${formatDate(item.transactionDate, DATE_TIME_FORMAT)}"
				@value-change="${(e) => this._checkboxChange(e, item)}">
			</capitec-check>`
			: html`
			<capitec-label
				label="${formatDate(item.transactionDate, DATE_TIME_FORMAT)}">
			</capitec-label>`;
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
					label="Statement description: ${item.statementDescription}"
					data-automation-id="transaction-history-item-description">
				</capitec-label>

				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center" wrap>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Transaction type"
						value = "${item.transTypeDesc ? item.transTypeDesc : `-`}"
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
						value = "${formatDate(item.postingDate, DATE_ONLY)}"
						data-automation-id="transaction-history-item-posting-date">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Processed date"
						value = "${formatDate(item.processDate, DATE_ONLY)}"
						data-automation-id="transaction-history-item-processed-date">
					</horizon-label>
				
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

					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Teller"
						value = "${item.teller ? item.teller : `-`}"
						data-automation-id="transaction-history-item-teller">
					</horizon-label>
				</capitec-group>
				${this._renderDispute(item)}
			</capitec-group>
		`;
	}

	_renderDispute(item) {
		return html`
			<capitec-label
				label="Dispute details"
				style="${unsafeCSS(EXPANDER_LABEL).toString()}"
				?hidden="${!item.disputeFlag}">
			</capitec-label>
			<capitec-group layout="horizontal" gap="none" halign="right" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Dispute status"
					value = "${item.disputeReason}"
					?hidden="${!item.disputeFlag}">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Date and time disputed"
					value = "${formatDate(item.disputeDate, DATE_TIME_FORMAT)}"
					?hidden="${!item.disputeFlag}">
				</horizon-label>

				<capitec-spacer></capitec-spacer>

				<capitec-button
					type="clear"
					label="Dispute Transaction"
					data-automation-id="transaction-history-dispute-btn"
					@click="${() => this._optionClick(`card-disputes`, item)}"
					?hidden="${true}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_renderSavingsAccountDetails() {
		return this.renderMode === RENDER_MODE.SAVINGS_ACCOUNT_DETAILS
			? html`
			<horizon-savings-account-details
				.savingsAccountDetails = "${this.savingsDetails}"
				@back="${() => this._cancelAccountView()}">
			</horizon-savings-account-details>`
			: html``;
	}

	_renderDisputeTransModal() {
		return this.renderMode === RENDER_MODE.DISPUTE_TRANSACTION
			? html`
			<horizon-disputes
				.transactionDetails="${this.tranToDispute}"
				.disputeQuestion="${this.disputeQuestion}"
				.getNextQuestion="${(request) => this._getNextQusToDispute(request)}"
				.restartQuestions="${() => this._restartDispute()}"
				@cancel="${() => this._cancelDisputeTrans()}"
				@dispute-outcome="${(event) => this._disputeOutcome(event)}"
				@loading="${() => this._telemetry.startSpan(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_DISPUTE)}">
			</horizon-disputes>
			`
			: html``;
	}

	_footer() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center" class="buttonBroup">
				<capitec-button
					data-automation-id="update-dialog-cancel"
					id="id-cancel-button"
					label="Cancel"
					@click="${() => this.renderMode = RENDER_MODE.TRANSACTION_HISTORY}">
				</capitec-button>
			</capitec-group>
		`;
	}

}

customElements.define(`horizon-savings-account-landing-page`, SavingsAccountLandingPage);