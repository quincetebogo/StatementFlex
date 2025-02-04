import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * An error/failure screen that will be displayed when Tap To Pay is unsuccessfuil
 */
export class TapToPayUnsuccessful extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			card: { attribute: false },
			cardType: { attribute: String }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._updateIncidentState();

		const screenDetails = this.horizonStore.getScreenDetails();
		//this.card = screenDetails.tapToPayDetails.cardMaskedNumber;
		//this.cardType = screenDetails.tapToPayDetails.cardType === `DEBIT_MASTERCARD` ? `debit` : `credit`;

		this.card = screenDetails.tapToPayDetails.tapToPayUpdate.cardDetails.MaskedCardNumber;
		this.cardType = screenDetails.tapToPayDetails.tapToPayUpdate.cardDetails.cardDisplayName === `Debit card` ? `debit` : `credit`;

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.TAP_TO_PAY, {
			"screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"next-screen": null
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_OUTCOME_DONE, {
			"screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});


		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_handoffClick() {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_OUTCOME_HANDOFF, {
			"screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"next-screen": null
		});

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.ASSIGNED;

		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);

		this.horizonStore.clearReturnScreen();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				#id-update-msg{
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
			${this._renderTapToPayFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderTapToPayFailure() {
		return html`
			<horizon-error-screen 
				data-automation-id="tap-to-pay-unsuccessful"
				header="Tap to pay not activated" 
				image="/images/common/tap-to-pay-error.svg"
				left="Done"
				right="Assign"
				toast="Tap to pay not activated."
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._handoffClick()}>
					<section
						id="id-error-msg" 
						slot="detail">
						Tap to Pay for ${this.cardType} card ${this.card} was not activated.
					</section>
			</horizon-error-screen >
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Failure">
			</horizon-related-options>
		`;
	}
}
customElements.define(`horizon-tap-to-pay-unsuccessful`, TapToPayUnsuccessful);