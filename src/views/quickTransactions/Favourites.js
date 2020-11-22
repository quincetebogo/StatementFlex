import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import 'app/components/quickTransactions/FavouriteTransactions';

/**
 * The Quick Transactions Favourites Landing Page View
 *
 * @export
 * @class Favourites
 * @extends {View}
 */
export class Favourites extends View {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.isLoading = true;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		this.state = this.horizonStore.recoverState();

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), null);
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			isBusy: { type: Boolean },
			isLoading: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	async _initialise() {
		this._updateTopBar();

		// At this point this will just update the mini-profile
		this._updateLeftBar();

		const landingRequest = {
			cifNumber: this.state.callerInformation.cifNumber,
			nationalIDNumber: this.state.callerInformation.southAfricanIDNumber,
			isCallerVerified: this.state.callerInformation.verificationStatus === `verified`
		};
		
		console.log(landingRequest);
			
		const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest, null);

		returnValue.succeeded = true;
		if (returnValue.succeeded) {
			this.isLoading = false;			
			console.log(returnValue.result);

			this.landingPageInfo = {
				savingsAccountProductDescription: `test1`,
				savingsAccountProductAmount: `200.00`,
				savingsPlanProductDescription: `test2`,
				savingsPlanProductAmount: `300.00`,
				insureProductDescription: `test3`,
				insureProductAmount: `400.00`,
				creditProductDescription: `test4`,
				creditProductAmount: `500.00`,
				pendingMandateCount: 2,
				activeCardCount: 0
			  };
		}

		// Now we can update the infomration on the product buttons as well
		this._updateLeftBar();
	}

	_updateTopBar() {
		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.state.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.state.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.state.incomingCallDetails.ivrOptionCode
			}
		);
	}

	_updateLeftBar() {
		const state = {
			miniProfile: {
				name: this.state.callerInformation.name,
				idNumber: this.state.callerInformation.southAfricanIDNumber,
				phoneNumber: this.state.incomingCallDetails.incomingTelephoneNumber,
				livesIn: this.state.callerInformation.livesIn,
				languagePreference: this.state.callerInformation.languagePreference,
				birthday: this.state.callerInformation.birthdate,
				showButtons: true,
				isConfirmed: true,
				isVerified: this.state.callerInformation.verificationStatus === `verified`,
				verificationFailed: this.state.callerInformation.verificationStatus === `failed`,
				is3rdParty: false,
				isNonClient: false
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
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
	static get styles() {
		return [
			super.styles,
			css`
			.favourites{
				width: 100%;
				height: 888px;
			}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		${this._renderFavouritesLandingPage()}
		${this._renderLoadingIndicator()}
		`;
	}

	_renderFavouritesLandingPage() {
		return this.isLoading ? html`` 
			: html`<horizon-favourites-transactions 
					class="favourites"
					.landingPageInfo="${this.landingPageInfo}"
					.incomingCallDetails="${this.state.incomingCallDetails}"
					.callerInformation="${this.state.callerInformation}">
				</horizon-favourites-transactions>`;

	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);