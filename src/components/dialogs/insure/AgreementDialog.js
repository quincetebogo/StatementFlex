import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Agreement Dialog componant will allow you to view the agreement 
 * 
 * 
 * Events Raised 
 * -------------
 * close-modal
 *  
 * @export
 * @class AgreementDialog
 * @extends {Component}
 */
class AgreementDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.agreementContent = ``;

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} agreementContent doc content for the plan agreement
	 */
	static get properties() {
		return {
			agreementContent: { type: String, state: true },
		};
	}

	// #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	_initialise() {
		
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * back event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_backClick() {
		this.dispatchEvent(new CustomEvent(`back-click`, {}));
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

				.notification > capitec-toast{
					--theme-toast-height: 80px;
					position: relative;
				}
				.notification {
					margin-bottom: 30px;
				}
				.left-padding-0{
					padding-left: 0px;
				}
				.expander{
					margin-bottom: 20px;
				}
				.select{
					margin-bottom: 20px;
					width: 60%;
				}
				capitec-expander {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					margin-bottom: 20px;
				}
				capitec-expander[expanded] {
					border-bottom: var(--theme-expander-border, 1px solid black);
				}
				.full-length-banner > capitec-toast{
					width: 100%;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
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
			<capitec-modal type="form" header="View Agreement" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body" data-automation-id="horizon-insure-agreement-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="horizon-insure-agreement-dialog-footer">
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
			<capitec-content-box style="height: 700px; width: 800px;">
				<iframe title="Agreement" height = "100%" frameborder = "0"
					src="data:application/pdf;base64,${this.agreementContent}#view=fitH">
				</iframe>
			</capitec-content-box>

		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="capitec-button-medium" slot="footer" type="primary" label="Back" @click="${() => this._backClick()}"
					data-automation-id="horizon-insure-agreement-dialog-back">
				</capitec-button>
		`;
	}

	// #endregion RENDERING


}

window.customElements.define(`horizon-insure-agreement-dialog`, AgreementDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-agreement-dialog>
 *
 * @event AgreementDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-update-plan-agreement-dialog ... @update-plan-agree-click="${this._handler}"></horizon-insure-update-plan-agreement-dialog>
 *
 * @event UpdatePlanAgreementDialog#agree
 * @type {Object} - N/A
 */