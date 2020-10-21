import { Component, css, html } from 'platform/elements';
import { HorizonRouter } from '../../shell/HorizonRouter';

import { EventAggregator } from 'platform/EventAggregator';
import 'platform/components/buttons/ProductTile';
import '../Common/HorizonProductTile';

export class HorizonProductBar extends Component {

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`horizon-update-left-hand-bar`, (event) => this._onUpdatePageDetails(event));

		this.disableNavigation = false;
		// Boolean value to diaplay or hide the Favourites Tile according to the page on which we are
        this.displayFavTile = false;
        this.subtitle = {};
		this.details = {};
	}

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

	// TODO: Raise events and handle navigation in the client of this component

	_onUpdatePageDetails(event) {
		this.subtitle = event.subtitle;
		this.detail = event.detail;
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
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToInsureProduct();
		}
	}

	onCreditClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToCreditProduct();
		}
	}

	render() {
		return html`
					<div class="products-card">
					    <horizon-product-tile class="product-button ${this.displayFavTile ? '' : 'hide-tile'}" 
                                              type="favourites" 
                                              label="Favourites"
							                  subtitle="Transact, dispute, cards and more"
                                              @click="">
						</horizon-product-tile>
					
						<horizon-product-tile class="product-button" 
                                              type="transact" 
                                              label="Savings Account"
							                  subtitle=${this.subtitle.savingsAccount ? this.subtitle.savingsAccount : "Know what you get, know what you pay"}
                                              detail=${this.detail ? this.detail.savingsAccount : "" } 
                                              icon="product/transact-white"
							                  @click="${() => this.onSavingsAccountClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
                                              type="save"
                                              label="Savings Plan"
                                              subtitle=${this.subtitle.savingsPlan ? this.subtitle.savingsPlan : " Let your money make money"} 
                                              icon="product/save-white"
                                              detail=${this.detail ? this.detail.savingsPlan : ""} 
                                              @click="${() => this.onSavingsPlanClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
                                              type="insure"
                                              label="Insure"
                                              subtitle=${this.subtitle.insure ? this.subtitle.insure : " One plan, more cover"} 
                                              icon="product/insure-white"
                                              detail=${this.detail ? this.detail.insure : ""} 
                                              @click="${() => this.onInsureClick()}">
						</horizon-product-tile>
						<horizon-product-tile class="product-button"
                                              type="credit"
                                              label="Credit"
                                              subtitle=${this.subtitle.credit ? this.subtitle.credit : " Rethink credit, realise dreams"} 
                                              icon="product/credit-white"
                                              detail=${this.detail ?
							this.detail.credit : "" } addIcon @click="${() => this.onCreditClick()}">
						</horizon-product-tile>
					</div>
					</div>
			`;
	}
}

window.customElements.define(`horizon-product-bar`, HorizonProductBar);