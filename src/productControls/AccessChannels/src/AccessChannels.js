import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import 'platform/components';

export class AccessChannels extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`horizon-access-status-update`, (event) => this._updateStatus(event));
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * 
	 */

	static get properties() {
		return {
			status: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	_tileClick(buttonName) {
		this.dispatchEvent(new CustomEvent(`tile-click`, { detail: { tileClicked: buttonName } }));
	}

	_updateStatus(event) {
		this.status = event
		this.requestUpdate();
	}

	_formatDate(dateToFormat) {
        const stringToDate = new Date(dateToFormat);
        const tempdate = stringToDate.toGMTString().substr(5, 11);
		return tempdate;
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
					--theme-product-tile-heading-margin-left: 0px;
					--theme-product-tile-title-font-weight: 600;
					--theme-product-tile-subtitle-color: #3A3A3A;
				}
				.status-active {
					--theme-product-tile-default-border-left: 4px solid #70B000;
				}
				.status-inactive {
					--theme-product-tile-default-border-left: 4px solid #a5132a;
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
				${this._renderAccessChannelTabs()}
			</section>
		`;
	}

	_getStatusColor(status) {
		if (status === `Active`) {
			return `status-active`;
		} else if (status === `Suspended` || `Unavailable` || `Blocked`) {
			return `status-inactive`;
		} else {
			// do nothing
		}
	}

	_renderAccessChannelTabs() {
		return html`
			<capitec-group class="access-group" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="header-label" label="Access Channels"></capitec-label>

				<horizon-product-tile 
					class=${this._getStatusColor(this.status.app.status)}
					type="default"
					label="App"
					subtitle="${this.status.app.status} | Last used ${this._formatDate(this.status.app.dateLastUsed)}"
					detail=""
					icon="system/cellphone"
					@click="${() => this._tileClick(`App`)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=${this._getStatusColor(this.status.internetBanking.status)}
					type="default"
					label="Internet Banking"
					subtitle="${this.status.internetBanking.status} | Last used ${this._formatDate(this.status.internetBanking.dateLastUsed)}"
					detail=""
					icon="system/access"
					@click="${() => this._tileClick(`InternetBanking`)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=${this._getStatusColor(this.status.ussd.status)}
					type="default"
					label="USSD"
					subtitle="${this.status.ussd.status} | Last used ${this._formatDate(this.status.ussd.dateLastUsed)}"
					detail=""
					icon="system/cellphone"
					@click="${() => this._tileClick(`USSD`)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=""
					type="default"
					label="Notifications"
					subtitle="Not registered"
					detail=""
					icon="system/notify"
					@click="${() => this._tileClick(`Notifications`)}">
				</horizon-product-tile>
			</capitec-group>
		`;
	}
}

customElements.define(`capitec-pc-access-channels`, AccessChannels);