import { View, html, css } from 'platform/elements';
import { StopCardService } from '../../services/StopCardService';

export class SearchClientDetailsComponent extends View {

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
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			errMessage: { type: String },
			confirmedCaller: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Short hand references for reaching into the incoming data model
		this.voiceReferenceNumber = this.confirmedCaller.voiceReferenceNumber;
		this.ivrOption = this.confirmedCaller.ivrOption;
		this.incomingTelephoneNumber = this.confirmedCaller.incomingTelephoneNumber;

		// For verified number service will not retrn IDMethods, for now we are explicitly making call to SearchOptions
		this.identificationMethods = this.extractIdentificationMethods(this.confirmedCaller.identificationMethods);
		this.searchFieldText = null;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this[e.currentTarget.id].value = e.detail.new.key;
			this.errMessage[e.currentTarget.id] = "";
		}
		else {
			this[e.currentTarget.id] = e.detail.new;
		}
		this.requestUpdate();
	}

	_onSearchClick(e) {
		if (!this.validateData()) {
			console.log("service call");

			let callerDetails = {
				incomingNumber: this.confirmedCaller.incomingTelephoneNumber.value,
				voiceReference: this.confirmedCaller.voiceReferenceNumber.value,
				incidentNo: this.confirmedCaller.incidentReferenceNumber,
				agentPhoneNumber: this.confirmedCaller.agentTelephoneNumber,
				ivrOptionSelected: 'StopCard',
				identificationMethod: this.identificationMethods.value,
				searchValue: this.searchFieldText
			}

			let SearchResponse = StopCardService.getInstance().searchCaller(callerDetails);
		}
		else {
			console.log("Validation failed");
			this.requestUpdate();
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

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
		return this.errMessage.identificationMethods && this.errMessage.searchFieldText;
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
			<capitec-modal type="free" header="Search Client Details" header-align="left" >
				<div slot="body">
					${this.renderCallInformation()}
					${this.renderSearchClientDetails()}
				</div>
				${this.renderFooter()}
			</capitec-modal>`;
	}

	renderCallInformation() {
		return html`
		<capitec-action-bar>
			<capitec-group layout="horizontal" gap="line" halign="left" valign="top">
				<div>
					<capitec-group layout="horizontal" gap="clear">
						<div>
							<b>Reference Number</b>
							<capitec-label label="${this.voiceReferenceNumber.value}"></capitec-label>
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
									display-field="value">
					</capitec-select>
				</div>
				<div>
					<capitec-group layout="horizontal" gap="clear">
						<div>
							<b>Incoming Number</b>
							<capitec-label label="${this.incomingTelephoneNumber.value}"></capitec-label>
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
								.value="${this.identificationMethods.value}"
								.items="${this.identificationMethods.possibleValues}"
								@value-changed="${(e) => this._valueChanged(e)}"
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
			<capitec-button type="clear" label="End Call Session" ></capitec-button>
			<capitec-button type="primary" 
							@click="${(e) => this._onSearchClick(e)}" 
							label="Search Client">
			</capitec-button>
		</capitec-action-bar>
		`;
	}
}


window.customElements.define(`search_client-details`, SearchClientDetailsComponent);