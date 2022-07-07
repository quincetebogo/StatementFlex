import { ACCOUNT_STATUS, CREDIT_TYPE, DECLINE_REASONS_EXCLUSION_LIST, FROM_ACCOUNTS, FROM_ACCOUNTS_LIST, PERMISSION_DECLINE_REASONS, PERMISSION_STATUS, PRODUCTS } from 'app/constants/Credit';
import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { Configuration, EventAggregator, NavigationContext } from 'platform/core';
import { CreditEvents, SETTLEMENT_QUOTE_EVENTS, SETTLE_AND_CLOSE } from 'app/constants/telemetry/events/Credit';
import { css, html } from 'platform/elements';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { CreditService } from 'app/services/CreditService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { creditMixin } from 'app/views/credit/CreditMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';

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
import 'app/productControls/credit/src/PayCreditCardBudget';
import 'app/components/dialogs/common/ViewAndEmailDocuments';
import 'app/dialogs/credit/SettleAndCloseDialog';

/** Credit Account View
 * 
 * @export
 * @class CreditAccount
 * @extends {CreditAccount}
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
		this.productSelected = null;
		this.settleAndCloseDocument = ``;
		this.showSettleCloseModal = false;
		this.settlementQuoteEvents = SETTLEMENT_QUOTE_EVENTS;
		this.declineReason = ``;
		this.selectedAccountDetails = {};

		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
		this.returnToScreen = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._preformAction(e));
		
		Object.assign(CreditAccount.prototype, creditMixin);
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
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
			declineReason: { state: false }
		};
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

	async _optionClick(option, creditType, productType, selectedAccountDetails) {

		const transactionHistory = () => this._transactionHistory(creditType, productType);
		const statements = () => this._getStatements(creditType, productType, selectedAccountDetails.productTypeCode, selectedAccountDetails.accountNumber, selectedAccountDetails.openDate);
		const settlementQuote = () => this._settlementQuote(creditType, productType, selectedAccountDetails);
		const settleAndClose = () => this._settleAndClose(creditType, productType, selectedAccountDetails);
		const paidUpLetter = () => this._paidUpLetter(selectedAccountDetails);
		const payBudget = () => this._payBudgetDialog(selectedAccountDetails);
		const viewBudgets = () => this._viewBudgets(selectedAccountDetails);

		const accConfig = ACCOUNT_INTCAT_ENUM[selectedAccountDetails.productTypeCode];
		const actions = {
			'view-budgets': viewBudgets,
			'pay-budget': payBudget,
			'transaction-history': transactionHistory,
			'statements': statements,
			'settlement-quote': settlementQuote,
			'paid-up-letter': paidUpLetter,
			'settle-close': settleAndClose
		};

		if (actions[option]) {
			
			const clientNeed = `${option}-${accConfig.subCategory}`;
			
			await super._inicidentManager_(clientNeed, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();

			const { permissionResult, declineReasons } = await this._checkCreditPermisions(option, this.callerInformation.cifNumber, selectedAccountDetails.accountNumber || selectedAccountDetails.budgetAccountNumber, productType);
			this.ccsStatus = permissionResult === PERMISSION_STATUS.DENIED &&
							 !DECLINE_REASONS_EXCLUSION_LIST.includes(declineReasons);
			this.declineReason = declineReasons;
			this.selectedAccountDetails = selectedAccountDetails;

			// Perform the action only when permission result is granted
			if (permissionResult === PERMISSION_STATUS.GRANTED) {
				return actions[option]();
			}
		}
	};

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
		await super.createAndClassifySubsIncident(null, false);
		
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

		this.budgetAccountDetails = {
			budgetAccountNumber: selectedAccountDetails.budgetAccountNumber,
			budgetName: formatStringAsPascalCase(selectedAccountDetails.budgetName),
			"Monthly repayment": formatCurrency(selectedAccountDetails.budgetInstalment),
			"Purchase amount": formatCurrency(selectedAccountDetails.originalAmount),
			"Outstanding balance": formatCurrency(selectedAccountDetails.budgetBalance),
			"Opening date": this._formatDate(selectedAccountDetails.budgetDateTaken),
			"Interest rate": `${selectedAccountDetails.interestRate}%`,
			"Term (months)": selectedAccountDetails.originalTerm,
			"Payment made": formatCurrency(selectedAccountDetails.repaymentAmount),
			"Settlement amount": formatCurrency(selectedAccountDetails.settlementAmount),
			"Remaining term (months)": selectedAccountDetails.termRemaining
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

	_transferFromBudgetDetails(budgetAccountNo) {
		this._telemetry.logEvent(CreditEvents.BUDGET_ACCOUNT_DETAILS_TRANSFER, {
			"screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL
		});

		const budgetAcc = this.budgetFacilityAccounts.creditCardBudgetList.find(item => item.budgetAccountNumber === budgetAccountNo);
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
			return;
		}

		await this._telemetry.startSpan(CreditEvents.CREDIT_BUDGET_TRANSFER, {});

		this._formatFromAccounts(returnValue.result.fromAccounts);
		this.payBudgetAccountDetails = selectedAccountDetails;
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
				idNumber: this.callerInformation.southAfricanIDNumber
		};
	
		const returnValue = await this.creditService.settleAndClose(settleAndClose);

		await this._settleAndCloseConfirmTelemetry(returnValue.succeeded, this.settleAndCloseQuote.savingAccountsList[selectedAccountIndex].accountNumber, this.settleAndCloseQuote.accountNumber);
		
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.settleAndCloseCreditType = this.creditType;
		screenDetails.settleAndCloseProductType = this.settleAndCloseCreditOption;
		screenDetails.settleAndCloseCreditOption = this.settleAndCloseCreditOption;
		screenDetails.settleAndCloseAccountNumber = this.settleAndCloseQuote.accountNumber;
		screenDetails.accountName = Object.keys(this.settleAndCloseDetails).find(key => this.settleAndCloseDetails[key] === this.settleAndCloseQuote.accountNumber);

		if (returnValue.succeeded) {
			
			this.settleAndCloseDocument = returnValue.result.documentData;
			screenDetails.settleAndCloseDocumentData = this.settleAndCloseDocument;
			
			this.horizonStore.setReturnScreen(this.navigationContext.current.route, this.incidentDetails.currentNeed);
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
			this._optionClick(e.option, screenDetails?.creditType, screenDetails?.productType, screenDetails?.selectedAccounts);
		}
	}

	_setIncidentDone() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_filterChanged(event) {
		this._telemetry.logEvent(CreditEvents.BUDGET_DETAILS_FILTER, {
			"filter-value": event.detail.searchValue
		});
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

			await super._inicidentManager_(LANDING_PAGE_NEEDS.CREDIT, () => this._toggleBusyFlag());
			await super.createAndClassifySubsIncident(null, false);
		
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
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

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

	_transactionHistory(creditType, productType) {
		// TO DO: Place holder for credit transaction history flow.

		this._telemetry.logEvent(CreditEvents.CREDIT_TRANSACTION_HISTORY_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_TRANSACTION_HISTORY,
			"credit-type": creditType,
			"product-type": productType
		});

		// TO DO: Uncomment the below line to have STrack incident logging when implemented Trasnaction History
		// when coming back from transaction history screen, set incident as done "_setIncidentDone()"".
		// await super.createAndClassifySubsIncident();
	}

	_getStatements(creditType, productType, productCode, accNum, openDate) {
		
		this._telemetry.logEvent(CreditEvents.CREDIT_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_STATEMENTS,
			"credit-type": creditType,
			"product-type": productType
		});

		const productInfo = ACCOUNT_INTCAT_ENUM[productCode];
		this.clientProducts = [
			{
				'accountNumber': accNum,
				'accountName': productInfo.name,
				'accountType': productCode,
				'accountOpenDate': openDate,
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

		await super.createAndClassifySubsIncident(null, false);

		const returnValue = await this.creditService.budgetFacility(selectedAccountDetails.accountNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger.log(`error`, `Failed to retrieve client credit card budget details from credit service.`, `_viewBudgets`, returnValue.correlationId);
			return;
		}

		this.budgetFacilityAccounts = returnValue.result;
		this.budgetFacilityAccounts.creditCardNumber = selectedAccountDetails.accountNumber;
		this.budgetFacilityAccounts.productTypeCode = selectedAccountDetails.productTypeCode;
		
		this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}credit/get-credit-for-all-your-needs/`);

	}

	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${this.getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	// Get month name using month as a number (0 = Jan, 1 = Feb,... )
	getMonthName(month) {
		const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
		return monthNames.slice(month)[0];
	}

	_backToLandingPage() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
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

		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.currentNeed = `view-budgets-credit-card`;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
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
			'Settlement amount': formatCurrency(this.settleAndCloseQuote.settlementAmount)
		};

		if (this.settleAndCloseCreditOption === `CreditCard`) {
			this.settleAndCloseDetails[`Interest not capitalised`] = formatCurrency(this.settleAndCloseQuote.interestNotCapatalised);
			this.settleAndCloseDetails[`Expected interest and fees`] = formatCurrency(this.settleAndCloseQuote.expectedInterestFees);
		}

		this.renderMode = RENDER_MODE.SETTLE_AND_CLOSE;
	
	}

	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
	
		const returnValue = await this.quickTransactionService.getClientProducts(request);
		
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
			${this._renderPaidUpLetterView()}}
			${this._renderPendingClosure()}
		`;
	}

	_renderCreditServiceUnavailable() {
		return this.renderMode === RENDER_MODE.SERVICE_UNAVAILABLE
			? html`
				<horizon-service-call-error-screen
					bannerDetail="Credit is currently unavailable" 
					image="/images/service-error.svg"
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
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNTS_VIEW
			? html`
				<capitec-pc-budget-facility-accounts
					.budgetFacilityAccounts="${this.budgetFacilityAccounts}"
					@on-loading="${() => this._telemetry.startSpan(CreditEvents.CREDIT_BUDGET_DETAILS, {})}"
					@back="${() => this._backFromBudgetAccountsView()}"
					@account-details="${(event) => this._viewBudgetDetails(event.detail.selectedAccountDetails)}"
					@transfer-click="${(event) => this._transferFromBudgetAccounts(event.detail.selectedAccountDetails)}"
					@fiter-changed="${(event) => this._filterChanged(event)}">
				</capitec-pc-budget-facility-accounts>`
			: html``;
	}

	_renderBudgetAccountDetails() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNT_DETAILS
		? html`
			<capitec-pc-budget-account-details
				.accountDetails="${this.budgetAccountDetails}"
				@back="${() => this._backFromBudgetAccountDetails()}"
				@transfer-click="${(event) => this._transferFromBudgetDetails(event.detail.budgetAccountNumber)}">
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
				content="Your ${this.selectedAccountDetails.type.toLowerCase()} account was settled and is pending closure."
				@on-okay="${() => this.declineReason = ``}">
			</horizon-warn-dialog>`
		: html``;
	}
}

customElements.define(`horizon-credit-account`, CreditAccount);