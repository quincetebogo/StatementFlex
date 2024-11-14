import { Component, css, html } from '../../elements/index.js';

/**
 * A full screen system loading indicator.
 * 
 * ```js
 * import 'platform/components/core/LoadingIndicator';
 * ```
 * 
 * ```html
 * <capitec-loading-indicator></capitec-loading-indicator>
 * ```
 */
export class LoadingIndicator extends Component {

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

	connectedCallback() {

		super.connectedCallback();

		// Register a listener that will prevent any keyboard events while the loading indicator is visible.
		window.addEventListener(`keydown`, this.trapKeyDown);
	}

	disconnectedCallback() {

		super.disconnectedCallback();

		// Remove any active event handlers.
		window.removeEventListener(`keydown`, this.trapKeyDown);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Traps and ignores any key down events while the loading indicator is visible.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_trapKeyDown(event) {

		event.preventDefault();
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
				.overlay {
					position: fixed;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;
					
					z-index: var(--theme-loading-indicator-z-index, 20000);

					display: flex;
					justify-content: center;
					align-items: center;

					background-color: rgba(244, 244, 244, 0.3);
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
			<div class="overlay">
				<img src="platform/icons/loader.svg">
			</div>
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

window.customElements.define(`capitec-loading-indicator`, LoadingIndicator);