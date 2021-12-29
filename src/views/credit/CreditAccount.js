import { css, html } from 'platform/elements';
import { budgetfacilityresponse } from 'app/mocks/creditBudgetFacilityAccounts'
import { Configuration } from 'platform/core';
import { formatCurrency } from 'app/utils/channelServiceUtilities';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from '../common/ViewBase';

import 'app/productControls/Credit/src/CreditAccountLanding';
import 'app/productControls/Credit/src/BudgetAccounts';
import 'app/productControls/Credit/src/BudgetAccountDetails';

const BUDGET_ACCOUNT_DETAILS = {
	accountName: `Shoprite Pleican PARK Grassy Park ZA`,
	monthlyRepayment: 74.11,
	purchaseAmount: 433.35,
	outstandingBalance: 364.06,
	openingDate: "2021-11-12T03:09:58.829Z",
	interestRate: 7.75,
	term: 3,
	paymentMade: 74.11,
	settlementAmount: 191.71,
	remainingTerm: 2
};

/**
 * Credit Account View
 *
 * Events Raised
 * -------------
 * -
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
		this.loading = true;
		this.budgetAccountDetails = null;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option) => {

			const transactionHistory = () => this._transactionHistory();
			const statements = () => this._getStatements();
			const settlementQuote = () => this._settlementQuote();
			const settleAndClose = () => this._settleAndClose();
			const paidUpLetter = () => this._paidUpLetter();
			const settleLoan = () => this._settleLoan();
			const budgetFacility = () => this._budgetFacility();
			const productEnquiry = () => this._productEnquiry();

			const actions = {
				'transaction-history': transactionHistory,
				'statements': statements,
				'settlement-quote': settlementQuote,
				'paid-up-letter': paidUpLetter,
				'settle-close': settleAndClose,
				'settle-loan': settleLoan,
				'budget-facility': budgetFacility,

				'product-enquiry': productEnquiry
			};

			if (actions[option]) {
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
			loading: { attribute: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_budgetAccountDetails(selectedAccountDetails) {
		// TO DO: Temporarily wired Budget account details view to View-details click on budget facility banner.
		// TO DO: Temporary data. Can be replaced when implemented CS call.
		
		this.budgetAccountDetails = {
			budgetName: selectedAccountDetails.budgetName,
			"Monthly repayment": formatCurrency(selectedAccountDetails.budgetInstallment),
			"Purchase amount": formatCurrency(selectedAccountDetails.originalAmount),
			"Outstanding balance": formatCurrency(selectedAccountDetails.budgetBalance),
			"Opening date": this._formatDate(selectedAccountDetails.budgetDateTaken),
			"Interest rate": `${selectedAccountDetails.interestRate}%`,
			"Term (months)": selectedAccountDetails.originalTerm,
			"Payment made": formatCurrency(selectedAccountDetails.repaymentAmount),
			"Settlement amount": formatCurrency(selectedAccountDetails.settlementAmount),
			"Remaining term (months)": selectedAccountDetails.termRemaining
		}

		this.renderMode = RENDER_MODE.BUDGET_ACCOUNT_DETAILS;
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			/* TO DO: Credit landing page service call should come here.
					If client has Credit product, navigate to credit landing screens.
					If client doesn't have Credit product, navigate to non-client - more info screen.

					Update left bar details once available from channel service call*/

			// ${this._updateLeftBar()};
		}
		
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.endCallContext = `LandingPage`;
		this.loading = false;
	}

	/*
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
	*/

	_transactionHistory() {
		// TO DO: Place holder for credit transaction history flow.
	}

	_getStatements() {
		// TO DO: Place holder for credit statements flow.
	}

	_settlementQuote() {
		// TO DO: Place holder for credit settlement Quote flow.
	}

	_paidUpLetter() {
		// TO DO: Place holder for paid up Letter flow.
	}

	_settleAndClose() {
		// TO DO: Place holder for credit settle and close flow.
	}

	_settleLoan() {
		// TO DO: Place holder for credit settle loan flow.
	}

	_budgetFacility() {
		// TO DO: Place holder for budget facility flow.
		// TO DO: 'budgetfacilityresponse' mock data should be replaced with CS implementation
		this.budgetFacilityAccounts = budgetfacilityresponse;
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

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderLandingPage()}
			${this._renderBudgetFacilityAccounts()}
			${this._renderBudgetAccountDetails()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE && !this.loading
			? html`
				${this._renderCreditVerifiedLandingPage()}`
			: html``;
	}

	_renderCreditVerifiedLandingPage() {
		return html`
			<capitec-pc-credit-account
				@option-click = "${(e) => this._optionClick(e.detail.option)}">
			</capitec-pc-credit-account>`;
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


	// TO DO: Need to be wired up with Budget Account view when developed.
	_renderBudgetAccountDetails() {
		return this.renderMode === RENDER_MODE.BUDGET_ACCOUNT_DETAILS
		? html`
			<capitec-pc-budget-account-details
				.accountDetails="${this.budgetAccountDetails}"
				@back="${() => this.renderMode = RENDER_MODE.BUDGET_ACCOUNTS_VIEW}">
			</capitec-pc-budget-account-details>`
		: html``;
	}
}

customElements.define(`horizon-credit-account`, CreditAccount);