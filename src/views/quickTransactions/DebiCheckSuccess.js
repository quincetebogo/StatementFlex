import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/OptionButton';
import 'app/components/common/SuccessScreen'
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	DEBICHECK_SUCCESS: 0,
	END_CALLSESSION: 1
};

/**
 * Display an confirmation/success screen indicating the selected debicheck mandate have been successfully declined.
 */
export class DebiCheckSuccess extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.displayNotification = false;
		this.renderMode = RENDER_MODE.DEBICHECK_SUCCESS;
		this.mandateID = "";
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			displayNotification: { type: Boolean },
			renderMode: { type: Number }
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
			this.mandateID = 'DISCLIFE 5130111776-21';
		    this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
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
	_onToastDisplayTimeout() {
		this.displayNotification = true;
	}

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALLSESSION;
	}

	_doneClick() {
		//TODO: Action to be added on left button Done click.
	}

	_debiCheckMandatesClick() {
		//TODO: Action to be added on right button DebiCheckMandate click.
	}

	_toggleBusyFlag() {
		// Only used for Call Completion at present.
		// May be implemented later to render progress on endCall method
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
				
				.success-toast{
					position: absolute;
					top : 32px;
					left:784px;
					width : 352px;
					height: 64px;
				}

				#debicheck-image {
					margin-top:174px;
				}
				
				.debiCheck-card {
					margin-top:29px;
					margin-bottom:24px;
					height: 32px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 24px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 36px;
					text-align: center;
				}

				#id-button-group {
					justify-content: center;
					margin-top: 64px;
				}
				
				.button {
					height: 48px;
					--theme-button-font-weight: 600;
					--theme-button-font-size: 16px;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-padding-top: 13px;
					--theme-button-padding-bottom: 13px;
					--theme-button-primary-border-width: 0px;
				}
				
				.related-options {
					margin-top:144px;
					height: 32px;
					width: 100%;
					background-color: #F4F4F4;
					border-top: 1px solid #dfdfdf;
					border-bottom: 1px solid #dfdfdf;
				}

				.related-options-text{
					margin: 0px 0px 0px 24px;
					padding: 0px 0px 0px 0px;
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 30px;
				}

				.options-group{
					margin:17px 0px 15px 16px;
				}

				.button-margin{
					height: 80px;
					width: 182px;
					margin-right:16px;
				}

				.status-group{
					width: auto;
					height: 26px;
					display: flex;
					flex-wrap: wrap;
					justify-content: center;
				}

				.debiCheck-status-success{
					height: 26px;
					width: auto;
					display: flex;
					align-items: center;
					margin: 0px 0px 0px 15px;
				}

				capitec-icon{
					height: 26px;
					width: 26px;
				}
				
				.debiCheck-status-text {
					height: 24px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
					line-height: 24px;
					text-align: start;
					margin: 0px 0px 0px 7px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-success-screen header="DebiCheck mandate approved" 
                                    image="/images/transactions/debiCheckMandate.svg"
				                    left="Done"
                                    right="DebiCheck Mandates"
                                    toast="DebiCheck mandate declined."
                                    @left-click=${() => this._doneClick()}
				                    @right-click=${() => this._debiCheckMandatesClick()}>
				<section id="id-error-msg" slot="detail">DebiCheck mandate for <b>${this.mandateID}</b> has been declined.
				</section>
				<section id="id-option-button" slot="option-button">
					<horizon-option-button class="button-margin" label="Transaction History" img-src="/images/history.svg">
					</horizon-option-button>
				</section>
			</horizon-success-screen>
			${this._renderEndCallModal()}
		`;
	}

	_renderEndCallModal() {
		if (this.renderMode === RENDER_MODE.END_CALLSESSION) {
			return html`
			<horizon-end-call-session @cancel="${() => this.renderMode = RENDER_MODE.CARD_STOP_SUCCESS}"
				.incomingCallDetails="${this.incomingCallDetails}">
			</horizon-end-call-session>`;
		}

		return html``;
	}

}

customElements.define(`horizon-debi-check-success`, DebiCheckSuccess);