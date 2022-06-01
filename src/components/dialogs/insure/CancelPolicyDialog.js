import { Component, css, html } from 'platform/elements';

// Lookups
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';


class CancelPolicyDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.cancelationReasons = CANCELATION_REASONS;
	}

	//#endregion

	//#region PROPERTIES

	 static get properties() {
		return {
			
		};
	}

	//#endregion

	//#region PRIVATE METHODS

	//#endregion

	//#region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 */
	 _onCancelClick() {
		this.dispatchEvent(new CustomEvent(`close-modal`, {}));
	}

	_onEmailClick() {
		this.dispatchEvent(new CustomEvent(`email-plan`, {}));
	}

	_onAgreeClick() {
		this.dispatchEvent(new CustomEvent(`agree`, {}));
	}

	//#endregion

	//#region RENDERING

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

				.notification > capitec-toast{
					--theme-toast-height: 80px;
					position: relative;
					top: var(--theme-toast-close-top, 10px);
				}

				.notification {
					margin-bottom: 30px;
				}

				.expander{
					margin-bottom: 20px;
					/*border: 1px solid #e1e1e1;
					border-radius: 5px;*/
				}

				.select{
					margin-bottom: 20px;
					width: 60%;
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
			<capitec-modal type="form" header="Cancel Funeral Cover Plan ()">
				<div slot="body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>
		`}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderDialogBody() {
		return html`
			<div class="notification">
				<capitec-toast type="info" header="Notify Client" 
					detail="The full agreement, inclusive of the Policy Schedule, Section 484 summary. Disclosure, terms and conditions,
					will be emailed to you and available in branch." closable>
				</capitec-toast>
			</div>

			<div class="select">
				<capitec-select 
					label="Cancelation Reason" 
					.items= "${this.cancelationReasons}"
					display-field="text"
					id-field="code">
				</capitec-select>
			</div>

			<capitec-expander-group modeset="single">
				<div class="expander">
					<capitec-expander expandbuttonalignment="left" label="View Policy Schedule">
						<capitec-label label=""></capitec-label>
					</capitec-expander>
				</div>

				<div>
					<capitec-expander expandbuttonalignment="left" label="View Mandate">
						<capitec-check label="Please confirm that you agree to these terms and conditions and that you are bound by them?"></capitec-check>
					</capitec-expander>
				</div>
			 </capitec-expander-group>

		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button slot="footer" type="secondary" label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>
				<capitec-button slot="footer" type="secondary" label="Email"
					@click="${() => this._onEmailClick()}">
				</capitec-button>
				<capitec-button slot="footer" type="primary" label="Agree"
					@click="${() => this._onAgreeClick()}"></capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-cancel-policy-dialog`, CancelPolicyDialog);