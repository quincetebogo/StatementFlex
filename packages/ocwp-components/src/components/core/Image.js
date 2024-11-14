import { Component, html } from '../../elements/index.js';

/**
 * Component that displays an image.
 * 
 * ```js
 * import 'platform/components/core/Image'
 * ```
 * 
 * ```html
 * <capitec-image alt="Capitec Logo" src="https://www.capitecbank.co.za/globalassets/reusable-images/logos/capitec-logo.svg"></capitec-image>
 * ```
 */
export class Image extends Component {

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
		this.src = ``;
		this.alt = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} src - The path to the image source. Can be a local file or an unauthenticated GET url.
	 * @property {String} [alt] - An alternate label to display if the image can not be loaded.
	 */
	static get properties() {

		return {
			src: { type: String },
			alt: { type: String }
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

	// n/a

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
		return html`
			<img src="${this.src}" alt="${this.alt}"/>
		`;
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

window.customElements.define(`capitec-image`, Image);