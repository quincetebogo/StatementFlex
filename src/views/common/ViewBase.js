import { View, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import 'app/components/dialogs/common/EndCallSession';

/**
 * A Base class for view components to collect common functionality used across most views
 * 
 * This base class will contain the following common code
 * 
 *    - support for ending a call
 *    - support for verifying a caller
 *    - support for assigning/handing off a call
 *    - restoration of common state information
 *    - incident management
 *    - possibly support for updating the left menu bar
 *    - possibly support for updating access channels
 *    - possibly support for updating client insights
 *
 * @export
 * @class ViewBase
 * @extends {View}
 */
export class ViewBase extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonStore = HorizonStore.getInstance();

        this.state = this.horizonStore.recoverState();

		this.callerInformation = this.state.callerInformation;
        this.incomingCallDetails = this.state.incomingCallDetails;

		this.isBusy = false;
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			callerInformation: { attribute: false },
		    incomingCallDetails: { attribute: false },

			renderMode: { attribute: false },
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		this.endCallSub = this.eventAggregator.subscribe(`horizon-end-callsession`, () => this._endCallClick());

		super.connectedCallback();
	}

	disconnectedCallback() {
		this.endCallSub.dispose();
		
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_endCallClick() {
		this.renderMode = RENDER_MODE.END_CALL;
	}

	_cancelEndCallClick() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`${this._renderLoadingIndicator()}`;
	}

	_renderEndCallSessionModal(isReassigned, endCallContext) {
		return this.renderMode === RENDER_MODE.END_CALL
			? html`
				<horizon-end-call-session
					.incomingCallDetails="${this.incomingCallDetails}"
					.isReassigned="${isReassigned}"
					endCallContext=${endCallContext}
					@cancel="${() => this._cancelEndCallClick()}">
				</horizon-end-call-session>`
			: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}