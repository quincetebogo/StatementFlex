import { Component, html } from 'platform/elements';
import { AccessChannelService } from 'app/services/AccessChannelService';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';

export class USSDProfileDetails extends Component {
	constructor() {
		super();

		this.isBusy = false;

		this.HorizonStore = HorizonStore.getInstance();
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

			dateRegistered: { attribute: false },
			cellNumber: { attribute: false },
			lastInteraction: { attribute: false },
			ussdStatus: { attribute: false },
			lastUpdated: { attribute: false },

			bannerTitle: { attribute: false },
			bannerSubtitle: { attribute: false }
			
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

	_unblockSIM() {
		// code to unblock SIM
	}

	_cancelUSSD() {
		// show the cancel USSD screen in panel
		this._renderCancelUSSD();
	}

	_cancel() {
		// cancel
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUSSDProfileDetails()}
			${this._renderCancelUSSD()}
			${this._renderLoadingIndicator()}`;
	}

	_renderUSSDProfileDetails() {
		// check if sim is blocked the show the error
		return html`
		<capitec-alert-banner type="${this.bannerType}" class="mainBanner" header="${this.bannerTitle}" label="${this.bannerSubtitle}" layout="vertical">
		</capitec-alert-banner>

		<div class="dateRegistered">
			<capitec-label type="subtitle" label="Date registered"></capitec-label>
			<capitec-label type="title" label="${this.dateRegistered}"></capitec-label>
		</div>

		<div class="cellNumber">
			<capitec-label type="subtitle" label="Cellphone number (verified)"></capitec-label>
			<capitec-label type="title" label="${this.cellNumber}"></capitec-label>
		</div>

		<div class="lastInteraction">
			<capitec-label type="subtitle" label="Last interaction date"></capitec-label>
			<capitec-label type="title" label="${this.lastInteraction}"></capitec-label>
		</div>

		<div class="ussdStatus">
			<capitec-label type="subtitle" label="Status"></capitec-label>
			<capitec-label type="title" label="${this.ussdStatus}"></capitec-label>
		</div>

		<div class="lastUpdated">
			<capitec-label type="subtitle" label="Last updated"></capitec-label>
			<capitec-label type="title" label="${this.lastUpdated}"></capitec-label>
		</div>

		<div class="cancelling">
			<capitec-label type="subtitle" label="Reason for cancelling"></capitec-label>
			<capitec-label type="title" label="${this.cancelling}"></capitec-label>
		</div>

		<div class="buttons">
			<capitec-button label="Unblock SIM" @click="${() => this._unblockSIM()}"></capitec-button>
			<capitec-button label="Cancel USSD" @click="${() => this._cancelUSSD()}"></capitec-button>
		</div>
		`;
	}

	_renderCancelUSSD() {
		return html`
		<capitec-alert-banner type="warning" label="Cancel USSD" closable>
		</capitec-alert-banner>

		<capitec-alert-banner type="unsuccessful-red" header="Notice:" label="Please choosea a reason to cancel USSD." layout="vertical">
		</capitec-alert-banner>

		<capitec-label type="title" label="Reasons to cancel"></capitec-label>

		<capitec-radio-group>
			<capitec-radio label="Do not use service enough"></capitec-radio>
			<capitec-radio label="Changing to remote/internet banking"></capitec-radio>
			<capitec-radio label="Mobile banking too expensive"></capitec-radio>
			<capitec-radio label="Mobile banking too complicated"></capitec-radio>
			<capitec-radio label="Need more functions"></capitec-radio>
			<capitec-radio label="Lack of support"></capitec-radio>
			<capitec-radio label="Closing account"></capitec-radio>
		</capitec-radio-group>

		<div class="buttons">
			<capitec-button label="Cancel USSD" @click="${() => this._cancelUSSD()}"></capitec-button>
			<capitec-button label="Cancel" @click="${() => this._cancel()}"></capitec-button>
		</div>

		`
	}

	_renderLoadingIndicator() {
		return this.isBusy
		? html`<capitec-loading-indicator></capitec-loading-indicator>`
		: html``;
	}
}



window.customElements.define(`capitec-pc-ussd-profile-details`, USSDProfileDetails);