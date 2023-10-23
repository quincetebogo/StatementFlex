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
		this.isOptedIn = true;
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
			isOptedIn: { type: String, state: true },
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
		this.isOptedIn = !this.policy.isOptedOutForEarlyCollection;
	}

	// #region EVENT HANDLERS

	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	async _updatePreferences() {
		const updatePrefsRequest = {
			contractReference: this.policy.contractReference,
			option: `EarlyCollection`,
			participating: !this.isOptedIn
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

	/**
	 * Toggle switch 
	 * @param {e} e event
	 * @param {boolean} optIn optIn
	 * @returns {void} 
	*/
	_preferenceChange(e, optIn) {
		this.isOptedIn = optIn;
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
		<capitec-modal type="form" header="Early December collection" style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					<p>
					Due to early pay dates, we'll collect your December funeral plan (${this.policy?.contractReference}) premium early. IF you opt out,  your premium will be collected on your nominated debit order date.
					</p>
					
					<capitec-radio-group>
						<capitec-group layout="grid" rows="auto" columns="auto" gap="10px">
							<capitec-radio
								id="optedIN"
								label="Opt IN to Early December collection"
								?checked = "${this.isOptedIn === true}"
								@value-changed="${(e) => this._preferenceChange(e, true)}"
								row="1" column="1">
							</capitec-radio>
							<capitec-radio
								id="optedOUT"
								label="Opt OUT of Early December collection"
								?checked = "${this.isOptedIn === false}"
								@value-changed="${(e) => this._preferenceChange(e, false)}"
								row="2" column="1">
							</capitec-radio>
						</capitec-group>
					</capitec-radio-group>


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