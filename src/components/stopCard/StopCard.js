import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from '@cb/platform-web-core';

import 'platform/components';
import 'app/components/dialogs/stopCard/StopCardConfirm';

const COLUMNS = {
	CARDTYPE: `cardDisplayName`,
	CARDNUMBER: `maskedCardNumber`
};

const RENDER_MODE = {
	MAIN_PAGE: 0,
	CARD_STOP_MODAL: 1
};

const TABLE_STYLE = {
	HEADER_CELL: `width: 490px; font-size: 16px; font-weight: 600; letter-spacing: 0; line-height: 22px;`,
	BODY_CELL: `width: 490px; text-align: left; font-size: 16px; letter-spacing: 0; line-height: 22px;`,
	CELL_HEIGHT: `height: 22px; --theme-label-subtitle-font-weight: 600; --theme-label-font-color: #3A3A3A;
`,
	REASON_BUTTONS: `padding: 0px 0px 0px 14px; --theme-button-padding-top: 5.5px; --theme-button-padding-bottom: 5.5px; --theme-button-padding-left: 10px; --theme-button-padding-right: 10px; --theme-button-font-size: 14px;`
};

const DAMAGED = 0;
const LOST = 1;
const STOLEN = 2;
const SUSPECTED_FRAUD = 3;

const STOPREASONS = [
	 {
		key: `DAMAGED`,
		value: `Card Damaged`
	},
	 {
		key: `LOST`,
		value: `Card Lost`
	},
	 {
		key: `STOLEN`,
		value: `Card Stolen`
	},
	 {
		key: `SUSPECTED_FRAUD`,
		value: `Suspected Fraud`
	}
];

/**
 * The StopCard component is the main component of the Horizon Stop Card View.
 *
 * @export
 * @class StopCard
 * @extends {Component}
 */
export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.logger = Logger.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		// this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
		this.cardService = new CardService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.cards = null;
		this.selectedCardCount = 0;
		this.cardsToStop = [];
		this.isBusy = false;
		this.hasCardsAvailable = false;
		
		// Recover state information
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.isReassigned = this.horizonStore.getIsIncidentReassigned();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Array} cards - Client's card array
	 * @property {Object} incomingCallDetails - Incomming call information
	 *
	 * @readonly
	 * @static
	 * @memberof StopCard
	 */
	static get properties() {
		return {
			cards: { type: Array },
			incomingCallDetails: { type: Object },
			hasCardsAvailable: { type: Boolean },

			selectedCardCount: { type: Number, attribute: false },
			renderMode: { type: Number, attribute: false },
			cardsToStop: { type: Array, attribute: false },
			isBusy: { type: Boolean, attribute: false }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		/**
		* Add rowIndex, selected, stopReason fields to cards array. 
		* Logic to show/hide stop card reasons is based on rowIndex
		*/

		this.hasCardsAvailable = this.cards.length > 0;

		this.addFieldsToCardsArray();

		this._updateLeftBar();
		
		this._telemetry.startSpan(QuickTransactionEvents.STOP_CARD, {
			"screen": TelemetryScreen.STOP_CARD
		});
	}

	disconnectedCallback() {
		// this.verifySub.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/*
	 * Not used for now, will be used when we are going to implement table group by
	 */
	_customGroupByHandler(renderSet) {
		renderSet.items = renderSet.items.filter(x => !x.group);

		const groupedValues = Utilities.groupBy(this.cards, renderSet.strategy.groupField);

		const newRows = [];

		for (const key in groupedValues) {
			if (Object.prototype.hasOwnProperty.call(groupedValues, key)) {

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

	_onClickReason(cardStopReason, rowData) {
		rowData.cardStopReason = cardStopReason;

		// After mutating the this.cards array, request an update in order to trigger rendering.
		// Mutating fields in an object will not be noticed otherwise.
		this.cards[rowData.rowIndex].cardStopReason = cardStopReason;
		this.requestUpdate();
	}

	_onStopCards() {
		this.cardsToStop = this.cards.map(card => (
			{
				cardDisplayName: card.cardDisplayName,
				cardExpiryMonth: card.cardExpiryMonth,
				cardExpiryYear: card.cardExpiryYear,
				cardNumber: card.cardNumber,
				cardSequenceNumber: card.cardSequenceNumber,
				cardStopReason: card.selected ? card.cardStopReason : ``,
				maskedCardNumber: card.maskedCardNumber,
				supplementaryCard: card.supplementaryCard
			}
		)).filter(card => card.cardStopReason !== ``);
		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;

		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARDS_CLICK, {
			"screen": TelemetryScreen.STOP_CARD,
			"cards": this.cardsToStop.map(card => (
				{
					cardId: card.cardNumber,
					maskedCardNr: card.maskedCardNumber,
					reason: card.cardStopReason
				}
			))
		});
	}

	_confirmedStoppingCardsClick(event) {
		this.dispatchEvent(new CustomEvent(
			`cards-stopped`,
			{
				detail: {
					stoppedCards: event.detail.stoppedCards
				}
			}
		));
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
  }
	
	_handleChannelServiceError() {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	addFieldsToCardsArray() {
		this.cards.map((card, index) => {
			card.rowIndex = index;
			card.selected = false;
			card.cardType = card.supplementaryCard ? `Supplementary Cards` : ``;
			card.cardStopReason = STOPREASONS[LOST];
			return card;
		});
	}

	_back() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);
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
					height: 876px;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
					--theme-label-title-font-weight: 600;
					--theme-label-title-font-size: 24px;
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
					padding: 12px 0px 0px 10px;
				}
				capitec-table {
					width: 100%;
					height: 658px;
					margin-top: 8px;  
					--theme-data-table-body-group-font-weight: 600;
					--theme-data-table-body-group-padding-top: 0px;
					--theme-data-table-body-group-padding-bottom: 0px;
					--theme-data-table-body-group-color: #3A3A3A;
				
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
				capitec-button[type="clear"] {
					--theme-button-clear-font-weight: 600;
					--theme-button-clear-font-size: 16px;
				}
				capitec-button[type="clear"]:hover {
					--theme-button-clear-font-weight: 600;
					--theme-button-clear-font-size: 16px;
					--theme-button-clear-font-color: #3A3A3A;
					--theme-button-clear-background-color: #E5F5FB; 
				}
				capitec-button[type="clear"]:focus {
					--theme-button-clear-font-weight: 600;
					--theme-button-clear-font-size: 16px;
					--theme-button-clear-font-color: #009DE0;
					--theme-button-clearbackground-color: #E5F5FB; 
				}
				.bold-text {
					font-family: "Hind Vadodara";
					font-weight: 600;
					letter-spacing: 0;
				}
				capitec-alert-banner {
					width: 1032px;
					height: 48px;
					margin: 16px 16px 16px 16px;
				}
				img {
					cursor: pointer;
				}
				capitec-image {
					margin: 109px 406px 0px 406px;
					width: 252px;
					height: 182px;
				}
				.client-has-no-card {
					margin: 15px 0px 16px;
					--theme-label-font-color: #3A3A3A;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="stop-card">
				<capitec-group layout="grid" gap="none" row="auto" columns="uniform" style="width:100%;">
			
					${this._renderTitleBar()}
					${this._renderStopCardContent()}

				</capitec-group>
			</capitec-card>
			${this._renderStopCardModal()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar 
					type="clear" 
					row="1" 
					column="1">
						<img 
							data-automation-id="stop-card-back"
							src="/images/insure/blue-left-arrow.svg" 
							@click="${() => this._back()}"/>
						<capitec-label 
							label="Stop Card(s)"
							type="title">
						</capitec-label>
			</capitec-title-bar>`;
	}

	_renderStopCardContent() {
		return this.hasCardsAvailable
		? html`
			${this._renderNotifyClient()}
			${this._renderCardDetails()}
			${this._renderFooter()}`
		: html`
			<capitec-image src="platform/illustrations/cards.svg"></capitec-image>
			<capitec-label type="title" class="client-has-no-card" label="Client has no cards to fulfill this transaction"></capitec-label>
		`;
	}

	_renderNotifyClient() {
		return html`
			<capitec-alert-banner type="info">
				<span class="bold-text">Notify client:</span> Once card has been stopped you will need to visit a branch for a new card. You can also order a new card on the app from 15 May 2021
			</capitec-alert-banner>`;
	}

	_renderCardDetails() {
		return html`
			<capitec-table 
					row="3" column="1" 
					groupField="cardType"
					.dataHandler="${(renderSet) => this._customGroupByHandler(renderSet)}">
				<capitec-table-column
					label="" 
					field="" 
					type="text" 
					size="1064px;"
					.renderer="${(rowData) => this._renderRowData(rowData)}" 
					.headerRenderer="${() => this._headerRenderer()}">
				</capitec-table-column>
			</capitec-table>
			`;

	}

	_headerRenderer() {
		return html`
			<capitec-group layout="grid" rows="auto" columns="uniform" gap="none" style="${TABLE_STYLE.CELL_HEIGHT}">
				<div row="1" column="2" style="${TABLE_STYLE.HEADER_CELL}">
					<capitec-label 
						label="Card Type"
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

	/**
	 * @param {Object} rowData - A row of data to render
	 * @memberof StopCard
	 * @returns {html} HTML for a row of data
	 */
	_renderRowData(rowData) {
		return html`
			<capitec-group layout="grid" rows="auto" columns="uniform" gap="none"
				style="${rowData.selected ? `height: 70px` : `height: 22px;`}">
				${this._renderRowInput(rowData)}
				<div row="1" column="2" style="${TABLE_STYLE.BODY_CELL}">
					<capitec-label 
						data-automation-id="stop-card-type"
						label="${rowData[COLUMNS.CARDTYPE].split(`_`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)}"
						style="${TABLE_STYLE.CELL_HEIGHT}">
					</capitec-label>
				</div>
				<div row="1" column="3" style="${TABLE_STYLE.BODY_CELL}">
					<capitec-label 
						data-automation-id="stop-card-number"
						label="${rowData[COLUMNS.CARDNUMBER]}"
						style="${TABLE_STYLE.CELL_HEIGHT}">
					</capitec-label>
				</div>
				${this._renderReasonButtons(rowData)}
			</capitec-group>`;
	}

	_renderRowInput(rowData) {
		return html`
			<div 
					row="1" 
					column="1" 
					style="width: 35px; height: 22px;">
				<capitec-check 
					data-automation-id="stop-card-select"
					label="" 
					style="--theme-check-width: 21px; --theme-check-height: 21px;"
					@value-changed="${(e) => this._valueChanged(e, rowData)}">
				</capitec-check>
			</div>`;
	}

	_renderReasonButtons(rowData) {
		if (rowData.selected) {
			return html`
					<div row="2" column="2" colspan="2" style="display: flex; align-items: center;">
						<capitec-label label="Choose a Reason" 
									   style="line-height: 21px; width: 102px;">
						</capitec-label>
						<capitec-button type="clear" label="Card Damaged"
										data-automation-id="stop-card-damaged"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										.disabled="${rowData.cardStopReason === STOPREASONS[DAMAGED]}"
										@click="${(e) => this._onClickReason(STOPREASONS[DAMAGED], rowData)}">
						</capitec-button>
						<capitec-button type="clear" label="Card Lost"
										data-automation-id="stop-card-lost"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										.disabled="${rowData.cardStopReason === STOPREASONS[LOST]}"
										@click="${(e) => this._onClickReason(STOPREASONS[LOST], rowData)}">
						</capitec-button>
						<capitec-button type="clear" label="Card Stolen"
										data-automation-id="stop-card-stolen"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										.disabled="${rowData.cardStopReason === STOPREASONS[STOLEN]}"
										@click="${(e) => this._onClickReason(STOPREASONS[STOLEN], rowData)}">
						</capitec-button>
						<capitec-button type="clear" label="Suspected Fraud"
										data-automation-id="stop-card-fraud"
										style="${TABLE_STYLE.REASON_BUTTONS}"
										.disabled="${rowData.cardStopReason === STOPREASONS[SUSPECTED_FRAUD]}"
										@click="${(e) => this._onClickReason(STOPREASONS[SUSPECTED_FRAUD], rowData)}">
						</capitec-button>
					</div>`;
		}
	}

	_renderStopCardModal() {
		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {
			return html`
				<horizon-stop-card-confirm
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.cardsToStop="${this.cardsToStop}"
					@on-confirm="${(event) => this._confirmedStoppingCardsClick(event)}"
					@on-cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-stop-card-confirm>
			`;
		}
	}

	_renderFooter() {
		if (this.selectedCardCount > 0) {
			return html`
				<button-bar row="4" column="1">
					<capitec-label 
						data-automation-id="stop-card-selected-card-count"
						label="${this.selectedCardCount.toString()} card(s) selected" type="subtitle">
					</capitec-label>
					<capitec-button 
						data-automation-id="stop-card-stop-cards"
						label="Stop Card(s)"
						type="primary"
						@click="${() => this._onStopCards()}">
					</capitec-button>
				</button-bar>`;
		}
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="stop-card-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
	
}

customElements.define(`horizon-stop-card`, StopCard);