import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { convertCentsToRand, formatCurrency, formatDate, formatPhoneNumber, formatProxyId, getMonthName } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { PayShapService } from 'app/services/PayShapService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from '@cb/platform-web-core';
import 'app/components/common/PayShapTransactionHistory';
import 'app/components/common/TransactionHistory';
import 'app/components/dialogs/quickTransactions/PayshapPOP';

const DATE_TIME_FORMAT = `dd mmm yyy hh:mm:ss`;
const DATE_ONLY = `dd mmm yyyy`;
// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - NINETY_DAYS).toISOString().substr(0, 10),
	START_AT_INDEX: 1,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

const CAPITEC_DOMAINS = [`CAPITEC`];

/**
 * This component shows the payshap landing page.
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class PayShapLanding
 * @extends {Component}
 */

export class PayShapLanding extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.payShapLandingDetails = {};
		this.institutionsList = [];
		this.moneyOutTransactionHistory = [];
		this.moneyInTransactionHistory = [];
		this.payments = [];
		this.moneyType = ``;
		this.moneyOutLoadDetails = {};

		this.filteredInstitutions = [];
		this.showUpdateModal = false;
		this.optInInsights = false;
		this.defaultInstitute = false;
		this.displayToast = false;
		this.isBusy = false;
		this.showPopModal = false;

		this.payShapService = new PayShapService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.horizonRouter = HorizonRouter.getInstance();

		this._telemetry = HorizonTelemetry.getInstance();

		this.moneyOutTransDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			payShapLandingDetails: { type: Object },
			cifNumber: { type: String },
			verifiedCellphoneNumber: { type: String },
			getInstitutions: { type: Object },
			getMoneyOutTransactionHistory: { type: Object },
			getMoneyInTransactionHistory: { type: Object },
			accountNumber: { type: String },
			moneyType: { type: String },

			moneyOutTransDetails: { state: true },
			institutionsList: { state: true },
			renderMode: { state: false },
			optInInsights: { state: true },
			defaultInstitute: { state: true },

			filteredInstitutions: { state: true },

			showUpdateModal: { state: true, attribute: false },
			displayToast: { type: Boolean },
			payShapDefaultToast: { type: String },
			isBusy: { state: true },
			showPopModal: { type: Boolean }
		};
	}

	get isCapitecBankDefault() {
		return this.payShapLandingDetails.proxyDetails.defaultProxyStatus === `True` && CAPITEC_DOMAINS.includes(this.payShapLandingDetails.proxyDetails.domain);
	}

	get defaultInstitution() {
		if (this.isCapitecBankDefault) {
			return this.payShapLandingDetails.proxyDetails.domain;
		} else if (this.payShapLandingDetails.proxyDetails.defaultProxyStatus === `False` && !CAPITEC_DOMAINS.includes(this.payShapLandingDetails.proxyDetails.domain)) {
				return this.payShapLandingDetails.proxyDetails.domain;
			}
		

		return ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.feeCategories = Utilities.groupBy(this.payShapLandingDetails.fees, `methodOfPayment`);
		
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._unloading();
		
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP, null, true, false, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_selectedTab(e) {
		const detailsTab = () => this._detailsTab();
		const transactionHistoryTab = () => this._transactionHistoryTab();
		const institutionsTab = () => this._institutionsTab();
		const payshapTab = {
			0: detailsTab, 
			1: transactionHistoryTab,
			2: institutionsTab
		};
		payshapTab[e.detail.selectedIndex]();
	}

	_back() {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_BACK);

		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_searchTextChange(event) {

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_INSTITUTIONS_TAB_SEARCH, {
			"screen": TelemetryScreen.PAY_SHAP_INSTITUTIONS,
			"Insitution-name": event.detail.searchText
		});

		this.filteredInstitutions = this.institutionsList;

		if (event.detail.new) {
			const searchText = event.detail.new.split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					return this.filteredInstitutions.filter(item => item.participantName.toLowerCase().toString().startsWith(key.toLowerCase()) ||
																	item.domains.filter(domain => domain.name.toString().toLowerCase().startsWith(key.toLowerCase())).length >= 1);
				}
				return [];
			});
			this.filteredInstitutions = Array.from(new Set([...searchTextResult.flat()]));
		}
	}

	_proofOfPayment(uetr, tranCode, verifiedCellphoneNumber) {
		this.proofOfPaymentDetails = {
			uetr: uetr,
			tranCode: tranCode,
			verifiedCellphoneNumber: verifiedCellphoneNumber
		};

		 this.showPopModal = true;
	}

	_onUpdateClick() {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP);

		this.dispatchEvent(new CustomEvent(`on-update`, {
			detail: {
				isCapitecBankDefault: this.isCapitecBankDefault,
				defaultInstitution: this.defaultInstitution,
				verifiedCellphoneNumber: this.verifiedCellphoneNumber
			}
		}));
	}

	_acceptAgreement() {
		this.agreementAccepted = !this.agreementAccepted;
	}

	_unloading() {
		this.dispatchEvent(new CustomEvent(`unloading`));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async _getMoneyOutTransactionHistory(startDate, endDate, paginationToken) {

		const moneyOutTHRequest = {
			cifNumber: this.cifNumber,
			fromDateTime: startDate || TRANSACTION_HISTORY.START_DATE,
			toDateTime: endDate || TRANSACTION_HISTORY.END_DATE,
			pageSize: `11`,
			paginationToken: paginationToken || null
		};

		const result = await this.getMoneyOutTransactionHistory(moneyOutTHRequest);
		
		const formattedTrans = result.paymentHistoryList
			.map((item) => {
				const date = new Date(Date.parse(item.processDateTime));

				item.tranDate = date;
				item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
				item.fullname = item.creditorKnownAsName;
				item.shapId = item.creditorProxyId;
				item.accountnumber = item.creditorAccountId;
				item.institution = item.creditorFicaName;
				item.formatedAmount = `-${formatCurrency(item.amount)}`;

				return item;
			});
		this.moneyOutTransactionHistory.push(...formattedTrans);
		
		return {
			moneyOutTransactionHistory: this.moneyOutTransactionHistory,
			paginationToken: result.paginationToken,
			moneyOutLoadMore: result.more
		};

	}

	async _getMoneyInTransactionHistory(startDate, endDate) {
		const moneyInTHRequest = {
			cifNumber: this.cifNumber,
			accountNumber: this.accountNumber,
			fromDateTime: startDate || TRANSACTION_HISTORY.START_DATE,
			toDateTime: endDate || TRANSACTION_HISTORY.END_DATE,
			startAtIndex: TRANSACTION_HISTORY.START_AT_INDEX,
			pageSize: `10`
		};

		const result = await this.getMoneyInTransactionHistory(moneyInTHRequest);
		
		const formattedTrans = result.transactions
			.map((item) => {
				const date = new Date(Date.parse(item.transactionDate));

				item.description = item.statementDescription;
				item.tranDate = date;
				item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
				item.formatedAmount = formatCurrency(item.amount);
				item.formatedBalance = formatCurrency(item.balance);

				return item;
			});
		this.moneyInTransactionHistory.push(...formattedTrans);

		return this.moneyInTransactionHistory;
	}

	_unloadTransactionHistory() {
		this.moneyOutTransactionHistory = [];
		this.moneyInTransactionHistory = [];
	}

	_sendPOP(event) {
		const popDetail = { ...event.detail, ...this.proofOfPaymentDetails };
		this.dispatchEvent(new CustomEvent(`send-pop`, { detail: popDetail }));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _transactionHistoryTab() {

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_TRANSACTION_HISTORY_TAB);

		this.moneyType = `Money Out`;

		this._unloadTransactionHistory();

		this.moneyOutTransDetails = await this._getMoneyOutTransactionHistory();

		this.renderMode = RENDER_MODE.PAYSHAP_TRANSACTION_HISTORY;
	}

	_detailsTab() {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_DETAILS_TAB, {
			"Shap Id": this.payShapLandingDetails.proxyDetails.proxyId,
			"Registered Cell": this.verifiedCellphoneNumber,
			"Default Institution": this.defaultInstitution,
			"Status": this.payShapLandingDetails.proxyDetails.fullProxyStatus
		});
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _institutionsTab() {

		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_INSTITUTIONS_TAB);

		this.institutionsList = await this.getInstitutions();

		this.filteredInstitutions = this.institutionsList;
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	_exitTransactionHistory() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.main-title {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					--theme-titlebar-shadow: none;
					border: none;
				}
				.main-title > capitec-icon {
					cursor: pointer;
				}
				capitec-tab {
					height: 768px;
					border-top: 1px solid #E1E1E1;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 0px;
				}
				capitec-tab > capitec-card {
					--theme-card-min-width: 1029px;
				}
				.main {
					height: var(--horizon-panel-height, 888px);
					width: 1066px;
					--theme-card-border-radius: 5px;
				}
				.details-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 6px;
					--theme-container-padding-left: 16px;
					--theme-layout-gap-spacing: 16px;
					height: 685px;
				}
				.institutions-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					height: 750px;
				}
				.transactions-tab {
					height: 750px;
				}
				.payshap-info {
					--theme-card-min-height: 80px;
					--theme-card-box-shadow: 0px 6px 10px 0.25px rgba(0, 0, 0, 0.08);
					padding: 19px 16px;
				}
				.payment-fees {
					--theme-card-min-height: 112px;
					--theme-card-background-color: #F5F5F5;
					padding: 16px;
				}
				.payment-limits {
					--theme-card-min-height: 112px;
					padding: 14px 16px 0px 16px;
				}
				.payshap-info > capitec-group {
					--theme-layout-gap-spacing: 20px;
				}
				.fee-categories {
					height: 32px;
					width: auto;
					padding: 4px 0px 4px 16px;
					background-color: #F5F5F5;
					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
					border-left: 0px;
					border-right: 0px;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}
				capitec-expander {
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					--theme-layout-gap-spacing: 8px;
					--theme-expander-indicator-width: 36px;
					--theme-expander-icon-width: 24px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-expander-header-font-color: #3A3A3A;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-left: 0px;
					--theme-expander-height: 436px;
					--theme-expander-width: 1029px;
					--theme-expander-border: 0px;
					width: auto;
				}
				.fee-limits-box {
					height: 323px;
					padding: 0px 16px;
				}
				horizon-label {
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				horizon-label[value="Active"] {
					--horizon-label-value-color: #70AF00;
				}
				horizon-label[value="Suspended"] {
					--horizon-label-value-color: #d4781c;
				}
				horizon-label[value="Inactive"] {
					--horizon-label-value-color: #a5132a;
				}
				.horizon-label-payshap-info {
					width: 234px;
				}
				.horizon-label-payshap-name {
					width: 234px;
					--horizon-label-value-color: #009DE0;
				}
				.horizon-label-payment {
					width: 200px;
    				margin-bottom: 12px;
				}
				capitec-button-bar {
					padding: 10px 16px;
				}
				capitec-label[type="subtitle"] {
					padding-bottom: 14px;
					--theme-label-subtitle-font-weight: 600;
				}
				capitec-text-field {
					height: 48px;
					width: 383px;
					--theme-input-label-font-size: 12px;
					--theme-label-font-color: #3A3A3A;
					--theme-input-label-font-size: 14px;
					--theme-layout-gap-spacing: 5px;
					--theme-input-clear-icon-height: 0px;
					--theme-input-clear-icon-width: 0px;
				}
				.institutions-title {
					--theme-titlebar-min-height: 48px;
					--theme-label-title-font-size: 14px;
					background: #E1E1E1;
				}
				.institutions-content {
					height: auto;
					padding: 16px 16px 0px 16px;
				}
				.domain-name {
					width: 145px;
					padding-bottom: 16px;
				}
				.no-result-group {
					width: 1029px;
					margin-top: 130px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.chip-color {
					background: #ffffff;
				}
				.button-class {
					background: #ffffff;
					border-radius: 15px;
				}

				.main-view {
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-layout-gap-line-color: 0px;
					height: fit-content;
				}
				capitec-table{
					width: auto;
					height: auto;
					--theme-icon-size-default: 24px;
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-font-size : 15px;
					--theme-data-table-padding-left: 16px;
					--theme-data-table-body-group-color: #3A3A3A;
					--theme-data-table-font-color: #3A3A3A;
					--theme-data-table-padding-right: 16px;
					--theme-data-table-padding-top: 11px;
					--theme-data-table-padding-bottom: 11px;
					--theme-data-table-expander-size: 12px;
					--theme-data-table-footer-border: 0px;
					--theme-data-table-expander-size: 24px;
					--theme-data-table-header-font-weight: 600;

				}

				.load-more-bar{
					--theme-actionbar-min-height: 48px;
					padding-top : 0px;
					padding-bottom: 0px; 
					--theme-actionbar-background: #f4f4f4;
				}
				.transaction-status-select{
					--theme-input-label-font-size: 16px;
					--theme-input-padding-bottom: 13px;
					--theme-select-options-max-height: 308px;
					--theme-input-font-size: 16px;
					--theme-input-label-font-color: #3A3A3A;
					--theme-input-font-weight: 400;
					--theme-input-icon-top: 8px;
					line-height: 30px;
					width: 224px;
				}

				capitec-date-time-picker{
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-date-time-picker-range-calendar-border: 0px;
					margin-right: 8px;
					width: 280px;
				}
				.transaction-action-bar > capitec-chip{
					margin: 0px 8px;
					--theme-chip-label-padding-left: 11px;
					--theme-chip-label-padding-right: 11px;
					--theme-chip-label-line-height: 19px;
				}
				.type-normal{
					--theme-chip-label-color: #3A3A3A;
					--theme-chip-background-color: #FFFFFF;
				}
				.type-selected{
					--theme-chip-label-color: #FFFFFF;
					--theme-chip-background-color: #009DE0;
					--theme-chip-font-weight: 600;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.no-result-group {
					width: 1062px;
					margin-top: 130px;
				}
				capitec-image {
					cursor: pointer;
				}
				.fee-limits-box > capitec-label {
					padding-bottom: 4px;
				}
				capitec-toast {
					position: absolute;
					top : 70px;
					left: 790px;
					height: 64px;
					width: 428px;
					border-radius: 4px;
					color: #70AF00;
					z-index: 99999;
					left: calc(50.8% - 200px);
					justify-content: center;
					align-items: center;
				}
				.warning-modal{
					--theme-modal-free-max-width: 500px;
					--theme-modal-free-max-height: 400px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
				}
				.warning-header {
					width: 341px;
					height: auto;
					position: absolute;
					display: flex;
					align-items: center;
					left: -464px;
					top: -11px;
					--theme-modal-header-height: 64px;
				}
				.warning-label {
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
				}
				.warning-modal > div[slot="body"] {
					height: 268px;
					width: 500px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderToast()}
			${this._renderContent()}
		`;
	}

	_renderToast() {
		return this.displayToast
		? html`
			<capitec-toast
				type="${this.payShapDefaultToast}"
				header="${this.payShapDefaultToast === `success` ? `Success` : `Failure`}"
				detail="${this.payShapDefaultToast === `success` ? `Payshap details updated` : `Payshap details not updated`}"
				closable>
			</capitec-toast>`
		: html``;
	}

	_renderContent() {
		return html`
			<capitec-card class="main">
				${this._renderTitleBar()}
				<capitec-content-box noPadding>
					${this._renderPayShapContent()}
					${this._renderPayShapPOP()}
				</capitec-content-box>
			</capitec-card>`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="main-title">
				<capitec-icon
					data-automation-id="payshap-landing-back"
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="PayShap" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderPayShapContent() {
		return html`
			<capitec-tab-group @tab-select="${(e) => this._selectedTab(e)}">
				<capitec-tab label="Details" layout="vertical" halign="left">
					<capitec-content-box class="details-tab">
						${this._renderPayShapDetails()}
					</capitec-content-box>
					${this._renderPayShapDetailsFooter()}
				</capitec-tab>
				<capitec-tab label="Transaction History" layout="vertical" halign="left">
					<capitec-content-box class="transactions-tab">
						${this._renderPayShapTransactionHistory()}
					</capitec-content-box>
				</capitec-tab>
				<capitec-tab label="PayShap Institutions" layout="vertical" halign="left">
					<capitec-content-box class="institutions-tab">
						${this._renderPayShapInstitutions()}
					</capitec-content-box>
				</capitec-tab>
			</capitec-tab-group>
		`;
	}

	_renderPayShapTransactionHistory() {
		return this.renderMode === RENDER_MODE.PAYSHAP_TRANSACTION_HISTORY
		? html`
			<horizon-payshap-transaction-history
				.moneyType="${this.moneyType}"

				.moneyOutTransDetails="${this.moneyOutTransDetails}"

				.moneyOutTransactionHistory="${this.moneyOutTransactionHistory}"
				.renderMoneyOutTableColumns="${() => this._renderMoneyOutTransactionHistoryColumns()}"
				.renderMoneyOutTransactionDetails="${(item) => this._renderMoneyOutTransactionDetails(item)}"
				.getMoneyOutTransactionHistory="${(startDate, endDate, paginationToken) => this._getMoneyOutTransactionHistory(startDate, endDate, paginationToken)}"

				.moneyInTransactionHistory="${this.moneyInTransactionHistory}"
				.renderMoneyInTableColumns="${() => this._renderMoneyInTransactionHistoryColumns()}"
				.renderMoneyInTransactionDetails="${(item) => this._renderMoneyInTransactionDetails(item)}"
				.getMoneyInTransactionHistory="${() => this._getMoneyInTransactionHistory()}"

				.disposeData="${() => this._unloadTransactionHistory()}"
				@back="${() => this._exitTransactionHistory()}"
				@unloading="${() => this._unloadTransactionHistory()}">
			</horizon-payshap-transaction-history>
		`
		: html``;
	}

	_renderMoneyOutTransactionHistoryColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="processDateTime"
				.renderer="${(item, fieldName, value) => this._renderTransactionDateTime(value)}"
				size="140px;">
			</capitec-table-column>
			<capitec-table-column
				label="Full Name"
				field="creditorKnownAsName"
				size="230px;">
			</capitec-table-column>
			<capitec-table-column
				label="Shap ID"
				field="creditorProxyId"
				size="110px;">
			</capitec-table-column>
			<capitec-table-column
				label="Account number"
				field="creditorAccountId"
				size="115px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				size="90px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderTransactionDateTime(value) {
		return html`
			<capitec-label
				label="${formatDate(value, DATE_TIME_FORMAT)}">
			</capitec-label>`;
	}

	_renderMoneyOutTransactionDetails(item) {
		return html`
			<capitec-group class="main-view">
				<capitec-label
					style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
					label="Transaction Details">
				</capitec-label>

				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Transaction type" 
						value="Rapid Payment (${item.methodOfPayment})">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Status"
						value="${item.statusCode}">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Transaction code"
						value="${item.tranCode}">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Posting date"
						value="${formatDate(item.insertedDateTime, DATE_ONLY)}">
					</horizon-label>
				</capitec-group>

				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Payment reference"
						value="${item.debtorReference}">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Creditor"
						value="${item.creditorFicaName}">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Payment domain"
						value="${item.creditorAgentCreditorDomain}">
					</horizon-label>
				</capitec-group>

				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Creditor PayShap ID"
						value="${item.shapId}">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
						label="Fee" 
						value="${formatCurrency(item.feeAmount)}">
					</horizon-label>
				</capitec-group>
				<!-- Hiding "Escalate Transaction" and "Proof of Payment" buttons as we dont have functionality built on it yet
			Need to remove hidden attribute when development starts on these functionalities -->
			<capitec-button-bar align="right">
					<capitec-button ?hidden=${true}
								type="clear" 
								label="Escalate Transaction">
					</capitec-button>
					<capitec-button
								type="clear" 
								label="Proof of Payment"
								@click="${() => this._proofOfPayment(item.uetr, item.tranCode, this.verifiedCellphoneNumber)}">
					</capitec-button>
				</capitec-button-bar>
			</capitec-group>
		`; 
	}

	_renderMoneyInTransactionHistoryColumns() {
		return html`
			<capitec-table-column
				label="Transaction Date"
				field="transactionDate"
				.renderer="${(item, fieldName, value) => this._renderTransactionDateTime(value)}"
				size="156px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="410px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="formatedAmount"
				size="158px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Balance"
				field="formatedBalance"
				size="130px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderMoneyInTransactionDetails(item) {
		return html`
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: ${item.statementDescription}"
				data-automation-id="transaction-history-item-description">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transTypeDesc ? item.transTypeDesc : `-`}"
					data-automation-id="transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transfer account"
					value = "${item.transferAccount ? item.transferAccount : `-`}"
					data-automation-id="transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "${formatDate(item.postingDate, DATE_ONLY)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "${formatDate(item.processDate, DATE_ONLY)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "${item.transactionCode ? item.transactionCode : `-`}"
					data-automation-id="transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "${item.cardNumber ? item.cardNumber : `-`}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "${item.cardAuthType ? item.cardAuthType : `-`}"
					data-automation-id="transaction-history-item-card-auth-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "${item.journalNumber ? item.journalNumber : `-`}"
					data-automation-id="transaction-history-item-journal-number">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "${item.includesVat ? `Yes` : `No`}"
					data-automation-id="transaction-history-item-includes-vat">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "${item.externalTerminalId ? item.externalTerminalId : `-`}"
					data-automation-id="transaction-history-item-terminalID">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "${item.cashback ? item.cashback : `-`}"
					data-automation-id="transaction-history-item-cashback">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "${item.branch ? item.branch : `-`}"
					data-automation-id="transaction-history-item-branch">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "${item.teller ? item.teller : `-`}"
					data-automation-id="transaction-history-item-teller">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderPayShapDetails() {
		return html`
			${this._renderInfo()}
			${this._renderPaymentFees()}
			${this._renderPaymentLimits()}
		`;
	}

	_renderInfo() {
		return html`
			<capitec-card class="payshap-info">
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payshap-name"
							label="Shap ID/Name"
							value="${this._renderProxyName()}">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Verified Cell Number"
							value="${formatPhoneNumber(this.verifiedCellphoneNumber)}">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Main Bank"
							value="${this.defaultInstitution || `None Set`}">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Status"
							value="${this.payShapLandingDetails.proxyDetails.fullProxyStatus}">
					</horizon-label>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderProxyName() {
		const shapID = this.payShapLandingDetails.proxyDetails.proxyId.split(`@`);
		const capitecShapID = `${shapID[0]}@CAPITEC`;
		return formatProxyId(capitecShapID);
	}

	_renderPaymentFees() {
		return html`
		<capitec-expander icon="system/cash-action" label="Payment fees">
			<capitec-label
				class="fee-categories"
				type="subtitle"
				label="Fee Categories">
			</capitec-label>
			<capitec-content-box class="fee-limits-box" halign="left" valign="top" gap="none">
				${this._renderFeeCategories()}
			</capitec-content-box>
			
		</capitec-expander>
		`;
	}

	_renderFeeCategories() {
		return Object.keys(this.feeCategories).map(category => html`
			<capitec-label type="subtitle" label="${category}"></capitec-label>
			<capitec-group layout="horizontal" wrap>
				${this._renderFeeDetails(this.feeCategories[category])}
			</capitec-group>
		`);
	}

	_renderFeeDetails(limits) {
		return limits.map(item => html`
			<horizon-label class="horizon-label-payment"
					label="${formatCurrency(convertCentsToRand(item.lowerBound))} - ${formatCurrency(convertCentsToRand(item.upperBound))}"
					value="${formatCurrency(convertCentsToRand(item.amount))}">
			</horizon-label>
		`);
	}

	_renderPaymentLimits() {
		return html`
			<capitec-card class="payment-limits">
				<capitec-label type="subtitle" label="Payment Limits"></capitec-label>
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payment"
							label="Daily Limit"
							value="${formatCurrency(convertCentsToRand(this.payShapLandingDetails.limits.dailyLimit))}">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="Transaction limit"
							value="${formatCurrency(convertCentsToRand(this.payShapLandingDetails.limits.transactionLimit))}">
					</horizon-label>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderPayShapDetailsFooter() {
		return html`
			<!-- Hiding Report Fraud button as we dont have functionality on it yet -->
			<capitec-button-bar align="right">
				<capitec-button 
						label="Report Fraud"
						?hidden=${true}>
				</capitec-button>

				<capitec-button 
						type="primary"
						label="Update"
						@click="${() => this._onUpdateClick()}">
				</capitec-button>
			</capitec-button-bar>
		`;
	}

	_renderPayShapPOP() {
		return this.showPopModal
		? html`
		<horizon-pay-shap-pop
						@on-cancel="${() => this.showPopModal = false}"
						@on-send="${(e) => this._sendPOP(e)}">
		</horizon-pay-shap-pop>`
		: html``;
	}

	_renderPayShapInstitutions() {
		return html`
			${this._renderSearchBar()}
			${this._renderInstitutions()}
		`;
	}

	_renderSearchBar() {
		return html`
			<capitec-text-field
					id="text-filter"
					label="Search for institution or registered domain"
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}">
			</capitec-text-field>
		`;
	}

	_renderInstitutions() {
		return this.filteredInstitutions.length > 0
		? html`${this._renderInsitutionsList()}`
		: html`${this._renderNoResults()}`;
	}

	_renderInsitutionsList() {
		return this.filteredInstitutions.map((item) => html`
			<capitec-card>
				<capitec-title-bar label="${item.participantName}" class="institutions-title"></capitec-title-bar>
				<capitec-group 
						class="institutions-content"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="top"
						wrap>
							${this._renderDomainList(item.domains)}
				</capitec-group>
			</capitec-card>
		`);
	}

	_renderDomainList(item) {
		const domains = item;
		return domains.map((domain) => html`
			<capitec-label class="domain-name" label="${domain.name}"></capitec-label>
		`);
	}

	_renderNoResults() {
		return html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"
						class="document-icon"/>
					<capitec-label
						class="no-results"
						label="No results found"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="view-base-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

}

customElements.define(`horizon-payshap-landing`, PayShapLanding);