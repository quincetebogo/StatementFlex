import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase';

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
		this.roundupDetails = this.screenDetails.lbbRoundupDetails;
		this.updatedRoundupDetails = this.screenDetails.updatedLbbRoundupDetails;

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
					
				${this._renderRoundupSwitchedOff()}
				${this._renderRoundupValueChange()}
				${this._renderRoundupAccountsChange()}
			</horizon-success-screen>
		`;
	}

	_renderRoundupSwitchedOff() {
		return !this.updatedRoundupDetails.accountRoundUpActive && this.roundupDetails.accountRoundUpActive 
			? html`
				<section slot="detail">
					Round-up successfully switched off.
				</section>`
			: html``;
	}

	_renderRoundupValueChange() {
		return this.roundupDetails.roundupValue !== this.updatedRoundupDetails.roundupValue
			? html`
				<section slot="detail">
					Round-up successfully updated to <b>${this.updatedRoundupDetails.roundupValue}</b>
				</section>`
			: html``;
	}

	_renderRoundupAccountsChange() {
		return this.updatedRoundupDetails.activatedRoundUpAccounts.length >= 0
			? html`
				<section slot="sub-content">
					Updated on the following accounts:
					${this.updatedRoundupDetails.activatedRoundUpAccounts.map(account => html`
						<li class="bullet-label"><b>${account.accountName}</b></li>`)
					}
				</section>`
			: html``;
	}
}

customElements.define(`horizon-automatic-savings-success`, AutomaticSavingsSuccess);