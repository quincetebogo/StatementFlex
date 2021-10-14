import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'platform/components';
import 'app/productControls/AccessChannels/src/AccessChannels';

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
			showAlert: { type: Boolean },

			isBusy: { attribute: false },
			status: { attribute: false },
			statusVAS: { attribute: false },
			showValueAddedServicesModal: { attribute: false },
			showUnavailableVASModal: { attribute: false },
			showVASNoClientDataModal: { attribute: false }
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

	

	_mobileTemplate() {
		return _webTemplate();
	}



	_webTemplate() {
		return html`
	    	${this._renderAccessChannels()}
		`;
	}

	_renderAccessChannels(){
		return html`
		<capitec-pc-access-channels
			.status="${this.status}"
			.isBusy = "${this.isBusy}"
			.valueAddedService= "${()=> this._valueAddedService()}"
        ></capitec-pc-access-channels>
		`;
	}

	

}

window.customElements.define(`horizon-access-menu-bar`, AccessMenuBar);