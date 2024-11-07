import { ACCOUNT_STATUS, CC_CLOSED_STATUS_DISABLE_NEEDS, CREDIT_TYPE, DECLINE_REASONS_EXCLUSION_LIST, FROM_ACCOUNTS, FROM_ACCOUNTS_LIST, PERMISSION_DECLINE_REASONS, PERMISSION_STATUS, PRODUCTS, PRODUCT_TYPE } from 'app/constants/Credit';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { Configuration, EventAggregator, NavigationContext, SecurityContext } from 'platform/core';
import { CreditEvents, SETTLEMENT_QUOTE_EVENTS, SETTLE_AND_CLOSE, TRANSACTION_ENQUIRY_DISPUTE_EVENTS, TRANSACTION_ENQUIRY_EVENTS } from 'app/constants/telemetry/events/Credit';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { css, html, unsafeCSS } from 'platform/elements';
import { formatDate, formatStringAsPascalCase, getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { CreditService } from 'app/services/CreditService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { RoleManager } from 'app/shell/RoleManager';
import { SavingsService } from 'app/services/SavingsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { alertBannerMixin } from 'app/views/common/AlertBannerMixin';
import { creditMixin } from 'app/views/credit/CreditMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/ServiceCallErrorScreen';
import 'app/components/credit/CreditCardDetails';
import 'app/components/credit/AccessFacilityDetails';
import 'app/components/credit/TermLoanDetails';
import 'app/components/dialogs/common/WarningDialog';
import 'app/dialogs/credit/SettlementQuote';
import 'app/dialogs/credit/PaidUpLetter';
import 'app/dialogs/statements/Statements';
import 'app/dialogs/credit/SettleAndCloseDisclaimer';
import 'app/productControls/credit/src/BudgetAccounts';
import 'app/productControls/credit/src/BudgetAccountDetails';
import 'app/productControls/credit/src/CreditAccountLanding';
import 'app/productControls/credit/src/CreditUnverifiedLanding';
import 'app/productControls/credit/src/OpenBudgetFacility';
import 'app/productControls/credit/src/PayCreditCardBudget';
import 'app/components/dialogs/common/ViewAndEmailDocuments';
import 'app/dialogs/credit/SettleAndCloseDialog';
import 'app/components/common/TransactionHistory';
import 'app/components/disputes/Disputes';

const ISO_8601_DATE_FORMAT = `yyyy-mm-dd`;

const DATE_FORMAT = `dd mmm yyyy`;

const DATE_TIME_FORMAT = `dd mmm yyy hh:mm:ss`;

const NINETY_DAYS = 7777000000;

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `CREDIT`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

const BUDGET_FACILITY = {
	END_DATE: ``,
	START_DATE: ``,
	STATUS: `Active`
};

const DEFAULT_CCS_MESSAGE = `Unable to perform this transaction as there is a CCS status on this account.`;
const TOOLTIP_CLOSED_CC_STATUS = `Credit card account is marked for closure, a {0} cannot be issued`;

/** Credit Account View
 * 
 * @export
 * @class CreditAccount
 * @extends {ViewBase}
 */
export class CreditAccount extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.configuration = Configuration.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.roleManager = RoleManager.getInstance();
		this.securityContext = SecurityContext.getInstance();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		// private properites
		this.budgetAccountDetails = null;
		this.accountViewType = ``;
		this.creditCardDetails = {};
		this.accessFacilityDetails = {};
		this.termLoanDetails = {};
		this.encodedPDF = ``;
		this.flexibleCreditAccounts = [];
		this.fixedTermCreditAccounts = [];
		this.creditBalance = ``;
		this.productType = ``;
		this.creditType = ``;
		this.selectedAccounts = [];
		this.showPayBudgetDialog = false;
		this.payBudgetfromAccounts = [];
		// ccs status of client set to true until real value retrieved from CS
		this.ccsStatus = false;
		this.settleAndCloseQuote = [];
		this.settleAndCloseCreditOption = ``;
		this.productSelected = ``;
		this.settleAndCloseDocument = ``;
		this.showSettleCloseModal = false;
		this.settlementQuoteEvents = SETTLEMENT_QUOTE_EVENTS;
		this.declineReason = ``;
		this.selectedAccountDetails = {};
		this.showPayBudgetWarning = false;
		this.transactionHistory = [];
		this.accountDetails = {};
		this.showTooltip = false;
		this.budgetStatus = ``;
		this.tranToDispute = {};
		this.disputeQuestion = {};
		this.cueSheetIncident = {};
		this.declineMessage = ``;

		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.savingsService = new SavingsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.returnToScreen = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._preformAction(e));

		Object.assign(CreditAccount.prototype, creditMixin);
		Object.assign(CreditAccount.prototype, alertBannerMixin);
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = async (option, creditType, productType, selectedAccountDetails, sendAnother = false) => {

			const transactionHistory = () => this._transactionHistory(creditType, productType, selectedAccountDetails);
			const statements = () => this._getStatements(creditType, productType, selectedAccountDetails, sendAnother);
			const settlementQuote = () => this._settlementQuote(creditType, productType, selectedAccountDetails);
			const settleAndClose = () => this._settleAndClose(creditType, productType, selectedAccountDetails);
			const paidUpLetter = () => this._paidUpLetter(selectedAccountDetails);
			const payBudget = () => this._payBudgetDialog(selectedAccountDetails);
			const viewBudgets = () => this._viewBudgets(selectedAccountDetails);
			const cardDisputes = () => this._cardDisputeTransaction();
			const openBudget = () => this._openBudgetDialog();

			const accConfig = ACCOUNT_INTCAT_ENUM[selectedAccountDetails.productTypeCode];
			const actions = {
				'view-budgets': viewBudgets,
				'pay-budget': payBudget,
				'transaction-history': transactionHistory,
				'statements': statements,
				'settlement-quote': settlementQuote,
				'paid-up-letter': paidUpLetter,
				'settle-close': settleAndClose,
				'card-disputes': cardDisputes,
				'open-budget': openBudget
			};

			if (actions[option]) {

				const clientNeed = `${option}-${accConfig.subCategory}`;

				await super._inicidentManager_(clientNeed, () => this._toggleBusyFlag());

				const { permissionResult, declineReasons, declineMessage } = await this._checkCreditPermisions(option, this.callerInformation.cifNumber, selectedAccountDetails.accountNumber || selectedAccountDetails.budgetAccountNumber, productType);
				this.ccsStatus = permissionResult === PERMISSION_STATUS.DENIED &&
					!DECLINE_REASONS_EXCLUSION_LIST.includes(declineReasons);
				this.declineReason = declineReasons;
				this.selectedAccountDetails = selectedAccountDetails;
				this.declineMessage = declineMessage || DEFAULT_CCS_MESSAGE;

				// Perform the action only when permission result is granted
				if (permissionResult === PERMISSION_STATUS.GRANTED) {
					return actions[option]();
				}
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
			loading: { state: false },
			renderMode: { state: false },
			accountViewType: { state: false },
			flexibleCreditAccounts: { type: Array, state: true, attribute: false },
			fixedTermCreditAccounts: { type: Array, state: true, attribute: false },
			creditBalance: { state: true, attribute: false },
			ccsStatus: { type: Boolean },
			showSettleCloseModal: { type: Boolean },
			showPayBudgetDialog: { state: false },
			declineReason: { state: false },
			showPayBudgetWarning: { state: false },
			showTooltip: { state: false }
		};
	}

	get ccAccNumber() {
		const ccDetails = this.flexibleCreditAccounts.find(item => item.type === PRODUCTS.CREDIT_CARD);
		return ccDetails?.maskedAccountNumber;
	}

	get ccDetails() {
		return this.flexibleCreditAccounts.find(item => item.type === PRODUCTS.CREDIT_CARD);
	}

	get cardAuthTypesToDispute() {
		return [`POS_POS_PURCHASE`, `CNP_MOTO_PURCHASE`, `ECO_ECOMMERCE_TXN`, `CSH_CASH_WITHDRWL`, `PCB_POS_PURCH_CASHBACK`, `REC_RECURRING_TXN`];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyNowClick() {
		this._telemetry.logEvent(CreditEvents.CREDIT_VERIFY_NOW, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});
		this._verifyClick();
	}

	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();
	}
	// Perform the action only when ccs status is false

	_viewInfo() {
		this._telemetry.logEvent(CreditEvents.CREDIT_VIEW_INFO, {});
		this._productEnquiry();
	}

	async _findBranchClick() {
		this._telemetry.logEvent(CreditEvents.CREDIT_FIND_A_BRANCH, {});

		const branchLocatorUrl = await this.configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}

	async _accountDetails(event) {
		this.accountViewType = event.detail.productType;

		this._telemetry.logEvent(CreditEvents.CREDIT_ACCOUNT_NUMBER_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": `${this.accountViewType} details`,
			"credit-type": event.detail.creditType,
			"product-type": event.detail.productType
		});

		const creditCard = () => this._getCreditCardDetails(event.detail.accountNumber);
		const accessFacility = () => this._getAccessFacilityDetails(event.detail.accountNumber);
		const termLoan = () => this._getTermLoanDetails(event.detail.accountNumber);

		const creditProducts = {
			[PRODUCTS.CREDIT_CARD]: creditCard,
			[PRODUCTS.ACCESS_FACILITY]: accessFacility,
			[PRODUCTS.TERM_LOAN]: termLoan
		};

		await super._inicidentManager_(LANDING_PAGE_NEEDS.CREDIT, () => this._toggleBusyFlag());
		await super.createAndClassifySubIncident(null, false);

		await creditProducts[this.accountViewType]();
	}

	_backFromAccountDetails() {
		this._telemetry.logEvent(CreditEvents.CREDIT_ACCOUNT_DETAILS_CLOSE, {
			"screen": `${this.accountViewType} details`,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._setIncidentDone();
	}

	_sendStatement() {
		// TO DO: Navigation to success or failure screens based on CS call response.
		this.horizonRouter.navigateToCreditStatementSuccess();
	}

	_viewBudgetDetails(selectedAccountDetails) {

		this._telemetry.logEvent(CreditEvents.BUDGET_ACCOUNT_DETAILS_VIEW, {
			"screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT_DETAILS,
			"budget-name": selectedAccountDetails.budgetName,
			"budget-open-date": selectedAccountDetails.budgetDateTaken
		});

		this.budgetStatus = selectedAccountDetails.status === `CLOSE` ? `Closed` : formatStringAsPascalCase(selectedAccountDetails.status);
		this.budgetAccountDetails = {
			budgetAccountNumber: selectedAccountDetails.budgetAccountNumber,
			budgetName: formatStringAsPascalCase(selectedAccountDetails.budgetName),
			budgetSequence: selectedAccountDetails.budgetSequence,
			budgetDetails: {
				"Budget status": formatStringAsPascalCase(selectedAccountDetails.status),
				"Open date": formatDate(selectedAccountDetails.budgetDateTaken, DATE_FORMAT),
				"Purchase amount": formatCurrency(selectedAccountDetails.originalAmount),
				"Interest rate": `${selectedAccountDetails.interestRate}%`,
				"Remaining term (months)": selectedAccountDetails.termRemaining,
				"Settlement amount": formatCurrency(selectedAccountDetails.settlementAmount),
				"Current instalment": formatCurrency(selectedAccountDetails.budgetInstalment),
				"Current balance": formatCurrency(selectedAccountDetails.budgetBalance),
				"Payment made": formatCurrency(selectedAccountDetails.repaymentAmount)
			}
		};

		this.renderMode = RENDER_MODE.BUDGET_ACCOUNT_DETAILS;
	}

	_transferFromBudgetAccounts(selectedBudget) {

		this._telemetry.logEvent(CreditEvents.BUDGET_DETAILS_TRANSFER_SELECT, {
			"budget-name": selectedBudget.budgetName,
			"budget-open-date": selectedBudget.budgetDateTaken
		});

		this._optionClick(`pay-budget`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, selectedBudget);
	}

	_transferFromBudgetDetails(budgetSequenceNo) {
		this._telemetry.logEvent(CreditEvents.BUDGET_ACCOUNT_DETAILS_TRANSFER, {
			"screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL
		});

		const budgetAcc = this.budgetFacilityAccounts.creditCardBudgetList.find(item => item.budgetSequence === budgetSequenceNo);
		budgetAcc.productTypeCode = ACCOUNT_TYPE_CODE.FLEXIBLE_CREDIT_CARD;

		this._optionClick(`pay-budget`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, budgetAcc);
	}

	async _payBudgetDialog(selectedAccountDetails) {

		const request = {
			"cifNumber": this.callerInformation.cifNumber,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"budgetAccountNumber": selectedAccountDetails.budgetAccountNumber
		};

		const returnValue = await this.creditService.budgetTransferFromAccounts(request);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve from accounts list from which budget can be trasfered.`, `_payBudgetDialog`, returnValue.correlationId);
			return;
		}

		if (returnValue.result?.hasCCSStatus) {
			this.ccsStatus = returnValue.result?.hasCCSStatus;
			this.showCCSmodal = true;
			return;
		}

		// Though we can check if credit card is in arrears without making the above CS call,
		// we have postponed it as CCS status check should take priority over credit card in arrears.
		const creditCardDetails = this.flexibleCreditAccounts.find(item => item.accountNumber === selectedAccountDetails.budgetAccountNumber);
		if (creditCardDetails?.arrearIndicator) {
			this.showPayBudgetWarning = true;
			return;
		}

		await this._telemetry.startSpan(CreditEvents.CREDIT_BUDGET_TRANSFER, {});

		this._formatFromAccounts(returnValue.result.fromAccounts);
		this.payBudgetAccountDetails = selectedAccountDetails;
		this.payBudgetAccountDetails.settlementAmount = parseFloat(this.payBudgetAccountDetails.settlementAmount).toFixed(2);
		this.payBudgetfromAccounts = returnValue.result.fromAccounts;

		this.showPayBudgetDialog = !this.showPayBudgetDialog;
	}

	_formatFromAccounts(fromAccounts) {
		this.clientProducts = fromAccounts.map(account => {
			const eligibleTransferAccounts = {
				'accountNumber': account.accountNumber,
				'accountName': formatStringAsPascalCase(account.accountName),
				'availableBalance': formatCurrency(account.availableBalance),
				'accountType': account.accountType,
				'icon': FROM_ACCOUNTS[account.accountType].icon,
				'order': FROM_ACCOUNTS[account.accountType].order
			};
			return eligibleTransferAccounts;
		})
			.sort((x, y) => x.order - y.order);
	}

	async _confirmPayBudget(transferDetails) {

		const returnValue = await this.creditService.confirmBudgetTransfer(transferDetails, this.callerInformation);

		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL,
			"next-screen": returnValue?.succeeded ? TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS : TelemetryScreen.CREDIT_PAY_BUDGET_FAILURE,
			"budget-name": transferDetails.budgetName,
			"budget-amount": transferDetails.authorisedAmount,
			"from-account": transferDetails.fromAccountNumber
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.accountName = transferDetails.budgetName;
		screenDetails.documentData = returnValue?.result?.documentData;
		screenDetails.creditType = CREDIT_TYPE.FIXED;
		screenDetails.productType = PRODUCTS.CREDIT_CARD;
		screenDetails.selectedAccounts = {
			productTypeCode: transferDetails.productTypeCode,
			accountNumber: transferDetails.budgetAccountNumber
		};
		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `view-budgets`);

		if (returnValue.succeeded && returnValue.result) {
			this.horizonRouter.navigateToBudgetFacilitySuccess();
			return;
		}

		this.logger.log(`error`, `Failed to pay budget amount by transfering`, `_confirmPayBudget`, returnValue.correlationId);
		this.horizonRouter.navigateToBudgetFacilityFailure();
	}

	async _confirmSettleAndClose(item) {
		this.productSelected = item.detail.productSelected;
		this.settleAndCloseDetails = item.detail.settleAndCloseDetails;
		const selectedAccountIndex = this._getSECTransferDetails(item.detail.productSelected.accountNumber);

		const settleAndClose = {
			creditType: this.settleAndCloseCreditOption,
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.settleAndCloseQuote.accountNumber,
			fromAccountNumber: this.settleAndCloseQuote.savingAccountsList[selectedAccountIndex].accountNumber,
			fromAccountType: this._getSavingsAccType(this.settleAndCloseQuote.savingAccountsList[selectedAccountIndex].accountType),
			authorisedAmount: this.settleAndCloseQuote.settlementAmount,
			caseId: ``,
			emailAddress: ``,
			firstname: this.callerInformation.firstName,
			surname: this.callerInformation.lastName,
			idNumber: this.callerInformation.southAfricanIDNumber,
			title: this.callerInformation.title
		};
		const returnValue = await this.creditService.settleAndClose(settleAndClose);

		await this._settleAndCloseConfirmTelemetry(returnValue.succeeded, this.settleAndCloseQuote.savingAccountsList[selectedAccountIndex].accountNumber, this.settleAndCloseQuote.accountNumber);

		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.settleAndCloseCreditType = this.creditType;
		screenDetails.settleAndCloseProductType = this.settleAndCloseCreditOption;
		screenDetails.settleAndCloseCreditOption = this.settleAndCloseCreditOption;
		screenDetails.settleAndCloseAccountNumber = this.settleAndCloseQuote.accountNumber;
		screenDetails.accountName = Object.keys(this.settleAndCloseDetails).find(key => this.settleAndCloseDetails[key] === this.settleAndCloseQuote.accountNumber);
		screenDetails.type = this.selectedAccountDetails.type;
		screenDetails.settlementAmount = this.settleAndCloseQuote.settlementAmount;
		screenDetails.fromAccountNumber = settleAndClose.fromAccountNumber;

		if (returnValue.succeeded) {

			this.settleAndCloseDocument = returnValue.result.documentData;

			screenDetails.settleAndCloseDocumentData = this.settleAndCloseDocument;

			this.horizonStore.setReturnScreen(this.navigationContext.current.route, this.horizonIncidentManager.getCurrentNeed());
			this.horizonStore.setScreenDetails(screenDetails);

			this.horizonRouter.navigateToSettleAndCloseSuccess();

		} else {
			this.horizonStore.setScreenDetails(screenDetails);
			this.horizonRouter.navigateToSettleAndCloseFailure();
		}
	}

	_getSECTransferDetails(item) {
		for (let i = 0; i < this.settleAndCloseQuote.savingAccountsList.length; i++) {
			const savAcc = this.settleAndCloseQuote.savingAccountsList[i];
			if (Number(savAcc.accountNumber) === item) {
				return i;
			}
		}
	}

	_getSavingsAccType(code) {
		if (Number(code) === 300) {
			return `Primary`;
		}
		return `Flexible`;
	}

	_errorHandler() {
		this.horizonRouter.navigateToSystemError();
	}

	_preformAction(e) {
		const screenDetails = this.horizonStore.getScreenDetails();

		if (screenDetails?.productType) {
			this._optionClick(e.option, screenDetails?.creditType, screenDetails?.productType, screenDetails?.selectedAccounts, true);
		}
	}

	_setIncidentDone() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_filterChanged(event) {
		this._telemetry.logEvent(CreditEvents.BUDGET_DETAILS_FILTER, {
			"filter-value": event.detail.searchValue
		});
	}

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

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		// TO DO: get ccs status from permission endpoint
		// permissionResultList:[
		// operationIdentifier: "ALL",
		// permissionResult: "Denied",
		// declineReason: "Deceased"
		// ]
		// this.ccsStatus = this.quickTransactionService.permissions();

		this.verificationStatus = this.callerInformation.verificationStatus;

		if (this.verificationStatus === `verified`) {

			this.horizonStore.setCallerInformation(this.callerInformation);

			let returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber, ACCOUNT_STATUS.ACTIVE);
			let successfullServiceResponse = returnValue.succeeded;

			if (!successfullServiceResponse) {
				this.logger.log(`error`, `Failed to retrieve client overview from credit service.`, `_initialise`, returnValue.correlationId);
				this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
				return;
			}

			this.creditAccountDetails = returnValue.result;
			this._formatCreditOverviewResponse();
			this.flexibleCreditAccounts = [...this.creditAccountDetails.creditCardSummaryList, ...this.creditAccountDetails.accessFacilitySummaryList];
			this.fixedTermCreditAccounts = [...this.creditAccountDetails.loanAccountSummaryList];

			if (this.flexibleCreditAccounts.length === 0 && this.fixedTermCreditAccounts.length === 0) {
				this.horizonRouter.navigateToProductInfo(`Credit`);
				return;
			}

			returnValue = await this.creditService.creditBalance(this.callerInformation.cifNumber);
			successfullServiceResponse = returnValue.succeeded;

			if (!successfullServiceResponse) {
				this.logger.log(`error`, `Failed to retrieve client creit balance from credit service.`, `_initialise`, returnValue.correlationId);
			}

			this.creditBalance = returnValue.result;

			if (this.horizonStore.getScreenDetails()?.returningFromScreen === `card-disputes-success-done`) {
				this.horizonStore.clearScreenDetails();
				this.horizonStore.clearReturnScreen();
			} else {
				await super._inicidentManager_(LANDING_PAGE_NEEDS.CREDIT, () => this._toggleBusyFlag());
				await super.createAndClassifySubIncident(null, false);

				// setting inc status to not started for landing page needs
				this._setIncidentNotstarted();
			}
			this._telemetry.startSpan(CreditEvents.CREDIT, {
				"screen": TelemetryScreen.CREDIT_LANDING,
				"credit-active": true
			});
		}

		this.endCallContext = `LandingPage`;

		this._performReturnToScreen();
	}

	_formatCreditOverviewResponse() {
		// TODO: Improve the formatting
		this.creditAccountDetails.creditCardSummaryList.map(item => {
			item.type = PRODUCTS.CREDIT_CARD;
			item.category = CREDIT_TYPE.FLEXIBLE;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.arrearsPayable = item.arrearIndicator ? item.currentBalance : 0;
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);
			item.isClosed = () => item.accountStatusDescription.toLowerCase() === `marked closure`;

			return item;
		});

		this.creditAccountDetails.accessFacilitySummaryList.map(item => {
			item.type = PRODUCTS.ACCESS_FACILITY;
			item.category = CREDIT_TYPE.FLEXIBLE;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.creditAccountDetails.loanAccountSummaryList.map(item => {
			item.type = PRODUCTS.TERM_LOAN;
			item.category = CREDIT_TYPE.FIXED;
			item.productTypeDescription = formatStringAsPascalCase(item.productTypeDescription);
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.repayAmount = formatCurrency(item.repayAmount);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.budgetAccountsSummary = {
			"totalBudgetBalance": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetBalance),
			"totalBudgetInstallmentAmount": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetInstallmentAmount)
		};
	}

	async _transactionHistory(creditType, productType, accountDetails) {

		this._telemetry.logEvent(CreditEvents.CREDIT_TRANSACTION_HISTORY_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": `${productType} Transaction History`,
			"credit-type": creditType,
			"product-type": productType
		});

		this.productType = productType;
		await super.createAndClassifySubIncident(null, false);

		// Transaction history account details are saved for future action - to perform return to screen from Dispute success screen
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.creditType = creditType;
		screenDetails.productType = productType;
		screenDetails.selectedAccounts = accountDetails;
		this.horizonStore.setScreenDetails(screenDetails);

		this._setAccountHeaderDetails(accountDetails);
		this._getTransactionHistory();

	}

	_setAccountHeaderDetails(accountDetails) {
		this.accountDetails = {
			"Credit Type": accountDetails.type,
			"Account number": accountDetails.accountNumber,
			"Balance": formatCurrency(accountDetails.currentBalance),
			"Available balance": formatCurrency(accountDetails.availableCredit),
			"Credit Limit": formatCurrency(accountDetails.creditLimit),
			"Next repayment": formatCurrency(accountDetails.nextRepayment),
			"Status": accountDetails.arrearIndicator ? `In arrears` : formatStringAsPascalCase(accountDetails.accountStatusDescription)
		};
	}

	async _getTransactionHistory(startDate, endDate, startAtIndex) {
		const request = this._getTransactionHistoryRequest(startDate, endDate, startAtIndex);
		const returnValue = await this.creditService.transactionHistory(request);
		if (!returnValue.succeeded || !returnValue.result) {
			this.logger.log(`error`, `Failed to retrieve credit transaction history from credit service.`, `_getTransactionHistory`, returnValue.correlationId);
			return;
		}
		const formattedResponse = this._getFormattedResponse(returnValue.result.transaction);
		this.transactionHistory.push(...formattedResponse);
		this.endCallContext = `TransactionHistory`;
		this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
	}

	_getTransactionHistoryRequest(startDate, endDate, startAtIndex) {
		if (!isNullorEmpty(startDate) && !isNullorEmpty(endDate)) {
			startDate = formatDate(startDate, ISO_8601_DATE_FORMAT);
			endDate = formatDate(endDate, ISO_8601_DATE_FORMAT);
		}

		return {
			"accountNumber": this.accountDetails[`Account number`],
			"startDate": startDate || TRANSACTION_HISTORY.START_DATE,
			"endDate": endDate || TRANSACTION_HISTORY.END_DATE,
			"startAtIndex": startAtIndex || TRANSACTION_HISTORY.START_AT_INDEX,
			"maxResults": TRANSACTION_HISTORY.MAX_RESULTS,
			"moneyType": TRANSACTION_HISTORY.MONEY_TYPE
		};
	}

	_getFormattedResponse(transactions) {
		return transactions.map((item) => {
			const date = new Date(Date.parse(item.processDate));
			const today = new Date();
			const _540thDateFromNow = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 540);

			item.description = item.statementDescription;
			item.tranDate = date;
			item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
			item.formatedAmount = formatCurrency(item.amount);
			item.formatedBalance = formatCurrency(item.balance);
			item.isDomesticWithdrawl = () => item.transactionCode === `4060` && isNullorEmpty(item.currency);
			item.isTranDateOlderThan540 = () => item.tranDate < _540thDateFromNow;
			item.hideDisputeBtn = item.disputeFlag || !this.cardAuthTypesToDispute.includes(item.cardAuthType) || item.isDomesticWithdrawl() || item.isTranDateOlderThan540();
			item.checked = false;
			item.disableCheck = item.hideDisputeBtn;

			return item;
		});
	}

	async _exitTransactionHistory() {
		await super.classifyIncident(() => this._toggleBusyFlag());
		this._setIncidentDone();
	}

	async _unloadTransactionHistory() {
		this.endCallContext = `LandingPage`;
		this.transactionHistory = [];

		// Do not set the incident to done when its card disputes
		if (this.renderMode === RENDER_MODE.DISPUTE_TRANSACTION) {
			return;
		}

		await super.classifyIncident(() => this._toggleBusyFlag());

		this.horizonStore.clearScreenDetails();
		this._setIncidentDone();
	}

	_getStatements(creditType, productType, selectedAccountDetails, sendAnother) {
		if (sendAnother) {
			return true;
		}

		this._telemetry.logEvent(CreditEvents.CREDIT_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_STATEMENTS,
			"credit-type": creditType,
			"product-type": productType
		});

		const productInfo = ACCOUNT_INTCAT_ENUM[selectedAccountDetails.productTypeCode];
		this.clientProducts = [
			{
				'accountNumber': selectedAccountDetails.accountNumber,
				'accountName': selectedAccountDetails.productTypeDescription,
				'accountType': selectedAccountDetails.productTypeCode,
				'accountOpenDate': selectedAccountDetails.openDate,
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

	async _settlementQuote(creditType, productType, selectedAccountDetails) {

		if (this.ccsStatus) {
			this.showCCSmodal = true;
			return;
		}
		await this._telemetry.logEvent(CreditEvents.CREDIT_SETTLEMENT_QUOTE_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG,
			"credit-type": creditType,
			"product-type": productType
		});

		await this._telemetry.startSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE, {});

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.creditType = creditType;
		screenDetails.productType = productType;
		this.horizonStore.setScreenDetails(screenDetails);

		this.selectedTab = creditType;

		this._settlementQuoteDialog([selectedAccountDetails]);
	}

	async _paidUpLetter(selectedAccountDetails) {

		this.horizonStore.setCallerInformation(this.callerInformation);

		const accountNumbers = [];
		accountNumbers.push(selectedAccountDetails.accountNumber);

		const returnValue = await this.creditService.getPaidUpLetter(this.callerInformation.cifNumber, accountNumbers);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve client overview from credit service.`, `_initialise`, returnValue.correlationId);
			this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
			return;
		}

		this.encodedPDFs = returnValue.result;

		this.selectedAccounts.push(selectedAccountDetails);
		this.renderMode = RENDER_MODE.PAID_UP_LETTER;
		this._renderPaidUpLetterView();

	}

	_settleAndClose(creditType, productType, selectedAccountDetails) {
		if (this.ccsStatus) {
			this.showCCSmodal = true;
			return;
		}

		this._telemetry.logEvent(SETTLE_AND_CLOSE[creditType].NEED_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_DISCLAIMER : TelemetryScreen.CREDIT_SETTLE_LOAN_DISCLAIMER,
			"credit-type": creditType,
			"product-type": productType
		});

		this._telemetry.startSpan(SETTLE_AND_CLOSE[creditType].NEED, {});

		this.settleAndCloseDetails = selectedAccountDetails;
		this.productType = this.settleAndCloseDetails.productTypeDescription;
		this.creditType = creditType;
		this.showSettleCloseModal = !this.showSettleCloseModal;
	}

	async _viewBudgets(selectedAccountDetails) {
		this._telemetry.logEvent(CreditEvents.CREDIT_BUDGET_FACILITY, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT
		});

		await super.createAndClassifySubIncident(null, false);

		const request = {
			accountNumber: selectedAccountDetails.accountNumber,
			status: BUDGET_FACILITY.STATUS,
			startDateTime: BUDGET_FACILITY.START_DATE,
			endDateTime: BUDGET_FACILITY.END_DATE
		};

		this.budgetFacilityAccounts = await this.getBudgetFacilities(request);
		this.budgetFacilityAccounts.creditCardNumber = selectedAccountDetails.accountNumber;
		this.budgetFacilityAccounts.productTypeCode = selectedAccountDetails.productTypeCode;

		this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW;
	}

	async getBudgetFacilities(request) {
		const returnValue = await this.creditService.budgetFacility(request);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve client credit card budget details from credit service.`, `_viewBudgets`, returnValue.correlationId);
			return;
		}
		return returnValue.result;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}credit/get-credit-for-all-your-needs/`);

	}

	// Get month name using month as a number (0 = Jan, 1 = Feb,... )
	getMonthName(month) {
		const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
		return monthNames.slice(month)[0];
	}

	_backToLandingPage() {
		const incidentState = this.horizonIncidentManager.incidentState;
		if (incidentState !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.NOT_STARTED;
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _getCreditCardDetails(accountNumber) {
		const returnValue = await this.creditService.creditCardDetails(accountNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger.log(`error`, `Failed to retrieve client credit card details from credit service.`, `_getCreditCardDetails`, returnValue.correlationId);
			return;
		}

		this.creditCardDetails = returnValue.result;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _getAccessFacilityDetails(accountNumber) {
		const returnValue = await this.creditService.accessFacilityDetails(accountNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger(`error`, `Failed to retrieve client access facility details from credit service.`, `_getAccessFacilityDetails`, returnValue.correlationId);
			return;
		}

		this.accessFacilityDetails = returnValue.result;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _getTermLoanDetails(accountNumber) {
		const returnValue = await this.creditService.termLoanDetails(accountNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger.log(`error`, `Failed to retrieve client loan details from credit service.`, `_getTermLoanDetails`, returnValue.correlationId);
			return;
		}

		this.termLoanDetails = returnValue.result;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _exitSettlementQuoteDialog() {
		await this._telemetry.endSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG, {}, true);

		this.horizonStore.clearScreenDetails();
		this._backToLandingPage();
	}

	async _backFromPayBudgetDialog() {
		await this._telemetry.logEvent(CreditEvents.PAY_BUDGET_CANCEL, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT
		});

		this._telemetry.endSpan(CreditEvents.CREDIT_BUDGET_TRANSFER, {});

		const incidentState = this.horizonIncidentManager.incidentState;
		if (incidentState !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.horizonIncidentManager.setCurrentNeed(`view-budgets-credit-card`);
		}

		this.showPayBudgetDialog = !this.showPayBudgetDialog;
	}

	async _settleAndCloseChooseAccount() {
		this._telemetry.logEvent(SETTLE_AND_CLOSE[this.creditType].DISCLAIMER_CONTINUE, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_DISCLAIMER : TelemetryScreen.CREDIT_SETTLE_LOAN_DISCLAIMER,
			"next-screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN
		});

		this.clientProducts = await this._getClientProducts();

		if (this.settleAndCloseDetails.type === `Credit card`) {
			this.settleAndCloseCreditOption = `CreditCard`;
		} else if (this.settleAndCloseDetails.type === `Term Loan`) {
			this.settleAndCloseCreditOption = `Loan`;
		}

		const settleAndCloseQuoteRequest =
		{
			creditType: this.settleAndCloseCreditOption,
			accountNumber: this.settleAndCloseDetails.accountNumber,
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};

		const returnValue = await this.creditService.settleAndCloseQuote(settleAndCloseQuoteRequest);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to retrieve settle and close quote.`, `_settleAndCloseChooseAccount`, returnValue.correlationId);
			return;
		}

		this._telemetry.startSpan(SETTLE_AND_CLOSE[this.creditType].POP_UP, {});

		this.settleAndCloseQuote = returnValue.result;
		this.showSettleCloseModal = !this.showSettleCloseModal;
		const balanceField = this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? `Available balance` : `Credit limit`;
		const balanceFieldValue = this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? this.settleAndCloseDetails.availableCredit : this.settleAndCloseDetails.creditLimit;

		this.settleAndCloseDetails = {
			header: this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? `Settle And Close` : `Settle Loan`,
			[this.settleAndCloseDetails.productTypeDescription]: this.settleAndCloseDetails.accountNumber,
			[balanceField]: balanceFieldValue,
			'Outstanding balance': this.settleAndCloseDetails.currentBalance,
			'Settlement amount': formatCurrency(this.settleAndCloseQuote.settlementAmount),
			settlementAmount: this.settleAndCloseQuote.settlementAmount,
			action: this.settleAndCloseDetails.type === PRODUCTS.CREDIT_CARD && this.settleAndCloseQuote.settlementAmount < 0 ? `Transfer To Account` : `Settle from account`
		};

		if (this.settleAndCloseCreditOption === `CreditCard`) {
			this.settleAndCloseDetails[`Interest not capitalised`] = formatCurrency(this.settleAndCloseQuote.interestNotCapatalised);
			this.settleAndCloseDetails[`Expected interest and fees`] = formatCurrency(this.settleAndCloseQuote.expectedInterestFees);

			// As per CSCEH-10637, when settlement amount is negative then Primary savings acc is defaulted
			if (this.settleAndCloseQuote.settlementAmount < 0) {
				this.clientProducts = this.clientProducts.filter(p => p.accountType === ACCOUNT_TYPE_CODE.PRIMARY_SAVINGS);
			}
		}

		this.renderMode = RENDER_MODE.SETTLE_AND_CLOSE;

	}

	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};

		const returnValue = await this.savingsService.getClientProducts(request);

		if (returnValue.succeeded && returnValue.result.savingsProducts) {

			const clientProducts = returnValue.result.savingsProducts
				.filter(item => FROM_ACCOUNTS_LIST.includes(item.accountType))
				.map(item => {
					const productInfo = ACCOUNT_INTCAT_ENUM[item.accountType][item.interestCategory] ||
						ACCOUNT_INTCAT_ENUM[item.accountType];

					return {
						'accountNumber': item.accountNumber,
						'accountName': formatStringAsPascalCase(item.accountName),
						'availableBalance': formatCurrency(item.availableBalance),
						'accountType': item.accountType,
						'icon': productInfo.icon,
						'customIcon': productInfo.customIcon,
						'order': productInfo.order
					};
				})
				.sort((x, y) => x.order - y.order);

			return clientProducts;
		}
	}

	_backFromBudgetAccountDetails() {
		this._telemetry.logEvent(CreditEvents.BUDGET_ACCOUNT_DETAILS_CLOSE, {
			"screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT
		});

		this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW;
	}

	_backFromBudgetAccountsView() {
		this._telemetry.logEvent(CreditEvents.CREDIT_BUDGET_DETAILS_BACK, {});
		this._telemetry.endSpan(CreditEvents.CREDIT_BUDGET_DETAILS, {});

		// Making sure budget status is not carry forworded and on load only Active budgets are seen 
		this.budgetStatus = ``;
		this._setIncidentDone();
	}

	async _closeSettleCloseDisclaimer() {
		await this._telemetry.logEvent(SETTLE_AND_CLOSE[this.creditType].DISCLAIMER_CANCEL, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_DISCLAIMER : TelemetryScreen.CREDIT_SETTLE_LOAN_DISCLAIMER,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this.showSettleCloseModal = !this.showSettleCloseModal;

		this._telemetry.endSpan(SETTLE_AND_CLOSE[this.creditType].NEED, {});
	}

	async _exitSettleAndCloseDialog() {
		await this._telemetry.logEvent(SETTLE_AND_CLOSE[this.creditType].POP_UP_CANCEL, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(SETTLE_AND_CLOSE[this.creditType].POP_UP, {}, true, true);

		this._backToLandingPage();
	}

	async _settleAndCloseConfirmTelemetry(isSuccess, fromAccountNumber, accountNumber) {
		let nextScreen = ``;
		const screen = this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN;

		if (isSuccess) {
			nextScreen = this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_SUCCESS : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN_SUCCESS;
		} else {
			nextScreen = this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_FAILURE : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN_FAILURE;
		}

		await this._telemetry.logEvent(SETTLE_AND_CLOSE[this.creditType].POP_UP_CONFIRM, {
			"screen": screen,
			"next-screen": nextScreen,
			"account-number": fromAccountNumber,
			"from-account-number": accountNumber
		});

		this._telemetry.endSpan(SETTLE_AND_CLOSE[this.creditType].POP_UP, {});
	}

	// Tooltip is displayed by hovering on description only when description field is too long and is partially hidden
	_displayTooltip(e) {

		if (e.target.scrollWidth > e.target.offsetWidth) {
			this.showTooltip = true;
		}
	}

	async _canOpenBudget() {
		const returnValue = await this.creditService.canOpenBudget(this.ccAccNumber);

		await this._telemetry.logEvent(CreditEvents.CREDIT_BUDGET_DETAILS_OPEN, {
			canAdd: !returnValue.succeeded ? false : returnValue.result?.canAdd,
			declineReason: !returnValue.succeeded ? `System error` : returnValue.result?.declineReason
		});
		return returnValue;
	}

	async _openBudgetDialog() {
		await this._telemetry.startSpan(CreditEvents.OPEN_BUDGET);
		await this._telemetry.startSpan(CreditEvents.OPEN_BUDGET_POPUP);
		this.renderMode = RENDER_MODE.OPEN_BUDGET;
	}

	async _calculateBudget(ccAccNumber, budgetAmount) {
		const amountInCents = budgetAmount * 100;
		const returnValue = await this.creditService.calculateBudget(ccAccNumber, amountInCents, () => true);
		return returnValue;
	}

	async _confirmOpenBudget(event) {
		const openBudgetRequest = {
			creditCardAccountNumber: this.ccAccNumber,
			amount: event.detail.budgetAmount * 100,
			term: event.detail.selectedTermInfo.term,
			narrative: event.detail.budgetName
		};

		await this._telemetry.logEvent(CreditEvents.OPEN_BUDGET_POPUP_CONFIRM, openBudgetRequest);
		await this._telemetry.endSpan(CreditEvents.OPEN_BUDGET_POPUP);

		const returnValue = await this.creditService.openBudget(openBudgetRequest, () => true);
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.narrative = event.detail.budgetName;
		screenDetails.budgetAmount = event.detail.budgetAmount;
		screenDetails.term = event.detail.selectedTermInfo.term;
		screenDetails.instalment = event.detail.selectedTermInfo.instalment;

		this.horizonStore.setScreenDetails(screenDetails);

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToOpenBudgetSuccess();
		} else {
			this.horizonRouter.navigateToOpenBudgetFailure();
		}
	}

	async _cancelOpenBudget() {
		await this._telemetry.logEvent(CreditEvents.OPEN_BUDGET_POPUP_CANCEL);
		await this._telemetry.endSpan(CreditEvents.OPEN_BUDGET_POPUP, null, true, true);
		this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW;
	}

	async _cardDisputeTransaction(item) {
		this.tranToDispute = this.transactionHistory.filter(t => t.checked);

		this._telemetry.logEvent(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE_CLICK, {
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
			"agentId": `${this.securityContext.username}`
		};
		const returnValue = await this.creditService.getFirstQuestion(request);
		return returnValue;
	}

	async _getNextQusToDispute(request) {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE_NEXT, {
			cueSheetId: request.cueSheetId,
			caseId: request.caseId,
			answerId: request.answerId
		});

		const returnValue = await this.creditService.getNextQuestion(request, () => true);
		this.disputeQuestion = returnValue.result;

		return returnValue;
	}

	async _cancelDisputeTrans() {
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE_CANCEL);
		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE);

		this.disputeQuestion = {};
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.NOT_STARTED;
		this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
	}

	async _disputeOutcome(event) {
		await this.horizonIncidentManager.createAndClassifySubIncident(this._toggleBusyFlag);
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE_CONFIRM, {
			disputeLogged: event.detail.disputed
		});

		this.disputeQuestion = {};
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.clientAnswerWording = event.detail.clientAnswerWording;
		screenDetails.agentAnswerWording = event.detail.agentAnswerWording;

		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `transaction-history`);

		this.horizonRouter.navigateToDisputesSuccess();
	}

	async _restartDispute() {
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE_RESTART);

		const returnValue = await this._getFirstQusToDispute();
		return returnValue;
	}

	_disputeTran() {
		this._optionClick(`card-disputes`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, this.ccDetails);
	}

	_disableActionBtn(need, productType) {
		const disableByRole = this._shouldDisableByRole(need);
		return !productType
			? disableByRole
			: disableByRole || this._disableByCCStatus(need, productType);
	}

	_disableByCCStatus(need, productType) {
		return CC_CLOSED_STATUS_DISABLE_NEEDS.includes(need) &&
			productType === PRODUCTS.CREDIT_CARD &&
			this.ccDetails.isClosed();
	}

	_getTooltipMsg(need, productType) {
		return this._getTooltipMessage(need) || this._getTooltipMessageByCCStatus(need, productType);
	}

	_getTooltipMessageByCCStatus(need, productType) {
		const actions = {
			'settle-close': `settle and close`,
			'settlement-quote': `settlement quote`
		};
		const msg = TOOLTIP_CLOSED_CC_STATUS.replace(`{0}`, actions[need]);

		return this._disableByCCStatus(need, productType) ? msg : ``;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.error-msg {
					width: auto;
					height: 66px;
					font-family: "Hind Vadodara";
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					text-align: center;
				}
				.error-msg > p {
					margin-top: 23px;
				}
				horizon-service-call-error-screen {
					--horizon-service-call-error-screen-height: 888px;
					--horizon-service-call-error-screen-header-margin-top: 36px;
					--horizon-service-call-error-screen-img-height: 182px;
					--horizon-service-call-error-screen-img-width: 252px;
					--theme-layout-gap-spacing: 0px;
					--theme-alert-banner-height: 48px;
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
			${this._renderCreditServiceUnavailable()}
			${this._renderLandingPage()}
			${this._renderBudgetFacilityAccounts()}
			${this._renderBudgetAccountDetails()}
			${this._renderCreditCardDetailsView()}
			${this._renderAccessFacilityDetailsView()}
			${this._renderTermLoanDetailsView()}
			${this._renderStatements()}
			${this._renderPayBudgetDialog()}
			${this._renderSettlementQuoteDialog()}
			${this._renderCcsModal()}
			${this._renderSettleAndCloseEmailConfirmation()}
			${this._renderSettleLoanEmailConfirmation()}
			${this._renderSettleCloseDisclaimer()}
			${this._renderSettleAndCloseDialog()}
			${this._renderPaidUpLetterView()}
			${this._renderPendingClosure()}
			${this._renderPayBudgetWarning()}
			${this._renderTransactionHistory()}
			${this._renderDisputeTransModal()}
			${this._renderOpenBudget()}
		`;
	}

	_renderCreditServiceUnavailable() {
		return this.renderMode === RENDER_MODE.SERVICE_UNAVAILABLE
			? html`
				<horizon-service-call-error-screen
					bannerDetail="Credit is currently unavailable" 
					image="/images/common/service-error.svg"
					header="Credit currently unavailable"
					right="Find a Branch"
					@right-click=${() => this._findBranchClick()}>
						<section
							class="error-msg"
							slot="detail">
								<p>We are experiencing technical difficulties.
									<br> We are sorry for the inconvenience and aim to have it resolved soon.</p>
									<p><strong>For any urgent matters, access Credit on our app or visit a branch.</strong></p>
						</section>
				</horizon-service-call-error-screen>`
			: html``;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE ||
			this.renderMode === RENDER_MODE.STATEMENTS ||
			this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_DIALOG ||
			this.renderMode === RENDER_MODE.SETTLE_AND_CLOSE
			? html`
				${this._renderCreditVerifiedLandingPage()}
				${this._renderCreditUnverifiedLandingPage()}`
			: html``;
	}

	_renderCreditVerifiedLandingPage() {
		return this.verificationStatus === `verified`
			? html`
				<capitec-pc-credit-account
					.flexibleCreditAccounts="${this.flexibleCreditAccounts}"
					.fixedTermCreditAccounts="${this.fixedTermCreditAccounts}"
					.budgetAccountsSummary="${this.budgetAccountsSummary}"
					.shouldDisableByRole="${(need, productType = null) => this._disableActionBtn(need, productType)}"
					.showTooltip="${need => this._showTooltip(need)}"
					.renderAlertBanner="${() => this.renderAlertBanner()}"
					.getTooltipMessage="${(need, productType = null) => this._getTooltipMsg(need, productType)}"
					?isCapitecConnectAgent="${this.roleManager.isCapitecConnectAgent}"
					selectedTab="${this.selectedTab}"
					@option-click="${(e) => this._optionClick(e.detail.option, e.detail.creditType, e.detail.productType, e.detail.selectedAccountDetails)}"
					@account-details="${(e) => this._accountDetails(e)}"
					@product-enquiry="${() => this._productEnquiry()}"
					@view-info="${() => this._viewInfo()}">
				</capitec-pc-credit-account>`
			: html``;
	}

	_renderCreditUnverifiedLandingPage() {
		return this.verificationStatus === `unverified`
			? html`
				<capitec-pc-credit-unverified-landing
					@verify-now= "${() => this._verifyNowClick()}">
				</capitec-pc-credit-unverified-landing>`
			: html``;
	}

	_renderBudgetFacilityAccounts() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNTS_VIEW ||
			this.renderMode === RENDER_MODE.OPEN_BUDGET
			? html`
				<capitec-pc-budget-facility-accounts
					.budgetFacilityAccounts="${this.budgetFacilityAccounts}"
					.shouldDisable="${need => this._shouldDisable(need)}"
					.renderAlertBanner="${() => this.renderAlertBanner()}"
					.canOpenBudgetAccount=${() => this._canOpenBudget()}
					.getArrearsPayable=${() => this.ccDetails?.arrearsPayable}
					.getBudgetFacilities="${(request) => this.getBudgetFacilities(request)}"
					budgetStatus="${this.budgetStatus}"
					@on-loading="${() => this._telemetry.startSpan(CreditEvents.CREDIT_BUDGET_DETAILS, {})}"
					@back="${() => this._backFromBudgetAccountsView()}"
					@account-details="${(event) => this._viewBudgetDetails(event.detail.selectedAccountDetails)}"
					@transfer-click="${(event) => this._transferFromBudgetAccounts(event.detail.selectedAccountDetails)}"
					@fiter-changed="${(event) => this._filterChanged(event)}"
					@open-budget-click="${() => this._optionClick(`open-budget`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, this.ccDetails)}">
				</capitec-pc-budget-facility-accounts>`
			: html``;
	}

	_renderBudgetAccountDetails() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNT_DETAILS
			? html`
			<capitec-pc-budget-account-details
				.accountDetails="${this.budgetAccountDetails}"
				.shouldDisable="${need => this._shouldDisable(need)}"
				.renderAlertBanner="${() => this.renderAlertBanner()}"
				@back="${() => this._backFromBudgetAccountDetails()}"
				@transfer-click="${(event) => this._transferFromBudgetDetails(event.detail.budgetSequenceNo)}">
			</capitec-pc-budget-account-details>`
			: html``;
	}

	_renderPayBudgetDialog() {
		return this.showPayBudgetDialog
			? html`
				<capitec-pc-pay-budget-dialog
					.budgetAccountDetails="${this.payBudgetAccountDetails}"
					.clientProducts="${this.clientProducts}"
					.payBudgetfromAccounts="${this.payBudgetfromAccounts}"
					@on-loading="${() => this._telemetry.startSpan(CreditEvents.PAY_BUDGET_MODAL, {})}"
					@on-unloading="${() => this._telemetry.endSpan(CreditEvents.PAY_BUDGET_MODAL, {})}"
					@cancel="${() => this._backFromPayBudgetDialog()}"
					@transfer="${(e) => this._confirmPayBudget(e.detail)}">
				</capitec-pc-pay-budget-dialog>`
			: html``;
	}

	_renderCreditCardDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
			this.accountViewType === PRODUCTS.CREDIT_CARD
			? html`
				<horizon-credit-card-details-view
					.creditCardDetails="${this.creditCardDetails}"
					@back="${() => this._backFromAccountDetails()}">
				</horizon-credit-card-details-view>`
			: html``;
	}

	_renderAccessFacilityDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
			this.accountViewType === PRODUCTS.ACCESS_FACILITY
			? html`
				<horizon-access-facility-details-view
					.accessFacilityDetails="${this.accessFacilityDetails}"
					@back="${() => this._backFromAccountDetails()}">
				</horizon-access-facility-details-view>`
			: html``;
	}

	_renderTermLoanDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
			this.accountViewType === PRODUCTS.TERM_LOAN
			? html`
				<horizon-term-loan-details-view
					.termLoanDetails="${this.termLoanDetails}"
					@back="${() => this._backFromAccountDetails()}">
				</horizon-term-loan-details-view>`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
			<horizon-statements
				.cifNumber="${this.callerInformation.cifNumber}"
				.title="${this.callerInformation.title}"
				.lastName="${this.callerInformation.lastName}"
				.clientProducts="${this.clientProducts}"
				type="${ACCOUNT_TYPES.CREDIT}"
				registeredEmailId="${this.callerInformation.emailId}"
				.navigatePDF="${(currPage) => this._navigatePDF(currPage)}"
				@cancel="${() => this._backToLandingPage()}">
			</horizon-statements>`
			: html``;
	}

	_renderSettleCloseDisclaimer() {
		return this.showSettleCloseModal
			? html`
			<horizon-settle-n-close-disclaimer
				.productType="${this.productType}"
				.creditType="${this.creditType}"
				@cancel="${() => this._closeSettleCloseDisclaimer()}"
				@continue="${() => this._settleAndCloseChooseAccount()}">
			</horizon-settle-n-close-disclaimer>`
			: html``;
	}

	_renderSettleAndCloseEmailConfirmation() {
		// TODO: Remove mock once CS integration is complete
		const mockDocuments = [
			{
				title: `Credit Card`,
				subtitle: `Proof of transfer`
			}
		];

		return this.renderMode === RENDER_MODE.VIEW_AND_SEND_SETTLE_AND_CLOSE_POP ? html`
			<horizon-view-and-send-document
				modalHeader="Settle and Close: Proof of Payment" 
				.documents="${mockDocuments}"
				.loadDocumentContent="${this._loadSettleAndClosePOPDocument}"
				@send-pdf-click="${(e) => this._onSendSettleAndClosePOP(e.documents, e.email)}"
				@cancel-send-pdf-click="${() => this._onCancelSendSettleAndClosePOP()}">
			</horizon-view-and-send-document>
		` : html``;
	}

	_renderSettleLoanEmailConfirmation() {

		return this.renderMode === RENDER_MODE.VIEW_AND_SEND_SETTLE_LOAN_POP ? html`
			<horizon-view-and-send-document
				modalHeader="Settle Loan: Proof of Payment"
				.loadDocumentContent="${this._loadSettleLoanPOPDocument}"
				@send-pdf-click="${(e) => this._onSendSettleLoanPOP(e.documents, e.email)}"
				@cancel-send-pdf-click="${() => this._onCancelSendSettleLoanPOP()}">
			</horizon-view-and-send-document>
		` : html``;
	}

	_renderSettleAndCloseDialog() {
		return this.renderMode === RENDER_MODE.SETTLE_AND_CLOSE
			? html`
			<horizon-settle-and-close-dialog 
				.settleAndCloseDetails="${this.settleAndCloseDetails}"
				.settleAndCloseQuote="${this.settleAndCloseQuote}"
				.clientProducts="${this.clientProducts}"
				@cancel="${() => this._exitSettleAndCloseDialog()}"
				@settle-and-close="${(e) => this._confirmSettleAndClose(e)}">
			</horizon-settle-and-close-dialog>`
			: html``;
	}

	_renderPaidUpLetterView() {
		return this.renderMode === RENDER_MODE.PAID_UP_LETTER
			? html`
		<horizon-paid-up-letter-dialog
			.landingPageInfo="${this.landingPageInfo}"
			.selectedAccounts="${this.selectedAccounts}"
			.encodedPDFs="${this.encodedPDFs}"
			registeredEmailId="${this.callerInformation.emailId}"
			@cancel="${() => this._backToLandingPage()}"
			.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
		</horizon-paid-up-letter-dialog>`
			: html``;
	}

	_renderPendingClosure() {
		return this.declineReason === PERMISSION_DECLINE_REASONS.ACC_NOT_ACTIVE
			? html`
			<horizon-warn-dialog
				content="Your ${PRODUCT_TYPE[this.selectedAccountDetails.productTypeCode].toLowerCase()} account was settled and is pending closure."
				@on-okay="${() => this.declineReason = ``}">
			</horizon-warn-dialog>`
			: html``;
	}

	_renderPayBudgetWarning() {
		return this.showPayBudgetWarning
			? html`
			<horizon-warn-dialog
				content="Your Credit Card account is in arrears, make payment before paying your budget facility account"
				@on-okay="${() => this.showPayBudgetWarning = !this.showPayBudgetWarning}">
			</horizon-warn-dialog>`
			: html``;
	}

	_renderTransactionHistory() {
		if (this.renderMode === RENDER_MODE.TRANSACTION_HISTORY || this.renderMode === RENDER_MODE.DISPUTE_TRANSACTION) {

			return html`
			<horizon-transaction-history
				.transactionHistory = "${this.transactionHistory}"
				.accountDetails = "${this.accountDetails}"
				.type = "${ACCOUNT_TYPES.CREDIT}"
				.renderTableColumns = "${() => this._renderColumns()}"
				.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
				.getTransactionHistory="${(startDate, endDate, startAtIndex) => this._getTransactionHistory(startDate, endDate, startAtIndex)}"
				.disposeData="${() => this.transactionHistory = []}"
				.product="${this.productType}"
				
				@error-handler = "${() => this._errorHandler()}"
				@back="${() => this._exitTransactionHistory()}"
				@unloading="${() => this._unloadTransactionHistory()}"
				@select-all="${(e) => this._transactionSelectAll(e)}"
				@dispute-transactions="${() => this._disputeTran()}">

			</horizon-transaction-history>

		`;
		}

	}

	_renderColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="checked"
				.renderer="${(item, fieldName, value) => this._renderCheckbox(item, fieldName, value)}"
				size="170px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="statementDescription"
				type="string"
				size="150x;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				type="string"
				size="100px;">
			</capitec-table-column>
			<capitec-table-column
				label="Available Balance"
				field="formatedBalance"
				type="string"
				size="140px;">
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

	_renderTransactionDetails(item) {
		const telemetryEvents = TRANSACTION_ENQUIRY_EVENTS(this.productType);
		this._telemetry.logEvent(telemetryEvents.TRANSACTION_HISTORY_INFO, {});

		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Transaction details"
				data-automation-id="credit-transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.spendGroup || `-`}"
					data-automation-id="credit-transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount || `-`}"
					data-automation-id="credit-transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${formatDate(item.postingDate, `dd mmm yyyy`)}"
					data-automation-id="credit-transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${formatDate(item.processDate, `dd mmm yyyy`)}"
					data-automation-id="credit-transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode || `-`}"
					data-automation-id="credit-transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber || `-`}"
					data-automation-id="credit-transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType || `-`}"
					data-automation-id="credit-transaction-history-item-card-auth-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber || `-`}"
					data-automation-id="credit-transaction-history-item-journal-number">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="credit-transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId || `-`}"
					data-automation-id="credit-transaction-history-item-terminalID">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				${this._renderTooltipLabel(`Description`, item.statementDescription)}

				${this._renderTooltipLabel(`Long Description`, item.statementDescription)}
			</capitec-group>
			${this._renderDispute(item)}
		`;
	}

	_renderTooltipLabel(name, value) {
		let stylings = TABLE_EXPANDER_CELL.firstcolumn;
		if (name === `Long Description`) {
			stylings = TABLE_EXPANDER_CELL.expanderColumns;
		}
		return html`
			<capitec-group 
				data-automation-id="transaction-history-item-description"
				style="${unsafeCSS(stylings).toString()}"
				layout="vertical" 
				gap="none" 
				halign="left" 
				valign="center">
					<capitec-label 
						style="${unsafeCSS(TABLE_EXPANDER_CELL.labelText).toString()}" 
						label="${name}">
					</capitec-label>
					<capitec-label 
						style="display: ${this.showTooltip ? `none` : `block`}; ${unsafeCSS(TABLE_EXPANDER_CELL.labelValue).toString()}"
						label="${value || `-`}"
						@mouseover="${(e) => this._displayTooltip(e)}">
					</capitec-label>
					<capitec-tooltip 
						data-automation-id="transaction-history-item-description-tooltip"
						style="display: ${this.showTooltip ? `block` : `none`}; ${unsafeCSS(TABLE_EXPANDER_CELL.toolTip).toString()}"
						message="${value}" 
						@mouseout = "${() => this.showTooltip = false}"
						position="bottom">
						<capitec-label 
							style="${unsafeCSS(TABLE_EXPANDER_CELL.labelValue)} display: block;" 
							label="${value}">
						</capitec-label>
				</capitec-tooltip>
			</capitec-group>`;
	}

	_renderOpenBudget() {
		return this.renderMode === RENDER_MODE.OPEN_BUDGET
			? html`
			<capitec-pc-open-budget-facility
				ccAccNumber="${this.ccAccNumber}"
				revolvingBalance="${this.budgetFacilityAccounts.revolvingBalance}"
				.calculateBudget="${(ccAccNumber, budgetAmount) => this._calculateBudget(ccAccNumber, budgetAmount)}"
				@cancel="${() => this._cancelOpenBudget()}"
				@add-budget="${(event) => this._confirmOpenBudget(event)}">
			</capitec-pc-open-budget-facility>`
			: html``;
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
					@click="${() => this._disputeTran(item)}"
					?hidden="${true}">
				</capitec-button>
			</capitec-group>
		`;
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
				@loading="${() => this._telemetry.startSpan(TRANSACTION_ENQUIRY_DISPUTE_EVENTS.TRANSACTION_HISTORY_DISPUTE)}">
			</horizon-disputes>`
			: html``;
	}
}

customElements.define(`horizon-credit-account`, CreditAccount);