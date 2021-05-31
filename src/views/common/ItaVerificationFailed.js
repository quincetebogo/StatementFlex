import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/common/VerifyCaller.js';
import 'app/components/quickTransactions/FavouriteTransactions';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	VERIFY_NOW: 1,
	END_CALL: 2
};

export class ItaVerificationFailed extends View {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = -1;
		this.isBusy = false;
		this.isReassigned = false;
		this.callerInformation = {};
		this.securityQuestions = {};
		this.incomingCallDetails = {};

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
	}

	// ---------------
	// PROPERTIES
	// ---------------

	static get properties() {
		return {
			renderMode: { type: Number },
			isBusy: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.isReassigned = this.horizonStore.getIsIncidentReassigned();

		this._updateLeftBar();

		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyUsingSecurityQuestions());
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();
		super.disconnectedCallback();
	}

	// -------------
	// PRIVATE METHODS
	// -------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_updateLeftBar() {
		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.MAIN_PAGE;

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onCancelEndCall() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_verifyViaSecurityQuestionsClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
				#id-error-msg{
					width: 550px;
				}
				horizon--error-screen {
					--horizon-error-screen-size: 912px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
				${this._renderLoadingIndicator()}
				<horizon--error-screen 
					header="Verification was unsuccessful"
					left="Continue Unverified"
					right="Verify Via Security Questions" 
					toast="Your Verification has failed." 
					image="/images/insure/assign-pay-arrears.svg"
					@left-click=${() => this._continueUnverifiedClick()}
					@right-click=${() => this._verifyViaSecurityQuestionsClick()}>
						<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24
							hours.</section>
				</horizon--error-screen>
				${this._renderVerifySecurityQuestions()}
				${this._renderEndCallSessionDialog()}
		`;
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}" 
					.callerInformation ="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session
						.incidentDetails="${this.incidentDetails}"
						.incomingCallDetails="${this.incomingCallDetails}" 
						?isReassigned="${this.isReassigned}"
						endCallContext="LandingPage"
						@cancel="{${() => this._onCancelEndCall()}}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		}
		return html``;
	}
}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);