import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from '../common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { html } from 'platform/elements';
import { savingsPlanMocks } from 'app/mocks/SavingsPlanMocks';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/views/savingsPlan/FixedTermSavingsPlan';
import 'app/views/savingsPlan/FlexibleSavingsPlan';

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

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
		this.accountViewType = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option, type) => {

			const statements = () => this._getStatements();
			const taxCertificates = () => this._taxCertificates();
			const productEnquiry = () => this._productEnquiry();
			const savingsCalculator = () => this._savingsCalculator();
			const interestRates = () => this._interestRates();
			const accountDetails = () => this._accountDetails(type);

			const actions = {
				'statements': statements,
				'tax-certificate': taxCertificates,
				'product-enquiry': productEnquiry,
				'savings-calculator': savingsCalculator,
				'interest-rates': interestRates,
				'account-details': accountDetails
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
			loading: { attribute: false },
			accountViewType: { state: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_accountDetails(type) {
		this.accountViewType = type;

		const flexibleSavePlan = () => this._getFlexibleSavePlan();
		const fixedTermSavePlan = () => this._getFixedTermSavePlan();

		const saveProducts = {
			'flexible-save-plan': flexibleSavePlan,
			'fixed-term-save-plan': fixedTermSavePlan
		};

		if (saveProducts[this.accountViewType]) {
			return saveProducts[this.accountViewType]();
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			/* TO DO: Savings plan landing page service call should come here.
					If client has savings plan product, navigate to landing screens.
					If client doesn't have savings plan product, navigate to non-client - more info screen.

					Update left bar details once available from channel service call*/

			// ${this._updateLeftBar()};
	
		
			this.savingsPlanDetails = savingsPlanMocks;
			this._formatSavingsPlanDetails();

			this.renderMode = RENDER_MODE.MAIN_PAGE;
			this.endCallContext = `LandingPage`;
			this.loading = false;
		}
	}

	_formatSavingsPlanDetails() {
		this.savingsPlanDetails.flexibileSavingsPlanSummaryList.map(item => {
			item.accountBalance = formatCurrency(item.accountBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.saveType = SAVE_PLAN_TYPE.FLEXIBLE;

			return item;
		});

		this.savingsPlanDetails.fixedSavingsPlanSummaryList.map(item => {
			item.accountBalance = formatCurrency(item.accountBalance);
			item.saveType = SAVE_PLAN_TYPE.FIXED_TERM;

			return item;
		});
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

	_getFlexibleSavePlan() {
		// TO DO: "flexibleAccountDetails" details to be pulled and formated from services
		this.flexibleAccountDetails = savingsPlanMocks.flexibleSavingsPlanDetailList;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	_getFixedTermSavePlan() {
		// TO DO: "fixedTermAccountDetails" details to be pulled and formated from services
		this.fixedTermAccountDetails = savingsPlanMocks.fixedTermSavingsPlanDetailList;
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
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
			${this._renderFlexibleDetailsView()}
			${this._renderFixedTermDetailsView()}
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
					.savingsPlanDetails="${this.savingsPlanDetails}"
					@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.saveType)}">
				</capitec-pc-savings-plan>`;
		}

	_renderFlexibleDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FLEXIBLE
			? html`
				<capitec-flexible-savings-plan-details
					.flexibleAccountDetails="${this.flexibleAccountDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</capitec-flexible-savings-plan-details>
			`
			: html``;
	}

	_renderFixedTermDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FIXED_TERM
			? html`
				<horizon-fixed-term-savings-plan
					.fixedTermAccountDetails="${this.fixedTermAccountDetails}"
					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-fixed-term-savings-plan>`
			: html``;
	}
	
}

customElements.define(`horizon-savings-plan`, SavingsPlan);