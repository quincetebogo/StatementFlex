
import { Component, css, html } from 'platform/elements';
import { formatDateToInsure } from 'app/utils/insureUtils'
import { FUN_CLIENT_SUMMARY_BENEFIT_TYPES } from 'app/constants/InsureCommon';

/**
 * Dialog that will display the Bene Agreement
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 * 
 *  
 * @export
 * @class BeneAgreementDialog
 * @extends {Component}
 */
export class BenefitUnavailableDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.policyItem = {};
		this.availableDate = "";
	}

	// #endregion INITIALIZE

	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	_initialise() {
		let vppBenefit = this.policyItem.benefits?.find((benefit) => benefit.type === FUN_CLIENT_SUMMARY_BENEFIT_TYPES.POLICY_PAUSE);
		this.availableDate = vppBenefit?.availableDate;

	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS


	/**
	 * Cancel dialog 
	 * @returns {void} 
	*/
	_cancelDialog() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: {} }));
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

			capitec-modal {
				--theme-modal-header-background-color: #f7f7f7;
			}

			.selectable-text {
				user-select: text !important;
			}

		`
		];
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="alert" class="selectable-text" header="Benefit unavailable" style="--theme-modal-header-color: black; --theme-modal-alert-m-l-xl-width: 415px;">
			<div slot="body">
				<capitec-content-box class="body-box selectable-text">
					${this._renderDialogBody()}
				</capitec-content-box>
			</div>
			${this._renderDialogFooter()}
		</capitec-modal>`;
	}

	/**
	 * Render Agreement html of the dialog
	 * @returns {html} Agreement Copy
	 */
	_renderDialogBody() {
		return html`
		<capitec-label type="subtitle" label="Benefit not available on this selected policy."></capitec-label>
		<capitec-label type="subtitle" label="This benefit will be available from ${formatDateToInsure(this.availableDate)}"></capitec-label>
		`;

	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this._cancelDialog()}">
			</capitec-button>
		`;
	}

	// #endregion RENDERING

}
window.customElements.define(`horizon-insure-benefit-unavailable-dialog`, BenefitUnavailableDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-bene-agreement-dialog ... @close-modal="${this._handler}"></horizon-insure-bene-agreement-dialog>
 *
 * @event BenefitUnavailableDialog#close-modal
 * @type {Object} - N/A
 */


/**
 * Send agree dialog event to consuming componant when 'Agree' is clicked
 *
 * @example
 * <horizon-insure-bene-agreement-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-bene-agreement-dialog>
 *
 * @event BenefitUnavailableDialog#agreementAccepted
 * @type {Object} - N/A
 */