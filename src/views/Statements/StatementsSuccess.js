import { HorizonTelemetry, TelemetryScreen} from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from '../common/ViewBase';

import 'app/components/common/SuccessScreen';

export class StatementsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

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

			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incidentDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});

			this._updateIncidentState();
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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
				#id-error-msg {
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

			${super._webTemplate()}
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

}

customElements.define(`horizon-statements-success`, StatementsSuccess);