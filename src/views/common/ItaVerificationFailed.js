import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

import { HorizonStore } from 'app/store/HorizonStore';
import { CallHandleService } from 'app/services/CallHandleService';
import { HorizonRouter } from 'app/shell/HorizonRouter';

import 'app/components/common/ErrorScreen';
import 'app/components/quickTransactions/FavouriteTransactions';
import 'app/components/dialogs/common/VerifyBySecurityQuestions';

const RENDER_MODE = {
	MAIN_PAGE: 0,
	VERIFY_CALLER: 1,
	END_CALL: 2,
	SELECT_ASSIGN_REASON: 3
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
		this._updateLeftBar();
		this._updateTopBar();


		this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.subscribe(`horizon-assign-incident`, () => this._onAssignIncident());
		this.eventAggregator.subscribe(`horizon-verify-now-click`, () => this._verifyUsingSecurityQuestions());

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

	_updateTopBar() {
		this.eventAggregator.publish(
			`horizon-update-call_actionbar`,
			{
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			}
		);
	}

	_updateLeftBar() {
		const state = {
			miniProfile: {
				name: this.callerInformation.name,
				idNumber: this.callerInformation.southAfricanIDNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				livesIn: this.callerInformation.livesIn,
				languagePreference: this.callerInformation.languagePreference,
				birthday: this.callerInformation.birthdate,
				showButtons: false,
				isConfirmed: false,
				isVerified: this.callerInformation.verificationStatus === `verified`,
				verificationFailed: this.callerInformation.verificationStatus === `failed`,
				is3rdParty: false,
				isNonClient: false
			},
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
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

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_onCancelEndCall() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_onAssignIncident() {
		this.renderMode = RENDER_MODE.SELECT_ASSIGN_REASON;
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
		this.horizonRouter.navigateToQuickTransactionFavourites();
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