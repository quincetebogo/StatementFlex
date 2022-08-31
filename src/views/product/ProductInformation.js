import { Configuration, NavigationContext } from 'platform/core';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';
import { ProductInfoEvents } from 'app/constants/telemetry/events/ProductInformation';
import { ViewBase } from 'app/views/common/ViewBase';
import { html } from 'platform/elements';

import 'app/components/product/CnetProductInfo';

const CONFIG = {
	SavingsAccount: {
		type: `transact`,
		header: `Savings Account`,
		product: `savings-product-info`
	},
	SavingsPlan: {
		type: `save`,
		header: `Savings Plans`,
		product: `savings-plan-info`
	},
	Insure: {
		type: `insure`,
		header: `Insure`,
		product: `insure-product-info`
	},
	Credit: {
		type: `credit`,
		header: `Credit`,
		product: `credit-product-info`
	},
	LiveBetter: {
		type: `liveBetter`,
		header: `Live Better Savings Account`,
		product: `live-better-product-info`
	}
};

/**
 * Implements the dynamic view for Product Information screen. This opens the appropriate
 * page on CNET to allow the agent to provide the client with product information
 * 
 * @export
 * @class ProductInformation
 * @extends {ViewBase}
 */
export class ProductInformation extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this._config = {};

		this.navigationContext = NavigationContext.getInstance();
		this.configuration = Configuration.getInstance();
		this.endCallContext = `ProductEnquiry`;
	}

	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incidentDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);

		this.navSub = this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._initialise());
	}

	disconnectedCallback() {
		this.navSub.dispose();

		super.disconnectedCallback();

		// Rule: When unloading any of the product info screen, if the current active incident is not completed/ closed
		// which means we haven't started it, so manually setting it to Not strated status
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED && this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.CLOSED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
	}

	// ---------
	// EVENTS
	// ---------

	async _viewBenefits() {
		let productUrl = ``;

		if (this._config.type === `liveBetter`) {
			this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_VIEW_BENEFITS, {});
			productUrl = await this.configuration.getSetting(`otherSystemsURL.live-better`);
		} else {
			this._telemetry.logEvent(ProductInfoEvents[`VIEW_BENEFITS_${this._config.type}`], {});

			const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
			productUrl = `${globalOneUrl}${this._config.type}`;
		}
		
		window.open(`${productUrl}/`);
		
		this._updateIncidentState();
	}


	// ---------------
	// PRIVATE METHODS
	// ---------------

	_navigationContextUpdate() {
		const currRoute = this.navigationContext.current;
		const type = currRoute.queryParams && currRoute.queryParams.type;
		
		this._config = CONFIG[type];
	}

	async _initialise() {
		this._navigationContextUpdate();
		
		if (this._config) {
			await super._inicidentManager_(this._config.product, () => this._toggleBusyFlag());
			await super.createAndClassifySubsIncident(null, false);
		} else {
			this._config = CONFIG.SavingsAccount;
		}

		this.requestUpdate();
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;

		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProductInfo()}
			${this._renderLoadingIndicator()}

			${super._webTemplate()}
		`;
	}

	_renderProductInfo() {
		return html`
			<horizon-cnet-product-info
				data-automation-id="product-information-type-${this._config.type}"
				viewType="${this._config.type}" 
				viewHeader=${this._config.header}
				@view-benefits="${() => this._viewBenefits()}">
			</horizon-cnet-product-info>`;
	}
}

customElements.define(`horizon-product-information`, ProductInformation);