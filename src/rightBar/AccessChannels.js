import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';

import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/webComponents/src/SideSheet';

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
			appAndInternetActive: false,
			ussdActive: false,
			notificationType: `unknown`
		};

		this._accessChannelService();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_showSlidingPanel(event) {
		this.showSideSheet = !this.showSideSheet;
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
			.status="${this.status}"
			@tile-click="${(event) => this._showSlidingPanel(event)}">
		</capitec-pc-access-channels>

		<capitec-side-sheet
			.expanded="${this.showSideSheet}"
			alignment="right">
				<capitec-content-box
					layout="vertical"
					halign="center"
					valign="center"
					gap="clear">
						<capitec-label type="Strong" label="Content comes here.."></capitec-label>
						<capitec-button type="primary" label="Close" @click="${() => this._showSlidingPanel()}"></capitec-button>
				</capitec-content-box>
		</capitec-side-sheet>`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}

window.customElements.define(`horizon-access-channels`, AccessChannels);