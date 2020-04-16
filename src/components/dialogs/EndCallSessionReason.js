import { EventAggregator } from 'platform/EventAggregator';
import { View, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
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
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			endCallReason: { type: Object },
			cancelButton: { type: Object },
			endCallSessionButton: { type: Object },
			endCallReasons: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.stopCardService = StopCardService.getInstance();

		this.stopCardService.endCallOptions()
			.then((response) => {
				this.cancelButton = response.cancelButton;
				this.endCallSessionButton = response.endCallSessionButton;
				this.endCallReasons = response.endCallReasons;
			})
			.catch((error) => {
				console.log(error);
			});

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

	// n/a

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
		return html`
		<capitec-modal type="free" header="End Call Session Reason">
			<div slot="body">
						${this._renderCallSessionReason()} 
				<div class="line"></div>
			</div>
			<div slot="footer">
				${this._renderCallSessionFooter()} 
			</div>
		</capitec-modal>
	`;
	}

	_renderCallSessionReason() {
		let options = getPossibleValues(this.endCallReasons);

		if (Array.isArray(options) && options.length > 0) {
			return html`
			<capitec-radio-group class="options-group">
				${options.map(line => { return this._renderRadioButton(line) })}
			</capitec-radio-group>
			`;
		}
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
}

window.customElements.define(`end-call-session`, EndCallSessionReason);