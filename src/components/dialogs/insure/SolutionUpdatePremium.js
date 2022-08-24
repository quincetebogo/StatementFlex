import { Component, css, html } from 'platform/elements';

export class UpdatePremium extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.alertBannerType = `info`;
		this.checked = false;
		this.alertBannerMessage = `After each change, the ‘Update’ and ‘Calculate’ button must be clicked.`;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			renderMode: { type: Number },
			alertBannerType: { type: String },
			alertBannerMessage: { type: String },
			checked: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
	}

	_onDoneClick() {
		if (!this.checked) {
			this.alertBannerType = `error`;
			this.alertBannerMessage = `Choose a feedback reason to continue.`;
		} else {
			// TODO: Should be navigated based on the option selected. Can be done when channel is ready.
		}
	}

	_onValueChanged() {
		this.checked = !this.checked;
		this.alertBannerMessage = this.alertBannerType === `error` ? `After each change, the ‘Update’ and ‘Calculate’ button must be clicked.` : `Choose a feedback reason to continue.`;
		this.alertBannerType = this.alertBannerType === `error` ? `info` : `error`;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					height: 616px;
					width: 690px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
					--theme-modal-footer-padding: 0px 16px 16px 0px;
				}

				div[slot="body"] {
					width: 694px;
					height: 709px;
				}

				.body-box {
					height: auto;
					margin: 0px 0px 0px 0px;
					--theme-container-padding-top : 25px;
					--theme-container-padding-bottom: 0px;
				}

				.navigate-container {
					height: 325px;
					width: 662px;
					margin: 0px;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.group-navigate {
					margin: 16px 0px 0px 11px;
					padding: 0px;
					width: auto;
					height: 306px;
				}

				.group-note {
					width: 611px;
					height: 72px;
					margin: 0px 0px 0px 11px;
					padding: 0px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
				}

				.navigate-info-label {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 0px 0px 14px 6px;
				}

				.navigate-bold-label {
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					font-weight: 600;
				}

				.navigate-bullet-list {
					border: 0px;
					margin: 0px 0px 0px 6px;
					height: 130px;
					width: 602px;
				}

				.navigate-bullet-cover-details-list {
					border: 0px;
					margin: 0px 0px 0px 6px;
					height: 198px;
					width: 602px;
				}

				.navigate-info {
					height: 26px;
					width: 553px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					font-weight: 500;
					margin: 8px 0px 0px 6px;
				}

				.note-label {
					width: 611px;
					height: 72px;
					color: #545D60;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin: 20px 0px 20px 0px;
				}

				.navigate-info-cover-details {
					height: 26px;
					width: 533px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					font-weight: 500;
					margin: 8px 0px 12px 6px;
				}

				.navigate-bullet-label {
					height: 24px;
					width: 602px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
					padding-left: 10px;
				}

				.navigate-bullet-label-cover-details {
					height: 24px;
					width: 602px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

				.navigate-label {
					height: 24px;
					padding: 0px 0px 0px 10px;
					width: 602px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

				.navigate-label-cover-details {
					height: 24px;
					padding: 0px 0px 0px 23px;
					width: 602px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 24px;
					margin: 0px;
				}

				.feedback-label {
					height: 24px;
					width: 546px;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					color: #545D60;
					line-height: 24px;
					letter-spacing: 0;
					margin: 24px 0px 15px 0px;
				}

				.radio-group {
					margin-bottom: 63px;
				}

				.radio-button-container {
					margin: 8px 0px 0px 0px;
					height: 48px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.radio-button-label {
					height: 24px;
					margin: 11px 0px 10px 16px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 20px;
				}

				.alert-banner-error {
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				#id-done-button {
					height: 48px;
					width: 86px;
					--theme-button-padding-top: 13px;
					--theme-button-padding-right: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-left: 12px;
				}

				ol {
					margin: 0px;
					padding-left: 20px;
				}

				horizon-alert-banner {
					width: 662px;
					margin: 0px 0px 15px 0px;
					--theme-alert-banner-info-border: 0px;
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-font-weight: 500;
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="How to Update Premium and Cover Amounts">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderNavigationToSBL()}
						${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderAlertBanner() {
		if (this.alertBannerType === `info`) {
			return html`
			<horizon-alert-banner label="${this.alertBannerMessage}" type="${this.alertBannerType}"></horizon-alert-banner>`;
		} else if (this.alertBannerType === `error`) {
			return html`
			<horizon-alert-banner class="alert-banner-error" label="${this.alertBannerMessage}" type="${this.alertBannerType}"></horizon-alert-banner>`;
		}
	}

	_renderNavigationToSBL() {
		return html`
			<capitec-group class="navigate-container" layout="vertical" gap="clear" halign="stretch" valign="top">
				<capitec-content-box class="group-navigate">
					<p class="navigate-info-label"> Navigate to <b class="navigate-bold-label">SBL T62053</b> (Landing Page) </p>

					<capitec-card class="navigate-bullet-list">
						<ol>
							<li class="navigate-bullet-label"> Choose the Insure tab </li>
							<li class="navigate-bullet-label"> In the ‘Update life assured / beneficary details’ section - Select beneficary/life assured </li>
							<p class="navigate-label"> to be ammended </p>
							<li class="navigate-bullet-label"> Enter new cover amount </li>
							<li class="navigate-bullet-label"> Click on ‘Calculate’ to calculate the new premium </li>
						</ol>
					</capitec-card>

					<p class="navigate-info">The details of the Lives Assured / Beneficaries will be displayed.</p>
					<p class="navigate-info-cover-details">The following can be changed in the ‘Cover Details’ section:</p>

					<capitec-card class="navigate-bullet-cover-details-list">
						<li class="navigate-bullet-label-cover-details"> Enter ‘Cover Amount’ </li>
						<li class="navigate-bullet-label-cover-details"> Enter ‘Benefit Payout’ </li>
						<li class="navigate-bullet-label-cover-details"> Select ‘Yes’ or ’No’ from the dropdown to indicate if the life is a ‘Life Assured’ or not </li>
						<li class="navigate-bullet-label-cover-details"> Select ‘Yes’ or ’No’ from the dropdown to indicate if the life is a ‘Beneficary’ or not </li>
						<li class="navigate-bullet-label-cover-details"> Confirm all updates to the plan with the client and select ‘Yes’ to ‘All Details Correct?’ in </li>
						<p class="navigate-label-cover-details"> the ‘Client Confirmation’ section. </p>
						<li class="navigate-bullet-label-cover-details"> Once ‘Yes’ has been selected, the ‘Transmit’ button will become active and the ‘Voice </li>
						<p class="navigate-label-cover-details"> Reference Number’ becomes mandatory. </p>
					</capitec-card>

					<p class="note-label"> Note: if there is no Voice Reference number on the Incident Number can be used. A disclaimer has to be read to the client and document to be emailed using existing or alternate email address to be provided by the client. </p>

				</capitec-content-box>
			</capitec-group>
		`;
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-label class="feedback-label" label="Feedback:"></capitec-label>

			<capitec-radio-group class="radio-group">
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Update premium and cover amount complete"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>
 
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Client cancelled the update"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="System error - assign now"
								@value-change="${() => this._onValueChanged()}">
					</capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					tabindex=""
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-done-button"
					type="primary"
					label="Done"
					tabindex=""
					@click="${() => this._onDoneClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-update-premium`, UpdatePremium);