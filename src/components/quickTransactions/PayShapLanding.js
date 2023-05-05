import { Component, css, html, unsafeCSS } from 'platform/elements';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL } from 'app/css/TransactionHistory';
import { INSTITUTIONS_LIST } from 'app/constants/PayShap';

const paymentHistoryList = {
      "processDateTime": `yyyy-MM-ddTHH:mm:ss.sss+/-hh:mm`,
      "methodOfPayment": `PBPX`,
      "tranCode": `string`,
      "statusCode": `FailedToProcess`,
      "amount": 3000,
      "currency": `string`,
      "debtorAccountId": `string`,
      "debtorReference": `string`,
      "creditorAccountId": `GM524sBa`,
      "creditorAgentBICFI": `string`,
      "creditorAgentMemberIdentification": `string`,
      "creditorAgentCreditorDomain": `string`,
      "creditorProxyType": `MBNO`,
      "creditorKnownAsName": `string`,
      "creditorFicaName": `string`,
      "creditorProxyId": `string`,
      "creditorReference": `string`,
      "feeAmount": 3000,
      "notificationType": `NONE`,
      "notificationAddress": `string`,
      "hideDetails": true,
      "insertedDateTime": `yyyy-MM-ddTHH:mm:ss.sss+/-hh:mm`
    };


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

		this.institutionsList = [];

		this.MoneyInrecords = [{ transactionDate: `28 Apr 2023`, description: `SMS Notification Fee: 2 Notification(s)`, amount: `R200.60`, balance: `R373.75` }];

		this.MoneyOutrecords = [{ transactionDate: `07 Aug 2022`, fullname: `Brandon George`, shapId: `(+27) 716 546 7890`, accountnumber: `N/A`, institution: `ABSA Bank`, amount: `-R547.00` }];
		this.moneyfilter = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			institutionsList: { state: true },
			moneyfilter: { state: true }
			
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.institutionsList = INSTITUTIONS_LIST;
		this.moneyInfilter = true;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_searchTextChange(event) {
		this.institutionsList = INSTITUTIONS_LIST;
		if (event.detail.new) {
			const searchText = event.detail.new.split(` `);

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					// TODO: Add Logic to filter by domain names while integrating with CS.
					return this.institutionsList.filter(item => item.institutionName.toLowerCase().toString().startsWith(key.toLowerCase()));
				}
				return [];
			});
			this.institutionsList = Array.from(new Set([...searchTextResult.flat()]));
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	getPredefinedDateRanges() {

		const today = new Date();
		const last30day = new Date(today);
		const last60day = new Date(today);
		const last90day = new Date(today);
	
		last30day.setDate(today.getDate() - 30);
		last60day.setDate(today.getDate() - 60);
		last90day.setDate(today.getDate() - 90);
	
		return [
			{ text: `Last 30 Days`, value: { startDate: last30day, endDate: today } },
			{ text: `Last 60 Days`, value: { startDate: last60day, endDate: today } },
			{ text: `Last 90 Days`, value: { startDate: last90day, endDate: today } }
		];
	
		}
	// ---------------
	// PRIVATE METHODS
	// ---------------

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
					width: var(--horizon-center-panel-width, 1064px);
					--theme-card-border-radius: 5px;
					--theme-card-box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
				}
				.details-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 6px;
					--theme-container-padding-left: 16px;
					height: 688px;
				}
				.institutions-tab {
					--theme-container-padding-top: 16px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 16px;
					height: 750px;
				}
				.payshap-info {
					--theme-card-min-height: 80px;
					padding: 22px 16px;
				}
				.payment-fees {
					--theme-card-min-height: 112px;
					padding: 16px;
				}
				.payment-limits {
					--theme-card-min-height: 112px;
					padding: 16px;
				}
				.payshap-info > capitec-group {
					--theme-layout-gap-spacing: 20px;
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
				.horizon-label-payshap-info {
					width: 234px;
				}
				.horizon-label-payshap-name {
					width: 234px;
					--horizon-label-value-color: #009DE0;
				}
				.horizon-label-payment {
					width: 200px;
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
					height: 661px;
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
				horizon-column-class{
					width: 260px;
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
				capitec-spacer {
					width: 70px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="main">
				${this._renderTitleBar()}
				<capitec-content-box noPadding>
					${this._renderPayShapContent()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar class="main-title">
				<capitec-icon
					data-automation-id="payshap-landing-back"
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="PayShap" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderPayShapContent() {
		return html`
			<capitec-tab-group>
				<capitec-tab label="Details" layout="vertical" halign="left">
					<capitec-content-box class="details-tab">
						${this._renderPayShapDetails()}
					</capitec-content-box>
					${this._renderPayShapDetailsFooter()}
				</capitec-tab>
				<capitec-tab label="Transaction History" layout="vertical" halign="left">
					<capitec-content-box class="institutions-tab">
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
		return html`
			<capitec-group layout="horizontal">
			${this._renderTransactionHistorySearchBar()}
			${this._renderSelectOption()}
			${this._renderMoneyIn()}
			${this._renderMoneyOut()}
		</capitec-group>
		<capitec-content-box class="main-view">
			${this._renderMoneyType()}
	</capitec-content-box>
		`;
	}

_renderMoneyType() {
	return this.moneyfilter
	? html`
	${this._renderTransHistoryColumnsMoneyOut()} 
	`
	: html` ${this._renderTransHistoryColumnsMoneyIn()}`;
}

	_renderTransHistoryColumnsMoneyIn() {
		return html`
		<capitec-table class="main-view" .items="${this.MoneyInrecords}" expandable="right" .expandRenderer="${(item) => this._renderTransactionDetailsMoneyIn(item)}">
			<capitec-table-column
				label="Transaction Date"
				field="transactionDate"
				size="156px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="410px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount (R)"
				field="amount"
				size="158px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Balance"
				field="balance"
				size="130px;"
				type="currency"
				align="right">
			</capitec-table-column>
			<capitec-table>
		`;
	}

	_renderTransactionDetailsMoneyIn(item) {
		return html`
			<capitec-group class="main-view">
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Statement description: SMS Notification Fee: 2 Notification(s)">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date" 
					value = "28 Apr 2023">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Processed date"
					value = "28 Apr 2023">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card number"
					value = "-">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Card authentication type"
					value = "UNKNOWN">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Journal number"
					value = "971599">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Includes Vat"
					value = "No">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="External terminal ID"
					value = "-">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "9402">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Cash back"
					value = "-">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Branch" 
					value = "997">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Teller"
					value = "9991">
				</horizon-label>
			</capitec-group>
	</capitec-group>
		`;
	}

	
	_renderTransHistoryColumnsMoneyOut() {
		return html`
		<capitec-table class="main-view" .items="${this.MoneyOutrecords}" expandable="right" .expandRenderer="${(item) => this._renderTransactionDetailsMoneyOut(item)}">
			<capitec-table-column
				label="Transaction Date"
				field="transactionDate"
				size="156px;">
			</capitec-table-column>
			<capitec-table-column
				label="Full Name"
				field="fullname"
				size="300px;">
			</capitec-table-column>
			<capitec-table-column
				label="Shap ID"
				field="shapId"
				size="158px;">
			</capitec-table-column>
			<capitec-table-column
				label="Account number"
				field="accountnumber"
				size="150px;">
			</capitec-table-column>
			<capitec-table-column
				label="Institution"
				field="institution"
				size="300px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount"
				field="amount"
				size="130px;"
				type="currency"
				align ="right">
			</capitec-table-column>
			<capitec-table>
		`;
	}

	_renderTransactionDetailsMoneyOut(item) {
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
					value = "Rapid Payment">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Status"
					value = "Successful">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction code"
					value = "444554465765798">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date"
					value = "07 Aug 2022, 14:40">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Payment reference"
					value = "Melissa's Gift">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Creditor"
					value = "Christine Marrah">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Payment domain"
					value = "RD2.Bot-Absa">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Institution"
					value = "ABSA">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Creditor PayShap ID"
					value = "6373**** ****1930">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Fee" 
					value = "R5.00">
				</horizon-label>
			</capitec-group>
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
							value="0764575577@capitecbank">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Registered Cell Number"
							value="0764575577">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Default Institution"
							value="None Assigned">
					</horizon-label>
					<horizon-label class="horizon-label-payshap-info"
							label="Status"
							value="Active">
					</horizon-label>
			</capitec-card>
		`;
	}

	_renderPaymentFees() {
		return html`
			<capitec-card class="payment-fees">
				<capitec-label type="subtitle" label="Payshap Payment Fees"></capitec-label>
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payment"
							label="R0 - R100.00"
							value="R1.00">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="R100.01 - R1 000.00"
							value="R2.50">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="R1 000.01 - R3 000.00"
							value="R5.00">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="R3000.01 - R100 000.00"
							value="R7.50">
					</horizon-label>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderPaymentLimits() {
		return html`
			<capitec-card class="payment-limits">
				<capitec-label type="subtitle" label="Payment Limits"></capitec-label>
				<capitec-group layout="horizontal">
					<horizon-label class="horizon-label-payment"
							label="Daily Limit"
							value="R5 000.00">
					</horizon-label>
					<horizon-label class="horizon-label-payment"
							label="Transaction limit"
							value="R3 000.00">
					</horizon-label>
				</capitec-group>
			</capitec-card>
		`;
	}

	_renderPayShapDetailsFooter() {
		return html`
			<capitec-button-bar align="right">
				<capitec-button label="Report Fraud"></capitec-button>
				<capitec-button type="primary" label="Update"></capitec-button>
			</capitec-button-bar>
		`;
	}

	_renderTransactionHistorySearchBar() {
		return html`
			<capitec-text-field
					id="text-filter"
					label="Search for amount or transaction name"
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchText(e)}"
					@value-change="${(e) => this._searchText(e)}">
			</capitec-text-field>
		`;
	}

	_renderSelectOption() {
		return html`

		<capitec-date-time-picker
			type="range"
			mode="date"
			inputType="calendar"
			outputType="string"
			.predefinedRanges="${this.getPredefinedDateRanges()}">
		</capitec-date-time-picker>
			`;
	}

	_renderMoneyIn() {
		return html`
		<capitec-chip
		 label="Money In" 
		 @click="${this._moneyFilter(`IN`)}">
		</capitec-chip>
		`;
	}

	_renderMoneyOut() {
		return html`
		<capitec-chip 
		 label="Money Out"
		 @click="${this._moneyFilter(`OUT`)}"></capitec-chip>
		`;
	}

	_moneyFilter(inOrOut) {

		console.log(`here`);
		if (inOrOut === `IN`) {
			this.moneyInfilter = !this.moneyInfilter;
		} 
		if (inOrOut === `OUT`) {
			this.moneyInfilter = false;
		}
	};

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
		return this.institutionsList.length > 0
		? html`${this._renderInsitutionsList()}`
		: html`${this._renderNoResults()}`;
	}

	_renderInsitutionsList() {
		return this.institutionsList.map((item) => html`
			<capitec-card>
				<capitec-title-bar label="${item.institutionName}" class="institutions-title"></capitec-title-bar>
				<capitec-group 
						class="institutions-content"
						layout="horizontal"
						gap="clear"
						halign="left"
						valign="top"
						wrap>
							${this._renderDomainList(item.institutionDomains)}
				</capitec-group>
			</capitec-card>
		`);
	}

	_renderDomainList(item) {
		const domains = item;
		return domains.map((domain) => html`
			<capitec-label class="domain-name" label="${domain}"></capitec-label>
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
}

customElements.define(`horizon-payshap-landing`, PayShapLanding);