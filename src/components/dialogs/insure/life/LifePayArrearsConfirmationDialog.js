import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * Life pay arrears confirmation dialog
 * 
 * Events Raised 
 * -------------
 * close-dialog
 *  
 * @export
 * @class LifePayArrearsConfirmationDialog
 * @extends {Component}
 */
class LifePayArrearsConfirmationDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			contractReference: { type: String, state: true },
			amountToPay: { type: Number, state: true },
			accountToPayFrom: { type: String, state: true }
		};
	}

	//  #endregion PROPERTIES

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes dialog
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { processPayment: false } }));
	}

	/**
	 * Confirm event from dialog footer button, closes dialog, process payment
	 * @returns {void} 
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { processPayment: true } }));
	}

	//  #endregion EVENT HANDLERS

	//  #region RENDERING

	/**
	 * Generates the component stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			capitec-modal {
				height: 326px;
				width: 375;
				border-radius: 5px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-header-background-color: #F9EBDD;
				--theme-modal-footer-padding: 0px 16px 17px 0px;
			}

			div[slot="header"] {
				width: 375px;
				--theme-modal-header-height: 64px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -335px;
				top: -14px;
			}

			div[slot="header"] > span {
				height: 24px;
				width: 300px;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 15px;
			}

			.header-text{
				font-weight: bold;
				font-size: 16px;
				margin-top: 2px;
			}
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="medium" icon="status/warning-trans" style="height: 28px; width: 26px;"></capitec-icon>
							<capitec-label class="header-text" label="Confirm payment"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body" style="width: 360px; padding: 20px;">
					<capitec-label label="Confirm that you want to pay ${formatCurrency(this.amountToPay)} to Life Plan ${this.contractReference}, from account ${this.accountToPayFrom}. Do you wish to continue?" type="subtitle"></capitec-label>
				</div>
				<div slot="footer">
					<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
					</capitec-button>
					<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this._confirmClick()}">
					</capitec-button>
				</div>
			</capitec-modal>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-pay-arrears-confirmation-dialog`, LifePayArrearsConfirmationDialog);

/**
 * Send close dialog event to the consuming component, also send 'processPayment' flag containing confirmation result
 *
 * @example
 * <horizon-insure-life-pay-arrears-confirmation-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-pay-arrears-confirmation-dialog>
 *
 * @event LifePayArrearsConfirmationDialog#close-dialog
 * @type {Object} - N/A
 */