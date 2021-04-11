import { Component, css, html } from 'platform/elements';
import { OptionsConfig, RelatedOptions } from 'app/utils/relatedOptions';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/CardLimitsLanding';

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	UPDATE_LIMITS: 1,
	PROOF_OF_ACCOUNT: 2,
	TAX_CERTIFICATE: 3,
	TRANSACTION_HISTORY: 4,
	STATEMENTS: 5,
	TAP_TO_PAY: 6
});

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
		this.renderMode = ``;
		this.options = [];
		this.label = ``;
		this.icon = ``;
		this.landingPageInfo = {};
		this.cards = [];

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		
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

		const currNeed = this.incidentDetails.currentNeed;
		this.options = RelatedOptions[currNeed][context];
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_mainPage() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onCancel() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_navigateToOption(item) {
	
		const stopCard = () => this._stopCard();
		const updateCardLimits = () => this._updateCardLimits();
		const tapToPay = () => this._tapToPay();
		const statements = () => this._Statements();
		const taxCertificate = () => this._taxCertificate();
		const proofOfAccount = () => this._proofOfAccount();
		const transactionHistory = () => this._transactionHistory();

		const actions = {
			'STOP_CARD': stopCard,
			'UPDATE_CARD_LIMITS': updateCardLimits,
			'TAP_TO_PAY': tapToPay,
			'STATEMENTS': statements,
			'TAX_CERTIFICATE': taxCertificate,
			'PROOF_OF_ACCOUNT': proofOfAccount,
			'TRANSACTION_HISTORY': transactionHistory
		};

			if (actions[option]) {
				super._inicidentManager_(option, () => this._toggleBusyFlag());
				return actions[option];
			}

			/**
			 * When verify now on mini profile is selected, we dont need to perform any action
			 * Returning true for such case
			 */
			return true;
	}

	async _updateCardLimits() {

		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_LIMITS;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

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

	_Statements() {
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	_taxCertificate() {
		// TODO: Functionality to generate tax certificate comes here
	}

	_proofOfAccount() {
        this.renderMode = RENDER_MODE.PROOF_OF_ACCOUNT;
	}

	_transactionHistory() {
		this.renderMode = 1;
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
		return html`
			${this._renderContent()}
			${this._renderProofOfAccount()}
			${this._renderUpdateCardLimits()}
			${this._renderTaxCertificate()}
			${this._renderTransactionHistory()}
			${this._renderStatements()}
			${this._renderTapToPay()}
		`;
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
		`;
	}

	_renderOption(item) {
		const option = OptionsConfig[item];

		return html`
			<horizon-option-button
				label="${option.label}" 
				icon="${option.icon}"
				@click="${() => this._navigateToOption(item)}">
			</horizon-option-button>
		`;
	}

	_renderProofOfAccount() {
		if (this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT) {
			return html`
				<horizon-proof-of-account
					@cancel="${() => this._onCancel()}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					.landingPageInfo="${this.landingPageInfo}">
				</horizon-proof-of-account>`;
		}
		return html``;
	}

	_renderUpdateCardLimits() {

		if (this.renderMode === RENDER_MODE.UPDATE_LIMITS) {
			return html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-card-limits-landing>`;
		}
		return html``;
	}

	_renderTaxCertificate() {
		if (this.renderMode === RENDER_MODE.TAX_CERTIFICATE) {
			return html``;
		}
		return html``;
	}

	_renderTransactionHistory() {
		if (this.renderMode === RENDER_MODE.TRANSACTION_HISTORY) {
			return html`
				<horizon-transaction-history
					@back="${() => this._mainPage()}">
				</horizon-transaction-history>`;
		}
		return html``;
	}

	_renderStatements() {
		if (this.renderMode === RENDER_MODE.STATEMENTS) {
			return html``;
		}
		return html``;
	}

	_renderTapToPay() {
		if (this.renderMode === RENDER_MODE.TAP_TO_PAY) {
			return html``;
		}
		return html``;
	}

}

window.customElements.define(`horizon-related-options`, RelatedOptions);