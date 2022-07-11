import { Component, css, html, unsafeCSS } from 'platform/elements';
import { formatDate, isNullorEmpty, formatStringAsPascalCase, formatPhoneNumber } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { TABLE_EXPANDER_CELL } from 'app/css/PolicySummary';

/**
 * Policy summary component showing details of single policy with its role players
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class PolicySummary
 * @extends {Component}
 */
class PolicySummary extends Component {

	//#region INITIALISATION

	constructor() {
		super();

		this.policyDetails = null;
	}
	
	//#endregion INITIALISATION

	//#region PROPERTIES

	/**
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policyDetails: { type: Object, state: true }
		};
	}

	//#endregion PROPERTIES

	//#region LIFECYCLE OVERRIDES
	
	/**
	 * call unload event once the component removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();

		this._unloading();
	}
	
	//#endregion LIFECYCLE OVERRIDES

	//#region EVENT HANDLERS

	/**
	 * unload the policy transactions
	 */
	 _unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	/**
	 * Navigate to Insure Landing page
	 */
	_backToClientPoliciesPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	//#endregion EVENT HANDLERS

	//#region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
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
			.inner-details-title{
				--theme-type-default-background: rgb(244, 244, 244);
				border-top: 1px solid #E1E1E1;
			}
			horizon-label {
				width: 150px;
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
			.accounts-box {
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
			.column-width-100 {
				width: 100px;
			}
			.expander-header > horizon-label[label="Status"] {
				--horizon-label-value-color: #70AF00;
				text-overflow: ellipsis;
			}
			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
			}
			.no-results {
				--horizon-label-text-font-size: 18px !important;
				--horizon-label-text-font-weight: 600 !important;
				--horizon-label-text-color-font-color: #3A3A3A !important;
				width: auto;
				margin: 0px;
			}
			.no-result-group {
				width: 1032px;
				margin: 20px;
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
			.options-group {
				height: auto; 
				width: auto;
			}
			.options-group > horizon-label {
				width: 186px;
				height: 80px;
				margin-left: 16px;
				padding: 0px;

				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
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
			.arrears{
				--horizon-label-text-color: #C83C37 !important;
				--horizon-label-value-color: #C83C37 !important;
			}
			.horizon-expander-height{
				--theme-expander-header-height: auto !important;
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
			<capitec-card 
				data-automation-id="policy-summary"
				class="card">
			<capitec-title-bar type="insure" class="insure-title-bar">
				<img class="action-image" src="/images/insure/left-arrow.svg" data-automation-id="policy-summary-back-to-policies"
					 @click="${() => this._backToClientPoliciesPage()}" />
				<capitec-label label="Funeral Plan" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button label="Email Plan" type="white" data-automation-id="policy-summary-email-plan"></capitec-button>
				<capitec-button label="Update Plan" type="white" data-automation-id="policy-summary-update-plan"></capitec-button>
			</capitec-title-bar>
			<capitec-group layout="vertical" halign="left" valign="top" gap="none">
				${this._renderSections()}
			</capitec-group>
			</capitec-card>`;
	}

	/**
	 * Render all sections
	 * @returns {html} The html content of all the sections
	 */
	_renderSections() {
		return html`
			${this._renderMainLifeSection()}
			${this._renderLivesAssuredSection()}
			${this._renderBeneficiariesSection()}
			${this._renderBankDetailsSection()}
		`;
	}

	/**
	 * Render Main Life section
	 * @returns {html} The html content of Main Life section
	 */
	_renderMainLifeSection()
	{
		const sumArrears = this.policyDetails?.arrearDetails?.arrears?.reduce((accumulator, object) => {
			return accumulator + (object.amount ?? 0);
		  }, 0);

		const mainLifeDetails = this.policyDetails?.roleplayers?.filter(item => item.relationship === 'MainLife');

		return html`
		<capitec-title-bar
			type="default"
			label="Main Life">
		</capitec-title-bar>

		<capitec-content-box  class="accounts-box">
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
						data-automation-id="insure-main-life-policy-number"
						label="Policy number"
						value="${this.policyDetails?.contractReference}">
					</horizon-label>
					<div class="vertical-line"></div>
					<horizon-label
						data-automation-id="insure-main-life-start-date"
						label="Start date"
						value="${formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`) === '' ? '-' : formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-cover-amount"
						label="Cover amount"
						value="${ isNullorEmpty(mainLifeDetails[0]?.coverAmount) ? formatCurrency(0) : formatCurrency(mainLifeDetails[0]?.coverAmount)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-total-premium"
						label="Premium"
						value="${ isNullorEmpty(mainLifeDetails[0]?.premium) ? formatCurrency(0) :  formatCurrency(mainLifeDetails[0]?.premium)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-arrears"
						label="Arrears"
						class="${ sumArrears > 0 ? `arrears column-width-200` : ``}"
						value="${ isNullorEmpty(sumArrears) ? formatCurrency(0) : formatCurrency(sumArrears)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-display-status"
						label="Status"
						value="${this.policyDetails?.displayStatus}"
						class="column-width-100">
					</horizon-label>
			</capitec-group>
			<div slot="content">
				<capitec-group 
					class="expander-content" 
					layout="vertical"
					gap="none"
					halign="left"
					valign="center">
						${this._renderOptions()}
				</capitec-group>
			</div>
		</horizon-expander>
		</capitec-content-box>
		`;
	}

		/**
	 * Render MainLife Additional Information
	 * @returns {html} The html content of the each MainLife Addition Information
	 */
	_renderOptions() {
		const paymentSchedule = this.policyDetails?.paymentSchedule;
		const csvOfMonths = this.policyDetails?.arrearDetails?.arrears?.map((item) => { return formatDate(item.dueDate,  `dd mmm yyyy`); }).join(", ");
		const activeBankAccountNo = this.policyDetails?.deductionDetails?.bankDetails?.accountNumber;

		const activeMandateDetails = this.policyDetails?.mandates?.filter(x => x.accountNumber === activeBankAccountNo);

		return html`
			<capitec-title-bar type="default" label="Additional Information" class="inner-details-title"></capitec-title-bar>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Amount of last premium payment"
					value = "${ isNullorEmpty(paymentSchedule?.previousPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.previousPaymentAmount) }"
					data-automation-id="policy-summary-last-premium-payment">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Date of last premium payment"
					value = "${ formatDate(paymentSchedule?.previousPaymentDate, `dd mmm yyyy`) === '' ? '-' : formatDate(paymentSchedule?.previousPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-last-premium-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Next debit order amount" 
					value = "${ isNullorEmpty(paymentSchedule?.nextPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.nextPaymentAmount) }"
					data-automation-id="policy-summary-next-debit-amount">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Date of next premium"
					value = "${ formatDate(paymentSchedule?.nextPaymentDate, `dd mmm yyyy`) === '' ? '-' : formatDate(paymentSchedule?.nextPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-next-premium">
				</horizon-label>
			</capitec-group>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Amount of last arrears payment"
					value = "${ isNullorEmpty(paymentSchedule?.previousArrearsPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.previousArrearsPaymentAmount) }"
					data-automation-id="policy-summary-last-arrears-payment-amount">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Date of last arrears payment"
					value = "${ formatDate(paymentSchedule?.previousArrearsPaymentDate, `dd mmm yyyy`) === '' ? '-' : formatDate(paymentSchedule?.previousArrearsPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-last-arrears-payment-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Months outstanding" 
					value = "${ isNullorEmpty(csvOfMonths) ? `None` : csvOfMonths }"
					data-automation-id="policy-summary-months-outstanding">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Mandate Status"
					value = "${ !isNullorEmpty(activeMandateDetails) && !isNullorEmpty(activeMandateDetails[0]?.mandateStatus) ? activeMandateDetails[0]?.mandateStatus : `N/A`  }"
					data-automation-id="policy-summary-mandate-status">
				</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * Render Beneficiaries section
	 * @returns {html} The html content of Beneficiaries section
	 */
	_renderBeneficiariesSection()
	{
		let beneficiaries = this.policyDetails?.roleplayers?.filter(item => item.beneficiary === true);

		return html`
		<capitec-title-bar
			type="default"
			label="Payout Beneficiaries">
		</capitec-title-bar>
		${ beneficiaries?.length > 0 ? beneficiaries.map((item) => html `
			<capitec-content-box  class="accounts-box">
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
							data-automation-id="insure-beneficiaries-name"
							label="Name & Surname"
							value="${ formatStringAsPascalCase(item.firstName + ` ` + item.surname) }">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-beneficiaries-relationship"
							label="Relationship"
							value="${item.relationship}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-dateofbirth"
							label="Date of birth"
							value="${ formatDate(item.dateOfBirth, `dd mmm yyyy`) === '' ? '-' : formatDate(item.dateOfBirth, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-contact-number"
							label="Contact number"
							value="${ isNullorEmpty(item.contactDetails?.cellphone) ? `-` : formatPhoneNumber(item.contactDetails?.cellphone) }">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-email-address"
							label="Email address"
							value="${ isNullorEmpty(item.contactDetails?.email) ? `-` : item.contactDetails?.email}"
							class="column-width-200">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-benefit-payout"
							label="Benefit payout"
							value="${ isNullorEmpty(item.benefitPayout) ? formatCurrency(0) : formatCurrency(item.benefitPayout)}">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
			</capitec-content-box>
			`) : this._renderNoResults() } 
		`;
	}

	/**
	 * Render Lives Assured section
	 * @returns {html} The html content of Lives Assured section
	 */
	_renderLivesAssuredSection()
	{
		let livesAssured = this.policyDetails?.roleplayers?.filter(item => item.lifeAssured === true);

		return html`
		<capitec-title-bar
			type="default"
			label="Lives assured (${livesAssured?.length})">
		</capitec-title-bar>
		${ livesAssured?.length > 0 ? livesAssured.map((item) => html `
			<capitec-content-box  class="accounts-box">
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
							data-automation-id="insure-lives-assured-name"
							label="Name & Surname"
							value="${ formatStringAsPascalCase(item.firstName + ` ` + item.surname) }">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-lives-assured-relationship"
							label="Relationship"
							value="${item.relationship}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-dateofbirth"
							label="Date of birth"
							value="${formatDate(item.dateOfBirth, `dd mmm yyyy`) === '' ? '-' : formatDate(item.dateOfBirth, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-premium"
							label="Premium"
							value="${isNullorEmpty(item.premium) ? formatCurrency(0) : formatCurrency(item.premium) }">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-cover-amount"
							label="Cover amount"
							value="${isNullorEmpty(item.coverAmount) ? formatCurrency(0) : formatCurrency(item.coverAmount) }">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
			</capitec-content-box>
		`) : this._renderNoResults() } 
		`;
	}

	/**
	 * Render Bank Details section
	 * @returns {html} The html content of Bank details section 
	 */
	_renderBankDetailsSection(){
		let deductionDetails = this.policyDetails?.deductionDetails;

		return html`
		<capitec-title-bar
			type="default"
			label="Bank details">
		</capitec-title-bar>
		<capitec-content-box  class="accounts-box">
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
							data-automation-id="insure-bank-details-account-name"
							label="Account name"
							value="${ formatStringAsPascalCase(deductionDetails?.bankDetails?.accountName) }">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-bank-details-account-number"
							label="Account number"
							value="${deductionDetails?.bankDetails?.accountNumber}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-bank-details-bank-name"
							label="Bank"
							value="${ deductionDetails?.bankDetails?.bank }">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-bank-details-branch-code"
							label="Branch code"
							value="${deductionDetails?.bankDetails?.branchCode}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-bank-details-account-type"
							label="Account type"
							value="${deductionDetails?.bankDetails?.accountType}"
							class="column-width-200">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-bank-details-collection-day"
							label="Collection day"
							value="${ deductionDetails?.collectionDay }">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
		</capitec-content-box>`;
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html`
			<capitec-content-box  class="accounts-box">
				<horizon-expander
			expandButtonAlignment=""
			.expanded = "${false}"
			?disabled=${true}>
					<capitec-group
					class="no-result-group"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
							<horizon-label
								data-automation-id = "policy-summary-no-results"
								class="no-results"
								label="No results found"
								type="strong">
							</horizon-label>
					</capitec-group>
				</horizon-expander>
			</capitec-content-box>
		`;
	}

	//#endregion
}
window.customElements.define(`horizon-insure-policy-summary`, PolicySummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-policy-summary>
 *
 * @event PolicySummary#navigate-back
 * @type {Object} - N/A
 */