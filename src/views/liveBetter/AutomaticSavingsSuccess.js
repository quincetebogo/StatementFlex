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

		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.endSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS,
			"next-screen": TelemetryScreen.LIVE_BETTER
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToLiveBetter();
	}

	_manageAutomaticSavingsClick() {
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

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

			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="automatic-savings-success-screen"
				header="Automatic savings updated" 
				image="/images/liveBetterSavings/automatic-savings.svg"
				left="Manage Automatic Savings"
				right="Done"
				toast="Automatic savings successfully updated"
				subContent=${true}
				?hasSubDetails=${this.updatedLBSADetails?.accountRoundUpActive && this.updatedLBSADetails?.accountInterestSweepActive}
				@left-click=${() => this._manageAutomaticSavingsClick()}
				@right-click=${() => this._doneClick()}>
					${this._renderRoundupStatus()}
					${this._renderInterestSweepStatus()}
					${this._renderRoundupValueChange()}
			</horizon-success-screen>`;
	}

	_renderRoundupStatus() {
		return isNullorEmpty(this.updatedLBSADetails?.accountRoundUpActive)
			? html``
			: html`
				<section slot="detail">
					<span>Round-up successfully switched ${this.updatedLBSADetails.accountRoundUpActive ? `on` : `off`}.</span>
				</section>
			`;
	}

	_renderInterestSweepStatus() {
		return isNullorEmpty(this.updatedLBSADetails?.accountInterestSweepActive)
			? html``
			: html`
				<section slot="${isNullorEmpty(this.updatedLBSADetails?.accountRoundUpActive) ? `detail` : `sub-detail`}">
					<span>Interest Sweep successfully switched ${this.updatedLBSADetails.accountInterestSweepActive ? `on` : `off`}.</span>
				</section>
			`;
	}

	_renderRoundupValueChange() {
		return isNullorEmpty(this.updatedLBSADetails?.accountRoundUpActive) && isNullorEmpty(this.updatedLBSADetails?.accountInterestSweepActive)
			? html`
				<section slot="detail">
					<span>Automatic savings details successfully updated</span>
				</section>`
			: html``;
	}
}

customElements.define(`horizon-automatic-savings-success`, AutomaticSavingsSuccess);