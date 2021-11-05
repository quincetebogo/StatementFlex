import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';
import { EventAggregator } from 'platform/core';


import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/webComponents/src/SideSheet';
import 'app/productControls/AccessChannels/src/USSDProfileDetails';

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
		// To mock the call for setting USSD active
		// this.status = {
		// 	appAndInternetActive: false,
		// 	ussdActive: true,
		// 	notificationType: `unknown`
		// };

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
		this.status.ussdActive = false;
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
		
		if (returnValue.succeeded) {
			this.status = {
				"ussdActive": true,
				"appAndInternetActive": true,
				"notificationType": "Unknown"
			};
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
			.ussdActive="${this.status.ussdActive}"
			.showSideSheet="${this.showSideSheet}"
			.cancelUSSD="${() => this.cancelUSSD()}"
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