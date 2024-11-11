import { Component, css, html } from '../../elements/index.js';

/**
 * A control that shows an information text box when hovering over a component.
 *
 * ```js
 * import 'platform/components/popups/Tooltip';
 * ```
 *
 * ```html
 * <capitec-tooltip message="Notification" position="bottom">
 *      <capitec-badge
 *          color="transparent"
 *          icon="status/info"
 *          iconSize="small"
 *      >
 *      </capitec-badge>
 * </capitec-tooltip>
 * ```
 *
 */
export class Tooltip extends Component {
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {
		// Ensure the base class constructor logic is applied.
		super();

		// Set the default property values.
		this.position = `right`;
		this.width = `fit-content`;
		this.clickable = false;
		this.opened = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} message - The tooltip text.
	 * @property {String} [position="right"] Position of the tooltip:
	 *  - `left` Position tooltip to the left of the component.
	 *  - `right` Position tooltip to the right of the component.
	 *  - `top` Position tooltip to the top of the component.
	 *  - `bottom` Position tooltip to the bottom of the component.
	 *  - `left-edge` Position tooltip to the left-edge of the component.
	 *  - `right-edge` Position tooltip to the right-edge of the component.
	 * @property {String} [width="fit-content"] - Width of the tooltip.
	 *
	 * @property {Boolean} [clickable=false] - Indicator if the tooltip is clickable or not - Always true for mobile an kiosks.
	 * @property {Boolean} [opened=false] - Indicator if the tooltip is opened or not.
	 */
	static get properties() {
		return {
			message: { type: String },
			position: { type: String },
			width: { type: String },
			clickable: { type: Boolean },
			opened: { type: Boolean }
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
	 * Hides the tooltip.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_hideTooltip() {
		this.opened = false;
	}

	/**
	 * Shows the tooltip.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_showTooltip() {
		this.opened = true;
	}

	/**
	 * Reverses the tooltip opened state.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_toggleTooltip() {
		this.opened = !this.opened;
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

	static get styles() {
		return [
			super.styles,
			css`
				/* TOOLTIP STYLES */

				.tooltip {
					position: relative;
					z-index: unset;
					display: flex;
					flex: 1;
				}

				/* TOOLTIP ACTIVE STATE STYLES */

				.tooltip.active .container {
					display: flex;
					flex: 1;
					width: max-content;
					max-width: 282px;
				}

				/* TRIGGER STYLES */

				.trigger {
					display: flex;
					flex: 1;
					position: relative;
					z-index: var(--theme-tooltip-base-z-index, 1);
				}

				/* MESSAGE STYLES */

				.message {
					display: flex;
					flex: 1;
					position: relative;
					z-index: var(--theme-tooltip-message-z-index, 2);
					margin-left: var(--theme-tooltip-margin-left, 16px);
					margin-right: var(--theme-tooltip-margin-right, 16px);
					margin-top: var(--theme-tooltip-margin-top, 8px);
					margin-bottom: var(--theme-tooltip-margin-bottom, 8px);
					text-align: center;
				}

				.message > p {
					margin: 0;
					font-family: var(--theme-tooltip-font-family, 'Arial, Helvetica, sans-serif');
					color: var(--theme-tooltip-font-color, #ffffff);
					font-size: var(--theme-tooltip-font-size, 12px);
					font-weight: var(--theme-tooltip-font-weight, 400);
					letter-spacing: var(--theme-tooltip-letter-spacing 0);
					line-height: var(--theme-tooltip-line-height, 16px);
					text-align: center;
				}

				/* CONTAINER BOX STYLES */

				.container {
					display: none;
					position: absolute;
					z-index: var(--theme-tooltip-container-z-index, 9999);
					border-radius: var(--theme-tooltip-border-radius, 5px);
					background-color: var(--theme-tooltip-background-color, #3E4547);
				}

				.container.bottom {
					top: calc(100% + 8px);
					left: 50%;
					transform: translateX(-50%);
					animation: fade 150ms;
				}

				.container.top {
					bottom: calc(100% + 8px);
					left: 50%;
					transform: translateX(-50%);
					animation: fade 150ms;
				}

				.container.left {
					right: calc(100% + 8px);
					top: 50%;
					transform: translateY(-50%);
					animation: fade 150ms;
				}

				.container.right {
					left: calc(100% + 8px);
					top: 50%;
					transform: translateY(-50%);
					animation: fade 150ms;
				}
				
				.container.left-edge {
					bottom: calc(100% + 8px);
					left: -4px;
					animation: fade 150ms;
				}
				
				.container.right-edge {
					bottom: calc(100% + 8px);
					right: -3px;
					animation: fade 150ms;
				}

				/* CONTAINER ARROW STYLES */

				.container::before {
					content: " ";
					display: block;
					position: absolute;
					background-color: var(--theme-tooltip-background-color, #3E4547);
					width: 10px;
					height: 10px;
				}

				.container.bottom::before {
					top: 0;
					left: 50%;
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(45deg) translateX(-50%);
				}

				.container.top::before {
					top: auto;
					bottom: -8px;
					left: 50%;
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(45deg) translateX(-50%);
				}

				.container.left::before {
					right: -8px;
					top: 50%;
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(-45deg) translateY(-50%);
				}

				.container.right::before {
					left: 0;
					top: 50%;
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(-45deg) translateY(-50%);
				}

				.container.left-edge::before {
					top: auto;
					bottom: -8px;
					left: 15px;
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(45deg) translateX(-50%);
				}

				.container.right-edge::before {
					top: auto;
					bottom: -8px;
					left: calc(100% - 16px);
					z-index: var(--theme-tooltip-base-z-index, 1);
					transform: rotate(45deg) translateX(-50%);
				}

				/* ANIMTATION */

				@keyframes fade {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
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
			<div class="tooltip ${this.opened ? `active` : ``}">
				<div class="container ${this.position}" style="width: ${this.width}">
					<div class="message">
						<p>${this.message}</p>
					</div>
				</div>
				<div class="trigger" @click="${() => this._toggleTooltip()}">
					<slot></slot>
				</div>
			</div>
		`;
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<div class="tooltip ${this.opened ? `active` : ``}">
				<div class="container ${this.position}" style="width: ${this.width}">
					<div class="message">
						<p>${this.message}</p>
					</div>
				</div>
				<div class="trigger" @mouseover="${() => {
				if (!this.clickable) {
					this._showTooltip();
				}
			}}" @mouseout="${() => {
				if (!this.clickable) {
					this._hideTooltip();
				}
			}}" @click="${() => {
				if (this.clickable) {
					this._toggleTooltip();
				}
			}}">
					<slot></slot>
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
		return this._mobileTemplate();
	}
}

customElements.define(`capitec-tooltip`, Tooltip);