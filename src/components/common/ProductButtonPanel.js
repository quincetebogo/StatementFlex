import { Component, css, html } from 'platform/elements';
import 'platform/components/buttons/ProductTile';
import 'app/components/common/HorizonProductTile';

const DEFAULT_SUBTITLE = {
	SAVINGS_ACCOUNT: `Know what you get, know what you pay`,
	LIVE_BETTER_SAVINGS: `Supercharge your savings`,
	SAVINGS_PLAN: `Let your money make money`,
	INSURE: `One plan, more cover`,
	CREDIT: `Rethink credit, realise dreams`
};

/**
 * Left hand bar menu product button panel
 *
 * @export
 * @class ProductButtonPanel
 * @extends {Component}
 */
export class ProductButtonPanel extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedButton = ``;

		this.subtitle = {
			savingsAccount: ``,
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.detail = {
			savingsAccount: ``,
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} subtitle Object holds the subtitle info to be shown on menu button
	 * @property {Object} detail Object holds the detail info to be shown on menu button
	 *
	 * @readonly
	 * @static
	 * @memberof ProductButtonPanel
	 */
	static get properties() {
		return {
			selectedButton: { type: String },
			subtitle: { type: Object },
			detail: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_productButtonClick(button) {
		this.dispatchEvent(new CustomEvent(`click`, { detail: { productButton: button } }));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.products-card{
				padding: 0px;
				background-color: #f4f4f4;
				border: 0px;
				margin-top: 8px;
			}

            .product-button{
                padding: 0px 0px 0px 0px;
				width: var(--horizon-left-panel-width, 440px);
				--theme-product-tile-focus-transact-border: 2px solid #009DE0;
				margin-top: 16px;
			}
			.hide-tile{
				display: none;
			}
			`
		];
	}

	render() {
		return html`
			<horizon-product-tile 
				class="product-button"
				type="transact"
				label="Savings Account"
				subtitle="${this.subtitle.savingsAccount ? this.subtitle.savingsAccount : DEFAULT_SUBTITLE.SAVINGS_ACCOUNT}"
				detail="${this.detail.savingsAccount ? this.detail.savingsAccount : ``}"
				icon="product/transact-white"
				@click="${() => this._productButtonClick(`SavingsAccount`)}"
				?selected="${this.selectedButton === `SavingsAccount`}"
				data-automation-id="product-button-panel-savings-account">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="save"
				label="Savings Plan"
				subtitle="${this.subtitle.savingsPlan ? this.subtitle.savingsPlan : DEFAULT_SUBTITLE.SAVINGS_PLAN}"
				detail="${this.detail.savingsPlan ? this.detail.savingsPlan : ``}"
				icon="product/save-white"
				@click="${() => this._productButtonClick(`SavingsPlan`)}"
				?selected="${this.selectedButton === `SavingsPlan`}"
				data-automation-id="product-button-panel-savings-plan">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="credit"
				label="Credit"
				subtitle="${this.subtitle.credit ? this.subtitle.credit : DEFAULT_SUBTITLE.CREDIT}"
				detail="${this.detail.credit ? this.detail.credit : ``}"
				icon="product/credit-white"
				?detailIcon="${false}"
				@click="${() => this._productButtonClick(`Credit`)}"
				?selected="${this.selectedButton === `Credit`}"
				data-automation-id="product-button-panel-credit">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="insure"
				label="Insure"
				subtitle="${this.subtitle.insure ? this.subtitle.insure : DEFAULT_SUBTITLE.INSURE}"
				detail="${this.detail.insure ? this.detail.insure : ``}"
				icon="product/insure-white"
				@click="${() => this._productButtonClick(`Insure`)}"
				?selected="${this.selectedButton === `Insure`}"
				data-automation-id="product-button-panel-insure">
			</horizon-product-tile>
			<horizon-product-tile
				class="product-button"
				type="live-better"
				label="Live Better Savings"
				subtitle="${this.subtitle.liveBetterSavings ? this.subtitle.liveBetterSavings : DEFAULT_SUBTITLE.LIVE_BETTER_SAVINGS}"
				detail="${this.detail.liveBetterSavings ? this.detail.liveBetterSavings : ``}"
				icon="product/live-better"
				@click="${() => this._productButtonClick(`LiveBetter`)}"
				?selected="${this.selectedButton === `LiveBetter`}"
				data-automation-id="product-button-panel-live-better">
			</horizon-product-tile>
		`;
	}
}

window.customElements.define(`horizon-product-button-panel`, ProductButtonPanel);