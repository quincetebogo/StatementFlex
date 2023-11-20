import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';

/**
 * Warning dialog when policy is in "Policy Pause" state, not allowing changes
 * 
 * Events Raised 
 * -------------
 * close-dialog
 * 
 *  
 * @export
 * @class PolicyRulesWarningDialog
 * @extends {Component}
 */
class PolicyRulesWarningDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} content Message in dialog
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			content: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES


	// #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_closeClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
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
			}`
		];
	}

	/**
	 * Generates the component template for web mode
	 * @returns {html} html content 
	 */
	_webTemplate() {
		return html`
		<capitec-modal type="free" header="${this.content?.header}" style="--theme-modal-header-color: black;">
			<div slot="body">
				<capitec-content-box class="body-box">
					<p>${this.content?.body}</p>
				</capitec-content-box>
			</div>
			<div slot="footer">
				<capitec-button type="primary" label="Ok" @click="${() => this._closeClick()}"></capitec-button>
			</div>
		</capitec-modal>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-funeral-policy-rules-warning`, PolicyRulesWarningDialog);

/**
 * Send a close dialog event to consuming component when 'ok' is clicked
 *
 * @example
 * <horizon-insure-funeral-policy-rules-warning ... @close-dialog="${this._handler}"></horizon-insure-funeral-policy-rules-warning>
 *
 * @event PolicyPauseWarningDialog#close-dialog
 * @type {Object} - N/A
 */