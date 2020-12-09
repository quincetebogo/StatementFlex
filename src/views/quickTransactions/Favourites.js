import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/quickTransactions/FavouriteTransactions';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1,
	SELECT_ASSIGN_REASON: 2,
	ASSIGN: 3,
	VERIFY_NOW: 4,
	ALERT_MODAL: 5
});

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
		this.isReassigned = false;
		this.landingPageInfo = null;

		this.renderMode = RENDER_MODE.MAIN_PAGE;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.state = this.horizonStore.recoverState();

		this.callerInformation = this.state.callerInformation;
		this.incomingCallDetails = this.state.incomingCallDetails;

		// Subscribe to shell events
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyNowClick());

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			isBusy: { type: Boolean },
			isLoading: { type: Boolean },
			renderMode: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCallClick() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCallClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_assignIncidentClick() {
		this.renderMode = RENDER_MODE.SELECT_ASSIGN_REASON;
	}

	_verifyNowClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerificationClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onFavouritesOptionClick(e) {
		switch (e.detail.option) {
			case `stop-card`:
				this._stopCard();
				break;
			case `debi-check`:
			case `update-card-limits`:
			case `tap-to-pay`:
			case `statements`:
			case `tax-certificate`:
			case `proof-of-account`:
			default:
				if (this.callerInformation.verificationStatus !== `verified`) {
					this._unavailableOption();
				}
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	async _initialise() {
		this._updateTopBar();

		// At this point this will just update the mini-profile
		this._updateLeftBar();

		const landingRequest = {
			cifNumber: this.callerInformation.cifNumber,
			nationalIDNumber: this.callerInformation.southAfricanIDNumber,
			isCallerVerified: this.callerInformation.verificationStatus === `verified`
		};

		const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest);

		if (returnValue.succeeded) {
			this.isLoading = false;
			this.landingPageInfo = returnValue.result;

			// Now we can update the information on the product buttons as well
			this._updateLeftBar();
		}
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
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
			miniProfile: {
				name: this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: this.callerInformation.verificationStatus != `failed`,
				isConfirmed: true,
				isVerified: this.callerInformation.verificationStatus === `verified`,
				verificationFailed: this.callerInformation.verificationStatus === `failed`,
				is3rdParty: false,
				isNonClient: false
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

	async _stopCard() {
		const confirmedCaller = {
			idNumber: this.callerInformation.southAfricanIDNumber,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: `StopCard`,
			incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
			incidentRecId: this.incomingCallDetails.incidentRecId,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			nonClientFullName: this.callerInformation.nonClientFullName,
			nonClientCellPhone: this.callerInformation.nonClientCellPhone,
			nonClientIDNumber: this.callerInformation.nonClientIDNumber,
			nonClientRelationship: this.callerInformation.nonClientRelationship
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller);
		const clientProfileDetails = returnValue.result;

		if (returnValue.succeeded) {
			this.incomingCallDetails.ivrOptionCode = `StopCard`;
			this.incomingCallDetails.ivrOption.value = `StopCard`;

			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation,
				clientProfileDetails: clientProfileDetails
			});
			this.horizonRouter.navigateToStopCard();
		}
		else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	_unavailableOption() {
		this.renderMode = RENDER_MODE.ALERT_MODAL;
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
		${this._renderEndCallSessionModal()}
		${this._renderVerifyNowModal()}
		${this._renderAlertModal()}
		${this._renderLoadingIndicator()}
		`;
	}

	_renderFavouritesLandingPage() {
		return this.isLoading ? html``
			: html`<horizon-favourites-transactions 
					class="favourites"
					.landingPageInfo="${this.landingPageInfo}"
					.incomingCallDetails="${this.state.incomingCallDetails}"
					.callerInformation="${this.state.callerInformation}"
					@verify-click="${() => this._verifyNowClick()}"
					@option-click="${(e) => this._onFavouritesOptionClick(e)}">
				</horizon-favourites-transactions>`;

	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller 
					.incomingCallDetails="${this.incomingCallDetails}" 
					@skip="${(e) => this._skipVerificationClick(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderEndCallSessionModal() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session 
					.incomingCallDetails="${this.incomingCallDetails}" 
					.isReassigned="${this.isReassigned}"
					@cancel="{${() => this._cancelEndCallClick()}}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderAlertModal() {
		if (this.renderMode === RENDER_MODE.ALERT_MODAL) {
			return html`
				<horizon-client-not-verified 
					@cancel="${() => this.renderMode = 0}" 
					@verify-now="${() => this._verifyNowClick()}">
				</horizon-client-not-verified>
			`;
		}
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

customElements.define(`horizon-favourites`, Favourites);