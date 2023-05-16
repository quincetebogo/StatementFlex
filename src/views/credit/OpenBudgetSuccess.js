import { css, html } from 'platform/elements';
import { BUDGET_TERMS } from 'app/constants/Credit';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/utils/channelServiceUtilities';

import 'app/components/common/SuccessScreen';


/**
 * Display an confirmation/success screen indicating the open budget facility for the selected account is successfull.
 *
 * @export
 * @class OpenBudgetSuccess
 * @extends {ViewBase}
 */
 export class OpenBudgetSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.screenDetails = this.horizonStore.getScreenDetails();
	}

	// --------------
	// PROPERTIES
	// --------------

	get narrative() {
		return this.screenDetails.narrative;
	}

	get budgetAmount() {
		return formatCurrency(this.screenDetails.budgetAmount);
	}

	get term() {
		return `${BUDGET_TERMS[this.screenDetails.term]} Months`;
	}

	get instalment() {
		return formatCurrency(this.screenDetails.instalment);
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this.horizonStore.clearScreenDetails();
		this.horizonRouter.navigateToCreditAccount();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

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
				horizon-success-screen {
					--horizon-success-screen-header-margin-top: 20px;
					--horizon-success-screen-header-margin-bottom: 15px;
					--theme-slot-detail-width: 490px;
					--horizon-success-screen-detail-text-align: start;
					--horizon-button-group-margin-top: 35px;
				}
				.success-msg {
					width: auto;
				}
				span {
					cursor: pointer;
					color: #009DE0;
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
			${this._renderSuccessScreen()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				header="Budget successfully added"
				image="platform/illustrations/transfer.svg"
				right="Done"
				toast="Budget facility added"
				@right-click=${() => this._doneClick()}>
					${this._renderDetail()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="detail">
					<strong>${this.narrative}</strong> budget facility of <strong>${this.budgetAmount}</strong> with <strong>${this.term} monthly instalments of ${this.instalment}</strong> is now active and added to the list.
			</section>
		`;
	}
}
customElements.define(`horizon-open-budget-success`, OpenBudgetSuccess);