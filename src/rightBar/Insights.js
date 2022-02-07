import { Component, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { ClientInsightsService } from 'app/services/ClientInsightsService';
import { Utilities } from 'platform/Utilities';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'platform/components';
import 'app/productControls/ClientInsights/src/ClientInsights';
import 'app/dialogs/valueAddedServices/ValueAddedServices';
import 'app/dialogs/valueAddedServices/ValueAddedServicesUnavailable';
import 'app/dialogs/valueAddedServices/VASNoClientData';

const mockData = [
	{
		"entityId": "71da20cb-4e25-40ac-b363-aa9300833000",
		"nbaId": 100,
		"parentCategoryId": 23,
		"reference": "ID",
		"message": "Recall request awaiting feedback\n\nDescription: Remote banking\nRef #: In123456\nDate Logged: 5 July 2015\nStatus: active\nOwner: remote team",
		"actions": [
		{
		"displayName": "This was useful",
		"type": "deepLink",
		"data": {
		"constant": "STrack"
		},
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJPcGVuIFNUcmFjayJ9"
		},
		{
		"displayName": "This didn't help",
		"type": "NoAction",
		"data": null,
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJGdWxmaWxsIE5lZWQifQ=="
		}
		]
	},

	{
		"entityId": "71da20cb-4e25-40ac-b363-aa9300833000",
		"nbaId": 100,
		"parentCategoryId": 23,
		"reference": "ID",
		"message": "Your Remote banking is in progress\n\nDescription: Remote banking\nRef #: In123456\nDate Logged: 5 July 2015\nStatus: active\nOwner: remote team",
		"actions": [
		{
		"displayName": "This was useful",
		"type": "deepLink",
		"data": {
		"constant": "STrack"
		},
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJPcGVuIFNUcmFjayJ9"
		},
		{
		"displayName": "This didn't help",
		"type": "NoAction",
		"data": null,
		"replyReference": "eyJFbnRpdHlJZCI6IjcxZGEyMGNiLTRlMjUtNDBhYy1iMzYzLWFhOTMwMDgzMzAwMCIsIk5iYUlkIjoxMDAsIlBhcmVudENhdGVnb3J5SWQiOjIzLCJBY3Rpb24iOiJGdWxmaWxsIE5lZWQifQ=="
		}
		]
	}
];
export class Insights extends Component {

	// --------------
	// INITIALISATION
	// --------------


	constructor() {
		super();

		this.isBusy = false;
		this.showValueAddedServicesModal = false;
		this.showUnavailableVASModal = false;
		this.showVASNoClientDataModal = false;

		this.eventAggregator = EventAggregator.getInstance();
		this.logger = Logger.getInstance();

		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => true);
		this.clientInsightsService = new ClientInsightsService(() => this._toggleBusyFlag(), () => true);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {String} cifNumber - Client's cif number
	 *
	 * @readonly
	 * @static
	 * @memberof Insights
	 */

	static get properties() {
		return {
			cifNumber: { type: String },
			
			isBusy: { state: true },
			statusVAS: { state: true },
			showValueAddedServicesModal: { state: true },
			showUnavailableVASModal: { state: true },
			showVASNoClientDataModal: { state: true },
			clientInsightsDetails: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._getClientInsights();
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
		// This event is used to trigger displaying a toast on the main display after the user
		// has updated Value Added Services
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

	async _getClientInsights() {
		const returnValue = await this.clientInsightsService.getClientInsights(this.cifNumber);

		// TO DO: Get data from CS response once Test data is available
		const clientInsights = mockData.shift();
		this._formatInsightDetails(clientInsights);
	
	}

	async _insightsAction(replyReference) {
		const returnValue = await this.clientInsightsService.sendInsightsAction(replyReference);

		if (returnValue.succeeded) {

			
			if (mockData.length > 0) {
				this._formatInsightDetails(mockData.shift());
				this._deepCopyProperty();
			} else {
				// TO DO: Dispaly Special Campaigns
			}
		}
	}

	_formatInsightDetails(clientInsights) {
		const message = clientInsights.message.split(`\n\n`);
		// const details = JSON.parse(message[1]);

		this.clientInsightsDetails = {
			header: message[0],
			actions: clientInsights.actions,
			details: {
				"Reference number": `838438439399`,
				"Logged": `1 April 2021`,
				"Assigned to": `Thomas`
			}
		};
	}

	_deepCopyProperty() {
		// Creates and returns a deep copy of an Object this.clientInsightsDetails which helps to render main screen.
		this.clientInsightsDetails = Utilities.deepCopy(this.clientInsightsDetails);
	}

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderClientInsights()}
			${this._renderValueAddedServicesModal()}
			${this._renderUnavailableVASModal()}
			${this._renderVASNoClientDataModal()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderClientInsights() {
		return html`
			<capitec-pc-client-insights
				.clientInsightsDetails=${this.clientInsightsDetails}
				@settings-click="${() => this._showVASModal()}"
				@response-selected="${(e) => this._insightsAction(e.detail.replyReference)}">
			</capitec-pc-client-insights>`;
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

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		};

		return html``;
	}
}
window.customElements.define(`horizon-insights`, Insights);