import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { ViewBase } from '../common/ViewBase';
import { html } from 'platform/elements';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/dialogs/taxCertificates/TaxCertificates';
import 'app/components/dialogs/common/StatementsDialog';

import 'app/views/savingsPlan/FlexibleSavingsPlan';
import 'app/views/savingsPlan/FixedTermSavingsPlan';

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

const ACCOUNT_TYPE = {
	FLEXIBLE: 200,
	FIXED: 201,
	MULTIPLE: 1
};

const PLAN_TYPE = {
	NONE: `NONE`,
	SAVINGS_PLAN: `SAVINGS PLAN`,
	FIXED_TERM: `FIXED TERM SAVINGS PLAN`
};

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
		this.selectedAccountNumber = ``;
		this.planType = PLAN_TYPE.NONE;

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option, accountNumber) => {

			const statements = () => this._getStatements(accountNumber);
			const taxCertificates = () => this._taxCertificates(accountNumber);
			const productEnquiry = () => this._productEnquiry();
			const savingsCalculator = () => this._savingsCalculator();
			const interestRates = () => this._interestRates();
			const flexibleSavings = () => this._flexibleSavings(accountNumber);
			const fixedSavings = () => this._fixedSavings(accountNumber);

			const actions = {
				'statements': statements,
				'tax-certificates': taxCertificates,
				'product-enquiry': productEnquiry,
				'savings-calculator': savingsCalculator,
				'interest-rates': interestRates,
				'flexible-savings': flexibleSavings,
				'fixed-savings': fixedSavings
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

		if (this.verificationStatus === `non-client`) {}

		if (this.verificationStatus === `unverified`) {}

		this.loading = false;
		// this._performReturnToScreen();
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

	_flexibleSavings(accNumber) {
		this.renderMode = RENDER_MODE.FLEXIBLE_SAVINGS_PLAN_DETAILS;
		this.selectedSavingsPlanItem = this.landingPageInfo.savingsPlans.find(savingsPlan => savingsPlan.accountNumber === accNumber);
	}

	_fixedSavings(accNumber) {
		this.renderMode = RENDER_MODE.FIXED_SAVINGS_PLAN_DETAILS;
		this.selectedSavingsPlanItem = this.landingPageInfo.savingsPlans.find(savingsPlan => savingsPlan.accountNumber === accNumber);
	}

	_getStatements(accNumber) {
		// TO DO: Place holder for savings plan statements flow.
		const accountItem = this.landingPageInfo.savingsPlans.find(savingsPlan => savingsPlan.accountNumber === accNumber);
		const productInfo = ACCOUNT_INTCAT_ENUM[ACCOUNT_TYPE.FLEXIBLE];
		const accName = accountItem.planName.toLowerCase();

		this.clientProducts = [
			{
				'accountNumber': accountItem.accountNumber,
				'accountName': `${accName.charAt(0).toUpperCase()}${accName.slice(1)}`,
				'accountType': accountItem.planType,
				'accountOpenDate': accountItem.accountOpenDate,
				'type': productInfo.type,
				'category': productInfo.category,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order
			}
		];
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_cancelStatements() {
		this._backToLandingPage();
	}

	_backToLandingPage() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_taxCertificates(accNumber) {
		// TO DO: Place holder for tax certificate flow.
		this.selectedAccountNumber = accNumber;
		this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
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

	async _statementsAccConfirmed(event) {
		// const need = `statements-${event.detail.account}`;

		// await super._inicidentManager_(need, () => this._toggleBusyFlag());
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
			${this._renderStatements()}
			${this._renderTaxCertificate()}
			${this._renderFlexibleSavingsPlanDetails()}
			${this._renderFixedSavingsPlanDetails()}
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
				.savingsPlanDetails="${this.landingPageInfo?.savingsPlans}"

				@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.accountNumber)}">
			</capitec-pc-savings-plan>`;
	}

	_renderFlexibleSavingsPlanDetails() {
		return this.renderMode === RENDER_MODE.FLEXIBLE_SAVINGS_PLAN_DETAILS
			? html`
				<capitec-flexible-savings-plan-details
					.savingsPlanItemDetails="${this.selectedSavingsPlanItem}"

					@back="${() => this._backToLandingPage()}"
				>
				</capitec-flexible-savings-plan-details>
			`
			: html``;
	}

	_renderFixedSavingsPlanDetails() {
		return this.renderMode === RENDER_MODE.FIXED_SAVINGS_PLAN_DETAILS
			? html`
				<capitec-fixed-term-savings-plan-details
					.savingsPlanItemDetails="${this.selectedSavingsPlanItem}"

					@back="${() => this._backToLandingPage()}"
				>
				</capitec-fixed-term-savings-plan-details>
			`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements-dialog
					.cifNumber="${this.callerInformation.cifNumber}"
					.clientProducts="${this.clientProducts}"
					type="${``}"
					@cancel="${() => this._cancelStatements()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements-dialog>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				<horizon-tax-certificate
					cifNumber="${this.callerInformation.cifNumber}"
					accountNumber="${this.selectedAccountNumber}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-tax-certificate>
			`
			: html``;
	}  
}

customElements.define(`horizon-savings-plan`, SavingsPlan);