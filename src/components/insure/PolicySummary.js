import { Component, css, html } from 'platform/elements';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';

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

	//#region EVENT HANDLERS

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
				--theme-type-default-background: rgb(244, 244, 244);
				--theme-label-title-font-size: 14px;
				--theme-label-title-font-weight: 600;
				width: 100%;
				border-top: 1px solid #E1E1E1;
				box-shadow: none!important;
			}
			horizon-label {
				width: 140px;
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
			.accounts-box {
				height: auto;
				--theme-container-padding-left: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 16px;
				--theme-container-padding-top: 16px;
				--theme-layout-gap-spacing: 0px;
			}
			.fixed-label {
				width: 175px;
			}
			.expander-header > horizon-label[label="Status"] {
				--horizon-label-value-color: #70AF00;
				width: 200px;
				text-overflow: ellipsis;
			}
			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
			}
			.no-results {
				--theme-label-strong-font-size: 18px;
				--theme-label-strong-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}
			.no-result-group {
				width: 1032px;
				margin-top: 20px;
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
			${this._renderBeneficiariesSection()}
			${this._renderLivesAssuredSections()}
		`;
	}

	/**
	 * Render Main Life section
	 * @returns {html} The html content of Main Life section
	 */
	_renderMainLifeSection()
	{
		const sumArrears = this.policyDetails?.arrearDetails?.arrears?.reduce((accumulator, object) => {
			return accumulator + object.amount;
		  }, 0);

		const mainLifeDetails = this.policyDetails?.roleplayers?.filter(item => item.relationship === 'MainLife');

		return html`
		<capitec-title-bar
			type="default"
			label="Main Life">
		</capitec-title-bar>

		<capitec-content-box  class="accounts-box">
		<horizon-expander
		expandButtonAlignment=""
		.expanded = "${false}"
		?disabled=${true}>
			<capitec-group 
				class="expander-header"
				slot="custom-header"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<horizon-label
						class="fixed-label"
						data-automation-id="insure-main-life-policy-number"
						label="Policy number"
						value="${this.policyDetails?.contractReference}">
					</horizon-label>
					<div class="vertical-line"></div>
					<horizon-label
						data-automation-id="insure-main-life-effective-date"
						label="Effective date"
						value="${formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`) === '' ? '-' : formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-cover-amount"
						label="Cover amount"
						value="${ isNullorEmpty(mainLifeDetails?.coverAmount) ? formatCurrency(0) : formatCurrency(mainLifeDetails?.coverAmount)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-total-premium"
						label="Premium"
						value="${ isNullorEmpty(this.policyDetails?.totalPremium) ? formatCurrency(0) :  formatCurrency(this.policyDetails?.totalPremium)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-arrears"
						label="Arrears"
						value="${formatCurrency(sumArrears)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-display-status"
						label="Status"
						value="${this.policyDetails?.displayStatus}">
					</horizon-label>
			</capitec-group>
		</horizon-expander>
		</capitec-content-box>
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
			?disabled=${true}>
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="fixed-label"
							data-automation-id="insure-beneficiaries-name"
							label="Name & Surname"
							value="${item.firstName + ` ` + item.surname}">
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
	_renderLivesAssuredSections()
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
			?disabled=${true}>
				<capitec-group 
					class="expander-header"
					slot="custom-header"
					layout="horizontal"
					gap="clear"
					halign="left"
					valign="center">
						<horizon-label
							class="fixed-label"
							data-automation-id="insure-lives-assured-name"
							label="Name & Surname"
							value="${item.firstName + ` ` + item.surname}">
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
							data-automation-id="insure-lives-assured-benefit-payout"
							label="Benefit payout"
							value="${formatCurrency(item.benefitPayout)}">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
			</capitec-content-box>
		`) : this._renderNoResults() } 
		`;
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<capitec-label
						data-automation-id = "policy-summary-no-results"
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>
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