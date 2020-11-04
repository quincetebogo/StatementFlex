import { Component, css, html } from 'platform/elements';

import 'app/components/common/OptionButton';

/**
 * A component for displaying a mini-client profile. This component also displays buttons and 
 * banners that vary according according ot the state of the incoming caller 
 * (verified, unverified, failed verification, third party, non-client etc.)
 *
 * @export
 * @class MiniProfile
 * @extends {Component}
 */
export class MiniProfile extends Component {

	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.miniProfile = {
			name: ``,
			idNumber: ``,
			phoneNumber: ``,
			livesIn: ``,
			languagePreference: ``,
			birthday: ``,
			showButtons: false,
			isConfirmed: false,
			isVerified: false,
			verificationFailed: false,
			is3rdParty: false,
			isNonClient: false
		};
	}

	/**
	 * @property {Object} miniProfile Data and flags for updating the mini-profile panel view
	 *
	 * @readonly
	 * @static
	 * @memberof MiniProfile
	 */
	static get properties() {
		return {
			miniProfile: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// EVENTS
	// ---------

	_onUpdateMiniClientProfile(profile) {

		this.miniProfile = {
			name: profile.name,
			idNumber: profile.idNumber,
			phoneNumber: profile.phoneNumber,
			livesIn: profile.livesIn,
			languagePreference: profile.languagePreference,
			birthday: profile.birthday,
			showButtons: profile.showButtons,
			isConfirmed: profile.isConfirmed,
			isVerified: profile.isVerified,
			verificationFailed: profile.verificationFailed,
			is3rdParty: profile.is3rdParty,
			isNonClient: profile.isNonClient
		};
	}

	_onDocumentClick() {
		this.EventAggregator.publish(`horizon-view-documents-click`, {});
	}

	_onViewProfileClick() {
		this.EventAggregator.publish(`horizon-view-profile-click`, {});
	}

	_onVerifyNowClick() {
		this.EventAggregator.publish(`horizon-verify-now-click`, {});
	}

	// --------- 
	// PRIVATE
	// ---------

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
				height: auto;
				padding: 16px 16px 16px 16px;
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
				padding-top: 0px;
				padding-bottom:16px;
			}
			horizon-option-button {
				height: 88px;
				width: 198px;
				box-sizing: border-box;
				border: 1px solid #E1E1E1;
				border-radius: 4px;
				background-color: #FFFFFF;

				--theme-button-default-border-width: 0px; 

				--horizon-option-btn-icon-height: 26px;
				--horizon-option-btn-icon-width: 26px;
				--horizon-option-btn-text-margin-top: 3px;
				--horizon-option-btn-text-line-height: 20px;
				--horizon-option-btn-text-font-weight: 500;
				--horizon-option-btn-text-color: #545D60;
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
			}
			`
		];
	}
	
	_webTemplate() { 
		return html`
			<capitec-card class="hello-card">
				<capitec-group class="client-details-group" layout="grid" gap="none" rows="auto" columns="auto">
					<capitec-content-box class="client-image-box" row="1" column="1" colspan="2" nopadding>
						${this._renderClientImage()}
						${this._renderClientPersonalInfo()}
					</capitec-content-box>
					${this._renderActionButtons()}
				</capitec-group>
			</capitec-card>
			${this._renderBanner()}
		`;
	}

	_renderClientImage() {
		return html`
			<div class="client-img">
				<capitec-icon 
					size="large" 
					icon="system/client-insights-error">
				</capitec-icon>
			</div>`;
	}

	_renderClientPersonalInfo() {
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

	_renderActionButtons() {
		if (!this.miniProfile.showButtons) {
			return html``;
		}

		return html`
			<capitec-content-box class="client-wrapper-box" row="2" column="1" colspan="2">
				<capitec-group layout="horizontal" halign="left" valign="top" gap="clear">
					<horizon-option-button
						class="view-button"
						label="View profile"
						icon="system/profile-action"
						@click="${() => this._onViewProfileClick()}">
					</horizon-option-button>

					<horizon-option-button
						class="document-button"
						label="Document"
						icon="system/documents-action"
						@click=${() => this._onDocumentClick()}>
					</horizon-option-button>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderBanner() {
		if (this.miniProfile.isVerified || this.miniProfile.isNonClient) {
			return html``;
		} else if (this.miniProfile.is3rdParty) {
			return html`
			<capitec-alert-banner class="client-profile-alert" type="warning">
				Client has not been verified
				</capitec-hyperlink>
			</capitec-alert-banner>
			`;
		} else if (this.miniProfile.verificationFailed) {
			return html`
			<capitec-alert-banner class="client-profile-error" type="error-trans">
				Client failed security questions
				<capitec-hyperlink class="verify-via-app-link" @click="${() => this._onVerifyNowClick()}"
					label="Verify via the app"></capitec-hyperlink>
			</capitec-alert-banner>
			`;
		};

		return html`
			<capitec-alert-banner class="client-profile-alert" type="warning">
				Client has not been verified
				<capitec-hyperlink class="verify-now-link" @click="${() => this._onVerifyNowClick()}" label="Verify Now">
				</capitec-hyperlink>
			</capitec-alert-banner>
			`;
	} 
}

window.customElements.define(`horizon-mini-profile`, MiniProfile);