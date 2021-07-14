import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';
import 'app/components/common/ErrorScreen';


const MAX_ITA_ATTEMPTS = 3;

/**
 * The XDS Verification Failed screen is displayed the second time a client fails verification.
 * After this, validation via security questions should be blocked. 
 * Verfication via the App may still be allowed.
 *
 * @export
 * @class XdsVerificationFailed
 * @extends {ViewBase}
 */
export class XdsVerificationFailed extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._updateMiniProfile();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
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
	_itaAvailable() {
		// itaAttempts is 0 based and is incremented on successful initiation of an ITA request
		return this.callerInformation.hasDigitalChannels && this.callerInformation.verificationAttempts.itaAttempts < MAX_ITA_ATTEMPTS;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host {
					width: 100%;
					height: 100%;
				}
				#id-error-msg {
					width: 550px;
				}
				horizon-error-screen {
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
			${this._renderXdsFailureScreen()}

			${super._webTemplate()}
		`;
	}

	_renderXdsFailureScreen() {
		return html`
			<horizon-error-screen 
				header="Verification was unsuccessful" 
				left="Continue Unverified"
				right="${ this._itaAvailable() ? `Verify Via Banking App` : ``}"
				toast="Your Verification has failed."
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._continueUnverifiedClick()}
				@right-click=${() => super._verifyClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24 hours.</section>
			</horizon-error-screen>
		`;
	}

}

customElements.define(`horizon-xds-verification-failed`, XdsVerificationFailed);