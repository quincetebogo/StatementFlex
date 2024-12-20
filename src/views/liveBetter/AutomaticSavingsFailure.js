import { css, html } from 'platform/elements';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an Failure screen indicating the automatic savings has not been updated successfully.
 *
 * @export
 * @class AutomaticSavingsFailure
 * @extends {ViewBase}
 */
export class AutomaticSavingsFailure extends ViewBase {

	constructor() {
		super();
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
		this.updatedLBSADetails = this.screenDetails.updatedLBSADetails;
		this.LBSADetails = this.screenDetails.LBSADetails;

		this.hasRoundupChanged = !isNullorEmpty(this.updatedLBSADetails?.accountRoundUpActive) ||
			Boolean(this.updatedLBSADetails?.roundUpValue) ||
			Boolean(this.updatedLBSADetails?.activatedRoundUpAccounts);
		this.hasInterestSweepChanged = !isNullorEmpty(this.updatedLBSADetails?.accountInterestSweepActive);

		this._telemetry.startSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_FAILURE);

		/* Removed during incident mangagement refactor
		this._updateIncidentState();
		*/
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.endSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_FAILURE_DONE, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_FAILURE,
			"next-screen": TelemetryScreen.LIVE_BETTER
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToLiveBetter();
	}

	_assignClick() {
		this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_FAILURE_ASSIGN, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_FAILURE,
			"next-screen": TelemetryScreen.LIVE_BETTER
		});

		/* Removed during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.ASSIGNED;
		*/

		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);
		this.horizonStore.clearReturnScreen();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/* Removed during incident management refactor
	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
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
			${this._renderAutomaticSavingsFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderAutomaticSavingsFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="automatic-savings-failure-screen"
				id="id-error-toast"
				image="/images/liveBetter/automatic-savings-outcome.svg"
				header="Automatic savings update unsuccessful" 
				left="Done"
				right="Assign"
				toast="Automatic savings was not updated"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
					<section slot="detail">
						${this._renderDetails()}
					</section>
			</horizon-error-screen>
		`;
	}

	_renderDetails() {
		if (this.hasRoundupChanged && this.hasInterestSweepChanged) {
			return html`
				<span>Round-up and Interest sweep settings are not updated.</span>`;
		}

		return html`
			<span>${this.hasRoundupChanged ? `Round-up` : `Interest sweep`} settings was not updated.</span>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="automatic-savings-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-automatic-savings-failure`, AutomaticSavingsFailure);