/* eslint-disable sort-imports */
import { css, html } from 'platform/elements';

import { InsureService } from 'app/services/InsureService';
import { InsureViewBase } from 'app/views/insure/InsureViewBase';
import { INSURE_RENDER_MODE } from 'app/views/insure/InsureRenderModes';
import { MAX_RESULTS } from 'app/constants/InsureTransactionHistory';

import 'app/components/insure/ClientPolicies';
import 'app/components/insure/PolicySummary';
import 'app/components/insure/PolicyTransactionHistory';
// import 'app/components/insure/SMSHistory';

import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { TRANSACTION_STATUS } from 'app/constants/InsureCommon';

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const POLICY_TRANSACTION_HISTORY = {
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	PAGE_INDEX: 0,
	MAX_RESULTS: MAX_RESULTS
};

/**
 * Implements the view for Insure unverified existing clients (i.e. the client has products)
 * This includes the view for third parties phoning in about an existing client.
 *
 * 
 * @export
 * @class InsureUnverifiedView
 * @extends {View}
 */
export class InsureUnverifiedView extends InsureViewBase {

// #region INITIALISATION

constructor() {
	super();
	this.renderMode = INSURE_RENDER_MODE.CLIENT_POLICIES;
	this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));

	this.policySummary = {};
	this.policyTransactionHistory = {};
	this.policyDetails = {};
	this.contractReference = ``;

	this.readOnlyMode = true;
}

/**
 * @property {Object} clientPolicies Data & flags for all policies relating to client CIF
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
		clientPolicies: { type: Object, state: true },
		policySummary: { type: Object, state: true },
		policyDetails: { type: Object, state: true },
		contractReference: { type: String, state: true },
		readOnlyMode: { type: Boolean, state: true },
		renderMode: { type: Number, state: true }
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
		this.clientPolicies = await this._retrieveClientPolicies(this.callerInformation.cifNumber, this.callerInformation.southAfricanIDNumber);
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Retrieve client policies via insure channel service
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
	 * @returns {Object} Client policies 
	 */
	async _retrieveClientPolicies(cifNumber, idNumber) {
		const request = {
			cifNumber: cifNumber,
			idNumber: idNumber
		};

		const resp = await this.insureService.clientPolicies(request);

		if (!resp.succeeded) {
			return;
		}

		return resp.result;
	}

	/**
	 * Retrieve Policy Summary via insure channel service
	 * @param {*} contractReference contractReference
	 * @param {*} cifNumber cifNumber
	 * @param {*} idNumber idNumber
	 * @returns {Object} Policy Summary Details 
	 */
		 async _retrievePolicySummary(contractReference, cifNumber, idNumber) {
			const request = {
				contractReference: contractReference,
				cifNumber: cifNumber,
				idNumber: idNumber
			};
			const resp = await this.insureService.insurePolicySummary(request);
			
			if (!resp.succeeded) {
				return;
			}
	
			return resp.result;
		}

		/**
	 * retrieve the communication history for the specific policy
	 * Map metadata (coverDetails) back when response is received
	 * @param {*} startDate startDate
	 * @param {*} endDate endDate
	 * @returns {Object} Communication history response
	 */
		 async _retrieveCommsHistory(startDate, endDate) {
		
			// let commsHistoryDetails = {};
			// commsHistoryDetails.cifNumber = this.callerInformation.cifNumber;
			// commsHistoryDetails.filters = [];
			// commsHistoryDetails.filters.contractReference = "";
			// commsHistoryDetails.filters.contactNumber = this.callerInformation.verifiedTelephoneNumber;
			// commsHistoryDetails.filters.medium = "SMS";
			// commsHistoryDetails.fromDate = fromDate || this.COMMUNICATION_HISTORY.START_DATE;
			// commsHistoryDetails.toDate = startDate || this.COMMUNICATION_HISTORY.END_DATE;
			// commsHistoryDetails.pagniation = [];
			// commsHistoryDetails.pagniation.pageIndex = this.COMMUNICATION_HISTORY.PAGE_INDEX;
			// commsHistoryDetails.pagniation.totalPerPage = this.COMMUNICATION_HISTORY.MAX_RESULTS;
	
			const resp = await this.insureService.commsHistory({}, () => true);
			if (resp.succeeded === true && resp.result !== null) {
				
				
				return resp.result;
				
			} 
				// Do error message
				return null;
			
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
		await this._getPolicyTransactionHistory();
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY);
	}

	async _goToPolicySummary(e) {
		// Telemetry Here
		this.policyDetails = await this._retrievePolicySummary(
			e.detail.policyContractReference, 
			this.callerInformation.cifNumber, 
			this.callerInformation.southAfricanIDNumber
		);
		this._navigateToSubView(INSURE_RENDER_MODE.POLICY_SUMMARY);
	}

	// _goToSMSHistory(e){

	// this.policyNumber = e.detail.policyNumber;
	
	// //call fips here

	// // Telemetry Here

	// this._navigateToSubView(INSURE_RENDER_MODE.SMS_HISTORY);
	// }

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
			contractReference: this.contractReference
		};

		const returnValue = await this.insureService.getPolicyTransactions(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
									.map((item) => {
										const formatedPremiumDate = new Date(Date.parse(item.premiumDueDate));
										const formatedDate = new Date(Date.parse(item.Date));
										item.formatedPremiumDate = formatedPremiumDate;
										item.formatedDate = formatedDate;
										item.formatedPremium = formatCurrency(item.premium);
										item.groupByPremiumDate = `${getMonthName(formatedPremiumDate.getMonth())} ${formatedPremiumDate.getFullYear()}`;
										item.groupByDate = `${getMonthName(formatedDate.getMonth())} ${formatedDate.getFullYear()}`;
										item.formatedAmount = formatCurrency(item.amount);
										return item;
									});
			this.transactions.push(...formattedTrans);

			this.policyTransactionHistory.transactions = this.transactions;

			this.endCallContext = `PolicyTransactionHistory`;
			this.renderMode = INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY;
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
	_undoClientPolicies() {
		this.clientPolicies.summaryDetails.policies = this.clientPolicies?.summaryDetails?.policies?.forEach(item => { 
			item.isExpanded = false; 
		});
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
			case INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY:
				return html`${this._renderPolicyTransactionHistoryPage()}`;
			case INSURE_RENDER_MODE.POLICY_SUMMARY:
				return html`${this._renderPolicySummaryPage()}`;
			// case INSURE_RENDER_MODE.SMS_HISTORY:
			// return html`${this._renderSMSHistory()}`
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
			<horizon-insure-client-policies .clientPolicies = "${this.clientPolicies}" .readOnlyMode="${this.readOnlyMode}"
				@navigate-to-policy-summary="${(e) => this._goToPolicySummary(e)}"
				@navigate-to-policy-transaction-history="${(e) => this._goToPolicyTransactionHistory(e)}"
				@navigate-to-sms-history="${(e) => this._goToSMSHistory(e)}">
			</horizon-insure-client-policies>`;
	}

	/**
	 * Render Policy Details Plan
	 * @return {html} Html of the sub view
	 */
	 _renderPolicySummaryPage() {
		return html`
			<horizon-insure-policy-summary 
				.policyDetails = "${this.policyDetails}"
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				@unloading="${() => this._undoClientPolicies()}"
				.readOnlyMode="${this.readOnlyMode}">
			</horizon-insure-policy-summary>`;
	}

	/**
	 * Render Policy Transaction History Page
	 * @returns {html} Html of the sub view 
	 */
	 _renderPolicyTransactionHistoryPage() {
		return this.renderMode === INSURE_RENDER_MODE.POLICY_TRANSACTION_HISTORY
			? html`<horizon-insure-policy-transaction-history 
				@navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
				.policyTransactionHistory="${this.policyTransactionHistory}"
				.getPolicyTransactionHistory="${(startDate, endDate, pageIndex) => this._getPolicyTransactionHistory(startDate, endDate, pageIndex)}"
				.disposeData="${() => this.policyTransactionHistory = []}"
				@unloading="${() => this._unloadPolicyTransactionHistory()}"
				.readOnlyMode="${this.readOnlyMode}">
			</horizon-insure-policy-transaction-history>`
			: html``;
	}

	// _renderSMSHistory(){
	// return html`
	// <horizon-insure-sms-history-page @navigate-back="${(e) => this._navigateToSubView(INSURE_RENDER_MODE.CLIENT_POLICIES)}"
	// .contractReference = ${this.policyNumber} .contactNumber = ${this.callerInformation.verifiedTelephoneNumber}
	// .commsHistory = "${this.commsHistory}"
	// .getCommsHistory="${(startDate, endDate) => this._retrieveCommsHistory(startDate, endDate)}"
	// .readOnlyMode="${this.readOnlyMode}">
	// </horizon-insure-sms-history-page>

	// `
	// }


	// #endregion RENDERING

	
}
customElements.define(`horizon-insure-unverified-client`, InsureUnverifiedView);