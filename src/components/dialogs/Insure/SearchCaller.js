/*
 *		Horizon Insure Search Client Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';

import { isNullorEmpty } from '../../../utils/channelServiceUtilities';

import '../../Common/HorizonSelect';

const RENDER_MODE = {
	SEARCH_CALLER: 0,
	END_CALL: 1
};

const CLIENT_TYPE = {
	CAPITEC_CLIENT: 0,
	NON_CLIENT: 1
}

export class InsureSearchClient extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		RegExp();

		this.renderMode = -1;
		this.isBusy = false;
		this.headerLabel = 'Search Caller Details';
		this.clientType = -1;

		//TODO: Remove this hardcoded values, once the channel service is ready
		this.ivrOptions = [
			{
				"key": "StopCard",
				"value": "Stop Card"
			},
			{
				"key": "Insure",
				"value": "Insure"
			}
		];

		this.identificationMethods = [
			{
				"key": "0",
				"value": "ID/Passport Number"
			},
			{
				"key": "1",
				"value": "Foreign Passport Number"
			},
			{
				"key": "2",
				"value": "Account Number"
			},
			{
				"key": "3",
				"value": "Reference Number"
			},
			{
				"key": "4",
				"value": "Verified Cellphone Number"
			}
		];
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			renderMode: { type: Number },
			clientType: { type: Number },
			incomingCallDetails: { type: Object },
			unverifiedCaller: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		//Below references needs to be pulled from services, for now it's fetched from incoming call details
		this.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
		this.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
		this.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;

		this.incidentReferenceNumber = this.incomingCallDetails.incidentReferenceNumber;
		this.incidentRecNo = this.incomingCallDetails.incidentRecNo;
		this.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;

		this.renderMode = RENDER_MODE.SEARCH_CALLER;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_clientTypeChanged(e) {
		if (e.detail.new) {
			this.clientType = e.target.id === "capitecClient" ? CLIENT_TYPE.CAPITEC_CLIENT : CLIENT_TYPE.NON_CLIENT;
		}
		this.headerLabel = this.clientType === CLIENT_TYPE.CAPITEC_CLIENT ? "Search Caller Details" : "Add Caller Details";
	}

	_onIvrOptionChanged(e) {
		this.ivrOptionCode = e.detail.new.value;
		this.incomingCallDetails.ivrOptionCode = e.detail.new.key;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${CALLERINFOBAR_CSS}

				capitec-modal {
					--theme-modal-header-background-color: #4A4848;
					--theme-modal-header-padding-top: 31px;
					--theme-modal-header-padding-bottom: 31px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7px 16px 9px 0px;
				}
				div[slot="header"]{
					width: 690px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -670px;
					top: -25px;
				}
				div[slot="header"] > span{
					height: 24px;
					width: 190px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					padding-left: 17px;
					margin-right: 355px;
				}
				div[slot="header"] > capitec-button{
					width: 130px;
					--theme-button-padding-top: 12.5px;
					--theme-button-padding-bottom: 12.5px;
					--theme-button-padding-left: 16px;
					--theme-button-default-background-color: #FF2B25;
					--theme-button-default-border-color: #FF2B25;
					--theme-button-default-font-color: rgb(255, 255, 255);
					--theme-button-default-background-tapped-color: #FF2B25;
				}
				.end-call-icon{
					margin: 0px;
					margin-left: 14px;
					margin-top: -5px;
				}
				div[slot="body"]{
					width: 690px;
					height: 540px;
				}
				.call-details-bar{
					display: flex;
					flex-direction: row;
					height: 56px;
					margin: 0px;
					border-bottom: 1px solid #dfdfdf;
				}
				capitec-content-box{
					--theme-container-padding-top: 24px;
					--theme-container-padding-bottom: 0px;
					height: 484px;
				}
				.client-type-label{
					height: 24px;
					width: 91px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin: 0px 0px 31px 0px;
				}
				capitec-radio-group{
					height: 24px;
					width: 398px;
				}
				capitec-radio{
					height:24px;
					width: 199px;
				}
				.search-label{
					height: 24px;
					width: 175px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin-top: 31px;
					margin-bottom: 18px;
				}
				.id-options{
					text-align: justify;
					line-height: 12px	
				}
				.search-field-row{
					height: 72px;
					margin-top: 8px;
				}
				.nonClient-fields-group{
					margin-top: 20px;
				}
				div[slot="footer"] > capitec-group{
					height: 48px;
				}
				div[slot="footer"] > capitec-group > capitec-button{
					margin: 0px;
				}
				capitec-alert-banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 20px 0px 0px 0px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
					
				}`
		];
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`
					<capitec-modal type="free" header-align="left" >
						<div slot="header">
							<span>${this.headerLabel}</span>
							<capitec-button label="End Call"
											@click="${(e) => this.renderMode = RENDER_MODE.END_CALL}">
								<capitec-icon class="end-call-icon" size="small" icon="system/phone-escalation"></capitec-icon>
							</capitec-button>
						</div>
						<div slot="body">
							${this._renderCallInformation()}
							<capitec-content-box>
								${this._renderClientType()}
								${this._renderCapitecClientFields()}
								${this._renderNonClientFields()}
							</capitec-content-box>
							${this._renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this._renderFooter()}
						</div>
					</capitec-modal>`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
		}
	}

	_renderLoadingIndicator() {
		if (!this.isBusy)
			return html``;
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	_renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label 
					label="Reference Number" 
					value = "${this.voiceReferenceNumber}">
				</horizon-label>
				<horizon-select
					label="Client Need"
					display-field="value"
					.items="${this.ivrOptions}"
					.value="${this.ivrOptionCode}"
					@value-changed="${(e) => this._onIvrOptionChanged(e)}">
				</horizon-select>
				<horizon-label
					label="Incoming Number"
					value="${this.incomingTelephoneNumber}">
				</horizon-label>
			</div>`;
	}

	_renderClientType() {
		return html`
			<capitec-label class="client-type-label" label="Client Type"></capitec-label>
			<capitec-radio-group>
				<capitec-group layout="grid" rows="auto" columns="auto" gap="none">
					<capitec-radio id="capitecClient" label="Capitec Client"
								@value-changed="${(e) => this._clientTypeChanged(e)}"
								row="1" column="1">
					</capitec-radio>
					<capitec-radio id="nonCient" label="Non Client"
								@value-changed="${(e) => this._clientTypeChanged(e)}"
								row="1" column="2">
					</capitec-radio>
				</capitec-group>
			</capitec-radio-group>`;
	}

	_renderCapitecClientFields() {
		if (this.clientType === CLIENT_TYPE.CAPITEC_CLIENT) {
			return html`
					<capitec-label class="search-label" label="Search existing client"></capitec-label>
					<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" >
						<div class="search-field-row">
							<capitec-select	id="identificationMethods"
											label="Choose identification method"
											class="id-options"
											.items="${this.identificationMethods}"
											display-field="value">
							</capitec-select>
						</div>
						<div class="search-field-row">
							<capitec-text-field id="searchFieldText" 
												type="search"
												keyboardMode ="numeric" 
												label="Search" 
												focussed="true" 
												hint="" 
												value="">
							</capitec-text-field>
						</div>
					</capitec-group>`;
		}
		return html``;
	}

	_renderNonClientFields() {
		if (this.clientType === CLIENT_TYPE.NON_CLIENT) {
			return html`
				<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" class="nonClient-fields-group">
					<div class="search-field-row">
						<capitec-text-field id="name" 
											label="Name"
											hint="Required Field">
						</capitec-text-field>
					</div>
					<div class="search-field-row">
						<capitec-text-field id="surname" 
											label="Surname"
											hint="Required Field">
						</capitec-text-field>
					</div>
					<div class="search-field-row">
						<capitec-text-field id="cellphone"
											label="Cellphone number (optional)">
						</capitec-text-field>
					</div>
				</capitec-group>`;
		}
		return html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button type="primary"
								label="Search Client"
								?hidden=${this.clientType !== CLIENT_TYPE.CAPITEC_CLIENT}>
				</capitec-button>
				<capitec-button type="primary"
								label="Continue"
								?hidden=${this.clientType !== CLIENT_TYPE.NON_CLIENT}>
				</capitec-button>
			</capitec-group>`;
	}

	_renderEndCallModal() {
		return html`
			<end-call-session
				@on-cancel="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}"
				@on-reason-set="${(reason) => this._onCallCancelled(reason)}">
			</end-call-session>`;
	}
}


window.customElements.define(`horizon-insure-search-client`, InsureSearchClient);