import { View, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	END_CALL: 1
});

const CONFIG = {
	SavingsAccount: {
		type: `transact`,
		header: `Savings Account`,
		prodcut: `SavingsAccount`
	},
	SavingsPlan: {
		type: `save`,
		header: `Savings Plans`,
		prodcut: `SavingsPlan`
	},
	Insure: {
		type: `insure`,
		header: `Insure`,
		prodcut: `Insure`
	},
	Credit: {
		type: `credit`,
		header: `Credit`,
		prodcut: `Credit`
	}
};

/**
 * Implements the dynamic view for Product Information screen.
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
			renderMode: { type: Number }
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

	_viewBenefits(){
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

	static get styles() {
		return [
			super.styles,
			css`
				.product-info{
					width: 100%;
					height: 888px;
				}
				.content{
					width: 100%;
					height: 788px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
				}
				#id-more-info {
					margin: 43px auto 8px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;	
				}
				.insights-subtitle{
					color: #3A3A3A;
					font-size: 15px;
					line-height: 20px;
					margin-bottom: 32px;
				}
				.benefits-button {
					height: 48px;
					width: 146px;
					--theme-button-primary-border-width: 0px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
				}
			`
		];
	}

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
			<capitec-card class="product-info">
			<capitec-title-bar
				type="${this._config.type}">
					<capitec-icon
						size="medium"
						icon="product/${this._config.type}-white">
					</capitec-icon>
					<capitec-label
						label="${this._config.header}"
						type="title">
					</capitec-label>
			</capitec-title-bar>
				
			<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
				<capitec-content-box
					layout="vertical"
					halign="center"
					valign="center"
					gap="none">
						<img src="images/landingPageImages/marketing.svg"/>
						<capitec-label
							id="id-more-info"
							label="More info to come">
						</capitec-label>
						<capitec-label
							class="insights-subtitle"
							label="Want to know the benefits and fees visit the Capitec website for all info and more">
						</capitec-label>
						<capitec-button
							class="benefits-button"
							type="primary"
							label="View Benefits"
							@click="${() => this._viewBenefits()}">
						</capitec-button>
				</capitec-content-box>
			</capitec-group>
		</capitec-card>`;
	}

	_renderEndCallSessionModal() {

		return this.renderMode === RENDER_MODE.END_CALL ? 
			html`
				<horizon-end-call-session 
					@cancel="{${() => this.renderMode = RENDER_MODE.CREDIT_INFO}}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage">
				</horizon-end-call-session>`
			: html ``;
	}
}

customElements.define(`horizon-product-information`, ProductInformation);