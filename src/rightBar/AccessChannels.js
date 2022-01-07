
import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { AccessChannelsEvents } from 'app/constants/telemetry/events/AccessChannels';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { Logger } from 'platform/core';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from 'platform/Utilities';

import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/productControls/AccessChannels/src/AppProfileDetails';
import 'app/productControls/AccessChannels/src/USSDProfileDetails';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

const ACCESS_CHANNELS_TYPE = {
	APP: `app`,
	INTERNET_BANKING: `internetBanking`,
	USSD: `ussd`,
	NOTIFICATIONS: `notifications`
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

		this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS, {
			"screen": TelemetryScreen.ACCESS_CHANNELS
		});

		const callerInformation = this.horizonStore.getCallerInformation();
		
		this.cifNumber = callerInformation.cifNumber;

		this._accessChannelService();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(AccessChannelsEvents.ACCESS_CHANNELS, {
			"screen": TelemetryScreen.ACCESS_CHANNELS
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_showSlidingPanel(event) {
		this.selectedAccessChannelType = event.detail?.tileClicked ?? ``;
		this.showSideSheet = !this.showSideSheet;
	}

	_toggleSideSheet(event) {
		const accessChannelType = event.detail.tileClicked;
		const actionType = event.detail.action;

		switch (accessChannelType) {
			case `App`:
				if (actionType === `Open`) {
					this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_APP, {
						"screen": TelemetryScreen.ACCESS_CHANNELS_APP
					});
				}
				break;
			case `USSD`:
				if (actionType === `Open`) {
					this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_USSD, {
						"screen": TelemetryScreen.ACCESS_CHANNELS_USSD
					});
				}
				break;
			default:
				break;
		}
	}

	_toggleAppSuspendReasons(event) {
		const showAppSuspendReasons = event.detail.showSuspendReasons;

		if (this.showAppSuspendReasons) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON
			});
		} else {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP
			});
		}
	}

	_toggleUssdCancelReasons(event) {
		const showUssdCancelReasons = event.detail.showCancelReasons;
		if (showUssdCancelReasons) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD
			});
		} else {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD_CANCEL, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD
			});
		}
	}

	suspendApp() {
		// TO DO: Channel service call to suspend app should come here
		// If successfully suspended, update app status, else Error scenario
		
		this.status.app.status = `Suspended`;
		this.status.app.dateLastUpdated = new Date().toISOString();

		if (this.status.app.status === `Suspended`) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_SUSPEND_CONFIRM, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP_SUSPEND_REASON,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP,
				"suspend-reason": this.status.app.statusReason
			});
		}
		
		this._deepCopyStatus();
		return true;
	}

	unsuspendApp() {
		// TO DO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario
		this.status.app.status = `Active`;
		this.status.app.dateLastUpdated = new Date().toISOString();

		if (this.status.app.status === `Active`) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_APP_UNSUSPEND, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_APP,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_APP
			});
		}

		this._deepCopyStatus();
		return true;
	}
	
	cancelUSSD() {
		// TO DO: add channel service call to cancel USSD service
		// If cancel is successful, show toast, update ussd status, else show error
		this.status.ussd.status = `Blocked`;
		this.status.ussd.dateLastUpdated = new Date().toISOString();

		if (this.status.ussd.status === `Blocked`) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_CANCEL_USSD_CONFIRM, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD_CANCEL_USSD,
				"next-screen": TelemetryScreen.ACCESS_CHANNELS_USSD,
				"cancel-reason": this.status.ussd.statusReason
			});
		}
		this._deepCopyStatus();
		return true;
	}

	unblockSIM() {
		// TO DO: add channel service call to unblock SIM - ussd
		// If unblock is successful, show toast, update ussd status, else show error
		this.status.ussd.isSimBlocked = false;
		this.status.ussd.dateLastUpdated = new Date().toISOString();

		if (!this.status.ussd.isSimBlocked) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_UNBLOCK_SIM, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD
			});
		}
		this._deepCopyStatus();
		return true;
	}

	activateFullMenuUSSD() {
		// TO DO: add code to activate full menu for currently active ussd clients
		// If client has active ussd, menu reduced, activate full menu function
		
		const indexOfReducedMenu = this.status.ussd.features.indexOf(`REDUCED_MENU`);
		this.status.ussd.features.splice(indexOfReducedMenu, 1);

		if (this.status.ussd.features.indexOf(`REDUCED_MENU`) === -1) {
			this._telemetry.logEvent(AccessChannelsEvents.ACCESS_CHANNELS_USSD_ACTIVATE_FULL_USSD_MENU, {
				"screen": TelemetryScreen.ACCESS_CHANNELS_USSD
			});
		}

		this._deepCopyStatus();
		return true;
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

			${this._renderAppPanel()}
			${this._renderUSSD()}`;
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

	_renderAppPanel() {
		return this.selectedAccessChannelType === ACCESS_CHANNELS_TYPE.APP
			? html`
				<capitec-pc-app-profile-details
					.appDetails = "${this.status.app}"
					?showSideSheet = "${this.showSideSheet}"

					.suspendApp = "${() => this.suspendApp()}"
					.unsuspendApp = "${() => this.unsuspendApp()}"

					@toggle-side-sheet="${(event) => this._toggleSideSheet(event)}"
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

			.cancelUSSD="${() => this.cancelUSSD()}"
			.unblockSIM="${() => this.unblockSIM()}"
			.activateFullMenuUSSD="${() => this.activateFullMenuUSSD()}"

			@toggle-ussd-cancel-reasons="${(event) => this._toggleUssdCancelReasons(event)}"
			@close-side-sheet="${(event) => this._showSlidingPanel(event)}">
			</capitec-pc-ussd-profile-details>`
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