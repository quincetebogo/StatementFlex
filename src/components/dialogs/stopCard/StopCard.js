import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import { StopCardService } from '../../../services/StopCardService';
import { ServiceCallHelper } from '../../../utils/serviceCallHelper';

export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.cardsToStop = [];
		this.cardStopResults = [];
		this.callerInfo = {};
		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			callerInfo: { type: Object },
			cardsToStop: { type: Array },
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();
		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);
	}


	// --------------
	// EVENT HANDLERS
	// --------------	

	async _onConfirmClick() {
		console.log(`cards to stop`, this.cardsToStop);

		this.cardStopResults = await this._stopCards(this.cardsToStop, this.callerInfo);

		this.dispatchEvent(new CustomEvent('on-confirm', { detail: { stoppedCards: this.cardStopResults } }));
	}

	_onCancelClick() {

		this.dispatchEvent(new CustomEvent('on-cancel'));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// TODO: This should move out into a layer so that we can use it in the code that handles stop card retries.
	async _stopCards(cardsToStop, callerInfo) {
		let card = {};
		let stoppedCard = {};
		let cardStopResults = [];

		for (let index = 0; index < cardsToStop.length; index++) {

			card.incomingTelephoneNumber = callerInfo.incomingTelephoneNumber;
			card.voiceReferenceNumber = callerInfo.voiceReferenceNumber;
			card.ivrOptionCode = callerInfo.ivrOptionCode;
			card.incidentReferenceNumber = callerInfo.incidentReferenceNumber;
			card.agentTelephoneNumber = callerInfo.agentTelephoneNumber;
			card.cardId = cardsToStop[index].cardId;
			card.accountNumber = cardsToStop[index].accountNumber;
			card.stopReason = cardsToStop[index].stopReason ? cardsToStop[index].stopReason : '';

			try {
				this.success = false;
				this.error = null;
				console.log('stopping card', card);
				let result = await this.serviceCallHelper.asyncCall(this.stopCardService.stopCard(card), (ex) => this._stopCardErrorHandler(ex));

				console.log('stop card result:', result);
			}
			finally {
				stoppedCard = {
					cardId: card.cardId,
					cardType: cardsToStop[index].cardType,
					encryptedCardId: cardsToStop[index].encryptedCardId,
					accountNumber: card.accountNumber,
					stopReason: card.stopReason,
					stopped: this.success,
					errorMessage: this.error
				};

				cardStopResults.push(stoppedCard);
			}
		}

		return cardStopResults;
	}

	_stopCardErrorHandler(exception) {
		try {
			this.error = 'Failed to stop card';

			console.log('stop card exception', exception);

			if (exception instanceof TypeError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `stopCard: ${exception.message}`
				}
				this.error = exception.message;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else if (exception instanceof HttpStatusError) {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `stopCard: ${exception.status} - ${exception.message}`
				}
				this.error = `${exception.status}: ${exception.message}`;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
			else {
				let event = {
					from: 'UI-CS',
					status: "error",
					message: `stopCard: UNEXPECTED ERROR - ${exception.message}`
				}
				this.error = exception.message;
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		}
		finally {
			this.success = false;
		}

		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			.dialogSize {
				width: 452px;
			}

			p{
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 16px;
				/*font-weight: 600;*/
				letter-spacing: 0;
				line-height: 24px;
			}

			.bold-text{
				color: #4E6066;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}

			.first-line {
				margin-top: 8px;
				margin-left:24px;
				height: 20px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 20px;
			  }			

			.left-margin{
				margin-top:0px;
				margin-left:24px;
			}

			.top-margin{
				margin-top:8px;
			}

			.line{
				margin: 16px 16px 16px 16px;
				width: 420px;
				border-top:1px solid #dfdfdf;"
			}

			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal
				type="free"
				header="Stop Card"
				header-align="left">
				<div slot="body">
					${this.renderConfirmStopCard()} 
					${this.renderLoadingIndicator()}
				</div>
				<div slot="footer">
					${this.renderFooter()}
				<div> 
			</capitec-modal>
			`;
	}

	renderConfirmStopCard() {
		this.firstLine = true;
		return html`
		<capitec-group class="dialogSize" layout="vertical" gap="none">		
				<p class="first-line">Are you sure you want to stop:</p>
				${this.cardsToStop.map((line, index, cards) => { return this.renderLine(line, index, cards) })}
		<apitec-group>
		`;
	}

	renderLine(line, index, cards) {
		let classes = this.firstLine ? 'top-margin left-margin' : 'left-margin'
		this.firstLine = false;

		return html`
		<p class="${classes}">${line.cardType} <span class="bold-text">${line.encryptedCardId}</span></p>
		<p class="left-margin">Reason: <span class="bold-text">${line.stopReason}</span></p>
		${this.renderGreyLine(index, cards)}
		`;
	}

	renderGreyLine(index, cards) {
		if (index < (cards.length - 1)) {
			return html`<div class="line"></div>`
		}

		return html``;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					type="clear"
					label="Cancel"
					@click="${() => { this._onCancelClick() }}">
				</capitec-button>

				<capitec-button
					id="id-confirm-button"
					type="primary"
					label="Confirm"
					@click="${async () => { this._onConfirmClick() }}">
				</capitec-button>
			</capitec-group>			
			`;
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-stop-card`, StopCard);