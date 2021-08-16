import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/liveBetter/LiveBetterLandingPage';
import 'app/components/liveBetter/LiveBetterUnverifiedPage';

/**
 * Live Better View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class LiveBetter
 * @extends {ViewBase}
 */
export class LiveBetter extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.loading = true;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = async (option) => {

			const transactionHistory = () => this._transactionHistory();
			const statements = () => this._getStatements();
			const automaticSavings = () => this._automaticSavings();

			const actions = {
				'transaction-history': transactionHistory,
				'statements': statements,
				'automatic-savings': automaticSavings
			};

			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
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

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.callerInformation.verificationStatus === `verified`) {
			this.landingPageInfo = {
				accountNumber: '1928247288',
				accountAvailableBalance: 20567.23, 
				roundUpAmount: 5, 
				interestSweep: 'On',
				interestRatePercentage: '5.5%',
				accountStatus: 'Active',
			};

			// Live better landing page service call should come here
			

				// Now we can update the information on the product buttons
				// TODO: update the leftBr once CS is implemented
				// this._updateLeftBar();
				this.endCallContext=`LandingPage`;
				this.renderMode = RENDER_MODE.MAIN_PAGE;
				
		} else if (this.callerInformation.verificationStatus === `unverified`) {
			this.renderMode = RENDER_MODE.LIVE_BETTER_UNVERIFIED;
		}

		this.loading = false;
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

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
	}

	async _productEnquiry(event, type) {
		if (event.detail.enquiry === `product-enquiry`) {
			const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.live-better`);
			window.open(`${globalOneUrl}`);
		}
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			.liveBetter{
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderLiveBetterVerifiedLandingPage()}			
			${this._renderLiveBetterUnverifiedLandingPage()}
			${super._webTemplate()}
		`;
	}

	_renderLiveBetterVerifiedLandingPage() {
		return !this.loading && this.renderMode === RENDER_MODE.MAIN_PAGE
			? html`
				<horizon-live-better-landing-page
					class="liveBetter"
					.landingPageInfo = "${this.landingPageInfo}"
					@option-click="${(event) => this._optionClick(event.detail.option)}"
					@savings-enquiry="${(event) => this._productEnquiry(event, `liveBetter`)}">
				</horizon-live-better-landing-page>`
			: html``;
	}

	_renderLiveBetterUnverifiedLandingPage() {
		return !this.loading && this.renderMode === RENDER_MODE.LIVE_BETTER_UNVERIFIED
			? html`
				<horizon-live-better-unverified-page
					class="liveBetter">
				</horizon-live-better-unverified-page>`
			: html``;
	}


}

customElements.define(`horizon-live-better`, LiveBetter);