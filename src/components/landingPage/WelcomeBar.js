import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/common/ProductButtonPanel';

/**
 * The Landing Page Left Hand Welcome bar is displayed on the intial landing page 
 * This component presents a greeting to the agent/user annd provides product buttons
 * for accessing the various product information landing pages.
 *
 * @export
 * @class LandingPageWelcome
 * @extends {Component}
 */
export class LandingPageWelcome extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.router = HorizonRouter.getInstance();

		this.fullname = ``;
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			// to extract client details from the service
			fullname: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.eventAggregator = EventAggregator.getInstance();
		this.welcomeSub = this.eventAggregator.subscribe(`horizon-update-welcome-bar`, (event) => this._onUpdateWelcome(event));
	}

	disconnectedCallback() {
		this.welcomeSub.dispose();
		
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onUpdateWelcome(event) {
		this.fullname = event.fullname;
	}

	_productButtonClick(event) {
		const product = event.detail.productButton;
		
		// Navigate to one of the "initial landing page" versions of the product info page.
		// These pagea are the pages that the agent can visit while waiting for a call
		switch (product) {
			case `SavingsAccount`:
				this.router.navigateToSavingsAccountProduct();
				break;
			case `LiveBetter`:
				this.router.navigateToLiveBetterProduct();
				break;
			case `SavingsPlan`:
				this.router.navigateToSavingsPlanProduct();
				break;
			case `Insure`:
				this.router.navigateToInsureProduct();
				break;
			case `Credit`:
				this.router.navigateToCreditProduct();
			default:
				// do nothing
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------


	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 100%;
				height: 100%;
				padding: 0px 0px 0px 0px;
				background-color: #f4f4f4;
				border:none;
			}

			.hello-card {
				width: 100%;
				height: 192px;
			}

			#hello-id {
				color: #003652;
				line-height: 72px;
				font-size: 48px;
				text-align: center;
				font: bold 38px/64px Hind Vadodara;
			}

			#name-id {
				color: #57595d;
				text-align: center;
				font: bold 18px/30px Hind Vadodara;
			}

			.userrole{
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width:100%;
				height:192px;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
				<div class="left-card">
					<div>
						<capitec-card class="hello-card">
								<capitec-group class="userrole" layout="absolute">
								<div></div>
								<div>
									<capitec-label id="hello-id" type="title" label="Hello"></capitec-label>
 									<capitec-label 
									 	id="name-id" 
										 label="${this.fullname}" 
										 type="subtitle"
										 data-automation-id="welcome-bar-user-name">
									</capitec-label>
								</div>
								</capitec-group>
						</capitec-card>
					</div>
					<horizon-product-button-panel
						@click="${(e) => this._productButtonClick(e)}">>
					</horizon-product-button-panel>
				</div>
			`;
	}
}

window.customElements.define(`horizon-welcome-bar`, LandingPageWelcome);