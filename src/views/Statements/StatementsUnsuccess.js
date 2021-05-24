import { HorizonTelemetry, TelemetryScreen} from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/Views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Unsuccessful screen statement for savings account was not emailed.
 *
 * @export
 * @class StatementsUnsuccess
 * @extends {ViewBase}
 */
export class StatementsUnsuccess extends ViewBase {

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
	 * @memberof StatementsUnsuccess
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
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);

			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incidentDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});
		}
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
		
		const transactLP = () => this.horizonRouter.navigateToQuickTransactionFavourites();
		const savingsAccountLP = () => this.horizonRouter.navigateToSavingsAccount();

		const landingScreens = {
			'Favourites': transactLP,
			'SavingsAccount': savingsAccountLP
		};
		landingScreens[returnToScreen.name]();
	}

	_handoffClick() {
		// Telemetry
		HorizonTelemetry.instance.screenUnloadStatements({
			screen: TelemetryScreen.STATEMENTS_OUTCOME,
			nextScreen: null
		});
		const incidentRecId = this.incidentDetails.incidentRecId;

		this.horizonRouter.navigateToStrack(incidentRecId);
		this.horizonRouter.navigateToReturnPage(`handoff`);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon--error-screen {
					--horizon-error-screen-height:768px;
				}

				#id-error-msg {
					width: auto;
					font-weight:500;
					color:#3A3A3A;
					margin-bottom:35px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUnsuccessScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderUnsuccessScreen() {
		return html`
			<horizon--error-screen header="Statement not emailed"
									image="/images/insure/assign-pay-arrears.svg"
									left="Done"
									right="Assign"
									toast="Statement not emailed"
									@left-click=${() => this._doneClick()}
									@right-click=${() => this._handoffClick()}>
				<section 
					id="id-error-msg" 
					slot="detail">The statement for savings account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
				</section>
			</horizon--error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-statements-unsuccess`, StatementsUnsuccess);