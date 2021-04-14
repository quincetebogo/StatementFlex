import { View, css, html } from 'platform/elements';
import { CardService } from 'app/services/CardService';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';

import 'app/components/dialogs/common/EndCallSession';
// import 'app/components/dialogs/insure/AssignReasonDialog';
// import 'app/components/dialogs/insure/AssignReasonSelected';
import 'app/components/dialogs/stopCard/AssignStopCard';

const RENDER_MODE = {
	CARD_STOP_FAILURE: 0,
	IN_PROGRESS: 1
};
const RENDER_DIALOG = {
	HANDOFF: 0,
	ENDCALL: 1,
	ASSIGN_REASON: 2,
	ASSIGN_REASON_SELECTED: 3
};
const MAX_ATTEMPT = 2;

/**
 * An error screen for informing the user of the failure to stop one or more cards
 *
 * @export
 * @class StopCardFailure
 * @extends {View}
 */
export class StopCardFailure extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.cardsToStop = [];

		this.cardService = new CardService(() => this._toggleBusyFlag(), null);

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
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();

		const state = this.horizonStore.recoverState();

		if (state) {
			this.callerInformation = state.callerInformation;
			this.incomingCallDetails = state.incomingCallDetails;
			this.incidentDetails = state.incidentDetails;

			if (state && Object.hasOwnProperty.call(state, `isReassigned`)) {
				this.isReassigned = state.isReassigned;
			} else {
				this.isReassigned = false;
			}
	
			this.stoppedCards = state.stoppedCards;
			this.failedCards = this.stoppedCards.filter(cards => !cards.cardStopped);

			this.assignSub = this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
			this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		}

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
	}

	disconnectedCallback() {
		HorizonTelemetry.instance.screenUnloadStopCard();

		if (this.assignSub) {
			this.assignSub.dispose();
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
		this.displayNotification = false;
	}

	_onEndCallSession() {
		this.renderDialog = RENDER_DIALOG.ENDCALL;
	}

	_onAssignReasonSelected(e) {
		this.assignReason = e.detail.reason;
		this.renderDialog = RENDER_DIALOG.ASSIGN_REASON_SELECTED;
	}

	async _onTryAgain() {
		console.log(`cards to stop`, this.failedCards);

		HorizonTelemetry.instance.stopCardTryAgain({screen: TelemetryScreen.STOP_CARD_OUTCOME});

		this.retry++;
		// Checking if max attempts exhausted, YES -> show Assign/HandOff dialog
		if (this.retry > MAX_ATTEMPT) {
			this.renderDialog = RENDER_DIALOG.HANDOFF;
			return;
		}

		// Toggling to InProgress
		this.renderMode = RENDER_MODE.IN_PROGRESS;

		const returnValue = await this.cardService.stopCards(this.failedCards, this.incomingCallDetails, this.incidentDetails, (ex) => this._stopCardErrorHandler(ex));
		
		if (returnValue.succeeded) {
			const cardStopResults = returnValue.result;

			this.failedCards = cardStopResults.filter(cards => !cards.cardStopped);

			// Toggling back to Network Error summary
			this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;
	
			const isAllSuccess = cardStopResults.every(cards => cards.cardStopped === true);
			if (isAllSuccess) {
				// The stop card incident can be closed if all cards were stopped successfully.
				// Otherwise we go to the failure screen where a retry can be attempted or an assignment done
				this.horizonStore.saveState({ callerInfo: this.callerInfo, stoppedCards: this.cardsToStop, stoppedCardsFailed: false });
				this.horizonRouter.navigateToStoppedCards();
			}
		}
	}

	_onHandOff(e) {
		HorizonTelemetry.instance.stopCardAssign({ screen: TelemetryScreen.STOP_CARD_OUTCOME });

		// On return from the Stop Card Assign dialog, mark the incident as assigned
        this.isReassigned = true;
		this.horizonStore.saveState({ isReassigned: this.isReassigned });
		this.horizonRouter.navigateToQuickTransactionFavourites();
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

	_onAssignIncident() {
        this.renderDialog = RENDER_DIALOG.ASSIGN_REASON;
        this.horizonRouter.navigateToStrack(this.incidentRecId);
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
			`
		];
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
					${this._renderAssignReason()}
					${this._renderAssignReasonSelected()}
				`;
			case RENDER_MODE.IN_PROGRESS:
				return html`
					<capitec-card class="card">
						<p class="text-font">In Progress</p>
						${this._renderGraphicInProgress()}
					</capitec-card>
				`;
			default:
				return html``;
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
		return html`<img class="card-image" src="/images/cardStop/network-error.svg"/>`;
	}

	_renderStoppedCards() {
		return html`
			<div class="status-group">
				${this.stoppedCards.map((card) => this._renderCardStatus(card))}
			</div>
		`;
	}

	_renderCardStatus(card) {
		if (card.cardStopped) {
			return html`${this._renderSuccessStatus(card)}`;
		}
		
		return html`${this._renderErrorStatus(card)}`;
	}

	_renderSuccessStatus(card) {
		return html`
			<div class="card-status-success">
				<capitec-icon size="medium" icon="status/success"></capitec-icon>
				<p class="card-status-text">
					${card.cardDisplayName} <b>${card.maskedCardNumber}</b> was stopped successfully
				</p>
			</div>
		`;
	}

	_renderErrorStatus(card) {
		return html`
			<div class="card-status-error">
				<capitec-icon size="medium" icon="status/error"></capitec-icon>
				<p class="card-status-text">
					Unable to stop ${card.cardDisplayName} <b>${card.maskedCardNumber}</b>
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
								@click="${() => this._onTryAgain()}"
								label="Try Again">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderEndCallModal() {
		if (this.renderDialog === RENDER_DIALOG.ENDCALL) {
			return html`
			<horizon-end-call-session
				.incidentDetails="${this.incidentDetails}"
				.incomingCallDetails = "${this.incomingCallDetails}"
				?isReassigned = "${this.isReassigned}"
				endCallContext="LandingPage"
				@cancel="${() => this.renderDialog = -1}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

	_renderAssignModal() {
		if (this.renderDialog === RENDER_DIALOG.HANDOFF) {
			return html`
				<horizon-assign-stop-card
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails=${this.incomingCallDetails}
					.cards=${this.failedCards}
					@on-cancel="${() => this.renderDialog = -1}"
					@on-handoff="${(e) => this._onHandOff(e)}">
				</horizon-assign-stop-card>
			`;
		}

		return html``;
	}

	_renderAssignReason() {
		if (this.renderDialog === RENDER_DIALOG.ASSIGN_REASON) {
			return html`
				<horizon-insure-assign-reason 
					@on-assign-reason=${(e) => this._onAssignReasonSelected(e)}
					@on-cancel="${() => this.renderDialog = -1}">
				</horizon-insure-assign-reason>
			`;
		}
		return html``;
	}

	_renderAssignReasonSelected() {
		if (this.renderDialog === RENDER_DIALOG.ASSIGN_REASON_SELECTED) {
			return html`<horizon-assign-reason-selected
						.selectedReason="${this.assignReason}"
						@on-cancel="${() => this.renderDialog = -1}"
						@team-selected="${(e) => this._onHandOff(e)}">
					</horizon-assign-reason-selected>`;
		}
		return html``;
	}

	_renderGraphicInProgress() {
		return html`<img class="card-image-inprogress" src="/images/cardStop/in-progress.svg"/>`;
	}
}

customElements.define(`horizon-stop-card-failure`, StopCardFailure);