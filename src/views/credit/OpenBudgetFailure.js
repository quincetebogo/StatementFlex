import { css, html } from 'platform/elements';
import { CreditEvents } from 'app/constants/telemetry/events/Credit';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Unsuccessful screen when open budget for credit card is failed
 *
 * @export
 * @class OpenBudgetFailure
 * @extends {ViewBase}
 */
export class OpenBudgetFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.endCallContext = `QuickTransactionsUnSuccess`;
		this.screenDetails = this.horizonStore.getScreenDetails();
	}


	// ----------
	// PROPERTIES
	// ----------

	get narrative() {
		return this.screenDetails.narrative;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._telemetry.startSpan(CreditEvents.OPEN_BUDGET_FAILURE);

		/* Removed during incident management refactor
		this._updateIncidentState();
		*/
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(CreditEvents.OPEN_BUDGET_FAILURE);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _doneClick() {
		await this._telemetry.logEvent(CreditEvents.OPEN_BUDGET_FAILURE_DONE);
		this.horizonStore.clearScreenDetails();
		this.horizonRouter.navigateToCreditAccount();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/* Removed during incident management refactor
	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}
	*/

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height:744px;
					--horizon-error-screen-label-margin-top: 10px;
					--horizon-error-screen-action-margin-top: 0px;
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
				data-automation-id="open-budget-failure"
				header="Budget was not added"
				image="platform/illustrations/transfer.svg"
				right="Done"
				toast="Budget was not added"
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">
							<b>${this.narrative}</b> budget facility was not added.
					</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="open-budget-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-open-budget-failure`, OpenBudgetFailure);