import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import 'app/components/common/MiniProfile';
import 'app/components/common/FavouritesTile';
import 'platform/components/buttons/ProductTile';

/**
 * ProfileAndProductSummaryBar displays the left hand bar of the Horizon display. This contains
 * the mini client profile, product buttons and various short cuts depending on the
 * state of the system
 *
 * @export
 * @class ProfileAndProductSummaryBar
 * @extends {Component}
 */
export class ProfileAndProductSummaryBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.EventAggregator = EventAggregator.getInstance();
		
		this.clientType = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			clientType: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.EventAggregator.subscribe(`horizon-update-left-hand-bar`, (event) => this._onUpdateLeftButtons(event));
	}

	// ---------
	// EVENTS
	// ---------

	_onUpdateLeftButtons(event) {
		this.clientType = event.clientType;
	}


	// --------- 
	// PRIVATE
	// ---------


	_onVerifyNowClick() {
		this.EventAggregator.publish(`horizon-verify-now-click`, {});
	}


	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 440px;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
			.horizon-client-authorised{
				display: flex;
				flex-direction: row;
				width: 438px;
				height: 48px;
				border-radius: 0 0 4px 4px;
				background-color: rgba(212,120,28,0.15);
			}
			#authorised-icon{
				margin: 13px 12px 0px 23px;
				height: 24px;
				width: 24px;
			}
			#authorised-text{
				height: 23px;
				width: 279px;
				color: #E47C28;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 23px;
				margin: 11px 0px 0px 0px;
				padding: 0px;
			}
			.client-profile-alert{
				height: 48px;
				background-color:#F9EBDD;
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 700;
				letter-spacing: 0;
				line-height: 23px;
				--theme-icon-size-default: 20px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-height: 48px;
			}
			.client-profile-error{
				height: 48px;
				background-color: #F7E2E1;
				color: rgb(200, 59, 55);
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 700;
				letter-spacing: 0;
				line-height: 21px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-height: 48px;
			}
			.verify-now-link{
				--theme-hyperlink-color:#D4781C;
			}
			.verify-via-app-link{
				padding-left:55px;
				--theme-hyperlink-color: rgb(200, 59, 55);
			}
			.favourites-button{
                padding: 0px 0px 0px 0px;
				width: 440px;
				margin-top: 16px;
			}
			`
		];
	}

	render() {
		return html`
		<section class="left-card">
		 	<horizon-mini-profile></horizon-mini-profile>
			 ${this.renderBanner()}
			 <horizon-favourites-tile class="favourites-button" label="Favourites" subtitle="Transact, dispute, cards and more"></horizon-favourites-tile>
			<horizon-product-bar ?disablenavigation=${true}></horizon-product-bar>
		</section>`;
	}


	renderBanner() {
		switch (this.clientType) {
			case `unverified-existing-client`: // banner checked
			case `unverified-prospective`:
				return html`
				<capitec-alert-banner class="client-profile-alert" type="warning">
					Client has not been verified
					<capitec-hyperlink class="verify-now-link" @click="${() => this._onVerifyNowClick()}" label="Verify Now">
					</capitec-hyperlink>
				</capitec-alert-banner>
				`;
			case `verified-existing-client`:
			case `verified-prospective`:
			case `non-client:`:
				return html``;
			default:
				return html``;
		}
		

		// This is to handle banner on 'Verification failed' screen, Once the screen is ready, this snippet helps to dispaly the banner. 
		/* if (this.clientType == 'verificationFailed') {
			  return html`
					<capitec-alert-banner class="client-profile-error" type="error-trans">
						Client failed security questions
						<capitec-hyperlink class="verify-via-app-link" @click="${() => this._onVerifyNowClick()}"
							label="Verify via the app"></capitec-hyperlink>
					</capitec-alert-banner>
					`;
		 }*/

	
		return html`
			<div class="horizon-client-authorised">
				<capitec-icon id="authorised-icon" size="small" icon="status/warning"></capitec-icon>
				<a id="authorised-text" href="">Not Authorised</a>
			</div>`;
	}
}

window.customElements.define(`horizon-profile-and-product-summary-bar`, ProfileAndProductSummaryBar);