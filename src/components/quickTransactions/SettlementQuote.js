import { CREDIT_TYPE, CREDIT_TYPE_LIST, DEFAULTS, PRODUCTS } from 'app/constants/Credit';
import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';

import 'app/components/common/HorizonPDFViewer';
import 'app/components/common/OptionButton';
import 'app/components/common/StepperModal';
import 'app/components/common/HorizonProductTile'; 
import 'app/dialogs/credit/SettlementQuote'; 

/**
 * This component implements the Settlement quote for Quick Transactions
 *
 * Events Raised 
 * -------------
 * back
 * 
 * @export
 * @class SettlementQuote
 * @extends {Component}
 */

export class SettlementQuote extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.settlementQuoteDetails = [];
		this.selectedAccounts = [];
		this.filteredData = [];
		this.activeProducts = [];
		this.listValue = `Credit type`;
		this.selectedLabel = `Select all`;
		this.showNoAccountsFound = false;

		this._telemetry = HorizonTelemetry.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @readonly
	 * @static
	 * @memberof SettlementQuote
	 */

	static get properties() {
		return {
			settlementQuoteDetails: { type: Array },

			isBusy: { attribute: false },
			filteredData: { type: Array },
			activeProducts: { type: Array },
			listValue: { type: String },
			selectedLabel: { type: String }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		await this._telemetry.startSpan(QuickTransactionEvents.SETTLEMENT_QUOTE, {});
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_filter(e) {
		[this.listValue] = e.detail.new.split(` `);
		this._search(e);
		this._focusOutFilter(null, e.detail.new);
	}

	async _back() {
		await this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_BACK, {});
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_showSendDialog () {
		this.selectedAccounts = this.settlementQuoteDetails.filter(item => item.selected);
		this.dispatchEvent(new CustomEvent(`send-quote`, {
			detail: {
				selectedAccounts: this.selectedAccounts
			}
		}));
	}

	_checkBox(e, accountDetails) {
		accountDetails.selected = e.detail.new;

		const accountsSelected = this._numberOfAccountsSelected();

		if (accountsSelected === 0) {
			this.selectedLabel = `Select all`;
		} else if (accountsSelected === 1) {
			this.selectedLabel = `1 account selected`;
		} else {
			this.selectedLabel = `${accountsSelected} accounts selected`;
		}
	}

	async _selectAll() {
		if (this.filteredData.every(item => item.selected)) {
			this._deselect();
		} else {
			await this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_SELECT_ALL, {});

			this.filteredData.forEach(item => item.selected = true);
			this.selectedLabel = `${this._numberOfAccountsSelected()} accounts selected`;
		}
	}

	async _deselect() {
		await this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_DESELECT_ALL, {});

		this.selectedLabel = `Select all`;
		this.filteredData.forEach(item => item.selected = false);
	}

	_focusOutFilter(searchByText = null, searchByType = null) {
		if (searchByText || searchByType) {
			this._telemetry.logEvent(QuickTransactionEvents.SETTLEMENT_QUOTE_FILTER, {
				"search-by-text": searchByText,
				"credit-type": searchByType
			});
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		this.activeProducts = this.settlementQuoteDetails;
		if (this.activeProducts.length > 0) {
			this.settlementQuoteDetails = this.settlementQuoteDetails.map(item => {
				item.selected = false;
				return item;
			});
	
			this.filteredData = this.settlementQuoteDetails;
		} else {
			this.showNoActiveAccounts = true;
			this.showNoAccountsFound = true;
			this.noAccountsMessage = `You have no active Credit products`;
		}
	}

	_search (e) {
		const text = e.detail.new;
		this.filteredData = this.settlementQuoteDetails;

		if (text === `All`) {
			return;
		}

		if (this.listValue !== `Credit type` && this.listValue !== `All`) {
			this.filteredData = this.filteredData.filter(item => item.category.toLowerCase().indexOf(this.listValue.toLowerCase()) !== -1);
		}

		if (text) {
			const searchText = text.split(` `);
			const searchResult = searchText.map(key => {
				if (key !== ``) {
					return this.filteredData.filter(item => item.productTypeDescription.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															item.category.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															parseFloat(this._deformatCurrency(item.currentBalance)).toFixed(2).startsWith(key) ||
															parseFloat(this._deformatCurrency(item.creditLimit)).toFixed(2).startsWith(key) ||
															parseFloat(this._deformatCurrency(item.repayAmount || item.nextRepayment)).toFixed(2).startsWith(key) ||
															item.accountNumber.startsWith(key));
				}
				return [];
			});
			this.filteredData = Array.from(new Set([...searchResult.flat()]));
		}
		
		if (this.filteredData.length < 1) {
			this.showNoAccountsFound = true;
			this.showNoActiveAccounts = false;
			this.noAccountsMessage = `No Results found`;
		}
	}
	
	// Removing currency formating for better search results
	_deformatCurrency(value) {
		const amount = value.split(`R`)[1].replaceAll(` `, ``);
		return amount;
	}

	_isAnyAccountSelected() {
		return this.settlementQuoteDetails.filter(item => item.selected).length > 0;
	}

	_numberOfAccountsSelected() {
		return this.settlementQuoteDetails.filter(item => item.selected).length;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${ALERTBANNER_CSS}
				capitec-card {
					width:100%;
					height:var(--horizon-panel-height);
				}

				/* Title bar style */
				capitec-title-bar {
					border-bottom: 1px solid rgb(225, 225, 225);
					--theme-titlebar-padding: 8px 16px;
					--theme-titlebar-shadow: 0px 0px;
				}
				capitec-title-bar > capitec-label {
					height: 32px;
					margin-left: 10px;
					line-height: 32px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-icon {
					cursor: pointer;
					--theme-icon-size-medium: 26px;
				}

				/* Filter bar styles */
				capitec-text-field {
					width: 337px;
					--theme-input-label-font-size: 16px;
					--theme-input-search-icon-margin-left: 15px;
					--theme-input-label-font-color: #959595;
					--theme-input-search-label-idle-margin-left: 30px;
				}

				/* main content styles */
				.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;
					padding-top: 0px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}
				.accounts {
					height: 64px;
					border: 1px solid #E1E1E1;
					border-radius: 4px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 11px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 11px;
				}
				capitec-group[gap="line"] > *:first-child {
					--theme-layout-gap-spacing: 16px;
				}
				horizon-label {
					width: 184px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				.no-result-group {
					width: 1020px;
					margin-top: 130px;
				}
				.no-results {
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}

				/* Footer styles */
				capitec-button-bar {
					width: 100%;
					--theme-buttonbar-item-gap: 0px;
					--theme-buttonbar-padding: 0;
				}
				capitec-button-bar > capitec-content-box {
					--theme-container-padding-left: 24px;
					--theme-container-padding-top: 6px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 6px;
					--theme-layout-gap-spacing: 16px;
				}
				capitec-button-bar > capitec-check {
					--theme-check-label-spacing: 8px;
					--theme-label-font-weight: 500;
					--theme-label-font-size: 16px;
					--theme-label-font-color: #3a3a3a;
				}
				capitec-hyperlink {
					--theme-hyperlink-color: #009DE0;
				}

				.quote-header-title{
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					width: 100%;
					box-shadow: none!important;
				}
				.quote-header-inner{
					font-weight: 600;
					width: 173px;
				}
				.quote-header-filler{
					width: 602px;
				}
				.accountSubTitle{
					line-height: 24px;
					padding-top: 0px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card>
				${this._renderTitleBar()}
				${this._renderSearch()}
				${this._renderFooter()}
			</capitec-card>
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar>
				<capitec-icon 
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Settlement Quote" type="title"></capitec-label>
			</capitec-title-bar>
		`;
	}

	_renderSearch() {
		this.textValue = ``;
		return html`
			<capitec-title-bar 
				?hidden="${this.showNoActiveAccounts}">
				<capitec-text-field
 					id="text-filter"
 					label="${DEFAULTS.SEARCH_TEXT_LABEL}"
 					type="search"
 					keyboardMode="alpha-numeric"
 					@key-input="${(e) => this._search(e)}"
					@focusout="${(e) => this._focusOutFilter(e.currentTarget.value)}"
 					@value-change="${(e) => this._search(e)}">
 				</capitec-text-field>
				<capitec-select
					.items="${CREDIT_TYPE_LIST}" 
					display-field="text"
					filter-id="select"
					@value-change = "${(e) => this._filter(e)}"
					value="${this.listValue}">
				</capitec-select>
			</capitec-title-bar>
			${this._renderSettlementQuoteHeader(this.filteredData.length)}
			<capitec-content-box class="main-cb" layout="vertical" halign="stretch" valign="top" gap="clear">

				${this.filteredData.length > 0
					? this.filteredData.map((item, index) => this._renderAcountInfoTile(item, index))
					: this._renderNoResult()}
			</capitec-content-box>
		`;
	}

	_renderSettlementQuoteHeader(itemCount) {
		if (itemCount > 0) {
			return html`
			<capitec-title-bar >
				<capitec-label class="accountSubTitle" 
					type="subtitle" 
					label="Choose an account"  >
				</capitec-label>
			</capitec-title-bar>
			<capitec-title-bar class="quote-header-title" >
				<capitec-label class="quote-header-filler" label=""></capitec-label>
				<capitec-label class="quote-header-inner" label="Current"></capitec-label>
				<capitec-label class="quote-header-inner" label="Max 7 Days"></capitec-label>
			</capitec-title-bar>`;
		} 
		return html``;
		
	}

	_renderNoResult() {
		return this.showNoAccountsFound ? html`
			<capitec-group
				class="no-result-group"
				layout="vertical"
				halign="center"
				valign="center"
				gap="none">
					<img
						src="platform/illustrations/history.svg"/>
					<capitec-label
						class="no-results"
						label="${this.noAccountsMessage}"
						type="strong">
					</capitec-label>

			</capitec-group>
		` : html``;
	}
	
	_renderAcountInfoTile (item, index) {
		return html`
			<capitec-content-box class="accounts" layout="horizontal" gap="none" valign="center">
				<capitec-check 
					data="${item}"
					@value-changed=${(e) => this._checkBox(e, item)}
					?checked="${item.selected}">
				</capitec-check>
				<capitec-group
					layout="horizontal"
					gap="line"
					halign="left" valign="center">
						<horizon-label
							label="${item.type === PRODUCTS.TERM_LOAN ? `Term loan (${item.productTypeDescription.split(` `)[0]} months)` : item.productTypeDescription}"
							value="${item.accountNumber}">
						</horizon-label>
						<horizon-label
							label="${item.type === PRODUCTS.CREDIT_CARD ? `Credit` : `Loan`} amount"
							value="${item.creditLimit}">
						</horizon-label>
				</capitec-group>
				<horizon-label
					label="${item.category === CREDIT_TYPE.FLEXIBLE ? `Monthly repayment` : `Instalment`}"
					value="${item.repayAmount || item.nextRepayment}">
				</horizon-label>
				<horizon-label
					label="Settlement Amount"
					value="${item.settlementAmount}">
				</horizon-label>
				<horizon-label
					label="Settlement Amount"
					value="${item.maxSettlementAmount}">
				</horizon-label>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-button-bar
				?hidden="${this.showNoActiveAccounts}">
				<capitec-content-box
					layout="horizontal"
					halign="left" valign="center"
					gap="clear">
						<capitec-check
							label="${this.selectedLabel}"
							?indeterminate="${this._isAnyAccountSelected()}"
							?checked="${this.settlementQuoteDetails.every(item => item.selected)}"
							@value-change="${() => this._selectAll()}">
						</capitec-check>
						<capitec-hyperlink 
							?hidden="${!this._isAnyAccountSelected()}"
							label="Deselect All" 
							@click="${() => this._deselect()}">
						</capitec-hyperlink>
						<capitec-spacer></capitec-spacer>
						<capitec-button 
							type="primary"
							label="Send Settlement Quote(s)"
							?hidden=${!this._isAnyAccountSelected()}
							@click="${() => this._showSendDialog()}">
						</capitec-button>
				</capitec-content-box>
			</capitec-button-bar>`;
	}
}
customElements.define(`horizon-settlement-quote`, SettlementQuote);