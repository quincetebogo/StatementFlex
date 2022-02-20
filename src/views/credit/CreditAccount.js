import { css, html } from 'platform/elements';
import { formatCurrency, formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';
import { Configuration } from 'platform/core';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { CreditService } from 'app/services/CreditService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ServiceCallErrorScreen';
import 'app/components/credit/CreditCardDetails';
import 'app/components/credit/AccessFacilityDetails';
import 'app/components/credit/TermLoanDetails';
import 'app/dialogs/credit/CreditStatements';
import 'app/productControls/credit/src/BudgetAccounts';
import 'app/productControls/credit/src/BudgetAccountDetails';
import 'app/productControls/credit/src/CreditAccountLanding';
import 'app/productControls/credit/src/CreditUnverifiedLanding';
import 'app/productControls/credit/src/PayCreditCardBudget';

const PRODUCTS = {
	CREDIT_CARD: `Credit card`,
	ACCESS_FACILITY: `Access facility`,
	TERM_LOAN: `Term Loan`
};

const CREDIT_TYPE = {
	FLEXIBLE: `Flexible`,
	FIXED: `Fixed Credit`
};

// TO DO: This constant can be pulled from 'app/constants/Statements' ACCOUNT_INTCAT_ENUM when merged with Live-better.
const ACCOUNT_INTCAT_ENUM = Object.freeze({
	300: {
		name: `Savings account`,
		type: `PRIMARY_SAVINGS`,
		category: `transact`,
		icon: `product/transact`,
		order: 1
	},
	200: {
		name: ``,
		type: `FLEXIBLE_SAVINGS`,
		category: `save`,
		icon: `product/save`,
		order: 2
	},
	201: {
		1: {
			name: ``,
			type: `FIXED_TERM_MULTIPLE_DEPOSITS`,
			category: `save`,
			icon: `product/save`,
			order: 3
		},
		2: {
			name: ``,
			type: `FIXED_TERM_SINGLE_DEPOSIT`,
			category: `save`,
			icon: `product/save`,
			order: 4
		}
	},
	210: {
		name: `Live better savings account`,
		type: `LBB`,
		category: `lbb`,
		customIcon: `/images/liveBetter/live-better-icon.png`,
		order: 5
	}
});

const FROM_ACCOUNTS_LIST = [
		// Primary savings
		300
	];

/**
 * Credit Account View
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

		this.configuration = Configuration.getInstance();
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

		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), (ex) => this._errorHandler(ex));
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
 
		this._initialise();

		this._optionClick = async (option, creditType, productType) => {

			const transactionHistory = () => this._transactionHistory(creditType, productType);
			const statements = () => this._getStatements(creditType, productType);
			const settlementQuote = () => this._settlementQuote(creditType, productType);
			const settleAndClose = () => this._settleAndClose(creditType, productType);
			const paidUpLetter = () => this._paidUpLetter();
			const settleLoan = () => this._settleLoan();
			const budgetFacility = () => this._budgetFacility();

			const actions = {
				'transaction-history': transactionHistory,
				'statements': statements,
				'settlement-quote': settlementQuote,
				'paid-up-letter': paidUpLetter,
				'settle-close': settleAndClose,
				'settle-loan': settleLoan,
				'budget-facility': budgetFacility
			};

			if (actions[option]) {
				
				const clientNeed = `${option}-${productType.toLowerCase().replace(` `, `-`)}`;
				 
				await super._inicidentManager_(clientNeed, () => this._toggleBusyFlag());
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
			loading: { state: false },
			renderMode: { state: false },
			accountViewType: { state: false },
			flexibleCreditAccounts: { type: Array, state: true, attribute: false },
			fixedTermCreditAccounts: { type: Array, state: true, attribute: false },
			creditBalance: { state: true, attribute: false }
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

	async _viewFees() {
		const fees = await this.configuration.getSetting(`otherSystemsURL.fees`);
		window.open(`${fees}`);
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
	
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};

		const returnValue = await this.quickTransactionService.getClientProducts(request);
		
		if (returnValue.succeeded && returnValue.result.savingsProducts) {
			
			// TO DO: Check for list of account that can be used to pay budget from once architecture work is complete.
			// A/c to the present information, Primary savings account with enough balance to transfer can be listed.
			
			this.clientProducts = returnValue.result.savingsProducts
										.filter(item => FROM_ACCOUNTS_LIST.includes(item.accountType) &&
												item.availableBalance > selectedAccountDetails.budgetBalance)
										.map(item => {
												const productInfo = ACCOUNT_INTCAT_ENUM[item.accountType][item.interestCategory] || 
																	ACCOUNT_INTCAT_ENUM[item.accountType];
												const accName = item.accountName.toLowerCase();

												return {
													'accountNumber': item.accountNumber,
													'accountName': `${accName.charAt(0).toUpperCase()}${accName.slice(1)}`,
													'accountType': item.accountType,
													'icon': productInfo.icon,
													'customIcon': productInfo.customIcon,
													'order': productInfo.order
												};
											})
										.sort((x, y) => x.order - y.order);

			this.renderMode = RENDER_MODE.PAY_BUDGET_DIALOG;
			this.payBudgetAccountDetails = selectedAccountDetails;
		}
	}

	_transferPayBudget() {
		// TO DO: This function to be used to confirm transfer pay budget.
	}

	_errorHandler() {
		this.horizonRouter.navigateToSystemError();
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
			item.nextRepayment = formatCurrency(item.nextRepayment);
			item.accountStatusDescription = item.arrearIndicator ? `In arrears` : formatStringAsPascalCase(item.accountStatusDescription);

			return item;
		});

		this.budgetAccountsSummary = {
			"totalBudgetBalance": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetBalance),
			"totalBudgetInstallmentAmount": formatCurrency(this.creditAccountDetails.budgetAccountsSummary.totalBudgetInstallmentAmount)
		};
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				savingsPlan: this.landingPageInfo.savingsPlanProductAmount,
				insure: this.landingPageInfo.insureProductAmount,
				credit: this.landingPageInfo.creditProductAmount
			};
		}

		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_transactionHistory(creditType, productType) {
		// TO DO: Place holder for credit transaction history flow.

		this._telemetry.logEvent(CreditEvents.CREDIT_TRANSACTION_HISTORY_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_TRANSACTION_HISTORY,
			"credit-type": creditType,
			"product-type": productType
		});
	}

	_getStatements(creditType, productType) {
		// TO DO: Place holder for credit statements flow.
		
		this._telemetry.logEvent(CreditEvents.CREDIT_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_STATEMENTS,
			"credit-type": creditType,
			"product-type": productType
		});
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_settlementQuote(creditType, productType) {
		// TO DO: Place holder for credit settlement Quote flow.
		
		this._telemetry.logEvent(CreditEvents.CREDIT_SETTLEMENT_QUOTE_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_SETTLEMENT_QUOTE,
			"credit-type": creditType,
			"product-type": productType
		});
	}

	_paidUpLetter() {
		// TO DO: Place holder for paid up Letter flow.
	}

	_settleAndClose(creditType, productType) {
		// TO DO: Place holder for credit settle and close flow.
		
		this._telemetry.logEvent(CreditEvents.CREDIT_SETTLE_CLOSE_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_SETTLE_CLOSE,
			"credit-type": creditType,
			"product-type": productType
		});
	}

	_settleLoan() {
		// TO DO: Place holder for credit settle loan flow.
	}

	async _budgetFacility(e) {
		// TO DO: Place holder for budget facility flow.
		const returnValue = await this.creditService.budgetFacility(e.detail.creditCardNumber);
		const successfullServiceResponse = returnValue.succeeded;

		if (!successfullServiceResponse) {
			this.logger(`error`, `Failed to retrieve client credit card budget details from credit service.`, `_budgetFacility`, returnValue.correlationId);
			return;
		}

		this.budgetFacilityAccounts = returnValue.result;
		this.budgetFacilityAccounts.creditCardNumber = e.detail.creditCardNumber;
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

	async _navigatePDF(currPage) {
		// add CS call to get encodedPDF 
		// currPage is date currently selected
		const returnValue = await this.quickTransactionService.viewStatement(currPage, () => this._createIncidentOnError());
		if (returnValue) {
			return returnValue.result.statementData;
		}
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
			   this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				${this._renderCreditVerifiedLandingPage()}
				${this._renderCreditUnverifiedLandingPage()}`
			: html``;
	}

	_renderCreditVerifiedLandingPage() {
		return this.verificationStatus === `verified` ? html`
			<capitec-pc-credit-account
			.flexibleCreditAccounts="${this.flexibleCreditAccounts}"
			.fixedTermCreditAccounts="${this.fixedTermCreditAccounts}"
			.budgetAccountsSummary="${this.budgetAccountsSummary}"
			@option-click="${(e) => this._optionClick(e.detail.option, e.detail.creditType, e.detail.productType)}"
			@account-details="${(e) => this._accountDetails(e)}"
			@product-enquiry="${() => this._productEnquiry()}"
			@view-info="${() => this._viewInfo()}"
			@view-budget-accounts="${(e) => this._budgetFacility(e)}">
		</capitec-pc-credit-account>` : html``;
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
					
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@account-details="${(event) => this._budgetAccountDetails(event.detail.selectedAccountDetails)}"
					@transfer-click="${(event) => this._payBudgetAccount(event.detail.selectedAccountDetails)}">
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
					
					@cancel="${() => this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW}"
					@transfer="${() => this._transferPayBudget()}">
				</capitec-pc-pay-budget-dialog>
			`
			: html``;
	}

	_renderCreditCardDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === PRODUCTS.CREDIT_CARD
			? html`
				<horizon-credit-card-details-view
					.creditCardDetails="${this.creditCardDetails}"
					@back="${() => this._backFromAccountDetails()}">
				</horizon-credit-card-details-view>
			`
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
		// startDate="${DateTime.local(2021, 10).toString()}"
		return this.renderMode === RENDER_MODE.STATEMENTS
		? html`
			<horizon-credit-statements-dialog
				@cancel="${() => this._backToLandingPage()}"
				@view-fees="${() => this._viewFees()}"
				.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
			</horizon-credit-statements-dialog>`
		: html``;
	}

}

customElements.define(`horizon-credit-account`, CreditAccount);