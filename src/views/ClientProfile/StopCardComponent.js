import { Component, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { EventAggregator } from 'platform/EventAggregator';
import '../../components/EndCallSessionReason';
import { Router } from 'platform/Router';

import 'platform/components';

const COLUMNS = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'cardNumber'
}

export class StopCardComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());
		this.router = Router.getInstance();

		this.toggleEndCallModal = false;
		this.cards = [
			{ cardType: "Debit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: false, rowIndex: 0 },
			{ cardType: "Credit Card", cardCategory: "", cardNumber: "5284 **** **** 1322", selected: false, rowIndex: 1 },
			{ cardType: "Credit Card", cardCategory: "Supplementary Cards", cardNumber: "5284 **** **** 1322", selected: false, rowIndex: 2 }
		];

		this.confirmedCaller = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			toggleEndCallModal: { type: Boolean },
			confirmedCaller: { type: Object },
			cards: { type: Object }
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Not used for now, will be used when we are going to implement table group by
	 */
	_customGroupByHandler(renderSet) {
		renderSet.pagedItems = renderSet.pagedItems.filter(x => !x.group);

		const groupedValues = Utilities.groupBy(this.cards, renderSet.strategy.groupField);

		const newRows = [];

		for (const key in groupedValues) {
			if (groupedValues.hasOwnProperty(key)) {

				let groupName = key;
				if (renderSet.groupLabel && Utilities.isFunction(renderSet.groupLabel)) {
					groupName = renderSet.groupLabel(key);
				} else if (typeof renderSet.groupLabel === `string`) {
					groupName = renderSet.groupLabel;
				}

				if (groupName) {
					newRows.push({
						group: groupName
					});
				}
				const rows = groupedValues[key];
				newRows.push(...rows);
			}
		}

		return {
			pagedItems: newRows
		};
	}

	_valueChanged(event, rowData) {
		this.cards[rowData.rowIndex].selected = event.detail.new
		this.requestUpdate();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	toggleEndCall() {
		this.toggleEndCallModal = !this.toggleEndCallModal;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

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
				capitec-alert-banner, capitec-table{
					width: 100%;
				}
			`];
	}

	render() {
		return html`
			<capitec-card class="stop-card">
				<capitec-title-bar type="clear" label="Stop Card"></capitec-title-bar>
				<capitec-alert-banner type="info" label="Notify client that once stopped, they will need to visit a branch for a new card.">
				</capitec-alert-banner>

				<capitec-table .items="${this.cards}">
					<capitec-table-column label="" 
										  field="" 
										  type=""
										  size="4%"
										  .renderer="${(rowData) => this.renderRowInput(rowData)}">
					</capitec-table-column>
					<capitec-table-column label="Card Type" 
										  field="cardType" 
										  type="text"
										  size="48%"
										  .renderer="${(rowData) => this.renderRowData(rowData, COLUMNS.CARDTYPE)}">
					</capitec-table-column>
					<capitec-table-column label="Card Number" 
										  field="cardNumber" 
										  type="text"
										  size="48%"
										  .renderer="${(rowData) => this.renderRowData(rowData, COLUMNS.CARDNUMBER)}">
					</capitec-table-column>
				</capitec-table>
			</capitec-card>
			${this.renderConfirmedUser()}
		`;
	}

	renderConfirmedUser() {
		if (this.toggleEndCallModal) {
			return html`<end-call-session
						@on-cancel="${() => this.onCancelEndCall()}">
			</end-call-session>`;
		}

		return html``;
	}

	renderRowInput(rowData) {
		return html`<div style="${rowData.selected ? `margin: 0px 0px 45px 0px;` : ``}">
						<capitec-check label=""
									   @value-changed="${(e) => this._valueChanged(e, rowData)}">
						</capitec-check>
					</div>`;
	}

	renderRowData(rowData, fieldType) {
		switch (fieldType) {
			case COLUMNS.CARDTYPE:
				if (rowData.selected) {
					return html`${this.renderReasonButtons(rowData, fieldType)}`;
				}
				return html`<div style="text-align: left;">
								${rowData[fieldType]}
							</div>`;
			case COLUMNS.CARDNUMBER:
				return html`<div style="${rowData.selected ? `margin: 0px 0px 45px 0px;` : ``} text-align: left;">
								${rowData[fieldType]}
							</div>`
			default:
				return html``;
		}
	}

	onCallCancelled() {
		this.router.navigateByPath(`/landingpage`);
	}

	onCancelEndCall() {
		this.toggleEndCallModal = false;
	}

	renderReasonButtons(rowData, fieldType) {
		return html`
					<div style="text-align:left;">${rowData[fieldType]}</div>
					<capitec-group layout="grid" rows="uniform" columns="auto" gap="none" style="width: 55%;">
						<capitec-label row="1" 
									   column="1"
									   label="Choose a Reason">
						</capitec-label>
						<capitec-button row="1" 
										column="2"
										label="Stop Card"
										@click="${(rowData) => this.doNothingForNow /**Thulekha will to integrate her changes here*/}">
						</capitec-button>
					</capitec-group>`;
	}
}

customElements.define(`stop-card`, StopCardComponent);