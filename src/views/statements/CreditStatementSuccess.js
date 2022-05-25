import { css, html } from 'platform/elements';
import { STATEMENT_EVENTS } from 'app/constants/telemetry/events/Credit';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

export class CreditStatementsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
		this.endCallContext = `QuickTransactionSuccess`;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	// N/A

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._telemetry.startSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"outcome": `Success`
		});

		const screenDetails = this.horizonStore.getScreenDetails();

		this.mailId = screenDetails && screenDetails.emailAddress;
		this.acNumber = screenDetails && screenDetails.accountNumber;

		this._updateIncidentState();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();

		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(STATEMENT_EVENTS.STATEMENTS_SUCCESS_DONE, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"nextScreen": TelemetryScreen.CREDIT_LANDING
		});
		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS, {}, true, true);
		
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToCreditAccount();
	}

	async _sendAnotherClick() {
		await this._telemetry.logEvent(STATEMENT_EVENTS.STATEMENTS_SEND_ANOTHER, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS,
			"nextScreen": TelemetryScreen.CREDIT_STATEMENTS
		});
		await this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS_SUCCESS);

		this._telemetry.endSpan(CreditEvents.CREDIT_STATEMENTS_SUCCESS, {
			"screen": TelemetryScreen.CREDIT_STATEMENTS_SUCCESS
		});

		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
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
				data-automation-id="credit-statements-success"
				header="Statement sent" 
				image="/images/statements/senddocuments.svg"
				left="Send Another"
				right="Done"
				toast="Statement sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							The statement for credit card account <b>${this.acNumber}</b> was emailed to <b>${this.mailId}</b>
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-credit-statements-success`, CreditStatementsSuccess);