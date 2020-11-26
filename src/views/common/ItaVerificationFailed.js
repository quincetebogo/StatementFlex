import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import { HorizonStore } from 'app/store/HorizonStore';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/common/ErrorScreen';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';

const RENDER_MODE = {
	VERIFY_CALLER: 0,
	// CONTINUE_TRANSACT: 1
};
export class ItaVerificationFailed extends View {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.renderMode = -1;
		this.horizonstore = HorizonStore.getInstance();
		this.callerInformation = {};
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.isBusy = false;
		this.securityQuestions = {};
		this.incomingCallDetails = {};
	}

	// ---------------
	// PROPERTIES
	// ---------------

	static get properties() {
		return {
			renderMode: { type: Number },
			displayLoadingIndicator: { type: Boolean },
			isBusy: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonstore.recoverState();

		this.callerInformation = state.callerInformation;
		this.incomingCallDetails = state.incomingCallDetails;



	}

	// -------------
	// PRIVATE METHODS
	// -------------

	async _verifyUsingSecurityQuestions() {

		const clientID = this.callerInformation.southAfricanIDNumber;
		const returnValue = await this.callHandleService.xdsQuestions(clientID, null);

		if (returnValue.succeeded) {
			this.securityQuestions = returnValue.result;

			if (this.securityQuestions.questions && this.securityQuestions.questions.length > 0) {
				this.renderMode = RENDER_MODE.VERIFY_CALLER;
			} else {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `Failed to retrieve security questions from ITA`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		} else {
			this.notVerified = true;
		}
	}

	_continueToTransactionsUnverified() {
		let clientInfo = this.callerInformation.verificationStatus;

		if (clientInfo = `unverified`) {
			this.horizonRouter.navigateToQuickTransactionFavourites();
		}
		else
			console.log(`service call failed`);
	}
	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_onSecurityQuestionsCancel() {
		this.renderMode = -1;
	}

	_skip() {
		this.horizonstore.saveState({ callerInformation: { verificationStatus: `failed` } });
		// this.horizonRouter.navigateToQuickTransactionFavourites();
	}
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
				#id-error-msg{
					width: 550px;
				}
			`
		];
	}

	_leftClick() {
		console.log(`left`);
		this._continueToTransactionsUnverified();
	}

	_rightClick() {
		console.log(`right`);
		this._verifyUsingSecurityQuestions();
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
		
			${this._renderVerifySecurityQuestions()}
			${this._renderLoadingIndicator()}
			<horizon--error-screen header="Verification was unsuccessful" left="Continue Unverified"
				right="Verify Via Security Questions" toast="Your Verification has failed." @left-click=${() => this._leftClick()}
				@right-click=${() => this._rightClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after
					24 hours.</section>
			</horizon--error-screen>
		`;
	}

	// _renderContinueUnverified() {
	// 	if (this.renderMode === RENDER_MODE.CONTINUE_TRANSACT) {
	// 		return html`
	// 			<horizon-favourites-transactions></horizon-favourites-transactions>
	// 		`;
	// 	}
	// 	else return html``;
	// }
	_renderVerifySecurityQuestions() {
		if (this.renderMode === RENDER_MODE.VERIFY_CALLER) {
			return html`
			
			<horizon-security-question .incomingCallDetails="${this.incomingCallDetails}"
				.callerInformation="${this.callerInformation}" .securityQuestions="${this.securityQuestions}"
				@cancel="${() => this._onSecurityQuestionsCancel()}" @skip="${() => this._skip()}">
			</horizon-security-question>`;
		}
		else return html``;
	}

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);