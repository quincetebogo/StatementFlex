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
					width: 690px;
					height: 530px;
				}
				.populatedText{
					padding: 8px;
				}
				.horizon-call{
					display: absolute;
					grid-template-columns: 1fr 1fr 1fr;
				}
				.client-avatar{
					display: absolute;
					grid-template-columns: 0.5fr 1fr ;
				}
				.client-info{
					display: grid;
					grid-template-columns: 1fr 1fr;
					grid-template-rows: 1fr 1fr 1fr 1fr;
					text-align: left;
				}
				.client-fullname{
					display:grid;
					grid-template-columns: 2fr;
					grid-template-rows: 1fr;
					text-align: ;
					color: #57595d;
					font: bold 18px/30px Hind Vadodara;
				}
				.incoming-call{
					border-style: solid;
					text-align:left;
				}
				.add-caller{
				background-color: #4330;
				}
				
				.image{
					width: 200px;
					height: 200px;
					align: left;
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
					color: #404040;	
					font-family: "Hind Vadodara";	
					font-size: 18px;	
					font-weight: 600;
					line-height: 30px;
				}
				#action-bar{
					background: #BCF1ED;
					height: 56px;	
					width: 650px;
					margin: 16px 16px 16px 16px;
					align:center;
				}
				p{
					margin: 5px 0px 0px 0px;
				}
			`];
	}

	render() {
		return html`
			<capitec-card>
				<capitec-modal type="free" header="Confirm Caller Details" header-align="left" >
  					<div slot="body">
						 <capitec-group layout="grid"> 
							  <capitec-action-bar class="populatedText">
					 			 <capitec-group class="horizon-call" layout="grid"> 
					 				 <div class="incoming-call">
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
										<capitec-icon type="info"></capitec-icon>
										<u>	<capitec-label label="Add Caller Details"></capitec-label> </u>
										<p>if the caller is calling on another client's behalf</p>
									</capitec-action-bar>
				
					<br>  			
					
							<capitec-group class="client-avatar" layout="grid">
  								<capitec-avatar class="image" shape="square" value="Client"></capitec-avatar>	
									

								<capitec-group class="client-info" layout="grid">
								
									<div>
									<capitec-label  id="label-value" label="${this.fullName}"></capitec-label>
									</div>
								  	
									<div>
										<capitec-label label="ID Number"></capitec-label>
 										<capitec-label  id="label-text" label="${this.idNumber}"></capitec-label>
								 	 </div>

								 	 <div>
								 	 	<capitec-label label="Lives In"></capitec-label>
										 <capitec-label  id="label-text" label="${this.livesIn}"></capitec-label>
								  	</div>

									<div>
									  <capitec-label label="Birthday"></capitec-label>	
									 <capitec-label  id="label-text" label="${this.birthday}"></capitec-label>	
									</div>

									<div>
								 		<capitec-label label="Verified Cellphone Numbre"></capitec-label>
										<capitec-label  id="label-text" label="${this.verifiedCellphone}"></capitec-label>
									</div>
									
									<div>
									<capitec-label label="Language"></capitec-label>		
									 <capitec-label  id="label-text" label="${this.language}"></capitec-label>		
								  </div>						 
								  </capitec-group>
								</capitec-group>
						</capitec-group>
  					</div>
		
				<capitec-button-bar slot="footer">
					<capitec-button type="clear" label="Search Client" @click="${this.onDoneClick}"></capitec-button>

					<horizon-modal-spacer></horizon-modal-spacer>
		
					 <capitec-button  type="clear" label="End Call Session" @click="${this.onDoneClick}"></capitec-button>
  					<capitec-button type="primary" label="Search" @click="${this.onDoneClick}"></capitec-button>
				</capitec-button-bar>
			</capitec-modal>
		</capitec-card>
		`;
	}

}
window.customElements.define(`confirm-caller-component`, ConfirmCallerDetailsComponent)