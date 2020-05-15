import { EventAggregator } from 'platform/EventAggregator';
import { View, html, css } from 'platform/elements';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { isDisabled, isHidden, getTabIndex, getPossibleValues } from '../../utils/channelServiceUtilities';

export class EndCallSessionReason extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.eventAggregator = EventAggregator.getInstance();
		this.endCallReason = null;
		this.cancelButton = {};
		this.endCallSessionButton = {};
		this.endCallReasons = {};

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);
		this.isBusy = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			endCallReason: { type: Object },
			cancelButton: { type: Object },
			endCallSessionButton: { type: Object },
			endCallReasons: { type: Object },
			isBusy: { type: Boolean }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// TODO: Consider what happens if this service call fails. We will be left with
		// the progress bar on the screen permanently and an error message on the status dialog
		// This call should perhaps be done before showing the dialog or this dialog needs its own
		// error handler.
		this.serviceCallHelper.call(
			this.stopCardService.endCallOptions(),
			(options) => {
				this.cancelButton = options.cancelButton;
				this.endCallSessionButton = options.endCallSessionButton;
				this.endCallReasons = options.endCallReasons;
			}
		);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onValueChanged(e) {
		if (e.detail.new) {
			this.endCallReason = e.detail.selected
		};
	}

	_onReasonSelected() {
		this.dispatchEvent(new CustomEvent('on-reason-set', { detail: { endCallReason: this.endCallReason } }));
	}

	_onCancelpopup() {
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	// ---------
	// RENDERING
	// ---------	

	static get styles() {
		return [
			super.styles,
			css`
			.options-group {
				width:396px; 
				margin-top:24px; 
				margin-left:24px;
			}
			
			#id-button-cancel{
				margin-left: auto;
			}

			.line{
				width:100%;
				margin-top:30px;
				border-top:1px solid #dfdfdf;"
			}			
			`
		]
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		let options = getPossibleValues(this.endCallReasons);

		if (Array.isArray(options) && options.length > 0) {
			return html`
			<capitec-modal type="free" header="End Call Session Reason">
				<div slot="body">
					${this._renderCallSessionReason(options)} 
					<div class="line"></div>
					${this._renderLoadingIndicator()}
				</div>
				<div slot="footer">
					${this._renderCallSessionFooter()} 
				</div>
			</capitec-modal>`
		} else {
			return html`${this._renderLoadingIndicator()}`;
		}
	}

	_renderCallSessionReason(options) {
		return html`
			<capitec-radio-group class="options-group">
				${options.map(line => { return this._renderRadioButton(line) })}
			</capitec-radio-group>
			`;
	}

	_renderRadioButton(line) {
		return html`
			<capitec-radio 
				label="${line.value}"
				data="${line}"
				@value-changed="${(e) => { e.detail.selected = line; this._onValueChanged(e) }}">
			</capitec-radio>
		`;
	}

	_renderCallSessionFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
					id="id-button-cancel"
					type="clear" 
					label="Cancel" 
					?hidden=${isHidden(this.cancelButton)}
					.disabled="${isDisabled(this.cancelButton)}"
					tabindex="${getTabIndex(this.cancelButton)}"					
					@click="${() => this._onCancelpopup()}">
				</capitec-button>
				<capitec-button 
					type="clear" 
					label="End Call"
					?hidden=${isHidden(this.endCallSessionButton)}
					?disabled="${this.endCallReason === null}"
					tabindex="${getTabIndex(this.endCallSessionButton)}"					
					 @click="${() => this._onReasonSelected()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}
		else
			return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}
}

window.customElements.define(`end-call-session`, EndCallSessionReason);