import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { CreditService } from 'app/services/CreditService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/utils/channelServiceUtilities';

import 'app/components/common/ServiceCallErrorScreen';
import 'app/components/credit/CreditCardDetails';
import 'app/components/credit/AccessFacilityDetails';
import 'app/components/credit/TermLoanDetails';
import 'app/dialogs/credit/CreditStatements';
import 'app/productControls/credit/src/BudgetAccounts';
import 'app/productControls/credit/src/BudgetAccountDetails';
import 'app/productControls/credit/src/CreditAccountLanding';
import 'app/productControls/credit/src/CreditUnverifiedLanding';

const PRODUCTS = {
	CREDIT_CARD: `Credit Card`,
	ACCESS_FACILITY: `Access facility`,
	TERM_LOAN: `Term Loan`
};

const CREDIT_TYPE = {
	FLEXIBLE: `Flexible`,
	FIXED: `Fixed Credit`
};

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

		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		// TODO: There is no errorHanlder method defined in this scope. Should we not be calling _handleChannelServiceError
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
			fixedTermCreditAccounts: { type: Array, state: true, attribute: false }
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
		this._telemetry.logEvent(CreditEvents.CREDIT_ACCOUNT_NUMBER_SELECT, {
			"screen": TelemetryScreen.CREDIT_LANDING,
			"next-screen": TelemetryScreen.CREDIT_ACCOUNT_DETAILS,
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

		await creditProducts[event.detail.productType]();
		this.accountViewType = event.detail.productType;
	}

	_backFromAccountDetails() {

		// TO DO: This function to be used when clicked back from account details screen.
		this._telemetry.logEvent(CreditEvents.CREDIT_ACCOUNT_DETAILS_CLOSE, {
			"screen": TelemetryScreen.CREDIT_ACCOUNT_DETAILS,
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
			budgetName: selectedAccountDetails.budgetName,
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

			const returnValue = await this.creditService.creditOverview(this.callerInformation.cifNumber);
			const successfullServiceResponse = returnValue.succeeded;

			if (!successfullServiceResponse) {
				this.logger(`error`, `Failed to retrieve client overview from credit service.`, `_initialise`, returnValue.correlationId);
				return;
			}

			const creditOverview = returnValue.result;

			this.creditAccountDetails = creditOverview;
			this._formatCreditOverviewResponse();
			this.flexibleCreditAccounts = [...creditOverview.creditCardSummaryList, ...creditOverview.accessFacilitySummaryList];
			this.fixedTermCreditAccounts = [...creditOverview.loanAccountSummaryList];

			if (this.flexibleCreditAccounts.length === 0 && this.fixedTermCreditAccounts.length === 0) {
				this.horizonRouter.navigateToProductInfo(`Credit`);
				return;
			}

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
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);

			return item;
		});

		this.creditAccountDetails.accessFacilitySummaryList.map(item => {
			item.type = PRODUCTS.ACCESS_FACILITY;
			item.category = CREDIT_TYPE.FLEXIBLE;
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);

			return item;
		});

		this.creditAccountDetails.loanAccountSummaryList.map(item => {
			item.type = PRODUCTS.TERM_LOAN;
			item.category = CREDIT_TYPE.FIXED;
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableCredit = formatCurrency(item.availableCredit);
			item.creditLimit = formatCurrency(item.creditLimit);
			item.nextRepayment = formatCurrency(item.nextRepayment);

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
		const returnValue = await this.creditService.budgetFacility(e.creditCardNumber);
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
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNTS_VIEW
			? html`
				<capitec-pc-budget-facility-accounts
					.budgetFacilityAccounts="${this.budgetFacilityAccounts}"
					
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@account-details="${(event) => this._budgetAccountDetails(event.detail.selectedAccountDetails)}">
				</capitec-pc-budget-facility-accounts>`
			: html``;
	}

	_renderBudgetAccountDetails() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNT_DETAILS
		? html`
			<capitec-pc-budget-account-details
				.accountDetails="${this.budgetAccountDetails}">
			</capitec-pc-budget-account-details>`
		: html``;
	}

	_renderCreditCardDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === PRODUCTS.CREDIT_CARD
			? html`
				<horizon-credit-card-details-view
					.creditCardDetails="${this.creditCardDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
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
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-access-facility-details-view>`
			: html``;
	}

	_renderTermLoanDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === PRODUCTS.TERM_LOAN
			? html`
				<horizon-term-loan-details-view
					.termLoanDetails="${this.termLoanDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-term-loan-details-view>`
			: html``;
	}

	_renderStatements() {
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