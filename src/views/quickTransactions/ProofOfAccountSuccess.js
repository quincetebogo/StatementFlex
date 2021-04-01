import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/common/RelatedOptions';

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

		this.list = ["TAX_CERTIFICATE", "STATEMENTS"];
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
			renderMode: { attribute: false },

			list: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		if (state) {
			this.incomingCallDetails = state.incomingCallDetails;
			this.incidentDetails = state.incidentDetails;

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
		const state = this.horizonStore.recoverState();
		state.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;

		this.horizonStore.saveState(state);
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
		if (this.renderMode === RENDER_MODE.PROOFOFACCOUNT_SUCCESS) {
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
					${this._renderRelatedOptions()}
				</horizon-success-screen>
			`;
		}
		return html``;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				.options= "${this.list}">
			</horizon-related-options>
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