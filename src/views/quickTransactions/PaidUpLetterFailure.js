import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Paid Up Letter send failure Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class PaidUpLetterFailure
 * @extends {ViewBase}
 */

 export class PaidUpLetterFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = `ivanmakatini@gmail.com`;
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

		 //REMOVE HARD CODED EMAIL IN CONSTRUCTOR ONCE NAVIGATION IS IMPLEMENTED. ADD: this.mailId =  this.screenDetails && this.screenDetails.emailAddress;
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.PAID_UP_LETTER, {
			"screen": TelemetryScreen.PAID_UP_LETTER_OUTCOME
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		//TODO: ADD PAID UP LETTER TELEMETRY EVENTS
		/* this._telemetry.logEvent(QuickTransactionEvents.PAID_UP_LETTER_OUTCOME_DONE, {
			"screen": TelemetryScreen.PAID_UP_LETTER_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		}); */

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_tryAgainClick() {
		
		//TODO: ADD PAID UP LETTER TELEMETRY EVENTS
		/* this._telemetry.logEvent(QuickTransactionEvents.PAID_UP_LETTER_OUTCOME_HANDOFF, {
			"screen": TelemetryScreen.PAID_UP_LETTER_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		}); */

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
			${this._renderPaidUpLetterFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderPaidUpLetterFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="paid-up-letter-failure-screen"
				image="/images/insure/assign-pay-arrears.svg"
				header="Paid Up letter not sent" 
				left="Done"
				right="Try Again"
				toast="Paid Up letter not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgainClick()}>
				<section id="id-error-msg" slot="detail">
					Paid Up letter was not emailed to <b>${this.mailId}</b>
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="paid-up-letter-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-paid-up-letter-failure`, PaidUpLetterFailure);