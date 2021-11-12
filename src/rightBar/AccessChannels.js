
import { AccessChannelService } from 'app/services/AccessChannelService';
import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/productControls/AccessChannels/src/USSDProfileDetails';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

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
	
	cancelUSSD() {
		// TO DO: add channel service call to cancel USSD service
		// If cancel is successful, show toast, update ussd status, else show error
		this.status.ussd.status = `Blocked`;
		this.status.ussd.dateLastUpdated = new Date();

		return true;
	}

	unblockSIM() {
		// TO DO: add channel service call to unblock SIM - ussd
		// If unblock is successful, show toast, update ussd status, else show error
		this.status.ussd.isSimBlocked = false;
		this.status.ussd.dateLastUpdated = new Date();

		return true;
	}

	activateFullMenuUSSD() {
		// TO DO: add code to activate full menu for currently active ussd clients
		// If client has active ussd, menu reduced, activate full menu function
		this.status.ussdActive = true;
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
				"userRegNo": "906 501 1004"
			},
			"internetBanking": {
				"status": "Active",
				"statusReason": "",
				"dateLastUsed": "2021-11-08T09:48:18.908Z",
				"dateRegistered": "2021-11-08T09:48:18.908Z",
				"userName": "Mr Tertius Steyl",
				"userRegNo": "906 501 1004"
			},
			"ussd": {
				"status": "Active",
				"isSimBlocked": true,
				"dateLastUsed": "2021-11-08T09:48:18.908Z",
				"dateRegistered": "2021-11-08T09:48:18.908Z",
				"dateLastUpdated": "2021-11-10T09:48:18.908Z",
				"userRegNo": "906 501 1004",
				"features": {
					"isFullMenuActive": true
				}
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
			${this._renderUSSD()}`;
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

	_renderUSSD() {
		return this.selectedAccessChannelType === `USSD` ?
		html `
			<capitec-pc-ussd-profile-details
			.ussd="${this.status.ussd}"
			.showSideSheet="${this.showSideSheet}"

			.cancelUSSD="${() => this.cancelUSSD()}"
			.unblockSIM="${() => this.unblockSIM()}"
			.activateFullMenuUSSD="${() => this.activateFullMenuUSSD()}"

			@close-side-sheet="${(event) => this._showSlidingPanel(event)}">
			</capitec-pc-ussd-profile-details>
		` : 
		html ``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}

window.customElements.define(`horizon-access-channels`, AccessChannels);