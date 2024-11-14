import { Component, css, html } from '../../elements/index.js';

/**
 * Invisible content separator to push components apart in horizontal and vertical layout containers.
 * 
 * ```js
 * import 'platform/components/layouts/Spacer';
 * ```
 * 
 * ```html
 * <capitec-action-bar>
 *   <capitec-button type="primary" label="Save"></capitec-button>
 *   <capitec-spacer></capitec-spacer>
 *   <capitec-button type="default" label="Cancel"></capitec-button>
 * </capitec-action-bar>
 * ```
 */
export class Spacer extends Component {

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

	// n/a

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
			css`
				:host {
					margin: auto;
					cursor: default;
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

		return html`&nbsp;`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`&nbsp;`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`&nbsp;`;
	}
}

window.customElements.define(`capitec-spacer`, Spacer);