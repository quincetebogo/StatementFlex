import { css, html } from 'platform/elements';
import { SQFailedMixin } from 'app/views/common/SQFailedMixin';
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

	connectedCallback() {
		super.connectedCallback();

		// TODO: Telemetry start span comes here

		this._updateMiniProfile();
		this.endCallContext = `VerifyClientFailed`;
	}

	disconnectedCallback() {
		// TODO: Telemetry end span comes here

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
		// TODO: Telemetry log event comes here

		this._navigateToLP();
	}

	_verifyViaApp() {
		// TODO: Telemetry log event comes here

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