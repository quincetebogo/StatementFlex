/*
 *		Horizon Insure Search Client Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { EventAggregator } from 'platform/EventAggregator';

import { CALLERINFOBAR_CSS } from '../../../css/CallerInfoBar';
import { HORIZON_CALLER_DIALOG_HEADER_CSS } from '../../../css/HorizonModalHeader';

import { isNullorEmpty, getTabIndex, isHidden } from '../../../utils/channelServiceUtilities';
import { ServiceCallHelper } from '../../../utils/serviceCallHelper';
import { StopCardService } from '../../../services/StopCardService';

import '../../Common/HorizonSelect';

const RENDER_MODE = {
	SEARCH_CALLER: 0,
	END_CALL: 1
};

const CLIENT_TYPE = {
	CAPITEC_CLIENT: 0,
	NON_CLIENT: 1
}

//ToDO: Below const need to be removed, once channelService fix the issue on contract.
// These error messages has to come from service
const ERROR_MESSAGES = {
	REQUIRED_FIELDS_EMPTY: 'All fields are required',
	NOT_FOUND: {
		0: {
			ALERT_BANNER: 'The ID/Passport number not found. This is not a valid ID/Passport number',
			FIELD_ERROR: 'ID/Passport number not found'
		},
		1: {
			ALERT_BANNER: 'The foreign passport number not found. This is not a valid foreign passport number',
			FIELD_ERROR: 'Foreign passport number not found'
		},
		2: {
			ALERT_BANNER: 'The account number not found. This is not a valid account number',
			FIELD_ERROR: 'Account number not found'
		},
		3: {
			ALERT_BANNER: 'The reference number not found. This is not a valid reference number',
			FIELD_ERROR: 'Reference number not found'
		},
		4: {
			ALERT_BANNER: 'The cellphone number not found. This is not a verified Capitec number',
			FIELD_ERROR: 'Cellphone number not found'
		}
	}
}

const REGEX_PATTERNS = {
	0: {
		PATTERN: /^[0-9]{13}$/,
		FIELD_ERROR: 'ID Number must be 13 characters long',
		ALERT_BANNER: 'Incorrect ID/Passport number'
	},
	1: {
		PATTERN: /^/,
		FIELD_ERROR: ''
	},
	2: {
		PATTERN: /^[0-9]{10}$/,
		FIELD_ERROR: 'Account number must be 10 characters long',
		ALERT_BANNER: 'Incorrect Account number'
	},
	3: {
		PATTERN: /^[0-9]{6}$/,
		FIELD_ERROR: 'Reference number must be 6 characters long',
		ALERT_BANNER: 'Incorrect Reference number'
	},
	4: {
		PATTERN: /^[0-9]{10}$/,
		FIELD_ERROR: 'Enter a 10 digit cellphone number',
		ALERT_BANNER: 'Incorrect Capitec cellphone number'
	}
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
		this.errMessage = {
			searchType: "",
			searchValue: ""
		}
		this.alertBanner_Message = "";

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
		this.searchType = { "key": "", "value": "" };
		this.searchValue = "";

		this.eventAggregator = EventAggregator.getInstance();
		this.stopCardService = StopCardService.getInstance();

		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, unless you need an exception handler generic to component
		);
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
			unverifiedCaller: { type: Object },
			alertBanner_Message: { type: String }
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
		this.incidentRecId = this.incomingCallDetails.incidentRecId;
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
		this._clearErrors();
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors();
	}

	_onKeyPress(e) {
		this._clearErrors();
	}

	async _onSearchClient() {

		if (this._validaeFields()) {
			let searchClient = {
				incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
				voiceReferenceNumber: this.incomingCallDetails.voiceReferenceNumber,
				incidentNo: this.incidentReferenceNumber,
				agentTelephoneNumber: this.agentTelephoneNumber,
				ivrOption: 'StopCard', //hardcoded value to demo the flow
				identificationMethod: this.searchType.key,
				searchValue: this.searchValue
			}

			let identifiedClient = await this.serviceCallHelper.asyncCall(this.stopCardService.searchCaller(searchClient), (ex) => this._handleSearchClientException(ex));
			if (identifiedClient) {
				//Service returns ivrOption as "StopCard", actually we are in "Insure".
				identifiedClient.ivrOption.value = this.incomingCallDetails.ivrOptionCode;
				this._raiseOnClientIdentified(identifiedClient);
			}
		}
	}

	_onIvrOptionChanged(e) {
		this.ivrOption.value = e.detail.new.value;
		this.incomingCallDetails.ivrOptionCode = e.detail.new.key;
	}

	_onContinue() {
		//TODO: Add non client details comes here
	}

	_onCallCancelled(reason) {
		this.dispatchEvent(new CustomEvent('call-ended', { detail: { unverifiedCaller: {}, endCallReason: reason.detail.endCallReason } }));
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validaeFields() {

		let isRequiredFieldsEmpty = this._isRequiredFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBanner_Message = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			return false;
		}

		let regexValidation = REGEX_PATTERNS[this.searchType.key];
		let REGEX_PATTERN = regexValidation.PATTERN;

		if (!RegExp(REGEX_PATTERN, 'g').test(this.searchValue)) {
			this.errMessage.searchValue = regexValidation.FIELD_ERROR;
			this.alertBanner_Message = regexValidation.ALERT_BANNER;
			return false;
		}

		return true;
	}

	_isRequiredFieldsEmpty() {
		this.errMessage.searchValue = isNullorEmpty(this.searchValue) ? "This is a required field" : "";
		this.errMessage.searchType = isNullorEmpty(this.searchType.key) ? "Choose an Identification Method" : "";

		return this.errMessage.searchValue || this.errMessage.searchType;
	}

	_clearErrors() {
		this.errMessage.searchType = "";
		this.errMessage.searchValue = "";
		this.alertBanner_Message = "";
	}

	_toggleBusyFlag() {
		this.isBusy = this.isBusy ? false : true;
	}

	_handleSearchClientException(exception) {
		let event = {
			from: 'UI-CS',
			status: "error",
			message: ""
		}

		if (exception instanceof TypeError) {
			event.message = exception.message;
		}
		else if (exception instanceof HttpStatusError) {
			if (exception.status === 204) {
				let errMessages = ERROR_MESSAGES.NOT_FOUND[this.searchType.key];
				this.alertBanner_Message = errMessages.ALERT_BANNER;
				this.errMessage.searchValue = errMessages.FIELD_ERROR;
				return true;
			}
			else {
				event.message = `${exception.status}: ${exception.message}`;
			}
		}
		else {
			event.message = `UNEXPECTED ERROR: ${exception.message}`;
		}

		this.eventAggregator.publish(`horizon-status-bar-update`, event);
		return true;
	}

	_getIvrOptionKey(ivrOption) {
		let result = ivrOption.possibleValues.find((entry) => entry.value === ivrOption.value);
		return result.key;
	}

	_raiseOnClientIdentified(identifiedClient) {
		this.dispatchEvent(new CustomEvent('on-client-identified', {
			detail: {
				identifiedClient: identifiedClient,
				incomingCallDetails: this.incomingCallDetails
			}
		}));
	};

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${CALLERINFOBAR_CSS}
				${HORIZON_CALLER_DIALOG_HEADER_CSS}

				capitec-modal {
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
					--theme-modal-footer-padding: 7px 16px 9px 0px;
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
				.reset-margin-bottom{
					margin-bottom : 0px;
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
					
					margin: 20px 0px 16px 0px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}`
		];
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`
					<capitec-modal type="free" header-align="left" >
						<capitec-group slot="header" layout="horizontal" halign="left" valign="center" gap="none" id="modalHeader">
							<capitec-label type="title" 
											label="${this.headerLabel}">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-button label="End Call" 
											@click="${() => this.renderMode = RENDER_MODE.END_CALL}">
								<img class="end-call-icon" src="../../../images/hangup.svg"/>
							</capitec-button>
						</capitec-group>
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
					<capitec-label class="search-label ${this.alertBanner_Message ? `reset-margin-bottom` : ``}"
								   label="Search existing client">
					</capitec-label>
					${this._renderAlertBanner()}
					<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" >
						<div class="search-field-row">
							<capitec-select	id="searchType"
											class="id-options"
											label="Choose identification method" 
											.items="${this.identificationMethods}"
											.value="${this.searchType}"
											id-field="key"
											display-field="value"
											@value-changed="${(e) => this._valueChanged(e)}"
											error="${this.errMessage.searchType}">
							</capitec-select>
						</div>
						<div class="search-field-row">
							<capitec-text-field id="searchValue"
												type="search"
												keyboardMode ="numeric" 
												label="Search" 
												focussed="true" 
												value="${this.searchValue}"
												@value-changed="${(e) => this._valueChanged(e)}"
												@key-input="${(e) => this._onKeyPress(e)}"
												error="${this.errMessage.searchValue}">
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

	_renderAlertBanner() {

		if (!isNullorEmpty(this.alertBanner_Message)) {
			return html`
				<capitec-alert-banner type="error" label="${this.alertBanner_Message}" closable></capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button type="primary"
								@click="${(e) => this._onSearchClient(e)}"
								label="Search Client"
								?hidden=${this.clientType !== CLIENT_TYPE.CAPITEC_CLIENT}>
				</capitec-button>
				<capitec-button type="primary"
								@click="${(e) => this._onContinue(e)}"
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