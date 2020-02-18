import { View, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';

import 'platform/components';

export class StopCardComponent extends View {

	constructor() {
		super();

		this.cards = [
			{ cardType: "Debit Card", cardCategory: "", cardNumber: "5284 **** **** 1322" },
			{ cardType: "Credit Card", cardCategory: "", cardNumber: "5284 **** **** 1322" },
			{ cardType: "Credit Card", cardCategory: "Supplementary Cards", cardNumber: "5284 **** **** 1322" }
		];
	}

	static get styles() {
		return [
			super.styles,
			css`
				.stop-card{
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
					border-collapse: collapse;
				}
				table > thead > tr{
					width: 100%;
				}
				table > thead > tr > th{
					text-align: left;
					background-color: gainsboro;
					color: #003652;
					font: bold 20px/50px Hind Vadodara;
					width: auto;
					padding: 5px 0px 0px 20px;
				}
				table > tbody > tr {
					border-bottom: 1px ridge #ddd;
				}
				table > tbody > tr > td{
					text-align: left;
					color: #003652;
					font: 15px/35px Hind Vadodara;
					width: auto;
					padding: 5px 0px 0px 20px;
				}
			`];
	}

	renderTableBody() {
		return html`${this.cards.map(item => {
			return html`<tr>
								<td>
									${item.cardType}
								</td>
								<td>
									${item.cardNumber}
								</td>
							</tr>`;
		})}`;
	}

	render() {
		return html`
			<capitec-card class="stop-card">
				<capitec-title-bar type="clear" label="Stop Card"></capitec-title-bar>
				<capitec-alert-banner type="info" label="Notify client that once stopped, they will need to visit a branch for a new card.">
				</capitec-alert-banner>
				<table>
					<thead>
						<tr>
							<th>Card Type</th>
							<th>Card Number</th>
						</tr>
					</thead>
					<tbody>
						${this.renderTableBody()}
					</tbody>
				</table>
			</capitec-card>
		`;
	}
}

customElements.define(`stop-card`, StopCardComponent);