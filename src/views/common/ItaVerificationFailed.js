import { View, css, html } from 'platform/elements';
import 'app/components/common/ErrorScreen';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';
import { HorizonStore } from 'app/store/HorizonStore';
import { CallHandleService } from '../../services/CallHandleService';

const RENDER_MODE = {
	VERIFY_CALLER: 0,
	CONTINUE_TRANSACT: 1
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
		this.callHandleService = new CallHandleService.getInstance(() => this.toggleBusyFlag(), null);
		this.displayLoadingIndicator = false;
	}

	// ---------------
	// PROPERTIES
	// ---------------

	static get properties() {
		return {
			renderMode: { type: Number }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonstore.recoverState();

		this.callerInformation = state.callerInformation;

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
				this.renderMode = RENDER_MODE.SECURITY_QUESTIONS;
			} else {
				const event = {
					from: `UI-CS`,
					status: `error`,
					message: `Failed to retrieve security questions from XDS`
				};
				this.eventAggregator.publish(`horizon-status-bar-update`, event);
			}
		} else {
			this.notVerified = true;
		}
	}

	toggleBusyFlag() {
		this.displayLoadingIndicator = true;
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
		this.renderMode = RENDER_MODE.CONTINUE_TRANSACT;
	}

	_rightClick() {
		console.log(`right`);
		this.renderMode = RENDER_MODE.VERIFY_CALLER;
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderContinueUnverified()}
			${this._renderVerifySecurityQuestions()}
			${this._renderLoadingIndicator()}
			<horizon--error-screen header="Verification was unsuccessful" left="Continue Unverified"
				right="Verify Via Security Questions" toast="Your Verification has failed." @left-click=${()=> this._leftClick()}
				@right-click=${() => this._rightClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after
					24 hours.</section>
			</horizon--error-screen>
		`;
	}

	_renderContinueUnverified() {
		if (this.renderMode === RENDER_MODE.CONTINUE_TRANSACT) {
			return html`
				<horizon-favourites-transactions></horizon-favourites-transactions>
			`;
		}
		else return html``;
	}
	_renderVerifySecurityQuestions() {
		if (this.renderMode === RENDER_MODE.VERIFY_CALLER) {
			return html`
				<horizon-security-question></horizon-security-question>
			`;
		}
		else return html``;
	}

	_renderLoadingIndicator() {
		if (this.displayLoadingIndicator = true) {
			return html`
			<capitec-loading-indicator></capitec-loading-indicator>
			`;
		}
		else
			return html``;
	}
}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);