import { CREDIT_TYPE, FROM_ACCOUNTS_LIST, PRODUCTS } from 'app/constants/Credit';
import { Configuration, EventAggregator, NavigationContext } from 'platform/core';
import { css, html } from 'platform/elements';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { CreditService } from 'app/services/CreditService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { creditMixin } from 'app/views/credit/CreditMixin';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';
import { testPDF } from 'app/mocks/PDFMockData'; // TODO: Remove after testing

import 'app/components/common/ServiceCallErrorScreen';
import 'app/components/credit/CreditCardDetails';
import 'app/components/credit/AccessFacilityDetails';
import 'app/components/credit/TermLoanDetails';
import 'app/components/dialogs/common/CCSstatus';
import 'app/dialogs/credit/SettlementQuote';
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
		// ccs status of client set to true until real value retrieved from CS
		this.ccsStatus = false;
		this.showSettleCloseModal = false;

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
			showSettleCloseModal: { type: Boolean }
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
		const settleLoan = () => this._settleLoan();
		const paidUpLetter = () => this._paidUpLetter();
		const budgetFacility = () => this._budgetFacility(selectedAccountDetails);
		const payBudget = () => this._payBudgetAccount(selectedAccountDetails);

		const accConfig = ACCOUNT_INTCAT_ENUM[selectedAccountDetails.productTypeCode];
		const actions = {
			'transaction-history': transactionHistory,
			'statements': statements,
			'settlement-quote': settlementQuote,
			'paid-up-letter': paidUpLetter,
			'settle-close': settleAndClose,
			'budget-facility': budgetFacility,
			'pay-budget': payBudget,
			'settle-loan': settleLoan
		};

		if (actions[option]) {
			
			const clientNeed = `${option}-${accConfig.subCategory}`;
			 
			await super._inicidentManager_(clientNeed, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();

			this.ccsStatus = await this._checkCreditPermisions(option, this.callerInformation.cifNumber, selectedAccountDetails.accountNumber, productType);

			// Perform the action only when ccs status is false
			if (!this.ccsStatus) {
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

		await creditProducts[this.accountViewType]();
	}

	_backFromAccountDetails() {
		this._telemetry.logEvent(CreditEvents.CREDIT_ACCOUNT_DETAILS_CLOSE, {
			"screen": `${this.accountViewType} details`,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_sendStatement() {
		// TO DO: Navigation to success or failure screens based on CS call response.
		this.horizonRouter.navigateToCreditStatementSuccess();
	}

	_budgetAccountDetails(selectedAccountDetails) {

		this.budgetAccountDetails = {
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

	async _payBudgetAccount(selectedAccountDetails) {
		this.clientProducts = await this._getClientProducts();
		this.payBudgetAccountDetails = selectedAccountDetails;
		this.renderMode = RENDER_MODE.PAY_BUDGET_DIALOG;
	}

	_transferPayBudget() {
		// TO DO: This function to be used to confirm transfer pay budget.
	}

	_confirmSettleAndClose() {
		// TO DO: This function to be used to confirm settle and close credit card or Loans.
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

	_onSendSettleAndClosePOP(documents, email) {
		// TODO: CS integration to send settle and close POP
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancelSendSettleAndClosePOP() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onSendSettleLoanPOP(documents, email) {
		// TODO: CS integration to send settle and close POP
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancelSendSettleLoanPOP() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onSendPayBudgetPOP(documents, email) {
		// TODO: CS integration to send settle and close POP
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancelSendPayBudgetPOP() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
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
			
			this.horizonStore.setCallerInformation(this.callerInformation);

            let returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber);
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

	_settlementQuote(creditType, productType, selectedAccountDetails) {
		this._telemetry.logEvent(CreditEvents.CREDIT_SETTLEMENT_QUOTE_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_SETTLEMENT_QUOTE,
			"credit-type": creditType,
			"product-type": productType
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.creditType = creditType;
		screenDetails.productType = productType;
		this.horizonStore.setScreenDetails(screenDetails);
		
		this.selectedTab = creditType;
		
		this._settlementQuoteDialog([selectedAccountDetails]);
	}

	_paidUpLetter() {
		// TO DO: Place holder for paid up Letter flow.
	}

	_settleAndClose(creditType, productType, selectedAccountDetails) {
		// TO DO: Place holder for credit settle and close flow.

		this._telemetry.logEvent(CreditEvents.CREDIT_SETTLE_CLOSE_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_SETTLE_CLOSE,
			"credit-type": creditType,
			"product-type": productType
		});
	}

	_settleLoan() {
		// TODO: Place holder for credit settle loan flow.

		if (this.ccsStatus) {
			this.showCCSmodal = true;
			return;
		}

		this.settleAndCloseDetails = selectedAccountDetails;
		this.productType = this.settleAndCloseDetails.productTypeDescription;
		this.creditType = creditType;
		this.showSettleCloseModal = !this.showSettleCloseModal;
	}

	async _budgetFacility(selectedAccountDetails) {
		await super.createAndClassifySubsIncident();

		const returnValue = await this.creditService.budgetFacility(selectedAccountDetails.accountNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger(`error`, `Failed to retrieve client credit card budget details from credit service.`, `_budgetFacility`, returnValue.correlationId);
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
			this.logger(`error`, `Failed to retrieve client credit card details from credit service.`, `_getCreditCardDetails`, returnValue.correlationId);
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
			this.logger(`error`, `Failed to retrieve client loan details from credit service.`, `_getTermLoanDetails`, returnValue.correlationId);
			return;
		}

		this.termLoanDetails = returnValue.result;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	_backFromSettlementQuoteDialog() {
		this.horizonStore.clearScreenDetails();
		this._backToLandingPage();
	}

	_backFromPayBudgetDialog() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.currentNeed = `budget-facility-credit-card`;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW;
	}
	
	async _settleAndCloseChooseAccount() {
		// TO DO: Place holder for credit settle and close flow.
		// "this.settleAndCloseDetails" has to be formed correctly after CS implementaion.

		this.clientProducts = await this._getClientProducts();
		
		this.showSettleCloseModal = !this.showSettleCloseModal;

		const balanceField = this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? `Available balance` : `Credit limit`;
		const balanceFieldValue = this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? this.settleAndCloseDetails.availableCredit : this.settleAndCloseDetails.creditLimit;

		this.settleAndCloseDetails = {
			header: this.settleAndCloseDetails.category === CREDIT_TYPE.FLEXIBLE ? `Settle And Close` : `Settle Loan`,
			[this.settleAndCloseDetails.productTypeDescription]: this.settleAndCloseDetails.accountNumber,
			[balanceField]: balanceFieldValue,
			'Outstanding balance': this.settleAndCloseDetails.currentBalance,
			'Interest not capitalised': `R150.00`,
			'Expected interest and fees': `R40.00`,
			'Settlement amount': `R491.09`
		};
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

	_loadSettleAndClosePOPDocument(documentId) {
		// TODO: CS Integration to retrieve Settle and Close POP Document
		return testPDF.content.data;
	}

	_loadSettleLoanPOPDocument(documentId) {
		// TODO: CS Integration to retrieve Settle Loan POP Document
		return testPDF.content.data;
	}

	_loadPayBudgetPOPDocument(documentId) {
		// TODO: CS Integration to retrieve Pay Budget POP Document
		return testPDF.content.data;
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
			${this._renderPayBudgetEmailConfirmation()}
			${this._renderSettleCloseDisclaimer()}
			${this._renderSettleAndCloseDialog()}
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
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNTS_VIEW ||
				this.renderMode === RENDER_MODE.PAY_BUDGET_DIALOG
			? html`
				<capitec-pc-budget-facility-accounts
					.budgetFacilityAccounts="${this.budgetFacilityAccounts}"
					
					@back="${() => this._setIncidentDone()}"
					@account-details="${(event) => this._budgetAccountDetails(event.detail.selectedAccountDetails)}"
					@transfer-click="${(event) => this._optionClick(`pay-budget`, CREDIT_TYPE.FLEXIBLE, PRODUCTS.CREDIT_CARD, event.detail.selectedAccountDetails)}">
				</capitec-pc-budget-facility-accounts>`
			: html``;
	}

	_renderBudgetAccountDetails() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNT_DETAILS
		? html`
			<capitec-pc-budget-account-details
				.accountDetails="${this.budgetAccountDetails}"
				@back="${() => this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW}">
			</capitec-pc-budget-account-details>`
		: html``;
	}

	_renderPayBudgetDialog() {
		return this.renderMode === RENDER_MODE.PAY_BUDGET_DIALOG
			? html`
				<capitec-pc-pay-budget-dialog
					.budgetAccountDetails="${this.payBudgetAccountDetails}"
					.clientProducts="${this.clientProducts}"
					
					@cancel="${() => this._backFromPayBudgetDialog()}"
					@transfer="${() => this._transferPayBudget()}">
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
				@cancel="${() => this.showSettleCloseModal = !this.showSettleCloseModal}"
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
		// TODO: Remove mock once CS integration is complete
		const mockDocuments = [
			{
				title: `86 Month Term Loan`,
				subtitle: `Proof of transfer`
			}
		];

		return this.renderMode === RENDER_MODE.VIEW_AND_SEND_SETTLE_LOAN_POP ? html`
			<horizon-view-and-send-document
				modalHeader="Settle Loan: Proof of Payment" 
				.documents="${mockDocuments}"
				.loadDocumentContent="${this._loadSettleLoanPOPDocument}"
				@send-pdf-click="${(e) => this._onSendSettleLoanPOP(e.documents, e.email)}"
				@cancel-send-pdf-click="${() => this._onCancelSendSettleLoanPOP()}">
			</horizon-view-and-send-document>
		` : html``;
	}

	_renderPayBudgetEmailConfirmation() {
		// TODO: Remove mock once CS integration is complete
		const mockDocuments = [
			{
				title: `Budget Name`,
				subtitle: `Proof of transfer`
			}
		];

		return this.renderMode === RENDER_MODE.VIEW_AND_SEND_PAY_BUDGET_POP ? html`
			<horizon-view-and-send-document
				modalHeader="Pay Budget: Proof of Payment" 
				.documents="${mockDocuments}"
				.loadDocumentContent="${this._loadPayBudgetPOPDocument}"
				@send-pdf-click="${(e) => this._onSendPayBudgetPOP(e.documents, e.email)}"
				@cancel-send-pdf-click="${() => this._onCancelSendPayBudgetPOP()}">
			</horizon-view-and-send-document>
		` : html``;
	}

	_renderSettleAndCloseDialog() {
		return this.renderMode === RENDER_MODE.SETTLE_AND_CLOSE
		? html`
			<horizon-settle-and-close-dialog 
				.settleAndCloseDetails="${this.settleAndCloseDetails}"
				.clientProducts="${this.clientProducts}"

				@cancel="${() => this._backToLandingPage()}"
				@settle-and-close="${() => this._confirmSettleAndClose()}">
			</horizon-settle-and-close-dialog>`
		: html``;
	}
}

customElements.define(`horizon-credit-account`, CreditAccount);