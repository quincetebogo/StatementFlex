/*
 *		Horizon Search Client Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';
import { HttpStatusError } from 'platform/errors/HttpStatusError';
import { EventAggregator } from 'platform/EventAggregator';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { isDisabled, isHidden, getTabIndex, isNullorEmpty } from '../../utils/channelServiceUtilities';

import '../dialogs/ConfirmCallerDetails';
import '../../components/Common/HorizonSelect';
import '../dialogs/Insure/SearchCaller';

const RENDER_MODE = {
	SEARCH_CALLER: 0,
	END_CALL: 1,
	INSURE_SEARCH_CALLER: 2
};

const ERROR_MESSAGES = {
	REQUIRED_FIELDS_EMPTY: 'All fields are required',
	0: 'Incorrect ID/Passport number',
	1: 'Incorrect foreign passport number',
	2: 'Incorrect account number',
	3: 'Incorrect reference number',
	4: 'Incorrect Capitec cellphone number'
}

//ToDO: Below const need to be removed, once channelService fix the issue on contract.
const REGEX_PATTERNS = {
	0: {
		PATTERN: /^[0-9]{13}$/,
		ERR_MESSAGE: 'ID Number must be 13 characters long'
	},
	1: {
		PATTERN: /^/,
		ERR_MESSAGE: ''
	},
	2: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: 'Account number must be 10 characters long'
	},
	3: {
		PATTERN: /^[0-9]{8}$/,
		ERR_MESSAGE: 'Either it is Alphanumeric or not equal to 8 digits'
	},
	4: {
		PATTERN: /^[0-9]{10}$/,
		ERR_MESSAGE: 'Cellphone Number must be 10 characters long'
	}
}

export class SearchClientDetailsComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.eventAggregator = EventAggregator.getInstance();

		RegExp();

		this.errMessage = {
			identificationMethods: "",
			searchFieldText: ""
		}
		this.unverifiedCaller = null;
		this.renderMode = -1;

		this.stopCardService = StopCardService.getInstance();
		this.serviceCallHelper = new ServiceCallHelper(
			() => { this._toggleBusyFlag() }, // ServiceCallHelper will toggle the busy flag
			null // Don't register an exception handler, ServiceCallHelper provides a default handler
		);
		this.isBusy = false;
		this.alertBanner_Message = '';
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			errMessage: { type: Object },
			unverifiedCaller: { type: Object },
			renderMode: { type: Number },
			alertBanner_Message: { type: String }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// We can enter this dialog in two ways
		//    1. From the Confirm Caller Dialog that the caller is not associated with the verified phone number
		//	  2. From the Landing Page after receiving an unverified call

		// Setup references into the incoming model. The following sets up references to 
		// fields commmon to both incoming models
		this.voiceReferenceNumber = this.unverifiedCaller.voiceReferenceNumber;
		this.ivrOption = this.unverifiedCaller.ivrOption;
		this.incomingTelephoneNumber = this.unverifiedCaller.incomingTelephoneNumber;
		this.incidentReferenceNumber = this.unverifiedCaller.incidentReferenceNumber;
		this.agentTelephoneNumber = this.unverifiedCaller.agentTelephoneNumber;

		if (this.stopCardService.isConfirmedCaller(this.unverifiedCaller)) {
			// We are coming from the confirmed user dialog
			this._loadSearchOptions();

			this.isUnverifiedNumber = this.unverifiedCaller.isUnverifiedNumber;
		}
		else {
			// We are coming from the landing page/Desktop Agent event.
			this.identificationMethodsList = this.unverifiedCaller.identificationMethods;
			this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
		}
		this.renderMode = RENDER_MODE.SEARCH_CALLER;
		this.searchFieldText = null;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onKeyPress(e) {
		if (e.detail.new !== "") {
			this.errMessage[e.currentTarget.id] = "";
			this.alertBanner_Message = "";
		}
	}

	_valueChanged(e) {
		if (typeof e.detail.new === "object") {
			this[e.currentTarget.id].value = e.detail.new.key;
		}
		else {
			this[e.currentTarget.id] = e.detail.new;
		}
		this.clearErrors();
	}

	async _onSearchClick(e) {
		if (this.validateFields()) {
			console.log("service call");

			let searchClient = {
				incomingTelephoneNumber: this.unverifiedCaller.incomingTelephoneNumber.value,
				voiceReferenceNumber: this.unverifiedCaller.voiceReferenceNumber.value,
				incidentNo: this.unverifiedCaller.incidentReferenceNumber,
				agentTelephoneNumber: this.unverifiedCaller.agentTelephoneNumber,
				ivrOption: 'StopCard',
				identificationMethod: this.identificationMethods.value,
				searchValue: this.searchFieldText
			}

			let identifiedClient = await this.serviceCallHelper.asyncCall(this.stopCardService.searchCaller(searchClient), (ex) => this._handleSearchClientException(ex));
			if (identifiedClient) {
				identifiedClient.incidentReferenceNumber = searchClient.incidentNo;
				identifiedClient.agentTelephoneNumber = searchClient.agentTelephoneNumber;
				this.raiseBackEvent(identifiedClient)
			}
			else {
				// TODO: handle not found - we don't deal with this at all at present
			}
		}
	}

	raiseBackEvent(identifiedClient) {
		//TODO: Populate event with data to return to the confirm dialog.
		// it will then return to the landing page
		// The landing page will invoke IdentifyCaller and transition to the Client-Profie/Stopcard page
		this.dispatchEvent(new CustomEvent('on-client-identified', {
			detail: {
				identifiedClient: identifiedClient
			}
		}));
	};

	onCallCancelled(reason) {
		this.dispatchEvent(new CustomEvent('call-ended', { detail: { unverifiedCaller: {}, endCallReason: reason.detail.endCallReason } }));
	}

	_ivrOptionChanged(e) {
		this.ivrOption.value = e.detail.new.key;
		if (e.detail.new.key === "Insure") {
			this.renderMode = RENDER_MODE.INSURE_SEARCH_CALLER;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_loadSearchOptions() {
		let clientInfo = {
			"incomingTelephoneNumber": this.incomingTelephoneNumber.value,
			"voiceReferenceNumber": this.voiceReferenceNumber.value,
			"ivrOptionCode": 'StopCard', //TODO: fix this. this must be passed correctly from the structure
			"incidentReferenceNumber": this.incidentReferenceNumber,
			"agentTelephoneNumber": this.agentTelephoneNumber,
		};

		this.serviceCallHelper.call(
			this.stopCardService.searchOptions(clientInfo),
			(options) => {
				console.log('resolved - result', options);
				this.identificationMethodsList = options.identificationMethods;
				if (this.identificationMethodsList != undefined) {
					this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
				}
			});
	}

	extractIdentificationMethods(identificationMethods) {

		identificationMethods.possibleValues = identificationMethods.possibleValues.map(identificationMethod => {

			Object.assign(identificationMethod, identificationMethod["value"]);
			delete identificationMethod.value;
			return identificationMethod;
		});
		return identificationMethods;
	}

	validateFields() {
		let isRequiredFieldsEmpty = this.isRequiredFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBanner_Message = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			return false;
		}

		let REGEX_PATTERN = REGEX_PATTERNS[this.identificationMethods.value].PATTERN;
		let ERR_MESSAGE = REGEX_PATTERNS[this.identificationMethods.value].ERR_MESSAGE;

		if (!RegExp(REGEX_PATTERN, 'g').test(this.searchFieldText)) {
			this.errMessage.searchFieldText = ERR_MESSAGE;
			this.alertBanner_Message = ERROR_MESSAGES[this.identificationMethods.value];
			return false;
		}

		return true;
	}

	isRequiredFieldsEmpty() {

		this.errMessage.searchFieldText = isNullorEmpty(this.searchFieldText) ? "This is a Required field" : "";
		this.errMessage.identificationMethods = isNullorEmpty(this.identificationMethods.value) ? "Choose an Identification Method" : "";

		return this.errMessage.identificationMethods || this.errMessage.searchFieldText;
	}

	clearErrors() {
		this.errMessage.searchFieldText = "";
		this.errMessage.identificationMethods = "";
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
			if (exception.status === 204 || exception.status === 412 || exception.status === 400) {
				this.alertBanner_Message = ERROR_MESSAGES[this.identificationMethods.value];
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

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.main{
					width: 690px;
					height: 403px;
					border-bottom: 1px solid #E1E1E1;
					border-radius: 4px;
				}
				.call-details-bar{
					display: flex;
					flex-direction: row;
					height:64px;
					margin: 0px;
					border-bottom: 1px solid #dfdfdf;
				}
				.call-label{
					width:208px;
					margin-left:24px;
					margin-top:8px;
					margin-bottom:8px;
				}
				.ivr-option{
					width: 228px;
				}
				.left-border{
					border-left: 1px solid #dfdfdf;
				}
				#label-ivr{
					color: #003652;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 27px;
					width: 100%;
					margin-top: 8px;
				}
				.search-box{
					height: 310px;
					padding: 16px 24px 0px 24px;
				}
				.search-label{
					height: 27px;
					width: 170px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #003652;
					line-height: 27px;
					margin: 0px;
				}
				.id-options{
					text-align: justify;
					line-height: 12px	
				}
				.search-fields{
					margin-top: 26px;
				}
				.search-field-row{
					height: 72px;
					margin-top: 8px;
				}
				capitec-alert-banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-unsuccessful-red-background-color: rgba(200,59,55,0.15);
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					
					margin: 20px 0px 0px 0px;
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
					
				}
				.override-margin-top{
					margin-top: 16px;
				}
				capitec-modal {
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 7.5px 24px 7.5px 0px;
				}`
		];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`
					<capitec-modal type="free" header="Search Client Details" header-align="left" >
						<div slot="body" class="main">
							${this.renderCallInformation()}
							${this.renderSearchClientDetails()}
							${this.renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this.renderFooter()}
						</div>
					</capitec-modal>`;
			case RENDER_MODE.END_CALL:
				return html`${this.renderEndCallModal()}`;
			case RENDER_MODE.INSURE_SEARCH_CALLER:
				return html`${this.renderInsureSearchModal()}`;
		}
	}

	renderLoadingIndicator() {
		if (!this.isBusy)
			return html``;
		else
			return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}

	renderCallInformation() {
		return html`
			<div class="call-details-bar">
				<horizon-label 
					class="call-label"
					label="Reference Number" 
					value = "${this.voiceReferenceNumber.value}"
					tabindex="${getTabIndex(this.voiceReferenceNumber)}"
					?hidden=${isHidden(this.voiceReferenceNumber)}>
				</horizon-label>
				<div class="ivr-option left-border">
					<horizon-select
						id="label-ivr"
						label="IVR Option Selected"
						display-field="value"
						.items="${this.ivrOption.possibleValues}"
						.value="${this.ivrOption.possibleValues[0].value}"
						tabindex="${getTabIndex(this.ivrOption)}"
						?hidden=${isHidden(this.ivrOption)}
						@value-changed="${(e) => this._ivrOptionChanged(e)}">
					</horizon-select>
				</div>
				<div class="left-border">
					<horizon-label
						class="call-label"
						label="Incoming Number"
						value="${this.incomingTelephoneNumber.value}"
						tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
						?hidden=${isHidden(this.incomingTelephoneNumber)}>
					</horizon-label>
				<div>
			</div>`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box class="search-box">
			<capitec-label class="search-label" label="Search existing client"></capitec-label>
			${this.renderAlertBanner()}
			<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" 
						   class="search-fields ${this.alertBanner_Message ? `override-margin-top` : ``}">
				<div class="search-field-row">
					<capitec-select	id="identificationMethods"
									error="${this.errMessage.identificationMethods}" 
									label="Choose identification method" 
									class="id-options"
									.items="${this.identificationMethods != undefined ? this.identificationMethods.possibleValues : [{ displayText: "ID Number" }]}"
									@value-changed="${(e) => this._valueChanged(e)}"
									tabindex="${getTabIndex(this.identificationMethods)}"
									?hidden=${isHidden(this.identificationMethods)}
									display-field="displayText">
					</capitec-select>
				</div>
				<div class="search-field-row">
					<capitec-text-field id="searchFieldText" 
										type="search"
										keyboardMode ="numeric" 
										label="Search" 
										error="${this.errMessage.searchFieldText}" 
										focussed="true" 
										hint="" 
										@key-input="${(e) => this._onKeyPress(e)}"
										@value-changed="${(e) => this._valueChanged(e)}" 
										value="">
					</capitec-text-field>
				</div>
			</capitec-group>
		</capitec-content-box>`;
	}

	renderAlertBanner() {

		if (!isNullorEmpty(this.alertBanner_Message)) {
			return html`
				<capitec-alert-banner type="error" label="${this.alertBanner_Message}" closable></capitec-alert-banner>
			`;
		}
		return html``;
	}

	renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button type="clear"
								label="End Call Session"
								@click="${(e) => this.renderMode = RENDER_MODE.END_CALL}">
				</capitec-button>
				<capitec-button type="primary"
								@click="${(e) => this._onSearchClick(e)}"
								label="Search Client">
				</capitec-button>
			</capitec-group>`;
	}

	renderEndCallModal() {
		return html`
			<end-call-session
				@on-cancel="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}"
				@on-reason-set="${(reason) => this.onCallCancelled(reason)}">
			</end-call-session>`;
	}

	renderInsureSearchModal() {
		return html`<horizon-insure-search-client></horizon-insure-search-client>`;
	}
}


window.customElements.define(`horizon-search-client`, SearchClientDetailsComponent);