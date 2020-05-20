/*
 *		Horizon Search Client Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';

import { StopCardService } from '../../services/StopCardService';
import { ServiceCallHelper } from '../../utils/serviceCallHelper';
import { isDisabled, isHidden, getTabIndex, isNullorEmpty } from '../../utils/channelServiceUtilities';

import '../dialogs/ConfirmCallerDetails';
import '../../components/Common/HorizonSelect';

const RENDER_MODE = {
	SEARCH_CALLER: 0,
	END_CALL: 1,
};


export class SearchClientDetailsComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

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
		this.requiredFieldsEmpty = false;
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
			requiredFieldsEmpty: { type: Boolean }
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
		if (e.detail.new != "") {
			this.errMessage[e.currentTarget.id] = "";
		}
		this.requestUpdate();
	}

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this[e.currentTarget.id].value = e.detail.new.key;
		}
		else {
			this[e.currentTarget.id] = e.detail.new;
		}
		this.errMessage[e.currentTarget.id] = "";
		this.requestUpdate();
	}

	async _onSearchClick(e) {
		if (!this.validateData()) {
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

			let identifiedClient = await this.serviceCallHelper.asyncCall(this.stopCardService.searchCaller(searchClient));
			if (identifiedClient) {
				identifiedClient.incidentReferenceNumber = searchClient.incidentNo;
				identifiedClient.agentTelephoneNumber = searchClient.agentTelephoneNumber;
				this.raiseBackEvent(identifiedClient)
			}
			else {
				// TODO: handle not found - we don't deal with this at all at present
			}
		}
		else {
			console.log("Validation failed");
			this.requestUpdate();
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

	validateData() {
		if (!this.searchFieldText) {
			this.errMessage.searchFieldText = "This is a Required field";
		}
		switch (this.identificationMethods.value) {
			case 0:
				if (RegExp('[a-zA-Z]', 'g').test(this.searchFieldText) == true || this.searchFieldText.length != 13) {
					this.errMessage.searchFieldText = "ID Number must be 13 characters long";
				}
				break;
			case 1:
				break;
			case 2:
				if (RegExp('[a-zA-Z]', 'g').test(this.searchFieldText) == true || this.searchFieldText.length != 10) {
					this.errMessage.searchFieldText = "Account number must be 10 characters long";
				}
				break;
			case 3:
				if (RegExp('[a-zA-Z]', 'g').test(this.searchFieldText) == true || this.searchFieldText.length != 8) {
					this.errMessage.searchFieldText = "Either it is Alphanumeric or not equal to 8 digits";
				}
				break;
			case 4:
				if (RegExp('[a-zA-Z]', 'g').test(this.searchFieldText) == true || this.searchFieldText.length != 10) {
					this.errMessage.searchFieldText = "Cellphone Number must be 10 characters long";
				}
				break;
			default:
				this.errMessage.identificationMethods = "Choose an Identification Method";
				break;
		}
		this.requiredFieldsEmpty = isNullorEmpty(this.searchFieldText) || isNullorEmpty(this.identificationMethods.value);
		return this.errMessage.identificationMethods || this.errMessage.searchFieldText;
	}

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
						   class="search-fields ${this.requiredFieldsEmpty ? `override-margin-top` : ``}">
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
		if (this.requiredFieldsEmpty) {
			return html`
				<capitec-alert-banner type="error" label="All fields are required" closable></capitec-alert-banner>
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
}


window.customElements.define(`horizon-search-client`, SearchClientDetailsComponent);