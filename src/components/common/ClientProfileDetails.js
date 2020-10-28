import { Component, css, html } from 'platform/elements';
import { getTabIndex, isDisabled, isHidden } from '../../utils/channelServiceUtilities';
import { EventAggregator } from 'platform/EventAggregator';

import 'platform/components/buttons/ProductTile';

/**
 * ClientProfileDetails displays the left hand bar of the Horizon display. This contains
 * the mini client profile, product buttons and various short cuts depending on the
 * state of the system
 *
 * @export
 * @class ClientProfileDetails
 * @extends {Component}
 */
export class ClientProfileDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.EventAggregator = EventAggregator.getInstance();

		this.viewProfileButton = {
			enabled: true,
			tabIndex: 0,
			visible: ``
		};
		
		this.documentsButton = {
				enabled: true,
				tabIndex: 0,
				visible: ``
		};

		this.isProfileButtonHidden = false;
		this.isDocumentButtonHidden = false;
		
		this.clientType = ``;

		this.miniProfile = {
			name: ``,
			idNumber: ``,
			phoneNumber: ``,
			livesIn: ``,
			languagePreference: ``,
			birthday: ``,
			isConfirmed: false
		};
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			miniProfile: { type: Object },
			clientType: { type: String },
			viewProfileButton: { type: Object },
			documentsButton: { type: Object },
			isProfileButtonHidden: { type: Boolean },
			isDocumentButtonHidden: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.EventAggregator.subscribe(`horizon-update-left-hand-bar`, (event) => this._onUpdateLeftButtons(event));

		this.EventAggregator.subscribe(`mini-client-profile`, (profile) => this._onUpdateMiniClientProfile(profile));
	}

	// ---------
	// EVENTS
	// ---------

	_onUpdateLeftButtons(event) {
		this.viewProfileButton.visible = event.isProfileButtonVisible;
		this.documentsButton.visible = event.isDocumentsButtonVisible;
		this.clientType = event.clientType;
		this.isProfileButtonHidden = isHidden(this.viewProfileButton);
		this.isDocumentButtonHidden = isHidden(this.documentsButton);
	}

	_onUpdateMiniClientProfile(profile) {

		this.miniProfile = {
			name: profile.name,
			idNumber: profile.idNumber,
			phoneNumber: profile.phoneNumber,
			livesIn: profile.livesIn,
			languagePreference: profile.languagePreference,
			birthday: profile.birthday,
			isConfirmed: profile.isConfirmed
		};
	}

	// --------- 
	// PRIVATE
	// ---------

	_onDocumentClick() {
		this.dispatchEvent(new CustomEvent(`on-document-click`, {
			detail: {}
		}));
	}

	_onViewProfileClick() {
		this.dispatchEvent(new CustomEvent(`on-view-profile-click`, {
			detail: {}
		}));
	}

	_onVerifyNowClick() {
		this.EventAggregator.publish(`verify-now-click`, {});
	}

	_replaceEmptyValue(value) {
		if (value === null || value === ``) {
			return `-`;
		}
		return value;
	}

	_formatBirthDate(birthdate) {
		if (birthdate === null || birthdate === ``) {
			return `-`;
		}

		let dob = null;

		if (birthdate instanceof Date) {
			dob = birthdate;
		} else if (birthdate) {
			dob = new Date(birthdate);
		} else {
			dob = null;
		}

		const months = [
			`January`, `February`, `March`, `April`, `May`, `June`,
			`July`, `August`, `September`, `October`, `November`, `December`
		];

		return `${dob.getDate()} ${months[dob.getMonth()]}`;
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
				height: auto;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
			}
			.client-details-group{
				height: auto;
			}
			.client-image-box{
				height: 176px;
				padding: 16px 16px 0px 16px;
				display: flex;
				flex-direction: row;
			}
			.client-img{
				width: 158px;
				height: 158px;
				padding: 55px 55px 55px 55px;
				margin: 0px;
				background-color: #F7F7F7;
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
				height: 24px;
				line-height: 24px;
				width: auto;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				margin-bottom: 8px;
			}
			capitec-group > span {
				display: flex;
				flex-direction: row;
			}
			capitec-group > span > capitec-label:first-child {
				--theme-label-font-weight: 400;
				line-height: 20px;
				height: 20px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 14px;
				letter-spacing: 0;
				font-weight: normal;
			}
			capitec-group > span > capitec-label:nth-child(2) {
				line-height: 20px;
				height: 20px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 14px;
				letter-spacing: 0;
				font-weight: 600;
			}
			.client-wrapper-box{
				height: auto;
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
			}
			.client-profile-alert{
				height: 48px;
				background-color:#F9EBDD;
				color: #D4781C;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 700;
				letter-spacing: 0;
				line-height: 23px;
				--theme-icon-size-default: 20px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-height: 48px;
			}
			.client-profile-error{
				height: 48px;
				background-color: #F7E2E1;
				color: rgb(200, 59, 55);
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 700;
				letter-spacing: 0;
				line-height: 21px;
				--theme-alert-banner-warning-border: none;
				--theme-alert-banner-height: 48px;
			}
			.verify-now-link{
				--theme-hyperlink-color:#D4781C;
			}
			.verify-via-app-link{
				padding-left:55px;
				--theme-hyperlink-color: rgb(200, 59, 55);
			}`
		];
	}

	render() {
		return html`
		<section class="left-card">
			<div>
				${this.renderClientDetails()}
			</div>
			<horizon-product-bar ?disablenavigation=${true}></horizon-product-bar>
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
			
				${this.renderBanner()}
			</capitec-card>
			`;
	}

	renderClientImage() {
		return html`
			<div class="client-img">
				<capitec-icon 
					size="large" 
					icon="system/client-insights-error">
				</capitec-icon>
			</div>`;
	}

	renderClientPersonalInfo() {
		return html`
			<capitec-group layout="grid" row="auto" columns="auto" gap="none" class="client-details-box">
				<capitec-label 
					row="1" column="1" 
					label="${this.miniProfile.name}" 
					type="subtitle">
				</capitec-label>
				<span row="2" column="1">
					<capitec-label 
						label="ID Number: " 
						type="subtitle">
					</capitec-label>
					<capitec-label 
						label="${this._replaceEmptyValue(this.miniProfile.idNumber)}" 
						type="subtitle">
					</capitec-label>
				</span>
				<span row="3" column="1">
					<capitec-label 
						label="Contact Number: " 
						type="subtitle">
					</capitec-label>
					<capitec-label 
						label="${this._replaceEmptyValue(this.miniProfile.phoneNumber)}" 
						type="subtitle">
					</capitec-label>
				</span>
				<span row="4" column="1">
					<capitec-label 
						label="Lives In: " 
						type="subtitle">
					</capitec-label>
					<capitec-label 
						label="${this._replaceEmptyValue(this.miniProfile.livesIn)}" 
						type="subtitle">
					</capitec-label>
				</span>
				<span row="5" column="1">
					<capitec-label 
						label="Language Preference: " 
						type="subtitle">
					</capitec-label>
					<capitec-label 
						label="${this._replaceEmptyValue(this.miniProfile.languagePreference)}" 
						type="subtitle">
					</capitec-label>
				</span>
				<span row="6" column="1">
					<capitec-label 
						label="Birthday: " 
						type="subtitle">
					</capitec-label>
					<capitec-label 
						label="${this._formatBirthDate(this.miniProfile.birthday)}" 
						type="subtitle">
					</capitec-label>
				</span>
			</capitec-group>`;
	}

	renderActionButtons() {
		return html`
			<capitec-content-box class="client-wrapper-box" row="2" column="1" colspan="2">
				<div>
					<capitec-button 
						class="view-button" 
						?hidden="${this.isProfileButtonHidden}"
						.disabled="${isDisabled(this.viewProfileButton)}" 
						tabindex="${getTabIndex(this.viewProfileButton)}"
						@click="${() => this._onViewProfileClick()}">
							<capitec-content-box 
								class="view-Document-box" 
								layout="vertical" 
								halign="center" 
								valign="top" 
								gap="clear">
									<capitec-icon 
										size="small" 
										icon="system/profile">
									</capitec-icon>
									<capitec-label label="View profile"></capitec-label>
							</capitec-content-box>
					</capitec-button>

					<capitec-button 
						class="document-button" 
						?hidden="${this.isDocumentButtonHidden}"
						.disabled="${isDisabled(this.documentsButton)}" 
						tabindex="${getTabIndex(this.documentsButton)}"
						@click=${() => this._onDocumentClick()}>
							<capitec-content-box 
								class="view-Document-box" 
								layout="vertical" 
								halign="center" 
								valign="top" 
								gap="clear">
									<capitec-icon 
										size="small" 
										icon="system/documents">
									</capitec-icon>
									<capitec-label label="Document"></capitec-label>
							</capitec-content-box>
					</capitec-button>
				</div>
			</capitec-content-box>`;
	}

	renderBanner() {
		switch (this.clientType) {
			case `unverified-existing-client`: // banner checked
			case `unverified-prospective`:
				return html`
				<capitec-alert-banner class="client-profile-alert" type="warning-trans">
					Client has not been verified
					<capitec-hyperlink class="verify-now-link" @click="${() => this._onVerifyNowClick()}" label="Verify Now">
					</capitec-hyperlink>
				</capitec-alert-banner>
				`;
			case `verified-existing-client`:
			case `verified-prospective`:
			case `non-client:`:
				return html``;
			default:
				return html``;
		}
		

		// This is to handle banner on 'Verification failed' screen, Once the screen is ready, this snippet helps to dispaly the banner. 
		/* if (this.clientType == 'verificationFailed') {
			  return html`
					<capitec-alert-banner class="client-profile-error" type="error-trans">
						Client failed security questions
						<capitec-hyperlink class="verify-via-app-link" @click="${() => this._onVerifyNowClick()}"
							label="Verify via the app"></capitec-hyperlink>
					</capitec-alert-banner>
					`;
		 }*/

	
		return html`
			<div class="horizon-client-authorised">
				<capitec-icon id="authorised-icon" size="small" icon="status/warning"></capitec-icon>
				<a id="authorised-text" href="">Not Authorised</a>
			</div>`;
	}
}

window.customElements.define(`client-details`, ClientProfileDetails);