import { ACCOUNT_TYPES, ACCOUNT_TYPE_CODE, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { css, html } from 'platform/elements';
import { formatStringAsPascalCase, getMonthName } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { SavingsPlanEvents } from 'app/constants/telemetry/events/SavingsPlan';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from '../common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/productControls/SavingsPlan/SavingsPlanLanding';
import 'app/dialogs/taxCertificates/TaxCertificates';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/dialogs/statements/Statements';

import 'app/views/savingsPlan/FlexibleSavingsPlan';
import 'app/views/savingsPlan/FixedTermSavingsPlan';

import 'app/views/savingsPlan/SavingsPlanServiceError';
import 'app/views/savingsPlan/SavingsPlanUnverifiedPage';

const SAVE_PLAN_TYPE = {
	FLEXIBLE: `flexible-save-plan`,
	FIXED_TERM: `fixed-term-save-plan`
};

const TAX_TYPE = {
	IT3B: `iT3BTaxCertificates`,
	IT3S: `iT3STaxCertificates`
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
		this.selectedAccountNumber = ``;
		this.taxCertType = ``;

		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.accountViewType = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialise();

		this._optionClick = async (option, saveType, accountNumber, accountName) => {

			const statements = () => this._getStatements(accountNumber, saveType);
			const taxCertificates = () => this._taxCertificates(accountNumber, accountName);
			const productEnquiry = () => this._productEnquiry();
			const interestRates = () => this._interestRates();

			const actions = {
				'statements': statements,
				'tax-certificate': taxCertificates,
				'product-enquiry': productEnquiry,
				'interest-rates': interestRates
			};

			if (actions[option]) {
				await super._inicidentManager_(`${option}-save`, () => this._toggleBusyFlag());
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
			landingPageInfo: { state: true },
			accountViewType: { state: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	_verifyNowClick() {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_VIEW_INFO, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.VERIFY_CALLER
		});
		this._verifyClick();
	}
	
	async _clientVerified(event) {
		super._clientVerified(event);

		await this._initialise();
	}

	async _accountDetails(type, accNumber) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_NUMBER_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS
		});
		this.accountViewType = type;

		const flexibleSavePlan = () => this._getFlexibleSavePlan(accNumber);
		const fixedTermSavePlan = () => this._getFixedTermSavePlan(accNumber);

		const saveProducts = {
			'flexible-save-plan': flexibleSavePlan,
			'fixed-term-save-plan': fixedTermSavePlan
		};

		if (saveProducts[this.accountViewType]) {
			await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
			await super.createAndClassifySubsIncident(null, false);
			
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
			 
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to retrieve client Savings plan details from service.`, `_initialise`, returnValue.correlationId);
				this.renderMode = RENDER_MODE.SERVICE_UNAVAILABLE;
				return;
			}

			if (returnValue.succeeded && returnValue.result) {
                this.landingPageInfo = returnValue.result;
				this.savingsPlanDetails = returnValue.result.savingsPlans;
				this._formatSavingsPlanDetails();

				this._updateLeftBar();
				
				if (this.savingsPlanDetails.length === 0) {
					this.horizonRouter.navigateToProductInfo(`SavingsPlan`);
					return;
				}
				
				await super._inicidentManager_(LANDING_PAGE_NEEDS.SAVINGS_PLAN, () => this._toggleBusyFlag());
				await super.createAndClassifySubsIncident(null, false);
			} 

			this._telemetry.startSpan(SavingsPlanEvents.SAVINGS_PLAN, {
				"screen": TelemetryScreen.SAVINGS_PLAN_LANDING
			});
		}

			this.renderMode = RENDER_MODE.MAIN_PAGE;
			this.endCallContext = `LandingPage`;
			this._performReturnToScreen();
		}

	_updateLeftBar() {
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		this.horizonStore.setProductButtonState(this.landingPageInfo);
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
		const flexibleSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
			item.currentBalance = formatCurrency(item.currentBalance);
			item.availableBalance = formatCurrency(item.availableBalance);
			item.accruedInterestCurrentMonth = formatCurrency(item.accruedInterestCurrentMonth);
			item.accruedInterestLastMonth = formatCurrency(item.accruedInterestLastMonth);
			item.interestEarned = formatCurrency(item.interestEarned);
			item.feesLastMonth = item.feesLastMonth ? formatCurrency(item.feesLastMonth) : `-`;

			item.maturityDate = `-`;
			item.dateOpened = this._formatDate(item.dateOpened);
			item.lastUpdate = this._formatDate(item.lastUpdate);

			item.planName = formatStringAsPascalCase(item.planName);
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		const fixedSavingsPlanDetails = this.savingsPlanDetails.filter(item => item.accountType === ACCOUNT_TYPE_CODE.FIXED_TERM_SAVINGS_PLAN && item.accountStatus !== `CLOSED`).map(item => {
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
			
			item.planName = formatStringAsPascalCase(item.planName);
			item.depositeType = `${formatStringAsPascalCase(item.planType)} ${item.interestOption === `R` ? `- Reinvest` : ``}`;
			item.accountStatus = formatStringAsPascalCase(item.accountStatus);
			item.postingRestrictions = `${item.postingRestrictions === `N` ? `No` : `Yes`}`;

			return item;
		});

		this.savingsPlanDetails = [...flexibleSavingsPlanDetails, ...fixedSavingsPlanDetails];
	}

	_backFromAccountDetails() {
		// TO DO: This function to be used when clicked back from account details screen.
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_ACCOUNT_DETAILS_CLOSE, {
			"screen": TelemetryScreen.SAVINGS_PLAN_ACCOUNT_DETAILS,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_LANDING
		});
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}
	
	_getStatements(accNumber) {
		const accountDetails = this.savingsPlanDetails.find(savingsPlan => savingsPlan.accountNumber === accNumber);
	
		const productInfo = ACCOUNT_INTCAT_ENUM[accountDetails.accountType][accountDetails.interestCategory] || ACCOUNT_INTCAT_ENUM[accountDetails.accountType];
		const accName = accountDetails.planName.toLowerCase();

		this.clientProducts = [
			{
				'accountNumber': accountDetails.accountNumber,
				'accountName': `${accName.charAt(0).toUpperCase()}${accName.slice(1)}`,
				'accountType': accountDetails.planType,
				'accountOpenDate': accountDetails.accountOpenDate,
				'type': productInfo.type,
				'category': productInfo.category,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order,
				'choosePeriod': productInfo.choosePeriod
			}
		];
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_STATEMENTS_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_STATEMENTS
		});
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_backToLandingPage() {
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_taxCertificates(accNumber, accountName) {
		this._telemetry.logEvent(SavingsPlanEvents.SAVINGS_PLAN_TAX_CERTIFICATE_SELECT, {
			"screen": TelemetryScreen.SAVINGS_PLAN_LANDING,
			"next-screen": TelemetryScreen.SAVINGS_PLAN_TAX_CERTIFICATE
		});

		this.taxCertType = accountName.toLowerCase().replaceAll(` `, ``).includes(`tax-free`) ? TAX_TYPE.IT3S : TAX_TYPE.IT3B;
		this.selectedAccountNumber = accNumber;
		this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
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
		const branchLocatorUrl = await this.configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}

	_setIncidentDone() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
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
			.save-plan{
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
			${this._renderSavingsPlanServiceError()}
			${this._renderFlexibleDetailsView()}
			${this._renderFixedTermDetailsView()}
			${this._renderStatements()}
			${this._renderTaxCertificate()}
		`;
	}

	_renderLandingPage() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE || 
				this.renderMode === RENDER_MODE.STATEMENTS ||
				this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				${this._renderSavingsPlanVerifiedLandingPage()}
				${this._renderSavingsPlanUnverifiedPage()}`
			: html``;
	}
	
	_renderSavingsPlanVerifiedLandingPage() {
		return this.verificationStatus === `verified` 
		? html`
			<capitec-pc-savings-plan
				.savingsPlanDetails="${this.savingsPlanDetails}"

				@option-click = "${(e) => this._optionClick(e.detail.option, e.detail.saveType, e.detail.accountNumber, e.detail.accountName)}"
				@view-info="${() => this._productEnquiry()}"
				@account-details="${(e) => this._accountDetails(e.detail.accountType, e.detail.accountNumber)}">
			</capitec-pc-savings-plan>`
		: html``;
	}

	_renderFlexibleDetailsView() {
		return this.renderMode === RENDER_MODE.ACCOUNT_DETAIL_VIEW &&
				this.accountViewType === SAVE_PLAN_TYPE.FLEXIBLE
			? html`
				<capitec-flexible-savings-plan-details
					.flexibleAccountDetails="${this.flexibleAccountDetails}"

					@back="${() => this._setIncidentDone()}">
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

					@back="${() => this._setIncidentDone()}">
				</capitec-fixed-term-savings-plan-details>`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements
					.cifNumber="${this.callerInformation.cifNumber}"
					.title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.clientProducts="${this.clientProducts}"
					type="${ACCOUNT_TYPES.SAVINGS_PLAN}"
					@cancel="${() => this._backToLandingPage()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				<horizon-tax-certificate
					cifNumber="${this.callerInformation.cifNumber}"
					accountNumber="${this.selectedAccountNumber}"
					type="${this.taxCertType}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-tax-certificate>
			`
			: html``;
	}
	
	_renderSavingsPlanUnverifiedPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-savings-plans-unverified-page
					class="save-plan"
					@verify-now= "${() => this._verifyClick()}"
					@product-enquiry="${() => this._productEnquiry()}">
				</horizon-savings-plans-unverified-page>`
			: html``;
	}

	_renderSavingsPlanServiceError() {
		return this.renderMode === RENDER_MODE.SERVICE_UNAVAILABLE
			? html`
				<horizon-savings-plans-service-error
					class="save-plan"
					@find-branch= "${() => this._findBranch()}">
				</horizon-savings-plans-service-error>`
			: html``;
	}
}

customElements.define(`horizon-savings-plan`, SavingsPlan);