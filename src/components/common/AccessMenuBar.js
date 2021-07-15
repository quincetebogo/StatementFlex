import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'platform/components';
import 'app/components/dialogs/AccessChannelError';
import 'app/components/dialogs/ValueAddedServices';
import 'app/components/dialogs/ValueAddedServicesUnavailable';

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
		this.showValueAddedServicesModal = false;
		this.showUnavailableVASModal = false;

		this.horizonRouter = HorizonRouter.getInstance();
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
			showAlert: { type: Boolean },

			isBusy: { attribute: false },
			status: { attribute: false },
			statusVAS: { attribute: false },
			showValueAddedServicesModal: { attribute: false },
			showUnavailableVASModal: { attribute: false }
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
		} else {
			this.logger.log(`error`, `Failed to load access channel information`, `_accessChannelService`, returnValue.correlationId);
		}
	}

	async _valueAddedService() {
		const returnValue = await this.valueAddedService.getValueAddedServiceStatus(this.cifNumber);

		if (returnValue.succeeded && returnValue.result !== ``) {
			this.statusVAS = returnValue.result;
			this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
		} else if (returnValue.succeeded) {
			this.showUnavailableVASModal = !this.showUnavailableVASModal;
		} else {
			this.logger.log(`error`, `Failed to load Value Added Services`, `_valueAddedService`, returnValue.correlationId);
			this.horizonRouter.navigateToSystemError();
		}
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
				}
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
			${this._renderValueAddedServicesModal()}
			${this._renderUnavailableVASModal()}
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

	_renderUnavailableVASModal() {
		return this.showUnavailableVASModal
		? html`
			<horizon-value-added-services-unavailable
				@accept-unavailable="${() => this._acceptUnavailableVasClick()}">
			</horizon-value-added-services-unavailable>
		`
		: html``;
	}
}

window.customElements.define(`horizon-access-menu-bar`, AccessMenuBar);