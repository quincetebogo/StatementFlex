import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { EventAggregator, Logger } from 'platform/core';

import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/webComponents/src/SideSheet';
import 'app/productControls/AccessChannels/src/AppProfileDetails'

/**
 * 
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
		this.eventAggregator = EventAggregator.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

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
		this.selectedAccessChannelType = event.detail && event.detail.tileClicked || ``;
		this.eventAggregator.publish(`horizon-access-status-update`, this.status);
		this.showSideSheet = !this.showSideSheet;
	}
	
	suspendApp() {
		// TO DO: Channel service call to suspend app should come here
		// If successfully suspended, update app status, else Error scenario
		this.status.app.isActive = false;
		this.status.app.dateLastUpdated = new Date()

		return true;
	}

	unSuspendApp() {
		// TO DO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario
		this.status.app.isActive = true;
		this.status.app.dateLastUpdated = new Date();

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
	
	/* Mocked Access channels landing response untill Channel service is implemented

		this.status = {
			"msisdn": "",

			"app": {
                "status": "Suspended",
				"statusReason": "Stolen",
				"dateLastUsed": "2021-09-11T09:48:18.908Z",
				"dateRegistered": "2021-11-08T09:48:18.908Z",
				"userName": "Mr Tertius Steyl",
				"userRegNo": "9065011004"
			},
			"internetBanking": {
				"status": "Active",
				"statusReason": "",
				"dateLastUsed": "2021-11-08T09:48:18.908Z",
				"dateRegistered": "2021-11-08T09:48:18.908Z",
				"userName": "Mr Tertius Steyl",
				"userRegNo": "9065011004"
			},
			"ussd": {
				"status": "Active",
				"statusReason": "",
				"dateLastUsed": "2021-11-08T09:48:18.908Z",
				"dateRegistered": "2021-11-08T09:48:18.908Z",
				"userName": "Mr Tertius Steyl",
				"userRegNo": "9065011004"
			}
        }
    */
		if (returnValue.succeeded) {
			this.status = returnValue.result;
			return;
		} 
		
		this.logger.log(`error`, `Failed to load access channel information`, `_accessChannelService`, returnValue.correlationId);
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
		return this.status ?
		html`
		<capitec-pc-access-channels
			.status=${this.status}
			@tile-click="${(event) => this._showSlidingPanel(event)}">
		</capitec-pc-access-channels>
		` : html``;
	}

	_renderAppPanel() {
		return this.selectedAccessChannelType === `App` ?
		html`
			<capitec-pc-app-profile-details
				.appDetails = ${this.status.app}
				.showSideSheet = ${this.showSideSheet}

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