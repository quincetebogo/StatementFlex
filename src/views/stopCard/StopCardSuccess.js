import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/RelatedOptions';
import 'app/components/dialogs/common/ClientNotVerified';

/**
 * Display an confirmation/success screen indicating which cards have been successfully stopped.
 * 
 * @export
 * @class StopCardSuccess
 * @extends ViewBase
 */
export class StopCardSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.displayNotification = false;
		this.stoppedCards = [];
		this.showAlertModal = false;
		this.endCallContext = `QuickTransactionSuccess`;

		this._telemetry = HorizonTelemetry.instance;
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			showAlertModal: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this.stoppedCards = screenDetails?.stoppedCards || [];

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
		this.displayNotification = true;
	}

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}  

	_doneClick() {
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_DONE, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_relatedOptionSelected(event) {
		this.showAlertModal = !this.showAlertModal;
		this._option = event.detail.option;
	}

	async _returnToStopCardClick() {
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_ANOTHER, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": TelemetryScreen.STOP_CARD
		});

		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.incomingCallDetails, this.incidentDetails, (ex) => this._stopCardErrorHandler());

		if (returnValue.succeeded) {
			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			this.horizonStore.setScreenDetails(screenDetails);
			
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	_stopCardErrorHandler(exception) {
		return true;
	}

	_onCancel() {
		this.showAlertModal = !this.showAlertModal;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.success-group {
					height: 885px;
				}

				.title-bar-text {
					--theme-label-title-font-size : 24px;
					--theme-label-title-font-weight: 600;
				}

				.success-toast{
					position: absolute;
					top : 32px;
					left:784px;
					width : 352px;
					height: 64px;
				}

				#action-icon{
					margin-left: 24px;
				}

				.card-stopped {
				    margin: 52px 0px 16px;
					height: 32px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
					text-align: center;
				}
				  
				.stop-card-text {
					margin: 16px 0px 0px 0px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-weight: 600;
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}

				.options-group{
					margin: auto 0px 23px 22px;
				}

				.button-margin{
					height: 104px;
					width: 242px;
					margin-right:16px;
				}

				.card-status-success{
					height: 24px;
					width: auto;
					display: flex;
					align-items: center;
					margin-top: 8px;
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
					margin-top: 24px;
					margin-bottom: auto;
				}

				horizon-alert-banner {
					margin: 16px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderStopCardSuccess()}

			${super._webTemplate()}
		`;
	}

	_renderStopCardSuccess() {
		return html`
			<capitec-card>
				<capitec-group class="success-group" layout="vertical" gap="none" style="width:100%;">
					${this._renderTitleBar()}
					${this._renderSuccessToast()}
					${this._renderNotifyClient()}
					${this._renderGraphic()}
					<p class="card-stopped">Card Stopped</p>
					${this._renderStoppedCards()}
					<p class="stop-card-text">Please visit a branch to get a new card.</p>
					${this._renderButtons()}
					${this._renderRelatedOptions()}
					${this._renderAlertModal()}
				</capitec-group>
			</capitec-card>
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

	_renderNotifyClient() {
		// For some reason ?hidden boolean attribute does not want to work on the div 
		return html`
			<horizon-alert-banner 
				data-automation-id="stop-card-success-notify-client"
				type="info" 
				style="visibility:${!this.displayNotification ? `visible` : `visible`}"
				header="Notice: "
				label="Please check if the client also needs to stop the remote banking app channels (App/USSD)">
			</horizon-alert-banner>`;
	}

	_renderGraphic() {
		return html`<img style="margin: 109px 406px 0px 406px;" width="252" height="182" src="/images/stopCard/cards.svg"/>`;
	}

	_renderStoppedCards() {
		return html`
			<capitec-group 
				data-automation-id="stop-card-success-stopped-cards"
				layout="vertical" 
				halign="center" 
				valign="center" gap="clear">
				${this.stoppedCards.map((card) => this._renderSuccessStatus(card))}
			</capitec-group>
		`;
	}

	_renderButtons() {
		return html`
			<capitec-group id="id-button-group" layout="horizontal">
				<capitec-button
					data-automation-id="stop-card-success-done"
					class="button"
					label="Done"
					@click="${() => this._doneClick()}">
				</capitec-button>
				<capitec-button
					data-automation-id="stop-card-success-return"
					class="button"
					type="primary"
					label="Return to Stop Card"
					@click="${() => this._returnToStopCardClick()}">
				</capitec-button>
			</capitec-group>`;
	}

	_renderSuccessStatus(card) {
		return html`
			 <div class="card-status-success">
				<capitec-icon
					size="medium"
					icon="status/success-trans">
				</capitec-icon>
				<p 
					data-automation-id="stop-card-success-msg-success"
					class="card-status-text">
					${card.cardDisplayName.split(`_`).map(w => w[0].toUpperCase() + w.substr(1).toLowerCase()).join(` `)} <b>${card.maskedCardNumber}</b> was stopped successfully
				</p>
			</div>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="stop-card-success-related-options"
				context = "Success"
				@verify-now-alert="${(event) => this._relatedOptionSelected(event)}">
			</horizon-related-options>
		`;
	}

	_renderSuccessToast() {
		if (!this.displayNotification) {
			return html`
				<capitec-toast 
					data-automation-id="stop-card-success-related-toast"
					class="success-toast" 
					type="success" 
					header="Successfull" 
					detail="Debit card stopped" 
					closable
					@click="${() => this._onToastDisplayTimeout()}">
				</capitec-toast>
			`;
		}
		return html``;
	}

	_renderAlertModal() {
		return this.showAlertModal
			? html`
				<horizon-client-not-verified
					data-automation-id="stop-card-success-not-verified-dialog"
					@cancel="${() => this._onCancel()}"
					@verify-now="${() => super._verifyClick()}">
				</horizon-client-not-verified>`
			: html``;
	}
}

customElements.define(`horizon-stop-card-success`, StopCardSuccess);