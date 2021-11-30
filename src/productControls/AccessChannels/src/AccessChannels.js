import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import 'platform/components';

const ACCESS_CHANNELS_TYPE = {
	APP: `app`,
	INTERNET_BANKING: `internetBanking`,
	USSD: `ussd`,
	NOTIFICATIONS: `notifications`
};

const ACCESS_CHANNEL_STATUS = {
	ACTIVE: `Active`,
	SUSPENDED: `Suspended`,
	UNAVAILABLE: `Unavailable`,
	BLOCKED: `Blocked`
};

/**
 * Access Channels component is used to hold all the Access channels tiles available.
 * This component is envoked from Access Channels component
 * 
 * Events Raised 
 * -------------
 * tile-click
 *  
 * @export
 * @class AccessChannels
 * @extends {Component}
 */

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
	 * @property {Object} [status] - Holds details and status of all the available access channels
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

	// --------------
	// EVENT HANDLERS
	// --------------

	_tileClick(buttonName) {
		this.dispatchEvent(new CustomEvent(`tile-click`, { detail: { tileClicked: buttonName } }));
	}
	
	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateStatus(event) {
		this.status = event;
		this.requestUpdate();
	}

	_formatDate(dateToFormat) {
		const stringToDate = new Date(dateToFormat);
		const tempdate = stringToDate.toGMTString().substr(5, 11);
		return tempdate;
	}

	_formatTime(timeToFormat) {
		const formatedDate = new Date(timeToFormat);
		const localTime = formatedDate.toLocaleTimeString();
		return localTime.replace(localTime.slice(-6, -2), ``);
	}

	_getStatusColor(type) {
		const status = this.status[type]?.status;

		if (status === ACCESS_CHANNEL_STATUS.ACTIVE) {
			return `status-active`;
		} else if (status === ACCESS_CHANNEL_STATUS.SUSPENDED ||
							ACCESS_CHANNEL_STATUS.UNAVAILABLE || 
							ACCESS_CHANNEL_STATUS.BLOCKED || 
							isNullorEmpty(status)) {
			return `status-inactive`;
		}
	}

	_getStatusDetails(type) {
		const status = this.status[type]?.status;
		
		if (isNullorEmpty(status)) {
			return `Channel service is down`;
		} else if (status === ACCESS_CHANNEL_STATUS.ACTIVE) {
			return `${status} | Last used ${this._formatDate(this.status[type].dateLastUsed)}`;
		} else if (status === ACCESS_CHANNEL_STATUS.SUSPENDED || ACCESS_CHANNEL_STATUS.BLOCKED) {
			return `${status} | ${this._formatDate(this.status[type].dateLastUpdated || this.status[type].dateLastUsed)}, ${this._formatTime(this.status[type].dateLastUpdated || this.status[type].dateLastUsed)}`;
		}
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

	_renderAccessChannelTabs() {
		return html`
			<capitec-group class="access-group" layout="vertical" halign="stretch" valign="top" gap="clear">
				<capitec-label class="header-label" label="Access Channels"></capitec-label>

				<horizon-product-tile 
					class=${this._getStatusColor(ACCESS_CHANNELS_TYPE.APP)}
					type="default"
					label="App"
					subtitle="${this._getStatusDetails(ACCESS_CHANNELS_TYPE.APP)}"
					detail=""
					icon="system/cellphone"
					@click="${() => this._tileClick(ACCESS_CHANNELS_TYPE.APP)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=${this._getStatusColor(ACCESS_CHANNELS_TYPE.INTERNET_BANKING)}
					type="default"
					label="Internet Banking"
					subtitle="${this._getStatusDetails(ACCESS_CHANNELS_TYPE.INTERNET_BANKING)}"
					detail=""
					icon="system/access"
					@click="${() => this._tileClick(ACCESS_CHANNELS_TYPE.INTERNET_BANKING)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=${this._getStatusColor(ACCESS_CHANNELS_TYPE.USSD)}
					type="default"
					label="USSD"
					subtitle="${this._getStatusDetails(ACCESS_CHANNELS_TYPE.USSD)}"
					detail=""
					icon="system/cellphone"
					@click="${() => this._tileClick(ACCESS_CHANNELS_TYPE.USSD)}">
				</horizon-product-tile>

				<horizon-product-tile 
					class=""
					type="default"
					label="Notifications"
					subtitle="Not registered"
					detail=""
					icon="system/notify"
					@click="${() => this._tileClick(ACCESS_CHANNELS_TYPE.NOTIFICATIONS)}">
				</horizon-product-tile>
			</capitec-group>
		`;
	}
}

customElements.define(`capitec-pc-access-channels`, AccessChannels);