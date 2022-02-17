import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { ViewBase } from '../common/ViewBase';
import { html } from 'platform/elements';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';

/**
 * Savings Plan View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class SavingsPlan
 * @extends {SavingsPlan}
 */
export class SavingsPlan extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.loading = true;

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option) => {

			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const productEnquiry = () => this._productEnquiry();
			const savingsCalculator = () => this._savingsCalculator();
			const interestRates = () => this._interestRates();

			const actions = {
				'statements': statements,
				'tax-certificate': taxCertificates,
				'product-enquiry': productEnquiry,
				'savings-calculator': savingsCalculator,
				'interest-rates': interestRates
			};

			if (actions[option]) {
				return actions[option]();
			}
		};
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			landingPageInfo: { state: true },
			loading: { attribute: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	// N/A

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			/* 
				TO DO: Savings plan landing page service call should come here. - Done
					If client has savings plan product, navigate to landing screens.
					If client doesn't have savings plan product, navigate to non-client - more info screen.

					Update left bar details once available from channel service call
			*/

			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsAccountService.savingsPlanLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);
			 
			if (returnValue.succeeded && returnValue.result) {
                this.landingPageInfo = returnValue.result;

				// Now we can update the information on the product buttons
				this._updateLeftBar();
				this.endCallContext = `LandingPage`;
				this.renderMode = RENDER_MODE.MAIN_PAGE;
			}
		} else {
			this.horizonRouter.navigateToProductInfo(`Save`);
		}

		this.loading = false;
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				savingsPlan: this.landingPageInfo.savingsPlanProductAmount,
				insure: this.landingPageInfo.insureProductAmount,
				credit: this.landingPageInfo.creditProductAmount
			};
		}

		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_getStatements() {
		// TO DO: Place holder for savings plan statements flow.
	}

	_taxCertificates() {
		// TO DO: Place holder for tax certificate flow.
	}

	async _savingsCalculator() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/`);
	}

	async _interestRates() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/rates-and-fees/`);
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.global-one`);
		window.open(`${globalOneUrl}/save/`);
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderLandingPage()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE && !this.loading
			? html`
				${this._renderSavingsPlanVerifiedLandingPage()}`
			: html``;
	}
	
	_renderSavingsPlanVerifiedLandingPage() {
			return html`
				<capitec-pc-savings-plan
					.savingsPlanDetails="${this.landingPageInfo.savingsPlans}"

					@option-click = "${(e) => this._optionClick(e.detail.option)}">
				</capitec-pc-savings-plan>`;
		}
}

customElements.define(`horizon-savings-plan`, SavingsPlan);