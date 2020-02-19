import { View, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import '../../components/Common/HorizonProductTile';

export class ClientProfileDetails extends View {

	constructor() {
		super();

		this.userDetails = {
			name: "Mr I. Makatini",
			IDNumber: "88071230371081",
			VerifiedNumber: "082 555 9090",
			LivesIn: "Somerset west",
			LanguagePreference: "English",
			Birthday: "12th July 1988",
		};
		this.router = Router.getInstance();
	}

	static get properties() {
		return {
			userDetails: { type: Object }
		}
	}

	static get styles() {
		return [
			super.styles,
			css`
			.wrapper{
					flex-grow: 1;
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: center;
					align-items: stretch;
			}
			.view-button{
				height:70px;
				width:200px;
				padding: 0px 10px 0px 0px;
			}
			.document-button{
				height:70px;
				width:200px;
				padding: 0px 0px 0px 10px;
			}
			.view-Document-box{
				height:50px;
				width:150px;
				padding: 0px 0px 0px 0px;
			}
			.alert-tag{
				text-decoration:underline;
				color:#E47C28;
			}
			.client-details-group{
				height:220px;
			}
			.client-details-box{
				width:280px;
			}
			.client-img{
				padding: 50px 50px 50px 50px;
			}
			.left-card {
				width: 440px;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}

			.hello-card {
				width: 440px;
				height: 370px;
			}
			.products{
				padding: 0px 0px 8px 0px;
				background-color: gainsboro;
			}
            horizon-product-tile{
                padding: 10px 0px 0px 8px;
                width: 98%;
			}
			b{
				font: bold 20px/30px Hind Vadodara;
				color: #003652;
			}
			
			`];
	}

	renderClientDetails() {
		return html`
			<capitec-card class="hello-card">
				<capitec-group class="client-details-group" layout="horizontal" gap="clear" halign="none" valign="center">
					<capitec-content-box class="client-details-box">
						<div class="client-img">
							<capitec-icon size="large" icon="system/client-insights-error"></capitec-icon>
						</div>
					</capitec-content-box>
										
					<capitec-content-box>
						<p>
							<b>${this.userDetails.name}</b>
							<br>
							ID Number:${this.userDetails.IDNumber}
							<br>
							Verified Number:${this.userDetails.VerifiedNumber}
							<br>
							Lives In:${this.userDetails.LivesIn}
							<br>
							Language Preference:${this.userDetails.LanguagePreference}
							<br>
							Birthday:${this.userDetails.Birthday}
						</p>
					</capitec-content-box>
				</capitec-group>

				<div class="wrapper">
					<capitec-button class="view-button">
						<capitec-content-box class="view-Document-box" layout="vertical" halign="center" valign="top" gap="clear">
					 		<capitec-icon size="small" icon="system/profile"></capitec-icon>
							<capitec-label label="View profile"></capitec-label>
						</capitec-content-box> 
					</capitec-button>

					<capitec-button class="document-button">
						<capitec-content-box class="view-Document-box" layout="vertical" halign="center" valign="top" gap="clear">
							<capitec-icon size="small" icon="system/documents"></capitec-icon>
							<capitec-label label="document"></capitec-label>
						</capitec-content-box> 
					</capitec-button>
				</div>
				<capitec-alert-banner type="warning">
					<span>
						 <a class="alert-tag" href="">Not Authorised</a>
					 </span>
				</capitec-alert-banner>
			</capitec-card>	
			`;
	}

	renderProductDetails() {
		return html`
			<capitec-card class="products">
				<horizon-product-tile type="transact" 
								label="Savings Account" 
								subtitle="Know what you get, know what you pay"
								icon="product/transact-white"
								@click="${() => this.router.navigateByPath(`/product/savings-account`)}">
				</horizon-product-tile>
				<horizon-product-tile type="save" 
								label="Savings Plan"
								subtitle="Let your money make money"
								icon="product/save-white"
								@click="${() => this.router.navigateByPath(`/product/savings-plan`)}">
				</horizon-product-tile>
				<horizon-product-tile type="insure" 
								label="Insure"
								subtitle="One plan, more cover"
								icon="product/insure-white"
								@click="${() => this.router.navigateByPath(`/product/insure`)}">
				</horizon-product-tile>
				<horizon-product-tile type="credit" 
								label="Credit" 
								subtitle="Rethink credit, realise dreams"
								icon="product/credit-white"
								@click="${() => this.router.navigateByPath(`/product/credit`)}">
				</horizon-product-tile>
			</capitec-card>	
			`;
	}

	render() {
		return html`
		
		<section class="left-card">
			<div>
				${this.renderClientDetails()}
			</div>
			<div>
				${this.renderProductDetails()}
			</div>
		</section>
			`;
	}
}

window.customElements.define(`client-details`, ClientProfileDetails);