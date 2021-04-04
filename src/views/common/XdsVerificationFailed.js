import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/dialogs/common/VerifyCaller';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	VERIFY_NOW: 1,
	END_CALL: 2
});

/**
 * The XDS Verification Failed screen is displayed the second time a client fails verification.
 * After this, validation via security questions should be blocked. 
 * Verfication via the App may still be allowed.
 *
 * @export
 * @class XdsVerificationFailed
 * @extends {View}
 */
export class XdsVerificationFailed extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isReassigned = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incidentDetails = this.horizonStore.getIncidentDetails();

		// Subscribe to shell events
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyViaAppClick());
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			renderMode: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._updateMiniProfile();
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_verifyViaAppClick() {
		if (this.callerInformation.hasDigitalChannels) {
			this.renderMode = RENDER_MODE.VERIFY_NOW;
		}
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

	_verified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_endCallClick() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCallClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_updateMiniProfile() {
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		const state = { 
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
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
					--horizon-error-screen-size: 889px;
				}
			`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			<horizon--error-screen 
				header="Verification was unsuccessful" 
				left="Continue Unverified"
				right="${this.callerInformation.hasDigitalChannels ? `Verify Via Banking App` : ``}"
				toast="Your Verification has failed."
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._continueUnverifiedClick()}
				@right-click=${() => this._verifyViaAppClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24 hours.</section>
			</horizon--error-screen>
			${this._renderVerifyNowModal()}
			${this._renderEndCallSessionModal()}
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

	_renderEndCallSessionModal() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}" 
					.isReassigned="${this.isReassigned}"
					endCallContext="LandingPage"
					@cancel="{${() => this._cancelEndCallClick()}}">
				</horizon-end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`horizon-xds-verification-failed`, XdsVerificationFailed);