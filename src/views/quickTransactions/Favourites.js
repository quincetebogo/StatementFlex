import { EventAggregator, NavigationContext } from 'platform/core';
import { View, css, html } from 'platform/elements';

import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { SavingsAccountService } from 'app/services/SavingsAccountService';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/savingsAccount/DebiCheckMandates';
import 'app/components/dialogs//quickTransactions/DeclineDebiCheckMandate';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/SearchOtherNeed';
import 'app/components/dialogs/quickTransactions/ViewInfoDebiCheck';
import 'app/components/dialogs/quickTransactions/ProofOfAccount';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1,
	SELECT_ASSIGN_REASON: 2,
	ASSIGN: 3,
	VERIFY_NOW: 4,
	ALERT_MODAL: 5,
	DEBI_CHECK_PAGE: 6,
	DEBI_CHECK_APPROVE: 7,
	DEBI_CHECK_DECLINE: 8,
	DEBI_CHECK_VIEW_INFO: 9,
    UPDATE_CARD_LIMITS: 10,
    PROOF_OF_ACCOUNT: 11,
	SEARCH_OTHER_NEED:12
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
		this.navigationContext = NavigationContext.getInstance();

        this.state = this.horizonStore.recoverState();
        this.callerInformation = this.state.callerInformation;
        this.incomingCallDetails = this.state.incomingCallDetails;

		// private properites
		this.verificationToastDisplayed = this.callerInformation.verificationToastDisplayed;

		this.verificationStatus = this.callerInformation.verificationStatus;
		this.isBusy = false;
		this.isLoading = true;

		// private variables
		this.isReassigned = false;
		this.landingPageInfo = null;
		this.debiCheckMandates = {};
		this.curOptionEvent = {};
		this.cards = [];
        this.debiCheckDetails = {};

		// When returning from the success screen, check which page we should display
		if (this.state.returnTo && this.state.returnTo.mode === `mandate`) {
			this._debiCheck();
		} else {
			this.renderMode = RENDER_MODE.MAIN_PAGE;

		}

		// Subscribe to shell events
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._assignIncidentClick());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
		
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.savingsAccountService = new SavingsAccountService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			isBusy: { attribute: false },
			isLoading: { attribute: false },
			renderMode: { attribute: false },
			verificationStatus: { attribute: false },
			verificationToastDisplayed: { attribute: false }
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
			const searchOtherNeed=()=>this._searchOtherNeed()

			const actions = {
				'stop-card': stopCard,
				'debi-check': debiCheck,
				'update-card-limits': updateCardLimits,
				'tap-to-pay': tapToPay,
				'statements': statements,
				'tax-certificate': taxCertificates,
				'proof-of-account': proofOfAccount,
				'search-other-need':searchOtherNeed
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

	_mainPage() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
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

	async _mandateActionClick (event) {
		if (event.detail.action === `decline`) {
			this.mandateId = event.detail.mandateId;
			this.renderMode = RENDER_MODE.DEBI_CHECK_DECLINE;
		} else if (event.detail.action === `approve`) {
			const state = {
				returnTo: {
					route: this.navigationContext.current.route.path,
					mode: ``
				}
			};
			this.horizonStore.saveState(state);
			this.horizonRouter.navigateToDebiCheckSuccess();
		} else if (event.detail.action === `viewInfo`) {
			const returnValue = await this.savingsAccountService.debiCheckDetails(this.callerInformation.cifNumber, event.detail.mandateId, event.detail.registerId);
			if (returnValue.succeeded && returnValue.result) {
				this.debiCheckDetails = returnValue.result;
				this.renderMode = RENDER_MODE.DEBI_CHECK_VIEW_INFO;
			} else {
				this.horizonRouter.navigateToSystemError();
			}
		}
	}

	async _declineDebiCheckMandate(event) {
		this.mandateId = event.detail.mandateId;

		const returnValue = await this.savingsAccountService.debiCheckDecline(this.callerInformation.cifNumber, mandateReferenceNumber, debtorAccountNumber);

		this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
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

			 	// Now we can update the information on the product buttons
			 	this._updateLeftBar();
			 }
		} else {
			// minimal object for the Favourites landing page component
			this.isLoading = false;
			this.landingPageInfo = { pendingMandateCount: 0 };
		}
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
			callerInformation: this.callerInformation,
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_shouldToastDisplay() {
		if (this.verificationToastDisplayed) {
			return false;
		} 

		this.callerInformation.verificationToastDisplayed = true;
		this.horizonStore.saveState(this.callerInformation);

		this.verificationToastDisplayed = true;
		return true;
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
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

		if (returnValue.succeeded) {
			this.incomingCallDetails.ivrOptionCode = `StopCard`;
			this.incomingCallDetails.ivrOption.value = `StopCard`;

			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation,
				clientProfileDetails: returnValue.result
			});
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _debiCheck() {
		const returnValue = await this.savingsAccountService.debiCheckMandates(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			// eslint-disable-next-line no-extra-parens
			this.debiCheckMandates = (returnValue.result && returnValue.result.mandateSummaryList) || [];
			this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE;
		} else {
			// Todo: Handle error scenario
		}
	}

	async _updateCardLimits() {
		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
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
        this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
	}

	_unavailableOption() {
		this.renderMode = RENDER_MODE.ALERT_MODAL;
	}

	_searchOtherNeed(){
		//TODO: Navigation to search other needs page 
		this.renderMode=RENDER_MODE.SEARCH_OTHER_NEED;
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
			${this._renderFavouritesLandingPage()}
			${this._renderUpdateCardLimits()}

			${this._renderDebiCheckMandates()}
			${this._renderDebiCheckDeclineMandate()}
			${this._renderDebiCheckViewMandateInfo()}

			${this._renderAlertModal()}
			${this._renderVerifyNowModal()}
			${this._renderEndCallSessionModal()}
			${this._renderLoadingIndicator()}
            ${this._renderProofOfAccount()}
			${this._renderSearchOtherNeed()}
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_renderFavouritesLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.PROOF_OF_ACCOUNT:
			case RENDER_MODE.VERIFY_NOW:
			case RENDER_MODE.END_CALL:
			case RENDER_MODE.ALERT_MODAL:
				return html`
				<horizon-favourite-transactions 
					class="favourites"
					.landingPageInfo="${this.landingPageInfo}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					.verificationStatus="${this.verificationStatus}"
					?displayVerificationStatusToast="${this._shouldToastDisplay()}"
					@verify-click="${() => this._verifyClick()}"
					@option-click="${(e) => this._onFavouritesOptionClick(e)}">
				</horizon-favourite-transactions>`;
			default:
				return html``;
		}
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
					endCallContext="LandingPage"
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


	// Renders the main debi-check mandates display
	_renderDebiCheckMandates() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_PAGE || this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE
			? html`
				<debi-check-mandates
					.debiCheckMandates="${this.debiCheckMandates}"
					@action="${(event) => this._mandateActionClick(event)}"
					@back="${() => this._mainPage()}">
				</debi-check-mandates>`
			: html``;
	}

	_renderDebiCheckDeclineMandate() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_DECLINE 
			? html`
				<horizon-decline-debicheck-mandate
					mandateId=${this.mandateId}
					@cancel="${() => this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE}"
					@decline="${(event) => this._declineDebiCheckMandate(event)}">
				</horizon-decline-debicheck-mandate>`
			: html``;
	}

	_renderDebiCheckViewMandateInfo() {
		return this.renderMode === RENDER_MODE.DEBI_CHECK_VIEW_INFO
		? html`
			<horizon-viewinfo-debicheck
				.debiCheckDetails=${this.debiCheckDetails}
				@viewed="${() => this.renderMode = RENDER_MODE.DEBI_CHECK_PAGE}"
			></horizon-viewinfo-debicheck>`
		: html``;
	}

	_renderUpdateCardLimits() {
		return this.renderMode === RENDER_MODE.UPDATE_CARD_LIMITS
			? html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-card-limits-landing>`
			: html``;
    }

    _renderProofOfAccount() {
        return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
            ? html`
                <horizon-proof-of-account
                    .incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
                    .landingPageInfo="${this.landingPageInfo}"
                    ></horizon-proof-of-account>`
            : html``; 
    }

	_renderSearchOtherNeed(){
		return this.renderMode=== RENDER_MODE.SEARCH_OTHER_NEED
		? html`
		<search-other-need
		    .incomingCallDetails="${this.incomingCallDetails}"
		    .callerInformation="${this.callerInformation}"
            .landingPageInfo="${this.landingPageInfo}"
			@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
		</search-other-need>`
		: html``;
	}
}

customElements.define(`horizon-favourites`, Favourites);