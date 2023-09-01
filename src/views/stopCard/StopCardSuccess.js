import { ACCESS_CHANNELS_TYPE, CHANNEL_TYPE } from 'app/constants/AccessChannels';
import { css, html } from 'platform/elements';
import { ACCESS_CHANNEL_STATUS } from 'app/productControls/AccessChannels/src/Constants';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatDate } from 'app/utils/channelServiceUtilities';

import 'app/components/common/RelatedOptions';
import 'app/components/dialogs/common/ClientNotVerified';
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
		this.channels = [];
		this.accessChannels = {};
		this.need = ``;
		this.tokenType = ``;

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

	get incidentDescription() {
		let description = ``;
		this.stoppedCards.forEach(card => {
			description += `Type: Stop Card\nStopped Card number: ${card.maskedCardNumber}\nCard Type: ${card.cardDisplayName}\nDate Stopped: ${formatDate(card.cardStoppedDate, `dd/mm/yyyy hh:mm:ss`)}\nReason for Card Stop: ${card.cardStopReason.value}\n\n`;
		});

		return `${description}${this.notNowToSuspendChannels ? `Note: Access channels not suspended` : ``}`;
	}

	get selectedACs() {
		return this.channels.filter(item => item.selected && !item.disabled).length;
	}
	
	get channelIcons() {
		const app = `system/cards-action`;
		const inet = `system/access-action`;
		const ussd = `system/call-outbound-action`;

		return {
			[ACCESS_CHANNELS_TYPE.APP]: app,
			[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]: inet,
			[ACCESS_CHANNELS_TYPE.USSD]: ussd
		};
	}

	get selectedReasonAcs() {
		return this.channels.filter(item => item.selected && Boolean(item.reason)).length;
	}

	get ussd() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.USSD);
	}

	get internetBanking() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING);
	}
	
	get app() {
		return this.channels.find(item => item.channel === ACCESS_CHANNELS_TYPE.APP);
	}

	get expandedTiles() {
		return this.channels.filter(x => x.expanded).length;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.stoppedCards = screenDetails?.stoppedCards || [];
		this.notNowToSuspendChannels = screenDetails.notNowToSuspendChannels || this.notNowToSuspendChannels;

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
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
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
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_AC_SUSPEND_NOT_NOW, {});
		this._updateIncidentState();
		this._updateSuspendAcAction();
	}

	_suspendChannels() {
		this._toggleAlertSuspendChannels();
		this.confirmSuspendChannels = true;
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_AC_SUSPEND_CONTINUE, {});
	}

	_cancelSuspendChannels() {
		this.confirmSuspendChannels = false;
		this.notNowToSuspendChannels = true;

		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_AC_SUSPEND_CANCEL, {});
		this._updateIncidentState();
		this._updateSuspendAcAction();
	}

	_selectAllToSuspend(e) {
		this.channels = this.channels.map(item => {
			item.selected = e.detail.new;
			if (!item.disabled) {
				item.expanded = e.detail.new;
			}
			return item;
		});
		this.requestUpdate();
	}

	_channelSelected(event, index) {
		this.channels[index].selected = event.detail.new;
		this.channels[index].expanded = event.detail.new;

		if (this.channels[index].channel === ACCESS_CHANNELS_TYPE.APP && this.tokenType === IB_TOKEN_TYPE.SOFT) {
			const ibIndex = this.channels.findIndex(item => item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING);
			this.channels[ibIndex].selected = event.detail.new;
		}

		if (!event.detail.new) {
			this.channels[index].reason = ``;
		}

		this.channels = this.channels.map(c => {
										if (c.selected && Boolean(c.reason)) {
											c.expanded = false;
										}
										return c;
									});
		this.requestUpdate();
	}

	async _confirmSuspend() {
		const request = await this._formatSuspendChannelsRequest();

		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_AC_SUSPEND_CONFIRM, {
			ChannelsToSuspend: request.channels
		});

		await super._inicidentManager_(this.need, () => this._toggleBusyFlag());
		const returnValue = await this.accessChannelService.suspendChannels(request, () => true, 1);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to suspend channels`, `StopCardSuccess._confirmSuspend`, returnValue.correlationId);
		}

		this._updateScreenDetails(request, returnValue.result);
		this.horizonRouter.navigateToAccessChannelsOutcome();
	}

	_suspendReasonSelected(event, item) {
		const index = this.channels.findIndex(x => x.channel === item.channel);
		this.channels[index].reason = event.currentTarget.label;

		this.requestUpdate();
	}

	_expanded(item, e) {
		item.expanded = true;
		this.requestUpdate();
	}

	_collapsed(item, e) {
		item.expanded = false;
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		if (this.notNowToSuspendChannels) {
			return;
		}

		const returnValue = await this.accessChannelService.accessChannelLanding(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.channels = [];
			this.accessChannels = returnValue.result;
			this.tokenType = this.accessChannels.internetBanking?.tokenType;

			// Coverting result into Channels array
			this.channels.push({ ...this.accessChannels.app, channel: ACCESS_CHANNELS_TYPE.APP, label: `App` });
			this.channels.push({ ...this.accessChannels.internetBanking, channel: ACCESS_CHANNELS_TYPE.INTERNET_BANKING, label: `Internet Banking` });
			this.channels.push({ ...this.accessChannels.ussd, channel: ACCESS_CHANNELS_TYPE.USSD, label: `USSD` });

			this.alertSuspendChannels = this.app?.status === ACCESS_CHANNEL_STATUS.ACTIVE ||
				this.internetBanking?.status === ACCESS_CHANNEL_STATUS.ACTIVE ||
				this.ussd?.status === ACCESS_CHANNEL_STATUS.ACTIVE;
			this.channels = this.channels.filter(x => x.status === ACCESS_CHANNEL_STATUS.ACTIVE)
				.map(item => {
					item.selected = false;
					item.disabled = this.tokenType === IB_TOKEN_TYPE.SOFT && item.channel === ACCESS_CHANNELS_TYPE.INTERNET_BANKING;
					item.reason = ``;
					item.expanded = false;

					return item;
				});

			if (this.alertSuspendChannels) {
				this._telemetry.startSpan(QuickTransactionEvents.STOP_CARD_AC_SUSPEND, {
					App: this.accessChannels.app?.status,
					InetBanking: this.accessChannels.internetBanking?.status,
					USSD: this.accessChannels.ussd?.status
				});
			}
		}

		this.logger.log(`error`, `Failed to load access channel landing information`, `StopCardSuccess._initialise`, returnValue.correlationId);
	}

	async _formatSuspendChannelsRequest() {
		const request = {
			channels: this.channels.filter(item => item.selected && !item.disabled).map(item => CHANNEL_TYPE[item.channel]),
			app: null,
			inetbanking: null,
			ussd: null
		};
		this.need = request.channels.length > 1 ? `suspend-channels` : ``;

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.APP])) {
			request.app = {
				reason: this.app?.reason,
				userRegNo: this.accessChannels.app?.userRegNo
			};
			this.need = this.need || `suspend-app`;
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]) && this.tokenType === IB_TOKEN_TYPE.HARD) {
			const returnValue = await this.accessChannelService.internetBankingLanding(this.accessChannels.app?.userRegNo);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to load tokens to suspend internet banking`, `_formatSuspendChannelsRequest`, returnValue.correlationId);
			}

			request.inetbanking = {
				cif: this.callerInformation.cifNumber,
				tokenSerialNo: [`1234567890`],
				reason: `Lost`
			};
			this.need = this.need || `suspend-token`;
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.USSD])) {
			request.ussd = {
				msisdn: this.accessChannels.msisdn,
				cif: this.callerInformation.cifNumber,
				reason: this.ussd?.reason
			};
			this.need = this.need || `cancel-ussd`;
		}
		return request;
	}

	_updateScreenDetails(request, response) {
		const screenDetails = {};
		screenDetails.result = request.channels.map(item => {
			const channelRes = response[item.toLowerCase()];

			return {
				channel: item.toLowerCase(),
				status: channelRes.status
			};
		});

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.APP]) && response?.app?.status) {
			request.app = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.app);
			request.channels.splice(index, 1);
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]) && response?.inetbanking?.status) {
			request.inetbanking = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.internetBanking);
			request.channels.splice(index, 1);
		}

		if (request.channels.includes(CHANNEL_TYPE[ACCESS_CHANNELS_TYPE.USSD]) && response?.ussd?.status) {
			request.ussd = null;
			const index = request.channels.indexOf(CHANNEL_TYPE.ussd);
			request.channels.splice(index, 1);
		}

		screenDetails.request = request;
		this.horizonStore.setScreenDetails(screenDetails);
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
			<capitec-modal type="form" header="Stop Access Channels">
				<capitec-content-box slot="body" halign="right" class="${this.expandedTiles > 1 ? `noPaddingRight` : ``}">
					${this.tokenType === IB_TOKEN_TYPE.SOFT
					? html`
							<horizon-alert-banner
								type="info"
								header="Note: "
								label="Suspending App will suspend Internet Banking soft token.">
							</horizon-alert-banner>`
					: html``
				}
					<capitec-check
						label="Select all"
						@value-change="${(e) => this._selectAllToSuspend(e)}">
					</capitec-check>
					${this._renderActiveAccessChannels()}
				</capitec-content-box>
				<capitec-button slot="footer" label="Cancel" @click="${() => this._cancelSuspendChannels()}">
				</capitec-button>
				<capitec-button slot="footer" 
					type="primary"
					label="Stop Channels"
					@click="${() => this._confirmSuspend()}"
					?disabled="${this.selectedACs === 0 || this.selectedACs !== this.selectedReasonAcs}">
				</capitec-button>
			</capitec-modal>`
			: html``;
	}

	_renderActiveAccessChannels() {
		return this.channels.filter(item => item.status === ACCESS_CHANNEL_STATUS.ACTIVE)
							.map((item, index) => html`
								<horizon-expander
									class="${item.disabled ? `disabled` : ``}"
									expandButtonAlignment="right"
									icon="${this.channelIcons[item.channel]}"
									?expanded="${item.expanded}"
									?disabled="${!item.selected}"
									@expand="${(e) => this._expanded(item, e)}"
									@collapse="${(e) => this._collapsed(item, e)}">
										<capitec-group slot="custom-header" layout="horizontal" valign="center">
											<horizon-label
												class="channelInfoLbl"
												label="${item.label}"
												value="Last used ${formatDate(item.dateLastUsed, `dd mmm yyyy`)}">
											</horizon-label>
											<horizon-label
												class="channelStatusLbl"
												label="Status"
												value="${item.status}">
											</horizon-label>
											<capitec-check
												class="ac-tile"
												?checked="${item.selected}" 
												?disabled="${item.disabled}"
												@value-change="${(event) => this._channelSelected(event, index)}">
											</capitec-check>
										</capitec-group>
										${this._renderSuspendReasons(item)}
								</horizon-expander>
							`);
	}

	_renderSuspendReasons(item) {
		const app = () => this._renderAppReasons(item);
		const inetBanking = () => this._renderIBReasons(item);
		const ussd = () => this._renderUssdReasons(item);

		return {
			[ACCESS_CHANNELS_TYPE.APP]: app,
			[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]: inetBanking,
			[ACCESS_CHANNELS_TYPE.USSD]: ussd
		}[item.channel]();
	}

	_renderAppReasons(item) {
		return html`
			<capitec-content-box slot="content">
				<capitec-radio-group label="Choose a reason">
					<capitec-radio 
						label="Lost"
						?checked="${item.reason === `Lost`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
					<capitec-radio 
						label="Stolen"
						?checked="${item.reason === `Stolen`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
					<capitec-radio 
						label="Cancelled remote banking"
						?checked="${item.reason === `Cancelled remote banking`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
					<capitec-radio 
						label="Faulty"
						?checked="${item.reason === `Faulty`}"
						@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
					</capitec-radio>
				</capitec-radio-group>
			</capitec-content-box>`;
	}

	_renderUssdReasons(item) {
		return html`
			<capitec-content-box
				slot="content">
					<capitec-radio-group label="Choose a reason">
						<capitec-radio 
							label="Do not use service enough"
							?checked="${item.reason === `Do not use service enough`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Changing to remote/internet banking"
							?checked="${item.reason === `Changing to remote/internet banking`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Mobile banking too expensive"
							?checked="${item.reason === `Mobile banking too expensive`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Mobile banking too complicated"
							?checked="${item.reason === `Mobile banking too complicated`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Need more functions"
							?checked="${item.reason === `Need more functions`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Lack of support"
							?checked="${item.reason === `Lack of support`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Closing account"
							?checked="${item.reason === `Closing account`}"
							@value-change="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
					</capitec-radio-group>
			</capitec-content-box>`;
	}

	_renderIBReasons(item) {
		return html`
			<capitec-content-box
				slot="content">
					<capitec-radio-group label="Choose a reason">
						<capitec-radio
							label="Stolen"
							?checked="${item.reason === `Stolen`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Lost"
							?checked="${item.reason === `Lost`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio
							label="Faulty"
							?checked="${item.reason === `Faulty`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
						<capitec-radio 
							label="ServiceCanceled"
							?checked="${item.reason === `ServiceCanceled`}"
							@value-changed="${(event) => this._suspendReasonSelected(event, item)}">
						</capitec-radio>
					</capitec-radio-group>
			</capitec-content-box>`;
	}
}

customElements.define(`horizon-stop-card-success`, StopCardSuccess);