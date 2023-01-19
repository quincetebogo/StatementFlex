import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from '../../../utils/channelServiceUtilities';

/**
 * 
 * 
 * Events Raised 
 * -------------
 * confirmation-click
 *  
 * @export
 * @class RequestCallback
 * @extends {Component}
 */
class RequestCallbackDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.nameError = ``;
		this.cellphoneError = ``;
		
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} validationMessage - validation message
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			nameError: { type: String, state: true },
			cellphoneError: { type: String, state: true },
			name: { type: String, state: true },
			cellphoneNumber: { type: String, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	_requestCallbackClick() {

		const isValid = this._validate();

		if (isValid === true) {
			this.dispatchEvent(new CustomEvent(`request-callback-click`, { detail: { name: this.name, cellphoneNumber: this.cellphoneNumber } }));
		}
		
	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel-click`, {}));
	}

	_cellphoneChange(e) {

		if (e.detail.old !== e.detail.new) {
			if (e.detail.new.length === 10) {
				this.cellphoneError = ``;
			}
				this.cellphoneNumber = e.detail.new;
			}
		this.requestUpdate();
		}

	_nameChange(e) {

		if (e.detail.old !== e.detail.new) {
			if (isNullorEmpty(e.detail.new)) {
				this.nameError = `Name invalid`;
			} else {
				this.nameError = ``;
				this.name = e.detail.new;
			}
		}
		this.requestUpdate();
	}

	_validate() {

		let isValid = true;

		if (isNullorEmpty(this.name)) {
			this.nameError = `Name invalid`;
			isValid = false;
		}

		if (isNullorEmpty(this.cellphoneNumber) || this.cellphoneNumber.length !== 10) {
			this.cellphoneError = `Cellphone number invalid`;
			isValid = false;
		}

		return isValid;
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
			`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	 _webTemplate() {
		return html`
			<capitec-modal type="free" header = "Request a callback"> 
				<div slot="body" data-automation-id="horizon-insure-update-validation-dialog-body">
				<capitec-content-box class="body-box">
					${this._renderDialogBody()}
				</capitec-content-box>
				</div>
				<div slot="footer" data-automation-id="horizon-insure-update-validation-dialog-footer">
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
			<div style="padding-bottom: 10px;">
				<p><strong>Funeral support (incl. transportation of the deceased)</strong></p>
				
				You can request funeral support, for transportation of the deceased, by calling 0860 77 75 54, or we can log a request <br>
				for the service provider to contact you. The place of death must be at least 50 kilometres from the place of burial. <br>
				To log a request for the service provider to contact you, please provide the following information:

			</div>

			<div>
				<capitec-text-field label="Name" @value-change="${(e) => this._nameChange(e)}"
					error="${this.nameError === undefined ? `` : this.nameError}">
				</capitec-text-field>
			</div>

			<div>
				<capitec-text-field label="Cellphone number" type="numeric" maxlength="10" @value-change="${(e) => this._cellphoneChange(e)}"
				error="${this.cellphoneError === undefined ? `` : this.cellphoneError}">
				</capitec-text-field>
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
			<capitec-button slot="footer" type="" label="Cancel" class="capitec-button-small"
				@click="${() => this._cancelClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Request callback" class="capitec-button-large"
				@click="${() => this._requestCallbackClick()}"
				data-automation-id="horizon-insure-confirmation-dialog-confirm">
			</capitec-button>
			
		`;
	}

	// #endregion RENDERING

}

window.customElements.define(`horizon-insure-request-callback-dialog`, RequestCallbackDialog);

 /**
 * Send Confirmation dialog event to consuming component when 'Confirm' is clicked
 *
 * @example
 * <horizon-insure-update-validation-dialog ... @confirmation-click="${this._confirmationClick}"></horizon-insure-update-validation-dialog>
 *
 * @event InsureUpdateValidationDialog#confirm
 * @type {Object} - N/A
 */