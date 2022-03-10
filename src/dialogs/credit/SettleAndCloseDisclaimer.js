import { Component, css, html } from 'platform/elements';
import { CREDIT_TYPE } from 'app/constants/Credit';

/**
 * A warning dialog that prompts the agent to inform they're settling and closing the selected account.
 *
 * @export
 * @class CCSstatus
 * @extends {Component}
 */

export class SettleAndClose extends Component {

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
			productType: { type: String },
			creditType: { type: String }
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

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`));
	}

	_continueClick() {
		// TODO: Navigation to settle and close modal should come here
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
					height: 428px;
					width: 495px;
					border-radius: 4px;

					--theme-modal-header-height: 64px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 32px;
					--theme-modal-header-padding-left: 32px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
				}

				div[slot="header"] {
					position: absolute;
					display: flex;
					align-items: center;
					left: -472px;
					top: -12px;
				}

				div[slot="header"] > span {
					padding-left: 15px;
				}

				capitec-label {
					padding-left: 8px;
					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					line-height: 24px;
				}

				capitec-content-box {
					width: 495px;
					height: 300px;
					border-bottom: 1px solid #E1E1E1;
				}

				capitec-content-box > p {
					width: auto;
					font-size: 16px;
					margin: 0px 0px 15px 0px;
				}

				capitec-content-box > p:last-child {
					margin: 0px;
				}

				capitec-icon {
					--theme-icon-size-medium: 24px;
				}

				capitec-button {
					height: 48px;
					border-radius: 5px;

					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
					--theme-button-padding-top: 10px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 10px;
					--theme-button-padding-left: 22px;
				}

				#id-okay-button {
					width: 103px;
				}

				div[slot="header"] > capitec-group {
					align-items : center;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="medium" icon="status/warning-trans"></capitec-icon>
							<capitec-label type="subtitle" label="${this.creditType === CREDIT_TYPE.FIXED ? `Settle Loan` : `Settle And Close`}"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					${this._renderInformation()}
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderInformation() {
		return html`
			<capitec-content-box>
				<p>If you settle ${this.creditType === CREDIT_TYPE.FIXED ? `` : `and close`} your ${this.productType}, the balance will be zero and the account will be close. You will not be able to transact on this account in the future. </p>
				<p>If you wish to have this facility again, you will have to reapply subject to a credit assessment and terms and conditions.</p>
				<p>Do you want to continue with settling and closing the credit card?</p>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button 
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>

				<capitec-button 
					type="primary"
					label="Continue"
					@click="${() => this._continueClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}

}
window.customElements.define(`horizon-settle-n-close-dialog`, SettleAndClose);