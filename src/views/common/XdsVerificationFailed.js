import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';
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

		this._telemetry.startSpan(VerifyCallerEvents.XDS_VERIFICATION_FAILED);

		this._updateMiniProfile();
		this.endCallContext = `VerifyClientFailed`;
	}

	disconnectedCallback() {
		this._telemetry.endSpan(VerifyCallerEvents.XDS_VERIFICATION_FAILED);

		super.disconnectedCallback();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _clientVerified(event) {
		await super._clientVerified(event);

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this._telemetry.logEvent(VerifyCallerEvents.XDS_VERIFICATION_FAILED_CONTINUE_UNVERIFIED, {
			"screen": TelemetryScreen.XDS_FAILED,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	}

	_verifyViaApp() {
		this._telemetry.logEvent(VerifyCallerEvents.XDS_VERIFICATION_FAILED_VERIFY_VIA_APP, {
				"screen": TelemetryScreen.XDS_FAILED,
				"next-screen": TelemetryScreen.FAVOURITES
		});

		super._verifyClick()
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
					width: auto;
				}
				horizon-error-screen {
					--horizon-error-screen-height: 876px;
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
				right="${this._itaAvailable() ? `Verify Via App/USSD` : ``}"
				toast="Verification has failed."
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._continueUnverifiedClick()}
				@right-click=${() => this._verifyViaApp()}>
				<section id="id-error-msg" slot="detail">Please visit a branch to unblock your access. You can continue with limited transactions.</section>
			</horizon-error-screen>
		`;
	}

}

customElements.define(`horizon-xds-verification-failed`, XdsVerificationFailed);