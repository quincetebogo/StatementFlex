import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	DEBICHECK_SUCCESS: 0,
	END_CALLSESSION: 1
};

/**
 * Display an confirmation/success screen indicating the selected debicheck mandate have been successfully declined.
 *
 * @export
 * @class DebiCheckSuccess
 * @extends {View}
 */
export class DebiCheckSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.DEBICHECK_SUCCESS;
		this.mandateId = ``;
		
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @readonly
	 * @static
	 * @memberof DebiCheckSuccess
	 */
	static get properties() {
		return {
			renderMode: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		// Telemetry 
		HorizonTelemetry.instance.debiCheckOutcome({
			screen: TelemetryScreen.DEBICHECK_OUTCOME
		});
		const state = this.horizonStore.recoverState();

		if (state) {
			this.returnRoute = state.returnTo.route;
			
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();

			// TODO: mandate ID to be obtained from state.
			this.mandateId = `DISCLIFE 5130111776-21`;
		    this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
		}
	}

	disconnectedCallback() {
		if (this.endCallSub) {
			this.endCallSub.dispose();
		}
		
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCall() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	_doneClick() {
		// Telemetry
		HorizonTelemetry.instance.debiCheckOutcomeDone({
			nextScreen: TelemetryScreen.FAVOURITES
		});
		this.horizonRouter.navigateToReturnPage(`done`);
	}

	_debiCheckMandatesClick() {
		// Telemetry
		HorizonTelemetry.instance.debiCheckOutcomeBackToMandates({
			nextScreen: TelemetryScreen.DEBICHECK
		});
		this.horizonRouter.navigateToReturnPage(`mandate`);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				#id-error-msg{
					width: auto;
				}

				.button-margin{
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSuccessScreen()}
			${this._renderEndCallModal()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen 
				header="DebiCheck mandate approved"
				image="/images/transactions/debiCheckMandate.svg"
				secondaryImage="/images/transactions/debiCheckLogo.svg"
				left="Done"
				right="DebiCheck Mandates"
				toast="DebiCheck mandate declined."
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._debiCheckMandatesClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">DebiCheck mandate for <b>${this.mandateId}</b> has been declined.
					</section>
			</horizon-success-screen>
		`;
	}

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<horizon-end-call-session
				.incidentDetails="${this.incidentDetails}"
				.incomingCallDetails="${this.incomingCallDetails}"
				endCallContext="LandingPage"
				@cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

}

customElements.define(`horizon-debi-check-success`, DebiCheckSuccess);