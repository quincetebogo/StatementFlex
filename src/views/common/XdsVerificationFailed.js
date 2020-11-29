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

		const state = this.horizonStore.recoverState();

		this.incomingCallDetails = state.incomingCallDetails;
		this.callerInformation = state.callerInformation;

		// Subscribe to shell events
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
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


		// Dispatch table/function for routing to other pages
		this.navigateToUnverifiedLandingPage = ivrOption => {

			const stopCard = () => this.horizonRouter.navigateToStopCard();
			const transact = () => this.horizonRouter.navigateToQuickTransactionFavourites();
			const insure = this.callerInformation.hasInsuranceProducts ? () => this.horizonRouter.navigateToInsureExistingClient() : () => this.horizonRouter.navigateToInsureProspectiveClient();

			return {
				StopCard: stopCard,
				Transact: transact,
				Insure: insure
			}[ivrOption];
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this.navigateToUnverifiedLandingPage(this.incomingCallDetails.ivrOptionCode)();
	}

	_verifyViaAppClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerificationClick(e) {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_endCallClick() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCallClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
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
				right="Verify Via Banking App"
				toast="Your Verification has failed."
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
}

customElements.define(`horizon-xds-verification-failed`, XdsVerificationFailed);