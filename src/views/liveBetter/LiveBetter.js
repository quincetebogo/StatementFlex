import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/productControls/liveBetterSavingsAccount/src/LiveBetterSavings';
import 'app/components/liveBetter/LiveBetterUnverifiedPage';
import 'app/components/dialogs/liveBetter/ManageAutomaticSavings';

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

	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_backToLBBLandingScreen() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}


	async _optionClick(option) {

		const transactionHistory = () => this._transactionHistory();
		const statements = () => this._getStatements();

		const actions = {
			'transaction-history': transactionHistory,
			'statements': statements,
			'automatic-savings': this._automaticSavings,
			'product-enquiry': this._productEnquiry
		};

		if (actions[option]) {
			await super._inicidentManager_(option, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();
			return actions[option]();
		}
	};

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.callerInformation.verificationStatus !== `non-client`) {
			
			// Live better landing page service call should come here - Data is mocked as below temporarily
			this.landingPageInfo = {
				accountNumber: '1928247288',
				accountAvailableBalance: 20567.23, 
				roundUpAmount: 5, 
				interestSweep: 'On',
				interestRatePercentage: '5.5%',
				accountStatus: 'Active',
				savingsAccountProductDescription: ``,
                savingsPlanProductDescription: ``,
				liveBetterProductDescription: ``,
                insureProductDescription: ``,
                creditProductDescription: ``,
                savingsAccountProductAmount: ``,
                savingsPlanProductAmount: ``,
				liveBetterProductAmount: ``,
                insureProductAmount: ``,
                creditProductAmount: ``
			};
			
			// Now we can update the information on the product buttons
			this._updateLeftBar();

			this.endCallContext = `LandingPage`;
			this.renderMode = RENDER_MODE.MAIN_PAGE;
				
		}
		this.loading = false;
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				liveBetterSavings: this.landingPageInfo.liveBetterProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				liveBetterSavings: this.landingPageInfo.liveBetterProductAmount,
				savingsPlan: this.landingPageInfo.savingsPlanProductAmount,
				insure: this.landingPageInfo.insureProductAmount,
				credit: this.landingPageInfo.creditProductAmount
			};
		}
		
		this.horizonStore.setCallerInformation(this.callerInformation);

		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_automaticSavings() {
		this.renderMode = RENDER_MODE.AUTOMATIC_SAVINGS;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.live-better`);
		window.open(`${globalOneUrl}`);
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
			${super._webTemplate()}
			${this._renderLandingPage()}
			${this._renderAutomaticSavings()}
		`;
	}

	_renderLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.VERIFY_NOW:
			case RENDER_MODE.AUTOMATIC_SAVINGS:
				return !this.loading 
					? html`
						${this._renderLiveBetterVerifiedLandingPage()}
						${this._renderLiveBetterUnverifiedLandingPage()}`
					: html``;
			default:
				return html``;
		}
	}

	_renderLiveBetterVerifiedLandingPage() { 

		return this.verificationStatus === `verified` 
			? html`
				<capitec-pc-live-better-savings
					class="liveBetter"
					.liveBetterAccountData = "${this.landingPageInfo}"
					@click="${(event) => this._optionClick(event.detail.selection)}">
				</capitec-pc-live-better-savings>`
			: html``;
		}

	_renderLiveBetterUnverifiedLandingPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-live-better-unverified-page
					class="liveBetter"
					@verify-now= "${() => this._verifyClick()}"
					@livebetter-enquiry="${(event) => this._productEnquiry(event)}">
				</horizon-live-better-unverified-page>`
			: html``;
	}

	_renderAutomaticSavings() {
		return this.renderMode === RENDER_MODE.AUTOMATIC_SAVINGS 
		? html`
			<horizon-manage-automatic-savings
				@cancel = "${() => this._backToLBBLandingScreen()}">
			</horizon-manage-automatic-savings>`
		: html``;
	}

}

customElements.define(`horizon-live-better`, LiveBetter);