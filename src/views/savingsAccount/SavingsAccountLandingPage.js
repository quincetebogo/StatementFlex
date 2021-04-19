import { Configuration, EventAggregator, NavigationContext } from 'platform/core';
import { css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import 'app/components/savingsAccount/SavingAccount';
import 'app/components/savingsAccount/TransactionHistory';
import 'app/components/savingsAccount/DebiCheckMandates';

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	// 7776000000 is 90 days in milliseconds
	START_DATE: new Date(Date.now() - 7776000000).toISOString().substr(0, 10),
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
 * @extends {Component}
 */
export class SavingsAccountLandingPage extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonRouter = HorizonRouter.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.configuration = Configuration.getInstance();
	
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();

		this.transactionHistory = null;
		this.accountDetails = null;
	
		// private properites
		this.loading = true;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option) => {

			const transactionHistory = () => this._transactionHistory();
			const debiCheck = () => this._debiCheck();
			const statements = () => this._getStatements();
			const more = () => this._more();

			const actions = {
				'transaction-history': transactionHistory,
				'debi-check': debiCheck,
				'statements': statements,
				'more': more
			};

			if (actions[option]) {
				super._inicidentManager_(option, () => this._toggleBusyFlag());
				return actions[option];
			}
		};
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

	_transactionHistoryToMainPage() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		this.verificationStatus = this.callerInformation.verificationStatus;

		if (this.callerInformation.verificationStatus !== `non-client`) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsAccountService.savingsAccountLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);
			 
			if (returnValue.succeeded) {
                this.landingPageInfo = returnValue.result;

				// Now we can update the information on the product buttons
				this._updateLeftBar();
				this.renderMode = RENDER_MODE.MAIN_PAGE;
			}

		} else {
			// minimal object for the Favourites landing page component
			this.landingPageInfo = { pendingMandateCount: 0 };
		}

		this.loading = false;
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

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
	}

	async _transactionHistory() {
		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.landingPageInfo.accountNumber,
			accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
			startDate: TRANSACTION_HISTORY.START_DATE,
			endDate: TRANSACTION_HISTORY.END_DATE,
			startAtIndex: TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			this.transactionHistory = returnValue.result.transactions;
			this.accountDetails = {
				"accountNumber": this.landingPageInfo.accountNumber,
				"balance": this.landingPageInfo.accountBalance,
				"availableBalance": this.landingPageInfo.accountAvailableBalance,
				"pendingAmount": this.landingPageInfo.accountPendingAmount,
				"interest": this.landingPageInfo.interestRatePercentage,
				"status": this.landingPageInfo.accountStatus
			};

			this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
		}
	}

	_debiCheck() {
		// TODO: Functionality to Debi check comes here
	}

	_getStatements() {
		// TODO: Functionality to generate statements comes here
	}

	_more() {
		// TODO: Functionality to option 'more' comes here
	}

	async _productEnquiry(event, type) {
		if (event.detail.enquiry === `product-enquiry`) {
			const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
			window.open(`${globalOneUrl}${type}`);
		}
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
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSavingsLandingPage()}
			${this._renderTransactionHistory()}

			${super._webTemplate()}`;
	}

	_renderSavingsLandingPage() {
		return !this.loading && this.renderMode === RENDER_MODE.MAIN_PAGE
			? html`
				<horizon-savings-account
					class="savingsaccount"
					.landingPageInfo = "${this.landingPageInfo}"
					@option-click="${(event) => this._optionClick(event.detail.option)()}"
					@savings-enquiry="${(event) => this._productEnquiry(event, `transact`)}">
				</horizon-savings-account>`
			: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY 
			? html`
				<horizon-transaction-history
					.transactionHistory = "${this.transactionHistory}"
					.accountDetails = "${this.accountDetails}"
					.callerInformation = "${this.callerInformation}"
					@error-handler = "${() => this._errorHandler()}"
					@back="${() => this._transactionHistoryToMainPage()}">
				</horizon-transaction-history>`
			: html``;
	}
}

customElements.define(`horizon-savings-account-landing-page`, SavingsAccountLandingPage);