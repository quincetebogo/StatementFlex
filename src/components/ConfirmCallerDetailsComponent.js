import { Component, html, css } from 'platform/elements';
import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import 'platform/components/layouts/Spacer';

class ConfirmCallerDetailsComponent extends Component {

	constructor() {
		super();

		this.incomingNumber = "082 555 9090";
		this.referenceNumber = "34562783";

		this.selectObject = { id: 'IVR', text: 'Stop Card' };

		this.selectDataObjects = [
			this.selectObject,
			{ id: 'CR', text: 'Credit Enquiry' },
			{ id: 'PR', text: 'Product Enquiry' },
			{ id: 'SR', text: 'Savings Account' },
			{ id: 'IR', text: 'Internet or Cellphone Banking' }
		];

		this.fullName = "Mr I. Makatini";
		this.idNumber = "8807120371081";
		this.livesIn = "Somerset West";
		this.birthday = "12 July";
		this.verifiedCellphone = "082 555 9090";
		this.language = "English";
	}

	static get properties() {
		return {
			userDetails: { type: Object },
			referenceNumber: { type: String },
			ivrOption: { type: String },
			incomingNumber: { type: String },

			fullName: { type: String },
			idNumber: { type: String },
			livesIn: { type: String },
			birthday: { type: String },
			verifiedCellphone: { type: String },
			language: { type: String }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
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

				.footer-bar{
					width: 678px;
					height: 64px;
					margin: 0px;
					padding: 0px;
					border-top: : 1px solid #dfdfdf;
				}

				.horizon-call{
					display: flex;
					flex-direction: row;
					margin: 0px;					
				}

				.horizon-add-caller-details-div{
					display: flex;					
					flex-direction: row;
					width: 642px;
					height: 56px;
					margin-top: 24px;
					margin-left:auto;
					margin-right:auto;
					background: #DAF5F3;
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

				.client-avatar{
					display: grid;
					grid: 'avatar clientdetails';
					height: 200px; 
					border: 0px 0px 1px 0px;
					margin-top: 24px;
					margin-bottom: 0px;
				}

				.client-info{
					display: grid;
					grid-template-columns: auto auto;
					text-align: left;
					height: 200px;
					width: 400px; 
				}
				.add-caller{
				background-color: #4330;
				}
				
				.image{
					width: 200px;
					height: 200px;
					align: left;
					padding: 0px 0px 0px 24px;
					margin: 0px 0px 0px 24px;
					background: gainsboro;
				}
				.fullname{
					//  width: 200px;
					//  margin: 0px;
					text-align: left;
					padding: 0px 0px 16px 0px ;
					vertical-align: middle;
					//transform: translate(-8.0%);
				}


				#label-value{
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 20px;	
					font-weight: 600;	
					line-height: 30px;
				}
				#label-text{
					height: 30px;	width: 123px;	
					color: #003652;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;
					line-height: 30px;
				}

				#action-bar{
					background: #DAF5F3;
					height: 56px;	
					width: 690px;
					margin: 16px 16px 16px 24px;
					align: center;
				}

				#action-icon{
					margin: 5px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 600;
					align: center;
					padding: 18px 0px 18px 24px;
				}
				#action-label{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 600;
					align: center;
					padding: 18px 0px 18px 48px;
				}

				#action-display{
					margin: 0px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 600;
					align: center;
					padding: 18px 0px 18px 0px;
				}

				#id-confirm-button {
					width: 105px;
				}

				.footer{
					width: 742px;
					margin:0px;
					padding:0px;
					border-top: 1px solid #dfdfdf; 
				}
				u{
					color: #08A6B5;
				}
			`];
	}

	render() {
		return html`
			<capitec-modal type="free" header="Confirm Caller Details" header-align="left" >
  				<div slot="body">
					${this.renderCallInformation()}
					${this.renderAddCallerDetails()}
					${this.renderConfirmedCaller()}
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
							<capitec-label id="label-value" label="${this.referenceNumber}"> </capitec-label>
						</div>
						<div class="ivr-option">
							<capitec-select  id="label-value" label="IVR Option Selected" .items="${this.selectDataObjects}" display-field="text">
							</capitec-select>
						</div>
						<div class="incoming-call">
							<capitec-label label="Incoming Number"></capitec-label>
							<capitec-label  id="label-value" label="${this.incomingNumber}"></capitec-label>
						</div>
					</div>
				</capitec-action-bar>
			</capitec-group>
 		`;
	}

	renderAddCallerDetails() {
		return html`
		<div class="horizon-add-caller-details-div">					
		<u><capitec-label id="action-label" label="Add Caller Details"></capitec-label></u>
		<p id="action-display">&nbsp;if the caller is calling on another client's behalf</p>
		</div>
		`;
	}

	renderConfirmedCaller() {
		return html`
		<div class="client-avatar">
			<capitec-avatar class="image" shape="none" value=""></capitec-avatar>										 
			<div class="client-info">
				<capitec-label class="fullname" id="label-value" label="${this.fullName}"></capitec-label>
				<div></div>

				<div>
					<capitec-label label="ID Number"></capitec-label>
					<capitec-label  id="label-text" label="${this.idNumber}"></capitec-label>
				</div>
				<div>
	  				<capitec-label label="Verified Cellphone Numbre"></capitec-label>
	  				<capitec-label  id="label-text" label="${this.verifiedCellphone}"></capitec-label>
  				</div>

				<div>
	  				<capitec-label label="Lives In"></capitec-label>
	  				<capitec-label  id="label-text" label="${this.livesIn}"></capitec-label>
  				</div>
				<div>
	  				<capitec-label label="Language Preference"></capitec-label>		
	  				<capitec-label  id="label-text" label="${this.language}"></capitec-label>		
  				</div>	

				<div>
	  				<capitec-label label="Birthday"></capitec-label>	
	  				<capitec-label  id="label-text" label="${this.birthday}"></capitec-label>	
  				</div>				 
				  <div></div>
	
			</div>
		</div>`;
	}

	renderFooter() {
		return html`
			<capitec-action-bar slot="footer" class="footer-bar">
				<capitec-button id="id-search-client-button" type="clear" label="Search Client" @click="${this.onDoneClick}"></capitec-button>
				<capitec-spacer></capitec-spacer>
				<capitec-button  type="clear" label="End Call Session" @click="${this.onDoneClick}"></capitec-button>
		  		<capitec-button id="id-confirm-button" type="primary" label="Confirm" @click="${this.onDoneClick}"></capitec-button>
			</capitec-action-bar>
		`;
	}
}

window.customElements.define(`confirm-caller-component`, ConfirmCallerDetailsComponent)