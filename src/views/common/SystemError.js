import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonStore } from 'app/store/HorizonStore';
import { tempFixIVROption } from 'app/utils/channelServiceUtilities';

import 'app/components/common/ErrorScreen';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = {
	SYSTEM_ERROR: 0,
	END_CALL: 1,
};

export class SystemError extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.SYSTEM_ERROR;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		// this.incomingCallDetails.ivrOption.possibleValues = [
		// 	{
		// 		key: `StopCard`, value: `Stop Card`
		// 	},
		// 	{
		// 		key: `Insure`, value: `Insure`
		// 	}
		// ];
		// this.incomingCallDetails = state.incomingCallDetails;
		// this.nonClient = state.nonClient;
		// this.unverifiedCaller = state.unverifiedCaller;
		// this.verifiedCaller = state.verifiedCaller;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
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
			//tempFixIVROption(this.incomingCallDetails.ivrOption);
			this.incomingCallDetails.ivrOption.possibleValues = [
				{
					key: `StopCard`, value: `Stop Card`
				},
				{
					key: `Insure`, value: `Insure`
				}
			];

			this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
			this.eventAggregator.publish(`horizon-update-call_actionbar`, {
				referenceNo: this.incomingCallDetails.incidentReferenceNumber,
				phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				ivrOptionCode: this.incomingCallDetails.ivrOptionCode,
				isUnverifiedNumber: this.incomingCallDetails.isUnverifiedNumber
			});
		}
		//this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallSession());
		this.eventAggregator.publish(`horizon-favorites-bar`, { hasFavourites: true });
		this.eventAggregator.publish(`horizon-disable-assign-handoff`, { isDisabled: true });

		// this.eventAggregator.publish(
		// 	`horizon-update-call_actionbar`,
		// 	{
		// 		referenceNo: this.incomingCallDetails.incidentReferenceNumber,
		// 		phoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
		// 		ivrOptionCode: this.incomingCallDetails.ivrOptionCode
		// 	}
		// );
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onEndCallSession() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_leftClick() {
		console.log(`left`);
	}

	_rightClick() {
		console.log(`right`);
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
					width: 329px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderSystemError()}
			${this._renderEndCallSessionDialog()}
		`;
	}

	_renderSystemError() {
		if (this.renderMode === RENDER_MODE.SYSTEM_ERROR) {
			return html`
				<horizon--error-screen 
					header="Network Error" 
					left="Assign"
					right="Try Again"
					toast="Network error"
					@left-click=${() => this._leftClick()}
					@right-click=${() => this._rightClick()}>
					<section id="id-error-msg" slot="detail"><b>Notify client:</b> Something went wrong try again</section>
				</horizon--error-screen>`;
		}
	}

	_renderEndCallSessionDialog() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session 
					@cancel="{${() => this.renderMode = RENDER_MODE.SYSTEM_ERROR}}"
					.incomingCallDetails="${this.incomingCallDetails}">
				</horizon-end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`horizon-system-error`, SystemError);