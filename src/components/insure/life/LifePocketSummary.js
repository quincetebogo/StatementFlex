import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { LifeAddBeneficiaryDialog } from '../../dialogs/insure/life/LifeAddBeneficiaryDialog';
import { LifeDeleteBeneficiaryDialog } from '../../dialogs/insure/life/LifeDeleteBeneficiaryDialog';
import { LifeUpdateBeneficiaryDialog } from 'app/components/dialogs/insure/life/LifeUpdateBeneficiaryDialog';
import { LifeUpdateMoneyDialog } from 'app/components/dialogs/insure/life/LifeUpdateMoneyDialog';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { formatCurrencyInsureCoverAmount } from 'app/utils/insureUtils';

/**
 * Pocket summary component showing details of single policy pocket with its role players
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
		this.selectedLifePolicy = {};
		this.selectedPocket = {};
		this.pocketBeneficiaries = [];

		this.showEditBeneficiaryDialog = false;
		this.showUpdateMoneyDialog = false;
		this.showDeleteBeneficiaryDialog = false;
		this.showAddBeneficiaryDialog = false;
		this.isChild = false;
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
			selectedLifePolicy: { type: Object, state: true },
			selectedBeneficiary: { type: Object, state: true },
			showEditBeneficiaryDialog: { type: Boolean, state: true },
			showUpdateMoneyDialog: { type: Boolean, state: true },
			showDeleteBeneficiaryDialog: { type: Boolean, state: true },
			showAddBeneficiaryDialog: { type: Boolean, state: true },
			isChild: { type: Boolean, state: true }
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
			return `Choose whose education to pay for (up to 10):`;
		} else if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Choose who gets a once off payout (up to 2):`;
		}
	}

	/**
	 * All beneficiaries applicable with selected pocket type
	 * @returns {void}
	 */
	_getPocketBeneficiaries() {
		this.pocketBeneficiaries = [];
		this.selectedLifePolicy.beneficiaries.forEach(beneficiary => {
			console.log(`LOOOPING`);
			console.log(this.selectedPocketType);
			console.log(beneficiary);
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && beneficiary.monthlyPayoutBenefitAmount > 0) {
				this.pocketBeneficiaries.push(beneficiary);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && beneficiary.educationBenefitAmount > 0) {
				this.pocketBeneficiaries.push(beneficiary);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && beneficiary.onceOffPayoutBenefitAmount > 0) {
				console.log(`ADDING`);
				this.pocketBeneficiaries.push(beneficiary);
			}
		});

		console.log(this.pocketBeneficiaries);
	}

	/**
	 * Calculate total arrears for policy
	 * @param {*} policy policy with arrears
	 * @returns {string} formatted total
	 */
	_calculateArrearsAmount(policy) {
		let totalArrears = 0;
		if (policy.arrears) {
			policy.arrears.forEach(arrears => {
				totalArrears += parseInt(arrears.arrearsPaymentDueAmount, 10);
			});
		}
		return formatCurrency(totalArrears);
	}

	/**
	 * Calculate remaining balance across entire pocket
	 * @param {*} policy policy with arrears
	 * @returns {string} formatted total
	 */
	_calculateRemainingBalancePocketLevel() {
		let totalCover = this.selectedPocket?.coverage;
		this.pocketBeneficiaries.forEach(beneficiary => {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				totalCover -= beneficiary.monthlyPayoutBenefitAmount;
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
				totalCover -= beneficiary.educationBenefitAmount;
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				totalCover -= beneficiary.onceOffPayoutBenefitAmount;
			}
		});
		return formatCurrency(totalCover);
	}

	/**
	 * Calculate beneficiary available balance by pocket type
	 * @param {*} currentBeneficiary Current beneficiary
	 * @returns {string} formatted balance
	 */
	_calculateAvailableBalanceBeneficiaryLevel(currentBeneficiary) {
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return formatCurrency(currentBeneficiary.monthlyPayoutBenefitAmount);
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return formatCurrency(currentBeneficiary.educationBenefitAmount);
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return formatCurrency(currentBeneficiary.onceOffPayoutBenefitAmount);
		}
	}

	/**
	 * Allowed to add more beneficiaries
	 * @returns {boolean} should allow flag
	 */
	_allowAddBeneficiary() {
		if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && this.pocketBeneficiaries.length <= 9) {
			return true;
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && this.pocketBeneficiaries.length <= 1) {
			return true;
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && this.pocketBeneficiaries.length <= 1) {
			return true;
		}
		return false;
	}

	_openEditBeneficiaryDialog() {
		this.showEditBeneficiaryDialog = true;
	}

	_openUpdateMoneyDialog() {
		this.showUpdateMoneyDialog = true;
	}

	_openDeleteBeneficiaryDialog(beneficiary) {
		this.selectedBeneficiary = beneficiary;
		this.showDeleteBeneficiaryDialog = true;
	}

	_openAddBeneficiaryDialog() {
		if (this.selectedPocket.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			this.isChild = true;
		} else {
			this.isChild = false;
		}
		this.showAddBeneficiaryDialog = true;
	}

	/* Dialog Actions */
	_deleteBeneficiaryFromPocket() {
		// TODO:
		// 1. Remove beneficiary and call update service
		// 2. Show success or error toasts
		// 3. Hide confirm dialog
		this.showDeleteBeneficiaryDialog = false;
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
					width: 190px;
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
			${this._renderDialogs()}
		`;
	}

	/**
	 * Render the main component
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
	 * Render the dialog's used
	 * @returns {html} The html content of the component
	 */
	_renderDialogs() {
		return html`
			${this._renderEditBeneficiaryDialog()}
			${this._renderUpdateMoneyDialog()}
			${this._renderDeleteBeneficiaryDialog()}
			${this._renderAddBeneficiaryDialog()}
		`;
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
					<horizon-label label="Cover amount" value="${isNullorEmpty(this.selectedPocket?.coverage) ? `R0` : formatCurrencyInsureCoverAmount(formatCurrency(this.selectedPocket?.coverage))}"></horizon-label>
					<horizon-label label="Remaining balance" value="${this._calculateRemainingBalancePocketLevel()}"></horizon-label>
					<horizon-label label="Debit order date" value="${formatDate(this.selectedLifePolicy?.nextCollectionDate, `dd mmm yyyy`)}"></horizon-label>
					<horizon-label label="Premium" value="${isNullorEmpty(this.selectedPocket?.premium) ? `R0.00` : formatCurrency(this.selectedPocket?.premium)}"></horizon-label>
			</capitec-group>`;
	}

	/**
	 * Render all sections
	 * @returns {html} The html content of all the sections
	 */
	_renderSections() {
		return html`
			${this._allowAddBeneficiary() === false
				? html`
					<horizon-alert-banner
						type="warning"
						header="Notify client:"
						label="The maximum number of beneficiaries have been reached."
						layout="horizontal">
					</horizon-alert-banner>
					`
				: html``}

			<div id="beneficiary-info-bar">
				${this._getBeneficiaryInfoMessage()}
			</div>

			<div class="beneficiary-list">
				${this.pocketBeneficiaries?.map((beneficiary, index) => html`
					<div class="beneficiary-card">
						<div style="display: flex; gap:20px;">
							<capitec-avatar value="${beneficiary.firstName.charAt(0) + beneficiary.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
							<capitec-label
								label="${beneficiary.firstName} ${beneficiary.lastName}">
							</capitec-label>
						</div>
						<div style="display: flex; gap: 20px;">
							${this.selectedPocketType !== LIFE_POCKET_TYPES.MONTHLY ? html`` : html`
								<horizon-label
									label="Term"
									value="24 months">
								</horizon-label>
							`}
							<horizon-label
								label="Cover amount"
								value="${this._calculateAvailableBalanceBeneficiaryLevel(beneficiary)}">
							</horizon-label>
							<capitec-overflow-menu label="More">
								<capitec-overflow-menu-item label="Edit Beneficiary" @click="${() => this._openEditBeneficiaryDialog(beneficiary)}"></capitec-overflow-menu-item>
								<capitec-overflow-menu-item label="Update Money" @click="${() => this._openUpdateMoneyDialog(beneficiary)}"></capitec-overflow-menu-item>
								<capitec-overflow-menu-item label="Delete Beneficiary" @click="${() => this._openDeleteBeneficiaryDialog(beneficiary)}"></capitec-overflow-menu-item>
							</capitec-overflow-menu>
						</div>
					</div>
				`)}
			</div>

			${this._allowAddBeneficiary() === true
				? html`
					<capitec-button @click="${() => this._openAddBeneficiaryDialog()}"  id="add-beneficiary-button" icon="system/add-action" label="Add another beneficiary"></capitec-button>
				` : html``}
		`;
	}

	/**
	 * Render edit beneficiary dialog
	 * @returns {html} The html content of dialog
	 */
	_renderEditBeneficiaryDialog() {
		return this.showEditBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-update-beneficiary-dialog @close-dialog="${() => this.showEditBeneficiaryDialog = false}">
				</horizon-insure-life-update-beneficiary-dialog>
			`;
	}

	/**
	 * Render update money dialog
	 * @returns {html} The html content of dialog
	 */
	_renderUpdateMoneyDialog() {
		return this.showUpdateMoneyDialog === false ? ``
			: html`
				<horizon-insure-life-update-money-dialog @close-dialog="${() => this.showUpdateMoneyDialog = false}">
				</horizon-insure-life-update-money-dialog>
		`;
	}

	/**
	* Render delete beneficiary dialog
	* @returns {html} The html content of dialog
	*/
	_renderDeleteBeneficiaryDialog() {
		return this.showDeleteBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-delete-beneficiary-dialog 
					.selectedBeneficiary="${this.selectedBeneficiary}" 
					@delete-beneficiary="${() => this._deleteBeneficiaryFromPocket()}"
					@close-dialog="${() => this.showDeleteBeneficiaryDialog = false}">
				</horizon-insure-life-delete-beneficiary-dialog>
		`;
	}

	/**
	* Render add beneficiary dialog
	* @returns {html} The html content of dialog
	*/
	_renderAddBeneficiaryDialog() {
		return this.showAddBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-add-beneficiary-dialog 
				.isChild = "${this.isChild}"
				.selectedPocket = "${this.selectedPocket}"
				.pocketBeneficiaries = "${this.pocketBeneficiaries}"
				@close-dialog="${() => this.showAddBeneficiaryDialog = false}">
				</horizon-insure-life-add-beneficiary-dialog>
		`;
	}

	// #endregion
}
window.customElements.define(`horizon-insure-life-pocket-summary`, LifePocketSummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-life-pocket-summary ... @navigate-back="${this._handler}"></horizon-insure-life-pocket-summary>
 *
 * @event LifePocketSummary#navigate-back
 * @type {Object} - N/A
 */