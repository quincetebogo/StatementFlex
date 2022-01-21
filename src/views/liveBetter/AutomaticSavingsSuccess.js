import { css, html } from 'platform/elements';
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
		this.isRoundupOff = false;
		this.roundUpAmountChange = true;
		this.roundUpAccountChange = true;
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
				@left-click=${() => this._manageAutomaticSavingsClick()}
				@right-click=${() => this._doneClick()}>
					<section slot="detail">
						<capitec-group
							layout="vertical"
							halign="stretch"
							valign="top"
							gap="clear">
								${this._renderRoundupStatus()}
								${this._renderInterestSweepStatus()}
								${this._renderRoundupValueChange()}
								${this._renderRoundupAccountsChange()}
						</capitec-group>
					</section>
			</horizon-success-screen>`;
	}

	_renderRoundupStatus() {
		return isNullorEmpty(this.updatedLBSADetails?.accountRoundUpActive)
			? html``
			: html`
				<span>Round-up successfully switched ${this.updatedLBSADetails.accountRoundUpActive ? `on` : `off`}.</span>`;
	}

	_renderInterestSweepStatus() {
		return isNullorEmpty(this.updatedLBSADetails?.accountInterestSweepActive)
			? html``
			: html`
				<span>Interest Sweep successfully switched ${this.updatedLBSADetails.accountInterestSweepActive ? `on` : `off`}.</span>`;
	}

	_renderRoundupValueChange() {
		return this.updatedLBSADetails?.roundUpValue
			? html`
				Round-up successfully updated to <b>${this.updatedLBSADetails.roundUpValue}</b>
				${this._renderUpdatedAccounts()}`
			: html``;
	}

	_renderUpdatedAccounts() {
		return this.updatedLBSADetails?.activatedRoundUpAccounts
			? html``
			: html`
				Updated on the following accounts:
				${this.LBSADetails.activatedRoundUpAccounts.map(item => html`
					<li class="bullet-label"><b>${item.accountName}</b></li>`)
				}`;
	}

	_renderRoundupAccountsChange() {
		return this.updatedLBSADetails?.activatedRoundUpAccounts
			? html`
				Updated on the following accounts:
				${this.updatedLBSADetails.activatedRoundUpAccounts.map(item => html`
					<li class="bullet-label"><b>${item.accountName}</b></li>`)
				}`
			: html``;
	}
}

customElements.define(`horizon-automatic-savings-success`, AutomaticSavingsSuccess);