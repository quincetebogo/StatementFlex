import { Component, css, html } from '../../elements/index.js';

/**
 * Component that indicates important information to the user about the system status or a process..
 * 
 * ```js
 * import 'platform/components/popups/AlertBanner';
 * ```
 * 
 * ```html
 * <capitec-alert-banner type="info" label="Some Information." closable>
 *   <span><a href="https://google.com">This is a link.</a> More Info and Detail</span>
 * </capitec-alert-banner>
 * ```
 * @prop {"info"|"success"|"warning"|"error"|"unsuccessful"|"unsuccessful-red"|String} type - The type of alert to display.
 * @prop {"horizontal"|"vertical"|String} layout - Sets orientation of Alert banner header, label and slot content
 */
export class AlertBanner extends Component {

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

		this.type = `info`;
		this.header = ``;
		this.label = ``;
		this.layout = `horizontal`;
		this.closable = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [header] - The title to display on the toast.
	 * @property {String} [label] - The message to display on the alert banner.
	 * @property {String} [type="info"] - The type of alert to display:
	 *  - `info` GlobalOne style variation.
	 *  - `success` GlobalOne style variation.
	 *  - `warning` GlobalOne style variation.
	 *  - `error` GlobalOne style variation.
	 *  - `unsuccessful` GlobalOne style variation.
	 *  - `unsuccessful-red` GlobalOne style variation.
	 * @property {Boolean} [closable=false] - Whether the alert banner can be closed/close button visible.
	 */
	static get properties() {

		return {
			header: { type: String },
			label: { type: String },
			type: { type: String },
			layout: { type: String },
			closable: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a	

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeClicked(e) {

		// Notify any subscribers that the close button was clicked.
		this.dispatchEvent(new CustomEvent(`click-close`, {
			detail: {}
		}));
	}

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
			css`
				:host([type="info"]){
					--theme-toast-info-background-color: var(--theme-alert-banner-info-background-color, #DAF2F4),
				}

				:host([type="success"]) {
					--theme-toast-success-background-color: var(--theme-alert-banner-success-background-color, #EAF3D9);
				}
				
				:host([type="warning"]) {
					--theme-toast-warning-background-color: var(--theme-alert-banner-warning-background-color, #F9EBDD);
				}
				
				:host([type="error"]) {
					--theme-toast-error-background-color: var(--theme-alert-banner-error-background-color, #F7E2E1);
				}

				:host([type="unsuccessful"]) {
					--theme-toast-unsuccessful-background-color: var(--theme-alert-banner-unsuccessful-background-color, rgba(73,91,101,0.1));
				}

				:host([type="unsuccessful-red"]) {
					--theme-toast-error-background-color: var(--theme-alert-banner-unsuccessful-red-background-color, #F7E2E1);
				}

				:host {
					--theme-toast-icon-margin: 0px var(--theme-alert-banner-icon-margin-right, 0px) 0px var(--theme-alert-banner-icon-margin-left, 0px);
					--theme-toast-width: var(--theme-alert-banner-width, fit-content);
					--theme-toast-min-width: var(--theme-alert-banner-min-width, unset);
					--theme-toast-max-width: var(--theme-alert-banner-max-width, 100%);

					--theme-toast-content-font-size: var(--theme-alert-banner-font-size, 14px);
					--theme-toast-content-font-weight: var(--theme-alert-banner-font-weight, 400);
					--theme-toast-content-line-height: var(--theme-alert-banner-line-height, 20px);
				}

				:host([type="info"]){
					--theme-toast-info-color: var(--theme-alert-banner-info-font-color, #3A3A3A);
					--theme-toast-content-color: var(--theme-alert-banner-info-font-color, #3A3A3A);
				}

				:host([type="success"]) {
					--theme-toast-success-color: var(--theme-alert-banner-success-font-color, #3A3A3A);
					--theme-toast-content-color: var(--theme-alert-banner-success-font-color, #3A3A3A);
				}

				:host([type="warning"]) {
					--theme-toast-warning-color: var(--theme-alert-banner-warning-font-color, #3A3A3A);
					--theme-toast-content-color: var(--theme-alert-banner-warning-font-color, #3A3A3A);
				}

				:host([type="error"]) {
					--theme-toast-error-color: var(--theme-alert-banner-error-font-color, #3A3A3A);
					--theme-toast-content-color: var(--theme-alert-banner-error-font-color, #3A3A3A);
				}

				:host([type="unsuccessful"]) {
					--theme-toast-unsuccessful-color: var(--theme-alert-banner-unsuccessful-font-color, rgba(73,91,101,0.1));
					--theme-toast-content-color: var(--theme-alert-banner-unsuccessful-font-color, rgba(73,91,101,0.1));
				}

				:host([type="unsuccessful-red"]) {
					--theme-toast-error-color: var(--theme-alert-banner-unsuccessful-red-font-color, #3A3A3A);
					--theme-toast-content-color: var(--theme-alert-banner-unsuccessful-red-font-color, #3A3A3A);
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
			<capitec-toast type="${this.type}" header="${this.header}" detail="${this.label}" layout="${this.layout}" ?closable=${this.closable} @click-close="${(e) => this._closeClicked(e)}">
				<slot></slot>
			</capitec-toast>
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

window.customElements.define(`capitec-alert-banner`, AlertBanner);

/**
 * When the close button is clicked.
 *
 * @example
 * <capitec-alert-banner ... @click-close="${this._handler}"></capitec-alert-banner>
 *
 * @event AlertBanner#click
 * @type {Object}
 * @property {Object} detail Event object.
 */