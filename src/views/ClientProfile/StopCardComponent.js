import { Component, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { EventAggregator } from 'platform/EventAggregator';
import '../../components/EndCallSessionReason';

import 'platform/components';

export class StopCardComponent extends Component {

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());

		this.toggleEndCallModal = false;
		this.groupByField = "cardCategory";
		this.rowInputType = "Checkbox";
		this.cards = [
			{ cardType: "Debit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: true },
			{ cardType: "Credit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: false },
			{ cardType: "Credit Card", cardCategory: "Supplementary Cards", cardNumber: "5284 **** **** 1322", selected: false }
		];
		this.headers = [
			{ "key": "cardType", "value": "Card Type" },
			{ "key": "cardNumber", "value": "Card Number" }
		];
		this.items = this._customGroupByHandler();
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
					background-color: #F5F5F5;
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
				table tr:hover{
					background-color: rgba(0,131,187,0.1);
				}
				.group{
					background-color: #F5F5F5;
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

	static get properties() {
		return {
			toggleEndCallModal: { type: Boolean }
		}
	}

	_customGroupByHandler() {
		const groupedValues = Utilities.groupBy(this.cards, this.groupByField);
		const newRows = [];

		for (const key in groupedValues) {
			if (groupedValues.hasOwnProperty(key)) {

				let groupName = key;

				if (groupName && groupName != "undefined") {
					newRows.push({
						group: groupName
					});
				}
				const rows = groupedValues[key];
				newRows.push(...rows);
			}
		}
		return newRows;
	}

	renderTableHeader() {
		return html`
			${this.rowInputType ? html`<th class="row-input"></th>` : ``}
			${this.headers.map(header => html`
				<th>
					${header.value}
				</th>`)}
		`;
	}

	renderTableBody() {
		return html`${this.items.map((item) => {
			if (item.group) {
				return html`<tr class="group">
								<td colspan="${this.rowInputType ? this.headers.length + 1 : this.headers.length}">
									${item.group}
								</td>
							</tr>`;
			}
			else {
				return html`<tr>
								${this.renderRowInput()}
								${this.headers.map(header => html`
								<td>
									${item[header.key]}
								</td>`)}
							</tr>`;
			}
		})}`;
	}

	renderRowInput() {
		if (this.rowInputType == "Checkbox") {
			return html`
				<td>
					<capitec-check label=""></capitec-check>
				</td>
			`;
		}
		else if (this.rowInputType == "Radio") {
			return html`
				<td>
					<capitec-radio label=""></capitec-radio>
				</td>
			`;
		}
		else {
			return html``;
		}
	}

	toggleEndCall() {
		this.toggleEndCallModal = !this.toggleEndCallModal;
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
							${this.renderTableHeader()}
						</tr>
					</thead>
					<tbody>
						${this.renderTableBody()}
					</tbody>
				</table>
			</capitec-card>
			${this.renderConfirmedUser()}
		`;
	}

	renderConfirmedUser() {
		if (this.toggleEndCallModal) {
			return html`<end-call-session></end-call-session>`;
		}

		return html``;
	}
}

customElements.define(`stop-card`, StopCardComponent);