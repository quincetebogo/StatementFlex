import { css, html } from 'platform/elements';
import { ACCESS_CHANNELS_TYPE } from 'app/constants/AccessChannels';
import { AccessChannelService } from 'app/services/AccessChannelService';
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
		this.alertSuspendChannels = false;
		this.confirmSuspendChannels = false;
		this.channels = {};

		this._telemetry = HorizonTelemetry.instance;

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			showAlertModal: { attribute: false },
			alertSuspendChannels: { type: Boolean, attribute: false },
			confirmSuspendChannels: { type: Boolean, attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this.stoppedCards = screenDetails?.stoppedCards || [];

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
		this._updateIncidentState();
		await this._initialise();
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
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
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

		const returnValue = await this.cardService.identifyCaller(
			this.callerInformation, 
			this.horizonIncidentManager.currentIncident, 
			(ex) => this._stopCardErrorHandler(ex)
		);

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

	_toggleAlertSuspendChannels() {
		this.alertSuspendChannels = !this.alertSuspendChannels;
	}

	_suspendChannels() {
		this._toggleAlertSuspendChannels();
		this.confirmSuspendChannels = true;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		const returnValue = await this.accessChannelService.accessChannelLanding(this.cifNumber);

		if (returnValue.succeeded) {
			const channels = [ACCESS_CHANNELS_TYPE.APP, ACCESS_CHANNELS_TYPE.INTERNET_BANKING, ACCESS_CHANNELS_TYPE.USSD];
			
			this.channels = Object.entries(returnValue.result).map(item => {
				if (channels.includes(item[0])) {
					item[1].channel = item[0];
				}
				return item[1];
			});
			// Updating the email in callerInfo state
			const callerInformation = this.horizonStore.getCallerInformation();
			callerInformation.emailId = returnValue.result?.email || ``;
			this.horizonStore.setCallerInformation(callerInformation);


			// if (this.landingInfo.msisdn?.length >= 9) {
			// this.verifiedTelephoneNumber = `0${this.landingInfo.msisdn.substr(this.landingInfo.msisdn.length - 9)}`;
			// }
			// this._toggleAlertSuspendChannels();
		}

		this.logger.log(`error`, `Failed to load access channel landing information`, `StopCardSuccess._initialise`, returnValue.correlationId);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.success-group {
					height: 630px;
				}
				capitec-content-box {
					border-bottom: var(--theme-divider);
				}
				capitec-label[type="title"] {
					--theme-label-title-font-size : 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-label[type="subtitle"] {
				--theme-label-subtitle-font-size: 15px;
				--theme-label-subtitle-font-weight: 600;
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
				.card-status-success{
					height: 24px;
					width: auto;
					display: flex;
					align-items: center;
					margin-top: 8px;
				}
				.card-status-success > capitec-icon{
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
				horizon-alert-banner, horizon-related-options, .success-group {
					width: 100%;
				}
				capitec-modal[type="onboard"] {
					--theme-modal-body-padding: 24px;
					--theme-modal-footer-padding: 0px;
				}
				capitec-modal[type="onboard"] > capitec-content-box[slot="body"] {
					border: none;
				}
				capitec-content-box[slot="body"] > capitec-label {
					--theme-label-title-font-size : 22px;
					--theme-label-subtitle-font-size: 13px;
					--theme-label-subtitle-font-weight: 500;
				}
				capitec-content-box[slot="body"] > capitec-group {
					margin-top: 12px;
				}
				capitec-modal[type="form"] {
					--theme-modal-header-background-color: #E1E1E1;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-body-padding: 0px;
					--theme-modal-form-m-l-xl-width: 500px;
				}
				capitec-modal[type="form"] > capitec-content-box {
					height: 360px;
				}
				.accessChannels {
					--theme-card-min-height: 64px;
					width: 100%;
				}
				.accessChannels > capitec-content-box {
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 8px;
				}
				.accessChannels > capitec-content-box > capitec-group {
					align-items: center;
				}
				.channelInfoLbl {
					width: 234px;
				}
				.channelStatusLbl {
					width: 120px;
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
			${this._renderAlertSuspendChannels()}
			${this._renderSuspendChannels()}
			${super._webTemplate()}
		`;
	}

	_renderStopCardSuccess() {
		return html`
			<capitec-card>
				${this._renderSuccessToast()}
				<capitec-content-box layout="vertical" halign="left" valign="top">
					${this._renderNotifyClient()}
					<capitec-group class="success-group" layout="vertical" gap="clear" halign="center" valign="center">
						${this._renderGraphic()}
						<capitec-label type="title" label="Card(s) stopped successfully"></capitec-label>
						${this._renderStoppedCards()}
						<capitec-label type="subtitle" label="Visit a branch to get a new card."></capitec-label>
						${this._renderButtons()}
					</capitec-group>
				</capitec-content-box>
			</capitec-card>
			${this._renderRelatedOptions()}
			${this._renderAlertModal()}
		`;
	}

	_renderNotifyClient() {
		// For some reason ?hidden boolean attribute does not want to work on the div 
		return html`
			<horizon-alert-banner 
				data-automation-id="stop-card-success-notify-client"
				type="info"
				header="Notice: "
				label="Please check if the client also needs to stop the remote banking app channels (App/USSD)">
			</horizon-alert-banner>`;
	}

	_renderGraphic() {
		return html`<capitec-image src="platform/illustrations/cards.svg"></capitec-image>`;
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

	_renderAlertSuspendChannels() {
		return this.alertSuspendChannels
		? html`
			<capitec-modal type="onboard">
				<capitec-content-box slot="body" layout="vertical" halign="center" valign="center" noPadding>
					<capitec-image src="platform/illustrations/debicheck.svg"></capitec-image>
					<capitec-label type="title" label="Suspend access channels"></capitec-label>
					<capitec-label type="subtitle" label="Does the client wish to suspend their App, USSD or Internet banking."></capitec-label>
					<capitec-group layout="horizontal">
						<capitec-button
							label="Not Now"
							@click="${() => this._notNow()}">
						</capitec-button>
						<capitec-button
							type="primary"
							label="Suspend Channels"
							@click="${() => this._suspendChannels()}">
						</capitec-button>
					</capitec-group>
				</capitec-content-box>
			</capitec-modal>`
		: html``;
	}

	_renderSuspendChannels() {
		return this.confirmSuspendChannels
		? html`
			<capitec-modal type="form" header="Stop Access Channels">
				<capitec-content-box slot="body" halign="right">
					<capitec-check label="Select all"></capitec-check>

					<capitec-card class="accessChannels">
						<capitec-content-box>
							<capitec-group layout="horizontal">
								<capitec-icon size="medium" icon="system/cards-action"></capitec-icon>
								<horizon-label
									class="channelInfoLbl"
									label="App"
									value="Last used 15 Feb 2023">
								</horizon-label>
								<horizon-label
									class="channelStatusLbl"
									label="Status"
									value="Active">
								</horizon-label>
								<capitec-check></capitec-check>
							</capitec-group>
						</capitec-content-box>
					</capitec-card>

					<capitec-card class="accessChannels">
						<capitec-content-box>
							<capitec-group layout="horizontal">
								<capitec-icon size="medium" icon="system/access-action"></capitec-icon>
								<horizon-label
									class="channelInfoLbl"
									label="Internet Banking"
									value="Last used 15 Feb 2023">
								</horizon-label>
								<horizon-label
									class="channelStatusLbl"
									label="Status"
									value="Active">
								</horizon-label>
								<capitec-check></capitec-check>
							</capitec-group>
						</capitec-content-box>
					</capitec-card>

					<capitec-card class="accessChannels">
						<capitec-content-box>
							<capitec-group layout="horizontal">
								<capitec-icon size="medium" icon="system/call-outbound-action"></capitec-icon>
								<horizon-label
									class="channelInfoLbl"
									label="USSD"
									value="Last used 15 Feb 2023">
								</horizon-label>
								<horizon-label
									class="channelStatusLbl"
									label="Status"
									value="Active">
								</horizon-label>
								<capitec-check></capitec-check>
							</capitec-group>
						</capitec-content-box>
					</capitec-card>
				</capitec-content-box>
				<capitec-button slot="footer" type="clear" label="Cancel"></capitec-button>
				<capitec-button slot="footer" type="clear" label="Stop Channels" type="Primary"></capitec-button>
			</capitec-modal>`
		: html``;
	}
}

customElements.define(`horizon-stop-card-success`, StopCardSuccess);