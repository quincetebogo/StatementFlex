import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';


/**
 * Pay Premium Confirmation Dialog componant will allow you to confirm whether you would like to pay the required amount or not
 * 
 * Events Raised 
 * -------------
 * close-modal
 * confirm-payment
 *  
 * @export
 * @class PayPremiumAgreementDialog
 * @extends {Component}
 */
class lifeIncreaseCoverUnavailableDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.unavailableMessage = ``;

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} unavailableMessage Total arrears amount to be paid
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {

			unavailableMessage: { type: String, state: true }
			
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * comfirm event from the dialog footer button
	 * @returns {void}
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	 static get styles() {
		return [
			super.styles,
			css`
				${INSURE_CSS}

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
					left: -352px;
					top: -15px;
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

				div[slot="body"] {
					width: 376px;
					height: 90px;
				}

				.body-box {
					height: 90px;
					--theme-container-padding-top: 16px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-left: 17px;
					--theme-container-padding-right: 16px;
				}

				.header-text {
					padding-left: 16px;
					height: 24px;
					width: auto;
					color: #000000;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}


				capitec-icon {
					font-size: 27px;
					width: 20.31px;
					margin-right: 0px;
				}

				capitec-button {
					height: 48px;
					border-radius: 5px;
					--theme-button-height: 20px;
					--theme-button-width: 41px;
					--theme-button-color: #FFFFFF;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-letter-spacing: 0;
					--theme-button-line-height: 20px;
					--theme-button-text-align: center;
					--theme-button-padding-top: 14px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 14px;
					--theme-button-padding-left: 22px;
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
							<capitec-label class="header-text" label="Increase Cover Unavailable"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderDialogBody()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogBody() {
		return html`
			<div>
				<capitec-label label="${this.unavailableMessage}"></capitec-label>
			</div>

		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="primary" label="Confirm" class="capitec-button-small"
					@click="${() => this._confirmClick()}">
				</capitec-button>
		`;
	}

	// #endregion RENDERING
 

}

window.customElements.define(`horizon-insure-life-increase-cover-unavailable-dialog`, lifeIncreaseCoverUnavailableDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-confirmation-dialog ... @close-modal="${this._handler}"></horizon-insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#close-modal
 * @type {Object} - N/A
 */

 /**
 * Send Confirm Payment dialog event to consuming componant when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-pay-premium-confirmation-dialog ... @confirm-payment="${this._handler}"></horizon-insure-pay-premium-confirmation-dialog>
 *
 * @event PayPremiumConfirmationDialog#confirm-payment
 * @type {Object} - N/A
 */