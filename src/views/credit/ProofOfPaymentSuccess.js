import { BUDGET_FACILITY_POP_EVENTS, SETTLE_AND_CLOSE_CREDIT_CARD_POP_EVENTS, SETTLE_AND_CLOSE_TERM_LOAN_POP_EVENTS } from 'app/constants/telemetry/events/Credit';
import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the proof of payment is sent to their email successfully.
 *
 * @export
 * @class ProofOfPaymentSuccess
 * @extends {ViewBase}
 */
export class ProofOfPaymentSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.accountName = ``;
		this.endCallContext = `QuickTransactionSuccess`;
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

		this.loadTelemetryEvents();

		this.mailId = screenDetails && screenDetails.emailAddress;
		this.accountName = screenDetails && (screenDetails.accountName || screenDetails.settleAndCloseProductType); 

		this._telemetry.startSpan(this.popTelemetryEvents.POP_SUCCESS);

	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(this.popTelemetryEvents.POP_SUCCESS_DONE, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		this._telemetry.endSpan(screenDetails.parentSpan, {}, true, false, true);

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToCreditAccount();
		this.horizonStore.clearScreenDetails();
	}

	async _payAnotherClick() {
		await this._telemetry.logEvent(this.popTelemetryEvents.POP_SUCCESS_PAY_ANOTHER, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT
		});
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this._telemetry.closeChildSpans(screenDetails.parentSpan);
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	loadTelemetryEvents() {
		const creditNeed = this.horizonStore.getReturnToScreen().optionalData;
		
		const telemetryEvents = {
			'view-budgets': BUDGET_FACILITY_POP_EVENTS,
			'settle-close-credit-card': SETTLE_AND_CLOSE_CREDIT_CARD_POP_EVENTS,
			'settle-close-term-loan': SETTLE_AND_CLOSE_TERM_LOAN_POP_EVENTS
		};

		this.popTelemetryEvents = telemetryEvents[creditNeed];
	}

	_leftButtonText() {
		currentNeed = this.horizonIncidentManager.getCurrentNeed();
		return currentNeed === `pay-budget-credit-card` ? `Pay Another` : ``;
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
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen 
				data-automation-id="proof-of-payment-success"
				header="Proof of payment sent"
				image="/images/statements/send-documents.svg"
				left="${this._leftButtonText()}"
				right="Done"
				toast="Proof of payment sent"
				@left-click=${() => this._payAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							Proof of payment for <b>${this.accountName}</b> was emailed to <b>${this.mailId}</b>
					</section>
			</horizon-success-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-proof-of-payment-success`, ProofOfPaymentSuccess);