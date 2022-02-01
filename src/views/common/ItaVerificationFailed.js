import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { VerifyCallerEvents } from 'app/constants/telemetry/events/VerifyCaller';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';

export class ItaVerificationFailed extends ViewBase {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// ---------------
	// PROPERTIES
	// ---------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(VerifyCallerEvents.ITA_VERIFICATION_FAILED);

		this._updateLeftBar();
		this.endCallContext = `VerifyClientFailed`;
	}

	disconnectedCallback() {
		this._telemetry.endSpan(VerifyCallerEvents.ITA_VERIFICATION_FAILED);
	
		super.disconnectedCallback();
	}

	// -------------
	// PRIVATE METHODS
	// -------------

	async _clientVerified(event) {
		await super._clientVerified(event);

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
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

	// --------------
	// EVENT HANDLERS
	// --------------

	_leftClick() {

		this._telemetry.logEvent(VerifyCallerEvents.ITA_VERIFICATION_FAILED_CONTINUE_UNVERIFIED, {
			"screen": TelemetryScreen.ITA_FAILED,
			"next-screen": TelemetryScreen.FAVOURITES
		}, true);

		this.horizonRouter.navigateToQuickTransactionFavourites();
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
					--horizon-error-screen-height: 876px;
					--horizon-error-screen-size: 876px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderItaFailureScreen()}

			${super._webTemplate()}
		`;
	}

	_renderItaFailureScreen() {
		return html`
			<horizon-error-screen 
				header="Verification was unsuccessful"
				left="Continue Unverified"
				toast="Your Verification has failed." 
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._leftClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24hours.</section>
			</horizon-error-screen>
		`;
	}

}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);