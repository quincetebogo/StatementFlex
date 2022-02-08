import { Component, css, html } from 'platform/elements';

const quotes = [
	{
		quoteName: `Term Loan (32 months)`,
		loanAmount: 35000,
		instalment: 1234.91,
		settlementAmount: 18000
	},
	{
		quoteName: `Term Loan (84 months)`,
		loanAmount: 15000,
		instalment: 1498.91,
		settlementAmount: 7920
	},
	{
		quoteName: `Credit card`,
		loanAmount: 150000,
		instalment: 3982.91,
		settlementAmount: 31938.99
	},
	{
		quoteName: `Access facility`,
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
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			quotes: { type: Object}
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

	// --------------
	// EVENT HANDLERS
	// --------------

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
				<capitec-content-box>
					${this._renderAlertBanner()}
					${this._renderSearch()}
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
		
		`;
	}

	_renderQuotes() {
		return html`
		
		`;
	}



}
customElements.define(`horizon-settlement-quote`, SettlementQuote);