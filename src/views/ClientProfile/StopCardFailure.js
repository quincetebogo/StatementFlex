import { View, html, css} from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

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

    constructor(){
        super();
        this.displayNotification = false;
		this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;
		this.retry = 0;

		this.cardsToStop = [];
    }

    // --------------
    // PROPERTIES
    // --------------

    static get properties() { 
        return{
            displayNotification : {type : Boolean},
			RENDER_MODE : {type : Number},
			retry: {type: Number},
			isBusy: {type: Boolean},
			cardsToStop: {type: Array}
        }
    }

    // -------------------
	// LIFECYCLE OVERRIDES
    // -------------------
    
    connectedCallBack(){
        super.connectedCallBack();

        this.eventAggregator = EventAggregator.getInstance();
        this.horizonViewManager = HorizonViewManager.getInstance();

        let state = this.horizonViewManager.recoverState();

		this.callerInfo = state.callerInfo;
        this.stoppedCards = state.stoppedCards;
        this.failedCards = state.failedCards;

		this.stopCardService = StopCardService.getInstance();

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
		this.retry++;
		
		this.isBusy = true;
		this.cardStopResults = await this._stopCards(this.cardsToStop, this.callerInfo);
		this.isBusy = false;

		if(this.retry === 3) {
			//for automatically calling assign modal.
		}
	}

	_renderAssignModal() {
		if(this.retry == 3) {
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
			card.stopReason = cardsToStop[index].reason ? cardsToStop[index].reason : '';

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
			`];
	}
    
    //partial development done for web template.
    _webTemplate() {
		return html`		
			<capitec-card>
				<capitec-group layout="vertical" gap="none" style="width:100%;">
					${this._renderTitleBar()}
					${this._renderFailureToast()}
					${this._renderGraphic()}
                    <p class="network-error">Network Error</p>
					<p class="stop-card-text">Unable to stop card</p>
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
                <capitec-button 
                                label="Assign"
						    	@click="${() => this._renderAssignModal()}">
				</capitec-button>
				<capitec-button type="primary"
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