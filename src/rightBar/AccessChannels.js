import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';

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

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { state: true },
			status: { state: true },
			showSideSheet: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const callerInformation = this.horizonStore.getCallerInformation();
		
		this.cifNumber = callerInformation.cifNumber;
		this.status = {
			appAndInternetActive: true,
			ussdActive: false,
			notificationType: `unknown`
		};

		this._accessChannelService();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_showSlidingPanel(event) {

		this.selectedAccessChannelType = event.detail && event.detail.tileClicked || ``;
		this.showSideSheet = !this.showSideSheet;
	}
	
	suspendAppAndOnlineBanking() {
		// TO DO: Channel service call to suspend app should come here
		// If successfully suspended, update app status, else Error scenario
		this.status.appAndInternetActive = false;
		return true;
	}

	unSuspendAppAndOnlineBanking() {
		// TO DO: Channel service call to Un-suspend App should come here
		// If successfully Unsuspended, update app status, else Error scenario
		this.status.appAndInternetActive = true;
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
			${this._renderLoadingIndicator()}`;
	}
    
	_renderAccessChannels() {
		return html`
		<capitec-pc-access-channels
			.status=${this.status}
			.appAndInternetActive=${this.status.appAndInternetActive}
			.ussdActive=${this.status.ussdActive}
			.notificationType=${this.status.notificationType}
			
			@tile-click="${(event) => this._showSlidingPanel(event)}">
		</capitec-pc-access-channels>

		${this._renderAppAndOnlineBanking()}
		`;
	}

	_renderAppAndOnlineBanking() {
		return this.selectedAccessChannelType === `AppAndOnlineBanking` ?
		html`
			<capitec-pc-app-profile-details
				.isAppAndInternetActive = ${this.status.appAndInternetActive}
				.showSideSheet = ${this.showSideSheet}
				.suspendAppAndOnlineBanking = "${() => this.suspendAppAndOnlineBanking()}"
				.unSuspendAppAndOnlineBanking = "${() => this.unSuspendAppAndOnlineBanking()}"
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