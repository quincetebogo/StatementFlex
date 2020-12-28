import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { mockMandates } from 'app/mocks/DebiCheckMockData';
import { mockCards } from 'app/mocks/CardLimitsMock';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/UpdateCardLimits';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1,
	SELECT_ASSIGN_REASON: 2,
	ASSIGN: 3,
	VERIFY_NOW: 4,
	ALERT_MODAL: 5,
	DEBI_CHECK: 6,
	UPDARTE_CARD_LIMITS: 7
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

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.state = this.horizonStore.recoverState();
		this.callerInformation = this.state.callerInformation;
		this.incomingCallDetails = this.state.incomingCallDetails;

		// private properites
		this.verificationStatus = this.callerInformation.verificationStatus;
		this.isBusy = false;
		this.isLoading = true;
		this.renderMode = RENDER_MODE.MAIN_PAGE;

		// private variables
		this.isReassigned = false;
		this.landingPageInfo = null;
		this.debiCheckMandates = {};
		this.curOptionEvent = {};

		// Subscribe to shell events
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			isBusy: { attribute: false },
			isLoading: { attribute: false },
			renderMode: { attribute: false },
			verificationStatus: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._initialise();
		this._performAction = (option) => {

			const stopCard = () => this._stopCard();
			const debiCheck = () => this._debiCheck();
			const updateCardLimits = () => this._updateCardLimits();
			const tapToPay = () => this._tapToPay();
			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const proofOfAccount = () => this._proofOfAccount();

			const actions = {
				'stop-card': stopCard,
				'debi-check': debiCheck,
				'update-card-limits': updateCardLimits,
				'tap-to-pay': tapToPay,
				'statements': statements,
				'tax-certificate': taxCertificates,
				'proof-of-account': proofOfAccount
			};

			if (actions[option]) {
				return actions[option];
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
		};
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

	_verifyClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.verificationStatus = this.callerInformation.verificationStatus;

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		if (this.curOptionEvent) {
			const optionSelected = this.curOptionEvent.detail.option;
			this.curOptionEvent = {};
			this._performAction(optionSelected)();
		}
	}

	async _onFavouritesOptionClick(e) {
		// Getting hold of event to perform continue action if client decides to do verification
		this.curOptionEvent = e;

		if (e.detail.stopPropagation) {
			this._unavailableOption();
		} else {
			await this._performAction(e.detail.option)();
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
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

			const returnValue = await this.quickTransactionService.favouritesLanding(landingRequest);

			if (returnValue.succeeded) {
				this.isLoading = false;
				this.landingPageInfo = returnValue.result;

				// Now we can update the information on the product buttons as well
				this._updateLeftBar();
			}
		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = { pendingMandateCount: 0 };
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
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	_debiCheck() {
		this.debiCheckMandates = mockMandates.mandateSummaryList;
		this.renderMode = RENDER_MODE.DEBI_CHECK;
		// TODO: Service call to get mandates comes here
	}

	_updateCardLimits() {
		this.cards = mockCards;
		this.renderMode = RENDER_MODE.UPDARTE_CARD_LIMITS;
		// TODO: Service call to get cards list comes here
	}

	_tapToPay() {
		// TODO: Functionality to toggle tap to pay comes here
	}

	_getStatements() {
		// TODO: Functionality to generate statements comes here
	}

	_taxCertificates() {
		// TODO: Functionality to generate tax certificate comes here
	}

	_proofOfAccount() {
		// TODO: Functionality to generate proof of account comes here
	}

	_unavailableOption() {
		this.renderMode = RENDER_MODE.ALERT_MODAL;
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
			.favourites{
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
			${this._renderLoadingIndicator()}
			${this._renderContent()}
			${this._renderEndCallSessionModal()}
			${this._renderVerifyNowModal()}
			${this._renderAlertModal()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.DEBI_CHECK:
				return html`${this._renderDebiCheckMandates()}`;
			case RENDER_MODE.UPDARTE_CARD_LIMITS:
				return html`${this._renderUpdateCardLimits()}`;
			case RENDER_MODE.MAIN_PAGE:
			default:
				return html`${this._renderFavouritesLandingPage()}`;
		}
	}

	_renderFavouritesLandingPage() {
		return this.isLoading ? html``
			: html`<horizon-favourites-transactions 
						class="favourites"
						.landingPageInfo="${this.landingPageInfo}"
						.incomingCallDetails="${this.incomingCallDetails}"
						.callerInformation="${this.callerInformation}"
						.verificationStatus="${this.verificationStatus}"
						@verify-click="${() => this._verifyClick()}"
						@option-click="${(e) => this._onFavouritesOptionClick(e)}">
					</horizon-favourites-transactions>`;

	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
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
					@cancel="${() => this._cancelEndCallClick()}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderAlertModal() {
		if (this.renderMode === RENDER_MODE.ALERT_MODAL) {
			return html`
				<horizon-client-not-verified
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}"
					@verify-now="${() => this._verifyClick()}">
				</horizon-client-not-verified>
			`;
		}
	}

	_renderDebiCheckMandates() {
		return html`
			<debi-check-mandates
				.debiCheckMandates="${this.debiCheckMandates}"
				@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
			</debi-check-mandates>
		`;
	}

	_renderUpdateCardLimits() {
		return html`
			<horizon-update-card-limits
				.cards="${this.cards}"
				@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
			</horizon-update-card-limits>
		`;
	}
}

customElements.define(`horizon-favourites`, Favourites);