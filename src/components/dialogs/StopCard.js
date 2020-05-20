import { Component, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

export class StopCard extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.cardsToStop = [];
		this.cardStopResults = [];
		this.callerInfo = {};
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

		this.stopCardService = StopCardService.getInstance();
	}


	// --------------
	// EVENT HANDLERS
	// --------------	

	async _onConfirmClick() {
		console.log(`cards to stop`, this.cardsToStop);

		this.isBusy = true;
		this.cardStopResults = await this._stopCards(this.cardsToStop, this.callerInfo);
		this.isBusy = false;

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
		let success = false;
		let stoppedCard = {};
		let error = null;
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
				await this.stopCardService.stopCard(card);
				success = true;
				error = null;
			}
			catch (ex) {
				if (ex instanceof TypeError) {
					error = ex.message;
				}
				else if (ex instanceof HttpStatusError) {
					error = `${ex.status}: ${ex.message}`;
				}
				else {
				}
				success = false;
			}
			finally {
				stoppedCard = {
					cardId: card.cardId,
					cardType: cardsToStop[index].cardType,
					encryptedCardId: cardsToStop[index].encryptedCardId,
					accountNumber: card.accountNumber,
					stopReason: card.stopReason,
					stopped: success,
					errorMessage: error
				};

				cardStopResults.push(stoppedCard);
			}
		}

		return cardStopResults;
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

	render() {
		return html`
			<capitec-modal
				type="free"
				header="Stop Card"
				header-align="left">
				<div slot="body">
					${this.renderConfirmStopCard()} 
				</div>
				<div slot="footer">
					${this.renderFooter()}
				<div> 
			</capitec-modal>
			${this.renderLoadingIndicator()}
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