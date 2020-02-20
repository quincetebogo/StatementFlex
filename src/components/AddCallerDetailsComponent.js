import { View, html, css } from 'platform/elements';
import { StopCardService } from '../services/StopCardService';

export class AddCallerDetailsComponent extends View {

	constructor() {
		super();

		this.userDetails = {
			incomingNumber: "082 555 9090",
			voiceReference: "34562783",
			ivrOption: [
				{ id: 'IVR', text: 'Stop Card' }
			],
			incidentNo: "",
			agentPhoneNumber: "",
			Name: "",
			Surname: "",
			Cellphone: "",
			nonClientIDNumber: "",
			Relationship: [
				{ id: 'SP', text: 'Spouse' },
				{ id: 'SI', text: 'Sibling' },
				{ id: 'CH', text: 'Child' },
				{ id: 'FR', text: 'Friend' },
				{ id: 'OT', text: 'Other' }
			]
		};

		this.errorMessage = {
			errName: "",
			errSurname: ""
		};
	}

	static get properties() {
		return {
			referenceNumber: { type: String },
			incomingNumber: { type: String },
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.call-waiting{
				width: 1067.8px;
				height: 770px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: center;
				background-color: white;
				border-radius: none;
			}

			.needimage{
				height: 120px;
				width: 170px;
				margin: 24px 24px 18px 24px;
			}

			#waiting-text{
				color: #003652;
			}

			.userwaiting{
				display: grid;
				grid-template-rows: 1fr 1fr 1fr;
				text-align: center;
				width: 1067.8px;
				height: 770px;
			}

			.buttonalign{
				text-align: left;
			}

			.grid-container{
				grid-row-gap: 0px;
				grid-column-gap: 0px;
				width:678px;
				margin:0px;
				padding:0px;
			}

			.populatedText{
				padding: 8px;
				height: 64px;
				width: 678px;
				border-bottom: 1px solid #dfdfdf;
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
				height: 64px;
				margin: 0px;
				padding: 0px;
				border-top: : 1px solid #dfdfdf;
			}

			#label-text{
				height: 30px;	width: 123px;	
				color: #003652;	
				font-family: "Hind Vadodara";	
				font-size: 18px;	
				font-weight: 600;
				line-height: 30px;
			}

			#label-value{
				color: #003652;
				font-family: "Hind Vadodara";
				font-size: 20px;
				font-weight: 600;
				line-height: 30px;
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

			`];

	}

	render() {
		return html`
			<capitec-modal type="free" header="Confirm Caller Details" header-align="left" >
				<div slot="body">
					${this.renderCallInformation()}
					${this.renderAddCallerDetails()}
				</div>
				${this.renderFooter()}
			</capitec-modal>
		`;
	}

	renderCallInformation() {
		return html`
			<capitec-group layout="grid" class="grid-container"> 
				<capitec-action-bar class="populatedText">
					<div class="horizon-call"> 
						<div class="ref-call">
							<capitec-label label="Reference Number"></capitec-label>	
							<capitec-label id="label-value" label="${this.userDetails.voiceReference}"></capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select id="label-value" label="IVR Option Selected" .items="${this.userDetails.ivrOption}" display-field="text">
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

	renderAddCallerDetails() {
		return html`
		<capitec-content-box style="width:98%;">
			<div>
				<capitec-text-field label="Name" id="Name" error="${this.errorMessage.errName}" @value-changed="${(e) => this._valueChanged(e)}"></capitec-text-field>
			</div>
			<div>
				<capitec-text-field label="Surname" id="Surname" error="${this.errorMessage.errSurname}" @value-changed="${(e) => this._valueChanged(e)}"></capitec-text-field>
			</div>
			<div>
				<capitec-text-field type="number" id="Cellphone" label="Cellphone Number" @value-changed="${(e) => this._valueChanged(e)}"></capitec-text-field><br>
			</div>
			<div style="margin:-20px 0px 0px 0px;">
				<capitec-select id="Relationship" label="Choose relationship type (Optional)" .items="${this.userDetails.Relationship}" display-field="text" @value-changed="${(e) => this._valueChanged(e)}"></capitec-select>
			</div>
		</capitec-content-box>
		`;
	}

	renderFooter() {
		return html`
			<capitec-action-bar slot="footer" class="footer-bar">
				<capitec-button id="id-search-client-button" type="clear" label="Back"></capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button type="clear" label="End Call Session" ></capitec-button>
				<capitec-button id="id-confirm-button" type="primary" label="Confirm" @click="${(e) => this.validateData(e)}""></capitec-button>
			</capitec-action-bar>
		`;
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
		if (this.userDetails.Name == "") {
			this.errorMessage.errName = "Required Field";
			console.log(this.errorMessage.errName);
		}
		else if (this.userDetails.Surname == "") {
			this.errorMessage.errSurname = "Required Field";
			console.log(this.errorMessage.errSurname);
		}
		else {
			StopCardService.getInstance().identifyCaller(this.userDetails);
		}
	}

}

window.customElements.define(`client-add-caller`, AddCallerDetailsComponent);