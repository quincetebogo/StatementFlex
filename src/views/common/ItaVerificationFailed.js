import { View, css, html } from 'platform/elements';
import { CallHandleService } from 'app/services/CallHandleService';
import { EventAggregator } from 'platform/EventAggregator';

import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	VERIFY_CALLER: 1,
	END_CALL: 2
};

export class ItaVerificationFailed extends View {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = -1;
		this.isBusy = false;
		this.isReassigned = false;
		this.callerInformation = {};
		this.securityQuestions = {};
		this.incomingCallDetails = {};

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), null);
	}

	// ---------------
	// PROPERTIES
	// ---------------

	static get properties() {
		return {
			renderMode: { type: Number },
			isBusy: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.isReassigned = this.horizonStore.getIsIncidentReassigned();

		this._updateLeftBar();

		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.verifySub = this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyUsingSecurityQuestions());
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		this.verifySub.dispose();
		super.disconnectedCallback();
	}

	// -------------
	// PRIVATE METHODS
	// -------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_updateLeftBar() {
		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onCancelEndCall() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

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

	_onCancelVerify() {
		this.renderMode = -1;
	}

	_skip() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_leftClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_rightClick() {
		this._verifyUsingSecurityQuestions();
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
				horizon--error-screen {
					--horizon-error-screen-size: 912px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
				${this._renderLoadingIndicator()}
				<horizon--error-screen 
					header="Verification was unsuccessful"
					left="Continue Unverified"
					right="Verify Via Security Questions" 
					toast="Your Verification has failed." 
					image="/images/insure/assign-pay-arrears.svg"
					@left-click=${() => this._leftClick()}
					@right-click=${() => this._rightClick()}>
						<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24
							hours.</section>
				</horizon--error-screen>
				${this._renderVerifySecurityQuestions()}
				${this._renderEndCallSessionDialog()}
		`;
	}

	_renderVerifySecurityQuestions() {
		if (this.renderMode === RENDER_MODE.VERIFY_CALLER) {
			return html`
					<horizon-security-question
						.incidentDetails="${this.incidentDetails}"
						.incomingCallDetails="${this.incomingCallDetails}"
						.callerInformation="${this.callerInformation}" 
						.securityQuestions="${this.securityQuestions}"
						@cancel="${() => this._onCancelVerify()}" 
						@skip="${() => this._skip()}">
					</horizon-security-question>`;
		}
		return html``;
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session
						.incidentDetails="${this.incidentDetails}"
						.incomingCallDetails="${this.incomingCallDetails}" 
						?isReassigned="${this.isReassigned}"
						endCallContext="LandingPage"
						@cancel="{${() => this._onCancelEndCall()}}">
				</horizon-end-call-session>`;
		}
		return html``;
	}

	_renderLoadingIndicator() {
		if (this.isBusy) {
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
		}
		return html``;
	}
}

customElements.define(`horizon-ita-verification-failed`, ItaVerificationFailed);