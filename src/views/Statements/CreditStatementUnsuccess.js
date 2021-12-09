import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Unsuccessful screen statement for savings account was not emailed.
 *
 * @export
 * @class CreditStatementsUnsuccess
 * @extends {ViewBase}
 */
export class CreditStatementsUnsuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this._telemetry = HorizonTelemetry.instance;
	}


	// ----------
	// PROPERTIES
	// ----------
	
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();
		
		this.mailId = this.screenDetails && this.screenDetails.emailAddress;
		this.acNumber = this.screenDetails && this.screenDetails.accountNumber;
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}
		
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		// Telemetry
		this._telemetry.endSpan(QuickTransactionEvents.STATEMENTS, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME,
			"nextScreen": TelemetryScreen.FAVOURITES
		});
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_handoffClick() {
		// Telemetry
		this._telemetry.endSpan(QuickTransactionEvents.STATEMENTS, {
			"screen": TelemetryScreen.STATEMENTS_OUTCOME
		});
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.ASSIGNED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
		this.horizonStore.clearReturnScreen();
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
							The statement for credit card account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="credit-statements-unsuccess-related-options"
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS}">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-credit-statements-unsuccess`, CreditStatementsUnsuccess);