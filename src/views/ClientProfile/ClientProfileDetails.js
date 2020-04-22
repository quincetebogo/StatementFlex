import { Component, html, css } from 'platform/elements';

import 'platform/components/buttons/ProductTile';
import { isDisabled, isHidden, getTabIndex, getValue } from '../../utils/channelServiceUtilities';
import { HorizonViewManager } from '../../HorizonViewManager';

export class ClientProfileDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();


		this.confirmedCaller = null;
		this.clientProfileDetails = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			clientProfileDetails: { type: Object }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.confirmedCaller = HorizonViewManager.getInstance().recoverState();
		let clientProfileDetails = this.confirmedCaller.clientProfileDetails;
		this.clientPersonalInfo = this.confirmedCaller && clientProfileDetails.clientPersonalInformation;

		if (this.clientPersonalInfo) {
			this.name = this.clientPersonalInfo.value.name;
			this.southAfricanIDNumber = this.clientPersonalInfo.value.southAfricanIDNumber;
			this.verifiedTelephoneNumber = this.clientPersonalInfo.value.verifiedTelephoneNumber;
			this.livesIn = this.clientPersonalInfo.value.livesIn;
			this.languagePreference = this.clientPersonalInfo.value.languagePreference;
			this.birthdate = this.clientPersonalInfo.value.birthdate;
			this.viewProfileButton = this.clientPersonalInfo.value.viewProfileButton;
			this.documentsButton = this.clientPersonalInfo.value.documentsButton;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			.left-card {
				width: 440px;
				height: 770px;
				padding: 0px 0px 0px 0px;
			}
			.hello-card {
				width: 440px;
				height: 344px;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
			}
			.client-details-group{
				height: 296px;
			}
			.client-image-box{
				height: 176px;
				padding: 16px 16px 0px 16px;
				display: flex;
				flex-direction: row;
			}
			.client-img{
				width: 160px;
				height: 160px;
				padding: 55px 55px 55px 55px;
				margin: 0px;
			}
			.client-details-box{
				width: 230px;
				margin-left: 16px;
			}
			b{
				font: bold 20px/30px Hind Vadodara;
				color: #003652;
			}
			capitec-group > capitec-label:first-child {
				height: 30px;
				width: auto;
				color: #003652;
				font-family: "Hind Vadodara";
				font-size: 20px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 30px;
			}
			capitec-group > span {
				display: flex;
				flex-direction: row;
			}
			capitec-group > span > capitec-label:first-child {
				--theme-label-font-weight: 400;
				line-height: 23px;
				height: 24px;
				letter-spacing: 0;
				font-weight: normal;
			}
			.client-wrapper-box{
				height: 120px;
			}
			.view-button{
				height: 88px;
				width: 198px;
			}
			.document-button{
				height: 88px;
				width: 195px;
				float: right;
			}
			.view-Document-box{
				height:50px;
				width:150px;
				padding: 0px 0px 0px 0px;
			}
			.horizon-client-authorised{
				display: flex;
				flex-direction: row;
				width: 438px;
				height: 48px;
				border-radius: 0 0 4px 4px;
				background-color: rgba(212,120,28,0.15);
			}
			#authorised-icon{
				margin: 13px 12px 0px 23px;
				height: 24px;
				width: 24px;
			}
			#authorised-text{
				height: 23px;
				width: 279px;
				color: #E47C28;
				font-family: "Hind Vadodara";
				font-size: 15px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 23px;
				margin: 11px 0px 0px 0px;
				padding: 0px;
			}`
		];
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
				<capitec-group class="client-details-group" layout="grid" gap="none" rows="auto" columns="auto">
					<capitec-content-box class="client-image-box" row="1" column="1" colspan="2" nopadding>
						${this.renderClientImage()}
						${this.renderClientPersonalInfo()}
					</capitec-content-box>
					${this.renderActionButtons()}
				</capitec-group>

				<div class="horizon-client-authorised">
					<capitec-icon id="authorised-icon" size="small" icon="status/warning"></capitec-icon>
					<a id="authorised-text" href="">Not Authorised</a>
				</div>
			</capitec-card>	
			`;
	}

	renderClientImage() {
		return html`<div class="client-img">
						<capitec-icon size="large" icon="system/client-insights-error"></capitec-icon>
					</div>`;
	}

	renderClientPersonalInfo() {
		return html`<capitec-group layout="grid" row="auto" columns="auto" gap="none" class="client-details-box">
						<capitec-label row="1" column="1"
										label="${getValue(this.name)}"
										type="subtitle"
										tabindex="${getTabIndex(this.name)}"
										?hidden=${isHidden(this.name)}>
						</capitec-label>
						<span row="2" column="1">
							<capitec-label label="ID Number: "
										type="subtitle"
										tabindex="${getTabIndex(this.southAfricanIDNumber)}"
										?hidden=${isHidden(this.southAfricanIDNumber)}>
							</capitec-label>
							<capitec-label label="${getValue(this.southAfricanIDNumber)}" 
										type="subtitle"
										tabindex="${getTabIndex(this.southAfricanIDNumber)}"
										?hidden=${isHidden(this.southAfricanIDNumber)}>
							</capitec-label>
						</span>
						<span row="3" column="1">
							<capitec-label label="Verified Number: "
										type="subtitle"
										tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
										?hidden=${isHidden(this.verifiedTelephoneNumber)}>
							</capitec-label>
							<capitec-label label="${getValue(this.verifiedTelephoneNumber)}" 
										type="subtitle"
										tabindex="${getTabIndex(this.verifiedTelephoneNumber)}"
										?hidden=${isHidden(this.verifiedTelephoneNumber)}>
							</capitec-label>
						</span>
						<span row="4" column="1">
							<capitec-label label="Lives In: "
										type="subtitle"
										tabindex="${getTabIndex(this.livesIn)}"
										?hidden=${isHidden(this.livesIn)}>
							</capitec-label>
							<capitec-label label="${getValue(this.livesIn)}" 
										type="subtitle"
										tabindex="${getTabIndex(this.livesIn)}"
										?hidden=${isHidden(this.livesIn)}>
							</capitec-label>
						</span>
						<span row="5" column="1">
							<capitec-label label="Language Preference: "
										type="subtitle"
										tabindex="${getTabIndex(this.languagePreference)}"
										?hidden=${isHidden(this.languagePreference)}>
							</capitec-label>
							<capitec-label label="${getValue(this.languagePreference)}" 
										type="subtitle"
										tabindex="${getTabIndex(this.languagePreference)}"
										?hidden=${isHidden(this.languagePreference)}>
							</capitec-label>
						</span>
						<span row="6" column="1">
							<capitec-label label="Birthday: "
										type="subtitle"
										tabindex="${getTabIndex(this.birthdate)}"
										?hidden=${isHidden(this.birthdate)}>
							</capitec-label>
							<capitec-label label="${getValue(this.birthdate)}" 
										type="subtitle"
										tabindex="${getTabIndex(this.birthdate)}"
										?hidden=${isHidden(this.birthdate)}>
							</capitec-label>
						</span>
					</capitec-group>`;
	}

	renderActionButtons() {
		return html`<capitec-content-box class="client-wrapper-box" row="2" column="1" colspan="2">
						<div>
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
					</capitec-content-box>`;
	}
}

window.customElements.define(`client-details`, ClientProfileDetails);