import { css, html } from 'platform/elements';
import { SQFailedMixin } from 'app/views/common/SQFailedMixin';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';

import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';

/**
 * The KBA Verification Failed screen is displayed when client fails verification.
 * After this, validation via security questions should be blocked. 
 * Verfication via the App may still be allowed.
 *
 * @export
 * @class KbaVerificationFailed
 * @extends {ViewBase}
 */
export class KbaVerificationFailed extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		Object.assign(KbaVerificationFailed.prototype, SQFailedMixin);
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._telemetry.startSpan(VerifyCallerEvents.KBA_VERIFICATION_FAILED);

		this._updateMiniProfile();
		this.endCallContext = `VerifyClientFailed`;
	}

	async disconnectedCallback() {
		await this._telemetry.endSpan(VerifyCallerEvents.KBA_VERIFICATION_FAILED);

		super.disconnectedCallback();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

	// --------------
	// EVENT HANDLERS
	// --------------

	_continueUnverifiedClick() {
		this._telemetry.logEvent(VerifyCallerEvents.KBA_VERIFICATION_FAILED_CONTINUE_UNVERIFIED, {
			"screen": TelemetryScreen.KBA_FAILED,
			"next-screen": TelemetryScreen.FAVOURITES
		}, true);

		this._navigateToLP();
	}

	_verifyViaApp() {
		this._telemetry.logEvent(VerifyCallerEvents.KBA_VERIFICATION_FAILED_VERIFY_VIA_APP, {
			"screen": TelemetryScreen.KBA_FAILED,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		}, true);

		super._verifyClick();
	}

	// ---------
	// RENDERING
	// ---------
	
	// N/A

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
			${this._renderSQFailureScreen()}

			${super._webTemplate()}
		`;
	}
}

customElements.define(`horizon-kba-verification-failed`, KbaVerificationFailed);