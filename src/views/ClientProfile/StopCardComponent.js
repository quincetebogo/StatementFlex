import { View, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';

import 'platform/components';

export class StopCardComponent extends View {

	constructor() {
		super();

		this.cards = [
			{ cardType: "Debit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: true },
			{ cardType: "Credit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: false },
			{ cardType: "Credit Card", cardCategory: "Supplementary Cards", cardNumber: "5284 **** **** 1322", selected: false }
		];
	}

	static get styles() {
		return [
			super.styles,
			css`
				.savingsproduct-info{
					width: 1067.8px;
					height: 770px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				horizon-product-tile{
					width: 97%;
					margin: 15px 0px 15px 15px;
				}
				capitec-alert-banner, capitec-table{
					width: 100%;
				}
				table{
					width: 100%;
				}
				table > thead > tr{
					width: 100%;
				}
				table > thead > tr > td{
					text-align: left;
					background-color: gainsboro;
					color: #003652;
					font: bold 20px/50px Hind Vadodara;
					width: auto;
					padding: 5px 0px 0px 20px;
				}
				table > tbody > tr > td{
					text-align: left;
					color: #003652;
					font: 15px/35px Hind Vadodara;
					width: auto;
					padding: 5px 0px 0px 20px;
				}
				.group{
					background-color: gainsboro;
				}
				.group > td{
					text-align: left;
					font: bold 18px/50px Hind Vadodara;
				}
				.row-input{
					width: 6%;
				}
			`];
	}

	render() {
		return html`
			<capitec-card class="savingsproduct-info">
				<capitec-title-bar type="clear" label="Stop Card"></capitec-title-bar>
				<capitec-alert-banner type="info" label="Notify client that once stopped, they will need to visit a branch for a new card.">
				</capitec-alert-banner>
				<capitec-table fixed="${true}" .items="${this.cards}">
					<capitec-table-column label="Card Type" field="cardType" align="left"></capitec-table-column>
  					<capitec-table-column label="Card Number" field="cardNumber" align="left"></capitec-table-column>
				</capitec-table>
			</capitec-card>
		`;
	}
}

customElements.define(`stop-card`, StopCardComponent);