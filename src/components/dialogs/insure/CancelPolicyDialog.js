import { Component, css, html } from 'platform/elements';
import { formatDate } from '../../../utils/channelServiceUtilities';

// Lookups
import { CANCELATION_REASONS } from 'app/constants/InsureCommon';

/**
 * cancel policy dialog 
 * 
 * Events Raised 
 * -------------
 * close-modal
 * agree
 *  
 * @export
 * @class CancelPolicyDialog
 * @extends {Component}
 */
class CancelPolicyDialog extends Component {

	//#region INITIALIZE

	constructor() {
		super();

		this.cancelationReasons = CANCELATION_REASONS;
		this.selected = false;
		this.checked = false;
		this.cancelReason = '';
	}

	//#endregion

	//#region PROPERTIES

	 static get properties() {
		return {
			selected: {type: Boolean, state: true},
			checked: {type: Boolean, state: true}
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

	/**
	 * agree event from dialog footer button, closes modal and navigates to cancel policy success page
	 */
	_onAgreeClick() {
		this.dispatchEvent(new CustomEvent(`agree`, {detail: {cancelationReason: this.cancelReason }}));
	}

	/**
	 * Event to to change the value of selected once an option has been chosen from the cancelation select box and also to cancelReason with the reason chosen
	 */
	_valueSelected(e){
		this.selected = true;

		this.cancelReason = e.detail.new.text;


	}
/**
 * Event to determine whether the checkbox has been checked or not
 * 
 * @param {*} e 
 */
	_CheckBox(e){
		if (e.detail.new == true){
			this.checked = true;
		} else {
			this.checked = false;
		}

	}

	/**
	 * Event that returns the following day's date
	 * 
	 * @returns 
	 */
	_getDate(){
		const today = new Date()
		const tomorrow = new Date(today)
		tomorrow.setDate(tomorrow.getDate() + 1)

		return tomorrow;
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
				}

				.notification {
					margin-bottom: 30px;
				}

				.expander{
					margin-bottom: 20px;
					margin-top: 20px;
				}

				.select{
					margin-bottom: 20px;
					width: 60%;
				}

				.button {
					width: 140px;
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
			<capitec-modal type="form" header="Cancel Funeral Cover Plan (CF00027650)">
				<div slot="body" data-automation-id="insure-cancel-policy-dialog-body">
					${this._renderDialogBody()}
				</div>
				<div slot="footer" data-automation-id="insure-cancel-policy-dialog-footer">
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
					will be emailed to you and available in branch." data-automation-id="insure-cancel-policy-dialog-notification">
				</capitec-toast>
			</div>

			<div class="select" data-automation-id="insure-cancel-policy-dialog-cancelation-reason">
				<capitec-select 
					label="Cancellation Reason" 
					.items= "${this.cancelationReasons}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._valueSelected(e)}">
				</capitec-select>
			</div>

			<div>
				<capitec-label type="subtitle" label=" By requesting the cancellation of the policy, you acknowledge and confirm that:"></capitec-label>
				<ul>
				<li>The policy has been cancelled with the effective date from ${formatDate(this._getDate(), 'dd mmm yyyy')}.</li>
				<li>All the policy benefits have been ceased and you no longer benefit from them.</li>
				<li>Should any premiums be received on this policy, after the date of this instruction, it will be refunded to you.</li>
				</ul>
			</div>

			<div class="expander">
				<capitec-expander expandbuttonalignment="left" label="View Cancelation Agreement" data-automation-id="insure-cancel-policy-dialog-view-policy-schedule">
					<capitec-label label=""></capitec-label>
				</capitec-expander>
			</div>

			<div>
				<capitec-check label="Please confirm that you agree to these terms and conditions and that you are bound by them." 
					@value-change="${(e) => this._CheckBox(e)}">
				</capitec-check>
			</div>


		`}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				<capitec-button class="button" slot="footer" type="secondary" label="Cancel"
					@click="${() => this._onCancelClick()}"
					data-automation-id="insure-cancel-policy-dialog-cancel">
				</capitec-button>
				<capitec-button class="button" slot="footer" type="primary" label="Agree"
					@click="${() => this._onAgreeClick()}"
					data-automation-id="insure-cancel-policy-dialog-agree"
					.disabled="${this.selected == false || this.checked == false}">
				</capitec-button>
		`}

	//#endregion


}

window.customElements.define(`insure-cancel-policy-dialog`, CancelPolicyDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @close-modal="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send agree event to the consuming componant when 'agree is clicked' is clicked
 *
 * @example
 * <insure-cancel-policy-dialog ... @agree="${this._handler}"></insure-cancel-policy-dialog>
 *
 * @event CancelPolicyDialog#agree
 * @type {Object} - N/A
 */