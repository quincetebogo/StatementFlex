import { Component, css, html } from '../../elements/index.js';

/** 
 * Control used to show a thumbnail representation of an individual, beneficiary or entity in the interface.
 *
 * ```js
 *import 'platform/components/indicators/Avatar;
 * ```
 *
 * ```html
 * <capitec-avatar
 *   size='x-small'
 *   icon="../../../images/HumanFace.jpg"
 *   value="Lorem Ipsum"
 *   shape="circle">
 * </capitec-avatar>
 * ```
 * @prop {"x-small"|"small"|"medium"|"large"|"x-large"|"xx-large"|String} size- The icon size.
 * @prop {"circle"|"square"|"squircle"|String} shape - The icon shape.
 */

export class Avatar extends Component {

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
		this.icon = ``;
		this.value = ``;
		this.size = `large`;
		this.shape = `circle`;
		this.color = `#00486D`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [icon] - The icon to display.
	 * @property {String} [value] - The value to display. Takes precedence over icon.
	 * @property {String} [size="large"] - The icon size:
	 * - `x-small` Size variation to apply.
	 * - `small` Size variation to apply.
	 * - `medium` Size variation to apply.
	 * - `large` Size variation to apply.
	 * - `x-large` Size variation to apply.
	 * - `xx-large` Size variation to apply.
	 * @property {String} [shape="circle"] - The icon shape:
	 * - `circle` Trimmed to in an inner circle.
	 * - `square` Full extent.
	 * - `squircle` Full extent with trimmed edges.
	 * @property {String} [color="#00486D"] - The bacground color to display
	 */
	static get properties() {

		return {
			icon: { type: String },
			value: { type: String },
			size: { type: String },
			shape: { type: String },
			color: { type: String }
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

	_determineIconSize() {
		switch (this.size) {
			case `x-small`:
				return `extra-small`;
			case `small`:
				return `small`;
			case `medium`:
				return `medium`;
			case `x-large`:
				return `extra-large`;
			case `xx-large`:
				return `extra-extra-large`;
			default:
				return `large`;
		}
	}

	_determineValue() {
		const splitVal = this.value.split(` `);
		let value;

		if (splitVal.length > 1) {
			value = `${splitVal[0].substr(0, 1)}${splitVal[1].substr(0, 1)}`;
			return value;
		}

		value = splitVal[0].substr(0, 2);
		return value;
	}

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
					flex: 0 0 auto;
                }

                .container {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    background-color: transparent;
                    text-align: center;
                }
				
				.font {
					color: var(--theme-avatar-value-color, #FFFFFF);
					font-family: var(--theme-font-family, Arial, Helvetica, sans-serif);
					font-weight: bold;
					text-align: center;
				}

				.font.extra-small {
					font-size: var(--theme-avatar-font-size-extra-small, 10.19px);
					line-height: var(--theme-avatar-font-line-height-extra-small, 11px);
				}
				
				.font.small {
					font-size: var(--theme-avatar-font-size-small, 13.59px);
					line-height: var(--theme-avatar-font-line-height-small, 15px);
				}
				
				.font.medium {
					font-size: var(--theme-avatar-font-size-medium, 16.99px);
					line-height: var(--theme-avatar-font-line-height-medium, 19px);
				}

				.font.large {
					font-size: var(--theme-avatar-font-size-large, 20.22px);
					line-height: var(--theme-avatar-font-line-height-large, 23px);
				}

				.font.extra-large {
					font-size: var(--theme-avatar-font-size-extra-large, 23.84px);
					line-height: var(--theme-avatar-font-line-height-extra-large, 27px);
				}
				
				.font.extra-extra-large {
					font-size: var(--theme-avatar-font-size-extra-extra-large, 27.36px);
					line-height: var(--theme-avatar-font-line-height-extra-extra-large, 31px);
				}
				
				.size.extra-small {
					height: var(--theme-avatar-size-extra-small, 24px);
					width: var(--theme-avatar-size-extra-small, 24px);
				}
				
				.size.small {
					height: var(--theme-avatar-size-small, 32px);
					width: var(--theme-avatar-size-small, 32px);
				}
				
				.size.medium {
					height: var(--theme-avatar-size-medium, 40px);
					width: var(--theme-avatar-size-medium, 40px);
				}

				.size.large {
					height: var(--theme-avatar-size-large, 48px);
					width: var(--theme-avatar-size-large, 48px);
				}

				.size.extra-large {
					height: var(--theme-avatar-size-extra-large, 56px);
					width: var(--theme-avatar-size-extra-large, 56px);
				}
				
				.size.extra-extra-large {
					height: var(--theme-avatar-size-extra-extra-large, 64px);
					width: var(--theme-avatar-size-extra-extra-large, 64px);
				}

				/* CIRCLE STYLES */

                .circle {
                    display: flex;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
					border-radius: 50%;
				}

				/* SQUARE STYLES */

                .square {
                    display: flex;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
				}

				/* ROUNDED SQUARE STYLES */

                .squircle {
                    display: flex;
                    text-align: center;
                    align-items: center;
                    justify-content: center;
					overflow: hidden;
					border-radius: 5px;
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
				<div class="${this.shape} size ${this._determineIconSize()}" style="${!this.icon || this.value ? `background-color: ${this.color};` : ``}">
					${this.value ? html`<span class="font ${this.size}">${this._determineValue()}</span>` : ``}
					${this.icon && !this.value ? html`<img class="${this.shape} size ${this._determineIconSize()}" src="${this.icon}">` : ``}
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

window.customElements.define(`capitec-avatar`, Avatar);