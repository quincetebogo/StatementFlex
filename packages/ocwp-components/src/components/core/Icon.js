import { Component, css, html } from '../../elements/index.js';

/**
 * Component that displays an icon from the icon library.
 * 
 * ```js
 * import 'platform/components/core/Icon'
 * ```
 * 
 * ```html
 * <capitec-icon
 *   size="default|extra-small|small|medium|large"
 *   icon="material/person">
 * </capitec-label>
 * ```
 * 
 * @prop {"default"|"extra-small"|"small"|"medium"|"large"|String} size - The size to display the icon at. Options include.
 */
export class Icon extends Component {

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

		// Set the default property values.
		this.size = `default`;
		this.icon = `icon`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [size="default"] - The size to display the icon at. Options include:
	 *  - `default` Icon size is 24px.
	 *  - `extra-small` Icon size is 8px.
	 *  - `small` Icon size is 16px.
	 *  - `medium` Icon size is 32px.
	 *  - `large` Icon size is 48px.
	 * @property {String} icon - The name of the icon to display.
	 */
	static get properties() {

		return {
			size: { type: String },
			icon: { type: String }
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
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					width: fit-content;
					justify-content: center;
				}
				/* MATERIAL ICON STYLES */

				.material-icon {
					font-family: 'Material Icons';
					font-weight: normal;
					font-style: normal;
					display: inline-block;
					line-height: 1;
					text-transform: none;
					letter-spacing: normal;
					word-wrap: normal;
					white-space: nowrap;
					direction: ltr;
					padding: 0px;
					margin: 0px;

					align-self: center;
					justify-self: center;

					/* Support for all WebKit browsers. */
					-webkit-font-smoothing: antialiased;
					
					/* Support for Safari and Chrome. */
					text-rendering: optimizeLegibility;

					/* Support for Firefox. */
					-moz-osx-font-smoothing: grayscale;

					/* Support for IE. */
					font-feature-settings: 'liga';
				}

				.material-icon.large {
					font-size: var(--theme-icon-size-large,48px);
				}

				.material-icon.medium {
					font-size: var(--theme-icon-size-medium,32px);
				}

				.material-icon.small {
					font-size: var(--theme-icon-size-small,16px);
				}

				.material-icon.extra-small {
					font-size: var(--theme-icon-size-extra-small,8.25px);
				}

				.material-icon.default {
					font-size: var(--theme-icon-size-default,24px);
				}

				/* SVG ICON STYLES */

				.svg-icon.large {
					height: var(--theme-icon-size-large,48px);
					/*width: 48px;*/
				}

				.svg-icon.medium {
					height: var(--theme-icon-size-medium,32px);
					/*width: 32px;*/
				}

				.svg-icon.small {
					height: var(--theme-icon-size-small,16px);
					/*width: 16px;*/
				}

				.svg-icon.extra-small {
					height: var(--theme-icon-size-extra-small,8.25px);
					/*width: 16px;*/
				}

				.svg-icon.default {
					height: var(--theme-icon-size-default,24px);
					/*width: 24px;*/
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		if (this.icon) {

			if (this.icon.startsWith(`material/`)) {
				return html`
					<div class="material-icon ${this.size}">${this.icon.replace(`material/`, ``)}</div>
				`;
			} else if (this.icon.startsWith(`/`)) {
				return html`
					<img class="svg-icon ${this.size}" src="./icons${this.icon}.svg" alt="${this.icon}"/>
				`;
			}

			return html`
				<img class="svg-icon ${this.size}" src="./platform/icons/${this.icon}.svg" alt="${this.icon}"/>
			`;
		}

		return html``;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @ignore
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}
}

window.customElements.define(`capitec-icon`, Icon);