import { QuickTransactionEvents, SUSPEND_CHANNELS_EVENTS } from 'app/constants/telemetry/events/QuickTransactions';
import { css, html } from 'platform/elements';
import { ACCESS_CHANNEL_STATUS } from 'app/productControls/AccessChannels/src/Constants';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { NavigationContext } from 'platform/core';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatDate } from 'app/utils/channelServiceUtilities';

import 'app/components/common/RelatedOptions';
import 'app/components/dialogs/common/ClientNotVerified';
import 'app/components/dialogs/common/SuspendAccessChannels';
import 'app/components/common/HorizonExpander';

const IB_TOKEN_TYPE = {
	SOFT: `Soft Token`,
	HARD: `Hard Token`
};

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
		this.notNowToSuspendChannels = false;
		this.accessChannels = {};

		this._telemetry = HorizonTelemetry.instance;
		this.navigationContext = NavigationContext.getInstance();

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

	get incidentDescription() {
		let description = ``;
		this.stoppedCards.forEach(card => {
			description += `Type: Stop Card\nStopped Card number: ${card.maskedCardNumber}\nCard Type: ${card.cardDisplayName}\nDate Stopped: ${formatDate(card.cardStoppedDate, `dd/mm/yyyy hh:mm:ss`)}\nReason for Card Stop: ${card.cardStopReason.value}\n\n`;
		});

		return `${description}${this.notNowToSuspendChannels ? `Note: Access channels not suspended` : ``}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.stoppedCards = screenDetails?.stoppedCards || [];
		this.notNowToSuspendChannels = screenDetails.notNowToSuspendChannels || this.notNowToSuspendChannels;

		const { pathParams } = this.navigationContext.current;
		this.context = pathParams.context || this.context;

		window.setTimeout(() => this._onToastDisplayTimeout(), 5000);
		await this._initialise();
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		if (!this.confirmSuspendChannels) {
			this._telemetry.endSpan(QuickTransactionEvents.STOP_CARD, {
				"screen": TelemetryScreen.STOP_CARD_OUTCOME
			});
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onToastDisplayTimeout() {
		this.displayNotification = true;
	}

	_updateIncidentState() {
		/* Removed during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		*/
		this.horizonIncidentManager.setDescription(this.incidentDescription);
	}

	_doneClick() {
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_DONE, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.horizonStore.clearScreenDetails();
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

	_notNow() {
		this._toggleAlertSuspendChannels();
		this.notNowToSuspendChannels = true;
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_AC_SUSPEND_NOT_NOW, {});
		this._updateIncidentState();
		this._updateSuspendAcAction();
	}

	_suspendChannels() {
		this._toggleAlertSuspendChannels();
		this.confirmSuspendChannels = true;
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_AC_SUSPEND_CONTINUE, {});
	}

	_cancelSuspendChannels() {
		this.confirmSuspendChannels = false;
		this.notNowToSuspendChannels = true;

		this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_CANCEL, {});
		this._updateIncidentState();
		this._updateSuspendAcAction();
	}

	async _confirmSuspend(request, need) {
		this.horizonIncidentManager.setCurrentNeed(need);
		await this._telemetry.logEvent(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS_CONFIRM, {
			'channels': request.channels
		});

		const returnValue = await this.accessChannelService.suspendChannels(request, () => true, 1);

		return returnValue;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		if (this.notNowToSuspendChannels || this.context === `ac`) {
			return;
		}

		const returnValue = await this.accessChannelService.accessChannelLanding(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.accessChannels = returnValue.result;

			this.alertSuspendChannels = this.accessChannels.app?.status === ACCESS_CHANNEL_STATUS.ACTIVE ||
				this.accessChannels.internetBanking?.status === ACCESS_CHANNEL_STATUS.ACTIVE ||
				this.accessChannels.ussd?.status === ACCESS_CHANNEL_STATUS.ACTIVE;

			if (this.alertSuspendChannels) {
				this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME_AC_STATUS, {
					App: this.accessChannels.app?.status,
					InetBanking: this.accessChannels.internetBanking?.status,
					USSD: this.accessChannels.ussd?.status
				});
			}
		}

		this.logger.log(`error`, `Failed to load access channel landing information`, `StopCardSuccess._initialise`, returnValue.correlationId);
	}

	_updateSuspendAcAction() {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.notNowToSuspendChannels = this.notNowToSuspendChannels;
		this.horizonStore.setScreenDetails(screenDetails);
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
					--theme-toast-icon-margin: 0px 13px 0px 15px;
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
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-body-padding: 0px;
					--theme-modal-form-m-l-xl-width: 515px;
					--theme-modal-footer-padding: 10px 16px 10px 0px;
				}
				capitec-modal[type="form"] > capitec-content-box {
					height: 541px;
				}
				capitec-button {
					--theme-button-padding-top: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 22px;
					--theme-button-padding-right: 22px;
				}
				.accessChannels {
					--theme-card-min-height: 64px;
					width: 100%;
				}
				.accessChannels > capitec-content-box {
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 8px;
					height: auto;
				}
				.accessChannels > capitec-content-box > capitec-group {
					align-items: center;
					height: 48px;
				}
				.accessChannels.disabled {
					filter: grayscale(100%);
				}
				.accessChannels.expanded {
					--theme-card-min-height: 200px;
				}
				horizon-label {
					--horizon-label-text-height: 16px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 16px;
					--horizon-label-value-font-size: 13px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-height: 14px;
					--horizon-label-value-line-height: 14px;
					--horizon-label-value-margin-top: 6px;
				}
				.channelInfoLbl {
					width: 225px;
				}
				.channelStatusLbl {
					width: 120px;
					--horizon-label-value-color: #70AF00;
					--horizon-label-text-font-weight: 400;
					--horizon-label-value-font-weight: 600;
				}
				capitec-check {
					--theme-check-width: 20px;
					--theme-check-height: 20px;
					--theme-check-label-spacing: 8px;
				}
				.reason {
					display: none
				}
				.reason.show {
					display: block;
				}
				capitec-radio-group {
					--theme-radio-group-label-font-weight: 600;
					--theme-radio-label-font-weight: 400;
					--theme-radio-group-label-margin-bottom: 0px;
					--theme-layout-gap-spacing: 6px;
				}
				capitec-radio-group > capitec-radio {
					--theme-radio-width: 20px;
					--theme-radio-height: 20px;
				}
				horizon-expander {
					--theme-expander-width: 483px;
					--theme-expander-height: 218px;
					--theme-expander-header-height: 64px;
					--theme-expander-header-padding: 0px 0px 0px 16px;
					--theme-expander-indicator-right-margin: 0px 16px 0px 0px;
				}
				horizon-expander.disabled {
					filter: grayscale(100%);
				}
				capitec-group[slot="custom-header"] {
					width: 375px;
				}
				capitec-check.ac-tile {
					--theme-check-label-spacing: 0px;
				}
				capitec-content-box[slot="content"] {
					--theme-container-padding-top: 8px;
					--theme-container-padding-bottom: 8px;
					border: 1px solid rgb(225, 225, 225);
					border-top: 0px;
				}
				.noPaddingRight {
					padding-right: 0px;
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
				<horizon-suspend-access-channels
					context="sc"
					cifNumber="${this.callerInformation.cifNumber}"
					.accessChannels="${this.accessChannels}"
					.suspendChannels="${(request, need) => this._confirmSuspend(request, need)}"
					@onLoad="${() => this._telemetry.startSpan(SUSPEND_CHANNELS_EVENTS.SUSPEND_ACCESS_CHANNELS)}"
					@cancel="${() => this._cancelSuspendChannels()}"
					@suspended="${() => this.confirmSuspendChannels = false}">
				</horizon-suspend-access-channels>`
			: html``;
	}
}

customElements.define(`horizon-stop-card-success`, StopCardSuccess);