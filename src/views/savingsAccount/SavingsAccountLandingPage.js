import { EventAggregator, NavigationContext } from 'platform/core';
import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import 'app/components/savingsAccount/SavingAccount';
import 'app/components/savingsAccount/TransactionHistory';
import 'app/components/savingsAccount/DebiCheckMandates';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1,
	TRANSACTION_HISTORY: 2,
	DEBI_CHECK_PAGE: 3
});

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
export class SavingsAccountLandingPage extends View {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.navigationContext = NavigationContext.getInstance();
	
		this.state = this.horizonStore.recoverState();
		this.callerInformation = this.state.callerInformation;
		this.incomingCallDetails = this.state.incomingCallDetails;
		this.transactionHistory = null;
		this.accountDetails = null;
		this.isBusy = false;
	
		// private properites
		this.isBusy = false;
		this.loading = true;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isBusy: { attribute: false },
			renderMode: { attribute: false },
			loading: { attribute: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

async _optionClick(event) {
		if (event.detail.option === `transaction-history`) {

			const transactionHistoryRequest = {
				cifNumber: this.callerInformation.cifNumber,
				accountNumber: this.landingPageInfo.accountNumber,
				accountType: `PRIMARY_SAVINGS`,
				startDate: "2020-12-22",
				endDate: `2021-03-22`,
				startAtIndex: 0,
				maxResults: 40,
				moneyType: `BOTH`
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
		} else if (event.detail.option === `debi-check`) {
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		}
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

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}
	
	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
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
				height: 888px;
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
			${this._renderLoadingIndicator()}
			`;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_renderSavingsLandingPage() {
		return !this.loading && this.renderMode === RENDER_MODE.MAIN_PAGE
			? html`
				<horizon-savings-account
					class="savingsaccount"
					.landingPageInfo = "${this.landingPageInfo}"
					@option-click="${(event) => this._optionClick(event)}">
				</horizon-savings-account>`
			: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY 
			? html`
				<horizon-transaction-history
					.transactionHistory = "${this.transactionHistory}"
					.accountDetails = "${this.accountDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-transaction-history>`
			: html``;
	}
}

customElements.define(`horizon-savings-account-landing-page`, SavingsAccountLandingPage);