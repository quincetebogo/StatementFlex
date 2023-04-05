import { Component, css, html } from 'platform/elements';
import { CREDIT_TYPE } from 'app/constants/Credit';

/**
 * A warning dialog that prompts the agent to inform they're settling and closing the selected account.
 *
 * @export
 * @class SettleAndCloseDisclaimerDialog
 * @extends {Component}
 */

export class SettleAndCloseDisclaimerDialog extends Component {

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
		this.dispatchEvent(new CustomEvent(`continue`));
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

				capitec-label[type="subtitle"] {
					padding-left: 8px;
					height: 24px;
					width: auto;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					line-height: 24px;
				}

				capitec-content-box {
					width: 495px;
					height: 300px;
					border-bottom: 1px solid #E1E1E1;
				}

				capitec-content-box > capitec-label {
					width: auto;
					margin: 0px 0px 15px 0px;

					--theme-label-default-font-size: 16px;
				}

				capitec-content-box > capitec-label:last-child {
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
				${this.creditType === CREDIT_TYPE.FIXED ? this._renderFixedInformation() : this._renderInformation()}
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
				<capitec-label label="If you settle ${this.creditType === CREDIT_TYPE.FIXED ? `` : `and close `}your ${this.productType.toLowerCase()}, the balance will be zero and the account will be closed. You will not be able to transact on this account in the future."></capitec-label>
				<capitec-label label="If you wish to have this facility again, you will have to reapply subject to a credit assessment and terms and conditions."></capitec-label>
				<capitec-label label="Do you want to continue with settling and closing the ${this.productType.toLowerCase()}?"></capitec-label>
			</capitec-content-box>
		`;
	}
	_renderFixedInformation()
	{
		return html`
			<capitec-content-box>
				<capitec-label label="If you settle your ${this.productType.toLowerCase()}, the balance will be zero and the term loan will be closed. You will not be able to use the same term loan again."></capitec-label>
				<capitec-label label="If you wish to have another fixed term loan again, you will have to reapply subject to a credit assessment and terms and conditions."></capitec-label>
				<capitec-label label="Do you want to continue with settling and closing the ${this.productType.toLowerCase()}?"></capitec-label>
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
window.customElements.define(`horizon-settle-n-close-disclaimer`, SettleAndCloseDisclaimerDialog);