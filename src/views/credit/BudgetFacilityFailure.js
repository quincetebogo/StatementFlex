import { css, html } from 'platform/elements';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation screen indicating the budget facility for the selected account was not successful.
 *
 * @export
 * @class BudgetFacilityFailure
 * @extends {ViewBase}
 */
 export class BudgetFacilityFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.budgetName = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.budgetName = screenDetails?.accountName;

		this._telemetry.startSpan(CreditEvents.PAY_BUDGET_TRANSFER_FAILURE);

		this.horizonIncidentManager.setIncidentState(super.HORIZON_NEED_STATUS.FAILED);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER_FAILURE_DONE, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_FAILURE,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(CreditEvents.CREDIT_BUDGET_DETAILS, {}, true, false, true);

		this.horizonRouter.navigateToCreditAccount();
		this.horizonStore.clearScreenDetails();
	}

	_tryAgainClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER_FAILURE_TRY_AGAIN, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_FAILURE,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_MODAL
		});

		this._telemetry.endSpan(CreditEvents.PAY_BUDGET_TRANSFER_FAILURE);

		this.horizonRouter.navigateToCreditAccount();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFailureScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFailureScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="budget-facility-failure-screen"
				header="Budget facility was not paid"
				image="/images/credit/budget-facility.svg"
				left="Done"
				right="Try Again"
				toast="Budget facility was not paid"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgainClick()}>
					${this._renderDetail()}
			</horizon-error-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				slot="detail">
				Budget facility for <strong>${this.budgetName}</strong> was not paid.
			</section>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="budget-facility-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-budget-facility-failure`, BudgetFacilityFailure);