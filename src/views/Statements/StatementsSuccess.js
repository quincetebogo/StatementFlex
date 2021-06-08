import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

export class StatementsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();

		this.mailId = screenDetails && screenDetails.emailAddress;
		this.acNumber = screenDetails && screenDetails.accountNumber;

		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
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

		this.horizonRouter.navigateToReturnPage();
	}

	_sendAnotherClick() {
		// Telemetry
		HorizonTelemetry.instance.selectSendAnotherStatement({
			screen: TelemetryScreen.STATEMENTS_OUTCOME,
			nextScreen: TelemetryScreen.STATEMENTS
		});

		this.horizonRouter.navigateToReturnPage();
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