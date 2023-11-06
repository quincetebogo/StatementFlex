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

		this.firstNameError = ``;
		this.cellphoneError = ``;
		
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} firstNameError - first name error message
	 * @property {String} cellphoneError - cellphone number error message
	 * @property {String} firstName - First name of person to call back
	 * @property {String} lastName - last name of person to call back
	 * @property {String} lastNameError - last name error messages
	 * @property {String} cellphoneNumber - cellphone number of person to call back
	 * @property {Function} requestCallback - callback function to request a callback
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			firstNameError: { type: String, state: true },
			cellphoneError: { type: String, state: true },
			firstName: { type: String, state: true },
			cellphoneNumber: { type: String, state: true },
			requestCallback: { type: Object, state: true },
			lastName: { type: String, state: true },
			lastNameError: { type: String, state: true }

		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}


	// #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * dispatch confirmation click event
	 * @returns {void}
	 */
	async _requestCallbackClick() {

		const isValid = this._validate();
		if (isValid === true) {
			await this.requestCallback(this.firstName, this.lastName, this.cellphoneNumber);
		}
		
	}

	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel-click`, {}));
	}

	_cellphoneChange(e) {
		if (e.detail.old !== e.detail.new) {
			if (e.detail.new.length === 10) {
				this.cellphoneError = ``;
				this.cellphoneNumber = e.detail.new;
			} else {
				this.cellphoneError = `Cellphone number invalid`;
			}
		}
		this.requestUpdate();
		}

	_firstNameChange(e) {

		if (e.detail.old !== e.detail.new) {
			if (isNullorEmpty(e.detail.new)) {
				this.firstNameError = `First name invalid`;
			} else {
				this.firstNameError = ``;
				this.firstName = e.detail.new;
			}
		}
		this.requestUpdate();
	}

	_lastNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			if (isNullorEmpty(e.detail.new)) {
				this.lastNameError = `Last name invalid`;
			} else {
				this.lastNameError = ``;
				this.lastName = e.detail.new;
			}
		}
		this.requestUpdate();
	}

	_validate() {

		let isValid = true;

		if (isNullorEmpty(this.firstName)) {
			this.firstNameError = `First name invalid`;
			isValid = false;
		}

		if (isNullorEmpty(this.lastName)) {
			this.lastNameError = `Last name invalid`;
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
			<capitec-modal header = "Request a callback" style="--theme-modal-alert-m-l-xl-width: 500px; --theme-modal-header-color: black;"> 
				<div slot="body" data-automation-id="horizon-insure-update-validation-dialog-body">
				<capitec-content-box style="padding: 0px">
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
				<strong>Funeral support (incl. transportation of the deceased)</strong>
				
				<p>You can request funeral support, for transportation of the deceased, by calling 0860 77 75 54, or we can log a request for the service provider to contact you.</p>
				<p>The place of death must be at least 50 kilometres from the place of burial. <br>
				To log a request for the service provider to contact you, please provide the following information:</p>

			</div>

			<div>
				<capitec-text-field label="First name" @value-change="${(e) => this._firstNameChange(e)}"
					error="${this.firstNameError === undefined ? `` : this.firstNameError}">
				</capitec-text-field>
			</div>

			<div>
				<capitec-text-field label="Last name" @value-change="${(e) => this._lastNameChange(e)}"
					error="${this.lastNameError === undefined ? `` : this.lastNameError}">
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