import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HttpStatusError } from 'platform/errors/HttpStatusError';

import { HorizonViewManager } from '../../HorizonViewManager';
import { StopCardService } from '../../services/StopCardService';

const RENDER_MODE = {
	CARD_STOP_FAILURE: 0,
	END_CALLSESSION: 1
};

export class StopCardFailure extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayNotification = false;
		this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;
		this.retry = 0;

		this.failedCards = [];
		this.cardStopResults = [];
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			RENDER_MODE: { type: Number },
			retry: { type: Number },
			isBusy: { type: Boolean },
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.stopCardService = StopCardService.getInstance();

		let state = this.horizonViewManager.recoverState();

		this.callerInfo = state.callerInfo;
		this.stoppedCards = state.stoppedCards;
		this.failedCards = this.stoppedCards.filter(cards => !cards.stopped)

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish('horizon-update-call_actionbar',
			{
				referenceNo: this.callerInfo.incidentReferenceNumber,
				phoneNumber: this.callerInfo.incomingTelephoneNumber
			});

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onToastDisplayTimeout() {
		this.displayNotification = true;
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	async _onTryAgain() {
		console.log(`cards to stop`, this.failedCards);
		this.retry++;

		this.isBusy = true;
		this.cardStopResults = await this._stopCards(this.failedCards, this.callerInfo);
		this.isBusy = false;

		if (this.retry === 3) {
			//for automatically calling assign modal.
		}
	}

	_renderAssignModal() {
		if (this.retry == 3) {
			//for manually calling the assign modal
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	//modifications to be done for calling StopCard service
	async _stopCards(failedCards, callerInfo) {
		let card = {};
		let success = false;
		let stoppedCard = {};
		let error = null;
		let cardStopResults = [];

		for (let index = 0; index < this.stoppedCards.length && !this.stoppedCards[index].stopped; index++) {

			card.incomingTelephoneNumber = callerInfo.incomingTelephoneNumber;
			card.voiceReferenceNumber = callerInfo.voiceReferenceNumber;
			card.ivrOptionCode = callerInfo.ivrOptionCode;
			card.incidentReferenceNumber = callerInfo.incidentReferenceNumber;
			card.agentTelephoneNumber = callerInfo.agentTelephoneNumber;
			card.cardId = this.stoppedCards[index].cardId;
			card.accountNumber = this.stoppedCards[index].accountNumber;
			card.stopReason = this.stoppedCards[index].reason ? this.stoppedCards[index].reason : '';

			try {
				await this.stopCardService.stopCard(card);
				failedCards[index].success = true;
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
				failedCards[index].success = false;
			}
			// finally {
			// 	stoppedCard = {
			// 		cardId: card.cardId,
			// 		cardType: failedCards[index].cardType,
			// 		encryptedCardId: failedCards[index].encryptedCardId,
			// 		accountNumber: card.accountNumber,
			// 		stopReason: card.stopReason,
			// 		stopped: success,
			// 		errorMessage: error
			// 	};

			// 	cardStopResults.push(stoppedCard);
			// }
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
				.title-bar-text {
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
				}			

				.failure-toast{
					position: absolute;
					top : 32px;
					left:784px;
					width : 352px;
					height: 64px;
				}

				.card-image {
					margin-top: 188px;
					align-self: center;
					height: 152px;
					width: 210px;
				}
				
				.network-error {
                    margin-top:36px;
					margin-bottom:24px;
					height: 36px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
                    text-align: center;
				}		
				  
				.stop-card-text {
					margin: 0px 0px 0px 0px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}	

				.bold-text{
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}				  

                .button-bar {
                    box-sizing: border-box;
                    height: 64px;
                    width: 1064px;
                    border: 1px solid #E1E1E1;
                    border-radius: 0 0 4px 4px;
                    background-color: #FFFFFF;
                    margin-top: 232px;
				}
				
				.card {
					height: 823px
				}

				.button-assign {
					--theme-button-padding-top: 8.5px;
					--theme-button-padding-bottom: 8.5px;
					width: 95px;
				}

				.button-tryAgain {
					--theme-button-padding-top: 8.5px;
					--theme-button-padding-bottom: 8.5px;
					--theme-button-padding-left: 23.18px;
					--theme-button-padding-right: 23.18px;
					margin-right: 24px;
				}
			`];
	}

	//partial development done for web template.
	_webTemplate() {
		return html`		
			<capitec-card class="card">
				<capitec-group class="card" layout="vertical" gap="none" style="width:100%;">
					${this._renderTitleBar()}
					${this._renderFailureToast()}
					${this._renderGraphic()}
					<p class="network-error">Network Error</p>
					${this.failedCards.map(line => {
			return this._renderStoppedCard(line)
		})}
					<p class="stop-card-text">Notify the client and try again.</p>
					${this._renderFooter()}
				</capitec-group>
			</capitec-card>
			${this._renderLoadingIndicator()}
			${this._renderEndCallModal()}
		`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar 
				class="title-bar-text"
				type="clear" 
				label="Stop Card" >
			</capitec-title-bar>`;
	}

	_renderFailureToast() {
		if (!this.displayNotification) {
			return html`
			<capitec-toast 
				class="failure-toast" 
				type="error" 
				header="Unsuccessful" 
				detail="An error has occured" 
				closable="true"
				@click="${() => this._onToastDisplayTimeout()}"
				>
			</capitec-toast>
		`;
		}
		return html``;
	}

	//image source to be changed.
	_renderGraphic() {
		return html`<img class="card-image" src="../../images/cardStop/cards.svg"/>`;
	}

	_renderStoppedCard(line) {
		return html`
        <p class="stop-card-text">Unable to stop ${line.cardType} <span class="bold-text">${line.accountNumber}.</span></p>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group class="button-bar" layout="horizontal" gap="clear" halign="right" valign="center">
                <capitec-button class="button-assign"
                                label="Assign"
						    	@click="${() => this._renderAssignModal()}">
				</capitec-button>
				<capitec-button class="button-tryAgain"
								type="primary"
								@click="${async () => this._onTryAgain()}"
								label="Try Again">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS }}"
				@on-reason-set="${(reason) => this._onCallComplete(reason)}">
			</end-call-session>`;
		}

		return html``;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

}

customElements.define('horizon-summary-failure', StopCardFailure);