import { css, html } from 'platform/elements';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

// import 'app/components/dialogs/insure/AssignReasonDialog';
// import 'app/components/dialogs/insure/AssignReasonSelected';
import 'app/components/dialogs/stopCard/AssignStopCard';

const RENDER_MODE = {
	CARD_STOP_FAILURE: 0,
	IN_PROGRESS: 1
};
const RENDER_DIALOG = {
	ASSIGN_REASON: 0,
	ASSIGN_REASON_SELECTED: 1
};
const MAX_ATTEMPT = 2;

/**
 * An error screen for informing the user of the failure to stop one or more cards
 *
 * @export
 * @class StopCardFailure
 * @extends {ViewBase}
 */
export class StopCardFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.displayNotification = true;
		this.renderDialog = -1;
		this.retry = 0;
		this.isReassigned = false;
		this.showHandoffModal = false;
		this.failedCards = [];
		this.endCallContext = `QuickTransactionsUnSuccess`;

		this._telemetry = HorizonTelemetry.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			renderDialog: { type: Number },
			retry: { type: Number },

			showHandoffModal: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;

		this.isReassigned = this.horizonStore.getIsIncidentReassigned();
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this.stoppedCards = screenDetails && screenDetails.stoppedCards;
		this.failedCards = this.stoppedCards.filter(cards => !cards.cardStopped);

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.STOP_CARD, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME
		});
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
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_TRY_AGAIN, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME
		});

		this.retry++;
		// Checking if max attempts exhausted, YES -> show Assign/HandOff dialog
		if (this.retry > MAX_ATTEMPT) {
			this.showHandoffModal = !this.showHandoffModal;
			return;
		}

		// Toggling to InProgress
		this.renderMode = RENDER_MODE.IN_PROGRESS;

		await this.horizonIncidentManager.createAndClassifySubsIncident(this._toggleBusyFlag);
		const incidentDetails = this.horizonIncidentManager.getIncidentDetails();
		const returnValue = await this.cardService.stopCards(this.failedCards, incidentDetails);
		
		if (returnValue.succeeded) {
			const cardStopResults = returnValue.result;
			const isAllSuccess = cardStopResults.every(cards => cards.cardStopped === true);
			const screenDetails = this.horizonStore.getScreenDetails();

			this.failedCards = cardStopResults.filter(cards => !cards.cardStopped);
			// Toggling back to Network Error summary
			this.renderMode = RENDER_MODE.CARD_STOP_FAILURE;
			this._updateStoppedCards(cardStopResults);

			screenDetails.stoppedCards = this.stoppedCards;
			screenDetails.stoppedCardsFailed = !isAllSuccess;

			this.horizonStore.setScreenDetails(screenDetails);
	
			if (isAllSuccess) {
				// The stop card incident can be closed if all cards were stopped successfully.
				// Otherwise we go to the failure screen where a retry can be attempted or an assignment done
				this.horizonRouter.navigateToStoppedCards();
			}
		}
	}

	_onHandOff(e) {
		// On return from the Stop Card Assign dialog, mark the incident as assigned
        this.isReassigned = true;
		this.horizonStore.setIsIncidentReassigned(this.isReassigned);
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_toggleBusyFlag() {
		// Only used for Call Completion at present.
		// May be implemented later to render progress on endCall method
	}

	_onAssign() {
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_ASSIGN, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": TelemetryScreen.ASSIGN_STOP_CARD
		});

		this.showHandoffModal = !this.showHandoffModal;
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

	_updateIncidentState() {
		this.horizonIncidentManager.setIncidentState(super.HORIZON_NEED_STATUS.FAILED);
	}

	/**
	 * Updating the stopped cards list with the tried again cards status
	 * @param {*} attemptedCards Failed cards which are attempted to stop using try again
	 * @returns {void}
	 * 
	 */
	_updateStoppedCards(attemptedCards) {
		attemptedCards.forEach(card => {
			const index = this.stoppedCards.findIndex(stoppedCard => stoppedCard.cardNumber === card.cardNumber);

			this.stoppedCards[index].cardStopped = card.cardStopped;
			this.stoppedCards[index].statusCode = card.statusCode;
		});
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
					margin-bottom: 15px;
					height: 36px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
                    text-align: center;
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
					margin: 8px 40px 0px;
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
					width: var(--horizon-center-panel-width, 1064px);
					border: 1px solid #E1E1E1;
                    border-radius: 0 0 4px 4px;
                    background-color: #FFFFFF;
					margin-top: auto;
				}
				
				.card {
					height: 885px;
					width: var(--horizon-center-panel-width, 1064px);
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
					width: var(--horizon-center-panel-width, 1064px);
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
					margin: 16px 0px 0px 0px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderStopCardFailure()}

			${super._webTemplate()}
		`;
	}

	_renderStopCardFailure() {
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
				data-automation-id="stop-card-failure-toast"
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
		return html`<img class="card-image" src="/images/stopCard/network-error.svg"/>`;
	}

	_renderStoppedCards() {
		return html`
			<capitec-group 
				data-automation-id="stop-card-failure-stopped-cards"
				layout="vertical" 
				halign="center" 
				valign="center" 
				gap="clear">
				${this.stoppedCards.map((card) => this._renderCardStatus(card))}
			</capitec-group>
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
				<capitec-icon size="medium" icon="status/success-trans"></capitec-icon>
				<p data-automation-id="stop-card-failure-success-card"
					class="card-status-text">
					${card.cardDisplayName.split(`_`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)} <b>${card.maskedCardNumber}</b> was stopped successfully
				</p>

			</div>
		`;
	}

	_renderErrorStatus(card) {
		return html`
			<div class="card-status-error">
				<capitec-icon size="medium" icon="status/error-trans"></capitec-icon>
				<p data-automation-id="stop-card-failure-fail-card"
					class="card-status-text">
					Unable to stop ${card.cardDisplayName.split(`_`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)} <b>${card.maskedCardNumber}</b> 
				</p>
			</div>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group class="button-bar" layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
					data-automation-id="stop-card-failure-assign"
					class="button-assign"
					label="Assign"
					@click="${() => this._onAssign()}">
				</capitec-button>
				<capitec-button
					data-automation-id="stop-card-failure-try-again"
					class="button-tryAgain"
					type="primary"
					@click="${() => this._onTryAgain()}"
					label="Try Again">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderAssignModal() {
		return this.showHandoffModal
		? html`
				<horizon-assign-stop-card
					data-automation-id="stop-card-failure-assign-dialog"
					.incidentDetails="${this.horizonIncidentManager.getIncidentDetails()}"
					.incomingCallDetails=${this.incomingCallDetails}
					.cards=${this.failedCards}
					@on-cancel="${() => this.showHandoffModal = !this.showHandoffModal}"
					@on-handoff="${(e) => this._onHandOff(e)}">
				</horizon-assign-stop-card>`
		: html``;
	}

	_renderAssignReason() {
		if (this.renderDialog === RENDER_DIALOG.ASSIGN_REASON) {
			return html`
				<horizon-insure-assign-reason 
					data-automation-id="stop-card-failure-assign-reason"
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
						data-automation-id="stop-card-failure-assign-selected"
						.selectedReason="${this.assignReason}"
						@on-cancel="${() => this.renderDialog = -1}"
						@team-selected="${(e) => this._onHandOff(e)}">
					</horizon-assign-reason-selected>`;
		}
		return html``;
	}

	_renderGraphicInProgress() {
		return html`<img class="card-image-inprogress" src="/images/stopCard/in-progress.svg"/>`;
	}
}

customElements.define(`horizon-stop-card-failure`, StopCardFailure);