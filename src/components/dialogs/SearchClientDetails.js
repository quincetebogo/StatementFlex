import { Component, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';
import StopcardHelper from '../../helpers/StopCardHelper';
import { EventAggregator } from 'platform/EventAggregator';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';

export class SearchClientDetailsComponent extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		RegExp();
		this.eventAggregator = EventAggregator.getInstance();

		this.isBusy = false;
		this.errMessage = {
			identificationMethods: "",
			searchFieldText: ""
		}

		this.unverifiedCaller = null;
		this.stopCardService = StopCardService.getInstance();
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			errMessage: { type: Object },
			unverifiedCaller: { type: Object }
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

		this.searchFieldText = null;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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

			let callerDetails = {
				incomingNumber: this.unverifiedCaller.incomingTelephoneNumber.value,
				voiceReference: this.unverifiedCaller.voiceReferenceNumber.value,
				incidentNo: this.unverifiedCaller.incidentReferenceNumber,
				agentPhoneNumber: this.unverifiedCaller.agentTelephoneNumber,
				ivrOptionSelected: 'StopCard',
				identificationMethod: this.identificationMethods.value,
				searchValue: this.searchFieldText
			}

			this.isBusy = true;

			let searchResponse = await StopCardService.getInstance().searchCaller(callerDetails);

			callerDetails.callerFullName = searchResponse.callerInformation.name.value;
			callerDetails.verifiedTelephoneNumber = searchResponse.callerInformation.verifiedTelephoneNumber.value;
			callerDetails.southAfricanIDNumber = searchResponse.callerInformation.southAfricanIDNumber.value;
			callerDetails.relationship = "Sister";

			let identifyCallerPromise = StopcardHelper.getInstance().identifyCaller(callerDetails);

			identifyCallerPromise.then((response) => {

				this.eventAggregator.publish('confirmed-caller', { detail: { confirmedCaller: response } });
				this.isBusy = false;
			}, (error) => {

				console.log('Error in fetching Client Info.');
				this.isBusy = false;
			});
		}
		else {
			console.log("Validation failed");
			this.requestUpdate();
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
			css`
			
			`];

	}

	render() {
		return html`
		${this.renderLoadingIndicator()}
			<capitec-modal type="free" header="Search Client Details" header-align="left" >
				<div slot="body">
					${this.renderCallInformation()}
					${this.renderSearchClientDetails()}
				</div>
				${this.renderFooter()}
			</capitec-modal>`;
	}

	renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}
		else
			return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	renderCallInformation() {
		return html`
		<capitec-action-bar>
			<capitec-group layout="horizontal" gap="line" halign="left" valign="top">
				<div>
					<capitec-group layout="horizontal" gap="clear">
						<div>
							<b>Reference Number</b>
							<capitec-label label="${this.voiceReferenceNumber.value}"
											tabindex="${getTabIndex(this.voiceReferenceNumber)}"
											?hidden=${isHidden(this.voiceReferenceNumber)}>
							</capitec-label>
						</div>
						<capitec-spacer></capitec-spacer>
						<capitec-spacer></capitec-spacer>
						<capitec-spacer></capitec-spacer>
					</capitec-group>
				</div>
				<div>
					<capitec-select label="IVR Option Selected" 
									.value="${this.ivrOption.value}"
									.items="${this.ivrOption.possibleValues}" 
									display-field="value"
									tabindex="${getTabIndex(this.ivrOption)}"
									?hidden=${isHidden(this.ivrOption)}>
					</capitec-select>
				</div>
				<div>
					<capitec-group layout="horizontal" gap="clear">
						<div>
							<b>Incoming Number</b>
							<capitec-label label="${this.isUnverifiedNumber ? 'Private Number' : this.incomingTelephoneNumber.value}"
											tabindex="${getTabIndex(this.incomingTelephoneNumber)}"
											?hidden=${isHidden(this.incomingTelephoneNumber)}>
							</capitec-label>
						</div>
						<capitec-spacer></capitec-spacer>
						<capitec-spacer></capitec-spacer>
						<capitec-spacer></capitec-spacer>
					</capitec-group>
				</div>
			</capitec-group>
		</capitec-action-bar>`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box>
			<div>
				<b>Search existing client</b>
			</div>
			<capitec-spacer></capitec-spacer>
			<div>
				<capitec-select	id="identificationMethods"
								error="${this.errMessage.identificationMethods}" 
								label="Choose identification method" 
								style="text-align:justify;line-height:normal;"
								.items="${this.identificationMethods != undefined ? this.identificationMethods.possibleValues : [{ displayText: "ID Number" }]}"
								@value-changed="${(e) => this._valueChanged(e)}"
								tabindex="${getTabIndex(this.identificationMethods)}"
								?hidden=${isHidden(this.identificationMethods)}
								display-field="displayText">
				</capitec-select>
			</div>
			<capitec-spacer></capitec-spacer>
			<div>
				<capitec-search-field id="searchFieldText"
									  keyboardMode ="" label="Search" 
									  error="${this.errMessage.searchFieldText}" 
									  focussed="true" 
									  hint="" 
									  @value-changed="${(e) => this._valueChanged(e)}" 
									  value="">
				</capitec-search-field>
			</div>
			<capitec-spacer></capitec-spacer>
			<capitec-spacer></capitec-spacer>
			<capitec-spacer></capitec-spacer>
		</capitec-content-box>
		`;
	}

	renderFooter() {
		return html`
		<capitec-action-bar slot="footer">
			<capitec-spacer></capitec-spacer>
			<capitec-button type="clear" label="End Call Session" 
							?hidden=${isHidden(this.endCallSessionButton)}
							.disabled="${isDisabled(this.endCallSessionButton)}"
							tabindex="${getTabIndex(this.endCallSessionButton)}">
			</capitec-button>
			<capitec-button type="primary" 
							@click="${(e) => this._onSearchClick(e)}" 
							label="Search Client">
			</capitec-button>
		</capitec-action-bar>
		`;
	}
}


window.customElements.define(`horizon-search-client`, SearchClientDetailsComponent);