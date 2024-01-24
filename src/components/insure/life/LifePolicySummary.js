import { Component, css, html } from 'platform/elements';
import { determineLifeStatusColour, formatCurrencyInsureCoverAmount, lifeCoverDisplayStatus } from 'app/utils/insureUtils';
import { formatDate, formatPhoneNumber, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * Policy summary component showing details of single life policy with its role players & banking details
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class LifePolicySummary
 * @extends {Component}
 */
class LifePolicySummary extends Component {

	// #region INITIALISATION

	constructor() {
		super();
		this.selectedLifePolicy = {};
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
	 * Get color for pocket label
	 * @param {string} pocketType current pocket type
	 * @returns {string} css class
	 */
	_pocketTypeLabelColour(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `monthly-label-colour`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `education-label-colour`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `once-off-label-colour`;
		}
		return `once-off-label-colour`;
	}

	// Get label for pocketType
	_displayPocketTypeLabel(pocketType) {

		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Monthly Payout`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Education Fund`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Once Off Payout`;
		}
	}


	_getPocketBeneficiaries(pocketType) {
		const pocketBeneficiaries = [];
		this.selectedLifePolicy.beneficiaries.forEach(beneficiary => {
			if (pocketType === LIFE_POCKET_TYPES.MONTHLY && beneficiary.monthlyPayoutBenefitAmount > 0) {
				pocketBeneficiaries.push(beneficiary);
			}
			if (pocketType === LIFE_POCKET_TYPES.EDUCATION && beneficiary.educationBenefitAmount > 0) {
				pocketBeneficiaries.push(beneficiary);
			}
			if (pocketType === LIFE_POCKET_TYPES.ONCEOFF && beneficiary.onceOffPayoutBenefitAmount > 0) {
				pocketBeneficiaries.push(beneficiary);
			}
		});
		return pocketBeneficiaries;
	}

	// Get total cover amount for policy
	_getPolicyCoverAmount(pockets) {
		let totalCover = 0;
		pockets.forEach(pocket => {
			totalCover += pocket.coverage;
		});
		return totalCover;
	}

	// Get total cover amount for specific pocket type
	_getPocketCoverAmount(pocketType) {
		const currentPocket = this.selectedLifePolicy.pockets.find(x => x.pocketType === pocketType);
		return currentPocket.coverage;
	}

	// Get payment amount for specific pocket type
	_getPocketPaymentAmount(pocketType) {
		const currentPocket = this.selectedLifePolicy.pockets.find(x => x.pocketType === pocketType);
		return currentPocket.premium;
	}

	// Get cover amount for beneficiary by pocket type
	_getBeneficiaryCoverAmount(pocketType, beneficiary) {
		if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return beneficiary.onceOffPayoutBenefitAmount;
		}
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return beneficiary.monthlyPayoutBenefitAmount;
		}
		if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return beneficiary.educationBenefitAmount;
		}
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
				totalArrears += parseFloat(arrears.arrearsPaymentDueAmount);
			});
		}
		return totalArrears;
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

				.card{
					width:100%;
					height:100%;
				}
				.action-image{
					cursor: pointer;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					width: 100%;
					box-shadow: none!important;
				}
				horizon-label {
					width: 140px;
					padding-left: 16px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: auto;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 15px;
					word-break: break-word;
				}
				.details-box {
					height: auto;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-top: 0px;
					--theme-layout-gap-spacing: 0px;
					overflow: hidden;
				}
				.column-width-200 {
					width: 200px;
				}
				.vertical-line {
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
				}
				.expander-content {
					border-left: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
					border-right: 1px solid #E1E1E1;
					border-radius: 0px 0px 4px 4px
				}
				.expander-content > capitec-title-bar {
					border-top: 0px;
				}
				horizon-expander {
					margin-bottom: 16px;
					--theme-expander-height: auto;
					--theme-layout-gap-spacing: 0px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-padding: 0 6px 0 0;
					--theme-expander-indicator-width: 16px;
				}
				horizon-expander[expanded] {
					box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
					display: block;
				}
				.horizon-expander-height{
					--theme-expander-header-height: auto !important;
				}

				.options-group {
					height: auto; 
					margin: 17px 0px 15px 0px;
					width: 100%;
				}

				.options-group > horizon-label {
					width: 250px;
					height: 50px;
					margin-left: 16px;
					padding: 0px;
				}

				.beneficiary-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					border-radius:  5px;
					margin: 0px 15px 10px 15px;
				}

				.pocket-type-label{
					width: 200px;
					padding-left: 20px;
					font-size: unset;
				}

				.arrears{
					--horizon-label-value-color: #C83C37 !important;
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
	 * Render the main component
	 * @returns {html} The html content of the component
	 */
	_renderContent() {
		return html`
			<div>
			<capitec-card class="card">
				${this._renderTitleBarHeader()}
				<capitec-group layout="vertical" halign="left" valign="top" gap="none">
					${this._renderSections()}
				</capitec-group>
			</capitec-card>
		</div>`;
	}

	/**
	 * Render title bar header
	 * @returns {html} The html of the header details
	*/
	_renderTitleBarHeader() {
		return html`
			<capitec-title-bar type="insure" class="insure-title-bar">
				<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToClientPoliciesPage()}" />
				<capitec-label label="Life Cover" type="title" class="title-bar-label"></capitec-label>
				<capitec-spacer></capitec-spacer>
			</capitec-title-bar>`;
	}

	/**
	 * Render all sections
	 * @returns {html} The html content of all the sections
	 */
	_renderSections() {
		return html`
			${this._renderMainLifeSection()}
			${this._renderPocketsSection()}
			${this._renderBankDetailsSection()}
		`;
	}

	/**
	 * Render main life / policy main section
	 * @returns {html} The html content of the section
	 */
	_renderMainLifeSection() {
		return html`
		<capitec-title-bar type="default" label="Policy Details">
		</capitec-title-bar>

		<capitec-content-box  class="details-box">
		<horizon-expander
		expandButtonAlignment="right"
		.expanded = "${false}">
			<capitec-group 
				class="expander-header"
				slot="custom-header"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<horizon-label
						class="column-width-200"
						label="Policy number"
						value="${this.selectedLifePolicy?.contractReference}">
					</horizon-label>
					<div class="vertical-line"></div>
					<horizon-label label="Start date"
						value="${formatDate(this.selectedLifePolicy?.policyStartDate, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label label="Cover amount"
						value="${formatCurrencyInsureCoverAmount(formatCurrency(this._getPolicyCoverAmount(this.selectedLifePolicy.pockets)))}">
					</horizon-label>
					<horizon-label label="Premium"
						value="${formatCurrency(this.selectedLifePolicy?.totalPremium)}">
					</horizon-label>
					<horizon-label
						label="Arrears amount"
						class="${this._calculateArrearsAmount(this.selectedLifePolicy) > 0 ? `arrears` : ``}"
						value="${formatCurrency(this._calculateArrearsAmount(this.selectedLifePolicy))}">
					</horizon-label>
					<horizon-label
						label="Status"
						value="${lifeCoverDisplayStatus(this.selectedLifePolicy?.policyStatus)}"
						class="column-width-200 ${determineLifeStatusColour(this.selectedLifePolicy?.policyStatus)}">
					</horizon-label>
				</capitec-group>
				<div slot="content">
					<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
						${this._renderMainSectionExpanded()}
					</capitec-group>
				</div>
			</horizon-expander>
		</capitec-content-box>
		`;
	}

	// Expanded setting for main life expander
	_renderMainSectionExpanded() {
		const csvOfMonths = this.selectedLifePolicy?.arrears?.map((item) => formatDate(item.arrearsPaymentDueDate, `dd mmm yyyy`)).join(`, `);
		return html`
			<capitec-title-bar type="default" label="Payment information" class="inner-details-title"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Last payment received"
					value="${isNullorEmpty(this.selectedLifePolicy?.lastCollectionAmount) ? `-` : formatCurrency(this.selectedLifePolicy?.lastCollectionAmount)}">
				</horizon-label>
				<horizon-label label="Last payment date"
					value="${isNullorEmpty(this.selectedLifePolicy?.lastCollectionDate) ? `-` : formatDate(this.selectedLifePolicy?.lastCollectionDate, `dd mmm yyyy`)}">
				</horizon-label>
				<horizon-label label="Next payment due"
					value="${isNullorEmpty(this.selectedLifePolicy?.nextCollectionAmount) ? `-` : formatCurrency(this.selectedLifePolicy?.nextCollectionAmount)}">
				</horizon-label>
				<horizon-label label="Next payment date"
					value="${isNullorEmpty(this.selectedLifePolicy?.nextCollectionDate) ? `-` : formatDate(this.selectedLifePolicy?.nextCollectionDate, `dd mmm yyyy`)}">
				</horizon-label>
			</capitec-group>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label 
					label="Months outstanding" 
					value="${isNullorEmpty(csvOfMonths) ? `None` : csvOfMonths}">
				</horizon-label>
				<horizon-label label="Mandate Status"
					value="${isNullorEmpty(this.selectedLifePolicy?.bankDetails?.mandateStatus) ? `-` : this.selectedLifePolicy?.bankDetails?.mandateStatus}">
				</horizon-label>
			</capitec-group>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				${this.selectedLifePolicy?.policyStatus === `Cancelled`
				? html`
				<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label label="Cancellation date"
						value="${isNullorEmpty(this.selectedLifePolicy?.actualCancellationDate) ? `-` : formatDate(this.selectedLifePolicy?.actualCancellationDate, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label label="Reason"
						value="${this.selectedLifePolicy?.cancellationReason}">
					</horizon-label>
				</capitec-group>
				`
				: ``}
			</capitec-group>
		`;
	}

	/**
	 * Render pockets section
	 * @returns {html} The html content of the section
	 */
	_renderPocketsSection() {
		const onceOffBeneficiaries = this._getPocketBeneficiaries(LIFE_POCKET_TYPES.ONCEOFF);
		const monthlyBeneficiaries = this._getPocketBeneficiaries(LIFE_POCKET_TYPES.MONTHLY);
		const educationBeneficiaries = this._getPocketBeneficiaries(LIFE_POCKET_TYPES.EDUCATION);

		return html`
		<capitec-title-bar type="default" label="Pockets">
		</capitec-title-bar>
		${onceOffBeneficiaries.length === 0 ? html`` : html`
			<capitec-content-box  class="details-box">
			<horizon-expander
			expandButtonAlignment="right"
			.expanded = "${false}">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<capitec-label type="strong"
							class="pocket-type-label ${this._pocketTypeLabelColour(LIFE_POCKET_TYPES.ONCEOFF)}"
							.label="${this._displayPocketTypeLabel(LIFE_POCKET_TYPES.ONCEOFF)}">
						</capitec-label>

						<div class="vertical-line"></div>
						<horizon-label label="Beneficiaries"
							value="${onceOffBeneficiaries.length}">
						</horizon-label>
						<horizon-label label="Cover Amount"
							value="${formatCurrencyInsureCoverAmount(formatCurrency(this._getPocketCoverAmount(LIFE_POCKET_TYPES.ONCEOFF)))}">
						</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
							${this._renderPocketExpanded(LIFE_POCKET_TYPES.ONCEOFF, onceOffBeneficiaries)}
						</capitec-group>
					</div>
				</horizon-expander>
			</capitec-content-box>
		`}
		
		${monthlyBeneficiaries.length === 0 ? html`` : html`
			<capitec-content-box  class="details-box">
			<horizon-expander
			expandButtonAlignment="right"
			.expanded = "${false}">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<capitec-label type="strong"
							class="pocket-type-label ${this._pocketTypeLabelColour(LIFE_POCKET_TYPES.MONTHLY)}"
							.label="${this._displayPocketTypeLabel(LIFE_POCKET_TYPES.MONTHLY)}">
						</capitec-label>
						<div class="vertical-line"></div>
						<horizon-label label="Beneficiaries"
							value="${monthlyBeneficiaries.length}">
						</horizon-label>
						<horizon-label label="Cover Amount"
							value="${formatCurrencyInsureCoverAmount(formatCurrency(this._getPocketCoverAmount(LIFE_POCKET_TYPES.MONTHLY)))}">
						</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
							${this._renderPocketExpanded(LIFE_POCKET_TYPES.MONTHLY, monthlyBeneficiaries)}
						</capitec-group>
					</div>
				</horizon-expander>
			</capitec-content-box>
		`}

		${educationBeneficiaries.length === 0 ? html`` : html`
			<capitec-content-box  class="details-box">
			<horizon-expander
			expandButtonAlignment="right"
			.expanded = "${false}">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<capitec-label type="strong"
							class="pocket-type-label ${this._pocketTypeLabelColour(LIFE_POCKET_TYPES.EDUCATION)}"
							.label="${this._displayPocketTypeLabel(LIFE_POCKET_TYPES.EDUCATION)}">
						</capitec-label>
						<div class="vertical-line"></div>
						<horizon-label label="Beneficiaries"
							value="${educationBeneficiaries.length}">
						</horizon-label>
						<horizon-label label="Cover Amount"
							value="${formatCurrencyInsureCoverAmount(formatCurrency(this._getPocketCoverAmount(LIFE_POCKET_TYPES.EDUCATION)))}">
						</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
							${this._renderPocketExpanded(LIFE_POCKET_TYPES.EDUCATION, educationBeneficiaries)}
						</capitec-group>
					</div>
				</horizon-expander>
			</capitec-content-box>
		`}`;
	}

	// Expanded setting for main life expander
	_renderPocketExpanded(pocketType, beneficiaries) {
		return html`
			<capitec-group class="options-group" layout="vertical" gap="none" H-Align="left">
				${beneficiaries?.map((beneficiary, index) => html`
					<div class="beneficiary-card">
						<div style="display: flex; gap:20px;">
							<capitec-avatar value="${beneficiary.firstName.charAt(0) + beneficiary.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
							<horizon-label
								label="${beneficiary.firstName}"
								value="${beneficiary.lastName}">
							</horizon-label>
						</div>
						<div style="display: flex; gap: 20px;">
							${pocketType !== LIFE_POCKET_TYPES.MONTHLY ? html`` : html`
								<horizon-label
									label="Term"
									value="24 months">
								</horizon-label>
							`}
							<horizon-label
								label="Cover Amount"
								value="${formatCurrencyInsureCoverAmount(formatCurrency(this._getBeneficiaryCoverAmount(pocketType, beneficiary)))}">
							</horizon-label>
						</div>
					</div>
				`)}
			</capitec-group>
		`;
	}

	/**
	 * Render policy banking details section
	 * @returns {html} The html content of the section
	 */
	_renderBankDetailsSection() {
		const deductionDetails = this.selectedLifePolicy?.bankDetails;

		return html`
		<capitec-title-bar type="default" label="Payment details">
		</capitec-title-bar>
		<capitec-content-box  class="details-box">
			<horizon-expander
			expandButtonAlignment=""
			.expanded = "${false}"
			?disabled=${true}
			class = "horizon-expander-height">
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="column-width-200"
							label="Account name"
							value="${formatStringAsPascalCase(deductionDetails?.accountName)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							label="Account number"
							value="${deductionDetails?.accountNumber}">
						</horizon-label>
						<horizon-label
							label="Bank"
							value="${deductionDetails?.bank}">
						</horizon-label>
						<horizon-label
							label="Branch code"
							value="${deductionDetails?.branchCode}">
						</horizon-label>
						<horizon-label
							label="Account type"
							value="${deductionDetails?.accountType}">
						</horizon-label>
						<horizon-label
							label="Collection day"
							value="${deductionDetails?.collectionDay}"
							class="column-width-200">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
		</capitec-content-box>`;
	}

	// #endregion
}
window.customElements.define(`horizon-insure-life-policy-summary`, LifePolicySummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-life-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-life-policy-summary>
 *
 * @event LifePolicySummary#navigate-back
 * @type {Object} - N/A
 */