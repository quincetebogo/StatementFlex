import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import 'platform/components/layouts/Group'

export class HorizonActionBar extends Component {
	// --------------
	// INITIALISATION
	// --------------	

	constructor() {
		super();
		this.referenceNo = '';
		this.phoneNumber = '';
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			referenceNo: { type: String },
			phoneNumber: { type: String }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.eventAggregator = EventAggregator.getInstance();
		this.eventAggregator.subscribe(`horizon-update-call_actionbar`, (event) => this._onUpdateCallDetails(event));
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onUpdateCallDetails(event) {
		this.referenceNo = event.referenceNo;
		this.phoneNumber = event.phoneNumber;
	}

	_endCallSession() {
		this.eventAggregator.publish(`horizon-end-callsession`, {});
	}

	// ---------
	// RENDERING
	// ---------		
	static get styles() {
		return [
			super.styles,
			css`
				capitec-group {
					border-top: none;
					border-bottom: 1px solid #dfdfdf;
					height:56px;
					background:white;
				}

				capitec-group > capitec-label {
					color: #003652;
					font: bold 18px/35px Hind Vadodara;
					line-height:56px;
				}

				.vertical-line{
					margin-left:24px;
					margin-right:24px;
					border-left: 1px solid #dfdfdf;
					margin-top: 12px;
					height: 32px;
				}

				#id-reference-label{
					margin-left:24px;
				}

				#id-phone-icon{
					margin-top:16px;;
				}

				#id-phone-number-label{
				}

				#id-end-call-button{
					margin-top:2px;
					margin-left:auto;
					margin-right:24px;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-label 
					id="id-reference-label"
					type="title" 
					label="Reference Number: ${this.referenceNo}">
				</capitec-label>
				<div class="vertical-line"></div>
				<img 
					id="id-phone-icon"
					src="../images/phonedown.svg"
				/> 
				<capitec-label
					id="id-phone-number-label" 
					type="title" 
					label="${this.phoneNumber}">
				</capitec-label>
				<capitec-button 
					id="id-end-call-button"
					label="End Call Session" 
					type="primary" 
					@click="${() => this._endCallSession()}">
				</capitec-button> 
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-actionbar`, HorizonActionBar);