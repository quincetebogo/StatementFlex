import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	PROOFOFACCOUNT_SUCCESS: 0,
	END_CALLSESSION: 1
};

/**
 * Display an confirmation/success screen indicating the proof of account statement has been successfully sent.
 *
 * @export
 * @class ProofOfAccountSuccess
 * @extends {View}
 */
export class ProofOfAccountSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.renderMode = RENDER_MODE.PROOFOFACCOUNT_SUCCESS;
		this.accountNumber = `5238 **** **** 8907`;
		this.emailAddress = `ivanmakatini@gmail.com`;
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @readonly
	 * @static
	 * @memberof ProofOfAccountSuccess
	 */
	static get properties() {
		return {
			renderMode: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		if (state) {
			this.returnRoute = state.returnTo.route;
			this.incomingCallDetails = state.incomingCallDetails;
			// TODO: accountNumber and email address received from API.
			this.accountNumber = `5238 **** **** 8907`;
			this.emailAddress = `ivanmakatini@gmail.com`;
		    this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCall() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	_doneClick() {
		this.horizonRouter.navigateToReturnPage(`done`);
	}

	_sendAnotherClick() {
		this.horizonRouter.navigateToReturnPage(`proofofaccount`);
		//might make service call over here to resend or navigate to Proof of account model again
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

				#id-error-msg{
					width: auto;
				}

				.button-margin{
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
			${this._renderSuccessScreen()}
			${this._renderEndCallModal()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen header="Proof of account sent" 
									image="/images/statements/senddocuments.svg"
									left="Done"
									right="Send Another"
									toast="Proof of Account Sent"
									@left-click=${() => this._doneClick()}
									@right-click=${() => this._sendAnotherClick()}>
				<section 
					id="id-error-msg" 
					slot="detail">Your proof of account document for account <b>${this.accountNumber}</b> has been emailed to <b>${this.emailAddress}</b>.
				</section>
				<section 
						id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin" 
						label="Tax Certificate" 
						icon="system/sars-action">
					</horizon-option-button>
					</section >
					<section 
					id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin" 
						label="Statements" 
						icon="system/documents-action">
					</horizon-option-button>
				</section>
			</horizon-success-screen>
		`;
	}

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<horizon-end-call-session 
				.incomingCallDetails="${this.incomingCallDetails}"
				endCallContext="LandingPage"
				@cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

}

customElements.define(`horizon-proof-of-account-success`, ProofOfAccountSuccess);