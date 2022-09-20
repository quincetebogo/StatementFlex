import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger, NavigationContext } from 'platform/core';
import { optionsConfig, relatedOptions } from 'app/utils/relatedOptions';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { CardService } from 'app/services/CardService';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { SavingsService } from 'app/services/SavingsService';
import { capitalizeString } from 'app/utils/channelServiceUtilities';
import { tapToPayMixin } from 'app/views/tapToPay/TapToPayMixin';

import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/CardLimitsLanding';
import 'app/components/quickTransactions/TaxCertificateLanding';
import 'app/dialogs/statements/Statements';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	UPDATE_CARD_LIMITS: 1,
	TAP_TO_PAY: 2,
	STATEMENTS: 3,
	PROOF_OF_ACCOUNT: 4,
	TAX_CERTIFICATE: 5
});

const SAVINGS_ACCOUNT_TYPE = 300;

/**
 * Common component, renders related options based on the need and context of success/ failure.
 * Invoked by different success and failure screens
 * 
 * @exports
 * @class RelatedOptions
 * @extends {Component}
 */
export class RelatedOptions extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isBusy = false;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.options = [];
		this.label = ``;
		this.icon = ``;
		this.landingPageInfo = {};
		this.cards = [];

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.logger = Logger.getInstance();
		this._telemetry = HorizonTelemetry.instance;

		this.returnToSub = this.eventAggregator.subscribe(`horizon-navigate-related-option`, (e) => this._navigateToOption(e.option));

		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
		this.savingsService = new SavingsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

		Object.assign(RelatedOptions.prototype, tapToPayMixin);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {String} context Success or Failure screen
	 */
	static get properties() {
		return {
			context: { type: String },

			renderMode: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.landingPageInfo = state.landingPageInfo;

		this.options = relatedOptions[this.horizonIncidentManager.getCurrentNeed()][this.context];
	}

	disconnectedCallback() {
		
		// do disposed as this one (will be triggered when  you move over to another screen)
		this.returnToSub.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	_onCancel() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _navigateToOption(item) {
		this.callerInformation = this.horizonStore.getCallerInformation();
		const isVerifiedClient = this._isVerifiedClient();

		if (!isVerifiedClient) {
			this.dispatchEvent(new CustomEvent(`verify-now-alert`, { detail: { option: item } }));
			return false;
		}
	
		const stopCard = () => this._stopCard();
		const updateCardLimits = (option) => this._updateCardLimits(option);
		const tapToPay = () => this._tapToPay();
		const statements = () => this._Statements();
		const taxCertificate = () => this._taxCertificate();
		const proofOfAccount = () => this._proofOfAccount();
		const transactionHistory = (option) => this._transactionHistory(option);
		const paidUpAccounts = (option) => this._paidUpAccounts(option);

		const actions = {
			'stop-card': stopCard,
			'update-card-limits': updateCardLimits,
			'tap-to-pay': tapToPay,
			'statements': statements,
			'tax-certificate': taxCertificate,
			'proof-of-account': proofOfAccount,
			'transaction-history': transactionHistory,
			'paid-up-accounts': paidUpAccounts
		};

			if (actions[item]) {
				await super._inicidentManager_(item, () => this._toggleBusyFlag());
				return actions[item](item);
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
	}

	_backToLandingPage() {
		const incidentState = this.horizonIncidentManager.incidentState;
		
		if (incidentState !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.NOT_STARTED;
		}

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	/**
	 * Function updates the need based on account selected in statements
	 * so as to classify incident accordingly
	 * 
	 * @param {object} event - event raised by statements dialog
	 * @returns {void}
	 */
	async _statementsAccConfirmed(event) {
		const need = `statements-${event.detail.subCategory || event.detail.account}`;

		await super._inicidentManager_(need, () => this._toggleBusyFlag());
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_isVerifiedClient() {
		return this.callerInformation && this.callerInformation.verificationStatus === `verified`;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
		const returnValue = await this.savingsService.getClientProducts(request);

		if (returnValue.succeeded) {
			return returnValue.result.savingsProducts;
		}
		return [];
	}

	async _stopCard() {

		const returnValue = await this.cardService.identifyCaller(this.callerInformation, this.incomingCallDetails, this.horizonIncidentManager.getCurrentIncident());

		if (returnValue.succeeded) {

			const screenDetails = this.horizonStore.getScreenDetails();
			screenDetails.cards = returnValue.result && returnValue.result.cards;

			this.horizonStore.setCallerInformation(this.callerInformation);
			this.horizonStore.setIncomingCallDetails(this.incomingCallDetails);
			this.horizonStore.setScreenDetails(screenDetails);
			
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _Statements() {
		const clientProductDetails = await this._getClientProducts();

		if (clientProductDetails) {
			this.clientProducts = clientProductDetails.map(item => {
									const productInfo = ACCOUNT_INTCAT_ENUM[item.accountType][item.interestCategory] || 
														ACCOUNT_INTCAT_ENUM[item.accountType];

									return {
										'accountNumber': item.accountNumber,
										'accountName': capitalizeString(item.accountName),
										'accountType': item.accountType,
										'accountOpenDate': item.accountOpenDate,
										'type': productInfo.type,
										'category': productInfo.category,
										'icon': productInfo.icon,
										'customIcon': productInfo.customIcon,
										'order': productInfo.order,
										'choosePeriod': productInfo.choosePeriod
									};
								}).sort((x, y) => x.order - y.order);
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	async _taxCertificate() {

		/**
		 * Similar to POA, Tax certificate is also a related option for few of the credit options
		 * We need savings account number, opened date which will not be available under credit flow.
		 * So we make a explicit call to get client products and filter out savings account product
		 */
		await this._getSavingsAccountDetails();

		const returnValue = await this.quickTransactionService.getTaxCertificate(this.callerInformation.cifNumber, () => true);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get load tax certificates information`, `_taxCertificates`, returnValue.correlationId);
			this.horizonRouter.navigateToTaxCertificateServiceError();
			return;
		}

		this.taxCertificateDetails = returnValue.result;
		this.hasTaxCertificate = this.taxCertificateDetails.iT3BTaxCertificates.length + this.taxCertificateDetails.iT3STaxCertificates.length > 0;

		this.renderMode = this.hasTaxCertificate ? RENDER_MODE.TAX_CERTIFICATE : RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE;
	}

	async _proofOfAccount() {

		/**
		 * POA is a related option for few of the credit options
		 * We need savings account number, opened date which will not be available under credit flow.
		 * So we make a explicit call to get client products and filter out savings account product
		 */
		await this._getSavingsAccountDetails();
		this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
	}

	_transactionHistory(option) {
		const screenDetails = this.horizonStore.getScreenDetails();
		
		screenDetails.returnToOption = option || ``;
		this.horizonRouter.navigateToLandingPage(`SavingsAccount`, false);
	}

	_updateCardLimits(option) {
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, option);
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_paidUpAccounts(option) {
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, option);
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_back() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _getSavingsAccountDetails() {
		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			const primarySavingsProduct = clientProductDetails.find(item => item.accountType === SAVINGS_ACCOUNT_TYPE);

			this.landingPageInfo.accountNumber = primarySavingsProduct.accountNumber;
			this.landingPageInfo.accountOpenedDate = primarySavingsProduct.accountOpenDate;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			css`
				capitec-label {
					height: 32px;
					width: auto;
					padding: 4px 0px 4px 16px;
					border-left: 1px solid #E1E1E1;
					border-right: 1px solid #E1E1E1;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 18px;
				}

			capitec-card {
					height: 112px;
					width: auto;
				}

				capitec-group{
					height: 80px; 
					margin:16.5px;
				}

			horizon-option-button{
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}
			
`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.UPDATE_CARD_LIMITS:
				return html`${this._renderUpdateCardLimits()}`;
			case RENDER_MODE.TAP_TO_PAY:
				return html`${this._renderTapToPay()}`;
			default:
				return html`
					${this._renderContent()}
					${this._renderLoadingIndicator()}
				`;
		}
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="related-options-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderContent() {
		return html`
			<capitec-label
				type="subtitle"
				label="Related options">
			</capitec-label>

			<capitec-card>
				<capitec-group
					layout="horizontal"
					gap="none"
					halign="left">
						${this.options.map(item => this._renderOption(item))}
				</capitec-group>
			</capitec-card>
			${this._renderStatements()}
			${this._renderProofOfAccount()}
			${this._renderTaxCertificate()}
			${this._renderTaxCertificateNotAvailable()}
		`;
	}

	_renderOption(item) {
		const option = optionsConfig[item];

		return html`
			<horizon-option-button
				label="${option.label}"
				icon="${option.src}"
				@click="${() => this._navigateToOption(item)}">
			</horizon-option-button>
		`;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements
					.cifNumber="${this.callerInformation.cifNumber}"
					client-title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					.clientProducts="${this.clientProducts}"
					registeredEmailId="${this.callerInformation.emailId}"
					type=""
					@cancel="${() => this._backToLandingPage()}"
					@account-selected="${(event) => this._statementsAccConfirmed(event)}">
				</horizon-statements>`
			: html``;
	}

	_renderProofOfAccount() {
		return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
			? html`
				<horizon-proof-of-account
					.cifNumber="${this.callerInformation.cifNumber}"
					.title="${this.callerInformation.title}"
					.lastName="${this.callerInformation.lastName}"
					accountNumber="${this.landingPageInfo.accountNumber}"
					accountOpenedDate="${this.landingPageInfo.accountOpenedDate}"
					registeredEmailId="${this.callerInformation.emailId}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-proof-of-account>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html`
				<horizon-tax-certificate
					.taxCertificateDetails="${this.taxCertificateDetails}"
					.cifNumber="${this.callerInformation.cifNumber}"
					accountNumber="${this.landingPageInfo.accountNumber}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-tax-certificate>`
			: html``;
	}

	_renderTaxCertificateNotAvailable() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE_NOT_AVAILABLE
		? html`
			<horizon-tax-certificate-landing
				@back="${() => this._back()}">
			</horizon-tax-certificate-landing>
			`
		: html``;
	}
}

window.customElements.define(`horizon-related-options`, RelatedOptions);