import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonStore } from 'app/store/HorizonStore';
import { RoleManager } from 'app/shell/RoleManager';
import { formatPhoneNumber } from 'app/utils/channelServiceUtilities';
import 'platform/components/layouts/Group';

import 'app/components/common/HorizonLabel';

/**
 * The Horizon Action Bar is the top most bar on most Horizon Applications screens. 
 * The bar displays caller information and provides quick access to assign, hand off 
 * or end calls.
 */
export class HorizonActionBar extends Component {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.referenceNo = ``;
		this.phoneNumber = ``;
		this.clientNeed = ``;
		this.isUnverifiedNumber = null;
		this.isHidden = true;
		this.hideAddCallerDetails = false;

		this.horizonStore = HorizonStore.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.roleManager = RoleManager.getInstance();
		
		this.callerInformation = this.horizonStore.getCallerInformation();
		this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();

		this.ivrOptions = this.incomingCallDetails.ivrOption.possibleValues;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			referenceNo: { type: String },
			phoneNumber: { type: String },
			clientNeed: { type: String },
			isUnverifiedNumber: { type: Boolean },
			isHidden: { type: Boolean },
			hideAddCallerDetails: { attribute: false }
		};
	}

	get _incRefNumber() {
		return this.referenceNo && this.referenceNo > 0 ? this.referenceNo : ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.eventAggregator = EventAggregator.getInstance();
		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));
		this.assignSub = this.eventAggregator.subscribe(`horizon-disable-assign-handoff`, (e) => this._isDisabled(e));
	}

	disconnectedCallback() {
		this.assignSub.dispose();
		this.stateChangeSub.unsubscribe();

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_stateChanged(state) {
		if (state) {
			this.referenceNo = this.horizonIncidentManager.primaryIncident?.toString();
			this.phoneNumber = this.incomingCallDetails.incomingTelephoneNumber;
			this.clientNeed = this._getNeedDisplayValue(this.incomingCallDetails.ivrOptionCode);
			this.isUnverifiedNumber = typeof this.isUnverifiedNumber === `undefined` ? false : this.isUnverifiedNumber;
			this.hideAddCallerDetails = state.callerInformation && state.callerInformation.isNonClient;
		}
	}

	_onUpdateCallDetails(event) {
		this.referenceNo = event.referenceNo;
		this.phoneNumber = event.phoneNumber;
		this.clientNeed = event.ivrOptionCode;
		this.isUnverifiedNumber = event.isUnverifiedNumber;
	}

	_isDisabled(e) {
		this.isHidden = true;
	}

	_addCallerDetails() {
		this.eventAggregator.publish(`horizon-add-caller-details`, {});
	}

	_endCallSession() {
		this.eventAggregator.publish(`horizon-end-callsession`, {});
	}

    _onAssign() {
		this.eventAggregator.publish(`horizon-assign-incident`, {});
	}

	// ---------
	// PRIVATE METHODS
	// ---------

	_getNeedDisplayValue(need) {
		const result = this.ivrOptions.find((entry) => entry.key === need);
		return result ? result.value : ``;
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
				.noIncRef {
					width: auto;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
				}
				.noIncRef > capitec-icon {
					--theme-icon-size-medium: 20px;
					--theme-layout-gap-spacing: 10px
				}
				.noIncRef > capitec-label {
					--theme-label-default-font-size: 16px;
					--theme-label-font-color: #DCDCDC;
					--theme-label-default-font-weight: 600;
				}`
		];
	}

	_mobileTemplate() {
	}

    _webTemplate() {
		return html`
			<capitec-title-bar>
				<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
					${this._renderIncRefNumber()}
					<div class="vertical-line"></div>
					<horizon-label
						label="Primary Need" 
						value="${this.clientNeed}"
						data-automation-id="action-bar-clientNeed">
					</horizon-label>
					<div class="vertical-line"></div>
					<img class="end-call-icon" src="/images/shell/incoming-call.svg"/>
					<horizon-label
						label="Incoming call" 
						value="${this.isUnverifiedNumber ? `Private Number` : formatPhoneNumber(this.phoneNumber)}"
						data-automation-id="action-bar-phone-number">
					</horizon-label>
				</capitec-group>
				<capitec-spacer></capitec-spacer>
				<capitec-group layout="horizontal" halign="left" valign="center" gap="clear">
					<capitec-button type="clear" 
									label="Assign"
									?hidden="${this.isHidden}"
									@click="${() => this._onAssign()}"
									data-automation-id="action-bar-assign-button">
					</capitec-button>
					<div class="vertical-line" ?hidden="${true}"></div>
					<capitec-button type="clear" 
									label="Handoff"
									?hidden="${this.isHidden}"
                                    @click = "${() => this._onAssign()}"
									data-automation-id="action-bar-hand-off-button">
					</capitec-button>
					<capitec-button type="clear"
									label="Add caller details"
									?hidden="${this.hideAddCallerDetails || this.roleManager.isInsureAgent}"
									@click="${() => this._addCallerDetails()}"
									data-automation-id="action-bar-add-caller-details">
					</capitec-button>
					<div class="vertical-line"></div>
					<capitec-button label="End Call" 
									@click="${() => this._endCallSession()}"
									data-automation-id="action-bar-end-call">
						<img class="end-call-icon" src="/images/common/hangup.svg"/>
					</capitec-button>
				</capitec-group>
			</capitec-title-bar>
		`;
	}

	_renderIncRefNumber() {
		return !this._incRefNumber
		? html`
			<capitec-content-box class="noIncRef" layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-icon
					size="medium"
					icon="status/warning-trans">
				</capitec-icon>
				<capitec-label label="Incident not created"></capitec-label>
			</capitec-content-box>`
		: html`
			<horizon-label
				label="Reference Number" 
				value="${this._incRefNumber}"
				data-automation-id="action-bar-reference-no">
			</horizon-label>
		`;
	}
}

window.customElements.define(`horizon-actionbar`, HorizonActionBar);