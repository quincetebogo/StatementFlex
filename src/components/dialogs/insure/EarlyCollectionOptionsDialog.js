import { Component, css, html } from 'platform/elements';
import { INSURE_PRODUCT_CODE } from 'app/constants/InsureCommon';

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

		this.policy = {};
		this.optedOutOfEarlyCollection = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {String} productCode - insurance product code capitec/sanlam.
	 * @static
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			optedOutOfEarlyCollection: { type: String, state: true },
			earlyCollectionLabel: { type: String, state: true },
			updateEarlyCollectionPreferences: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this.optedOutOfEarlyCollection = this.policy.isOptedOutForEarlyCollection;

		this._setToggleLabel();
	}

	// #region EVENT HANDLERS

	/**
	 * Set label when toggle changes
	 * @returns {void}
	 */
	_setToggleLabel() {
		if (this.optedOutOfEarlyCollection === true) {
			this.earlyCollectionLabel = `Client is opted IN for Early December Collections`;
		} else {
			this.earlyCollectionLabel = `Client is opted OUT for Early December Collections`;
		}
	}


	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	async _updatePreferences() {
		const updatePrefsRequest = {
			contractReference: this.policy.contractReference,
			option: `EarlyCollection`,
			participating: this.optedOutOfEarlyCollection
		};

		const updatePrefsResponse = await this.updateEarlyCollectionPreferences(updatePrefsRequest);
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { accepted: false } }));
	}

	/**
	 * Cancel dialog 
	 * @returns {void} 
	*/
	_closeDialog() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { accepted: false } }));
	}

	/**
	 * Toggle switch 
	 * @param {e} e event
	 * @returns {void} 
	*/
	_preferenceChange(e) {
		this.optedOutOfEarlyCollection = e.detail.new;
		this._setToggleLabel();
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
			`
		];
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="form" header="Early Collections Preferences" style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					<p>
					Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
					Morbi nec tellus sit amet diam tristique mattis at non augue. Curabitur fermentum viverra cursus. Vestibulum
					</p>
					<capitec-toggle @value-change="${(e) => this._preferenceChange(e)}" .checked="${this.optedOutOfEarlyCollection}" .label="${this.earlyCollectionLabel}"></capitec-toggle>
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