import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

export class TapToPaySuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.selecetedCard = ``;
		this.tapToPayStatus = ``;
		this.maskedCardNumber = ``;
		this.cardType = ``;

		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			maskedCardNumber: { type: String }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();

		this.tapToPayStatus = screenDetails.tapToPayDetails.tapToPayStatus;
		this.cardMaskedNumber = screenDetails.tapToPayDetails.cardMaskedNumber;
		this.cardType = screenDetails.tapToPayDetails.cardType === `DEBIT_MASTERCARD` ? `debit` : `credit`;
		this._updateIncidentState();
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

	_tapToPayClick() {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_OUTCOME_ANOTHER, {
			"screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"next-screen": TelemetryScreen.TAP_TO_PAY
		});

		this.horizonRouter.navigateToReturnPage();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

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
				#id-update-msg {
					width: auto;
				}

				horizon-success-screen {
					--horizon-button-group-margin-top: 28px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderTapToPaySuccess()}

			${super._webTemplate()}
		`;
	}

	_renderTapToPaySuccess() {
		return html`
			<horizon-success-screen 
				header="Tap to pay ${this.tapToPayStatus === `ON` ? `activation pending` : `deactivated`}"
				image="/images/cards-successful-tap-to-pay.svg"
				left="Done"
				right="Tap to Pay"
				toast="Tap to pay ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`}"
				sub_detail="true"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tapToPayClick()}>
					<section 
						id="id-update-msg" 
						slot="detail">
							Your ${this.cardType} card <b>${this.cardMaskedNumber}</b> is ${this.tapToPayStatus === `ON` ? `pending tap to pay activation. To complete activation, insert card into card machine or ATM` : `deactivated`}.
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-tap-to-pay-success`, TapToPaySuccess);