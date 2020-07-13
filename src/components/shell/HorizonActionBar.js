import { Component, html, css } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import 'platform/components/layouts/Group';

import '../Common/HorizonLabel';


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
				capitec-title-bar{
					--theme-type-default-background: #363434
				}

				capitec-title-bar > capitec-group:first-child {
					--theme-layout-gap-spacing: 24px;
				}

				capitec-title-bar > capitec-group:last-child {
					--theme-layout-gap-spacing: 16px;
				}

				horizon-label{
					--horizon-label-text-height: 16px;
					--horizon-label-text-color: #969B9D;
					--horizon-label-text-line-height: 16px;

					--horizon-label-value-margin-top: 2px;
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #DCDCDC;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}

				.vertical-line{
					height: 24px;
					width: 1px;
					background-color: rgba(255,255,255,0.3);
				}

				capitec-group > capitec-button {
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 18px;
					--theme-button-padding-right: 21px;
					--theme-button-clear-font-color: #FFFFFF
				}

				capitec-group > capitec-button:last-child{
					width: 130px;
					
					--theme-button-padding-top: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-right: 16px;
					--theme-button-padding-left: 16px;
					--theme-button-default-background-color: #FF2B25;
					--theme-button-default-border-color: #FF2B25;
					--theme-button-default-font-color: rgb(255, 255, 255);
					--theme-button-default-background-tapped-color: #FF2B25;
				}
			
				.end-call-icon{
					margin-left: 12px;
				}	
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-title-bar>
				<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
					<horizon-label
						label="Reference Number" 
						value="082 555 9090">
					</horizon-label>
					<div class="vertical-line"></div>
					<horizon-label
						label="Primary Need" 
						value="Insure">
					</horizon-label>
					<div class="vertical-line"></div>
					<horizon-label
						label="Incoming call" 
						value="Private Number"
						icon="system/phone-escalation">
					</horizon-label>
				</capitec-group>
				<capitec-spacer></capitec-spacer>
				<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
					<capitec-button type="clear" label="Assign"></capitec-button>
					<div class="vertical-line"></div>
					<capitec-button type="clear" label="Handoff"></capitec-button>
					<capitec-button label="End Call" 
									@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
						<img class="end-call-icon" src="../../images/hangup.svg"/>
					</capitec-button>
				</capitec-group>
			</capitec-title-bar>
		`;
	}
}

window.customElements.define(`horizon-actionbar`, HorizonActionBar);