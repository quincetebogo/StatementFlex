import { Component, css, html } from 'platform/elements';
import { FUNERAL_ACTIVE_STATUSES } from 'app/constants/InsureCommon';

/**
 * Dialog for setting early collection preferences
 * 
 * Events Raised 
 * -------------
 * set-options
 * close-modal
 *  
 * @export
 * @class EarlyCollectionOptionsDialog
 * @extends {Component}
 */
export class EarlyCollectionOptionsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.policies = {};
		this.isOptedIn = true;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} productCode - insurance product code capitec/sanlam.
	 * @property {Function} updateEarlyCollectionPreferences - callback function to update early collection preferences.
	 * @static
	 */
	static get properties() {
		return {
			policies: { type: Object, state: true },
			earlyCollectionLabel: { type: String, state: true },
			updateEarlyCollectionPreferences: { type: Object, state: true },
		};
	}

	// #endregion PROPERTIES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
	}

	// #region EVENT HANDLERS


	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	async _updatePreferences() {
		const updatePrefsRequest = {
			contractReference: `No-Policy`,
			option: `EarlyCollection`,
			participating: true
		};
		await this.updateEarlyCollectionPreferences(updatePrefsRequest);
		this.dispatchEvent(new CustomEvent(`close-dialog`));
	}

	/**
	 * Cancel dialog 
	 * @returns {void} 
	*/
	_closeDialog() {
		this.dispatchEvent(new CustomEvent(`close-dialog`));
	}


	// #endregion EVENT HANDLERS

	// #region PRIVATE METHODS

	// #endregion PRIVATE METHODS

	// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				.no-margin{
					margin-top: 0;
				}

				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
				}

				.body-box{
					padding: 0px;
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
		<capitec-modal type="form" header="Early December collection opt-out " style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					<p>
					We’re processing your request to opt out of the early December collections. This change will also apply to all future early collections in December. 
					</p>
					<p>
					Please confirm if you’d like us to proceed with this update. This will not affect your regular chosen collection date; it only applies to December. 
					</p>
				</capitec-content-box>
			</div>
			${this._renderDialogFooter()}
		</capitec-modal>`;
	}

	/**
	 * Render footer html of the dialog
	 * @returns {html} Action buttons
	 */
	_renderDialogFooter() {
		return html`
			<capitec-button slot="footer" type="secondary" label="Cancel" @click="${() => this._closeDialog()}">
			</capitec-button>
			<capitec-button slot="footer" type="primary" label="Update" @click="${() => this._updatePreferences()}">
			</capitec-button>`;
	}
}
window.customElements.define(`horizon-insure-early-collection-options-dialog`, EarlyCollectionOptionsDialog);