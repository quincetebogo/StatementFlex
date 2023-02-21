import { Component, html } from 'platform/elements';
import { Configuration, EventAggregator, Logger, NavigationContext } from 'platform/core';
import { ClientInsightsService } from 'app/services/ClientInsightsService';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { Insightimages } from '../Insightimages';
import { NBAEvents } from 'app/constants/telemetry/events/AccessMenuBar';
import { ValueAddedService } from 'app/services/ValueAddedService';


import 'platform/components';
import 'app/productControls/ClientInsights/ClientInsights';
import 'app/dialogs/valueAddedServices/ValueAddedServices';
import 'app/dialogs/valueAddedServices/ValueAddedServicesUnavailable';
import 'app/dialogs/valueAddedServices/VASNoClientData';

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
		this.insights = {};

		this.eventAggregator = EventAggregator.getInstance();
		this._configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this._telemetry = HorizonTelemetry.getInstance();
		this._insightimages = Insightimages.getInstance();

		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => true);
		this.clientInsightsService = new ClientInsightsService(() => this._toggleBusyFlag(), () => true);
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), () => true);
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
			insightDetails: { state: true }
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
		const returnValue = await this.clientProfileService.getClientConsent(this.cifNumber);

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
		this.insightDetails = null;

		const returnValue = await this.clientInsightsService.getClientInsights(this.cifNumber);
		const insights = returnValue.result;

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get Client insights`, `_getClientInsights`, returnValue.correlationId);
			return;
		}

		if (!Array.isArray(insights)) {
			return;
		}
		
		if (insights.length >= 1) {
			this._formatInsights(insights.shift());
		}
	}

	async _formatInsights(insights) {
		
		this.insights = insights;
		const insightDetails = this._insightimages.getInsightDetails();

		if (insightDetails[insights.parentCategoryId] && insightDetails[insights.parentCategoryId][insights.nbaId]) {
			
			const displayDetails = insightDetails[insights.parentCategoryId][insights.nbaId];

			this.insightDetails = {
				header: displayDetails.header,
				image: displayDetails.image,
				message: displayDetails.message,
				actions: insights.actions
			};

			this._telemetry.logEvent(NBAEvents.LOAD, {
				"nbaId": insights.nbaId,
				"parentCategoryId": insights.parentCategoryId,
				"message": displayDetails.header
			});
		}
	}

	async _insightsAction(replyReference, action) {
		this._telemetry.logEvent(NBAEvents.ACTION, {
			"screen": this._navigationContext.current.route.title,
			"nbaId": this.insights.nbaId,
			"parentCategoryId": this.insights.parentCategoryId,
			"outcome": action
		});

		const returnValue = await this.clientInsightsService.sendInsightsAction(replyReference);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to update insights action`, `_insightsAction`, returnValue.correlationId);
			return;
		}

		this.insightDetails = null;
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
				.insightDetails=${this.insightDetails}
				.updateInsights = ${(replyReference, action) => this._insightsAction(replyReference, action)}
				@settings-click="${() => this._showVASModal()}">
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
			return html`<capitec-loading-indicator data-automation-id="insights-loading-indicator"></capitec-loading-indicator>`;
		};

		return html``;
	}
}
window.customElements.define(`horizon-insights`, Insights);