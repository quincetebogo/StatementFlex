import { Component, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components/buttons/ProductTile';

export class HorizonProductBar extends Component {

	constructor() {
		super();
		this.router = Router.getInstance();
		this.disableNavigation = false;
	}

	static get properties() {
		return {
			disableNavigation: { type: Boolean }
		}
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
			}

            .product-button{
				height:80px;
                padding: 0px 0px 0px 0px;
				width: 440px;
				margin-top:24px;
			}
			`];
	}

	// TODO: Raise events and handle navigation in the client of this component
	onSavingsAccountClick() {
		if (!this.disableNavigation) {
			this.router.navigateByPath(`/product/savings-account`)
		}
	}

	onSavingsPlanClick() {
		if (!this.disableNavigation) {
			this.router.navigateByPath(`/product/savings-plan`)
		}
	}

	onInsureClick() {
		if (!this.disableNavigation) {
			this.router.navigateByPath(`/product/savings-plan`)
		}
	}

	onInsureClick() {
		if (!this.disableNavigation) {
			this.router.navigateByPath(`/product/insure`)
		}
	}

	onCreditClick() {
		if (!this.disableNavigation) {
			this.router.navigateByPath(`/product/credit`)
		}
	}

	render() {
		return html`
					<div class="products-card">
						<capitec-product-tile class="product-button"
											  type="transact" 
											  label="Savings Account" 
											  subtitle="Know what you get, know what you pay"
											  icon="product/transact-white"
											  @click="${() => this.onSavingsAccountClick()}">
						</capitec-product-tile>
						<capitec-product-tile class="product-button"
											  type="save" 
											  label="Savings Plan"
											  subtitle="Let your money make money"
											  icon="product/save-white"
											  @click="${() => this.onSavingsPlanClick()}">
						</capitec-product-tile>
						<capitec-product-tile class="product-button"
											  type="insure" 
											  label="Insure"
											  subtitle="One plan, more cover"
											  icon="product/insure-white"
											  @click="${() => this.onInsureClick()}">
						</capitec-product-tile>
						<capitec-product-tile class="product-button"
											  type="credit" 
											  label="Credit" 
											  subtitle="Rethink credit, realise dreams"
											  icon="product/credit-white"
											  @click="${() => this.onCreditClick()}">
						</capitec-product-tile>
					</div>
				</div>
			`;
	}
}

window.customElements.define(`horizon-product-bar`, HorizonProductBar);
