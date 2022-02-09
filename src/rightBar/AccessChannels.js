
import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { AccessChannelsEvents } from 'app/constants/telemetry/events/AccessChannels';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { Logger } from 'platform/core';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from 'platform/Utilities';

import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/productControls/AccessChannels/src/InternetBankingProfileDetails';
import 'app/productControls/AccessChannels/src/AppProfileDetails';
import 'app/productControls/AccessChannels/src/USSDProfileDetails';
import 'app/productControls/AccessChannels/src/NotificationsDetails';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

const ACCESS_CHANNELS_TYPE = {
	APP: `app`,
	INTERNET_BANKING: `internetBanking`,
	USSD: `ussd`,
	NOTIFICATIONS: `notifications`
};

const CHANNEL_TYPE = {
	'app': `APP`,
	'internetBanking': `INTERNET_BANKING`,
	'ussd': `USSD`,
	'notifications': `NOTIFICATIONS`
};

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

		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();

		this._telemetry = HorizonTelemetry.instance;

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
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
			selectedAccessChannelType: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const callerInformation = this.horizonStore.getCallerInformation();
		this.cifNumber = callerInformation.cifNumber;

		this._accessChannelService();
	}

	disconnectedCallback() {
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
		} else {
			this._telemetry.endSpan(AccessChannelsEvents[`ACCESS_CHANNELS_${CHANNEL_TYPE[this.selectedAccessChannelType]}`]);
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

	async suspendApp(suspendReason) {

		await this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND_CONFIRM, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP,
			"suspend-reason": suspendReason
		});

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND);

		// TO DO: Channel service call to suspend app should come here
		// If successfully suspended, update app status, else Error scenario
		
		this.status.app.status = `Suspended`;
		this.status.app.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		return true;
	}

	unsuspendApp() {

		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_UNSUSPEND, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_APP,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP
		});

		// TO DO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario

		this.status.app.status = `Active`;
		this.status.app.dateLastUpdated = new Date().toISOString();

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

		// TO DO: add channel service call to cancel USSD service
		// If cancel is successful, show toast, update ussd status, else show error
		
		this.status.ussd.status = `Blocked`;
		this.status.ussd.dateLastUpdated = new Date().toISOString();
		this._deepCopyStatus();
		return true;
	}

	unblockSIM() {

		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_UNBLOCK_SIM);

		// TO DO: add channel service call to unblock SIM - ussd
		// If unblock is successful, show toast, update ussd status, else show error
		this.status.ussd.isSimBlocked = false;
		this.status.ussd.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		return true;
	}

	activateFullMenuUSSD() {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_ACTIVATE_FULL_USSD_MENU);

		// TO DO: add code to activate full menu for currently active ussd clients
		// If client has active ussd, menu reduced, activate full menu function
		
		const indexOfReducedMenu = this.status.ussd.features.indexOf(`REDUCED_MENU`);
		this.status.ussd.features.splice(indexOfReducedMenu, 1);

		this._deepCopyStatus();
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

	suspendInternetBanking(suspendReason) {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"suspend-reason": suspendReason
		});

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_SUSPEND_SECURITY_TOKEN);

		// TO DO: Channel service call to suspend Internet Banking should come here
		// If successfully suspended, update Internet Banking status, else Error scenario
		this.status.internetBanking.status = `Suspended`;
		this.status.internetBanking.dateLastUpdated = new Date().toISOString();
		
		this._deepCopyStatus();
		return true;
	}

	resetInternetBanking(selectedTokens) {
		this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_INTERNET_BANKING_RESET_SECURITY_TOKEN, {
			"screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_INTERNET_BANKING,
			"token-numbers": selectedTokens
		});

		// TO DO: Channel service call to Reset Internet Banking should come here
		// If successfully reset, update Internet Banking status, else Error scenario
		this.status.internetBanking.status = `Active`;
		this.status.internetBanking.dateLastUpdated = new Date().toISOString();

		this._deepCopyStatus();
		return true;
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
		// If unblock is successful, show toast, update ussd status, else show error
		this.status.notifications.dateLastUpdated = new Date().toISOString();
		
		this._deepCopyStatus();
		return true;
	}

	updateMessageTime(selectedTime) {
		this.logNotificationUpdateTelemetry(selectedTime);

		// TO DO: add channel service call to update notifications time
		// If unblock is successful, show toast, update ussd status, else show error
		this.status.notifications.dateLastUpdated = new Date().toISOString();

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

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _accessChannelService() {
	
		const returnValue = await this.accessChannelService.accessChannelStatus(this.cifNumber);
	
		if (returnValue.succeeded) {
			this.status = returnValue.result;
			return;
		}
		this.logger.log(`error`, `Failed to load access channel information`, `_accessChannelService`, returnValue.correlationId);
		
	}

	async getUssdLandingDetails(clientInfo) {
		const returnValue = await this.accessChannelService.accessChannelsUssdLanding(clientInfo);
		if (returnValue.succeeded) {
			return returnValue.result;
		}
		this.logger.log(`error`, `Failed to load USSD landing details`, `getUssdLandingDetails`, returnValue.correlationId);
		return null;
	}

	_deepCopyStatus() {
		// Creates and returns a deep copy of an Object this.status
		this.status = Utilities.deepCopy(this.status);
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
		return this.status
			? html`
				<capitec-pc-access-channels
					.status=${this.status}
					@tile-click="${(event) => this._showSlidingPanel(event)}">
				</capitec-pc-access-channels>`
			: html``;
	}

	_renderInternetBankingPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.INTERNET_BANKING
			? html`
				<capitec-pc-internet-banking-profile-details
					.internetBankingDetails = "${this.status.internetBanking}"
					?showSideSheet = "${this.showSideSheet}"

					.suspendInternetBankingSecurityToken = "${(suspendReason) => this.suspendInternetBanking(suspendReason)}"
					.resetInternetBankingSecurityToken = "${(selectedTokens) => this.resetInternetBanking(selectedTokens)}"

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
					.appDetails = "${this.status.app}"
					?showSideSheet = "${this.showSideSheet}"

					.suspendApp = "${suspendReason => this.suspendApp(suspendReason)}"
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
			.ussd="${this.status.ussd}"
			?showSideSheet="${this.showSideSheet}"
			verifiedTelephoneNumber="${this.callerInformation.verifiedTelephoneNumber}"

			.cancelUSSD="${cancelReason => this.cancelUSSD(cancelReason)}"
			.unblockSIM="${() => this.unblockSIM()}"
			.activateFullMenuUSSD="${() => this.activateFullMenuUSSD()}"
			.getUssdLandingDetails="${(clientInfo) => this.getUssdLandingDetails(clientInfo)}"

			@toggle-ussd-cancel-reasons="${(event) => this._toggleUssdCancelReasons(event)}"
			@close-side-sheet="${(event) => this._showSlidingPanel(event)}">
			</capitec-pc-ussd-profile-details>`
		: html``;
	}

	_renderNotificationsPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.NOTIFICATIONS
		? html`
			<capitec-pc-notifications-details
				.notificationsDetails="${this.status.notifications}"
				?showSideSheet="${this.showSideSheet}"

				.updateMessageType="${(selectedType) => this.updateMessageType(selectedType)}"
				.updateMessageTime="${(selectedTime) => this.updateMessageTime(selectedTime)}"

				@toggle-notifications-settings-update="${(event) => this._toggleNotificationsSettingsUpdate(event)}"
				@close-side-sheet="${(event) => this._showSlidingPanel(event)}"
			>
			</capitec-pc-notifications-details>
		`
		: html``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}
window.customElements.define(`horizon-access-channels`, AccessChannels);