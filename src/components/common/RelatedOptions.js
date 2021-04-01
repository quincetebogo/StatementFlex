import { Component, css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';

import 'app/components/dialogs/quickTransactions/ProofOfAccount';
import 'app/components/quickTransactions/CardLimitsLanding';

const INFO = {
	STOP_CARD: {
		label: `Stop Card`,
		src: `system/stop-card-action`
	},
	UPDATE_LIMITS: {
		label: `Update Limits`,
		src: `system/cards-action`
	},
	TAP_TO_PAY: {
		label: `Tap To Pay`,
		src: `system/contactless-action`
	},
	STATEMENTS: {
		label: `Statements`,
		src: `system/documents-action`
	},
	PROOF_OF_ACCOUNT: {
		label: `Proof Of Account`,
		src: `system/documents-action`
	},
	TAX_CERTIFICATE: {
		label: `Tax Certificate`,
		src: `system/sars-action`
	},
	TRANSACTION_HISTORY: {
		label: `Transaction History`,
		src: `system/time-action`
	}
};

const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	UPDATE_LIMITS: 1,
	PROOF_OF_ACCOUNT: 2,
	TAX_CERTIFICATE: 3,
	TRANSACTION_HISTORY: 4,
	STATEMENTS: 5,
	TAP_TO_PAY: 6
});

export class RelatedOptions extends Component{

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.state = this.horizonStore.recoverState();
		this.callerInformation = this.state.callerInformation;
		this.incomingCallDetails = this.state.incomingCallDetails;
		this.isBusy = false;
		this.renderMode = ``
		this.options = {};
		this.label = ``;
		this.icon = ``;
		this.landingPageInfo = {};
		this.cards = [];
		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			renderMode: { attribute: false },
			isBusy: { attribute: false },
			options: { type: Object },
			landingPageInfo: { type: Object}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

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
		this.dispatchEvent(new CustomEvent(`click`, {}));
		switch (item) {
			case `STOP_CARD`:
				this.horizonStore.recoverState()
				this.horizonRouter.navigateToStopCard();
				break;
			case `UPDATE_LIMITS`:
				this._updateCardLimits();
				break;
			default:
				this.renderMode = RENDER_MODE[item];
		}
	}

	async _updateCardLimits() {

		const returnValue = await this.quickTransactionService.cardLimitsLanding(this.callerInformation.cifNumber);

		if (returnValue.succeeded) {
			this.cards = returnValue.result;
			this.renderMode = RENDER_MODE.UPDATE_LIMITS;
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
		<capitec-label type="subtitle" label="Related options"> </capitec-label>
		<capitec-card >
			<capitec-group layout="horizontal" gap="none" H-Align="left">
				${this.options.map((item) => this._renderOption(item))}
			</capitec-group>
		</capitec-card>

		${this._renderProofOfAccount()}
		${this._renderUpdateCardLimits()}
		${this._renderTaxCertificate()}
		${this._renderTransactionHistory()}
		${this._renderStatements()}
		${this._renderTapToPay()}
		`;
	}

	_renderLoadingIndicator() {
		this.isBusy = !this.isBusy;
	}

	_renderOption(item) {
		if (typeof item === `string`) {
			this.label = INFO[item].label;
			this.icon = INFO[item].src;
			return html`
				<horizon-option-button
					label="${this.label}" 
					icon="${this.icon}"
					@click="${() => this._navigateToOption(item)}">
				</horizon-option-button>
		`;
		}
	}

	_renderProofOfAccount() {
		if (this.renderMode === RENDER_MODE.PROOF_OF_ACCOUNT) {
		return html`
				<horizon-proof-of-account
					@cancel="${() => this._onCancel()}"
					.incomingCallDetails="${this.incomingCallDetails}"
					.callerInformation="${this.callerInformation}"
					.landingPageInfo="${this.landingPageInfo}">
				</horizon-proof-of-account>`
		}
		return html``;
	}

	_renderUpdateCardLimits() {

		if (this.renderMode === RENDER_MODE.UPDATE_LIMITS) {
			return html`
				<horizon-card-limits-landing
					.cards="${this.cards}"
					@back="${() => this._mainPage()}">
				</horizon-card-limits-landing>`
		}
		return html``;
	}

	_renderTaxCertificate() {
		if (this.renderMode === RENDER_MODE.TAX_CERTIFICATE) {
			return html ``;
		}
		return html ``;
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

window.customElements.define(`horizon-related-options`, RelatedOptions);``