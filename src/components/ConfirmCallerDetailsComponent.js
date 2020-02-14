import { View, html, css } from 'platform/elements';
import 'platform/components/popups/Modal';
import 'platform/components/data/Table';
import '../components/HorizonSpacer';

class ConfirmCallerDetailsComponent extends View {

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

				capitec-card{
					width: 750px;
					height: 530px;
				}
				.grid-container{
					grid-row-gap: 0px;
				}
				.populatedText{
					padding: 8px;
					width: 752px;
					height: 62px;	
					border-bottom: 1px solid #dfdfdf;
				}
				.horizon-call{
					//display: dock;
					grid-template-columns: 1fr 1fr 1fr;
					grid-gap: 0px 0px;+
					// grid-template-columns: repeat(auto-fill, minmax(300px, 1fr) );
				
					margin: 0px;
					width: 730px;
				}	
				.ref-call{
					text-align:left;
					padding: 8px 8px 8px 24px;
				}
				.incoming-call{
					text-align:left;
					width: 246.667px;
					height: 66px; 
					border-left: 1px solid #dfdfdf;
					padding: 8px;
				}
				.client-avatar{
					display: absolute;
					grid-template-columns: 0.5fr 1fr ;
					height: 240px; 
				}
				.client-info{
					display: grid;
					grid-template-columns: 1fr 1fr;
					grid-template-rows: 1fr 1fr 1fr 1fr;
					text-align: left;
					height: 240px; 
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
					width: 720px;
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
					padding: 18px 0px 18px 0px;
				}
				#action-display{
					margin: 5px 0px 0px 0px;
					color: #08A6B5;
					font-family: "Hind Vadodara";	
					font-weight: 600;
					align: center;
					padding: 18px 18px 18px 0px;
				}
				.footer{
					width: 742px;
				}
				u{
					color: #08A6B5;
				}
			`];
	}

	render() {
		return html`
			<capitec-card>
				<capitec-modal type="free" header="Confirm Caller Details" header-align="left" >
  					<div slot="body">
						 <capitec-group layout="grid" class="grid-container"> 
							  <capitec-action-bar class="populatedText">

					 		<capitec-group class="horizon-call" layout="grid"> 
					 				 <div class="ref-call">
										<capitec-label label="Reference Number"></capitec-label>	
										<capitec-label id="label-value" label="${this.referenceNumber}"> </capitec-label>
									  </div>
									  <div class="incoming-call">
										<capitec-select  id="label-value"
 										label="IVR Option Selected" .items="${this.selectDataObjects}" display-field="text">
										</capitec-select>
									  </div>
									  <div class="incoming-call">
									  <capitec-label label="Incoming Number"></capitec-label>
										<capitec-label  id="label-value" label="${this.incomingNumber}"></capitec-label>
									  </div>
							 	</capitec-group>
									</capitec-action-bar>

									<capitec-action-bar id="action-bar">
										<capitec-icon id="action-icon" type="info"></capitec-icon> &nbsp;
										<u>	<capitec-label id="action-label" label="Add Caller Details"></capitec-label> </u>
										<p id="action-display">&nbsp;if the caller is calling on another client's behalf</p>
									</capitec-action-bar>  	

							
								  	
							<capitec-group class="client-avatar" layout="grid">
							
  								<capitec-avatar class="image" shape="none" value=""></capitec-avatar>	
									

								<capitec-group class="client-info" layout="grid">
									
									<div>
									<capitec-label class="fullname" id="label-value" label="${this.fullName}"></capitec-label>
									</div>
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
								  </capitec-group>
								</capitec-group>
						</capitec-group>
  					</div>
		

		<div slot="footer">
				<capitec-button-bar slot="footer" class="bottom">
					<capitec-button type="clear" label="Search Client" @click="${this.onDoneClick}"></capitec-button>

					<horizon-modal-spacer></horizon-modal-spacer>
		
					 <capitec-button  type="clear" label="End Call Session" @click="${this.onDoneClick}"></capitec-button>
  					<capitec-button type="primary" label="Confirm" @click="${this.onDoneClick}"></capitec-button>
				</capitec-button-bar>
		</div>
			</capitec-modal>
		</capitec-card>
		`;
	}

}
window.customElements.define(`confirm-caller-component`, ConfirmCallerDetailsComponent)