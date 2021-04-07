import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/common/ErrorScreen';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	STATEMENTS_UNSUCCESS: 0,
	END_CALLSESSION: 1,
	STATEMENTS: 2
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
		this.landingPageInfo = {};
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
			this.incomingCallDetails = state.incomingCallDetails;
			this.incidentDetails = state.incidentDetails;      
			this.mailId = state.emailAddress;
      		this.acNumber = state.accountNumber;

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
        this.horizonRouter.navigateToStrack(this.incidentRecId);
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

				.card-related-options {
                    height: 112px;
					width: 1064px;
					margin-bottom:60px;
                }

				.button-margin{
					height: 80px;
					width: 182px;
					margin-right:16px;
					 --horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}
				.options-group{
					height: 80px; 
					margin:16.5px;
				}
				.related-options {
					height: 32px;
					width: 1064px;
					margin-bottom:-2px;
					margin-top:-4px;
					background-color: #F7F7F7;
					border:1px solid #E1E1E1;
					box-sizing:border-box;
					border-radius: 4px;
				}
				
				.related-options-text{
					margin: 0px 0px 0px 16px;
					padding: 0px 0px 0px 0px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
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
		<div class="related-options">
					<p class="related-options-text">Related Options</p>
				</div>
				<capitec-card class="card-related-options">
				<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
				<horizon-option-button
						class="button-margin" 
						label="Tax Certificate" 
						icon="system/sars-action">
					</horizon-option-button>
					<horizon-option-button 
						class="button-margin" 
						label="Proof of Account" 
						icon="system/documents-action">
					</horizon-option-button>
				</capitec-group>
		</capitec-card>
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