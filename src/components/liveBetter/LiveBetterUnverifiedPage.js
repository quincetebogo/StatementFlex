import { Component, css, html } from 'platform/elements';

/**
 * Live Better landing screen component - un-verified view
 *
 * Events Raised
 * -------------
 * 
 * verify-now
 * product-enquiry
 * 
 * @export
 * @class LiveBetterUnverifiedPage
 * @extends {Component}
 */
export class LiveBetterUnverifiedPage extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/*
	 * @readonly
	 * @static
	 * @memberof LiveBetterUnverifiedPage
	 */
	
	static get properties() {
		return {
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyNow() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {}));
	}

	_liveBetterEnquiry(productEnquiry) {
		this.dispatchEvent(new CustomEvent(`product-enquiry`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	// N/A
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.main-card{
					width: 100%;
					height: 888px;
				}
				.content{
					width: 100%;
					height: 679px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
					--theme-type-primary-background: url(/images/liveBetter/lbb-bg-1092x64.png);
				}
				capitec-group > img {
					height: 182px;
					width: 252px;
				}
				.content-header {
					margin: 32px auto 23px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;
				}
				.content-subtitle{
					color: #3A3A3A;
					font-size: 15px;
					line-height: 20px;
					text-align: center;
					max-width: 684px;
					margin-bottom: 32px;
				}
				.verify-button {
					height: 48px;
					width: 146px;
					--theme-button-primary-border-width: 0px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
				}
				
				.other-options {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;

					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
				}
				
				.options-group {
					height: 80px; 
					margin: 16px 0px 15px 0px;
					width: auto;
				}
				horizon-option-button {
					width: 204px;
					height: 80px;

					--horizon-option-btn-text-margin-top: 3px;
				}
				.button-margin {
					height: 80px;
					width: 186px;
					margin-left: 16px;
					padding: 0px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}		
			`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card 
				data-automation-id="live-better-unverified-page"
				class="main-card">
					<capitec-title-bar
						data-automation-id="live-better-unverified-title"
						type="primary">
							<img src='/images/liveBetter/live-better-white.svg'/>
							<capitec-label
								label="Live Better Savings Account"
								type="title">
							</capitec-label>
					</capitec-title-bar>
					
					<capitec-group
						class="content"
						layout="vertical"
						halign="center"
						valign="center"
						gap="none">
							<img src="platform/illustrations/authenticate.svg">
							<capitec-label
								data-automation-id="live-better-unverified-header"
								class="content-header"
								label="Client not verified">
							</capitec-label>
							<capitec-label
								data-automation-id="live-better-unverified-subtitle"
								class="content-subtitle"
								label="We need to verify your details before doing any transactions on your account.">
							</capitec-label>
							<capitec-button
								data-automation-id="live-better-unverified-verify-now"
								class="verify-button"
								type="primary"
								label="Verify Now"
								@click="${() => this._verifyNow()}">
							</capitec-button>
					</capitec-group>
					
					<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">
						<capitec-title-bar
							type="default"
							label="Explore Live Better"
							class="other-options">
						</capitec-title-bar>
						<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
							<horizon-option-button 
									data-automation-id="live-better-unverified-product-enquiry"
									class="button-margin"
									label="Product enquiry"
									icon="system/info-action"
									@click="${() => this._liveBetterEnquiry(`product-enquiry`)}">
							</horizon-option-button>
						</capitec-group>
					</capitec-group>
			</capitec-card>`;
	}
}
window.customElements.define(`horizon-live-better-unverified-page`, LiveBetterUnverifiedPage);

/**
 * When Verify Now button is clicked
 *
 * @example
 * <horizon-live-better-unverified-page ... @verify-now="${this._handler}"></horizon-live-better-unverified-page>
 *
 * @event LiveBetterUnverifiedPage#verify-now 	
 * @type {Object} - N/A
 */

/**
 * When a Product Enquiry button on Related options is clicked
 *
 * @example
 * <horizon-live-better-unverified-page ... @product-enquiry="${this._handler}"></horizon-live-better-unverified-page>
 *
 * @event LiveBetterUnverifiedPage#product-enquiry
 * @type {Object} - N/A
 */
