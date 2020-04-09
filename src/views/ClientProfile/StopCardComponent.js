import { Component, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { EventAggregator } from 'platform/EventAggregator';
import '../../components/EndCallSessionReason';
import '../../components/dialogs/StopCard';

import 'platform/components';

const COLUMNS = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'encryptedCardId'
}

const RENDER_MODE = {
	CLIENT_PROFILE: 0,
	CARD_STOP_MODAL: 1,
};

const TABLE_STYLE = {
	HEADER_CELL: `text-align: left; font-size: 16px; font-weight: 600; letter-spacing: 0; width: 490px; height: 22px; position: relative; top: -8px;`,
	BODY_CELL: `text-align: left; font-size: 16px; letter-spacing: 0; width: 490px; height: 22px; position: relative; top: -8px;`,
	CELL_HEIGHT: `height: 22px`,
	PADDING_LEFT: `padding: 0px 0px 0px 10px;`
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
		this.callerDetails = null;
		this.selectedCardCount = 0;

		this.renderMode = RENDER_MODE.CLIENT_PROFILE;
		this.cardsToStop = {};
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			toggleEndCallModal: { type: Boolean },
			callerDetails: { type: Object },
			cards: { type: Object },
			selectedCardCount: { type: Number },
			renderMode: { type: Number },
			rowData: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		let clientProfileDetails = this.callerDetails && this.callerDetails.clientProfileDetails;

		this.instruction = clientProfileDetails.instruction;
		this.cards = clientProfileDetails.cards;
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

	_onStopCards() {
		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;
		this.cardsToStop = this.cards.filter(card => card.selected);
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
			${this.renderStopCardModal(this.rowData)}
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
				<p id="action-display">&nbsp;${this.instruction}</p>
			</div>`;
	}

	renderCardDetails() {
		return html`
				<capitec-table .items="${this.cards}" row="3" column="1">
					<capitec-table-column label=""
										  field=""
										  type="text"
										  size="1064px;"
										  .renderer="${(rowData) => this.renderRowData(rowData)}"
										  .headerRenderer="${() => this.headerRenderer()}">
					</capitec-table-column>
				</capitec-table>`;
	}

	headerRenderer() {
		return html`<capitec-group layout="grid" rows="auto" columns="uniform" gap="none" style="${TABLE_STYLE.CELL_HEIGHT}">
						<div row="1" column="2" style="${TABLE_STYLE.HEADER_CELL}">
							<capitec-label label="Card Type"
										   style="${TABLE_STYLE.CELL_HEIGHT}"
										   type="subtitle">
							</capitec-label>
						</div>
						<div row="1" column="3" style="${TABLE_STYLE.HEADER_CELL}">
							<capitec-label label="Card Number"
										   style="${TABLE_STYLE.CELL_HEIGHT}"
										   type="subtitle">
							</capitec-label>
						</div>
					</capitec-group>`;
	}

	renderRowData(rowData) {
		return html`<capitec-group layout="grid" rows="auto" columns="uniform" gap="none" 
									style="${rowData.selected ? `height: 79px` : `height: 22px;`}">

						${this.renderRowInput(rowData)}

						<div row="1" column="2" style="${TABLE_STYLE.BODY_CELL}">
							<capitec-label 
									label="${rowData[COLUMNS.CARDTYPE]}"
									style="${TABLE_STYLE.CELL_HEIGHT}">
							</capitec-label>
						</div>
						
						<div row="1" column="3" style="${TABLE_STYLE.BODY_CELL}">
							<capitec-label 
									label="${rowData[COLUMNS.CARDNUMBER]}"
									style="${TABLE_STYLE.CELL_HEIGHT}">
							</capitec-label>
						</div>
						${this.renderReasonButtons(rowData)}
					</capitec-group>`;
	}

	renderRowInput(rowData) {
		return html`<div row="1" 
						 column="1" 
						 style="width: 35px; height: 22px;">
						<capitec-check label=""
									   @value-changed="${(e) => this._valueChanged(e, rowData)}">
						</capitec-check>
					</div>`;
	}

	renderReasonButtons(rowData) {
		if (rowData.selected) {
			return html`
					<div row="2" column="2" colspan="2" style="display: flex; align-items: center; padding-top: 8px;">
						<capitec-label label="Choose a Reason"
									   style="font-family: 'Hind Vadodara'; font-size: 16px; letter-spacing: 0;">
						</capitec-label>
						<capitec-button label="Card Damaged"
										style="${TABLE_STYLE.PADDING_LEFT}"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Card Lost"
										style="${TABLE_STYLE.PADDING_LEFT}"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Card Stolen"
										style="${TABLE_STYLE.PADDING_LEFT}"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
						<capitec-button label="Suspected Fraud"
										style="${TABLE_STYLE.PADDING_LEFT}"
										@click="${(e) => this._onClickReason()}">
						</capitec-button>
					</div>`;
		}
	}

	renderStopCardModal(rowData) {
		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {
			console.log("Stop card button clicked");
			return html`
				<horizon-stop-card  .cardsToStop="${this.cardsToStop}"></horizon-stop-card>
			`;
		}

	}
	renderFooter() {
		console.log("Rendering stop card");
		if (this.selectedCardCount > 0) {
			return html`
				<button-bar row="4" column="1">
					<capitec-label label="${this.selectedCardCount.toString()} card(s) selected" type="subtitle"></capitec-label>
					<capitec-button label="Stop Card(s)"
									type="primary"
									@click="${() => this._onStopCards()}">
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