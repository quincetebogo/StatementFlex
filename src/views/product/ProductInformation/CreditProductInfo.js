import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/product/ProductInfo';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	CREDIT_INFO: 0,
	END_CALL: 1
});

/**
 * Implements the view for Credit Product Information screen.
 * 
 * @export
 * @class CreditProductInfo
 * @extends {View}
 */
export class CreditProductInfo extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.renderMode = RENDER_MODE.CREDIT_INFO;
		this.pageDetails = null;
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();
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
		const state = this.horizonStore.recoverState();

		this.incomingCallDetails = state.incomingCallDetails;
		this.callerInformation = state.callerInformation;
		this._updateMiniProfile();

		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);

		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		
		this.pageDetails = {
			title: `Credit`,
			type: `credit`,
			image: `credit-white`,
			link: ``
		};

	}

	// ---------
	// EVENTS
	// ---------

	_viewBenefits(){
		window.open("https://www.capitecbank.co.za/global-one/credit/")
	}
	
	_endCallClick() {
		if (this.incomingCallDetails) {
			this.renderMode = RENDER_MODE.END_CALL;
		}
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateMiniProfile() {
		const state = { 
			miniProfile: {
				name: this.callerInformation.isNonClient ? this.callerInformation.nonClientFullName : this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: this.callerInformation.verificationStatus === `verified`,
				isConfirmed: this.callerInformation.isConfirmed,
				isVerified: this.callerInformation.verificationStatus === `verified`,	//Always 'false' because, this view is only for 'un-verified' and 'non-client'.
				verificationFailed: this.callerInformation.verificationStatus === `failed`,
				is3rdParty: this.callerInformation.verificationStatus === `3rdparty`,
				isNonClient: this.callerInformation.verificationStatus === `non-client`
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.savings-details{
					width:100%;
					height:100%;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderCreditProductInfo()}
			${this._renderEndCallSessionModal()}
		`;
	}

	_renderCreditProductInfo() {
		if(this.renderMode === RENDER_MODE.CREDIT_INFO){
		return html`
			<horizon-product-info 
				class="savings-details"
				.pageDetails = "${this.pageDetails}"
				@view-benefits ="${() => this._viewBenefits()}">
			</horizon-product-info>`;
		}
	}

	_renderEndCallSessionModal() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session 
					@cancel="{${() => this.renderMode = RENDER_MODE.CREDIT_INFO}}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage">
				</horizon-end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`horizon-credit-product-info`, CreditProductInfo);