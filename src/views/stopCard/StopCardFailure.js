import { View, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import { HorizonRouter } from '../../shell/HorizonRouter';
import { HorizonStore } from '../../store/HorizonStore';
import { DesktopAgentService } from '../../services/DesktopAgentService';
import { HorizonChannelService } from '../../services/HorizonChannelService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { CardService } from '../../services/CardService';

import '../../components/dialogs/EndCallSession';

const RENDER_MODE = {
	CARD_STOP_FAILURE: 0,
	IN_PROGRESS: 1
};
const RENDER_DIALOG = {
	HANDOFF: 0,
	ENDCALL: 1
};
const MAX_ATTEMPT = 2;

export class StopCardFailure extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.desktopAgentService = DesktopAgentService.getInstance();
		this.cardsToStop = [];

		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);

		this.displayNotification = true;
		this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;
		this.renderDialog = -1;
		this.retry = 0;
		this.isReassigned = false;

		this.failedCards = [];

	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			renderMode: { type: Number },
			renderDialog: { type: Number },
			retry: { type: Number }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();
		this.channelService = HorizonChannelService.getInstance();

		let state = this.horizonStore.recoverState();

		if (state) {
			this.callerInfo = state.callerInfo;
			this.cardsToStop = state.stoppedCards;
			this.failedCards = this.cardsToStop.filter(cards => !cards.stopped);

			this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
			this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.callerInfo.incidentReferenceNumber,
				phoneNumber: this.callerInfo.incomingTelephoneNumber,
				ivrOptionCode: this.callerInfo.ivrOptionCode,
				isUnverifiedNumber: this.callerInfo.isUnverifiedNumber
			});
		}

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onToastDisplayTimeout() {
		this.displayNotification = false;
	}

	_onEndCallSession() {
		this.isReassigned = false;
		this.renderDialog = RENDER_DIALOG.ENDCALL;
	}

	async _onTryAgain() {
		console.log(`cards to stop`, this.failedCards);

		this.retry++;
		//Checking if max attempts exhausted, YES -> show Assign/HandOff dialog
		if (this.retry > MAX_ATTEMPT) {
			this.renderDialog = RENDER_DIALOG.HANDOFF;
			return;
		}

		//Toggling to InProgress
		this.renderMode = RENDER_MODE.IN_PROGRESS;
		this.cardsToStop = await this._stopCards(this.cardsToStop, this.callerInfo);

		//Toggling back to Network Error summary
		this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;

		let isAllSuccess = this.cardsToStop.every(cards => cards.stopped == true);
		if (isAllSuccess) {
			this.horizonStore.saveState({ callerInfo: this.callerInfo, stoppedCards: this.cardsToStop });
			this.horizonRouter.navigateToStoppedCards();
		}
	}

	async _onCallComplete(reason) {
		// Clear any state and return to landing page.
		this.horizonStore.saveState({});

		await this.serviceCallHelper.asyncCall(this.channelService.endCall(this.callerInfo.incidentRecId, reason.detail.endCallReason.key));
		this.desktopAgentService.callComplete();

		this.horizonRouter.navigateToLandingPage();
	}

	_onHandOff(e) {
		this.isReassigned = true;
		this.renderDialog = RENDER_DIALOG.ENDCALL;
	}

	_toggleBusyFlag() {
		// Only used for Call Completion at present.
		// May be implemented later to render progress on endCall method
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _stopCards(cardsToStop, callerInfo) {
		const cardService = new CardService();

		const cardStopResults = await cardService.stopCards(cardsToStop, callerInfo,
			() => this._toggleBusyFlag(),
			(ex) => this._stopCardErrorHandler(ex)
		);

		return cardStopResults;
	}

	_onAssignIncident() {
		this.renderDialog = RENDER_DIALOG.HANDOFF;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-title-bar {
					--theme-label-title-font-size : 24px;
					--theme-label-title-font-weight: 600;
				}			

				.failure-toast{
					position: absolute;
					top : 32px;
					left: 784px;
					width : 352px;
					height: 64px;
				}

				.card-image {
					margin-top: 188px;
					margin-left: 466px;
					align-self: center;
					height: 112px;
					width: 132px;
				}

				.card-image-inprogress {
					margin-top: 5px;
					align-self: center;
				}
				
				.network-error {
                    margin-top: 36px;
					margin-bottom: 24px;
					height: 36px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
                    text-align: center;
				}

				.status-group{
					width: auto;
					height: 26px;
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
					margin: 0px;
				}

				.card-status-success{
					height: 26px;
					width: auto;
					display: flex;
					align-items: center;
					margin: 0px 0px 0px 15px;
				}

				.card-status-error{
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

                .button-bar {
                    box-sizing: border-box;
                    height: 64px;
                    width: 1064px;
                    border: 1px solid #E1E1E1;
                    border-radius: 0 0 4px 4px;
                    background-color: #FFFFFF;
				}
				
				.card {
					height: 823px;
					width: 1064px;
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

				.section-content{
					height: 695px;
				}

				.text-font {
					font-size : 24px;
					font-weight: 600;
					text-align: center;
					margin-top: 400px;
				}

				.notify-client{
					height: 24px;
					width: 1064px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
					margin: 15px 0px 0px 0px;
				}
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.CARD_STOP_FAILURE:
				return html`
					<capitec-card class="card">
						<capitec-group class="card" layout="vertical" gap="none">
							${this._renderTitleBar()}
							${this._renderFailureToast()}
							<section class="section-content">
								${this._renderGraphic()}
								<p class="network-error">Network Error</p>
								${this._renderStoppedCards()}
								<p class="notify-client">Notify the client and try again.</p>
							</section>
							${this._renderFooter()}
						</capitec-group>
					</capitec-card>
					${this._renderEndCallModal()}
					${this._renderAssignModal()}
				`;
			case RENDER_MODE.IN_PROGRESS:
				return html`
					<capitec-card class="card">
						<p class="text-font">In Progress</p>
						${this._renderGraphicInProgress()}
					</capitec-card>
				`;
		}
	}

	_renderTitleBar() {
		return html`
			<capitec-title-bar
				type="clear" 
				label="Stop Card">
			</capitec-title-bar>`;
	}

	_renderFailureToast() {
		if (this.displayNotification) {
			return html`
			<capitec-toast 
				class="failure-toast" 
				type="error" 
				header="Unsuccessful" 
				detail="An error has occured" 
				closable
				@click="${() => this._onToastDisplayTimeout()}">
			</capitec-toast>
		`;
		}
		return html``;
	}

	_renderGraphic() {
		return html`<img class="card-image" src="../../images/cardStop/network-error.svg"/>`;
	}

	_renderStoppedCards() {
		return html`
			<div class="status-group">
				${this.cardsToStop.map((card) => { return this._renderCardStatus(card) })}
			</div>
		`;
	}

	_renderCardStatus(card) {
		if (card.stopped) {
			return html`${this._renderSuccessStatus(card)}`;
		}
		else {
			return html`${this._renderErrorStatus(card)}`;
		}
	}

	_renderSuccessStatus(card) {
		return html`
			<div class="card-status-success">
				<capitec-icon size="medium" icon="status/success"></capitec-icon>
				<p class="card-status-text">
					${card.cardType} <b>${card.encryptedCardId}</b> was stopped successfully
				</p>
			</div>
		`;
	}

	_renderErrorStatus(card) {
		return html`
			<div class="card-status-error">
				<capitec-icon size="medium" icon="status/error"></capitec-icon>
				<p class="card-status-text">
					Unable to stop ${card.cardType} <b>${card.encryptedCardId}</b>
				</p>
			</div>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group class="button-bar" layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button class="button-assign"
								label="Assign"
								@click="${() => this.renderDialog = RENDER_DIALOG.HANDOFF}">
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
		if (this.renderDialog == RENDER_DIALOG.ENDCALL) {
			return html`
			<horizon-end-call-session
				@on-cancel="${() => { this.renderDialog = -1 }}"
				@on-reason-set="${(reason) => this._onCallComplete(reason)}"
				.incomingCallDetails = "${this.callerInfo}"
				.isReassigned = "${this.isReassigned}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

	_renderAssignModal() {
		if (this.renderDialog == RENDER_DIALOG.HANDOFF) {
			return html`
				<horizon-assign-stop-card
					.callerInfo=${this.callerInfo}
					.cards=${this.failedCards}
					@on-cancel="${() => { this.renderDialog = -1 }}"
					@on-handoff="${(e) => this._onHandOff(e)}">
				</horizon-assign-stop-card>
			`;
		}

		return html``;
	}

	_renderGraphicInProgress() {
		return html`<img class="card-image-inprogress" src="../../images/cardStop/in-progress.svg"/>`;
	}
}

customElements.define(`horizon-summary-failure`, StopCardFailure);