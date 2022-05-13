import { CREDIT_TYPE, CREDIT_TYPE_LIST, DEFAULTS, PRODUCTS } from 'app/constants/Credit';
import { Component, css, html } from 'platform/elements';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';

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
		this.settlementQuoteDetails = {};
		this.errorMessage = ``;
		this.isBusy = false;
		this.selectedAccounts = [];
		this.filteredData = [];
		this.listValue = `Credit type`;
		this.selectedLabel = `Select all`;
	}


	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @readonly
	 * @static
	 * @memberof FavouriteTransactions
	 */


	static get properties() {
		return {
			settlementQuoteDetails: { type: Array },
			isBusy: { attribute: false },
			filteredData: { type: Array },
			listValue: { type: String },
			selectedLabel: { type: String }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------


	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	
	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_filter(e) {
		[this.listValue] = e.detail.new.split(` `);
		this._search(e);
	}

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_showSendDialog () {
		this.selectedAccounts = this.settlementQuoteDetails.filter(item => item.selected);
		this.dispatchEvent(new CustomEvent(`send-quote`, { detail: { selectedAccounts: this.selectedAccounts } }));
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

	_selectAll() {
		if (this.filteredData.every(item => item.selected)) {
			this.selectedLabel = `Select all`;
			this.settlementQuoteDetails.forEach(item => item.selected = false);
		} else {
			this.filteredData.forEach(item => item.selected = true);
			this.selectedLabel = `${this._numberOfAccountsSelected()} accounts selected`;
		}
	}

	_deselect() {
		this.selectedLabel = `Select all`;
		this.filteredData.forEach(item => item.selected = false);
		this.selectedLabel = `${this._numberOfAccountsSelected()} accounts selected`;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------


	_initialise() {
		this.settlementQuoteDetails = this.settlementQuoteDetails.map(item => {
			item.selected = false;
			return item;
		});

		this.filteredData = this.settlementQuoteDetails;
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
				.card{
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
				.alert-banner
				{
					width:100%;
				}
				.accounts{
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
				horizon-label{
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
			<capitec-card class="card">
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
					size="small"
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
			<capitec-title-bar>
				<capitec-text-field
 					id="text-filter"
 					label="${DEFAULTS.SEARCH_TEXT_LABEL}"
 					type="search"
 					keyboardMode="alpha-numeric"
 					@key-input="${(e) => this._search(e)}"
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
			<capitec-content-box class="main-cb" layout="vertical" halign="stretch" valign="top" gap="clear">

				<capitec-label 
					type="subtitle" 
					label="Choose an account" 
					?hidden="${this.filteredData.length < 1}" >
				</capitec-label>
				${this.filteredData.length > 0
					? this.filteredData.map((item, index) => this._renderAcountInfoTile(item, index))
					: this._renderNoResult()}
			</capitec-content-box>
		`;
	}

	_renderNoResult() {
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
					value="${item.currentBalance}">
				</horizon-label>
			</capitec-content-box>
		`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>
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