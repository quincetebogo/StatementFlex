import { HorizonTelemetry, TelemetryScreen} from 'app/services/HorizonTelemetryService';
import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/EndCallSession';


const RENDER_MODE = {
	STATEMENTS_SUCCESS: 0,
	END_CALLSESSION: 1,
	STATEMENTS: 2
};

export class StatementsSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.STATEMENTS_SUCCESS;
		this.mailId = ``;
		this.acNumber = ``;
		
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
	 * @memberof StatementsSuccess
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

		const state = this.horizonStore.recoverState();

		if (state) {
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();

      		this.mailId = state.emailAddress;
      		this.acNumber = state.accountNumber;

			this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incidentDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});

			this._updateIncidentState();
		};
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
		HorizonTelemetry.instance.screenUnloadStatements({
			screen: TelemetryScreen.STATEMENTS_OUTCOME,
			nextScreen: TelemetryScreen.FAVOURITES
		});

		const state = this.horizonStore.recoverState();
		const returnToScreen = state && state.returnToScreen;
		
		this._navigateToScreen(returnToScreen.name);
	}

	_sendAnotherClick() {
		// Telemetry
		HorizonTelemetry.instance.selectSendAnotherStatement({
			screen: TelemetryScreen.STATEMENTS_OUTCOME,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		const state = this.horizonStore.recoverState();
		state.returnToScreen.option = this.incidentDetails.currentNeed;
		
		this.horizonStore.saveState({ returnToScreen: state.returnToScreen });
		this._navigateToScreen(state.returnToScreen.name);
	}

	_navigateToScreen(screenName) {
		const transactLP = () => this.horizonRouter.navigateToQuickTransactionFavourites();
		const savingsAccountLP = () => this.horizonRouter.navigateToSavingsAccount();

		const landingScreens = {
			'Favourites': transactLP,
			'SavingsAccount': savingsAccountLP
		};
		landingScreens[screenName]();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);
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
				header="Statement sent" 
				image="/images/statements/senddocuments.svg"
				left="Done"
				right="Send Another"
				toast="Statement sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._sendAnotherClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							The statement for savings account <b>${this.acNumber}</b> was emailed to <b>${this.mailId}</b>
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

customElements.define(`horizon-statements-success`, StatementsSuccess);