import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * Policy summary component showing details of single policy with its role players
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class LifePocketSummary
 * @extends {Component}
 */
class LifePocketSummary extends Component {

	// #region INITIALISATION

	constructor() {
		super();
		this.selectedPocketType = ``;
		this.selectedPocket = {};
		this.selectedLifePolicy = {};
		this.pocketBeneficiaries = {};
	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Object} policyDetails Selected policy being viewed
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			selectedPocketType: { type: String, state: true },
			selectedLifePolicy: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this.selectedPocket = this.selectedLifePolicy.pockets.find(x => x.pocketType === this.selectedPocketType);
		this._getPocketBeneficiaries();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Navigate to Insure Landing page
	 * @return {void} 
	 */
	_backToClientPoliciesPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {}));
	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE FUNCTIONS

	/**
	 * Determine and show title bar label for screen
	 * @returns {string} label shown
	 */
	_getTitleBarLabel() {
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Monthly Payout - Beneficiaries`;
		} else if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Education Fund - Beneficiaries`;
		} else if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Once Off Payout - Beneficiaries`;
		}
		return ``;
	}

	/**
	 * Determine message based on pocket type
	 * @returns {string} message
	 */
	_getBeneficiaryInfoMessage() {
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Choose who gets a monthly payout (up to 2):`;
		} else if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Choose whose education to pay for:`;
		} else if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Choose who gets a once off payout (up to 2):`;
		}
	}

	/**
	 * Calculate total arrears for policy
	 * @param {*} policy policy with arrears
	 * @returns {string} formatted total
	 */
	_calculateArrearsAmount(policy) {
		let totalArrears = 0;
		policy.arrears.forEach(arrears => {
			totalArrears += parseInt(arrears.arrearsPaymentDueAmount, 10);
		});
		return formatCurrency(totalArrears);
	}

	_getPocketBeneficiaries() {
		this.pocketBeneficiaries = [];
		this.selectedLifePolicy.beneficiaries.forEach(beneficiary => {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && beneficiary.monthlyPayoutBenefitAmount > 0) {
				this.pocketBeneficiaries.push(beneficiary);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && beneficiary.educationBenefitAmount > 0) {
				this.pocketBeneficiaries.push(beneficiary);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && beneficiary.onceOffPayoutBenefitAmount > 0) {
				this.pocketBeneficiaries.push(beneficiary);
			}
		});
	}

	// #endregion PRIVATE FUNCTIONS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				${INSURE_CSS}

				horizon-label {
					width: 135px;
					padding-left: 16px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}

				.action-image{
					cursor: pointer;
				}

				.actionbar-header{
					padding-bottom:10px;
				}

				.actionbar-header > horizon-label {
					width: 210px;
					height: 100%;
					padding: 0px 0px 0px 16px;
				
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}

				.actionbar-header > horizon-label[label="Policy number"] {
					width: 120px;
				}

				.title-container{
					width: 100%;
					background: var(--theme-type-insure-background);
					border-top-left-radius: 5px; 
					border-top-right-radius: 5px;
				}

				.title-label{
					color: #FFF;
				}

				.no-border-bottom {
					border-bottom: 0px;
					box-shadow: none;
				}

				.pocket-card{
					height: auto;
					width: 1066px;
					background-color: #FFFFFF;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}

				#beneficiary-info-bar{
					background-color: rgb(244 244 244);
					border: 1px solid rgb(235 235 235);
					padding: 2px 12px;
					font-weight: 600;
					font-size: 14px;
				}

				.beneficiary-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					border-radius:  5px;
					margin-bottom:15px;
				}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	/**
	 * Render the component
	 * @returns {html} The html content of the component
	 */
	_renderContent() {
		return html`
			<capitec-card class="pocket-card">
				<capitec-group layout="vertical" gap="none" halign="left" valign="top">
					<div class="title-container">
						${this._renderTitleBarHeader()}
						${this._renderTitleBarDetails()}
					</div>
					<capitec-content-box class="main-view" id="policy-transactions-table">
						${this._renderSections()}
					</capitec-content-box>
				</capitec-group>
			</capitec-card>`;
	}

	/**
	 * Render title bar header
	 * @returns {html} The html of the header details
	*/
	_renderTitleBarHeader() {
		return html`
			<capitec-title-bar class="insure-title-bar no-border-bottom" type="clear">
				<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToClientPoliciesPage()}" />
				<capitec-label label="${this._getTitleBarLabel()}" type="title" class="title-label"></capitec-label>
				<capitec-spacer></capitec-spacer>
			</capitec-title-bar>`;
	}

	/**
	 * Render title bar details labels
	 * @returns {html} The html of the header details
	*/
	_renderTitleBarDetails() {
		return html`
			<capitec-group
				class= "actionbar-header"
				layout="horizontal"
				gap="none"
				halign="left"
				valign="center">
					<horizon-label label="Cover amount" value="${isNullorEmpty(this.selectedPocket?.coverage) ? `R0.00` : formatCurrency(this.selectedPocket?.coverage)}"></horizon-label>
					<horizon-label label="Debit order date" value="${formatDate(this.selectedLifePolicy?.nextCollectionDate, `dd mmm yyyy`)}"></horizon-label>
					<horizon-label label="Payment amount" value="${isNullorEmpty(this.selectedLifePolicy?.nextCollectionAmount) ? `R0.00` : formatCurrency(this.selectedLifePolicy?.nextCollectionAmount)}"></horizon-label>
					<horizon-label label="Arrears amount" value="${this._calculateArrearsAmount(this.selectedLifePolicy)}"></horizon-label>
					<horizon-label label="Status" value="${this.selectedLifePolicy?.policyStatus}"></horizon-label>
			</capitec-group>`;
	}

	/**
	 * Render all sections
	 * @returns {html} The html content of all the sections
	 */
	_renderSections() {
		return html`
			<div id="beneficiary-info-bar">
				${this._getBeneficiaryInfoMessage()}
			</div>

			<div class="beneficiary-list">


				<div class="beneficiary-card">
					<div style="display: flex; gap:20px;">
						<capitec-avatar size="large" value="Lorem Ipsum" color="#AAAAAA"></capitec-avatar>
						<horizon-label
							label="Child"
							value="Cyle Dyers">
						</horizon-label>
					</div>
					<div style="display: flex; gap: 20px;">
						<horizon-label
							label="Available balance"
							value="R?? ???.??">
						</horizon-label>
						<capitec-overflow-menu label="More">
						</capitec-overflow-menu>
					</div>
				</div>
			</div>

			<capitec-button id="add-beneficiary-button" icon="system/add-action" label="${this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION ? `Add a child` : `Add another beneficiary`}"></capitec-button>
		`;
	}

	// #endregion
}
window.customElements.define(`horizon-insure-life-pocket-summary`, LifePocketSummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-life-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-life-policy-summary>
 *
 * @event LifePocketSummary#navigate-back
 * @type {Object} - N/A
 */