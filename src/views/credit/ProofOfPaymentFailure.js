import { css, html } from 'platform/elements';
import { BUDGET_FACILITY_POP_EVENTS } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Unsuccessful screen where proof of payment for selected account was not emailed.
 *
 * @export
 * @class ProofOfPaymentFailure
 * @extends {ViewBase}
 */
export class ProofOfPaymentFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.accountName = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
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
		this.accountName = screenDetails && screenDetails.accountName;

		this.loadTelemetryEvents();

		this._telemetry.startSpan(this.popTelemetryEvents.POP_FAILURE);

		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;

		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}
		
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(this.popTelemetryEvents.POP_FAILURE_DONE, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_FAILURE,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		this._telemetry.endSpan(screenDetails.parentSpan, {}, true, false, true);
		
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
		this.horizonStore.clearScreenDetails();
	}

	async _tryAgainClick() {
		await this._telemetry.logEvent(this.popTelemetryEvents.POP_FAILURE_TRY_AGAIN, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_FAILURE,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL
		});
		this._telemetry.endSpan(this.popTelemetryEvents.POP_FAILURE);
		
		this.horizonRouter.navigateToReturnPage();
	}

	loadTelemetryEvents() {
		const creditNeed = this.horizonStore.getReturnToScreen().optionalData;
		
		const telemetryEvents = {
			'view-budgets': BUDGET_FACILITY_POP_EVENTS,
			'settle-close': null // Load telemetry events for Settle and close prrof of payment flow 
		};

		this.popTelemetryEvents = telemetryEvents[creditNeed];
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height:744px;
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
			${super._webTemplate()}
			${this._renderUnsuccessScreen()}
			${this._renderRelatedOptions()}
		`;
	}

	_renderUnsuccessScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="proof-of-payment-failure"
				header="Proof of payment not emailed"
				image="/images/insure/assign-pay-arrears.svg"
				left="Done"
				right="Try Again"
				toast="Proof of payment not emailed"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgainClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							Proof of payment for <b>${this.accountName}</b> was not emailed to <b>${this.mailId}</b>
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="proof-of-payment-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-proof-of-payment-failure`, ProofOfPaymentFailure);