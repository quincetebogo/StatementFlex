import { ACCESS_CHANNELS_REASONS, ACCESS_CHANNELS_TYPE, APP_STATUS, CHANNEL_TYPE } from 'app/constants/AccessChannels';
import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { AccessChannelsEvents } from 'app/constants/telemetry/events/AccessChannels';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from 'platform/Utilities';
import { formatPhoneNumber } from 'app/utils/channelServiceUtilities';

import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/productControls/AccessChannels/src/InternetBankingProfileDetails';
import 'app/productControls/AccessChannels/src/AppProfileDetails';
import 'app/productControls/AccessChannels/src/USSDProfileDetails';
import 'app/productControls/AccessChannels/src/NotificationsDetails';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

/**
 * Access Channels component invokes and holds functionality for all the available access channels
 * This component is envoked from RightBarLayout component
 * 
 * @export
 * @class AccessChannels
 * @extends {Component}
 */
export class AccessChannels extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isBusy = false;
		this.showSideSheet = false;
		this.landingInfo = {};

		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this._telemetry = HorizonTelemetry.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
		
		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));
	}

	// ----------
	// PROPERTIES
	// ----------
	/**
	 * @property {Boolean} [isBusy] - To toggle busy flag on active channel service call
	 * @property {Object} [status] - Access channels details
	 * @property {Boolean} [showSideSheet] - To toggle side sheet component
	 * @property {String} [selectedAccessChannelType] - Holds value of the selected access channel type
	 *
	**/

	static get properties() {
		return {
			isBusy: { state: true },
			status: { state: true },
			showSideSheet: { state: true },
			selectedAccessChannelType: { state: true },
			canPerformHighRiskActions: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.cifNumber = this.callerInformation?.cifNumber;
		this.verifiedTelephoneNumber = this.callerInformation?.verifiedTelephoneNumber;
		this.isVerifiedClient = this.callerInformation?.verificationStatus === `verified`;
		this.canPerformHighRiskActions = this.isVerifiedClient && this.callerInformation.verificationMethod !== `XDS`;

		this._performAction = async (need, options) => {

			const viewApp = () => {};
			const suspendApp = () => this._suspendApp(options.reason, options.regNo);
			const viewInternetBanking = () => {};
			const suspendToken = () => this.suspendInternetBanking(options.reason, options.token);
			const resetSecurityToken = () => this.resetInternetBanking(options.token);
			const viewUSSD = () => {};
			const cancelUssd = () => this.cancelUSSD(options.reason);
			const unblockSim = () => this.unblockSIM();
			const activateFullMenuUssd = () => this.activateFullMenuUSSD();
			const viewNotifications = () => {};

			const actions = {
				'view-app': viewApp,
				'suspend-app': suspendApp,
				'view-internetBanking': viewInternetBanking,
				'suspend-token': suspendToken,
				'reset-security-token': resetSecurityToken,
				'view-ussd': viewUSSD,
				'cancel-ussd': cancelUssd,
				'unblock-sim': unblockSim,
				'active-full-menu-ussd': activateFullMenuUssd,
				'view-notification': viewNotifications
			};

			if (actions[need]) {
				await super._inicidentManager_(need, () => this._toggleBusyFlag());
				return actions[need]();
			}
			return true;
		};

		this._landingInfo();
	}

	disconnectedCallback() {
		// Unsubscribe from store.
		this.stateChangeSub.unsubscribe();

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _showSlidingPanel(event) {
		this.selectedAccessChannelType = event.detail?.tileClicked ?? ``;
		this.showSideSheet = !this.showSideSheet;

		if (this.showSideSheet) {
			await this._telemetry.logEvent(AccessChannelsEvents[`ACCESS_CHANNELS_TILE_${CHANNEL_TYPE[this.selectedAccessChannelType]}`], {
				"screen": TelemetryScreen.ACCESS_CHANNELS
			});

			this._telemetry.startSpan(AccessChannelsEvents[`ACCESS_CHANNELS_${CHANNEL_TYPE[this.selectedAccessChannelType]}`]);

			await this._performAction(`view-${event.detail.tileClicked}`);
		} else {
			this._telemetry.endSpan(AccessChannelsEvents[`ACCESS_CHANNELS_${CHANNEL_TYPE[this.selectedAccessChannelType]}`]);

			if (this.landingInfo && this.landingInfo[event.detail.tileClicked]) {
				await super.createAndClassifySubsIncident(() => this._toggleBusyFlag());
				this._updateIncidentState(super.HORIZON_NEED_STATUS.COMPLETED);
			} else {
				this._updateIncidentState(super.HORIZON_NEED_STATUS.NOT_STARTED);
			}
		}
	}

	// App profile details
	async _toggleAppSuspendReasons(event) {
		const showAppSuspendReasons = event.detail.showSuspendReasons;

		if (showAppSuspendReasons) {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON
			});

			this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND);
		} else {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP
			});

			this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND);
		}
	}

	async _suspendApp(suspendReason, userRegNo) {

		await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND_CONFIRM, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP,
			"suspend-reason": suspendReason
		});

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND);

		// If successfully suspended, update app status, else Error scenario
		const returnValue = await this.accessChannelService.suspendApp(suspendReason, userRegNo);
	
		if (returnValue.succeeded) {
			this.landingInfo.app.status = APP_STATUS.SUSPENDED;
			this.landingInfo.app.dateLastUpdated = new Date().toISOString();

			this._deepCopyStatus();
			this._landingInfo();
			return true;
		}

		this.logger.log(`error`, `Failed to suspend app`, `_suspendApp`, returnValue.correlationId);
		return false;
	}

	unsuspendApp() {

		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_UNSUSPEND, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_APP,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP
		});

		// TODO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario

		this.landingInfo.app.status = `Active`;
		this.landingInfo.app.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		return true;
	}
	
	// USSD details
	async _toggleUssdCancelReasons(event) {
		const showUssdCancelReasons = event.detail.showCancelReasons;
		
		if (showUssdCancelReasons) {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD
			});

			this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD);
		} else {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD
			});

			this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD);
		}
	}

	async cancelUSSD(cancelReason) {

		await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD_CONFIRM, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD,
			"cancel-reason": cancelReason
		});
		
		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD);

		const returnValue = await this.accessChannelService.cancelUSSD(this.cifNumber, this.landingInfo.msisdn, ACCESS_CHANNELS_REASONS.DEFAULT);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unsuccessful call to cancel USSD`, `cancelUSSD`, returnValue.correlationId);
			return false;
		}
		
		this.landingInfo.ussd.status = `Inactive`;
		this.landingInfo.ussd.dateLastUpdated = new Date().toISOString();
		this._deepCopyStatus();
		this._landingInfo();
		return true;
	}

	async unblockSIM() {

		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_UNBLOCK_SIM);

		const returnValue = await this.accessChannelService.unblockSIM(this.landingInfo.msisdn);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to unblock SIM.`, `unblockSIM`, returnValue.correlationId);
			return false;
		}

		this.landingInfo.ussd.isSimBlocked = false;
		this.landingInfo.ussd.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		this._landingInfo();
		return true;
	}

	async activateFullMenuUSSD() {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_ACTIVATE_FULL_USSD_MENU);

		const indexOfReducedMenu = this.landingInfo.ussd.features.indexOf(`REDUCED_MENU`);

		if (indexOfReducedMenu === -1) {
			return true;
		}

		const returnValue = await this.accessChannelService.activatefullUssdMenu(this.cifNumber, this.landingInfo.msisdn, ACCESS_CHANNELS_REASONS.DEFAULT);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unsuccessful call the activate full USSD menu`, `activateFullMenuUSSD`, returnValue.correlationId);
			return false;
		}

		this.landingInfo.ussd.features.splice(indexOfReducedMenu, 1);

		this._deepCopyStatus();
		this._landingInfo();
		return true;
	}

	// Internet Banking
	async _toggleInternetBankingSuspendTokenPanel(event) {
		const showSuspendPanel = event.detail.showSuspendPanel;
		
		if (showSuspendPanel) {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN
			});

			this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);
		} else {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING
			});

			this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);
		}
	}

	async _toggleInternetBankingSuspendReasons(event) {
		const selectedTokens = event.detail.selectedTokens;
		
		if (selectedTokens) {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_NEXT, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_TOKENS,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_REASON,
				"token-numbers": selectedTokens
			});

			this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);
		} else {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN_BACK, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_REASON,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_TOKENS
			});

			this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);
		}
	}

	async _toggleInternetBankingTokenResetPanel(event) {
		const showResetTokenPanel = event.detail.showResetTokenPanel;
		
		if (showResetTokenPanel) {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN
			});

			this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN);
		} else {
			await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING
			});

			this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN);
		}
	}

	async suspendInternetBanking(suspendReason, token) {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"suspend-reason": suspendReason
		});

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);

		const requestBody = {
			cifNumber: this.cifNumber,
			tokenSerialNo: token,
			reason: suspendReason
		};
		const returnValue = await this.accessChannelService.suspendToken(requestBody);

		if (returnValue.succeeded) {
			this.landingInfo.internetBanking.status = `Suspended`;
			this.landingInfo.internetBanking.dateLastUpdated = new Date().toISOString();
			this.landingInfo.internetBanking.statusReason = suspendReason;
			
			this._deepCopyStatus();
			this._landingInfo();
			return true;
		}
		return false;
	}

	async resetInternetBanking(selectedTokens) {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"token-numbers": selectedTokens
		});

		const requestParams = {
			"tokenSerialNo": selectedTokens
		};
		const returnValue = await this.accessChannelService.resetSecurityTokenClock(requestParams);
		// If successfully reset, update Internet Banking status, else Error scenario
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to reset internet banking security token`, `_resetInternetBankingToken`, returnValue.correlationId);
			return false;
		}

		this.landingInfo.internetBanking.dateLastUpdated = new Date().toISOString();
		this._deepCopyStatus();
		this._landingInfo();
		return true;
	}

	async getTokens(userRegNo) {
		const returnValue = await this.accessChannelService.internetBankingLanding(userRegNo);

		if (returnValue.succeeded && returnValue.result) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Failed to load internet banking landing information`, `getToken`, returnValue.correlationId);
	}

	// Notifications
	_toggleNotificationsSettingsUpdate(event) {
		const updateType = event.detail.updateType;
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_NOTIFICATIONS,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE,
			"update-type": updateType
		});

		this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE);
	}

	updateMessageType(selectedType) {
		this.logNotificationUpdateTelemetry(selectedType);
		
		// TO DO: add channel service call to update notifications type
		// If update is successful, show toast, else show error
		this.landingInfo.notification.dateLastUpdated = new Date().toISOString();
		
		this._deepCopyStatus();
		return true;
	}

	updateMessageTime(selectedTime) {
		this.logNotificationUpdateTelemetry(selectedTime);

		// TO DO: add channel service call to update notifications time
		// If update is successful, show toast, else show error
		this.landingInfo.notification.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		return true;
	}

	logNotificationUpdateTelemetry(valueType) {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE_CONFIRM, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_NOTIFICATIONS,
			"value-type": valueType
		});

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_NOTIFICATIONS_UPDATE);
	}

	_stateChanged(state) {
		if (state?.callerInformation) {
			this.callerInformation = state.callerInformation;
			
			this.isVerifiedClient = this.callerInformation.verificationStatus === `verified`;
			this.canPerformHighRiskActions = this.isVerifiedClient && this.callerInformation.verificationMethod !== `XDS`;
		}
	}
	
	_onVerifyNowClick() {
		this.eventAggregator.publish(`horizon-verify-now-click`, {});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _landingInfo() {

		const returnValue = await this.accessChannelService.accessChannelLanding(this.cifNumber);

		if (returnValue.succeeded) {
			this.landingInfo = returnValue.result;
			if (this.landingInfo.msisdn?.length >= 9) {
				this.verifiedTelephoneNumber = `0${this.landingInfo.msisdn.substr(this.landingInfo.msisdn.length - 9)}`;
			}

			this.requestUpdate();
			return;
		}
		this.logger.log(`error`, `Failed to load access channel landing information`, `_landingInfo`, returnValue.correlationId);
	}

	async getUssdLandingDetails() {
		const requestParams = {
			'msisdn': this.landingInfo.msisdn,
			'cif': `0${this.cifNumber}`
		};
		const returnValue = await this.accessChannelService.accessChannelsUssdLanding(requestParams);
		if (returnValue.succeeded) {
			return returnValue.result;
		}
		this.logger.log(`error`, `Failed to load USSD landing details`, `getUssdLandingDetails`, returnValue.correlationId);
	}

	_deepCopyStatus() {
		// Creates and returns a deep copy of an Object this.landingInfo
		this.landingInfo = Utilities.deepCopy(this.landingInfo);
	}

	_updateIncidentState(status) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = status;
		this.horizonStore.setIncidentDetails(incidentDetails);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-side-sheet {
					--theme-side-sheet-width: 344px;
					--theme-side-sheet-height: 890px;
					--theme-side-sheet-top: 96px;
				}`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderAccessChannels()}
			${this._renderLoadingIndicator()}

			${this._renderInternetBankingPanel()}
			${this._renderAppPanel()}
			${this._renderUSSD()}
			${this._renderNotificationsPanel()}`;
	}

	_renderAccessChannels() {
		return this.landingInfo
			? html`
				<capitec-pc-access-channels
					.status=${this.landingInfo}
					?isVerifiedClient="${this.isVerifiedClient}"
					@tile-click="${(event) => this._showSlidingPanel(event)}">
				</capitec-pc-access-channels>`
			: html``;
	}

	_renderInternetBankingPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.INTERNET_BANKING
			? html`
				<capitec-pc-internet-banking-profile-details
					.internetBankingDetails = "${this.landingInfo.internetBanking}"
					verifiedNumber = "${formatPhoneNumber(this.verifiedTelephoneNumber)}"
					?showSideSheet = "${this.showSideSheet}"
					?isVerifiedClient="${this.isVerifiedClient}"

					.suspendInternetBankingSecurityToken = "${(suspendReason, selectedTokens) => this._performAction(`suspend-token`, { reason: suspendReason, token: selectedTokens })}"
					.resetInternetBankingSecurityToken = "${(selectedTokens) => this._performAction(`reset-security-token`, { token: selectedTokens })}"
					.getClientTokens = "${(userRegNo) => this.getTokens(userRegNo)}"

					@toggle-token-reset-panel="${(event) => this._toggleInternetBankingTokenResetPanel(event)}"
					@toggle-token-suspend-reasons="${(event) => this._toggleInternetBankingSuspendReasons(event)}"
					@toggle-token-suspend-panel="${(event) => this._toggleInternetBankingSuspendTokenPanel(event)}"
					@close-side-sheet ="${(event) => this._showSlidingPanel(event)}">
				</capitec-pc-internet-banking-profile-details>`
			: html``;
	}

	_renderAppPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.APP
			? html`
				<capitec-pc-app-profile-details
					.appDetails = "${this.landingInfo.app}"
					verifiedNumber = "${formatPhoneNumber(this.verifiedTelephoneNumber)}"
					?showSideSheet = "${this.showSideSheet}"
					?isVerifiedClient="${this.isVerifiedClient}"

					.suspendApp = "${(suspendReason, userRegNo) => this._performAction(`suspend-app`, { reason: suspendReason, regNo: userRegNo })}"
					.unsuspendApp = "${() => this.unsuspendApp()}"

					@toggle-app-suspend-reasons="${(event) => this._toggleAppSuspendReasons(event)}"
					@close-side-sheet ="${(event) => this._showSlidingPanel(event)}" >
				</capitec-pc-app-profile-details>`
			: html``;
	}

	_renderUSSD() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.USSD
			? html`
				<capitec-pc-ussd-profile-details
					.ussd="${this.landingInfo.ussd}"
					?showSideSheet="${this.showSideSheet}"
			        ?isVerifiedClient="${this.isVerifiedClient}"
					cellphoneNumber="${formatPhoneNumber(this.verifiedTelephoneNumber)}"
					?canPerformHighRiskActions="${this.canPerformHighRiskActions}"

					.cancelUSSD="${cancelReason => this._performAction(`cancel-ussd`, { reason: cancelReason })}"
					.unblockSIM="${() => this._performAction(`unblock-sim`)}"
					.activateFullMenuUSSD="${() => this._performAction(`active-full-menu-ussd`)}"
					.getUssdLandingDetails="${(clientInfo) => this.getUssdLandingDetails(clientInfo)}"
					.renderVerificationAlertBanner="${() => this.renderVerificationAlertBanner()}"

					@toggle-ussd-cancel-reasons="${(event) => this._toggleUssdCancelReasons(event)}"
					@close-side-sheet="${(event) => this._showSlidingPanel(event)}">
				</capitec-pc-ussd-profile-details>`
			: html``;
	}

	_renderNotificationsPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.NOTIFICATIONS
			? html`
				<capitec-pc-notifications-details
					.notificationsDetails="${this.landingInfo.notification}"
					?showSideSheet="${this.showSideSheet}"

					.updateMessageType="${(selectedType) => this.updateMessageType(selectedType)}"
					.updateMessageTime="${(selectedTime) => this.updateMessageTime(selectedTime)}"

					@toggle-notifications-settings-update="${(event) => this._toggleNotificationsSettingsUpdate(event)}"
					@close-side-sheet="${(event) => this._showSlidingPanel(event)}">
				</capitec-pc-notifications-details>`
			: html``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator data-automation-id="access-channels-loading-indicator"></capitec-loading-indicator>`;
		};

		return html``;
	}

	renderVerificationAlertBanner() {
		return this.callerInformation?.hasDigitalChannels
			? html`
				<capitec-alert-banner
					class="has-digital-channels"
					data-automation-id="high-risk-banner"
					type="warning">
							<capitec-label type="Strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security, we will be sending a push notification to access additional transactions.">
							</capitec-label>
							<capitec-hyperlink
								data-automation-id="ussd-profile-details-verify-click"
								label="Verify Now"
								@click="${() => this._onVerifyNowClick()}">
							</capitec-hyperlink>
				</capitec-alert-banner>`
			: html`
				<capitec-alert-banner
					class="no-digital-channels"
					data-automation-id="high-risk-banner"
					type="warning">
							<capitec-label type="Strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security get the remote banking App to perform additional transactions, alternatively, visit your nearest branch.">
							</capitec-label>
				</capitec-alert-banner>`;
	}

}
window.customElements.define(`horizon-access-channels`, AccessChannels);