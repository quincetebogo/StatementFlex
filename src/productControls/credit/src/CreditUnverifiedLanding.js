import { Component, css, html } from 'platform/elements';

/**
 * Credit landing screen component - un-verified view
 *
 * Events Raised
 * -------------
 * 
 * verify-now
 * 
 * @export
 * @class CreditUnverifiedLanding
 * @extends {Component}
 */
export class CreditUnverifiedLanding extends Component {

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
					height: 824px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
				}
				capitec-group > capitec-image {
					height: 182px;
					width: 252px;
					margin-top: 125px;
				}
				.content-header {
					margin: 36px auto 23px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;
				}
				.content-subtitle{
					color: #3A3A3A;
					font-size: 16px;
					line-height: 20px;
					text-align: center;
					max-width: 684px;
					margin-bottom: 32px;
				}
				.verify-button {
					height: 48px;
					width: 128px;
					--theme-button-primary-border-width: 0px;
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
				data-automation-id="credit-unverified-landing"
				class="main-card">
					<capitec-title-bar
						data-automation-id="credit-unverified-title"
						type="credit">
							<capitec-icon 
								size="default" 
								icon="product/credit-white">
							</capitec-icon>

							<capitec-label
								label="Credit"
								type="title">
							</capitec-label>
					</capitec-title-bar>
					
					<capitec-group
						class="content"
						layout="vertical"
						halign="center"
						valign="top"
						gap="none">
							<capitec-image src="platform/illustrations/authenticate.svg">
							</capitec-image>
							<capitec-label
								data-automation-id="credit-unverified-header"
								class="content-header"
								label="Verify details">
							</capitec-label>
							<capitec-label
								data-automation-id="credit-unverified-subtitle"
								class="content-subtitle"
								label="We need to verify your details before doing any transactions on your account.">
							</capitec-label>
							<capitec-button
								data-automation-id="credit-unverified-verify-now-button"
								class="verify-button"
								type="primary"
								label="Verify Now"
								@click="${() => this._verifyNow()}">
							</capitec-button>
					</capitec-group>
			</capitec-card>`;
	}
}
window.customElements.define(`capitec-pc-credit-unverified-landing`, CreditUnverifiedLanding);

/**
 * When Verify Now button is clicked
 *
 * @example
 * <capitec-pc-credit-unverified-landing ... @verify-now="${this._handler}"></capitec-pc-credit-unverified-landing>
 *
 * @event CreditUnverifiedLanding#verify-now
 * @type {Object} - N/A
 */