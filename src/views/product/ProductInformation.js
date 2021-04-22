import { Configuration, EventAggregator, NavigationContext } from 'platform/core';
import { View, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/product/CnetProductInfo';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/VerifyCaller';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1,
	VERIFY_NOW: 2
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
		this.configuration = Configuration.getInstance();
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

		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.callerInformation = this.horizonStore.getCallerInformation();

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);

		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.navSub = this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._initialise());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyClick());
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.navSub.dispose();
		this.verifySub.dispose();

		super.disconnectedCallback();
	}

	// ---------
	// EVENTS
	// ---------

	async _viewBenefits() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}${this._config.type}/`);
	}
	
	_endCallClick() {
		if (this.incomingCallDetails) {
			this.renderMode = RENDER_MODE.END_CALL;
		}
	}

	_verifyClick() {
		this.renderMode = RENDER_MODE.VERIFY_NOW;
	}

	_skipVerification(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_verificationCancelled(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_clientVerified(event) {
		this.incomingCallDetails = event.detail.incomingCallDetails;
		this.callerInformation = event.detail.callerInformation;
		this._updateLeftBar();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {
		const currRoute = this.navigationContext.current;
		const type = currRoute.queryParams && currRoute.queryParams.type;
		
		this._config = CONFIG[type] || CONFIG.SavingsAccount;
		this.requestUpdate();
	}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);

		this.eventAggregator.publish(
			`horizon-update-left-hand-bar`,
			{
				hasFavourites: true,
				subtitle: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				},
				detail: {
					savingsAccount: ``,
					savingsPlan: ``,
					insure: ``,
					credit: ``
				}
			}
		);
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
			${this._renderVerifyNowModal()}
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
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage"
					@cancel="{${() => this.renderMode = RENDER_MODE.CREDIT_INFO}}">
				</horizon-end-call-session>`
			: html``;
	}

	_renderVerifyNowModal() {
		if (this.renderMode === RENDER_MODE.VERIFY_NOW) {
			return html`
				<horizon-verify-caller
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					@skip="${(e) => this._skipVerification(e)}"
					@cancel="${(e) => this._verificationCancelled(e)}"
					@verified="${(e) => this._clientVerified(e)}">
				</horizon-verify-caller>`;
		}
		return html``;
	}
}

customElements.define(`horizon-product-information`, ProductInformation);