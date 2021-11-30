
import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';
import { Utilities } from 'platform/Utilities';

import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/productControls/AccessChannels/src/AppProfileDetails';
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
			status: { type: Object },
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

	// --------------
	// EVENT HANDLERS
	// --------------

	_showSlidingPanel(event) {
		this.selectedAccessChannelType = event.detail?.tileClicked ?? ``;
		this.showSideSheet = !this.showSideSheet;
	}
	
	suspendApp() {
		// TO DO: Channel service call to suspend app should come here
		// If successfully suspended, update app status, else Error scenario
		this.status.app.status = `Suspended`;
		this.status.app.dateLastUpdated = new Date().toISOString();
		
		this._deepCopyStatus();
		return true;
	}

	unSuspendApp() {
		// TO DO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario
		this.status.app.status = `Active`;
		this.status.app.dateLastUpdated = new Date().toISOString();

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
		`;
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
				.appDetails = ${this.status.app}
				?showSideSheet = ${this.showSideSheet}

				.suspendApp = "${() => this.suspendApp()}"
				.unSuspendApp = "${() => this.unSuspendApp()}"

				@close-side-sheet ="${(event) => this._showSlidingPanel(event)}" >
			</capitec-pc-app-profile-details>`
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