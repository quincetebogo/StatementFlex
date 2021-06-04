import { View, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';
import 'app/components/dialogs/common/EndCallSession';

const RENDER_MODE = Object.freeze({
	SYSTEM_ERROR: 0,
	END_CALL: 1
});

/**
 * A general System Error Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class SystemError
 * @extends {View}
 */
export class SystemError extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.renderMode = RENDER_MODE.SYSTEM_ERROR;
		this.incomingCallDetails = {};
		this.incidentRecId = ``;

		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.eventAggregator.publish(`horizon-favorites-bar`, { hasFavourites: true });
		this.eventAggregator.publish(`horizon-disable-assign-handoff`, { isHidden: true });
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

		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		this.incidentDetails = this.horizonStore.getIncidentDetails();

		if (this.incomingCallDetails) {
			this.incidentRecId = this.incidentDetails.incidentRecId;
			this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._onEndCallClick());
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

	_onEndCallClick() {
		if (this.incomingCallDetails) {
			this.renderMode = RENDER_MODE.END_CALL;
		}
	}

    _assignClick() {
        this.horizonRouter.navigateToStrack(this.incidentRecId);
		this.horizonRouter.navigateToWaitingForCall();
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
				horizon--error-screen {
					--horizon-error-screen-size: 912px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			${this._renderSystemError()}

			${super._webTemplate()}
		`;
	}

	_renderSystemError() {
		if (this.renderMode === RENDER_MODE.SYSTEM_ERROR) {
			return html`
				<horizon--error-screen 
					header="System Error" 
					left=""
					right="Assign"
					toast="Network error"
					image="/images/insure/assign-pay-arrears.svg"
					@right-click=${() => this._assignClick()}>
					<section id="id-error-msg" slot="detail"><b>Notify client:</b> There is an issue with the system</section>
				</horizon--error-screen>`;
		}
	}

	_renderEndCallSessionModal() {
		if (this.renderMode === RENDER_MODE.END_CALL) {
			return html`
				<horizon-end-call-session
					.incidentDetails="${this.incidentDetails}"
					@cancel="{${() => this.renderMode = RENDER_MODE.SYSTEM_ERROR}}"
					.incomingCallDetails="${this.incomingCallDetails}"
					endCallContext="LandingPage">
				</horizon-end-call-session>`;
		}
		return html``;
	}
}

customElements.define(`horizon-system-error`, SystemError);