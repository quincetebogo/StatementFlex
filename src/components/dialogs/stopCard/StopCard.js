import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import { CardService } from '../../../services/CardService'

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
	}


	// --------------
	// EVENT HANDLERS
	// --------------	

	async _onConfirmClick() {
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
	async _stopCards(cardsToStop, callerInfo) {
		let cardService = new CardService();

		let cardStopResults = await cardService.stopCards(cardsToStop, callerInfo,
			() => this._toggleBusyFlag(),
			(ex) => this._stopCardErrorHandler(ex));

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
				margin-bottom: 48px;
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
				border-top:1px solid #dfdfdf;
			}

			capitec-modal {
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
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
					${this._renderConfirmStopCard()} 
					${this._renderLoadingIndicator()}
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div> 
			</capitec-modal>
			`;
	}

	_renderConfirmStopCard() {
		this.firstLine = true;
		return html`
		<capitec-group class="dialogSize" layout="vertical" gap="none">		
				<p class="first-line">Are you sure you want to stop:</p>
				${this.cardsToStop.map((line, index, cards) => { return this._renderLine(line, index, cards) })}
		</capitec-group>
		`;
	}

	_renderLine(line, index, cards) {
		let classes = this.firstLine ? 'top-margin left-margin' : 'left-margin'
		this.firstLine = false;

		return html`
		<p class="${classes}">${line.cardType} <span class="bold-text">${line.encryptedCardId}</span></p>
		<p class="left-margin">Reason: <span class="bold-text">${line.stopReason}</span></p>
		${this._renderGreyLine(index, cards)}
		`;
	}

	_renderGreyLine(index, cards) {
		if (index < (cards.length - 1)) {
			return html`<div class="line"></div>`
		}

		return html``;
	}

	_renderFooter() {
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

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-stop-card`, StopCard);