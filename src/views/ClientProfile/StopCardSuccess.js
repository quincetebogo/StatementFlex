import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { Router } from 'platform/Router';

import { HorizonViewManager } from '../../HorizonViewManager';
import '../../components/Common/HorizonOptionButton'
import '../../components/EndCallSessionReason';

const RENDER_MODE = {
	CARD_STOP_SUCCESS: 0,
	END_CALLSESSION: 1
};

export class StopCardSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayNotification = false;
		this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS;
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			renderMode: { type: Number }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------	

	connectedCallback() {
		super.connectedCallback();

		this.router = Router.getInstance();
		this.horizonViewManager = HorizonViewManager.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		let state = this.horizonViewManager.recoverState();

		this.callerInfo = state.callerInfo;
		this.stoppedCards = state.stoppedCards;

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish('horizon-update-call_actionbar',
			{
				referenceNo: this.callerInfo.incidentReferenceNumber,
				phoneNumber: this.callerInfo.incomingTelephoneNumber
			});

		window.setTimeout(() => this._onToastDisplayTimeout(), 1000);
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

	_onCallComplete() {
		// TODO: Web service calls to complete call

		// Clear any state and return to landing page.
		this / this.horizonViewManager.saveState({});
		this.router.navigateByPath(`/landingPage`);
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

				  .success-toast{
					position: absolute;
					top : 32px;
					left:784px;
					width : 352px;
					height: 64px;
				}
				  
				.horizon-notify-client{
					display: flex;
					flex-direction: row;
					width: 100%;
					height: 64px;
					background-color: rgba(8,166,181,0.15);
				}

				#action-icon{
					margin-left: 24px;
				}	
				
				#action-display{
					margin-top:20px;
					height: 24px;
					width: 774px;
					color: #08A6B5;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;					
				}	
				
				.card-image {
					margin-top: 41px;
				}
				
				.card-stopped {
					margin-top:36px;
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
					height: 20px;
					color: #4E6066;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				  }	
				  
				  .related-options {
					margin-top:152px;
					height: 32px;
					width: 100%;
					background-color: #F4F4F4;
					border-top: 1px solid #dfdfdf;
					border-bottom: 1px solid #dfdfdf;
				  }

				  .related-options-text{
					  margin: 0px 0px 0px 24px;
					  padding: 0px 0px 0px 0px;
					  color: #003652;
					  font-family: "Hind Vadodara";
					  font-size: 15px;
					  font-weight: 600;
					  letter-spacing: 0;
					  line-height: 30px;					  
				  }

				  .options-group{
					  margin:24px 0px 62px 24px;
				  }

				  .button-margin{
					  margin-right:16px;
				  }
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`		
		<capitec-card>
			<capitec-group layout="vertical" gap="none" style="width:100%;">
				${this.renderTitleBar()}
				${this.renderSuccessToast()}
				${this.renderNotifyClient()}
				${this.renderGraphic()}
				<p class="card-stopped">Card Stopped</p>
				${this.renderStoppedCards()}
				<p class="stop-card-text">Remind the client that they will need to visit a branch for a new card.</p>
				${this.renderRelatedOptions()}
				${this.renderOptionsButtons()} 
				${this.renderEndCallModal()}
			</capitec-group>
		</capitec-card>`;
	}

	/*
*/

	renderTitleBar() {
		return html`
			<capitec-title-bar 
				class="title-bar-text"
				type="clear" 
				label="Stop Card" >
			</capitec-title-bar>`;
	}

	renderNotifyClient() {
		// For some reason ?hidden boolean attribute does not want to work on the div 
		return html`
			<div 
				style="visibility:${!this.displayNotification ? "hidden" : "visible"}"
				class="horizon-notify-client">
				<img 
					src="../../images/info.svg" 
					id="action-icon" 
					/>
				<p id="action-display">&nbsp;See related options to assist if the client needs to stop their Remote Banking (app/USSD) channels</p>
			</div>`;
	}

	renderGraphic() {
		return html`<img class="card-image" src="../../images/cardStop/cards.svg"/>`;
	}

	renderStoppedCards() {

	}

	renderRelatedOptions() {
		return html`
		<div class="related-options">
			<p class="related-options-text">Related Options</p> 
		</div>`;
	}

	renderOptionsButtons() {
		return html`
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button class="button-margin" label="Remote Banking Channels" img-src="../../../images/access.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="Card Skimming Case" img-src="../../../images/cards.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="ATM Withdrawal Dispute" img-src="../../../images/atm.svg"></horizon-option-button>
				<horizon-option-button class="button-margin"label="Find A Branch" img-src="../../../images/atm.svg"></horizon-option-button>
			</capitec-group>
			`;
	}

	renderSuccessToast() {
		if (!this.displayNotification) {
			return html`
			<capitec-toast 
				class="success-toast" 
				type="success" 
				header="Successfull" 
				detail="Debit card stopped" 
				closable="true">
			</capitec-toast>
		`;
		}
		return html``;
	}

	renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<end-call-session
				@on-cancel="${() => { this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS }}"
				@on-reason-set="${(reason) => this._onCallComplete(reason)}">
			</end-call-session>`;
		}

		return html``;
	}

}

customElements.define(`horizon-summary-success`, StopCardSuccess);
