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
		this.acNumber = ``;
		this.mailId = ``;
		
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
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();;
			this.incidentDetails = this.horizonStore.getIncidentDetails();

			this.mailId = state.emailAddress;
            this.acNumber = state.accountNumber;
			
		    this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
		}
		this._updateIncidentState();
	}

	disconnectedCallback() {
		if (this.endCallSub) {
			this.endCallSub.dispose();
		}
		
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCall() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	_doneClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {
		
		const returnToScreen = {
			option: `proof-of-account`
		};
		this.horizonStore.saveState({ returnToScreen: returnToScreen });
		
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);
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
					slot="detail">Your proof of account document for account <b>${this.acNumber}</b> has been emailed to <b>${this.mailId}</b>.
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
				.incidentDetails="${this.incidentDetails}"
				.incomingCallDetails="${this.incomingCallDetails}"
				endCallContext="LandingPage"
				@cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

}

customElements.define(`horizon-proof-of-account-success`, ProofOfAccountSuccess);