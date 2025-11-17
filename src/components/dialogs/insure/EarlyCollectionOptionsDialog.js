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
		this.hasActiveLifePolicy = false;
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
			policy: { type: Object, state: true },
			isOptedIn: { type: String, state: true },
			earlyCollectionLabel: { type: String, state: true },
			updateEarlyCollectionPreferences: { type: Object, state: true },
			hasActiveLifePolicy: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this.isOptedIn = this._checkStatus()
	}

	// #region EVENT HANDLERS

	_checkStatus() {
		let isOptedOut = false
		for (let i = 0; i < this.policies.length; i++) {
			if (this.policies[i].isOptedOutForEarlyCollection) {
				isOptedOut = true
			}
		}
		return isOptedOut
	}

	/**
	 * Accept terms and close dialog 
	 * @returns {void} 
	 */
	async _updatePreferences() {
		const updatePrefsRequest = {
			contractReference: `No-Policy`,
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

	_checkProducts() {
		let activeFuneralPolicy = this.policies?.find((policy) => policy.status === FUNERAL_ACTIVE_STATUSES.ACTIVE || policy.status === FUNERAL_ACTIVE_STATUSES.PENDING_IN_FORCE);

		if (activeFuneralPolicy && this.hasActiveLifePolicy) {
			return "Funeral & Life Cover"
		} else {
			if (activeFuneralPolicy) {
				return "Funeral"
			} else {
				return "Life Cover"
			}
		}
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
					Due to the festive season and early closures in December, we'll deduct your insurance premiums for ${this._checkProducts()} in line with your pay date or from 12 December to ensure your cover stays active throughout the holiday season.
					</p>
					
					<capitec-radio-group>
						<capitec-group layout="grid" rows="auto" columns="auto" gap="10px">
							<capitec-radio
								id="optedIN"
								label="I agree to December early collection"
								?checked = "${this.isOptedIn === true}"
								@value-changed="${(e) => this._preferenceChange(e, true)}"
								row="1" column="1">
							</capitec-radio>
							<capitec-radio
								id="optedOUT"
								label="No, collect on nominated date"
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