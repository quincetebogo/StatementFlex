import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	PROOFOFACCOUNT_FAILURE: 0,
	END_CALLSESSION: 1
};

/**
 * Proof of Account send failure Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class ProofOfAccountFailure
 * @extends {View}
 */

 export class ProofOfAccountFailure extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.PROOFOFACCOUNT_FAILURE;
		this.mailId = ``;
		this.acNumber = ``;

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
			// this.returnRoute = state.returnTo.route;
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();
			
			this.mailId = state.emailAddress;
			this.acNumber = state.accountNumber;
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);

			this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());

			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode
			});
		}
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

	_assignClick() {
		this.horizonRouter.navigateToReturnPage(`proofofaccount`);
		// TODO: might make service call over here to resend or navigate to Proof of account model again
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon--error-screen{
					--horizon-error-screen-height:768px;
				}
				#id-error-msg{
					width: auto;
                    font-weight:500;
                    color:#3A3A3A;
                    margin-bottom:35px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProofOfAccountFailure()}
			${this._renderEndCallModal()}
			${this._renderRelatedOptions()}
		`;
	}

	_renderProofOfAccountFailure() {
		if (this.renderMode === RENDER_MODE.PROOFOFACCOUNT_FAILURE) {
			return html`
				<horizon--error-screen
					image="/images/insure/assign-pay-arrears.svg"
					header="Proof of account not sent" 
					left="Done"
					right="Assign"
					toast="Proof of account not sent"
					@left-click=${() => this._doneClick()}
					@right-click=${() => this._assignClick()}>
					<section 
						id="id-error-msg" 
						slot="detail">Your proof of account document for account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b></section>
				</horizon--error-screen>
			`;
		}
		return html``;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.PROOFOFACCOUNT_FAILURE}">
			</horizon-related-options>
		`;
	}
	
	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
				// TODO: edit the card stop success render mode 
			return html`
				<horizon-end-call-session
					.incidentDetails="${this.incidentDetails}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage"
					@cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}">
				</horizon-end-call-session>
			`;
		}
		return html``;
	}
 }

 customElements.define(`horizon-proof-of-account-failure`, ProofOfAccountFailure);