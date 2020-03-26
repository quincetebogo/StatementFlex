/*
 *		Horizon Search Client Details Dialog
 *
 */
import { Component, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';
import { DialogLayoutStyles } from '../../assets/styles/Dialogs-Layout.css';

import '../dialogs/ConfirmCallerDetails';

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

		this.isBusy = false;
		this.errMessage = {
			identificationMethods: "",
			searchFieldText: ""
		}
		this.unverifiedCaller = null;
		this.stopCardService = StopCardService.getInstance();
		this.renderMode = -1;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			errMessage: { type: Object },
			unverifiedCaller: { type: Object },
			renderMode: { type: Number }
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

			this.isBusy = true;
			try {
				let identifiedClient = await StopCardService.getInstance().searchCaller(searchClient);

				//Adding variables to the response, as searchCaller service doesn't return 
				identifiedClient.incidentReferenceNumber = searchClient.incidentNo;
				identifiedClient.agentTelephoneNumber = searchClient.agentTelephoneNumber;
				this.raiseBackEvent(identifiedClient)

			}
			catch (error) {
				console.log('SearchCaller service Failed');
			}
			finally {
				this.isBusy = false;
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

		this.isBusy = true;
		this.stopCardService.searchOptions(clientInfo)
			.then((options) => {
				console.log('resolved - result', options);
				this.identificationMethodsList = options.identificationMethods;
				if (this.identificationMethodsList != undefined) {
					this.identificationMethods = this.extractIdentificationMethods(this.identificationMethodsList);
				}
			})
			.catch(error => console.log('error', error))
			.finally(() => this.isBusy = false);
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
		return this.errMessage.identificationMethods || this.errMessage.searchFieldText;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			DialogLayoutStyles.styles,
			css`
				.search-box{
					height: 310px;
					padding: 0px 24px 0px 24px;
				}
				.search-label{
					height: 27px;
					width: 170px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #003652;
					line-height: 27px;
				}
				.id-methods{
					padding: 0px 0px 34px 0px;
					margin: 0px;
				}
				.id-options{
					text-align: justify;
					line-height: 12px	
				}
				.search-client{
					padding: 16px 0px 24px 0px;
					margin: 0px;
				}
				.search-field{
					padding: 0px 0px 0px 0px;
					margin: 0px;
				}`
		];
	}

	render() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`${this.renderLoadingIndicator()}
					<capitec-modal type="free" header="Search Client Details" header-align="left" >
						<div slot="body" class="main">
							${this.renderCallInformation()}
							${this.renderSearchClientDetails()}
						</div>
						${this.renderFooter()}
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
		<capitec-group layout = "grid" class="grid-container" >
				<capitec-action-bar class="populatedText" tabindex="-1">
					<div class="horizon-call">
						<div class="ref-call">
							<capitec-label
								id="ref-number"
								label="Reference Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="label-value"
								label="${this.voiceReferenceNumber.value}"
								tabindex="${getTabIndex(this.voiceReferenceNumber)}"
								?hidden=${isHidden(this.voiceReferenceNumber)}>
							</capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select
								id="label-ivr"
								label="ivr option selected"
								display-field="value"
								.items="${this.ivrOption.possibleValues}"
								.value="${this.ivrOption.value}"
								tabindex="${getTabIndex(this.ivrOption)}"
								?hidden=${isHidden(this.ivrOption)}>
							</capitec-select>
						</div>
						<div class="incoming-call">
							<capitec-label
								id="ref-number"
								label="Incoming Number"
								tabindex="-1">
							</capitec-label>
							<capitec-label id="incoming-num"
								label="${this.isUnverifiedNumber ? 'Private Number' : this.incomingTelephoneNumber.value}"
								tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
								?hidden=${isHidden(this.incomingTelephoneNumber)}>
							</capitec-label>
						</div>
					</div >
				</capitec-action-bar >
			</capitec-group >
		`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box class="search-box">
			<div class="search-client">
				<capitec-label class="search-label" label="Search existing client"></capitec-label>
			</div>
			
			<div class="id-methods">
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
			
			<div class="search-field">
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
			
		</capitec-content-box>
		`;
	}

	renderFooter() {
		return html`
		<capitec-action-bar class="footer-bar" slot="footer">
			<capitec-spacer></capitec-spacer>
			<capitec-button type="clear" 
							label="End Call Session"
							@click="${(e) => this.renderMode = RENDER_MODE.END_CALL}" >
			</capitec-button>
			<capitec-button type="primary"
							@click="${(e) => this._onSearchClick(e)}"
							label="Search Client">
			</capitec-button>
		</capitec-action-bar>
		`;
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