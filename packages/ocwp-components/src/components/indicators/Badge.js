import { Component, css, html } from '../../elements/index.js';

/**
 * A badge control to help highlight important information about changes and update in certain areas, such as notifications or new and unread messages.
 *
 * ```js 
 * import 'platform/components/indicators/Badge'; 
 * ```
 * 
 * ```html
 * <capitec-badge
 *   color="red"
 *   icon="status/info" 
 *   iconSize="small"
 *   number="1">
 * </capitec-badge>
 * ```
 * @prop {"default"|"extra-small"|"small"|String} iconSize- The icon size.
 */
export class Badge extends Component {

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
		this.color = `#C83C37`;
		this.iconSize = `default`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Number} [number] - The number to display.
	 * @property {String} [color="#C83C37"] - The css color of the badge. Valid values are css color names e.g. 'red', color hex e.g. '#70AF00', color rgb values e.g. 'rgb(255,4,1)'
	 * @property {String} [icon] - The icon to display. Takes precedence over number.
	 * @property {String} [iconSize="default"] - The icon size:
	 * - `default` Size variation.
	 * - `extra-small` Size variation.
	 * - `small` Size variation.
	 */
	static get properties() {

		return {
			number: { type: Number },
			color: { type: String },
			icon: { type: String },
			iconSize: { type: String }
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
					box-sizing: border-box;
                    display: inline-flex;
                }

                .container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background-color: transparent;
                }
                
                .circle {
                    height: var(--theme-badge-size, 24px);
                    width: var(--theme-badge-size, 24px);
                    display: flex;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    border-radius: 50%;
                }

                .badge-number {
                    color: var(--theme-badge-number-color, #FFFFFF);
                    font-family: var(--theme-font-family, "Hind Vadodara");
                    font-size: var(--theme-badge-font-size, 14px);
                    font-weight: var(--theme-badge-font-weight, 500);
					line-height: var(--theme-badge-line-height, 24px);
                    text-align: center;
                    align-items: center;
                    justify-content: center;
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
        <div class="container">
            <div class="circle" style="background-color: ${this.color};">
                ${!isNaN(this.number) && !this.icon ? html`<label class="badge-number">${this.number}</label>` : ``}
                ${this.icon ? html`<capitec-icon icon="${this.icon}" size="${this.iconSize}"></capitec-icon>` : ``}
            </div>
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

window.customElements.define(`capitec-badge`, Badge);