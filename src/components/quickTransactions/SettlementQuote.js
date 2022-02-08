import { Component, css, html } from 'platform/elements';

const DEFAULTS = {
	SEARCH_TEXT_LABEL: `Search loan, amount or account number`,
	TYPE_LABEL: `Credit type`,
};

const CREDIT_TYPE_LIST = Object.freeze([
'Credit card',
'Term Loan',
'Access facility'
]);

const FILTER_BY = {
	ALL: `ALL`,
	TEXT: `TEXT`,
	TYPE: `TYPE`
};

const quotes = [
	{
		quoteName: `Term Loan (32 months)`,
		accountNumber: `1234596`,
		loanAmount: 35000,
		instalment: 1234.91,
		settlementAmount: 18000
	},
	{
		quoteName: `Term Loan (84 months)`,
		accountNumber: `456789`,
		loanAmount: 15000,
		instalment: 1498.91,
		settlementAmount: 7920
	},
	{
		quoteName: `Credit card`,
		accountNumber: `147852`,
		loanAmount: 150000,
		instalment: 3982.91,
		settlementAmount: 31938.99
	},
	{
		quoteName: `Access facility`,
		accountNumber: `852369`,
		loanAmount: 50000,
		instalment: 2479.01,
		settlementAmount: 7820
	}
];

export class SettlementQuote extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.searchTextLabel = DEFAULTS.SEARCH_TEXT_LABEL;
		this.typeLabel = DEFAULTS.TYPE_LABEL;
		this.textValue = this.typeValue = ``;
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			quotes: { type: Object},
			searchTextLabel: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
	
	}

	_refineSearch() {
		// Assigning the raw data before performing the filter
		this.filteredData = this.transactionHistory.filter(item => item.transactionStatus !== ``);

		if (FILTER_BY.TEXT) {

			const searchTextResult = searchText.map(key => {
				if (key !== ``) {
					if (key.startsWith(`-`)) {
						return this.filteredData.filter(item => parseFloat(item.amount).toFixed(2).startsWith(key));
					}
					return this.filteredData.filter(item => item.description.toLowerCase().indexOf(key.toLowerCase()) !== -1 ||
															parseFloat(item.amount).toFixed(2).startsWith(key) ||
															(parseFloat(item.amount) * -1).toFixed(2).startsWith(key));
				}
				return [];
			});
			this.filteredData = Array.from(new Set([...searchTextResult.flat()]));
		}

		// Status filter is apllicable only on Savings Account Transaction History screen in the current state of application
		if (FILTER_BY.TYPE) {
			this.filteredData = this.filteredData.filter(item => item.transactionStatus === status);
		}

		this.requestUpdate();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_searchTextChange(event) {
		RENDER_CHIPS[FILTER_BY.TEXT] = event.detail.new;
		this._refineSearch();
	}

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
	
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	 static get styles() {
		return [
			super.styles,
			css`			
			capitec-title-bar {
				--theme-label-title-font-size: 24px;
				--theme-label-title-font-weight: 600;
				--theme-titlebar-shadow: none;
				--theme-titlebar-border: 1px solid #E1E1E1;
			}
			capitec-title-bar > capitec-icon {
				cursor: pointer;
				margin-right: 15px;
			}
			.main-cb {
				height: 690px;				
			}
			.type-select{
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
			.action-bar {
				height: 64px;
				width: var(--horizon-center-panel-width, 1064px);
			}
			.action-bar > capitec-text-field {
				height: 47px;
				width: 388px;
				padding-left: 8px;
			
				--theme-label-font-color: #3A3A3A;
				--theme-input-label-font-size: 16px;
				--theme-layout-gap-spacing: 8px; 
				--theme-input-clear-icon-height: 0px;
				--theme-input-clear-icon-width: 0px;
			}
			.main-cb > capitec-label[type="subtitle"] {
				line-height: 24px;

				--theme-label-subtitle-font-size: 18px;
				--theme-label-subtitle-font-weight: 600;
				--theme-layout-gap-spacing: 18px;
			}
			`
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
			<capitec-card class="center-section">
				${this._renderTitleBar()}
				${this._renderSearch()}
				<capitec-content-box class="main-cb">
					${this._renderAlertBanner()}
					${this._renderQuotes()}
				</capitec-content-box>
			</capitec-card>
		`;
	}

	_renderAlertBanner() {
		return html``
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
		return html`
			<capitec-title-bar>
			<capitec-group layout="horizontal" halign="left" valign="center" gap="clear" class="action-bar">
				<capitec-text-field
					id="text-filter"
					label=${this.searchTextLabel}
					type="search"
					keyboardMode="alpha-numeric"
					@key-input="${(e) => this._searchTextChange(e)}"
					@value-change="${(e) => this._searchTextChange(e)}"
					@focus="${(e) => this.searchTextLabel = ``}"
					@blur="${(e) => this._searchTextBlur(e)}"
					value="${this.textValue}">
				</capitec-text-field>

				<capitec-select
					label="${this.typeLabel}" 
					class="type-select"
					.items="${CREDIT_TYPE_LIST}"
					@focus="${(e) => this._statusFocussed(e)}"
					@value-change = "${(e) => this._filterByStatus(e)}"
					value = ${this.typeValue}>					
				</capitec-select>
			</capitec-group>
			</capitec-title-bar>
		`;
	}

	_renderQuotes() {
		return html`
			<capitec-label type="subtitle" label="Choose an account"></capitec-label>
			${quotes.map(item => this._renderRow(item))}
		`;
	}

	_renderRow(item) {
		return html`
			<capitec-group layout="grid" rows="auto" columns="uniform" gap="none">
				${this._renderRowInput(item)}
				${this._renderRowData(item)}
			</capitec-group>
		`;
	}

	_renderRowInput(rowData) {
		return html`
			<div 
				row="1" 
				column="1" 
				style="width: 35px; height: 22px;">
				<capitec-check 
					data-automation-id="stop-card-select"
					label="" 
					style="--theme-check-width: 21px; --theme-check-height: 21px;"
					@value-changed="${(e) => this._valueChanged(e, rowData)}">
				</capitec-check>
			</div>`;
	}

	_renderRowData(rowData) {
		return html`
		<div row="2" column="2" colspan="2" style="display: flex; align-items: center;">

		<horizon-label label="${rowData.quoteName}" value="${rowData.accountNumber}">
		</horizon-label>

		<horizon-label label="Loan amount" value="${rowData.loanAmount}">
		</horizon-label>

		<horizon-label label="Instalment" value="${rowData.instalment}">
		</horizon-label>

		<horizon-label label="Settlement amount" value="${rowData.settlementAmount}">
		</horizon-label>
		</div>`;
	}



}
customElements.define(`horizon-settlement-quote`, SettlementQuote);