import { Component, css, html } from 'platform/elements';
import { formatDate } from '../../../utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { dateFormat} from 'app/utils/insureUtils'

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
		this.contractReference = '';
		this.cancelPolicyDocumentDetails = {};
	}

	//#endregion

	//#region PROPERTIES

	/**
	 * @property {Boolean} selected determines if a cancellation reason has been chosen
	 * @property {Boolean} checked determines if terms and conditions have been agreed to 
	 * @property {String} contractReference contains the contract reference
	 * @property {String} cancelReason contains the chosen cancellation reason
	 * @property {Function} getCancelPolicyDocument Callback function to fetch Cancel Policy Agreement
	 * @property {Object} cancelPolicyDocumentDetails contains the cancel policy agreement document details
	 * 
	 */
	 static get properties() {
		return {
			selected: {type: Boolean, state: true},
			checked: {type: Boolean, state: true},
			contractReference: {type: String, state: true},
			cancelReason: {type: String, state: true},
			getCancelPolicyDocument: {type: Object, state: true},
			cancelPolicyDocumentDetails: {type: Object, state: true},
		};
	}

	//#endregion

	//#region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	 async connectedCallback() {
		super.connectedCallback();
		this._initialize();

	 }

	 //#endregion


	//#region PRIVATE METHODS
	
	async _initialize(){
		
	}

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
		this.dispatchEvent(new CustomEvent(`agree`, {detail: {cancellationReason: this.cancelReason }}));
	}

	/**
	 * Event to to change the value of selected once an option has been chosen from the cancelation select box and also to cancelReason with the reason chosen
	 */
	_valueSelected(e){
		this.selected = true;

		this.cancelReason = e.detail.new.code;

		this._getCancelAgreement(this.cancelReason)

		this.requestUpdate();
	}

	async _getCancelAgreement(cancelReason){
		await this.getCancelPolicyDocument(this.contractReference, cancelReason);
	}

/**
 * Event to determine whether the checkbox has been checked or not
 * 
 * @param {Boolean} e 
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
				
				${ INSURE_CSS }

				.notification > capitec-toast{
					--theme-toast-height: 110px;
					position: relative;
					--theme-toast-max-width: 100%;
				}

				.notification {
					margin-bottom: 30px;
					padding: 0px;
				}

				.no-padding{
					padding: 0px;
					height: 100%;
				}

				.select{
					margin-bottom: 20px;
					width: 60%;
				}

				.button {
					width: 140px;
				}

				capitec-expander {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					margin-bottom: 20px;
				}
				capitec-expander[expanded] {
					border-bottom: var(--theme-expander-border, 1px solid black);
				}

				capitec-expander > capitec-content-box {
					padding: 0 !important;
				}
				.cancel-policy-modal{
					--theme-modal-alert-m-l-xl-width: 840px;
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
			<capitec-modal type="alert" class="cancel-policy-modal" header="Cancel Funeral Cover Plan (${this.contractReference})">
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
			<capitec-content-box class="notification">
				<capitec-toast type="info" header="Notify Client" 
					detail="The full agreement, inclusive of the Policy Schedule, Section 484 summary. Disclosure, terms and conditions, will be emailed to you and available in branch."
					data-automation-id="insure-cancel-policy-dialog-notification">
				</capitec-toast>
			</capitec-content-box>

			<div class="select" data-automation-id="insure-cancel-policy-dialog-cancelation-reason">
				<capitec-select 
					label="Cancellation Reason" 
					.items= "${this.cancelationReasons}"
					display-field="text"
					id-field="code"
					@value-change = "${(e) => this._valueSelected(e)}">
				</capitec-select>
			</div>

			<capitec-content-box class="no-padding">
				<capitec-label type="subtitle" label=" By requesting the cancellation of the policy, you acknowledge and confirm that:"></capitec-label>
				<ul>
				<li>The policy has been cancelled with the effective date from ${dateFormat(this._getDate())}.</li>
				<li>All the policy benefits have been ceased and you no longer benefit from them.</li>
				<li>Should any premiums be received on this policy, after the date of this instruction, it will be refunded to you.</li>
				</ul>
			</capitec-content-box>

			<capitec-content-box class="no-padding">
				<capitec-expander expandbuttonalignment="left" label="View Cancellation Agreement" class="pdf-viewer"
					data-automation-id="insure-cancel-policy-dialog-view-cancellation-agreement">
					<iframe title="CancelPolicyAgreement" height = "100%" frameborder = "0"
						src="data:application/pdf;base64,${ this.cancelPolicyDocumentDetails?.documentContent }#view=fitH">
					</iframe>
				</capitec-expander>
			</capitec-content-box>

			<capitec-content-box class="no-padding">
				<capitec-check label="Please confirm that you agree to these terms and conditions and that you are bound by them." 
					@value-change="${(e) => this._CheckBox(e)}">
				</capitec-check>
			</capitec-content-box>


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