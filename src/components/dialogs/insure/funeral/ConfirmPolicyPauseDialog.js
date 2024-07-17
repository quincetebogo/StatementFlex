
import { Component, css, html } from 'platform/elements';
import { formatDateToInsure } from 'app/utils/insureUtils';
import { FUN_BENEFIT_TYPES } from 'app/constants/InsureCommon';

/**
 * Dialog that will display VPP confirmation
 * 
 * Events Raised 
 * -------------
 * agreementAccepted
 * close-modal
 *  
 * @export
 * @class PCAAgreementDialog
 * @extends {Component}
 */
export class ConfirmPolicyPauseDialog extends Component {

	
	// #region INITIALIZE

	constructor() {
		super();

		this.policy = {};
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} policy - contains selected policy information
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			policyPauseInfo: { type: Object, state: true }
			
		};
	}

	// #endregion PROPERTIES

	// #region EVENT HANDLERS

	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	async _confirmAndClose() {
			const resp = await this.activatePause(FUN_BENEFIT_TYPES.POLICY_PAUSE, this.policy)

			if (resp.successful) {
				this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: `Your Policy Pause benefit has been successfully Activated` } }));
			}
		}

	/**
	 * Cancel and close modal 
	 * @returns {void} 
	*/
	_cancelDialog() {
		this.dispatchEvent(new CustomEvent(`close-modal`, { detail: { successMessage: `` } }));
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

		`
		];
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Activate Voluntary Policy Pause" style="--theme-modal-header-color: black;">
			<div slot="body">
				<!-- <capitec-content-box class="body-box"> -->
					${this._renderDialogBody()}
				<!-- </capitec-content-box> -->
			</div>
			<div slot="footer">
				${this._renderDialogFooter()}
			</div>
			
		</capitec-modal>`;
	}

	/**
	 * Render Agreement html of the dialog
	 * @returns {html} Agreement Copy
	 */
	_renderDialogBody() {
		return html`
			
			<ul>
				<li>Your Voluntary policy pause benefit will be <b>activated</b> from <b>${formatDateToInsure(this.policyPauseInfo.benefitStartDate)}</b> and will expire on <b>${formatDateToInsure(this.policyPauseInfo.benefitEndDate)}</b>.</li>
				<li>Your next collection date will be <b>${formatDateToInsure(this.policyPauseInfo.nextCollectionDate)}</b>.</li>
			</ul>
			`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelDialog()}">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Confirm" @click="${() => this._confirmAndClose()}">
			</capitec-button>`;
	}

	// #endregion RENDERING
}
window.customElements.define(`horizon-insure-confirm-policy-pause-dialog`, ConfirmPolicyPauseDialog);

/**
 * send close modal event to the consuming componant when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-confirm-policy-pause-dialog ... @close-modal="${this._handler}"></horizon-insure-confirm-policy-pause-dialog>
 *
 * @event ConfirmPolicyPauseDialog#close-modal
 * @type {Object} - N/A
 */

/**
 * send confirm event to the consuming componant when confirm is clicked
 *
 * @example
 * <horizon-insure-confirm-policy-pause-dialog ... @agreementAccepted="${this._handler}"></horizon-insure-confirm-policy-pause-dialog>
 *
 * @event ConfirmPolicyPauseDialog#agreementAccepted
 * @type {Object} - N/A
 */