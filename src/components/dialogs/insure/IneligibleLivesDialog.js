import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Update Validation Dialog component will allow you to confirm
 * 
 * Events Raised 
 * -------------
 * confirm
 *  
 * @export
 * @class InsureConfirmationDialog
 * @extends {Component}
 */
class IneligibleLivesDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		// this.ineligibleRoleplayers = {};
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} body - confirmation message
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			ineligibleRoleplayers: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	_generateMessage() {


		return html`
			<p>The following family members will be removed from this policy because they do not match the entry age criteria:</p>

			<ul>
				${this.ineligibleRoleplayers.map(lives => html`
				<li>${lives.firstName} ${lives.surname} (${lives.relationship})</li>
				`)}
			</ul>
		`;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	_confirmationClick() {
		this.dispatchEvent(new CustomEvent(`confirmation-click`, {}));
	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel-click`, {}));
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
			<capitec-modal type="free" header = "Ineligible roleplayers" style="--theme-modal-header-color: black"> 
				<div slot="body" data-automation-id="">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="">
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
		<capitec-content-box>
			${this._generateMessage()}
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

			<capitec-button slot="footer" type="secondary" label="Cancel" class="capitec-button-medium"
				@click="${() => this._cancelClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>

			<capitec-button slot="footer" type="primary" label="Ok" class="capitec-button-medium"
				@click="${() => this._confirmationClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-ineligible-lives-dialog`, IneligibleLivesDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-ineligible-lives-dialog ... @confirmation-click="${this._onConfirmationClick}"></horizon-insure-ineligible-lives-dialog>
 *
 * @event InsureUpdateValidationDialog#confirm
 * @type {Object} - N/A
 */