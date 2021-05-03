import { Component, css, html } from 'platform/elements';
import { optionsConfig, relatedOptions } from 'app/utils/relatedOptions';
import { CardService } from 'app/services/CardService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/CardLimitsLanding';

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
 * Common componet, renders related options based on the need and context of success/ failure.
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

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();
		
		this.cardService = new CardService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
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
		this.callerInformation = state.callerInformation;
		this.incomingCallDetails = state.incomingCallDetails;
		this.incidentDetails = state.incidentDetails;
		this.landingPageInfo = state.landingPageInfo;

		const currNeed = this.incidentDetails.currentNeed;
		this.options = relatedOptions[currNeed][this.context];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	_mainPage() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancel() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _navigateToOption(item) {
		this.callerInformation = this.horizonStore.getCallerInformation();
		const isVerifiedClient = this._isVerifiedClient();

		if (!isVerifiedClient) {
			this.dispatchEvent(new CustomEvent(`verify-now-alert`, {}));
			return false;
		}
	
		const stopCard = () => this._stopCard();
		const updateCardLimits = () => this._updateCardLimits();
		const tapToPay = () => this._tapToPay();
		const statements = () => this._Statements();
		const taxCertificate = () => this._taxCertificate();
		const proofOfAccount = () => this._proofOfAccount();
		const transactionHistory = (item) => this._transactionHistory(item);

		const actions = {
			'stop-card': stopCard,
			'update-card-limits': updateCardLimits,
			'tap-to-pay': tapToPay,
			'statements': statements,
			'tax-certificate': taxCertificate,
			'proof-of-account': proofOfAccount,
			'transaction-history': transactionHistory
		};

			if (actions[item]) {
				await super._inicidentManager_(item, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[item](item);
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
	}

	_backToLandingPage() {
		
		if (this.incidentDetails.needStatus !== super.HORIZON_NEED_STATUS.COMPLETED) {
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.NOT_STARTED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
		}
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_isVerifiedClient() {
		return this.callerInformation && this.callerInformation.verificationStatus === `verified`;
	}

	_refreshIncidentDetails() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
		const returnValue = await this.quickTransactionService.getClientProducts(request);

		if (returnValue.succeeded) {
			return returnValue.result.savingsProducts;
		}
		return [];
	}

	async _stopCard() {
		const confirmedCaller = {
			idNumber: this.callerInformation.southAfricanIDNumber,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
			ivrOptionCode: `StopCard`,
			incidentReferenceNumber: this.incidentDetails.incidentReferenceNumber,
			incidentRecId: this.incidentDetails.incidentRecId,
			agentTelephoneNumber: this.incomingCallDetails.agentTelephoneNumber,
			nonClientFullName: this.callerInformation.nonClientFullName,
			nonClientCellPhone: this.callerInformation.nonClientCellPhone,
			nonClientIDNumber: this.callerInformation.nonClientIDNumber,
			nonClientRelationship: this.callerInformation.nonClientRelationship
		};

		const returnValue = await this.cardService.identifyCaller(confirmedCaller);

		if (returnValue.succeeded) {
			this.incomingCallDetails.ivrOptionCode = `StopCard`;
			this.incomingCallDetails.ivrOption.value = `StopCard`;

			this.horizonStore.saveState({
				incidentDetails: this.incidentDetails,
				incomingCallDetails: this.incomingCallDetails,
				callerInformation: this.callerInformation,
				clientProfileDetails: returnValue.result
			});
			this.horizonRouter.navigateToStopCard();
		} else {
			this.horizonRouter.navigateToSystemError();
		}
	}

	async _updateCardLimits() {
		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_CARD_LIMITS;
		}
	}

	async _tapToPay() {
		const returnValue = await this.quickTransactionService.tapToPayLanding(this.callerInformation.cifNumber);
			 
		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		}
	}

	async _Statements() {
		const clientProductDetails = await this._getClientProducts();

		if (clientProductDetails) {
			this.clientProducts = clientProductDetails;
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	_taxCertificate() {
		// TODO: Functionality to generate tax certificate comes here
	}

	async _proofOfAccount() {
		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			const primarySavingsProduct = clientProductDetails.find(item => item.accountType === SAVINGS_ACCOUNT_TYPE);

			this.landingPageInfo.accountNumber = primarySavingsProduct.accountNumber;
			this.landingPageInfo.accountOpenedDate = primarySavingsProduct.accountOpenDate;
			this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
		}
	}

	_transactionHistory(option) {
		const returnToScreen = {
			name: ``,
			option: option
		};
		this.horizonStore.saveState({ returnToScreen: returnToScreen });
		this.horizonRouter.navigateToLandingPage(`SavingsAccount`, false);
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
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
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

	_renderUpdateCardLimits() {
		return this.renderMode === RENDER_MODE.UPDATE_LIMITS
			? html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-card-limits-landing>`
			: html``;
	}

	_renderTapToPay() {
		return this.renderMode === RENDER_MODE.TAP_TO_PAY
			? html`
				<horizon-tap-to-pay-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-tap-to-pay-landing>`
			: html``;
	}

	_renderStatements() {
		return this.renderMode === RENDER_MODE.STATEMENTS
			? html`
				<horizon-statements-dialog
					.callerInformation="${this.callerInformation}"
					.clientProducts="${this.clientProducts}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-statements-dialog>`
			: html``;
	}

	_renderProofOfAccount() {
		return this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT
			? html`
				<horizon-proof-of-account
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					.landingPageInfo="${this.landingPageInfo}"
					@cancel="${() => this._backToLandingPage()}">
				</horizon-proof-of-account>`
			: html``;
	}

	_renderTaxCertificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE
			? html``
			: html``;
	}
}

window.customElements.define(`horizon-related-options`, RelatedOptions);