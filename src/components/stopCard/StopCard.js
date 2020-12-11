import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Utilities } from '@cb/platform-web-core';

import 'platform/components';

import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/stopCard/StopCardConfirm';

const COLUMNS = {
	CARDTYPE: `cardDisplayName`,
	CARDNUMBER: `maskedCardNumber`
};

const RENDER_MODE = {
	CLIENT_PROFILE: 0,
	CARD_STOP_MODAL: 1,
	CARD_STOP_SUCCESS: 2,
	END_CALLSESSION: 3,
	ASSIGN: 4,
	ASSIGN_REASON_SELECTED: 5
};

const TABLE_STYLE = {
	HEADER_CELL: `width: 490px; font-size: 16px; font-weight: 600; letter-spacing: 0; line-height: 22px;`,
	BODY_CELL: `width: 490px; text-align: left; font-size: 16px; letter-spacing: 0; line-height: 22px;`,
	CELL_HEIGHT: `height: 22px`,
	REASON_BUTTONS: `padding: 0px 0px 0px 14px; --theme-button-padding-top: 5.5px; --theme-button-padding-bottom: 5.5px; --theme-button-padding-left: 10px; --theme-button-padding-right: 10px; --theme-button-font-size: 14px;`
};

const STOPREASONS = {
	CARD_DAMAGED: `DAMAGED`,
	CARD_LOST: `LOST`,
	CARD_STOLEN: `STOLEN`,
	SUSPECTED_FRAUD: `SUSPECTED_FRAUD`
};

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

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());
		this.eventAggregator.subscribe(`confirmed-stop`, () => this.renderStopCardModal(rowData));

		this.renderMode = RENDER_MODE.CLIENT_PROFILE;
		this.cards = null;
		this.selectedCardCount = 0;
		this.cardsToStop = [];
		this.isReassigned = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} clientProfileDetails - Information on confirmed client.
	 *
	 * @readonly
	 * @static
	 * @memberof StopCard
	 */
	static get properties() {
		return {
			clientProfileDetails: { type: Object },
			incomingCallDetails: { type: Object },
			cards: { type: Array },
			selectedCardCount: { type: Number },
			renderMode: { type: Number },
			cardsToStop: { type: Array }
		};
	}


	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.instruction = this.clientProfileDetails.instruction;
		this.cards = this.clientProfileDetails.cards;

		/**
		* Add rowIndex, selected, stopReason fields to cards array. 
		* Logic to show/hide stop card reasons is based on rowIndex
		*/
		this.addFieldsToCardsArray();

		// The End Call Modal is using a different modal to the Stop Card Modal
		this.endCallCallerInfo = {
			ivrOption: {
				possibleValues: this.incomingCallDetails.ivrOption,
				value: this.incomingCallDetails.ivrOptionCode
			},
			ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber
		};

		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
				isUnverifiedNumber: this.incomingCallDetails.isUnverifiedNumber
			}
		);

		this.eventAggregator.publish(`horizon-update-mini-profile`, {
				name: this.clientProfileDetails.clientPersonalInformation.value.name.value,
				idNumber: this.clientProfileDetails.clientPersonalInformation.value.southAfricanIDNumber.value,
				phoneNumber: this.clientProfileDetails.clientPersonalInformation.value.verifiedTelephoneNumber.value,
				livesIn: this.clientProfileDetails.clientPersonalInformation.value.livesIn.value,
				languagePreference: this.clientProfileDetails.clientPersonalInformation.value.languagePreference.value,
				birthday: this.clientProfileDetails.clientPersonalInformation.value.birthdate.value,
				isConfirmed: true,
				isVerified: false,
				verificationFailed: false,
				is3rdParty: false
			});

		this.eventAggregator.publish(
			`horizon-update-left-hand-bar`,
			{
				hasFavourites: true,
				subtitle: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				},
				detail: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				}
			}
		);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/*
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

	_onAssignReasonSelected(e) {
		this.assignReason = e.detail.reason;
		this.renderMode = RENDER_MODE.ASSIGN_REASON_SELECTED;
	}

	_onEndCallSession() {
		this.isReassigned = false;
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	_toggleBusyFlag() {
		// Only used for Call Completion at present.
		// May be implemented later to render progress on endCall method
	}

	_onHandOff(e) {
		this.isReassigned = true;
		this.renderMode = RENDER_MODE.END_CALLSESSION;
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
			card.cardStopReason = STOPREASONS.CARD_LOST;
			return card;
		});
	}

	_onAssignIncident() {
		// Assign reasons for stopcard flow needs to be updated--used Insure Assign reasons dialog for now.
		this.renderMode = RENDER_MODE.ASSIGN;
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
				}`
			];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="stop-card">
				<capitec-group layout="grid" gap="none" row="auto" columns="uniform" style="width:100%;">
			
					${this._renderTitleBar()}
					${this._renderNotifyClient()}
					${this._renderCardDetails()}
					${this._renderFooter()}
			
				</capitec-group>
			</capitec-card>
			${this._renderEndCallModal()}
			${this._renderStopCardModal()}
			${this._renderAssignModal()}
		`;
	}

	_renderTitleBar() {
		return html`<capitec-title-bar type="clear" 
									   label="Stop Card" 
									   row="1" 
									   column="1">
</capitec-title-bar>`;
	}

	_renderNotifyClient() {
		return html`
			<div class="horizon-notify-client" row="2" column="1">
				<img src="/images/info.svg" id="action-icon" />
				<p id="action-display">&nbsp;${this.instruction}</p>
			</div>`;
	}

	_renderCardDetails() {
		return html`
				<capitec-table .items="${this.cards}" row="3" column="1">
					<capitec-table-column label=""
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
						<capitec-button label="Card Damaged"
										style="${TABLE_STYLE.REASON_BUTTONS}"
							.disabled="${rowData.cardStopReason === STOPREASONS.CARD_DAMAGED}"
							@click="${(e) => this._onClickReason(STOPREASONS.CARD_DAMAGED, rowData)}">
						</capitec-button>
						<capitec-button label="Card Lost"
										style="${TABLE_STYLE.REASON_BUTTONS}"
							.disabled="${rowData.cardStopReason === STOPREASONS.CARD_LOST}"
							@click="${(e) => this._onClickReason(STOPREASONS.CARD_LOST, rowData)}">
						</capitec-button>
						<capitec-button label="Card Stolen"
										style="${TABLE_STYLE.REASON_BUTTONS}"
							.disabled="${rowData.cardStopReason === STOPREASONS.CARD_STOLEN}"
							@click="${(e) => this._onClickReason(STOPREASONS.CARD_STOLEN, rowData)}">
						</capitec-button>
						<capitec-button label="Suspected Fraud"
										style="${TABLE_STYLE.REASON_BUTTONS}"
							.disabled="${rowData.cardStopReason === STOPREASONS.SUSPECTED_FRAUD}"
							@click="${(e) => this._onClickReason(STOPREASONS.SUSPECTED_FRAUD, rowData)}">
						</capitec-button>
					</div>`;
		}
	}

	_renderStopCardModal() {
		if (this.renderMode === RENDER_MODE.CARD_STOP_MODAL) {
			return html`
				<horizon-stop-card-confirm
					.incomingCallDetails="${this.incomingCallDetails}"
					.cardsToStop="${this.cardsToStop}"
					@on-confirm="${(event) => this._confirmedStoppingCardsClick(event)}"
					@on-cancel="${() => this.renderMode = RENDER_MODE.CLIENT_PROFILE}">
				</horizon-stop-card-confirm>
			`;
		}
	}

	_renderFooter() {
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

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<horizon-end-call-session
				.incomingCallDetails = "${this.incomingCallDetails}"
				endCallContext="LandingPage"
				.isReassigned = "${this.isReassigned}"
				@cancel="${() => this.renderMode = RENDER_MODE.CLIENT_PROFILE}">
			</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderAssignModal() {
		if (this.renderMode === RENDER_MODE.ASSIGN) {
			return html`
				<horizon-assign-stop-card
					.callerInfo=${this.callerInfo}
					.cards=${this.cards}
					@on-cancel="${() => { 
						this.renderMode = RENDER_MODE.CLIENT_PROFILE; 
					}}"
					@on-handoff="${(e) => this._onHandOff(e)}">
				</horizon-assign-stop-card>
			`;
		}
		return html``;
	}
}

customElements.define(`horizon-stop-card`, StopCard);