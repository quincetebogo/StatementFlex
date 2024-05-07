import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * @export
 * @class LifeHonestyPledgeDialog
 * @extends {Component}
 */
class LifeHonestyPledgeDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
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
	 * @param {boolean} continueToFlow - true if user confirms continue, false if user cancels
	 * @returns {void} 
	 */
	_continueClick(continueToFlow) {
		if (!continueToFlow) {
			this.dispatchEvent(new CustomEvent(`close-modal`));
			return;
		}
		this.dispatchEvent(new CustomEvent(`continue`));
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
					height: 170px;
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
							<!-- <capitec-icon size="medium" icon="status/warning-trans" style="height: 28px; width: 26px;"></capitec-icon> -->
							<capitec-label class="header-text" label="Personal Questions"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body" id="dialog-body">
					${this._renderDialogBody()}
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
	 * Render modal body section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<capitec-content-box gap="0px" >
				<p class="dialog-copy">
					It's important that you answer the following questions honestly and to the best of your ability.</p><p>If you give the <b>wrong information</b> your claim may not be paid, or your policy may be cancelled.
				</p>
			</capitec-content-box>
		`;
	}

	/**
	 * Render modal footer section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button type="secondary" label="Cancel" @click="${() => this._continueClick(false)}"></capitec-button>
			<capitec-button type="primary" label="Confirm" @click="${() => this._continueClick(true)}"></capitec-button>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-honesty-pledge-dialog`, LifeHonestyPledgeDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-honesty-pledge-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-honesty-pledge-dialog>
 *
 * @event LifeHonestyPledgeDialog#close-modal
 * @type {Object} - N/A
 */