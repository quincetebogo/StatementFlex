import { css, html } from 'platform/elements';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { ViewBase } from '../common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';
import { savingsPlanMocks } from 'app/mocks/SavingsPlanMocks';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/dialogs/taxCertificates/TaxCertificates';
import 'app/components/dialogs/common/StatementsDialog';

import 'app/views/savingsPlan/FlexibleSavingsPlan';
import 'app/views/savingsPlan/FixedTermSavingsPlan';

import 'app/views/savingsPlan/SavingsPlanServiceError';
import 'app/views/savingsPlan/SavingsPlanUnverifiedPage';

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

/**
 * Savings Plan View
 *
 * Events Raised
 * --------------
 * 
 * @export
 * @class SavingsPlan
 * @extends {SavingsPlan}
 * 
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

		this.savingsPlanDetails = [];
		this.configuration = Configuration.getInstance();
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.loading = true;
		this.selectedAccountNumber = ``;

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.accountViewType = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = (option, saveType, accountNumber) => {

			const statements = () => this._getStatements(accountNumber);
			const taxCertificates = () => this._taxCertificates(accountNumber);
			const productEnquiry = () => this._productEnquiry();
			const savingsCalculator = () => this._savingsCalculator();
			const interestRates = () => this._interestRates();
			const accountDetails = () => this._accountDetails(saveType, accountNumber);

			const actions = {
				'statements': statements,
				'tax-certificates': taxCertificates,
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
			landingPageInfo: { state: true },
			loading: { attribute: false },
			accountViewType: { state: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	_accountDetails(type, accNumber) {
		this.accountViewType = type;

		const flexibleSavePlan = () => this._getFlexibleSavePlan(accNumber);
		const fixedTermSavePlan = () => this._getFixedTermSavePlan(accNumber);

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

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {
			
			const landingRequest = {
				cifNumber: this.callerInformation.cifNumber,
				nationalIDNumber: this.callerInformation.southAfricanIDNumber,
				getGenericData: true
			};

			const returnValue = await this.savingsAccountService.savingsPlanLanding(landingRequest.cifNumber, landingRequest.nationalIDNumber, landingRequest.getGenericData);
			 
			if (returnValue.succeeded && returnValue.result) {
                this.landingPageInfo = returnValue.result;

				// Now we can update the information on the product buttons
				this.savingsPlanDetails = this.landingPageInfo.savingsPlans;
				this._formatSavingsPlanDetails();

				this._updateLeftBar();
				
			} else if (returnValue.succeeded) {
				this.horizonRouter.navigateToProductInfo(`SavingsPlan`);
			} else {
				this.savingsPlanDetails = null;
			}

		}

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.endCallContext = `LandingPage`;
		this.loading = false;
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				liveBetterSavings: this.landingPageInfo.liveBetterBankingProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				liveBetterSavings: this.landingPageInfo.liveBetterBankingProductAmount,
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
			},
			landingPageInfo: this.landingPageInfo
		};

		this.horizonStore.saveState(state);
	}

	_performReturnToScreen() {
		const returnToScreen = this.horizonStore.getReturnToScreen();

		if (returnToScreen && returnToScreen.optionalData) {
			this.eventAggregator.publish(`horizon-return-to-screen`, { option: returnToScreen.optionalData });
		}

		this.horizonStore.clearReturnScreen();
	}

	_formatDate(date) {
		const newdate = new Date(Date.parse(date));
		return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
	}

	_formatSavingsPlanDetails() {
		this.savingsPlanDetails.filter(item => item.planType === PLAN_TYPE.SAVINGS_PLAN).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.feesLastMonth = formatCurrency(item.feesLastMonth);
			item.maturityDate = this._formatDate(item.maturityDate);
			item.dateOpened = this._formatDate(item.dateOpened);
			item.lastUpdate = this._formatDate(item.lastUpdate);

			return item;
		});

		this.savingsPlanDetails.filter(item => item.planType !== PLAN_TYPE.SAVINGS_PLAN).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.availableContributions = formatCurrency(item.availableContributions);
			item.contributionLimit = formatCurrency(item.contributionLimit);
			item.totalContributions = formatCurrency(item.totalContributions);

			item.maturityDate = this._formatDate(item.maturityDate);
			item.dateOpened = this._formatDate(item.dateOpened);
			item.dateFixed = this._formatDate(item.dateFixed);
			item.lastUpdate = this._formatDate(item.lastUpdate);

			return item;
		});
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
	
	_getFlexibleSavePlan(accNumber) {
		// TO DO: "flexibleAccountDetails" details to be pulled and formated from services
		this.flexibleAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	_getFixedTermSavePlan(accNumber) {
		// TO DO: "fixedTermAccountDetails" details to be pulled and formated from services
		this.fixedTermAccountDetails = this.savingsPlanDetails.find(item => item.accountNumber === accNumber);
		this.renderMode = RENDER_MODE.ACCOUNT_DETAIL_VIEW;
	}

	async _findBranch() {
		const branchLocatorUrl = await this._configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
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
			${this._renderFlexibleDetailsView()}
			${this._renderFixedTermDetailsView()}
			${this._renderStatements()}
			${this._renderTaxCertificate()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE && !this.loading
			? html`
				${this._renderSavingsPlanVerifiedLandingPage()}
				${this._renderSavingsPlanUnverifiedPage()}`
			: html``;
	}
	
	_renderSavingsPlanVerifiedLandingPage() {
		return this.savingsPlanDetails ? html`
			<capitec-pc-savings-plan
				.savingsPlanDetails="${this.savingsPlanDetails}"

				@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.saveType, e.detail.accountNumber)}">
			</capitec-pc-savings-plan>`
			: html`
				${this._renderSavingsPlanServiceError()}
			`;
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
				<capitec-fixed-term-savings-plan-details
					.fixedTermAccountDetails="${this.fixedTermAccountDetails}"

					@back="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</capitec-fixed-term-savings-plan-details>`
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
	
	_renderSavingsPlanUnverifiedPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-savings-plans-unverified-page
					class="liveBetter"
					@verify-now= "${() => this._verifyClick()}">
				</horizon-savings-plans-unverified-page>`
			: html``;
	}

	_renderSavingsPlanServiceError() {
		return !this.savingsPlanDetails
			? html`
				<horizon-savings-plans-service-error
					class="liveBetter"
					@find-branch= "${() => this._findBranch()}">
				</horizon-savings-plans-service-error>`
			: html``;
	}
}

customElements.define(`horizon-savings-plan`, SavingsPlan);