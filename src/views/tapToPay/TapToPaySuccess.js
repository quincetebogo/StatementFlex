import { css, html } from 'platform/elements';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
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
		this.endCallContext = `QuickTransactionSuccess`;
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
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
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
					height: auto;
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
				data-automation-id="tap-to-pay-success"
				header="Tap to pay ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`}"
				image="/images/tapToPay/cards-successful-tap-to-pay.svg"
				left="Tap to Pay"
				right="Done"
				toast="Tap to pay ${this.tapToPayStatus === `ON` ? `activated` : `deactivated`}"
				@left-click=${() => this._tapToPayClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-update-msg" 
						slot="detail">
							The tap to pay functionality on your ${this.cardType} card <b>${this.cardMaskedNumber} </b> ${this.tapToPayStatus === `ON` 
							? html`is pending tap to pay activation. <br /> To complete activation, insert card into card machine or ATM`
							: `is deactivated`}.
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-tap-to-pay-success`, TapToPaySuccess);