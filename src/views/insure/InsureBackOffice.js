/* eslint-disable sort-imports */
import { css, html } from 'platform/elements';

import { InsureFuneralService } from '../../services/InsureFuneralService';
import { InsureLifeService } from '../../services/InsureLifeService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { MAX_RESULTS, TRANSACTION_TYPE } from 'app/constants/InsureTransactionHistory';

import 'app/components/insure/ClientSummary';
import 'app/components/insure/funeral/FuneralSMSHistory';
import '../../components/insure/funeral/FuneralPolicySummary';
import '../../components/insure/funeral/FuneralPolicyTransactionHistory';
import '../../components/insure/ClaimSummary';

import 'app/components/insure/life/LifePolicySummary';
import 'app/components/insure/life/LifePremiumHistory';
import 'app/components/insure/life/LifeSMSHistory';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { TRANSACTION_STATUS } from 'app/constants/InsureCommon';

const INSURE_PRODUCT_START_DATE = `2001/01/01`;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(INSURE_PRODUCT_START_DATE).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

/**
 * Implements the view for Insure Back Office agent. View is readonly and only allows investigations to take place, no interaction on clients policies
 *
 * 
 * @export
 * @class InsureBackOffice
 * @extends {View}
 */
export class InsureBackOfficeView extends InsureViewBase {

	// #region INITIALISATION

	constructor() {
		super();
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
		this.insureFuneralService = new InsureFuneralService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.insureLifeService = new InsureLifeService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));

		this.policySummary = {};
		this.commsHistory = {};
		this.policyTransactionHistory = {};
		this.policyDetails = {};
		this.selectedLifePolicy = {};
		this.selectedInsureTabIndex = 0;
		this.contractReference = ``;
		this.claims = [];
		this.selectedFuneralPolicyProductCode = ``;

		this.readOnlyMode = true;
		this.isLifeQualifyingClient = false;
	}

	/**
	 * @property {Object} funeralPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} policySummary Local object for new Quote requests
	 * @property {Object} policyDetails data and flags for a specific policy
	 * @property {String} contractReference contains the contract reference for the selected policy 
	 * @property {Boolean} readOnlyMode determines if the view is in read only mode or not
	 * @property {String} selectedFuneralPolicyProductCode Product code of selected policy
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			funeralPolicies: { type: Object, state: true },
			lifePolicies: { type: Object, state: true },
			policySummary: { type: Object, state: true },
			policyDetails: { type: Object, state: true },
			contractReference: { type: String, state: true },
			readOnlyMode: { type: Boolean, state: true },
			renderMode: { type: Number, state: true },
			claims: { type: Object, state: true },
			selectedInsureTabIndex: { type: Number, state: true },
			isLifeQualifyingClient: { type: Boolean, state: true },
			selectedFuneralPolicyProductCode: { type: String, state: true }
		};
	}

	// #endregion

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();

	}

	// #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	/**
	 * Initialise Landing View 
	 * Fetch client policies
	 * @returns {null} null
	 */
	async _initialise() {
		this.funeralPolicies = await this._retrieveClientFuneralPolicies(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
		this.lifePolicies = await this._retrieveClientLifePolicies(this.callerInformation.cifNumber);
		this.claims = await this._retrieveClaims();
		await this._clientQualifiesLife();
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Retrieve client policies via insure channel service
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
	 * @returns {Object} Client policies 
	 */
	async _retrieveClientFuneralPolicies(cifNumber, idNumber) {
		const request = {
			cifNumber: cifNumber,
			idNumber: idNumber
		};

		const resp = await this.insureFuneralService.clientSummary(request);

		if (!resp.succeeded) {
			return;
		}

		return resp.result;
	}

	/**
	 * Retrieve client summary containing all Life policies
	 * @param {String} cifNumber cifNumber of client
	 * @returns {Object} Client Life policies 
	 */
	async _retrieveClientLifePolicies(cifNumber) {
		const request = {
			cifNumber: cifNumber
		};

		const respSummary = await this.insureLifeService.lifeClientSummary(request);
		if (!respSummary.succeeded) {
			this.handleToastError(resp.exception);
			return;
		}
		return respSummary.result;
	}

	/**
	 * Retrieve Policy Summary via insure channel service
	 * @param {*} contractReference contractReference
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
	 * @returns {Object} Policy Summary Details 
	 */
	async _retrieveFuneralPolicySummary(contractReference, cifNumber, idNumber) {
		const request = {
			contractReference: contractReference,
			cifNumber: cifNumber,
			idNumber: idNumber
		};
		const resp = await this.insureFuneralService.policySummary(request);

		if (!resp.succeeded) {
			return;
		}

		return resp.result;
	}

	/**
 * retrieve the communication history for the specific policy
 * Map metadata (coverDetails) back when response is received
 * @param {*} contractReference startDate
 * @param {*} fromDate startDate
 * @param {*} toDate endDate
 * @returns {Object} Communication history response
 */
	async _retrieveCommsHistory(contractReference, fromDate, toDate) {

		const commsHistoryDetails = {
			"contractReference": contractReference,
			"fromDate": fromDate,
			"toDate": toDate,
			"productCode": this.selectedFuneralPolicyProductCode
		};

		const resp = await this.insureFuneralService.communicationHistory(commsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			return resp.result;
		}
		this.handleToastError(resp.exception);
		return null;

	}

	/**
	 * Retrieve Claims list for Client
	 * @returns {Object} Claims list
	 */
	async _retrieveClaims() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			idNumber: this.callerInformation.southAfricanIDNumber
		};
		const claimsList = await this.insureFuneralService.viewExistingClaims(request);
		return claimsList.result;
	}

	/**
	 * Check if client qualifies for Life product
	 * @returns {Object} Client Life policies 
	 */
	async _clientQualifiesLife() {
		const request = {
			cifNumber: this.callerInformation.cifNumber
		};

		const resp = await this.insureLifeService.lifeClientQualify(request);
		if (!resp.succeeded) {
			this.isLifeQualifyingClient = false;
		} else {
			this.isLifeQualifyingClient = resp.result.qualify;
		}
	}

	/**
	* Navigate so specific subview
	* @param {*} newMode newMode
	* @returns {null} null
	  */
	_navigateToSubView(newMode) {
		this.renderMode = newMode;
	}

	/**
	 * Navigate back from any view to Summary
	 * @returns {null} null
	 */
	_backToSummaryPage() {
		this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	}

	/**
	 * Prepare and navigate to Transaction history
	 * @param {*} e event 
	 * @returns {null} null
	 */
	async _goToPolicyTransactionHistory(e) {
		this.contractReference = e.detail.policyNumber;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;

		await this._retrieveFuneralPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY);
	}

	async _goToPolicySummary(e) {
		// Telemetry Here
		this.policyDetails = await this._retrieveFuneralPolicySummary(
			e.detail.policyContractReference,
			this.callerInformation.cifNumber,
			this.callerInformation.southAfricanIDNumber
		);
		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_POLICY_SUMMARY);
	}

	/**
	 * Prepare and navigate to Life Policy Premium History
	 * @param {event} e e
	 * @returns {void}
	 */
	async _goToLifePolicyPremiumHistory(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		await this._retrieveLifePolicyPremiumHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY);
	}

	/**
	 * Prepare and navigate to Life SMS History
	 * @param {event} e e
	 * @returns {void}
	 */
	_goToLifeSMSHistory(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_SMS_HISTORY);
	}

	_goToSMSHistory(e) {
		this.policyNumber = e.detail.policyItem.contractReference;
		this.selectedFuneralPolicyProductCode = e.detail.productCode;
		// call fips here

		// Telemetry Here

		this._navigateToSubView(INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY);
	}

	/**
	 * Fetch latest claim details and render Claims Summary 
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToClaimSummary(e) {
		this.claimSummary = e.detail;
		this._navigateToSubView(INSURE_RENDER_MODE.CLAIM_SUMMARY);
	}

	/**
	 * Fetch Policy Transaction History
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @param {*} pageIndex pageIndex
	 * @returns {*} transaction history
	 */
	async _retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.contractReference,
			transactionDateType: `TransactionDate`,
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			transactionStatus: TRANSACTION_STATUS.FINANCIAL,
			pagniation: {
				pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
				totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS
			},
			productCode: this.selectedFuneralPolicyProductCode
		};

		this.transactions = [];

		this.policyTransactionHistory = {
			contractReference: this.contractReference,
			bankName: this.bankName,
			accountNumber: this.accountNumber,
			arrearsAmount: this.arrearsAmount
		};

		const returnValue = await this.insureFuneralService.policyPremiumHistory(transactionHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions.
			filter((ele) => ele.premiumType === `PremiumCollection` || ele.premiumType === `Disbursement` || ele.premiumType === `Submit` || ele.premiumType === `AdHocReceipt` || ele.premiumType === `DebitOrderReceipt`).map((item) => {
				const formatedDate = new Date(Date.parse(item.date));
					item.premiumType = TRANSACTION_TYPE[item.premiumType?.toUpperCase()];
					item.formatedDate = formatedDate;
					item.formatedPremium = isNullorEmpty(item.premium) ? `` : formatCurrency(item.premium);
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = isNullorEmpty(item.amount) ? `` : formatCurrency(item.amount);
					return item;
				});
			this.transactions.push(...formattedTrans);

			this.policyTransactionHistory.transactions = this.transactions;

			this.endCallContext = `PolicyTransactionHistory`;
			this.renderMode = INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY;
		}
	}

	/**
	 * Fetch Policy Transaction History
	 * 
	 * @returns {null} null
	 */
	async _retrieveLifePolicyPremiumHistory() {
		const PremiumHistoryRequest = {
			policyNumber: this.selectedLifePolicy.contractReference
		};

		this.lifeTransactions = [];

		let totalArrears = 0;
		this.selectedLifePolicy?.arrears?.forEach(arrears => {
			totalArrears += parseFloat(arrears.arrearsPaymentDueAmount, 10);
		});

		this.lifePremiumHistory = {
			contractReference: this.selectedLifePolicy.contractReference,
			bankName: this.selectedLifePolicy.bankDetails.bank,
			accountNumber: this.selectedLifePolicy.bankDetails.accountNumber,
			arrearsAmount: formatCurrency(totalArrears)
		};
		const returnValue = await this.insureLifeService.lifePremiumHistory(PremiumHistoryRequest);
		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactionHistory.
				filter((ele) => ele.eventTransactionType === `Premium collection` || ele.eventTransactionType === `Refund` || ele.eventTransactionType === `Pay-out` || ele.eventTransactionType === `Ad-hoc`).map((item) => {
					const formatedDate = new Date(Date.parse(item.eventDate));
					item.formatedDate = formatedDate;
					item.formatedPremium = isNullorEmpty(this.selectedLifePolicy?.totalPremium) ? `` : formatCurrency(this.selectedLifePolicy?.totalPremium);
					item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
					item.formatedAmount = isNullorEmpty(item.eventAmount) ? `` : formatCurrency(item.eventAmount);
					return item;
				});
			this.lifeTransactions.push(...formattedTrans);
			this.lifePremiumHistory.transactions = this.lifeTransactions;
			this.renderMode = INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY;
		} else {
			// this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
			this.handleToastError(returnValue.exception);
		}
	}

	/**
	 * Unload Policy Transactions
	 * @returns {null} null
	 */
	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = {};
	}

	/**
	 * Unload Life premium history Transactions
	 * @returns {void}
	 */
	_unloadLifePremiumHistory() {
		this.lifePremiumHistory = {};
	}

	/**
	 * Unload Policy Transactions State
	 * @returns {null} null
	  */
	_unloadClientPolicies() {
		if (this.funeralPolicies?.summaryDetails?.policies !== null) {
			this.funeralPolicies.summaryDetails.policies.forEach(item => {
				item.isExpanded = false;
			});
		}
	}

	/**
	 * Fetch Life policy SMS history
	 * @returns {void} void
	 */
	async _retrieveLifeSMSHistory() {
		const smsHistoryDetails = {
			"policyNumber": this.selectedLifePolicy.contractReference
		};

		const resp = await this.insureLifeService.lifeSMSHistory(smsHistoryDetails, () => true);
		if (resp.succeeded === true && resp.result !== null) {
			super.isOnlyProductEnquiry = false;
			return resp.result;
		}
		this.handleToastError(resp.exception);
		return null;
	}

	/**
	 * Prepare and navigate to Life Policy Summary
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToLifePolicySummary(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY);
	}

	/**
	 * Update client elect preferences for type
	 * @param {Object} electRequest Update selected preference request
	 * @returns {void} 
	 */
	async _updateElectOptions(electRequest) {
		electRequest.cifNumber = this.callerInformation.cifNumber;
		electRequest.clientIDNumber = this.callerInformation.southAfricanIDNumber;
		const electResp = await this.insureFuneralService.SetElectOptions(electRequest);

		if (!electResp.succeeded) {
			super.isOnlyProductEnquiry = false;
			this.insureErrorToastMessage = `December collection OPT change was unsuccessful. Please try again later.`;
			this.showInsureErrorToast = true;
			return;
		}
		super.isOnlyProductEnquiry = false;
		this.showInsureSuccessToast = true;
		this.insureSuccessToastMessage = `Early December collection OPT ${electRequest.participating === true ? `OUT` : `IN`} successfully updated.`;
		window.setTimeout(() => this.showInsureSuccessToast = false, 5000);
		this.funeralPolicies = await this._retrieveClientFuneralPolicies(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
	}

	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css``
		];
	}

	/**
	 * Generates the component template for kiosk mode.
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
		
		${super._webTemplate()}
		${this._renderLandingPage()}`;
	}

	/**
	 * Main render switch for Insure views
	 *
	 * @returns {html} Component html based on current render mode.
	 */
	_renderLandingPage() {
		switch (this.renderMode) {
			case INSURE_RENDER_MODE.CLIENT_POLICIES:
				return html`${this._renderClientPoliciesPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY:
				return html`${this._renderPolicyTransactionHistoryPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`;
			case INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY:
				return html`${this._renderSMSHistory()}`;
			case INSURE_RENDER_MODE.CLAIM_SUMMARY:
				return html`${this._renderClaimSummaryPage()}`;
			case INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY:
				return html`${this._renderLifePolicySummaryPage()}`;
			case INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY:
				return html`${this._renderLifePolicyPremiumHistoryPage()}`;
			case INSURE_RENDER_MODE.LIFE_SMS_HISTORY:
				return html`${this._renderLifeSMSHistoryPage()}`;
			default:
				return html``;
		}
	}

	/**
	 * Render Landing page for Insure existing clients
	 * @return {html} Html of the sub view
	 */
	_renderClientPoliciesPage() {
		return html`
			<horizon-insure-client-summary 
				.funeralPolicies = "${this.funeralPolicies}" 
				.lifePolicies="${this.lifePolicies}" 
				.readOnlyMode="${this.readOnlyMode}"
				.clientClaims="${this.claims}"
				.updateEarlyCollectionPreferences="${(electRequest) => this._updateElectOptions(electRequest)}"
				.selectedInsureTabIndex = "${this.selectedInsureTabIndex}"
				.isLifeQualifyingClient = "${this.isLifeQualifyingClient}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToSMSHistory(e)}"
				@navigate-to-life-policy-summary="${(e) => this._goToLifePolicySummary(e)}"
				@navigate-to-life-policy-premium-history="${(e) => this._goToLifePolicyPremiumHistory(e)}"
				@navigate-to-life-sms-history="${(e) => this._goToLifeSMSHistory(e)}">
			</horizon-insure-client-summary>`;
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	_renderPolicySummaryPage() {
		return html`
			<horizon-insure-funeral-policy-summary 
				.policyDetails = "${this.policyDetails}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadClientPolicies()}"
				.readOnlyMode="${this.readOnlyMode}">
			</horizon-insure-funeral-policy-summary>`;
	}

	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	_renderPolicyTransactionHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.FUNERAL_POLICY_TRANSACTION_HISTORY
			? html`<horizon-insure-funeral-policy-transaction-history 
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._retrieveFuneralPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}"
				.readOnlyMode="${this.readOnlyMode}">
			</horizon-insure-funeral-policy-transaction-history>`
			: html``;
	}

	_renderSMSHistory() {
		return this.renderMode === INSURE_RENDER_MODE.FUNERAL_SMS_HISTORY
			? html`
		<horizon-insure-funeral-sms-history-page
			.contractReference = ${this.policyNumber} 
			.contactNumber = ${this.callerInformation.verifiedTelephoneNumber}
			.getCommsHistory="${(contractReference, startDate, endDate) => this._retrieveCommsHistory(contractReference, startDate, endDate)}"
			.readOnlyMode="${this.readOnlyMode}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
		</horizon-insure-funeral-sms-history-page>`
			: html``;
	}

	/**
	 * Render Life Premium History Page
	 * @returns {html} Html of the sub view
	 */
	_renderLifePolicyPremiumHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.LIFE_POLICY_PREMIUM_HISTORY
			? html`
		<horizon-insure-life-premium-history
			.lifePremiumHistory="${this.lifePremiumHistory}"
			.getLifePremiumHistory="${(startDate, endDate, pageIndex) => this._retrieveLifePolicyPremiumHistory(startDate, endDate, pageIndex)}"
			.disposeData="${() => this.lifePremiumHistory = []}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
			@unloading="${() => this._unloadLifePremiumHistory()}"
		>
		</horizon-insure-life-premium-history>
		`
			: html``;
	}

	_renderLifeSMSHistoryPage() {
		return html`
			<horizon-insure-life-sms-history-page
			.getCommsHistory="${() => this._retrieveLifeSMSHistory()}"
			.contractReference="${this.selectedLifePolicy.contractReference}"
			@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-sms-history-page>
		`;
	}

	/**
 * Renders the Claim Summary page
 * 
 * @returns {html} html
 */
	_renderClaimSummaryPage() {
		return html`
				<horizon-insure-claim-summary
					.claimSummary="${this.claimSummary.claim}"
					@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
				</horizon-insure-claim-summary>`;
	}

	/**
	 * Renders the pocket summary page, configured with the selected pocket type
	 * 
	 * @returns {html} html
	 */
	_renderLifePolicySummaryPage() {
		return html`
			<horizon-insure-life-policy-summary 
				.selectedLifePolicy="${this.selectedLifePolicy}"
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}">
			</horizon-insure-life-policy-summary >`;
	}


	// #endregion RENDERING


}
customElements.define(`horizon-insure-backoffice`, InsureBackOfficeView);