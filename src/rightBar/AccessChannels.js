import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';

import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/webComponents/src/SideSheet';
import 'app/productControls/AccessChannels/src/InternetBankingProfileDetails';

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

		this._accessChannelService();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_showSlidingPanel(event) {
		this.selectedAccessChannelType = event.detail && event.detail.tileClicked || ``;
		this.showSideSheet = !this.showSideSheet;
	}

	_suspendInternetBankingSecurityToken() {
		// TO DO: Channel service call to Suspend internet banking should come here
		// If successfully Suspended, update internet banking status, else Error scenario
		this.status.internetBankingActive = false;

		return true;
	}

	_unSuspendInternetBankingSecurityToken() {
		// TO DO: Channel service call to Unsuspend internet banking should come here
		// If successfully Unsuspended, update internet banking status, else Error scenario
		this.status.internetBankingActive = true;

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
			//this.status = returnValue.result;
			this.status = {
				appActive: false,
				internetBankingActive: true,
				ussdActive: false,
				notificationType: `unknown`
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
			${this._renderLoadingIndicator()}`;
	}
    
	_renderAccessChannels() {
		return html`
		<capitec-pc-access-channels
			.status="${this.status}"
			.internetBankingActive=${this.status.internetBankingActive}
			@tile-click="${(event) => this._showSlidingPanel(event)}">
		</capitec-pc-access-channels>

		${this._renderInternetBanking()}
		
		`;
	}

	_renderInternetBanking() {
		return this.selectedAccessChannelType === `InternetBanking` ?
		html`
			<capitec-pc-internet-banking-profile-details
				.isInternetBankingActive=${this.status.internetBankingActive}
				.showSideSheet = ${this.showSideSheet}
				.suspendInternetBankingSecurityToken = "${() => this._suspendInternetBankingSecurityToken()}"
				.unSuspendInternetBankingSecurityToken = "${() => this._unSuspendInternetBankingSecurityToken()}"
				@close-side-sheet="${(event) => this._showSlidingPanel(event)}"
			>
			</capitec-pc-internet-banking-profile-details>
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