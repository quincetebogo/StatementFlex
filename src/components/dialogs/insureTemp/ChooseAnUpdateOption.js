import { Component, html, css } from 'platform/elements';

export class ChooseAnUpdateOption extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {

		}
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
		this.dispatchEvent(new CustomEvent('close-solution', {}));
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
					height: 384px;
					width: 578px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-header-padding-right: 16px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-footer-padding: 5px 16px 11px 0px;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-color: #3E4547;
				}

				div[slot="body"] {
					width: 578px;
					height: 256px;
				}

				.body-box {
					height: 256px;
					margin: 0px 0px 0px 0px;
					--theme-container-padding-top : 13px;
					--theme-container-padding-bottom: 0px;
				}

				#id-cancel-button {
					height: 48px;
					width: 94px;
					margin-right: 19px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 23px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 23px;
					--theme-button-line-height: 20px;
					--theme-button-clear-border-width: 0px;
				}

				#id-continue-button {
					height: 48px;
					width: 113px;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 24px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 24px;
					--theme-button-primary-border-width: 0px;
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

				.group-navigate {
					margin-left: 16px;
					margin-top: 24px;
					padding: 0px;
					width: 640px;
					height: 125px;
				}
		`];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Choose an Update Option">
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderFeedbackDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderFeedbackDetails() {
		return html`
			<capitec-radio-group>
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Add payout beneficiary"
								@value-change="">
					</capitec-radio>
				</capitec-group>
 
				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Update payout beneficiary"
								@value-change="">
					</capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Update premium and cover amounts"
								@value-change="">
					</capitec-radio>
				</capitec-group>

				<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
					<capitec-radio
								class="radio-button-label"
								label="Remove payout beneficiary"
								@value-change="">
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
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-continue-button"
					type="primary"
					label="Continue"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-choose-update-option`, ChooseAnUpdateOption)