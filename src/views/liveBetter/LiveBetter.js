import { css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from 'app/views/common/ViewBase';

import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';

import 'app/productControls/liveBetterSavingsAccount/src/LiveBetterSavings';
import 'app/productControls/liveBetterSavingsAccount/src/AccountDetails';

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

	_accountDetails() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ACCOUNT_NUMBER, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_ACCOUNT_DETAILS
		});

		this.renderMode = RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS;
	}

	_toggleRoundUp() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ROUND_UP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_toggleInterestSweep() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_INTEREST_SWEEP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_backToLBBLandingScreen() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _optionClick(option) {

		const transactionHistory = () => this._transactionHistory();
		const statements = () => this._getStatements();
		const automaticSavings = () => this._automaticSavings();
		const productEnquiry = () => this._productEnquiry();

		const actions = {
			'transaction-history': transactionHistory,
			'statements': statements,
			'automatic-savings': automaticSavings,
			'product-enquiry': productEnquiry
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
			
			// TO DO: Telemetry event should start if only client has LBB account. 
			// TO DO: If not, navigate to View benefits(non-client) screen without starting this span
			this._telemetry.startSpan(LiveBetterEvents.LIVE_BETTER, {
				"screen": TelemetryScreen.LIVE_BETTER,
				"liveBetter": true
			});
			
			// Live better landing page service call should come here - Data is mocked as below temporarily
			this.landingPageInfo = {
				accountNumber: `1928247288`,
				accountAvailableBalance: 20567.23, 
				roundUpAmount: 5, 
				interestSweep: `On`,
				interestRatePercentage: `5.5%`,
				accountStatus: `Active`,
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

	_transactionHistory() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_TRANSACTION_HISTORY, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY
		});
	}

	_getStatements() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_STATEMENTS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_SATEMENTS
		});
	}

	_automaticSavings() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_AUTOMATIC_SAVINGS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});

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
			case RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS:
				return this._renderAccountDetails();
				break;
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
					@option-click = "${(e) => this._optionClick(e.detail.option)}"
					@account-details="${() => this._accountDetails()}"
					@round-up="${() => this._toggleRoundUp()}"
					@interest-sweep="${() => this._toggleInterestSweep()}">
				</capitec-pc-live-better-savings>`
			: html``;
		}

	_renderLiveBetterUnverifiedLandingPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-live-better-unverified-page
					class="liveBetter"
					@verify-now= "${() => this._verifyClick()}"
					@product-enquiry="${() => this._productEnquiry()}">
				</horizon-live-better-unverified-page>`
			: html``;
	}

	_renderAccountDetails() {
		return this.renderMode === RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS 
			? html`
				<capitec-pc-live-better-account-details
					@back= "${() => this._backToLBBLandingScreen()}">
				</capitec-pc-live-better-account-details>`
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