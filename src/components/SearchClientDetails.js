import { View, html, css } from 'platform/elements';
import { StopCardService } from '../services/StopCardService';

export class SearchClientDetailsComponent extends View {

	constructor() {
		super();
		RegExp();
		this.validationMessage = {
			IdMethodValidation: "",
			searchValidation: ""
		}
		this.userDetails = {
			incomingNumber: "Private Number",
			voiceReference: "34562783",
			ivrOption: [
				{ id: 'SC', text: 'Stop Card' },
				{ id: 'CE', text: 'Credit Enquiry' },
				{ id: 'PE', text: 'Product Enquiry' },
				{ id: 'SA', text: 'Savings Account' },
				{ id: 'CB', text: 'Internet or Cellphone Banking' },
			],
			incidentNo: "",
			agentPhoneNumber: "",
			IdentificationMethod: [
				{ id: 'PN', text: 'ID/Passport number' },
				{ id: 'FN', text: 'Foreign passport number' },
				{ id: 'AN', text: 'Account number' },
				{ id: 'RN', text: 'Reference number' },
				{ id: 'CN', text: 'Verified cellphone Number' }
			],
			SearchFieldText: ""
		};
	}

	static get properties() {
		return {
			referenceNumber: { type: String },
			incomingNumber: { type: String },
			validationMessage: { type: String }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.needimage{
				height: 120px;
				width: 170px;
				margin: 24px 24px 18px 24px;
			}
			.horizon-call{
				display: flex;
				flex-direction: row;
				margin: 0px;
			}
			.ref-call{
				text-align:left;
				padding-left: 24px;
				padding-top: 8px;
				padding-bottom: 8px;
				width:232px;
				height:64px;
				border: 0px;
				margin: 0px;
			}
			.footer-bar{
				width: 678px;
				margin: 0px;
				padding: 10px 0px 0px 0px;
				border-top: 1px solid #dfdfdf;
			}
			#label-value{
				color: #003652;
				font-family: "Hind Vadodara";
				font-size: 20px;
				font-weight: 800;
				line-height: 20px;
			}
			.ivr-option{
				width: 223px;
				height: 64px; 
				text-align:left;
				border: 0px;
				padding: 8px;
				border-left: 1px solid #dfdfdf;
				border-right: 0px;
				border-top: 0px;
				border-bottom: 0px;
				margin: 0px;
			}
			.incoming-call{
				width:232px;
				height:64px;
				text-align:left;
				padding-left: 24px;
				padding-top: 8px;
				padding-bottom: 8px;
				border-left: 1px solid #dfdfdf;
				border-right: 0px;
				border-top: 0px;
				border-bottom: 0px;
				margin: 0px;
			}
			.searchBox{
				width:98%;
				height:360px
			}
			.searchLable{
				text-align:left;
				font-size:20px;
				font-weight:1000;
				height:20px
			}
			.idMethodSelectBox{
				margin:20px 0px 0px 0px;
			}
			.searchFieldBox{
				margin:40px 0px 0px 0px;
			}
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
			</capitec-modal>
		`;
	}

	renderCallInformation() {
		return html`
		<capitec-group layout="grid"> 
		<capitec-action-bar>
			<div class="horizon-call"> 
				<div class="ref-call">
					<capitec-label label="Reference Number"></capitec-label>	
					<capitec-label id="label-value" label="${this.userDetails.voiceReference}"></capitec-label>
				</div>
				<div class="ivr-option">
					<capitec-select id="label-value" label="IVR Option Selected" style="height:100px;" .items="${this.userDetails.ivrOption}"  @value-changed="${(e) => this._valueChanged(e)}" display-field="text">
					</capitec-select>
				</div>
				<div class="incoming-call">
					<capitec-label label="Incoming Number"></capitec-label>
					<capitec-label id="label-value" label="${this.userDetails.incomingNumber}"></capitec-label>
				</div>
			</div>
		</capitec-action-bar>
	</capitec-group>
		`;
	}

	renderSearchClientDetails() {
		return html`
		<capitec-content-box class="searchBox">
			<div class="searchLable">
				Search existing client
			</div>
			<div class="idMethodSelectBox">
				<capitec-select id="IdentificationMethod" error="${this.validationMessage.IdMethodValidation}" label="Choose identification method" style="text-align:justify;line-height:normal;" .items="${this.userDetails.IdentificationMethod}" display-field="text" @value-changed="${(e) => this._valueChanged(e)}"></capitec-select>
			</div>
			<div class="searchFieldBox">
				<capitec-search-field id="SearchFieldText" keyboardMode ="" label="Search" error="${this.validationMessage.searchValidation}" focussed="true" hint=""  @value-changed="${(e) => this._valueChanged(e)}" @key-input="${(event) => this._onKeyBoardValue(event)}" value=""></capitec-search-field>
			</div>
		</capitec-content-box>
		`;
	}

	renderFooter() {
		return html`
		<capitec-action-bar slot="footer" class="footer-bar">
			<capitec-spacer></capitec-spacer>
			<capitec-button type="clear" label="End Call Session" ></capitec-button>
			<capitec-button type="primary" @click="${(e) => this.validateData(e)}" label="Search Client"></capitec-button>
		</capitec-action-bar>
		`;
	}

	_onKeyBoardValue(event) {
		this.validationMessage.searchValidation = "";
	}

	_valueChanged(e) {
		if (typeof e.detail.new == "object") {
			this.userDetails[e.currentTarget.id] = e.detail.new.text;
		}
		else {
			this.userDetails[e.currentTarget.id] = e.detail.new;
		}
		console.log(this.userDetails[e.currentTarget.id]);
	}

	validateData(e) {
		debugger;
		if (this.userDetails.SearchFieldText == "") {
			this.validationMessage.searchValidation = "This is a Required field";
		}
		switch (this.userDetails.IdentificationMethod) {
			case 'ID/Passport number':
				if (RegExp('[a-zA-Z]', 'g').test(this.userDetails.SearchFieldText) == true || this.userDetails.SearchFieldText.length != 13) {
					this.validationMessage.searchValidation = "ID Number must be 13 characters long";
				}
				break;
			case 'Foreign passport number':
				break;
			case 'Account number':
				if (RegExp('[a-zA-Z]', 'g').test(this.userDetails.SearchFieldText) == true || this.userDetails.SearchFieldText.length != 10) {
					this.validationMessage.searchValidation = "Account number must be 10 characters long";
				}
				break;
			case 'Reference number':
				if (RegExp('[a-zA-Z]', 'g').test(this.userDetails.SearchFieldText) == true || this.userDetails.SearchFieldText.length != 8) {
					this.validationMessage.searchValidation = "Either it is Alphanumeric or not equal to 8 digits";
				}
				break;
			case 'Verified cellphone Number':
				if (RegExp('[a-zA-Z]', 'g').test(this.userDetails.SearchFieldText) == true || this.userDetails.SearchFieldText.length != 10) {
					this.validationMessage.searchValidation = "Cellphone Number must be 10 characters long";
				}
				break;
			default:
				this.validationMessage.IdMethodValidation = "Choose an Identification Method";
				break;
		}
		console.log('searchvalidation');
		this.requestUpdate();
		if (this.validationMessage.IdMethodValidation == "" && this.validationMessage.searchValidation == "") {
			console.log('serviceCall');
			StopCardService.getInstance().searchClientDetails(this.userDetails);
		}

	}

}


window.customElements.define(`search_client-details`, SearchClientDetailsComponent);