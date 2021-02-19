import { EventAggregator, NavigationContext } from 'platform/core';
import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { SavingsAccountService} from 'app/services/SavingsAccountService';

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
		this.verificationStatus = this.callerInformation.verificationStatus;
		this.isBusy = false;

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
			renderMode: { attribute: false },
			isBusy: {type: Boolean}
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

async _optionClick(event) {
		if (event.detail.option === `transaction-history`) {

			const transactionHistoryRequest = {
				cifNumber : "309692997",
				accountNumber : "6008203940",
				accountType : "PRIMARY_SAVINGS",
				startDate : "2021-01-01",
				endDate : "2021-02-14",
				startAtIndex : 0,
				maxResults : 20,
				moneyType : "BOTH"
			}
			const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);

			if(returnValue.succeeded && returnValue.result){
				this.transactionHistory = returnValue.result.transactions;
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

	_initialise() {
		this._updateTopBar();

		// At this point this will just update the mini-profile
		this._updateLeftBar();

		this.verificationStatus = this.callerInformation.verificationStatus;

		if (this.callerInformation.verificationStatus !== `non-client`) {
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				isCallerVerified: this.callerInformation.verificationStatus === `verified`
			};

		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = { pendingMandateCount: 0 };
		}
	}

	_updateTopBar() {
		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);
	}

	_updateLeftBar() {
		const subtitle = ``;
		const detail = ``;

		const state = {
			miniProfile: {
				name: this.callerInformation.isNonClient ? this.callerInformation.nonClientFullName : this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: this.callerInformation.verificationStatus === `verified`,
				isConfirmed: this.callerInformation.verificationStatus !== `non-client`,
				isVerified: this.callerInformation.verificationStatus === `verified`,
				verificationFailed: this.callerInformation.verificationStatus === `failed`,
				is3rdParty: false,
				isNonClient: this.callerInformation.verificationStatus === `non-client`
			},
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
		return this.renderMode === RENDER_MODE.MAIN_PAGE 
			? html`
				<horizon-savings-account
					class="savingsaccount"
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