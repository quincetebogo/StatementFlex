import { Component, css, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from '../../store/HorizonStore';
import 'platform/components';
import '../dialogs/AccessChannelError';

export class AccessMenuBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.confirmedCaller = null;
		this.clientProfileDetails = null;
		this.showAlert = false;
		this.isBusy = false;

		this.accessChannelService = new AccessChannelService(() => this._toggleBusyFlag(), (ex) => this._accessChannelErrorHandler(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			showAlert: { type: Boolean },
			clientProfileDetails: { type: Object },

			isBusy: { attribute: false },
			status: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = HorizonStore.getInstance().recoverState();
		this.confirmedCaller = state.confirmedCaller;
		this.callerInformation = state.callerInformation;
		this.cifNumber = this.callerInformation.cifNumber;

		this._accessChannelService();

		this.clientProfileDetails = this.confirmedCaller && this.confirmedCaller.clientProfileDetails;
		this.clientAccess = this.clientProfileDetails && this.clientProfileDetails.clientAccess;

		this.accessChannels = this.clientAccess ? Object.keys(this.clientAccess) : [];
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

	_accessChannelErrorHandler(ex) {
		// TODO: Handle channel service error
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
				capitec-icon[icon="system/notify"] {
					--theme-icon-size-small: 26px;
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
			${this._renderLoadingIndicator()}`;
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
							icon="system/notify">
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
}

window.customElements.define(`access-component`, AccessMenuBar);