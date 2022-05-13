import { Component, css, html } from 'platform/elements';

/**
 * Savings Plans landing screen component - un-verified view
 *
 * Events Raised
 * -------------
 * 
 * verify-now
 * product-enquiry
 * 
 * @export
 * @class SavingsPlanUnverifiedPage
 * @extends {Component}
 */
export class SavingsPlanUnverifiedPage extends Component {

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
	 * @memberof SavingsPlanUnverifiedPage
	 */
	
	static get properties() {
		return {
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_verifyNowClick() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {}));
	}

	_productEnquiry() {
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
				capitec-card {
					width: 100%;
					height: 888px;
				}
				.content {
					width: 100%;
					height: 679px;
				}
				.savings-plan-title {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
					--theme-type-primary-background: url(/images/liveBetter/LBB_bg-1092x64.png);
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
				.content-subtitle {
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
					margin: 17px 0px 15px 0px;
					width: auto;
				}
				horizon-option-button {
					width: 186px;
					height: 80px;
					margin-left: 16px;
					padding: 0px;
					
					--horizon-option-btn-text-margin-top: 3px;
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
			<capitec-card data-automation-id="savings-plan-landing-screen">
				<capitec-title-bar 
					class="savings-plan-title"
					data-automation-id="savings-plan-landing-title"
					type="save">
						<capitec-icon
							size="medium"
							icon="product/save-white">
						</capitec-icon>
						<capitec-label label="Savings Plans" type="Title"></capitec-label>
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
							@click="${() => this._verifyNowClick()}">
						</capitec-button>
				</capitec-group>
				${this._renderOptionGroup()}
			</capitec-card>`;
	}

	_renderOptionGroup() {
		return html`
		<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">
			<capitec-title-bar
				type="default"
				label="Explore Live Better"
				class="other-options">
			</capitec-title-bar>
		
			<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button
					data-automation-id="savings-plans-unverified-product-enquiry"
					label="Product enquiry"
					icon="system/info-action"
					@click="${() => this._productEnquiry()}">
				</horizon-option-button>
			</capitec-group>
		</capitec-group>`;
	}
}
window.customElements.define(`horizon-savings-plans-unverified-page`, SavingsPlanUnverifiedPage);

/**
 * When Verify Now button is clicked
 *
 * @example
 * <horizon-savings-plans-unverified-page ... @verify-now="${this._handler}"></horizon-savings-plans-unverified-page>
 *
 * @event SavingsPlanUnverifiedPage#verify-now
 * @type {Object} - N/A
 */