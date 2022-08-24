import { Component, css, html } from 'platform/elements';

const ALERT_ERROR_MESSAGE = `Choose a team to continue.`;
const ERROR_MESSAGE = `Required field`;

export class AssignReasonSelected extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.selectedReason = null;
		this.assignDialogDetails = {
			dialogHeader: ``,
			dialogImage: null,
			dialogText: ``
		};
		this.teamsList = [

			{ code: `0`, text: `VR34345` },
			{ code: `1`, text: `VR34556` },
			{ code: `2`, text: `VR34567` }
		];
		this.alertBannerMessage = ``;
		this.selectedTeam = ``;
		this.errMessage = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			assignDialogDetails: { type: Object },
			selectedReason: { type: String },
			alertBannerMessage: { type: String },
			errMessage: { type: String },
			selectedTeam: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		switch (this.selectedReason) {
			case `0`:
				this.assignDialogDetails.dialogHeader = `Assign - System Error`;
				this.assignDialogDetails.dialogImage = `/images/insure/assign-system-error.svg`;
				this.assignDialogDetails.dialogText = `System error occurred. Assign to the relevant team for assistance.`;
				break;
			case `1`:
				this.assignDialogDetails.dialogHeader = `Assign - Pay Arrears`;
				this.assignDialogDetails.dialogImage = `/images/insure/assign-pay-arrears.svg`;
				this.assignDialogDetails.dialogText = `Client has been informed that they are not in arrears`;
				break;
			case `2`:
				this.assignDialogDetails.dialogHeader = `Assign - Refund`;
				this.assignDialogDetails.dialogImage = `/images/insure/assign-refund.svg`;
				this.assignDialogDetails.dialogText = `System error occurred. Assign to the relevant team for assistance.`;
				break;
			default:
				break;
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_valueChanged(e) {
		this.selectedTeam = e.detail.new.value;
		this.alertBannerMessage = ``;
		this.errMessage = ``;
	}

	_onAssignClick() {
		if (this.selectedTeam === ``) {
			this.alertBannerMessage = ALERT_ERROR_MESSAGE;
			this.errMessage = ERROR_MESSAGE;
		} else {
			this.dispatchEvent(new CustomEvent(`team-selected`, {
				detail: {}
			}));
		}
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
					height: 614px;
					width: 543px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 0px 16px 16px 0px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}

				div[slot="body"] {
					width: 543px;
					height: 486px;
				}

				.body-box {
					height: 486px;
					margin: 0px 0px 0px 0px;
					padding : 12px 16px 0px 16px;
				}

				.image-error{
					height: 154px;
					width: 212px;
					margin-bottom: 15px;
				}

				.image-pay-arrear {
					height: 93px;
					width: 106px;
					margin-top: 29px;
					margin-bottom: 45px;
				}

				capitec-icon {
					--theme-icon-size-small: 26px;
					width: 22px;
					margin-right: 0px;
				}

				.error-group {
					height: 26px;
					width: auto;
				}

				.error-label {
					height: 24px;
					width: auto;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin-left: 7px;
					text-align: center;
				}

				.select-options {
					text-align: justify;
					line-height: 20px;
					margin: 37px 0px 0px 0px;
					--theme-input-padding: 14px 16px 14px 16px;
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 23px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 23px;
					--theme-button-clear-border-width: 0px;
				}

				#id-assign-button {
					height: 48px;
					width: 95px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 24px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 24px;
					--theme-button-primary-border-width: 0px;
				}

				horizon-alert-banner {
					margin: 0px 0px 20px 0px;
					--theme-alert-banner-font-weight: 500;
					color: var(--theme-alert-banner-unsuccessful-red-font-color, #C83C37);
					background-color: var(--theme-alert-banner-unsuccessful-red-background-color, rgba(200,60,55,0.1));
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="${this.assignDialogDetails.dialogHeader}">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderAlertBanner()}
						${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<horizon-alert-banner
					label="${this.alertBannerMessage}"
					type="error-trans">
				</horizon-alert-banner>`;
		}
	}

	_renderFeedbackDetails() {

		return html`
		<capitec-group layout="vertical" halign="center" valign="top"  gap="clear">
			<img src="${this.assignDialogDetails.dialogImage}" class="${this.selectedReason === 1 ? `image-pay-arrear` : `image-error`}"/>

			<capitec-group class="error-group" layout="horizontal">
			<capitec-icon size="small" icon="status/error-trans"></capitec-icon>
			<capitec-label class="error-label" label="${this.assignDialogDetails.dialogText}"></capitec-label>
			</capitec-group>

		</capitec-group>

		<capitec-select
					error="${this.errMessage}" 
					label="Choose a team" 
					class="select-options"
					.items="${this.teamsList}"
					@value-changed="${(e) => this._valueChanged(e)}"
					id-field="code"
					display-field="text">
		</capitec-select>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._onCancel()}">
				</capitec-button>

				<capitec-button
					id="id-assign-button"
					type="primary"
					label="Assign"
					@click="${() => this._onAssignClick()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-assign-reason-selected`, AssignReasonSelected);