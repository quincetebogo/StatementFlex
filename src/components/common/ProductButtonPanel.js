import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import 'platform/components/buttons/ProductTile';
import 'app/components/common/HorizonProductTile';


/**
 *
 *
 * @export
 * @class ProductButtonPanel
 * @extends {Component}
 */
export class ProductButtonPanel extends Component {

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance().recoverState();

		this.disableNavigation = false;
		this.subtitle = {};
		this.detail = {};
	}

	/**
	 *
	 *
	 * @readonly
	 * @static
	 * @memberof ProductButtonPanel
	 */
	static get properties() {
		return {
			disableNavigation: { type: Boolean },
			subtitle: { type: Object },
			detail: { type: Object }
		};
	}

	// TODO: remove top margin for top most button. 
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
				width: 440px;
				margin-top: 16px;
			}
			.hide-tile{
				display: none;
			}
			`
		];
	}

	onSavingsAccountClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToSavingsAccountProduct();
		}
	}

	onSavingsPlanClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToSavingsPlanProduct();
		}
	}

	onInsureClick() {
		console.log(`client is insured`)
		// if (this.disableNavigation) {
		// 	this.horizonRouter.navigateToInsureProduct();
		// }
		if (!this.horizonStore.callerInformation.hasInsuranceProducts) {
			this.horizonRouter.navigateToInsureProspectiveClient();
		}
		else
			this.horizonRouter.navigateToInsureExistingClient();
	}

	onCreditClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToCreditProduct();
		}
	}

	render() {
		return html`
						<horizon-product-tile class="product-button" type="transact" label="Savings Account"
							subtitle="${this.subtitle.savingsAccount ? this.subtitle.savingsAccount : `Know what you get, know what you pay`}"
							detail="${this.detail.savingsAccount ? this.detail.savingsAccount : ``}" icon="product/transact-white"
							@click="${() => this.onSavingsAccountClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button" type="save" label="Savings Plan"
							subtitle="${this.subtitle.savingsPlan ? this.subtitle.savingsPlan : `Let your money make money`}"
							icon="product/save-white" detail="${this.detail.savingsPlan ? this.detail.savingsPlan : ``}"
							@click="${() => this.onSavingsPlanClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button" type="insure" label="Insure"
							subtitle="${this.subtitle.insure ? this.subtitle.insure : `One plan, more cover`}" icon="product/insure-white"
							detail="${this.detail.insure ? this.detail.insure : ``}" @click="${() => this.onInsureClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button" type="credit" label="Credit"
							subtitle="${this.subtitle.credit ? this.subtitle.credit : `Rethink credit, realise dreams`}"
							icon="product/credit-white" detail="${this.detail.credit ? this.detail.credit : ``}" ?detailIcon="${false}"
							@click="${() => this.onCreditClick()}">
						</horizon-product-tile>
						</div>
						</div>
			`;
	}
}

window.customElements.define(`horizon-product-button-panel`, ProductButtonPanel);