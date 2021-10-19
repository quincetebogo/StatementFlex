import { Component, css, html } from 'platform/elements';
import { Logger } from 'platform/core';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'platform/components';
import 'app/components/dialogs/AccessChannelError';
import 'app/productControls/ClientInsights/src/ClientInsights';

/**
 * The AccessMenuBar is the right hand menu bar area in Horizon. This component currently houses
 * Client Insights and Access Channels
 */
export class AccessMenuBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.showAlert = false;
		this.isBusy = false;

		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			showAlert: { type: Boolean },

			isBusy: { attribute: false },
			status: { attribute: false },
			statusVAS: { attribute: false }
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
		} else {
			this.logger.log(`error`, `Failed to load access channel information`, `_accessChannelService`, returnValue.correlationId);
		}
	}

	async _valueAddedService() {
		const returnValue = await this.valueAddedService.getValueAddedServiceStatus(this.cifNumber);

		return returnValue;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.access-group {
					height: auto;
					width: auto;
					padding: 24px 0px 0px 0px;
				}

				.header-label {
					height: auto;
					width: auto;
					padding-left: 16px;
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}

				horizon-product-tile {
					--theme-product-tile--height: 72px;
					--theme-product-tile-border-radius: 4px;
					--theme-product-tile-colour-border-radius: 4px 0 0 4px;
					--theme-product-tile-default-border-left: 4px solid #009DE0;
					--theme-product-tile-hover-shadow: none;
					--theme-product-tile-focus-shadow: none;
					--theme-product-tile-title-height: 24px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-layout-gap-spacing: 16px;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<section>
				${this._renderClientInsights()}
				${this._renderAccessChannelTabs()}
			</section>
			${this._renderAccessChannelError()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderClientInsights() {
		return html`
			<capitec-pc-client-insights
				.valueAddedService= "${()=> this._valueAddedService()}"
				.scenario=${'cards'}>
			</capitec-pc-client-insights>
		`;
	}

	_renderAccessChannelTabs() {
		return html`
			<capitec-group class="access-group" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="header-label" label="Access Channels"></capitec-label>

				<horizon-product-tile 
					type="default"
					label="App & Online Banking"
					subtitle=${this.status.appAndInternetActive ? `active` : `inactive`}
					detail=""
					icon="system/access">
				</horizon-product-tile>

				<horizon-product-tile 
					type="default"
					label="USSD"
					subtitle=${this.status.ussdActive ? `active` : `inactive`}
					detail=""
					icon="system/cellphone">
				</horizon-product-tile>

				<horizon-product-tile 
					type="default"
					label="Notifications"
					subtitle=${this.status.notificationType ? this.status.notificationType : `inactive`}
					detail=""
					icon="system/messages">
				</horizon-product-tile>

			</capitec-group>
		`;
	}

	_renderAccessChannelError() {
		if (this.showAlert) {
			return html`<horizon-access-channel-error @on-OK="${() => this.showAlert = false}"></horizon-access-channel-error>`;
		}
	}

	_renderLoadingIndicator() {
		if (this.isBusy || this.loading) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}

}

window.customElements.define(`horizon-access-menu-bar`, AccessMenuBar);