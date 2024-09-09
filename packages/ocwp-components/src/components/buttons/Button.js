import { Component, css, html } from '../../elements/index.js';

import '../core/Icon.js';

/**
 * A button control that allows an action to be executed.
 *
 * ```js 
 * import 'platform/components/buttons/Button'; 
 * ```
 * 
 * ```html
 * <capitec-button 
 *   label="Some Action"
 *   type="primary">
 * </capitec-button>
 * ```
 * 
 * @prop {"primary"|"secondary"|"clear"|"white"|"icon"|String} type - The button display type.
 * @prop {"default"|"extra-small"|"small"|"medium"|"large"|String} iconSize - The size of the icon.
 * @prop {"top"|"bottom"|"left"|"right"|String} iconPlacement - The position of the icon relative to the label.
 */
export class Button extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.
		this.label = ``;
		this.icon = ``;
		this.iconSize = `default`;
		this.iconPlacement = `left`;
		this.type = `secondary`;

		this.disabled = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} [icon] - The name of the icon to display.
	 * @property {String} [iconSize="default"] - The size of the icon, i.e. default, extra-small, small medium, large.
	 * @property {String} [iconPlacement="left"] - The position of the icon relative to the label, i.e. top, bottom, left, right.
	 * @property {String} [type="secondary"] - The button display type:
	 *  - `primary` Best suited for primary actions.
	 *  - `secondary` Best suited for alternative actions.
	 *  - `clear` Best suited for hyperlink-like actions.
	 *  - `white` Best suited on non-white containers.
	 *  - `icon` Shows an icon to the left of the text.
	 * 
	 * Note that "default" is still supported, but deprecated.
	 * 
	 * @property {Boolean} [disabled=false] - Indicator if the button is disabled.
	 */
	static get properties() {

		return {
			label: { type: String },
			icon: { type: String },
			iconSize: { type: String, attribute: `icon-size` },
			iconPlacement: { type: String, attribute: `icon-placement` },
			type: { type: String },
			disabled: { type: Boolean }
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
	_buttonClicked(event) {

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

	/**
	 * Handles component key down events.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_keyDown(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Intercept space and enter key events to toggle the component checked state.
		const keyCode = (event.code || ``).toUpperCase();

		if (keyCode === `SPACE` || keyCode === `ENTER` || keyCode === `NUMPADENTER`) {

			this.dispatchEvent(new CustomEvent(`click`, {
				detail: {}
			}));

			event.stopPropagation();
		}
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
					box-sizing: border-box;
					display: inline-flex;
				}

				.button {
					width: 100%;
					height: 100%;

					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;

					text-align: left;
					
					font-family: var(--theme-button-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-button-font-size, 14px);
					font-weight: var(--theme-button-font-weight, bold);
					line-height: var(--theme-button-line-height);
					border-radius: var(--theme-button-border-radius, 4px);
					border-style: solid;

					padding-top: var(--theme-button-padding-top, 10px);
					padding-bottom: var(--theme-button-padding-bottom, 10px);
					padding-left: var(--theme-button-padding-left, 10px);
					padding-right: var(--theme-button-padding-right, 10px);

					cursor: pointer;
					
					transition:
						opacity .1s ease,
						background-color .1s ease,
						border .1s ease,
						color .1s ease,
						box-shadow .1s ease,
						background .1s ease,
						-webkit-box-shadow .1s ease;
				}

				.button.icon-left {
					flex-direction: row;

					text-align: left;
				}

				.button.icon-right {
					flex-direction: row-reverse;

					text-align: left;
				}

				.button.icon-top {
					flex-direction: column;

					text-align: center;
				}

				.button.icon-bottom {
					flex-direction: column-reverse;

					text-align: center;
				}

				capitec-icon.no-spacing {
					margin: none;
				}

				.button.icon-left > capitec-icon.spacing {
					margin-right: var(--theme-button-icon-spacing, 10px);
				}

				.button.icon-right > capitec-icon.spacing {
					margin-left: var(--theme-button-icon-spacing, 10px);
				}

				.button.icon-top > capitec-icon.spacing {
					margin-bottom: var(--theme-button-icon-spacing, 10px);
				}

				.button.icon-bottom > capitec-icon.spacing {
					margin-top: var(--theme-button-icon-spacing, 10px);
				}

				/* secondary (default) */

				.button.default, /* deprecated */
				.button.secondary {
					background-color: var(--theme-button-default-background-color, #FFFFFF);
					border-color: var(--theme-button-default-border-color, #009DE0);
					border-width: var(--theme-button-default-border-width, 1px);
					color: var(--theme-button-default-font-color, #009DE0);
				}

				.button.default:hover, /* deprecated */
				.button.secondary:hover  {
					box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
				}
					
				.button.default:active, /* deprecated */	
				.button.secondary:active {
					background-color: var(--theme-button-default-background-tapped-color, rgba(0,131,187,0.1));
					box-shadow: none;
				}

				/* primary */

				.button.primary {
					background-color: var(--theme-button-primary-background-color, #009DE0);
					border-color: var(--theme-button-primary-border-color, #009DE0);
					border-width: var(--theme-button-primary-border-width, 1px);
					color: var(--theme-button-primary-font-color, #FFFFFF);
				}

				.button.primary:hover {
					box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
				}
						
				.button.primary:active {
					background-color: var(--theme-button-primary-background-tapped-color, #0091CE);
					box-shadow: none;
				}

				/* clear */

				.button.clear {
					background-color: var(--theme-button-clear-background-color, white);
					border-color: var(--theme-button-clear-border-color, blue);
					border-width: var(--theme-button-clear-border-width, 0);
					color: var(--theme-button-clear-font-color, #009DE0);
				}

				.button.clear:hover {
					background-color: rgba(0, 131, 187, 0.05);
				}
						
				.button.clear:active {
					background-color: var(--theme-button-clear-background-tapped-color, rgba(0,131,187,0.1));
					box-shadow: none;
					border-color: var(--theme-button-clear-border-color, blue);
					border-width: var(--theme-button-clear-border-width, 0);
					outline:none;
				}

				/* white */

				.button.white {
					background-color: var(--theme-button-white-background-color, white);
					border-color: var(--theme-button-white-border-color, blue);
					border-width: var(--theme-button-white-border-width, 0);
					color: var(--theme-button-white-font-color, #009DE0);
				}

				.button.white:hover {
					/* background: rgba(255, 255, 255, 0.1); */
					box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15);
				}

				/* SLOTS */

				::slotted(capitec-icon) {
					margin-bottom: 12px;
					height:20px;
					width:16px;
				}
				
				::slotted(capitec-label) {
					font-size:16px;
					color: #4E6066;
					line-height: 20px;
					font-weight:500;
					width: max-content;
				}

				/* DISABLED STATE STYLES */

				.button.disabled {
					cursor: default;
					border-color: var(--theme-check-disabled-border-color, lightgrey);
					background-color: var(--theme-check-disabled-background-color, lightgrey);
				}

				.button.disabled:hover {
					box-shadow: none;
					background-color: var(--theme-check-disabled-background-color, lightgrey);
				}

				.button.disabled:focus {
					outline: 0;
				}

				.button:focus {
					outline: none;
				}

				/* DEVICE SPECIFIC ELEMENT STATE OVERRIDES */
				
				/*
					Disable the hover state on touch enabled devices, e.g. mobile phones.
					On these devices hover acts like focus instead which keeps the button looking like it is in a pressed state.
					Learn more here: https://webdevpuneet.com/how-to-remove-hover-on-touch-devices
				*/

				@media (hover: none) {

					.button.clear:hover:not(.disabled) {
						background-color: unset;
					}

					.button.default:hover, /* deprecated */
					.button.primary:hover,
					.button.secondary:hover,
					.button.white:hover {
						box-shadow: unset;
					}
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

		return html`
			<button
				class="button icon-${this.iconPlacement} ${this.type ? this.type : `secondary`} ${this.disabled ? `disabled` : ``}"
				@click="${this._buttonClicked}" @keydown="${e => this._keyDown(e)}" tabindex="${this.disabled ? `` : 0}">
			
				${this.icon ? html`<capitec-icon icon="${this.icon}" size="${this.iconSize}"
					class="${this.label ? `spacing` : `no-spacing`}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label">${this.label}</div>` : ``}
				<slot></slot>
			</button>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<button
				class="button icon-${this.iconPlacement} ${this.type ? this.type : `secondary`} ${this.disabled ? `disabled` : ``}"
				@click="${this._buttonClicked}" @keydown="${e => this._keyDown(e)}" tabindex="${this.disabled ? `` : 0}">
				${this.icon ? html`<capitec-icon icon="${this.icon}" size="${this.iconSize}"
					class="${this.label ? `spacing` : `no-spacing`}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label">${this.label}</div>` : ``}
				<slot></slot>
			</button>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return html`
			<button
				class="button icon-${this.iconPlacement} ${this.type ? this.type : `secondary`} ${this.disabled ? `disabled` : ``}"
				@click="${this._buttonClicked}" @keydown="${e => this._keyDown(e)}" tabindex="${this.disabled ? `` : 0}">
				${this.icon ? html`<capitec-icon icon="${this.icon}" size="${this.iconSize}"
					class="${this.label ? `spacing` : `no-spacing`}"></capitec-icon>` : ``}
				${this.label ? html`<div class="label">${this.label}</div>` : ``}
				<slot></slot>
			</button>
		`;
	}
}

window.customElements.define(`capitec-button`, Button);

/**
 * When the button component is clicked.
 *
 * @example
 * <capitec-button ... @click="${this._handler}"></capitec-button>
 *
 * @event Button#click
 * @type {Object}
 * @property {Object} detail Empty object.
 */