import { Component, css, html } from 'platform/elements';
import { Configuration, EventAggregator } from 'platform/core';
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
		this.isHelpDeskAgent = true;

		this.configuration = Configuration.getInstance();
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

	async connectedCallback() {
		super.connectedCallback();
		this.eventAggregator = EventAggregator.getInstance();

		this.authMethod = await this.configuration.getSetting(`AuthMethod`);
		const authAttempts = await this.configuration.getSetting(`AuthAttempts`);
		this.maxAttempts = authAttempts[this.authMethod];
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

	_onClientBranchVerifiedClick() {
		this.eventAggregator.publish(`horizon-verify-now-click`, {});
	}

	_onVerifyViaSecurityQuestions() {
		this.eventAggregator.publish(`horizon-verify-via-security-questions`, {});
	}

	// Tooltip is displayed only for a long client's name where the overflowing text is hidden
	_displayTooltip(e) {
		const tooltip = this.shadowRoot.getElementById(`long-name`);
		const clientName = this.shadowRoot.getElementById(`client-name`);

		if (e.target.scrollWidth > e.target.offsetWidth) {
			tooltip.style.display = `flex`;
			clientName.style.display = `none`;
		}
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
					width: var(--horizon-left-panel-width, 440px);
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
				.client-name {
					display: inline-block;
					width: 225px; 
					white-space: nowrap; 
					overflow: hidden;
					text-overflow: ellipsis; 
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
					font-family: "Hind Vadodara SemiBold";
					font-size: 14px;
					letter-spacing: 0;
				}
				#id-verify-now-warning-link {
					--theme-font-family: "Hind Vadodara SemiBold";
					--theme-hyperlink-color: var(--theme-alert-banner-warning-font-color);
					--theme-hyperlink-font-size: 14px;
				}
				#id-verify-via-app-msg {
					font-family: "Hind Vadodara SemiBold";
					font-size: 14px;
					letter-spacing: 0;
				}
				#id-verify-via-app-failed-msg {
					font-family: "Hind Vadodara SemiBold";
					font-size: 14px;
					font-weight: 600;
					letter-spacing: 0;
				}
				#verify-via-app-link{
					--theme-hyperlink-font-size: 14px;
					--theme-font-family: "Hind Vadodara SemiBold";
				}
				capitec-tooltip {
					display: none;
					--theme-tooltip-font-family: 'Hind Vadodara';
					--theme-tooltip-font-size: 14px;
					--theme-tooltip-line-height: 20px;
					--theme-tooltip-border-radius: 2px;
					--theme-layout-gap-spacing: 4px;
				}
			`
		];
	}

	_webTemplate() {
		return this.miniProfile === null 
			? html``
			: html`
			<capitec-card class="hello-card">
				<capitec-content-box 
					class="profile-cb"
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
				icon="/images/common/avatar.svg">
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
						id="client-name" 
						data-automation-id="mini-profile-client-name"
						class="client-name"
						label="${this.miniProfile.name}"
						@mouseover="${(e) => this._displayTooltip(e)}"
						type="title">
					</capitec-label>
					<capitec-tooltip 
							id="long-name" 
							data-automation-id="mini-profile-tooltip-client-name"
							message="${this.miniProfile.name}" 
							position="bottom">
						<capitec-label 
							data-automation-id="mini-profile-tooltip-label-client-name"
							class="client-name"
							label="${this.miniProfile.name}"
							type="title">
						</capitec-label>
					</capitec-tooltip>
					${this._renderInfo(`ID Number`, this._replaceEmptyValue(this.miniProfile.idNumber), `id-number`)}
					${this._renderInfo(`Contact Number`, formatPhoneNumber(this.miniProfile.phoneNumber), `telephone`)}
					${this._renderInfo(`Lives In`, this._replaceEmptyValue(this.miniProfile.livesIn), `lives-in`)}
					${this._renderInfo(`Language Preference`, this._getLanguagePreference(this.miniProfile.languagePreference), `language`)}
					${this._renderInfo(`Birthday`, this._formatBirthDate(this.miniProfile.birthday), `birthdate`)}
			</capitec-group>`;
	}

	_renderInfo(key, value, automationId) {
		return html`
			<capitec-group 
				class="info-rowGroup"
				layout="horizontal"
				halign="left"
				valign="center"
				gap="clear">
					<capitec-label
						label="${key}: "
						type="default">
					</capitec-label>
					<capitec-label
						data-automation-id="mini-profile-${automationId}"
						label="${value}"
						type="strong">
					</capitec-label>
			</capitec-group>
		`;
	}

	_renderActionButtons() {
		this.miniProfile.showButtons = false; // Force to false for now
		if (!this.miniProfile.showButtons) {
			return html``;
		}

		return html`
			<capitec-content-box class="client-wrapper-cb" layout="horizontal" halign="left" valign="top" gap="clear">
				<horizon-option-button
					data-automation-id="mini-profile-view-profile"
					label="View Profile"
					icon="system/profile-action"
					iconSize="default"
					@click="${() => this._onViewProfileClick()}">
				</horizon-option-button>
		
				<horizon-option-button
					data-automation-id="mini-profile-view-documents"
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
							(!this.miniProfile.hasDigitalChannels && this.miniProfile.verificationAttempts.sqAttempts >= this.maxAttempts) ||
							// eslint-disable-next-line no-extra-parens
							(this.miniProfile.verificationAttempts.itaAttempts >= 2 && this.miniProfile.verificationAttempts.sqAttempts >= this.maxAttempts);

		if (noBanner) {
			return html``;
		} else if (this.miniProfile.is3rdParty) {
			return html`
			<capitec-alert-banner 
					data-automation-id="mini-profile-3rdparty-banner"
					class="banner" 
					type="warning">
				<b>Client has not been verified</b>
			</capitec-alert-banner>
			`;
		} else if (this.miniProfile.verificationFailed && this.miniProfile.hasDigitalChannels) {
			return html`
			<capitec-alert-banner
					class="banner" 
					type="unsuccessful-red">
				<capitec-group 
						id="id-notify-banner-group" 
						layout="horizontal">
					<capitec-label
						id="id-verify-via-app-msg" 
						label="Verification Failed">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink
						id="verify-via-app-link" 
						data-automation-id="mini-profile-verify-app"
						@click="${() => this._onVerifyNowClick()}"
						label="Verify now">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>
			`;
		} else if (this.miniProfile.verificationFailed && this.miniProfile.hasDigitalChannels && this.miniProfile.verificationAttempts.itaAttempts > 2) {
			return html`
			<capitec-alert-banner 
					class="banner" 
					type="unsuccessful-red">
				<capitec-group 
						id="id-notify-banner-group" 
						layout="horizontal">
					<capitec-label 
						id="id-verify-via-app-failed-msg" 
						label="Blocked on Remote / Mobile Banking Channels">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>
			`;
		};

		return this.isHelpDeskAgent 
		? html`
			<capitec-alert-banner class="banner" type="warning">
				<capitec-group 
						id="id-notify-banner-group" 
						layout="horizontal">
					<capitec-label 
						id="id-notify-client-warning-msg" 
						label="Client has not been verified">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink 
						id="id-verify-now-warning-link" 
						data-automation-id="mini-profile-verify"
						@click="${() => this._onClientBranchVerifiedClick()}"
						label="Client verified in branch">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>` 
		: html`
			<capitec-alert-banner class="banner" type="warning">
				<capitec-group 
						id="id-notify-banner-group" 
						layout="horizontal">
					<capitec-label 
						id="id-notify-client-warning-msg" 
						label="Client has not been verified">
					</capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-hyperlink 
						id="id-verify-now-warning-link" 
						data-automation-id="mini-profile-verify"
						@click="${() => this._onVerifyNowClick()}"
						label="Verify now">
					</capitec-hyperlink>
				</capitec-group>
			</capitec-alert-banner>
			`;
	}
}

window.customElements.define(`horizon-mini-profile`, MiniProfile);