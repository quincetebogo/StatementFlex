import { Component, html, css } from 'platform/elements';
import { Router } from 'platform/Router';

import 'platform/components/buttons/ProductTile';
import { isDisabled, isHidden, getTabIndex } from '../../utils/channelServiceUtilities';
import { HorizonViewManager } from '../../HorizonViewManager';

export class ClientProfileDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.router = Router.getInstance();

		this.confirmedCaller = HorizonViewManager.getInstance().recoverState();

		this.name = this.confirmedCaller.clientPersonalInfo.value.name;
		this.southAfricanIDNumber = this.confirmedCaller.clientPersonalInfo.value.southAfricanIDNumber;
		this.verifiedTelephoneNumber = this.confirmedCaller.clientPersonalInfo.value.verifiedTelephoneNumber;
		this.livesIn = this.confirmedCaller.clientPersonalInfo.value.livesIn;
		this.languagePreference = this.confirmedCaller.clientPersonalInfo.value.languagePreference;
		this.birthdate = this.confirmedCaller.clientPersonalInfo.value.birthdate;
		this.viewProfileButton = this.confirmedCaller.clientPersonalInfo.value.viewProfileButton;
		this.documentsButton = this.confirmedCaller.clientPersonalInfo.value.documentsButton;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			confirmedCaller: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// N/A

	// ---------
	// RENDERING
	// ---------

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
			b{
				font: bold 20px/30px Hind Vadodara;
				color: #003652;
			}
			capitec-content-box > span {
				margin: 0px 0px 5px 0px;
			}
			
			`];
	}

	render() {
		return html`
		<section class="left-card">
			<div>
				${this.renderClientDetails()}
			</div>
			<horizon-product-bar disableNavigation=true></horizon-product-bar>
		</section>`;
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
						<span>
							<b>${this.name.value}</b>
						</span>
						<span>
							<capitec-label label="ID Number: ${this.southAfricanIDNumber.value}" 
										   type="subtitle"
										   tabindex="${getTabIndex(this.southAfricanIDNumber)}"
										   ?hidden=${isHidden(this.southAfricanIDNumber)}>
							</capitec-label>
						</span>
						<span>
							<capitec-label label="Verified Number: ${this.verifiedTelephoneNumber.value || 'N/A'}" 
										   type="subtitle"
										   tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
										   ?hidden=${isHidden(this.verifiedTelephoneNumber)}>
							</capitec-label>
						</span>
						<span>
							<capitec-label label="Lives In: ${this.livesIn.value}" 
										   type="subtitle"
										   tabindex="${getTabIndex(this.livesIn)}"
										   ?hidden=${isHidden(this.livesIn)}>
							</capitec-label>
						</span>
						<span>
							<capitec-label label="Language Preference: ${this.languagePreference.value || 'N/A'}" 
										   type="subtitle"
										   tabindex="${getTabIndex(this.languagePreference)}"
										   ?hidden=${isHidden(this.languagePreference)}>
							</capitec-label>
						</span>
						<span>
							<capitec-label label="Birthday: ${this.birthdate.value}" 
										   type="subtitle"
										   tabindex="${getTabIndex(this.birthdate)}"
										   ?hidden=${isHidden(this.birthdate)}>
							</capitec-label>
						</span>
					</capitec-content-box>
				</capitec-group>

				<div class="wrapper">
					<capitec-button class="view-button" 
									?hidden=${isHidden(this.viewProfileButton)}
									.disabled="${isDisabled(this.viewProfileButton)}"
									tabindex="${getTabIndex(this.viewProfileButton)}">
						<capitec-content-box class="view-Document-box" layout="vertical" halign="center" valign="top" gap="clear">
					 		<capitec-icon size="small" icon="system/profile"></capitec-icon>
							<capitec-label label="View profile"></capitec-label>
						</capitec-content-box> 
					</capitec-button>

					<capitec-button class="document-button"
									?hidden=${isHidden(this.documentsButton)}
									.disabled="${isDisabled(this.documentsButton)}"
									tabindex="${getTabIndex(this.documentsButton)}">
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
}

window.customElements.define(`client-details`, ClientProfileDetails);