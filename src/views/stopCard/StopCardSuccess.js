import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';

const RENDER_MODE = {
	CARD_STOP_SUCCESS: 0,
	END_CALLSESSION: 1,
	VERIFY_NOW: 2
};

/**
 * Display an confirmation/success screen indicating which cards have been successfully stopped.
 * 
 * @export
 * @class StopCardSuccess
 * @extends View
 */
export class StopCardSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayNotification = false;
		this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS;
		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			renderMode: { type: Number },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.stoppedCards = [];

		const state = this.horizonStore.recoverState();

		if (state) {
			this.incidentDetails = this.horizonStore.getIncidentDetails();
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.callerInformation = this.horizonStore.getCallerInformation();
			
			this.stoppedCards = state.stoppedCards;

			this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
			this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		}

		this.cardService = new CardService(
			() => this._toggleBusyFlag(),
			(ex) => this._stopCardErrorHandler(ex)
		);

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
		this._updateIncidentState();
	}

	disconnectedCallback() {
		HorizonTelemetry.instance.screenUnloadStopCard();

		if (this.verifySub) {
			this.verifySub.dispose();
		}
		
		if (this.endCallSub) {
			this.endCallSub.dispose();
		}

		super.disconnectedCallback();
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

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_verifyClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS;
	}

	 _clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
        this._updateLeftBar();
		this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS;
	}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);

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
  
	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);
	}  

	_doneClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	async _returnToStopCardClick() {
		const confirmedCaller = {
			idNumber: this.callerInformation.southAfricanIDNumber,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: `StopCard`,
			incidentReferenceNumber: this.incomingCallDetails.incidentReferenceNumber,
			incidentRecId: this.incomingCallDetails.incidentRecId,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			nonClientFullName: this.callerInformation.nonClientFullName,
			nonClientCellPhone: this.callerInformation.nonClientCellPhone,
			nonClientIDNumber: this.callerInformation.nonClientIDNumber,
			nonClientRelationship: this.callerInformation.nonClientRelationship
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller);

		if (returnValue.succeeded) {
			this.incomingCallDetails.ivrOptionCode = `StopCard`;
			this.incomingCallDetails.ivrOption.value = `StopCard`;

			this.horizonStore.saveState({
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation,
				clientProfileDetails: returnValue.result
			});
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	_stopCardErrorHandler(exception) {
		return true;
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
				};
				
				.card-image {
					margin: auto;
				}
				
				.card-stopped {
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
					font-weight: 600;
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
					margin:22px 0px 23px 22px;
				}

				.button-margin{
					height: 104px;
					width: 242px;
					margin-right:16px;
				}

				.status-group{
					width: auto;
					height: 26px;
					flex-wrap: wrap;
					justify-content: center;
					margin: 0px auto 36px;
                    display:block;
				}

				.card-status-success{
					height: 26px;
					width: auto;
					display: flex;
					align-items: center;
					margin: 0px 0px 0px 15px;
				}

				capitec-icon{
					height: 26px;
					width: 26px;
				}
				
				.card-status-text {
					height: 24px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: start;
					margin: 0px 0px 0px 7px;
				}

				#id-button-group {
					justify-content: center;
					margin-top: 16px;
				}
			`
];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		<capitec-card>
			<capitec-group layout="vertical" gap="none" style="width:100%;">
				${this._renderTitleBar()}
				${this._renderSuccessToast()}
				${this._renderGraphic()}
				<p class="card-stopped">Card Stopped</p>
				${this._renderStoppedCards()}
				<p class="stop-card-text">Please visit a branch to get a new card.</p>
				${this._renderButtons()}
				${this._renderRelatedOptions()}
				${this._renderOptionsButtons()} 
				${this._renderVerifyNowModal()}
				${this._renderEndCallModal()}
				${this._renderLoadingIndicator()}
			</capitec-group>
		</capitec-card>`;
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar 
				class="title-bar-text"
				type="clear" 
				label="Stop Card" >
			</capitec-title-bar>`;
	}

	_renderNotifyClient() {
		// For some reason ?hidden boolean attribute does not want to work on the div 
		return html`
			<div 
				style="visibility:${!this.displayNotification ? `hidden` : `visible`}"
				class="horizon-notify-client">
				<img 
					src="/images/info.svg" 
					id="action-icon" 
					/>
				<p id="action-display">&nbsp;See related options to assist if the client needs to stop their Remote Banking (app/USSD) channels</p>
			</div>`;
	}

	_renderGraphic() {
		return html`<img class="card-image" style="margin: 100px auto auto auto;" width="252" height="182" src="/images/cardStop/cards.svg"/>`;
	}

	_renderStoppedCards() {
		return html`
                <div class="status-group">
    				${this.stoppedCards.map((card) => this._renderSuccessStatus(card))}
	    		</div>
		`;
	}

	_renderButtons() {
		return html`
		<capitec-group id="id-button-group" layout="horizontal">
			<capitec-button class="button" label="Done" @click="${() => this._doneClick()}"></capitec-button>
			<capitec-button class="button" type="primary" label="Return to Stop Card" @click="${() => this._returnToStopCardClick()}"></capitec-button>
		</capitec-group>`;
	}

	_renderSuccessStatus(card) {
		return html`
			 <div class="card-status-success">
				<capitec-icon size="medium" icon="status/success-trans"></capitec-icon>
				<p class="card-status-text">
					${card.cardDisplayName.split(`_`).map(w=> w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)} <b>${card.maskedCardNumber}</b> was stopped successfully
				</p>
			</div>
		`;
	}

	_renderRelatedOptions() {
		return html`
		<div class="related-options">
			<p class="related-options-text">Related Options</p> 
		</div>`;
	}

	_renderOptionsButtons() {
		return html`
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button class="button-margin" label="Remote Banking Channels" img-src="/images/access.svg"></horizon-option-button>
				<horizon-option-button class="button-margin" label="Card Skimming Case" img-src="/images/cards.svg"></horizon-option-button>
				<horizon-option-button class="button-margin" label="ATM Withdrawal Dispute" img-src="/images/atm.svg"></horizon-option-button>
				<horizon-option-button class="button-margin" label="Find A Branch" img-src="/images/atm.svg"></horizon-option-button>
			</capitec-group>
			`;
	}

	_renderSuccessToast() {
		if (!this.displayNotification) {
			return html`
			<capitec-toast 
				class="success-toast" 
				type="success" 
				header="Successfull" 
				detail="Debit card stopped" 
				closable
				@click="${() => this._onToastDisplayTimeout()}"
				>
			</capitec-toast>
		`;
		}
		return html``;
	}

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<horizon-end-call-session
				.incidentDetails="${this.incidentDetails}"
				.incomingCallDetails ="${this.incomingCallDetails}"
				endCallContext="LandingPage"
				@cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}

customElements.define(`horizon-stop-card-success`, StopCardSuccess);