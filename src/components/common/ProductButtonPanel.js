import { Component, css, html } from 'platform/elements';
import { RoleManager } from 'app/shell/RoleManager';
import 'platform/components/buttons/ProductTile';
import 'app/components/common/HorizonProductTile';

const TOOLTIP_MESSAGE = `Your role does not allow you to make use of this functionality.`;

const DEFAULT_SUBTITLE = {
	SAVINGS_ACCOUNT: `Know what you get, know what you pay`,
	LIVE_BETTER_SAVINGS: `Supercharge your savings`,
	SAVINGS_PLAN: `Let your money make money`,
	INSURE: `One plan, more cover`,
	CREDIT: `Rethink credit, realise dreams`,
	CAPITEC_CONNECT: `Prepaid that last longer`
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

		this.roleManager = RoleManager.getInstance();

		this.selectedButton = ``;
		this.roleManager = RoleManager.getInstance();
		this.subtitle = {
			savingsAccount: ``,
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``,
			credit: ``,
			capitecConnect: ``
		};

		this.detail = {
			accountName: ``,
			savingsAccount: ``,
			liveBetterSavings: ``,
			savingsPlan: ``,
			insure: ``,
			credit: ``,
			capitecConnect: ``
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
			detail: { type: Object },
			connectReversalCount: { type: Number }
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

	_toPascalCase(str) {
		return str
			.split(` `)
			.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join(` `);
	}

	_getProductDetailValue(amount, type) {
		// Insure and Livebetter are disabled as part of the Capitec connect agent flow
		const product = [`insure`, `liveBetter`];
		if (this.roleManager.isCapitecConnectAgent && product.includes(type)) {
			return null;
		}
		return amount;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
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
				label="${this.detail.accountName ? this._toPascalCase(this.detail.accountName) : `Main Account`}"
				subtitle="${this.subtitle.savingsAccount ? this.subtitle.savingsAccount : DEFAULT_SUBTITLE.SAVINGS_ACCOUNT}"
				detail="${this.detail.savingsAccount ? this.detail.savingsAccount : ``}"
				?showToolTip = "${this.roleManager.isInsureAgent}"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				icon="product/transact-white"
				@click="${() => this._productButtonClick(`SavingsAccount`)}"
				?selected="${this.selectedButton === `SavingsAccount`}"
				data-automation-id="product-button-panel-savings-account"
				?disabled="${this.roleManager.isInsureAgent}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="save"
				label="Savings Plan"
				subtitle="${this.subtitle.savingsPlan ? this.subtitle.savingsPlan : DEFAULT_SUBTITLE.SAVINGS_PLAN}"
				detail="${this.detail.savingsPlan ? this.detail.savingsPlan : ``}"
				?showToolTip = "${this.roleManager.isInsureAgent}"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				icon="product/save-white"
				@click="${() => this._productButtonClick(`SavingsPlan`)}"
				?selected="${this.selectedButton === `SavingsPlan`}"
				data-automation-id="product-button-panel-savings-plan"
				?disabled="${this.roleManager.isInsureAgent}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="credit"
				label="Credit"
				subtitle="${this.subtitle.credit ? this.subtitle.credit : DEFAULT_SUBTITLE.CREDIT}"
				detail="${this.detail.credit ? this.detail.credit : ``}"
				icon="product/credit-white"
				?detailIcon="${false}"
				?showToolTip = "${this.roleManager.isInsureAgent}"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				@click="${() => this._productButtonClick(`Credit`)}"
				?selected="${this.selectedButton === `Credit`}"
				data-automation-id="product-button-panel-credit"
				?disabled="${this.roleManager.isInsureAgent}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="insure"
				label="Insure"
				subtitle="${this.subtitle.insure ? this.subtitle.insure : DEFAULT_SUBTITLE.INSURE}"
				detail="${this.detail.insure ? this._getProductDetailValue(this.detail.insure, `insure`) : ``}"
				icon="product/insure-white"
				@click="${() => this._productButtonClick(`Insure`)}"
				?selected="${this.selectedButton === `Insure`}"
				?showToolTip = "${this.roleManager.isCapitecConnectAgent}"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				data-automation-id="product-button-panel-insure"
				?disabled="${this.roleManager.isCapitecConnectAgent}">
			</horizon-product-tile>
			<horizon-product-tile
				class="product-button"
				type="live-better"
				label="Live Better Savings"
				subtitle="${this.subtitle.liveBetterSavings ? this.subtitle.liveBetterSavings : DEFAULT_SUBTITLE.LIVE_BETTER_SAVINGS}"
				detail="${this.detail.liveBetterSavings ? this._getProductDetailValue(this.detail.liveBetterSavings, `liveBetter`) : ``}"
				icon="product/live-better"
				@click="${() => this._productButtonClick(`LiveBetter`)}"
				?showToolTip = "${this.roleManager.isCapitecConnectAgent || this.roleManager.isInsureAgent}"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				?selected="${this.selectedButton === `LiveBetter`}"
				data-automation-id="product-button-panel-live-better"
				?disabled="${this.roleManager.isCapitecConnectAgent || this.roleManager.isInsureAgent}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="capitec-connect"
				label="Capitec Connect"
				subtitle="${this.subtitle.capitecConnect ? this.subtitle.capitecConnect : DEFAULT_SUBTITLE.CAPITEC_CONNECT}"
				icon="product/cellphone"
				@click="${() => this._productButtonClick(`CapitecConnect`)}"
				?selected="${this.selectedButton === `CapitecConnect`}"
				data-automation-id="product-button-panel-capitec-connect"
				.toolTipMessage = "${TOOLTIP_MESSAGE}"
				?showToolTip = "${this.roleManager.isHelpDeskAgent || this.roleManager.isInsureAgent || this.roleManager.isClientCareAgent}"
				?disabled="${this.roleManager.isHelpDeskAgent || this.roleManager.isInsureAgent || this.roleManager.isClientCareAgent}">
			</horizon-product-tile>
		`;
	}
}

window.customElements.define(`horizon-product-button-panel`, ProductButtonPanel);