import { Component, css, html } from '../../elements/index.js';

import '../core/Label.js';

/**
 * Popup component that indicates a system status message.
 * 
 * ```js
 * import 'platform/components/popups/StatusBar';
 * ```
 * 
 * ```html
 * <capitec-status-bar
 *   status="success"
 *   label="Something went wrong.">
 * </capitec-status-bar>
 * ```
 * @prop {"success"|"unsuccessful"|"error"|"warn"|"info"|String} [status] - The status type indicator.
 */
export class StatusBar extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [status] - The status type indicator:
	 * - `success` Indicate successful outcome / status.
	 * - `unsuccessful` Indicate unsuccessful outcome / status.
	 * - `error` Indicate error outcome / status.
	 * - `warn` Indicate warning outcome / status.
	 * - `info` Indicate info outcome / status.
	 * @property {String} [label] - The message to display on the status bar.
	 */
	static get properties() {

		return {
			status: { type: String, reflect: true },
			label: { type: String, reflect: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a	

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 * 
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;

					min-height: var(--theme-statusbar-min-height, 50px);
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;

					background-color: var(--theme-statusbar-background, grey);

					border-radius: 0px;
					border: var(--theme-statusbar-border, none);
					box-shadow: var(--theme-statusbar-shadow, none);
					
					padding: var(--theme-statusbar-padding, 10px);
				}
				
				:host > capitec-label {
					color: var(--theme-statusbar-font-color, white);
				}
		
				:host > .status {
					width: 24px;
					height: 24px;

					border-radius: 12px;

					margin-right: var(--theme-statusbar-item-gap, 10px);

					display: none;
				}
			`,

			/* ---------- STATUS TYPES ---------- */

			css`
				:host > .status.success {
					display: block;
					
					color: var(--theme-status-success-font-color, #FFFFFF);
					background: var(--theme-status-success-background, green);
				}

				:host > .status.error {
					display: block;
					
					color: var(--theme-status-error-font-color, #FFFFFF);
					background: var(--theme-status-error-background, red);
				}

				:host > .status.warn {
					display: block;
					
					color: var(--theme-status-warn-font-color, #FFFFFF);
					background: var(--theme-status-warn-background, orange);
				}

				:host > .status.info {
					display: block;
					
					color: var(--theme-status-info-font-color, #FFFFFF);
					background: var(--theme-status-info-background, blue);
				}

				:host > .status.unsuccessful {
					display: block;
					
					color: var(--theme-status-unsuccessful-font-color, #FFFFFF);
					background: var(--theme-status-unsuccessful-background, grey);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<div class="status ${this.status}"></div>
			<capitec-label label="${this.label}"></capitec-label>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}
}

window.customElements.define(`capitec-status-bar`, StatusBar);