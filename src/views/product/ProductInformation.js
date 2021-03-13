import { EventAggregator, NavigationContext } from 'platform/core';
import { View, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/product/CnetProductInfo';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1
});

const CONFIG = {
	SavingsAccount: {
		type: `transact`,
		header: `Savings Account`,
		product: `SavingsAccount`
	},
	SavingsPlan: {
		type: `save`,
		header: `Savings Plans`,
		product: `SavingsPlan`
	},
	Insure: {
		type: `insure`,
		header: `Insure`,
		product: `Insure`
	},
	Credit: {
		type: `credit`,
		header: `Credit`,
		product: `Credit`
	}
};

/**
 * Implements the dynamic view for Product Information screen. This opens the appropriate
 * page on CNET to allow the agent to provide the client with product information
 * 
 * @export
 * @class ProductInformation
 * @extends {View}
 */
export class ProductInformation extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this._config = {};

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.navigationContext = NavigationContext.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			renderMode: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();

		const state = this.horizonStore.recoverState();
		this.incomingCallDetails = state.incomingCallDetails;

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);
		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._initialise());
	}

	// ---------
	// EVENTS
	// ---------

	_viewBenefits() {
		window.open(`https://www.capitecbank.co.za/global-one/${this._config.type}/`);
	}
	
	_endCallClick() {
		if (this.incomingCallDetails) {
			this.renderMode = RENDER_MODE.END_CALL;
		}
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		const currRoute = this.navigationContext.current;
		const type = currRoute.queryParams && currRoute.queryParams.type;
		
		this._config = CONFIG[type] || CONFIG[`SavingsAccount`];
		this.requestUpdate();
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
			${this._renderEndCallSessionModal()}
		`;
	}

	_renderProductInfo() {
		return html`
			<horizon-cnet-product-info 
				viewType="${this._config.type}" 
				viewHeader=${this._config.header}
				@view-benefits="${() => this._viewBenefits()}"
				>
			</horizon-cnet-product-info>`;
	}

	_renderEndCallSessionModal() {

		return this.renderMode === RENDER_MODE.END_CALL 
			? html`
				<horizon-end-call-session 
					@cancel="{${() => this.renderMode = RENDER_MODE.CREDIT_INFO}}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage">
				</horizon-end-call-session>`
			: html``;
	}
}

customElements.define(`horizon-product-information`, ProductInformation);