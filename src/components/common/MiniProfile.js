import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/core';
import { formatPhoneNumber } from 'app/utils/channelServiceUtilities';

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
		this.miniProfile = null;
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
		this.eventAggregator = EventAggregator.getInstance();
	}

	// ---------
	// EVENTS
	// ---------

	_onDocumentClick() {
		this.eventAggregator.publish(`horizon-view-documents-click`, {});
	}

	_onViewProfileClick() {
		this.eventAggregator.publish(`horizon-view-profile-click`, {});
	}

	_onVerifyNowClick() {
		this.eventAggregator.publish(`horizon-verify-now-click`, {});
	}

	_onVerifyViaSecurityQuestions() {
		this.eventAggregator.publish(`horizon-verify-via-security-questions`, {});
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

	_getLanguagePreference(value) {
		return !value || value === `NOT_DEFINED` ? `-` : value;
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
			return `-`;
		}

		const months = [
			`January`, `February`, `March`, `April`, `May`, `June`,
			`July`, `August`, `September`, `October`, `November`, `December`
		];

		return `${dob.getDate()} ${months[dob.getMonth()]} ${dob.getFullYear()}`;
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

					--theme-card-border-radius: 4px;
				}
				.profile-cb {
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}
				capitec-avatar {
					border-radius: 4px;

					--theme-avatar-size-large: 158px;
					--theme-layout-gap-spacing: 16px;
				}
				capitec-label[type="title"] {
					margin-top: 9px;
					line-height: 24px;

					--theme-text-select: text;
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
				}
				.info-rowGroup {
					height: 20px;

					--theme-layout-gap-spacing: 2px;
				}
				capitec-label[type="default"] {
					--theme-text-select: text;
					--theme-label-default-font-size: 14px;
				}
				capitec-label[type="strong"] {
					--theme-text-select: text;
					--theme-label-strong-font-size: 14px;
					--theme-label-strong-font-weight: 600;
				}
				.client-wrapper-cb{
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 16px;
					--theme-container-padding-left: 16px;
					--theme-container-padding-right: 16px;
				}
				horizon-option-button {
					height: 80px;
					width: 196px;

					--horizon-option-btn-text-margin-top: 6px;
					--horizon-option-btn-text-line-height: 20px;
					--horizon-option-btn-text-font-weight: 600;
				}
				.banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 7px;
					--theme-alert-banner-warning-border: none;
					--theme-alert-banner-unsuccessful-red-border: none;
					--theme-alert-banner-info-border: none;

					--theme-icon-size-default: 20px;
					--theme-alert-banner-warning-border: none;
					--theme-alert-banner-height: 48px;
				}
				#id-notify-banner-group {
					width: 380px;
				}
				#id-notify-client-warning-msg {
					color: #D4781C;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
				}
				#id-verify-now-warning-link {
					--theme-hyperlink-color: #D4781C;
					--theme-font-family: "Hind Vadodara";
					--theme-font-weight: 600;
				}
				#id-verify-via-app-msg {
					color:#C83C37;
					font-family: "Hind Vadodara";
					font-size: 15px;
					letter-spacing: 0;
				}
				#verify-via-app-link{
					--theme-hyperlink-color:#C83C37;
					--theme-font-family: "Hind Vadodara";
					--theme-font-weight: 600;
					text-decoration: underline;
				}
			`
		];
	}

	_webTemplate() {
		return this.miniProfile === null 
			? html``
			: html`
			<capitec-card class="hello-card">
				<capitec-content-box class="profile-cb"
					layout="horizontal"
					halign="left"
					valign="top"
					gap="clear">
						${this._renderClientImage()}
						${this._renderClientPersonalInfo()}
				</capitec-content-box>
				${this._renderActionButtons()}
			</capitec-card>
			${this._renderBanner()}
		`;
	}

	_renderClientImage() {
		return html`
			<capitec-avatar 
				shape="square"
				icon="../../../images/common/avatar.svg">
			</capitec-avatar>`;
	}

	_renderClientPersonalInfo() {
		return html`
			<capitec-group 
				layout="vertical"
				halign="left"
				valign="top"
				gap="clear">
					<capitec-label
						label="${this.miniProfile.name}"
						type="title">
					</capitec-label>
					${this._renderInfo(`ID Number`, this._replaceEmptyValue(this.miniProfile.idNumber))}
					${this._renderInfo(`Contact Number`, formatPhoneNumber(this.miniProfile.phoneNumber))}
					${this._renderInfo(`Lives In`, this._replaceEmptyValue(this.miniProfile.livesIn))}
					${this._renderInfo(`Language Preference`, this._getLanguagePreference(this.miniProfile.languagePreference))}
					${this._renderInfo(`Birthday`, this._formatBirthDate(this.miniProfile.birthday))}
			</capitec-group>`;
	}

	_renderInfo(key, value) {
		return html`
			<capitec-group class="info-rowGroup"
				layout="horizontal"
				halign="left"
				valign="center"
				gap="clear">
					<capitec-label
						label="${key}: "
						type="default">
					</capitec-label>
					<capitec-label
						label="${value}"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_renderActionButtons() {
		if (!this.miniProfile.showButtons) {
			return html``;
		}

		return html`
			<capitec-content-box class="client-wrapper-cb" layout="horizontal" halign="left" valign="top" gap="clear">
				<horizon-option-button
					label="View Profile"
					icon="system/profile-action"
					iconSize="default"
					@click="${() => this._onViewProfileClick()}">
				</horizon-option-button>
		
				<horizon-option-button
					label="Document"
					icon="system/documents-action"
					iconSize="default"
					@click=${() => this._onDocumentClick()}>
				</horizon-option-button>
			</capitec-content-box>
		`;
	}

	_renderBanner() {
		const noBanner = this.miniProfile.isVerified || 
							this.miniProfile.isNonClient || 
							// eslint-disable-next-line no-extra-parens
							(!this.miniProfile.hasDigitalChannels && this.miniProfile.verificationAttempts.xdsAttempts >= 2) ||
							// eslint-disable-next-line no-extra-parens
							(this.miniProfile.verificationAttempts.itaAttempts >= 2 && this.miniProfile.verificationAttempts.xdsAttempts >= 2);

		if (noBanner) {
			return html``;
		} else if (this.miniProfile.is3rdParty) {
			return html`
			<capitec-alert-banner class="banner" type="warning">
				Client has not been verified
			</capitec-alert-banner>
			`;
		} else if (this.miniProfile.verificationFailed && this.miniProfile.hasDigitalChannels) {
			return html`
			<capitec-alert-banner class="banner" type="unsuccessful-red">
				<capitec-group id="id-notify-banner-group" layout="horizontal">
					<capitec-label id="id-verify-via-app-msg" label="Verification Unsuccessful"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink id="verify-via-app-link" @click="${() => this._onVerifyNowClick()}"
						label="Verify Now">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>
			`;
		};

		return html`
			<capitec-alert-banner class="banner" type="warning">
				<capitec-group id="id-notify-banner-group" layout="horizontal">
					<capitec-label id="id-notify-client-warning-msg" label="Client has not been verified"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink id="id-verify-now-warning-link" @click="${() => this._onVerifyNowClick()}"
						label="Verify Now">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>
			`;
	}
}

window.customElements.define(`horizon-mini-profile`, MiniProfile);