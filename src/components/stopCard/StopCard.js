import { Component, css, html } from 'platform/elements';
import { DesktopAgentService } from '../../services/DesktopAgentService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonChannelService } from '../../services/HorizonChannelService';
import { HorizonRouter } from '../../shell/HorizonRouter';
import { HorizonStore } from '../../store/HorizonStore';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { Utilities } from '@cb/platform-web-core';

import 'platform/components';

import '../dialogs/EndCallSession';
import '../dialogs/stopCard/StopCard';

/*
import '../dialogs/insure/AssignReasonDialog';
import '../dialogs/insure/AssignReasonSelected';
*/

import '../../components/common/HorizonRadioButtonsContainer';

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

export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.desktopAgentService = DesktopAgentService.getInstance();
		this.channelService = HorizonChannelService.getInstance();

		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`toggle-endcall-session`, () => this.toggleEndCall());
		this.eventAggregator.subscribe(`confirmed-stop`, () => this.renderStopCardModal(rowData));

		this.renderMode = RENDER_MODE.CLIENT_PROFILE;
		this.cards = null;
		this.selectedCardCount = 0;
		this.cardsToStop = [];
		this.isReassigned = false;

		this.confirmedCaller = null; // Actually the view manager state passed in from the parent component
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} confirmedCaller - Information on confirmed client.
	 *
	 * @readonly
	 * @static
	 * @memberof StopCard
	 */
	static get properties() {
		return {
			confirmedCaller: { type: Object },
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

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();

		this.serviceCallHelper = new ServiceCallHelper(
			() => { 
				this._toggleBusyFlag(); // ServiceCallHelper will toggle the busy flag
			}, 
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		const clientProfileDetails = this.confirmedCaller && this.confirmedCaller.clientProfileDetails;
		const incomingCallDetails = this.confirmedCaller && this.confirmedCaller.incomingCallDetails;

		this.instruction = clientProfileDetails.instruction;
		this.cards = clientProfileDetails.cards;

		/**
		* Add rowIndex, selected, stopReason fields to cards array. 
		* Logic to show/hide stop card reasons is based on rowIndex
		*/
		this.addFieldsToCardsArray();

		// Set up caller information for passing to Stop Card Modal
		this.callerInfo = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: incomingCallDetails.ivrOptionCode,
			incidentReferenceNumber: incomingCallDetails.incidentReferenceNumber,
			incidentRecId: incomingCallDetails.incidentRecId,
			agentTelephoneNumber: incomingCallDetails.agentTelephoneNumber,
			isUnverifiedNumber: incomingCallDetails.isUnverifiedNumber,
			ivrOption: incomingCallDetails.ivrOption
		};

		// The End Call Modal is using a different modal to the Stop Card Modal
		this.endCallCallerInfo = {
			ivrOption: {
				possibleValues: incomingCallDetails.ivrOption,
				value: incomingCallDetails.ivrOptionCode
			},
			ivrOptionCode: incomingCallDetails.ivrOptionCode,
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			incidentReferenceNumber: incomingCallDetails.incidentReferenceNumber,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			agentTelephoneNumber: incomingCallDetails.agentTelephoneNumber
		};

		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.callerInfo.incidentReferenceNumber,
				phoneNumber: this.callerInfo.incomingTelephoneNumber,
				ivrOptionCode: this.callerInfo.ivrOptionCode,
				isUnverifiedNumber: this.callerInfo.isUnverifiedNumber
			}
		);

		this.eventAggregator.publish(
			`mini-client-profile`,
			{
				name: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.name.value,
				idNumber: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.southAfricanIDNumber.value,
				phoneNumber: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.verifiedTelephoneNumber.value,
				livesIn: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.livesIn.value,
				languagePreference: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.languagePreference.value,
				birthday: this.confirmedCaller.clientProfileDetails.clientPersonalInformation.value.birthdate.value,
				isConfirmed: true
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
				cardNumber: card.cardNumber,
				maskedCardNumber: card.maskedCardNumber,
				cardDisplayName: card.cardDisplayName,
				cardStopReason: card.selected ? card.cardStopReason : ``
			}
		)).filter(card => card.cardStopReason !== ``);

		this.renderMode = RENDER_MODE.CARD_STOP_MODAL;
	}

	_onCardsStopped(event) {
		this.dispatchEvent(new CustomEvent(
			`cards-stopped`,
			{
				detail: {
					callerInfo: this.callerInfo,
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

	async _onCallComplete(reason) {
		// Clear any state and return to landing page.
		await this.serviceCallHelper.asyncCall(this.channelService.endCall(this.callerInfo.incidentRecId, reason.detail.endCallReason.key));
		this.desktopAgentService.callComplete();
		this.horizonStore.eraseState();
		this.horizonRouter.navigateToLandingPage();
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
				<img src="../../images/info.svg" id="action-icon" />
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
	 * @param {*} rowData
	 * @returns {Object}
	 * @memberof StopCard
	 */
	_renderRowData(rowData) {
		return html`<capitec-group layout="grid" rows="auto" columns="uniform" gap="none"
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
				<horizon-stop-card 
					.callerInfo="${this.callerInfo}"
					.cardsToStop="${this.cardsToStop}"
					@on-confirm="${(event) => this._onCardsStopped(event)}"
					@on-cancel="${() => this.renderMode = RENDER_MODE.CLIENT_PROFILE}">
				</horizon-stop-card>
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
				@on-cancel="${() => {
 					this.renderMode = RENDER_MODE.CLIENT_PROFILE; 
				}}"
				@on-reason-set="${async (reason) => this._onCallComplete(reason)}"
				.incomingCallDetails = "${this.endCallCallerInfo}"
				.isReassigned = "${this.isReassigned}">
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

	/*
	_renderAssignModal() {
		if (this.renderMode === RENDER_MODE.ASSIGN) {
			return html`
				<horizon-insure-assign-reason 
					@on-assign-reason=${(e) => this._onAssignReasonSelected(e)}
					@on-cancel="${() => { 
						this.renderMode = RENDER_MODE.CLIENT_PROFILE;
					}}">
				</horizon-insure-assign-reason>
			`;
		}
		return html``;
	}

	_renderAssignReasonSelected() {
		if (this.renderMode === RENDER_MODE.ASSIGN_REASON_SELECTED) {
			return html`<horizon-assign-reason-selected
						.selectedReason="${this.assignReason}"
						@on-cancel="${() => { 
							this.renderMode = RENDER_MODE.CLIENT_PROFILE;
						}}"
						@team-selected="${(e) => this._onHandOff(e)}">
					</horizon-assign-reason-selected>`;
		}
		return html``;
	}
	*/
}

customElements.define(`stop-card`, StopCard);