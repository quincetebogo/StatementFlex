import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Unsuccessful screen statement for savings account was not emailed.
 *
 * @export
 * @class StatementsUnsuccess
 * @extends {ViewBase}
 */
export class StatementsFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
		this.accType = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
	}


	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();
		
		this.mailId = this.screenDetails && this.screenDetails.emailAddress;
		this.acNumber = this.screenDetails && this.screenDetails.accountNumber;
		this.accType = this.screenDetails && this.screenDetails.accountType;
		this.telemetryEvent = this.screenDetails?.telemetryEvent ?? {};

		this.horizonIncidentManager.IncidentState = super.HORIZON_NEED_STATUS.FAILED;

		await this._telemetry.startSpan(this.telemetryEvent.STATEMENTS_FAILURE);

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``); // Failure flow don't have perform again action
	}
		
	async disconnectedCallback() {
		super.disconnectedCallback();

		await this._telemetry.endSpan(this.telemetryEvent.STATEMENTS_FAILURE, {}, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_FAILURE_DONE, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME
		});
		
		this.horizonRouter.navigateToReturnPage();
	}

	async _handoffClick() {
		await this._telemetry.logEvent(this.telemetryEvent.STATEMENTS_FAILURE_ASSIGN, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME
		});

		this.horizonIncidentManager.IncidentState = super.HORIZON_NEED_STATUS.ASSIGNED;

		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.getCurrentIncident().incidentRecId);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
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
			<horizon-error-screen
				data-automation-id="statements-unsuccess"
				header="Statement not emailed"
				image="/images/insure/assign-pay-arrears.svg"
				left="Done"
				right="Assign"
				toast="Statement not emailed"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._handoffClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							The statement for ${this.accType} <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="statements-unsuccess-related-options"
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS}">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-statements-failure`, StatementsFailure);