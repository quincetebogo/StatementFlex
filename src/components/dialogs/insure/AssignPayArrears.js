import { Component, html, css } from 'platform/elements';

export class AssignPayArrears extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.teamsList = [

			{ code: '0', text: 'VR34345' },
			{ code: '1', text: 'VR34556' },
			{ code: '2', text: 'VR34567' }
		];

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

	_onCancel() {
		console.log("cancelling pay arrears");
		this.dispatchEvent(new CustomEvent('on-cancel', {}));
	}

	_onAssign() {
		this.dispatchEvent(new CustomEvent('on-assign', {}));
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
					padding: 12px 0px 0px 0px;
				}

				.image-card {
					width: 210px;
					height: 152px;
					border: 0px;
					margin: 0px 166px 0px 167px;
				}

				capitec-icon {
					--theme-icon-size-small: 26px;
					width: 22px;
					margin-right: 0px;
				}

				.needimage{
					height: 98px;
					width: 107px;
					margin: 29px 52px 30px 52px;
				}

				.error-group {
					height: 26px;
					width: 405px;
					margin: 15px 89px 0px 49px;
				}

				.error-label {
						height: 24px;
						width: 372px;
						color: #3E4547;
						font-family: "Hind Vadodara";
						font-size: 16px;
						font-weight: 500;
						letter-spacing: 0;
						line-height: 24px;
						margin-left: 7px;
						text-align: center;
				}

				.select-options{
					text-align: justify;
					line-height: 20px;
					margin: 47px 16px 0px 16px;	
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

		`];

	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Assign - Pay Arrears">
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
		<capitec-card class="image-card">
			<img src="../../images/insure/pay-arrears-error.svg" class="needimage"/>
		</capitec-card>

		<capitec-group class="error-group" layout="horizontal">
			<capitec-icon size="small" icon="status/error-trans"></capitec-icon>
			<capitec-label class="error-label" label="Client has been informaed that they are not in arrears"></capitec-label>
		</capitec-group>

		<capitec-select
					error="" 
					label="Choose a team" 
					class="select-options"
					.items="${this.teamsList}"
					@value-changed=""
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
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onCancel()}">
				</capitec-button>

				<capitec-button
					id="id-assign-button"
					type="primary"
					label="Assign"
					?hidden=""
					.disabled=""
					tabindex=""
					@click="${() => this._onAssign()}">
				</capitec-button>
			</capitec-group>
			`;
	}
}

window.customElements.define(`horizon-assign-pay-arrears`, AssignPayArrears)