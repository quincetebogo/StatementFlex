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

		this.readOnlyMode = true;
	}

	/**
	 * @property {Object} funeralPolicies Data & flags for all policies relating to client CIF
	 * @property {Object} policySummary Local object for new Quote requests
	 * @property {Object} policyDetails data and flags for a specific policy
	 * @property {String} contractReference contains the contract reference for the selected policy 
	 * @property {Boolean} readOnlyMode determines if the view is in read only mode or not
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
			claims: { type: Object, state: true }
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
			"toDate": toDate
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
		// Telemetry Here
		this.contractReference = e.detail.policyNumber;
		this.bankName = e.detail.bankName;
		this.accountNumber = e.detail.accountNumber;
		this.arrearsAmount = e.detail.arrearsAmount;

		await this._getPolicyTransactionHistory();
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

	_goToSMSHistory(e) {
		this.policyNumber = e.detail.policyItem.contractReference;

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
	async _getPolicyTransactionHistory(startDate, endDate, pageIndex) {
		const transactionHistoryRequest = {
			contractReference: this.contractReference,
			transactionDateType: `TransactionDate`,
			fromDate: startDate || POLICY_TRANSACTION_HISTORY.START_DATE,
			toDate: endDate || POLICY_TRANSACTION_HISTORY.END_DATE,
			transactionStatus: TRANSACTION_STATUS.FINANCIAL,
			pagniation: {
				pageIndex: pageIndex || POLICY_TRANSACTION_HISTORY.PAGE_INDEX,
				totalPerPage: POLICY_TRANSACTION_HISTORY.MAX_RESULTS
			}
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
			const formattedTrans = returnValue.result.transactions
				.map((item) => {
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
	 * Unload Policy Transactions
	 * @returns {null} null
	 */
	_unloadPolicyTransactionHistory() {
		this.policyTransactionHistory = {};
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
	 * Prepare and navigate to Life Policy Summary
	 * @param {event} e e
	 * @returns {void} 
	 */
	_goToLifePolicySummary(e) {
		this.selectedLifePolicy = e.detail.lifePolicy;
		this.selectedInsureTabIndex = e.detail.selectedInsureTabIndex;
		this._navigateToSubView(INSURE_RENDER_MODE.LIFE_POLICY_SUMMARY);
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
			<horizon-insure-client-summary .funeralPolicies = "${this.funeralPolicies}" .lifePolicies="${this.lifePolicies}" .readOnlyMode="${this.readOnlyMode}"
				.clientClaims="${this.claims}"
				@navigate-to-claim-summary="${(e) => this._goToClaimSummary(e)}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToSMSHistory(e)}"
				@navigate-to-life-policy-summary="${(e) => this._goToLifePolicySummary(e)}">
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
			? html`<horizon-insure-policy-transaction-history 
				@navigate-back="${() => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}"
				.readOnlyMode="${this.readOnlyMode}">
			</horizon-insure-policy-transaction-history>`
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
 * Renders the Claim Summary page
 * 
 * @returns {html} html
 */
	_renderClaimSummaryPage() {
		return html`
				<horizon-insure-claim-summary
					.claimSummary="${this.claimSummary}"
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