import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/EndCallSession';
import 'app/components/dialogs/common/StatementsDialog';

const RENDER_MODE = {
	STATEMENTS_SUCCESS: 0,
    END_CALLSESSION: 1,
    STATEMENTS: 2
};


export class StatementsSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.renderMode = RENDER_MODE.STATEMENTS_SUCCESS;
		this.mailId = ``;
		this.acNumber = ``;
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
        this.horizonRouter = HorizonRouter.getInstance();
        this.landingPageInfo = {};
	}


	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @readonly
	 * @static
	 * @memberof StatementsSuccess
	 */
	static get properties() {
		return {
            renderMode: { attribute: false },
            callerInformation: { type: Object },
            incomingCallDetails: { type: Object },
            landingPageInfo: { type: Object },
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		if (state) {
			//this.returnRoute = state.returnTo.route;
			this.incomingCallDetails = state.incomingCallDetails;
            this.mailId = state.emailAddress;
            this.acNumber = state.accountNumber;
			// TODO: mandate ID to be obtained from state.
		    this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});
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
        //this.renderMode = RENDER_MODE.STATEMENTS;
        this.horizonRouter.setReturnToFunction(`statements`);
		this.horizonRouter.navigateToQuickTransactionFavourites();
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
            ${this._renderStatementsModal()}
		`;
	}

    _renderStatementsModal() {
        if (this.renderMode === RENDER_MODE.STATEMENTS) {
            return html`
            <horizon-statements-dialog
				.incomingCallDetails="${this.incomingCallDetails}"
				.callerInformation="${this.callerInformation}"
				.landingPageInfo="${this.landingPageInfo}"
				@cancel="${() => this.renderMode = RENDER_MODE.STATEMENTS_SUCCESS}">
			</horizon-statements-dialog>
			`
        }
        return html``;
    }
	_renderSuccessScreen() {
		return html`
			<horizon-success-screen header="Statement sent" 
									image="/images/statements/senddocuments.svg"
									left="Done"
									right="Send Another"
									toast="Statement sent"
									@left-click=${() => this._doneClick()}
									@right-click=${() => this._sendAnotherClick()}
									>
				<section 
					id="id-error-msg" 
					slot="detail">The statement for savings account <b>${this.acNumber}</b> was emailed to <b>${this.mailId}</b>
				</section>
				<section 
						id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin" 
						label="Tax Certificate" 
						icon="system/sars-action">
					</horizon-option-button>
				</section>
				<section 
						id="id-option-button" 
						slot="option-button">
					<horizon-option-button 
						class="button-margin" 
						label="Proof of Account" 
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

customElements.define(`horizon-statements-success`, StatementsSuccess);