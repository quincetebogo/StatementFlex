import { css, html } from 'platform/elements';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { UNLOCK_FTSP_EVENTS } from 'app/constants/telemetry/events/SavingsPlan';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

export class FixedTermSavingsPlanFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// TODO: Remove the hardcoded values when wiring up the navigation.
		this.amount = formatCurrency(`7500`);
		this.partialUnlock = true;
		this.accountName = `My dream car`;

		this.endCallContext = `QuickTransactionsUnSuccess`;
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();

		this._telemetry.startSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_FAILURE);

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
		await this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_FAILURE_DONE, {
			"screen": TelemetryScreen.UNLOCK_FTSP_FAILURE,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});

		this._telemetry.endSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP, {}, true, false, true);

		this.horizonStore.clearScreenDetails();
		this.horizonStore.clearReturnScreen();
		
		this.horizonRouter.navigateToSavingsPlan();
	}

	async _tryAgain() {
		await this._telemetry.logEvent(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_FAILURE_TRY_AGAIN, {
			"screen": TelemetryScreen.UNLOCK_FTSP_FAILURE,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_UNLOCK_FTSP
		});

		this._telemetry.endSpan(UNLOCK_FTSP_EVENTS.UNLOCK_FTSP_TRANSFER_FAILURE, {}, true, true);

		this.horizonRouter.navigateToReturnPage();
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

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height: 744px;
				}
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
			${this._renderFixedTermFailureScreen()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderFixedTermFailureScreen() {
		return html`
			<horizon-error-screen
				data-automation-id="unlock-fixed-term-savings-plan-failure-screen"
				image="/images/savings/UnlockSavings.svg"
				header="${this.screenDetails.unlockType} fixed-term unlock unsuccessful"
				left="Done"
				right="Try Again"
				toast="Unlock unsuccessful"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._tryAgain()}>
					<section id="id-error-msg" slot="detail">
					${this.screenDetails.unlockType === `Partial`
							? `${formatCurrency(this.screenDetails.unlockAmount)} Partial transfer from ${this.screenDetails.unlockAccountName} to Main savings account was unsuccessful.`
							: `Fixed-term savings plan for ${this.screenDetails.unlockAccountName} has not been unlocked.`}
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="unlock-fixed-term-savings-plan-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-unlock-fixed-term-savings-plan-failure`, FixedTermSavingsPlanFailure);