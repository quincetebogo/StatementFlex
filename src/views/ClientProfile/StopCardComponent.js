import { Component, html, css } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import { HorizonViewManager } from '../../HorizonViewManager';

import '../../components/dialogs/EndCallSessionReason';
import '../../components/dialogs/StopCard';

import 'platform/components';
import '../../components/dialogs/StopCard';

const COLUMNS = {
	CARDTYPE: 'cardType',
	CARDNUMBER: 'encryptedCardId'
}

const RENDER_MODE = {
	CLIENT_PROFILE: 0,
	CARD_STOP_MODAL: 1,
	CARD_STOP_SUCCESS: 2
};

const TABLE_STYLE = {
	HEADER_CELL: `width: 490px; font-size: 16px; font-weight: 600; letter-spacing: 0; line-height: 22px;`,
	BODY_CELL: `width: 490px; text-align: left; font-size: 16px; letter-spacing: 0; line-height: 22px;`,
	CELL_HEIGHT: `height: 22px`,
	REASON_BUTTONS: `padding: 0px 0px 0px 14px; --theme-button-padding-top: 5.5px; --theme-button-padding-bottom: 5.5px; --theme-button-padding-left: 10px; --theme-button-padding-right: 10px; --theme-button-font-size: 14px;`
};

const STOPREASONS = {
	CARD_DAMAGED: 'DAMAGED',
	CARD_LOST: 'LOST',
	CARD_STOLEN: 'STOLEN',
	SUSPECTED_FRAUD: 'SUSPECTED_FRAUD'
};

export class StopCardComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());
		this.eventAggregator.subscribe(`confirmed-stop`, () => this.renderStopCardModal(rowData));

		this.renderMode = RENDER_MODE.CLIENT_PROFILE;
		this.cards = null;
		this.rowData = {};
		this.selectedCardCount = 0;
		this.cardsToStop = [];

		this.confirmedCaller = null; // Actually the view manager state passed in from the parent component
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			confirmedCaller: { type: Object },
			cards: { type: Object },
			selectedCardCount: { type: Number },
			renderMode: { type: Number },
			rowData: { type: Object },
			cardsToStop: { type: Array }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.router = Router.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();

		let clientProfileDetails = this.confirmedCaller && this.confirmedCaller.clientProfileDetails;
		let incomingCallDetails = this.confirmedCaller && this.confirmedCaller.incomingCallDetails;

		this.instruction = clientProfileDetails.instruction;
		this.cards = clientProfileDetails.cards;
		/**
		* Generating rowIndex, logic to show/hide stop card reasons is based on rowIndex
		*/
		this.cards = this.generateRowIndex();

		// Set up caller information for passing to Stop Card Modal
		this.callerInfo = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: incomingCallDetails.ivrOptionCode,
			incidentReferenceNumber: incomingCallDetails.incidentReferenceNumber,
			agentTelephoneNumber: incomingCallDetails.agentTelephoneNumber
		};

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish('horizon-update-call_actionbar',
			{
				referenceNo: this.callerInfo.incidentReferenceNumber,
				phoneNumber: this.callerInfo.incomingTelephoneNumber
			});
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

		if (event.detail.new) {
			this.cardsToStop.push({
				cardId: rowData["cardId"],
				accountNumber: rowData["accountNumber"],
				encryptedCardId: rowData["encryptedCardId"],
				cardType: rowData["cardType"],
				stopReason: ""
			});
		}
		else {
			this.cardsToStop = this.cardsToStop.filter(card => card.cardId != rowData["cardId"]);
		}
		console.log(rowData);
	}

	_onClickReason(stopReason, rowData) {
		this.cardsToStop.map(card => {
			if (card.cardId == rowData.cardId) {
				card.stopReason = stopReason;
			}
		});
	}


	_onStopCards() {
		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;
		this.cardsToStop = this.cards.filter(card => card.selected);
	}

	_onCardsStopped(event) {
		this.dispatchEvent(new CustomEvent('cards-stopped',
			{
				detail: {
					callerInfo: this.callerInfo,
					stoppedCards: event.detail.stoppedCards
				}
			}));
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	async _onCallComplete(reason) {
		// TODO - call for end call reason	
		// Clear any state and return to landing page.
		this.horizonViewManager.saveState({});

		try {
			await this.stopCardService.endCall(this.callerInfo.incidentReferenceNumber, reason.detail.endCallReason.key);
		}
		catch (error) {
			console.log(this.error);
		}

		this.router.navigateByPath(`/landingPage`);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

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
					--theme-button-padding-top: 8px; 
					--theme-button-padding-bottom: 8px; 
					--theme-button-padding-left: 8px; 
					--theme-button-padding-right: 8px;
					float: right;
					width: 135px;
					margin: 12px 24px 0px 0px;
				}
				button-bar > capitec-label{
					--theme-label-subtitle-font-weight: 600;
					float: left;
					width: 125px;
					letter-spacing: 0;
					line-height: 24px;
					margin: 20px 0px 0px 23px;
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
				</capitec-table>
				`;

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
									style="${rowData.selected ? `height: 70px` : `height: 22px;`}">

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
									   style="--theme-check-width: 21px; --theme-check-height: 21px;"
									   @value-changed="${(e) => this._valueChanged(e, rowData)}">
						</capitec-check>
					</div>`;
	}

	renderReasonButtons(rowData) {
		if (rowData.selected) {
			return html`
					<div row="2" column="2" colspan="2" style="display: flex; align-items: center;">
						<capitec-label label="Choose a Reason"
									   style="line-height: 21px; width: 102px;">
						</capitec-label>
						<capitec-button label="Card Damaged"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										@click="${(e) => this._onClickReason(STOPREASONS.CARD_DAMAGED, rowData)}">
						</capitec-button>
						<capitec-button label="Card Lost"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										@click="${(e) => this._onClickReason(STOPREASONS.CARD_LOST, rowData)}">
						</capitec-button>
						<capitec-button label="Card Stolen"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										@click="${(e) => this._onClickReason(STOPREASONS.CARD_STOLEN, rowData)}">
						</capitec-button>
						<capitec-button label="Suspected Fraud"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										@click="${(e) => this._onClickReason(STOPREASONS.SUSPECTED_FRAUD, rowData)}">
						</capitec-button>
					</div>`;
		}
	}

	renderStopCardModal(rowData) {
		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {
			return html`
				<horizon-stop-card 
					.callerInfo="${this.callerInfo}"
					.cardsToStop="${this.cardsToStop}"			
					@on-confirm="${(event) => this._onCardsStopped(event)}"
					@on-cancel="${() => this.renderMode = RENDER_MODE.CLIENT_PROFILE}">
				</horizon-stop-card>
			`;
		}
	}

	renderFooter() {
		if (this.selectedCardCount > 0) {
			return html`
				<button-bar row="4" column="1">
					<capitec-label label="${this.selectedCardCount.toString()} card(s) selected" type="subtitle"></capitec-label>
					<capitec-button label="Stop Card(s)"
									type="primary"
									@click="${() => this.renderMode = RENDER_MODE.CARD_STOP_MODAL}">
					</capitec-button>
				</button-bar>`;
		}
	}

	renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CLIENT_PROFILE }}"
				@on-reason-set="${async (reason) => this._onCallComplete(reason)}">
			</end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`stop-card`, StopCardComponent);