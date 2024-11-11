import { Component, css, html } from '../../elements/index.js';

import '../core/Icon.js';
import '../core/Label.js';
import '../layouts/Spacer.js';

/**
 * Container that renders at the top of the screen, typically used within a AppShell component and forms
 * part of the main application structure.
 *
 * ```js 
 * import 'platform/components/layers/PageHeader'; 
 * ```
 * 
 * ```html
 * <capitec-page-header label="My Application">
 *  <capitec-button label="Log Out"></capitec-button>
 * </capitec-page-header>
 * ```
 */
export class PageHeader extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set property defaults.
		this.label = ``;
		this.src = `platform/icons/capitec-logo.svg`;
		this.logoClickable = false;
	}

	// ----------
	// PROPERTIES
	// ----------	

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The title label, typically the title of the application.
	 * @property {String} src The component image source, by default is the Capitec logo.
	 * @property {String} icon [Deprecated] The component icon, by default is the Capitec logo.
	 * @property {Boolean} logoClickable - When true, ensures a pointer icon on the logo.
	 */
	static get properties() {

		return {
			label: { type: String },
			src: { type: String },
			icon: { type: String },
			logoClickable: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Request navigation back to the home page.
	 * 
	 * @returns {void}
	 * @ignore
	 */
	_navigateHome() {

		// Notify any direct subscribers that the navigate home action was requested.
		this.dispatchEvent(new CustomEvent(`navigate-home`, {
			detail: {

			}
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

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					width: 100%;
					
					min-height: var(--theme-pageheader-min-height, 50px);

					flex-shrink: 0;
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;

					background: var(--theme-pageheader-background, #FFFFFF);

					border-radius: 0px;
					border-bottom: var(--theme-pageheader-border, 1px solid #000000);
					box-shadow: var(--theme-pageheader-shadow, 0px 1px #000000);

					padding: var(--theme-pageheader-padding, 10px);
				}
				
				:host > capitec-label {
					color: var(--theme-pageheader-font-color, #000000);

					border-left: 1px solid var(--theme-layout-gap-line-color, #000000);

					padding-left: var(--theme-pageheader-item-gap, 10px);

					margin-left: var(--theme-pageheader-item-gap, 10px);
					margin-right: var(--theme-pageheader-item-gap, 10px);
				}
				
				:host > .wrapper {
					flex-grow: 1;
					
					display: flex;
					flex-wrap: wrap;
					flex-direction: row;
					justify-content: flex-end;
					align-items: stretch;

					margin: calc(var(--theme-pageheader-item-gap, 10px) / 2 * -1);
				}

				:host > .wrapper > ::slotted(*:not(capitec-spacer)) {
					margin: calc(var(--theme-pageheader-item-gap, 10px) / 2);
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
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<capitec-image style="${this.logoClickable ? `cursor: pointer` : ``}" size="medium" src="${this.src}" @click="${() => this._navigateHome()}"></capitec-image>
			${this.label ? html`<capitec-label type="title" label="${this.label}"></capitec-label>` : html``}
			<div class="wrapper">
				<slot></slot>
			</div>
		`;
	}
}

window.customElements.define(`capitec-page-header`, PageHeader);

/**
 * Notify any direct subscribers that the navigate home action was requested.
 *
 * @example
 * <capitec-page-header @navigate-home="${() => this._goHome()}"></capitec-page-header>
 *
 * @event PageHeader#navigate-home
 * @type {Object}
 * @property {Object} detail Event object.
 */