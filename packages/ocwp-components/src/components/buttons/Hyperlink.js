import { Component, css, html } from '../../elements/index.js';

/**
 * A link control that allows a user to indicate an action to be executed.
 * 
 * Typically used for navigational purposes.
 *
 * ```js 
 * import 'platform/components/buttons/Hyperlink'; 
 * ```
 * 
 * ```html
 * <capitec-hyperlink 
 *   href="https://example.com"
 *   label="Click me">
 * </capitec-hyperlink>
 * ```
 * 
 * @prop {"_self"|"_blank"|"_parent"|"_top"|String} target - Where to load the URL specified in "href"
 * @attr {Boolean} inline - Indicator if the link is used as part of a sentance.
 * @prop {"default"|"small"|String} size - Size of the hypelink text.
 */
export class Hyperlink extends Component {

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
		this.label = null;
		this.href = null;
		this.target = `_self`;
		this.disabled = false;
		this.size = `default`;
	}

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} label - The label string to display.
	 * @property {String} [href] - URL to link to. NOTE, suppresses "click" event if specified.
	 * @property {String} [target="_self"] - Where to load the URL specified in "href":
	 *  - `_self` Current browsing context.
	 *  - `_blank` Usually a new tab, but users can configure browsers to open a new window instead.
	 *  - `_parent` Parent browsing context of the current one. If no parent, behaves as "_self".
	 *  - `_top` Topmost browsing context (the "highest" context that’s an ancestor of the current one). If no ancestors, behaves as "_self".
	 * 
	 * @property {Boolean} [disabled=false] - Indicator if the link is disabled.
	 * @attriute {Boolean} [inline=false] - Indicator if the link is used as part of a sentance.
	 * @attriute {String} [size] - Size of the hypelink text:
	 * - `default` Size variation to apply.
	 * - `small` Size variation to apply.
	 */
	static get properties() {
		return {
			label: { type: String },
			href: { type: String },
			target: { type: String },
			disabled: { type: Boolean },
			size: { type: String }
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
	 * Handles component click events.
	 * 
	 * @param {MouseEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_linkClicked(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Notify any subscribers that the link was clicked.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
		}));

		// Prevent the event from bubbling up.
		event.stopPropagation();
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
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host {
					display: inline-block;
				}

				:host([disabled]) {
					--theme-hyperlink-color: var(--theme-hyperlink-color-disabled, #7C7C7C)
				}

				:host([disabled]) a {
					pointer-events: none;
				}

				:host([inline]) {
					--theme-hyperlink-text-decorator: underline;
				}
				
				.hyperlink {
					font-size: var(--theme-hyperlink-font-size, 16px);
					font-family: var(--theme-font-family, "Hind Vadodara");
					font-weight: var(--theme-hyperlink-font-weight, 500);
					color: var(--theme-hyperlink-color, #009DE0);
					text-decoration: var(--theme-hyperlink-text-decorator, none);
					outline: none;
				}

				:host([size="small"]) .hyperlink {
					font-size: var(--theme-hyperlink-font-size-small, 14px);
					font-family: var(--theme-font-family-small, "Hind Vadodara");
					font-weight: var(--theme-hyperlink-font-weight-small, 500);
				}

				.hyperlink:active {
					color: var(--theme-hyperlink-color-active, #3A3A3A);
					text-decoration: var(--theme-hyperlink-text-decorator-active, underline);;
				}
				
				.hyperlink:hover {
					text-decoration: var(--theme-hyperlink-text-decorator-hover, underline);;
				}
				
				.hyperlink:visited {
					color: var(--theme-hyperlink-color-visited, #3A3A3A);
					text-decoration: var(--theme-hyperlink-text-decorator-visited, none);;
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

		if (this.href) {
			return html`<a class="hyperlink" href="${this.href}" .target="${this.target}" tabindex="0">${this.label}</a>`;
		}

		return html`<a class="hyperlink" href="javascript:void(0)" @click="${e => this._linkClicked(e)}" .target="${this.target}" tabindex="0">${this.label}</a>`;
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

window.customElements.define(`capitec-hyperlink`, Hyperlink);

/**
 * When the hyperlink is clicked. NOTE this is suppressed if "href" is specified.
 *
 * @example
 * <capitec-hyperlink ... @click="${this._handler}"></capitec-hyperlink>
 *
 * @event Hyperlink#click
 * @type {Object}
 * @property {Object} detail Empty object.
*/