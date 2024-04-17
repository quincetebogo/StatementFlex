import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * @export
 * @class LifeBeneficiariesAllocateError
 * @extends {Component}
 */
class LifeBeneficiariesAllocateError extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.invalidPockets = [];
	}

	static get properties() {
		return {
			invalidPockets: { type: Array, state: true }
		};
	}

	// #endregion INITIALIZE

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	/**
	 * Clean up the component once removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Confirm event from dialog footer button, fire delete beneficiary event
	 * @returns {void} 
	 */
	_confirmClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`));
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
					height: 426px;
					width: 375;
					border-radius: 5px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 10px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-footer-padding: 0px 16px 17px 0px;
				}

				div[slot="header"] {
					width: 375px;
					--theme-modal-header-height: 64px;
					position: absolute;
					display: flex;
					align-items: center;
					left: -370px;
					top: -13px;
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
				}

				div[slot="body"] {
					width: 420px;
					min-height: 95px;
				}

				.body-box {
					height: 150px;
				}

				.header-text {
					padding-left: 0px;
					height: 24px;
					width: auto;
					color: #000000;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 28px;
				}

				capitec-icon {
					font-size: 23px;
					width: 20.31px;
					margin-right: 0px;
				}

				#dialog-footer{
					display: flex;
					justify-content: end;
					gap: 10px;
				}
				
				.dialog-copy{
					margin: 0px;
					margin-bottom: 10px;
				}`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-modal type="free"  header-align="left"  style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="medium" icon="status/warning-trans" style="height: 28px; width: 26px;"></capitec-icon>
							<capitec-label class="header-text" label="Allocation mismatch"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body" id="dialog-body">
					<capitec-content-box gap="0px">
						<p>The full cover amounts for all benefit payout options utilized, must be fully allocated to nominated people. Please check below tabs.</p>
						${this.invalidPockets.map((pocket) => html`
							<div><b>${pocket}</b></div>
						`)}
					</capitec-content-box>
				</div>
				<div slot="footer" style="display: flex; flex-direction: column">
					<hr>
					<div id="dialog-footer">
						${this._renderDialogFooter()}
					</div>
				</div>
			</capitec-modal>
		`;
	}

	/**
	 * Render modal footer section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<div style="display: flex; justify-content: end">
				<capitec-button type="primary" label="Done" @click="${() => this._confirmClick()}"></capitec-button>
			</div>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-beneficiaries-allocate-error-dialog`, LifeBeneficiariesAllocateError);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-beneficiaries-allocate-error-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-beneficiaries-allocate-error-dialog>
 *
 * @event LifeBeneficiariesAllocateError#close-dialog
 * @type {Object} - N/A
 */