import { css, html } from 'platform/elements';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the automatic savings  has been updated successfully.
 *
 * @export
 * @class AutomaticSavingsSuccess
 * @extends {ViewBase}
 */
export class AutomaticSavingsSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

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

		/* Removed during incident manager refactor
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
		this._telemetry.endSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_SUCCESS_DONE, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS,
			"next-screen": TelemetryScreen.LIVE_BETTER
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToLiveBetter();
	}

	_manageAutomaticSavingsClick() {
		this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_SUCCESS_SEND_ANOTHER, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});

		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/* Removed during incident management refactor
	_updateIncidentState() {
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}
	*/

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-success-screen{
					--theme-slot-detail-width: auto;
				}
				.bullet-label{
					padding-left: 16px;
				}
				section[slot="detail"] {
					height: auto;
				}`
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
				data-automation-id="automatic-savings-success-screen"
				header="Automatic savings updated" 
				image="/images/liveBetter/automatic-savings-outcome.svg"
				left="Manage Automatic Savings"
				right="Done"
				toast="Automatic savings successfully updated"
				?hasSubDetails=${this.hasRoundupChanged && this.hasInterestSweepChanged}
				@left-click=${() => this._manageAutomaticSavingsClick()}
				@right-click=${() => this._doneClick()}>
				
					${this._renderRoundupChanges()}
					${this._renderInterestSweepChanges()}
					
			</horizon-success-screen>`;
	}

	_renderRoundupChanges() {
		return this.hasRoundupChanged
			? html`
				<section slot="detail">
					${this._renderRoundupMessage()}
				</section>`
			: html``;
	}

	_renderRoundupMessage() {
		if (!isNullorEmpty(this.updatedLBSADetails.accountRoundUpActive) && !this.updatedLBSADetails.accountRoundUpActive) {
			// only Round-up status turned OFF
			return html`<span>Round-up settings switched off.</span>`;
		} else if (this.updatedLBSADetails.accountRoundUpActive || this.updatedLBSADetails.roundUpValue) {
			// Round-up turned ON or round-up value updated
			return html`<span>Round-up settings updated to <b>R${this.updatedLBSADetails.roundUpValue || this.LBSADetails.roundupValue}</b></span>`;

		}
		// only selection/deselction of accounts listed.
		return html`<span>Round-up settings updated</span>`;
	}

	_renderInterestSweepChanges() {
		// Interest-sweep status turned ON/OFF
		return isNullorEmpty(this.updatedLBSADetails?.accountInterestSweepActive)
			? html``
			: html`
				<section slot="${this.hasRoundupChanged ? `sub-detail` : `detail`}">
					<span>Interest sweep settings switched ${this.updatedLBSADetails.accountInterestSweepActive ? `on` : `off`}.</span>
				</section>
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

customElements.define(`horizon-automatic-savings-success`, AutomaticSavingsSuccess);