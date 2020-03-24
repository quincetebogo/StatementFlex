import { Component, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { EventAggregator } from 'platform/EventAggregator';
import '../../components/EndCallSessionReason';

import 'platform/components';
import '../../components/dialogs/StopCard';

const COLUMNS = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'accountNumber'
}

const RENDER_MODE = {
	CLIENT_PROFILE: 0,
	CARD_STOP_MODAL: 1,
};

export class StopCardComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());

		this.toggleEndCallModal = false;
		this.cards = null;
		this.confirmedCaller = null;
		this.renderMode = RENDER_MODE.CLIENT_PROFILE;
		this.rowData = {};
		this.selectedCardCount = 0;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			toggleEndCallModal: { type: Boolean },
			confirmedCaller: { type: Object },
			cards: { type: Object },
			renderMode: { type: Number },
			rowData: { type: Object },
			selectedCardCount: { type: Number }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.cards = this.confirmedCaller.cards;
		/**
		 * Generating rowIndex, logic to show/hide stop card reasons is based on rowIndex
		 */
		this.cards = this.generateRowIndex();
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
		this.cards[rowData.rowIndex].selected = event.detail.new;
		this.selectedCardCount = this.cards.filter(card => card.selected).length;
	}

	_onClickReason() {
		/**
		 * Stop reason selection functionality comes here
		 */
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

	generateRowIndex() {
		return this.cards.map((card, index) => {
			card["rowIndex"] = index;
			card["selected"] = false;
			return card;
		});
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.stop-card{
					width: 1065px;
					height: 823px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				.horizon-notify-client{
					display: flex;
					flex-direction: row;
					width: 100%;
					height: 64px;
					background: #DAF5F3;
				}
				#action-icon{
					margin-left: 24px;
				}
				#action-display{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-weight: 500;
					align: center;
					padding: 12px 0px 0px 10px;
				}
				capitec-table {
					width: 100%;
					height: 631px;
				}
				button-bar{
					border-top: thin solid #d3d3d3;
					height: 64px;
				}
				button-bar > capitec-button{
					float: right;
					padding: 6px 24px 0px 0px;
				}
				button-bar > capitec-label{
					float: left;
					padding: 11px 0px 0px 24px;
				}
			`];
	}

	render() {
		return html`
			<capitec-card class="stop-card">
				<capitec-group layout="grid" gap="none" row="auto" columns="uniform" style="width:100%;">
					
					${this.renderTitleBar()}
					${this.renderNotifyClient()}
					${this.renderCardDetails()}
					${this.renderFooter()}

				</capitec-group>
			</capitec-card>
			${this.renderEndCallModal()}
		`;
	}

	renderTitleBar() {
		return html`<capitec-title-bar type="clear" 
									   label="Stop Card" 
									   row="1" 
									   column="1">
					</capitec-title-bar>`;
	}

	renderNotifyClient() {
		return html`
			<div class="horizon-notify-client" row="2" column="1">
				<img src="../../images/info.svg" id="action-icon"/>
				<p id="action-display">&nbsp;Notify client that once stopped, they will need to visit a branch for a new card.</p>
			</div>`;
	}

	renderCardDetails() {
		return html`
				<capitec-table .items="${this.cards}" row="3" column="1">
					<capitec-table-column label=""
										  field=""
										  type=""
										  size="5%"
										  .renderer="${(rowData) => this.renderRowInput(rowData)}">
					</capitec-table-column>
					<capitec-table-column label="Card Type"
										  field="cardType"
										  type="text"
										  size="95%"
										  .renderer="${(rowData) => this.renderRowData(rowData, COLUMNS.CARDTYPE)}"
										  .headerRenderer="${() => this.headerRenderer()}">
					</capitec-table-column>
				</capitec-table>
				${this.renderStopCardModal(this.rowData)}
				`;

	}

	renderRowInput(rowData) {
		return html`<div style="${rowData.selected ? `margin: 0px 0px 63px 0px;` : ``}">
						<capitec-check label=""
									   @value-changed="${(e) => this._valueChanged(e, rowData)}">
						</capitec-check>
					</div>`;
	}

	headerRenderer() {
		return html`<capitec-group layout="grid" rows="auto" columns="uniform">
						<capitec-label label="Card Type"
									   row="1"
									   column="1"
									   style="text-align: left;"
									   type="subtitle">
						</capitec-label>
						<capitec-label label="Card Number"
									   row="1"
									   column="2"
									   style="text-align: left;"
									   type="subtitle">
						</capitec-label>
					</capitec-group>`;
	}

	renderRowData(rowData) {
		return html`<capitec-group layout="grid" rows="auto" columns="uniform">
						<capitec-label label="${rowData[COLUMNS.CARDTYPE]}"
										row="1"
										column="1"
										style="text-align: left;">
						</capitec-label>
						<capitec-label label="${rowData[COLUMNS.CARDNUMBER]}"
										row="1"
										column="2"
										style="text-align: left;">
						</capitec-label>
						${this.renderReasonButtons(rowData)}
					</capitec-group>`;
	}

	renderStopCardModal() {

		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {

			return html`
				<horizon-stop-card
				
				></horizon-stop-card>
			`;
		}

	}
	renderReasonButtons(rowData) {
		if (rowData.selected) {
			return html`
					<div row="2" column="1" colspan="2" style="text-align:left;">
						Choose a Reason
						<capitec-button label="Card Damaged"
										style="padding: 0px 0px 0px 10px;"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Card Lost"
										style="padding: 0px 0px 0px 10px;"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Card Stolen"
										style="padding: 0px 0px 0px 10px;"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Suspected Fraud"
										style="padding: 0px 0px 0px 10px;"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
					</div>`;
		}
	}

	renderFooter() {
		if (this.selectedCardCount > 0) {
			return html`
				<button-bar row="4" column="1">
					<capitec-label label="${this.selectedCardCount.toString()} card(s) selected" type="subtitle"></capitec-label>
					<capitec-button row="1" 
									column="2"
									label="Stop Card(s)"
									type="primary"
									@click="${(e) => { this.renderMode = RENDER_MODE.CARD_STOP_MODAL }}">
					</capitec-button>
				</button-bar>`;
		}
	}

	renderEndCallModal() {
		if (this.toggleEndCallModal) {
			return html`<end-call-session></end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`stop-card`, StopCardComponent);