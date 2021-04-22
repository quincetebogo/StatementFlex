import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	STATEMENTS_UNSUCCESS: 0,
	END_CALLSESSION: 1
};

/**
 * Display an Unsuccessful screen statement for savings account was not emailed.
 *
 * @export
 * @class StatementsUnsuccess
 * @extends {View}
 */
export class StatementsUnsuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS;
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
	 * @memberof StatementsUnsuccess
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
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();
			
			this.mailId = state.emailAddress;
      		this.acNumber = state.accountNumber;
			this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);

		    this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCall());
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
		// this.renderMode = RENDER_MODE.STATEMENTS; 
        this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_handoffClick() {
		const incidentRecId = this.incidentDetails.incidentRecId;

		this.horizonRouter.navigateToStrack(incidentRecId);
		this.horizonRouter.navigateToReturnPage(`handoff`);
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
			${this._renderUnsuccessScreen()}
			${this._renderEndCallModal()}
			${this._renderRelatedOptions()}
		`;
	}

	_renderUnsuccessScreen() {
		return html`
			<horizon--error-screen header="Statement not emailed"
			                        image="/images/insure/assign-pay-arrears.svg"
									left="Done"
									right="Assign"
									toast="Statement not emailed"
									@left-click=${() => this._doneClick()}
									@right-click=${() => this._handoffClick()}>
				<section 
					id="id-error-msg" 
					slot="detail">The statement for savings account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
				</section>
			</horizon--error-screen>
		`;
	}

    _renderRelatedOptions() {
		return html`
            <horizon-related-options
				context = "Failure"
				@cancel = "${() => this.renderMode = RENDER_MODE.STATEMENTS_UNSUCCESS}">
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

customElements.define(`horizon-statements-unsuccess`, StatementsUnsuccess);