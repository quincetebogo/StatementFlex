import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';
import 'app/dialogs/valueAddedServices/ValueAddedServices';
import 'app/dialogs/valueAddedServices/ValueAddedServicesUnavailable';
import 'app/dialogs/valueAddedServices/VASNoClientData';

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

		this.isBusy = false;
		this.showValueAddedServicesModal = false;
		this.showUnavailableVASModal = false;
		this.showVASNoClientDataModal = false;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.logger = Logger.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), () => true);
		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { state: true },
			status: { state: true },
			statusVAS: { state: true },
			showValueAddedServicesModal: { state: true },
			showUnavailableVASModal: { state: true },
			showVASNoClientDataModal: { state: true }
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

	_showVASModal() {
		this._valueAddedService();
	}

	_cancelVasClick() {
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_acceptVasClick() {
		this.eventAggregator.publish(`horizon-accepted-vas`, {});
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_acceptVASNoClientDataClick() {
		this.showVASNoClientDataModal = !this.showVASNoClientDataModal;
	}

	_acceptUnavailableVasClick() {
		this.showUnavailableVASModal = !this.showUnavailableVASModal;
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

	async _valueAddedService() {
		const returnValue = await this.valueAddedService.getValueAddedServiceStatus(this.cifNumber);

		if (returnValue.succeeded && returnValue.result !== ``) {
			this.statusVAS = returnValue.result;
			this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
			return;
		};
		
		if (returnValue.succeeded) {
			this.showVASNoClientDataModal = !this.showVASNoClientDataModal;
			return;
		} 
		
		this.logger.log(`error`, `Failed to load Value Added Services`, `_valueAddedService`, returnValue.correlationId);
		this.showUnavailableVASModal = !this.showUnavailableVASModal;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.insights-card {
					height: 462px;
					width: var(--horizon-right-panel-width, 320px);
				}
				capitec-title-bar {
					border-bottom: 1px solid #E1E1E1;

					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
					--theme-card-border-radius: 0px 4px 0 0;
					--theme-titlebar-shadow: 1px solid #E1E1E1;
				}
				capitec-icon[icon="system/settings-action"] {
					--theme-icon-size-small: 24px;
					cursor: pointer;
				}
				.insights-group {
					height: 398px;
				}
				.box-image {
					height: 108px;
					width: 108px;
					--theme-layout-gap-spacing: 22px;
				}`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<section>
				${this._renderClientInsights()}
				${this._renderAccessChannels()}
			</section>
			${this._renderLoadingIndicator()}
			${this._renderValueAddedServicesModal()}
			${this._renderUnavailableVASModal()}
			${this._renderVASNoClientDataModal()}
		`;
	}
  
	_renderClientInsights() {
		return html`
			<capitec-card class="insights-card">
				<capitec-title-bar
					type="default"
					label="Client Insights">
						<capitec-spacer></capitec-spacer>
						<capitec-icon
							size="small"
							icon="system/settings-action"
							@click = "${() => this._showVASModal()}">
						</capitec-icon>
				</capitec-title-bar>

				<capitec-group layout="vertical" halign="center" valign="center" gap="clear" class="insights-group">
					<img
						class="box-image"
						src="images/landingPageImages/marketing.svg"/>
					<capitec-label
						type="subtitle"
						label="Client insights coming soon...">
					</capitec-label>
				</capitec-group>
			</capitec-card>`;
	}
  
	_renderAccessChannels() {
		return html`
		<capitec-pc-access-channels
			.status="${this.status}"
		></capitec-pc-access-channels>
		`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}

	_renderValueAddedServicesModal() {
		return this.showValueAddedServicesModal
		? html`
			<horizon-value-added-services
				.statusVAS="${this.statusVAS}"
				@cancel="${() => this._cancelVasClick()}"
				@accept="${() => this._acceptVasClick()}">
			</horizon-value-added-services>`
		: html``;
	}

	_renderVASNoClientDataModal() {
		return this.showVASNoClientDataModal 
		? html`
			<horizon-value-added-services-no-client-data
				@okay-unavailable="${() => this._acceptVASNoClientDataClick()}">
			</horizon-value-added-services-no-client-data>
		`
		: html``;
	}

	_renderUnavailableVASModal() {
		return this.showUnavailableVASModal
		? html`
			<horizon-value-added-services-unavailable
				@vas-unavailable="${() => this._acceptUnavailableVasClick()}">
			</horizon-value-added-services-unavailable>
		`
		: html``;
	}
}

window.customElements.define(`horizon-access-menu-bar`, AccessMenuBar);