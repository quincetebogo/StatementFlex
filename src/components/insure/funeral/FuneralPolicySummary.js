import { Component, css, html } from 'platform/elements';
import { FUN_BENEFIT_DOT_TYPES, FUN_POLICY_RULES, POLICY_RULES, ROLE_PLAYER_RELATIONSHIP } from 'app/constants/InsureCommon';
import { formatDate, formatPhoneNumber, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { PolicySummaryEvents } from 'app/constants/telemetry/events/Insure';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * Policy summary component showing details of single policy with its role players
 * 
 * Events Raised 
 * -------------
 * navigate-back
 *  
 * @export
 * @class FuneralPolicySummary
 * @extends {Component}
 */
class FuneralPolicySummary extends Component {

	// #region INITIALISATION

	constructor() {
		super();
		this.policyDetails = null;
		this.telemetryEvents = {};
		this._telemetry = HorizonTelemetry.getInstance();
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
			policyDetails: { type: Object, state: true },
			benefitDetails: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.telemetryEvents = PolicySummaryEvents;
		await this._telemetry.startSpan(this.telemetryEvents.POLICY_SUMMARY, {});

		this._initialise();
	}

	/**
	 * call unload event once the component removed from the DOM.
	 * @returns {void}
	 */
	async disconnectedCallback() {
		await this._telemetry.endSpan(this.telemetryEvents.POLICY_SUMMARY, {});
		super.disconnectedCallback();
		this._unloading();
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * unload the policy transactions
	 * @returns {void} 
	 */
	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	/**
	 * Navigate to Insure Landing page
	 * @returns {void} 
	 */
	async _backToClientPoliciesPage() {
		this._telemetry.logEvent(this.telemetryEvents.POLICY_SUMMARY_BACK, {
			"screen": TelemetryScreen.INSURE_POLICY_SUMMARY,
			"next-screen": TelemetryScreen.INSURE_CLIENT_SUMMARY
		});
		this.dispatchEvent(new CustomEvent(`navigate-back`, { detail: {} }));
	}


	/**
	 * Status to show on policy
	 * @returns {string} displayStatus
	 */
	_getPolicyDisplayStatus() {
		let displayStatus = this.policyDetails?.displayStatus;
		if (this.policyDetails?.policyRule !== `Standard`) {
			displayStatus = POLICY_RULES[this.policyDetails?.policyRule.toUpperCase()];
		}
		return displayStatus;
	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE FUNCTIONS

	async _initialise() {
	}

	_determineBenefit() {
		if (this.policyDetails?.policyRule === FUN_POLICY_RULES.MATERNITY_WAIVER) {
			this.benefitDetails = this.policy.benefits.find(benefit => benefit.type === FUN_BENEFIT_DOT_TYPES.NEW_BORN);
			return `Newborn Premium Waiver`;
		} else if (this.policyDetails?.policyRule === FUN_POLICY_RULES.POLICY_PAUSE) {
			this.benefitDetails = this.policy.benefits.find(benefit => benefit.type === FUN_BENEFIT_DOT_TYPES.POLICY_PAUSE);
			return `Policy Pause`;
		}
	}

	// #endregion PRIVATE FUNCTIONS

	// #region RENDERING

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
			.inner-details-title{
				--theme-type-default-background: rgb(244, 244, 244);
				border-top: 1px solid #E1E1E1;
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
			.expander-header > horizon-label[label="Status"] {
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
				width: 250px;
				height: 80px;
				margin-left: 16px;
				padding: 0px;

				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
			}
			.options-group.first-row{
				margin-top: 25px;
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
				--horizon-label-value-color: #C83C37 !important;
			}
			.horizon-expander-height{
				--theme-expander-header-height: auto !important;
			}

			.bottom-spacing {
				margin-bottom: 30px;
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
		<div class="bottom-spacing">
			<capitec-card data-automation-id="policy-summary" class="card">
				<capitec-title-bar type="insure" class="insure-title-bar">
					<img class="action-image" src="/images/insure/left-arrow.svg"
						data-automation-id="policy-summary-back-to-policies" @click="${() => this._backToClientPoliciesPage()}" />
					<capitec-label label="Funeral Plan" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>
				<capitec-group layout="vertical" halign="left" valign="top" gap="none">
					${this._renderSections()}
				</capitec-group>
			</capitec-card>
		</div>`;
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
			${this._renderMandatesDetailsSection()}
			${this._renderBenefitDetailsSection()}
		`;
	}

	/**
	 * Render Main Life section
	 * @returns {html} The html content of Main Life section
	 */
	_renderMainLifeSection() {
		const outstandingArrearsAmount = this.policyDetails?.arrearDetails?.outstandingAmount;
		const mainLifeDetails = this.policyDetails?.roleplayers?.filter(item => item.relationship === `MainLife`);

		return html`
		<capitec-title-bar type="default" label="Main Life">
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
					<horizon-label data-automation-id="insure-main-life-start-date" label="Start date"
						value="${formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`) === `` ? `-` : formatDate(this.policyDetails?.commencementDate, `dd mmm yyyy`)}">
					</horizon-label>
					<horizon-label data-automation-id="insure-main-life-cover-amount" label="Cover amount"
						value="${isNullorEmpty(mainLifeDetails[0]?.coverAmount) ? formatCurrency(0) : formatCurrency(mainLifeDetails[0]?.coverAmount)}">
					</horizon-label>
					<horizon-label data-automation-id="insure-main-life-total-premium" label="Premium"
						value="${isNullorEmpty(mainLifeDetails[0]?.premium) ? formatCurrency(0) : formatCurrency(mainLifeDetails[0]?.premium)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-arrears"
						label="Arrears"
						class="${outstandingArrearsAmount > 0 ? `arrears` : ``}"
						value="${isNullorEmpty(outstandingArrearsAmount) ? formatCurrency(0) : formatCurrency(outstandingArrearsAmount)}">
					</horizon-label>
					<horizon-label
						data-automation-id="insure-main-life-display-status"
						label="Status"
						value="${this._getPolicyDisplayStatus()}"
						class="column-width-200 ${this.policyDetails?.status === `Active` ? `active-status` : `inactive-status`}">
					</horizon-label>
				</capitec-group>
				<div slot="content">
					<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
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
		const csvOfMonths = this.policyDetails?.arrearDetails?.arrears?.map((item) => formatDate(item.dueDate, `dd mmm yyyy`)).join(`, `);
		const activeBankAccountNo = this.policyDetails?.deductionDetails?.bankDetails?.accountNumber;
		const activeMandateDetails = this.policyDetails?.mandates?.filter(x => x.accountNumber === activeBankAccountNo);

		return html`
			<capitec-title-bar type="default" label="Additional Information" class="inner-details-title"></capitec-title-bar>
			<capitec-group class="options-group first-row" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Last payment received"
					value="${isNullorEmpty(paymentSchedule?.previousPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.previousPaymentAmount)}"
					data-automation-id="policy-summary-last-premium-payment">
				</horizon-label>
				<horizon-label label="Last payment date"
					value="${isNullorEmpty(paymentSchedule?.previousPaymentDate) ? `-` : formatDate(paymentSchedule?.previousPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-last-premium-date">
				</horizon-label>
				<horizon-label label="Next payment due"
					value="${isNullorEmpty(paymentSchedule?.nextPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.nextPaymentAmount)}"
					data-automation-id="policy-summary-next-debit-amount">
				</horizon-label>
				<horizon-label label="Next payment date"
					value="${isNullorEmpty(paymentSchedule?.nextPaymentDate) ? `-` : formatDate(paymentSchedule?.nextPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-next-premium">
				</horizon-label>
			</capitec-group>
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Last arrears payment"
					value="${isNullorEmpty(paymentSchedule?.previousArrearsPaymentAmount) ? formatCurrency(0) : formatCurrency(paymentSchedule?.previousArrearsPaymentAmount)}"
					data-automation-id="policy-summary-last-arrears-payment-amount">
				</horizon-label>
				<horizon-label label="Last arrears payment date"
					value="${isNullorEmpty(paymentSchedule?.previousArrearsPaymentDate) ? `-` : formatDate(paymentSchedule?.previousArrearsPaymentDate, `dd mmm yyyy`)}"
					data-automation-id="policy-summary-last-arrears-payment-date">
				</horizon-label>
				<horizon-label label="Months outstanding" value="${isNullorEmpty(csvOfMonths) ? `None` : csvOfMonths}"
					data-automation-id="policy-summary-months-outstanding">
				</horizon-label>
				<horizon-label label="Mandate Status"
					value="${!isNullorEmpty(activeMandateDetails) && !isNullorEmpty(activeMandateDetails[0]?.mandateStatus) ? activeMandateDetails[0]?.mandateStatus : `-`}"
					data-automation-id="policy-summary-mandate-status">
				</horizon-label>
			</capitec-group>
			
			${this.policyDetails.status === `Lapsed`
				? html`
				<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label label="Lapse Date"
						value="${isNullorEmpty(this.policyDetails.cancellationDetails?.recordedCancellationDate) ? `-` : formatDate(this.policyDetails.cancellationDetails?.recordedCancellationDate, `dd mmm yyyy`)}"
						data-automation-id="insure-policy-cancellation-date">
					</horizon-label>
				</capitec-group>
				`
				: ``}

			${this.policyDetails.status === `Cancelled`
				? html`
				<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label label="${this.policyDetails.status === `Lapsed` ? `Lapse Date` : `Cancellation date`}"
						value="${isNullorEmpty(this.policyDetails.cancellationDetails?.recordedCancellationDate) ? `-` : formatDate(this.policyDetails.cancellationDetails?.recordedCancellationDate, `dd mmm yyyy`)}"
						data-automation-id="insure-policy-cancellation-date">
					</horizon-label>
					<horizon-label label="Reason"
						value="${this.policyDetails?.cancellationDetails?.displayReason}"
						data-automation-id="insure-policy-cancellation-reason">
					</horizon-label>
				</capitec-group>
				`
				: ``}
		`;
	}

	/**
	 * Render Beneficiaries section
	 * @returns {html} The html content of Beneficiaries section
	 */
	_renderBeneficiariesSection() {
		const beneficiaries = this.policyDetails?.roleplayers?.filter(item => item.beneficiary === true);

		return html`
		<capitec-title-bar type="default" label="Payout Beneficiaries">
		</capitec-title-bar>
		${beneficiaries?.length > 0 ? beneficiaries.map((item) => html`
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
							value="${formatStringAsPascalCase(`${item.firstName} ${item.surname}`)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-beneficiaries-relationship"
							label="Relationship"
							value="${item.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[item.relationship?.toUpperCase()])}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-dateofbirth"
							label="Date of birth"
							value="${formatDate(item.dateOfBirth, `dd mmm yyyy`) === `` ? `-` : formatDate(item.dateOfBirth, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-contact-number"
							label="Contact number"
							value="${isNullorEmpty(item.contactDetails?.cellphone) ? `-` : formatPhoneNumber(item.contactDetails?.cellphone)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-email-address"
							label="Email address"
							value="${isNullorEmpty(item.contactDetails?.email) ? `-` : item.contactDetails?.email}"
							class="column-width-200">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-beneficiaries-benefit-payout"
							label="Benefit payout"
							value="${isNullorEmpty(item.benefitPayout) ? formatCurrency(0) : formatCurrency(item.benefitPayout)}">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
		</capitec-content-box>
		`) : this._renderNoResults()}
		`;
	}

	/**
	 * Render Lives Assured section
	 * @returns {html} The html content of Lives Assured section
	 */
	_renderLivesAssuredSection() {
		const livesAssured = this.policyDetails?.roleplayers?.filter(item => item.lifeAssured === true);

		return html`
		<capitec-title-bar type="default" label="Lives assured (${livesAssured?.length})">
		</capitec-title-bar>
		${livesAssured?.length > 0 ? livesAssured.map((item) => html`
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
							value="${formatStringAsPascalCase(`${item.firstName} ${item.surname}`)}">
						</horizon-label>
						<div class="vertical-line"></div>
						<horizon-label
							data-automation-id="insure-lives-assured-relationship"
							label="Relationship"
							value="${item.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[item.relationship?.toUpperCase()])}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-dateofbirth"
							label="Date of birth"
							value="${formatDate(item.dateOfBirth, `dd mmm yyyy`) === `` ? `-` : formatDate(item.dateOfBirth, `dd mmm yyyy`)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-premium"
							label="Premium"
							value="${isNullorEmpty(item.premium) ? formatCurrency(0) : formatCurrency(item.premium)}">
						</horizon-label>
						<horizon-label
							data-automation-id="insure-lives-assured-cover-amount"
							label="Cover amount"
							value="${isNullorEmpty(item.coverAmount) ? formatCurrency(0) : formatCurrency(item.coverAmount)}">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
		</capitec-content-box>
		`) : this._renderNoResults()}
		`;
	}

	/**
	 * Render Bank Details section
	 * @returns {html} The html content of Bank details section 
	 */
	_renderBankDetailsSection() {
		const deductionDetails = this.policyDetails?.deductionDetails;

		return html`
		<capitec-title-bar type="default" label="Bank details">
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
							value="${formatStringAsPascalCase(deductionDetails?.bankDetails?.accountName)}">
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
							value="${deductionDetails?.bankDetails?.bank}">
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
							value="${deductionDetails?.collectionDay}">
						</horizon-label>
				</capitec-group>
			</horizon-expander>
		</capitec-content-box>`;
	}

	_renderMandatesDetailsSection() {
		const mandateDetails = this.policyDetails?.mandates;

		const latestDate = new Date(Math.max.apply(null, mandateDetails.map((e) => {
			const date = new Date(e.mandateInitiationDate);
			return date;
		})));
		return html`
			<capitec-title-bar type="default" label="Mandate details">
			</capitec-title-bar>
			${mandateDetails.length === 0 ? this._renderNoResults() 
			: html`
			${mandateDetails.map((mandate) => html`
			${new Date(mandate.mandateInitiationDate).getTime() === latestDate.getTime() ? html`
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
									label="Mandate type"
									value="${isNullorEmpty(mandate.mandateType) ? `-` : mandate.mandateType}">
								</horizon-label>
								<div class="vertical-line"></div>
								<horizon-label
									label="Instalment amount"
									value="${isNullorEmpty(mandate.instalmentAmount) ? `-` : formatCurrency(mandate.instalmentAmount)}">
								</horizon-label>
								<horizon-label 
									label="Instalment Occurrence"
									value="${isNullorEmpty(mandate.instalmentOccurrence) ? `-` : mandate.instalmentOccurrence}"
									class="column-width-200">
								</horizon-label>
								<horizon-label
									label="Mandate status"
									value="${mandate.mandateStatus}"
									class="column-width-200 ${mandate.mandateStatus === `Active` ? `active-status` : `inactive-status`}">
								</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								${this._renderMandateOptions(mandate)}
							</capitec-group>
						</div>
					</horizon-expander>
				</capitec-content-box>
			` : html``}
			`)}
			`}
		`;
	}

	_renderMandateOptions(mandate) {
		return html`
		<capitec-title-bar type="default" label="Additional Information" class="inner-details-title"></capitec-title-bar>
			<capitec-group class="options-group first-row" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Voice recording number"
					value="${isNullorEmpty(mandate.voiceRecordingNumber) ? `-` : mandate.voiceRecordingNumber}">
				</horizon-label>
				<horizon-label label="Tracking indicator"
					value="${isNullorEmpty(mandate.mandateRequestTransactionIdentifier) ? `-` : mandate.mandateRequestTransactionIdentifier}">
				</horizon-label>
				<horizon-label label="Initial amount"
					value="${isNullorEmpty(mandate.initialInstalmentAmount) ? formatCurrency(0) : formatCurrency(mandate.initialInstalmentAmount)}">
				</horizon-label>
				<horizon-label label="Number of debit instalments"
					value="${isNullorEmpty(mandate.numberOfDebitInstalments) ? `-` : mandate.numberOfDebitInstalments}">
				</horizon-label>
			</capitec-group>
			
			<capitec-group class="options-group" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Mandate initiation date"
					value="${isNullorEmpty(mandate.mandateInitiationDate) ? `-` : formatDate(mandate.mandateInitiationDate, `dd mmm yyyy`)}">
				</horizon-label>
				<horizon-label label="First collection day"
					value="${isNullorEmpty(mandate.firstCollectionDate) ? `-` : formatDate(mandate.firstCollectionDate, `dd mmm yyyy`)}">
				</horizon-label>
				<horizon-label label="Last collection date"
					value="${isNullorEmpty(mandate.lastCollectionDate) ? `-` : formatDate(mandate.lastCollectionDate, `dd mmm yyyy`)}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderBenefitDetailsSection() {
	return html`
		<capitec-title-bar type="default" label="Premium Waivers">
		</capitec-title-bar>
		${this.policyDetails.policyRule === FUN_POLICY_RULES.STANDARD ? this._renderNoResults() 
		: html`
			<capitec-content-box class="accounts-box">
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
								label="Benefit type"
								value="${this._determineBenefit()}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label
								label="Status"
								value="${`Active`}"
								class="column-width-200 ${`active-status`}">
							</horizon-label>
					</capitec-group>
					<div slot="content">
						<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
							${this._renderBenefitOptions()}
						</capitec-group>
					</div>
				</horizon-expander>
			</capitec-content-box>
		`}
	`}

	_renderBenefitOptions() {
		return html`
		<capitec-title-bar type="default" label="Additional Information" class="inner-details-title"></capitec-title-bar>
			<capitec-group class="options-group first-row" layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label label="Start date"
					value="${isNullorEmpty(this.benefitDetails?.benefitStartDate) ? `-` : formatDate(this.benefitDetails?.benefitStartDate, `dd/mm/yyyy`)}">
				</horizon-label>
				<horizon-label label="End date"
					value="${isNullorEmpty(this.benefitDetails?.benefitEndDate) ? `-` : formatDate(this.benefitDetails?.benefitEndDate, `dd/mm/yyyy`)}">
				</horizon-label>
				<horizon-label label="Next Collection Date"
					value="${isNullorEmpty(this.policy?.paymentSchedule?.nextPaymentDate) ? `-` : formatDate(this.policy?.paymentSchedule?.nextPaymentDate, `dd/mm/yyyy`)}">
				</horizon-label>
			</capitec-group>
		`;
	}

	/**
	 * Render message when no results found
	 * @returns {html} The html content of No results
	 */
	_renderNoResults() {
		return html`
			<capitec-content-box class="accounts-box">
				<horizon-expander expandButtonAlignment="" .expanded="${false}" ?disabled=${true}>
					<capitec-group class="no-result-group" slot="custom-header" layout="horizontal" gap="clear" halign="left"
						valign="center">
						<horizon-label data-automation-id="policy-summary-no-results" class="no-results" label="No results found"
							type="strong">
						</horizon-label>
					</capitec-group>
				</horizon-expander>
			</capitec-content-box>
		`;
	}
	// #endregion
}
window.customElements.define(`horizon-insure-funeral-policy-summary`, FuneralPolicySummary);

/**
 * When back arrow button is clicked, navigate
 *
 * @example
 * <horizon-insure-funeral-policy-summary ... @navigate-back="${this._handler}"></horizon-insure-funeral-policy-summary>
 *
 * @event FuneralPolicySummary#navigate-back
 * @type {Object} - N/A
 */