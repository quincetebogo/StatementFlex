import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { EventAggregator } from 'platform/core';
import 'platform/components';
import 'app/components/dialogs/AccessChannelError';
import 'app/components/dialogs/ValueAddedServices';

export class AccessMenuBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.showAlert = false;
		this.isBusy = false;
		this.showValueAddedServicesModal = false;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), (ex) => this._accessChannelErrorHandler(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			showAlert: { type: Boolean },

			isBusy: { attribute: false },
			status: { attribute: false },
			showValueAddedServicesModal: { attribute: false }
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
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_onCancel() {
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	_onAccept() {
		this.eventAggregator.publish(`horizon-accepted-vas`, {});
		this.showValueAddedServicesModal = !this.showValueAddedServicesModal;
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	// ---------------
	// PRIVATE METHODS
	// ---------------

	_accessChannelErrorHandler(ex) {
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _accessChannelService() {
		const returnValue = await this.accessChannelService.accessChannelStatus(this.cifNumber);
		
		if (returnValue.succeeded) {
			this.status = returnValue.result;
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

	render() {
		return html`
			<section>
				${this.renderClientInsights()}
				${this.renderAccessChannelTabs()}
			</section>
			${this.renderAccessChannelError()}
			${this._renderLoadingIndicator()}
			${this._renderValueAddedServicesModal()}`;
	}

	renderClientInsights() {
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

	renderAccessChannelTabs() {
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

	renderAccessChannelError() {
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
				@on-cancel="${() => this._onCancel()}"
				@accept="${() => this._onAccept()}">
			</horizon-value-added-services>`
		: html``;
	}

}

window.customElements.define(`access-component`, AccessMenuBar);