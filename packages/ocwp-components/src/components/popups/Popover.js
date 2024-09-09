import { Component, css, html } from '../../elements/index.js';

/**
 * A control that shows an information text box when hovering over a component.
 *
 * ```js
 * import 'platform/components/popups/Popover';
 * ```
 *
 * ```html
 * <capitec-popover
 *    .messages="${[`Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
 *                  `Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`]}"
 *    heading="Lorem ipsum dolor sit amet">
 *    <capitec-badge
 *        color="transparent"
 *        icon="status/info"
 *        iconSize="small">
 *    </capitec-badge>
 * </capitec-popover>
 *
 * <capitec-popover
 *    .messages="${[`Consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`]}"
 *    heading="Lorem ipsum dolor sit amet">
 *    <capitec-badge
 *        color="transparent"
 *        icon="status/info"
 *        iconSize="small">
 *    </capitec-badge>
 *    <capitec-button
 *        slot="footer"
 *        type="clear"
 *        label="Click">
 *    </capitec-button>
 * </capitec-popover>
 * ```
 *
 */
export class Popover extends Component {
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
		this.messages = [];
		this.currentPage = 0;
		this.clickable = false;
		this.opened = false;
		this.hasHeader = true;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {Array} messages - The popover text.
	 * @property {String} heading - The popover header.
	 *
	 * @property {Number} currentPage - The index of the current page.
	 *
	 * @property {Boolean} [clickable=false] - Indicator if the popover is clickable or not - Always true for mobile and kiosks applications.
	 * @property {Boolean} [opened=false] - Indicator if the popover is opened or not.
	 * @property {Boolean} [hasHeader=true] - Indicator if the popover has a header or not.
	 */
	static get properties() {
		return {
			messages: { type: Array },
			heading: { type: String },
			currentPage: { type: Number },
			clickable: { type: Boolean },
			opened: { type: Boolean },
			hasHeader: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	/**
	 * @ignore
	 * @returns {void}
	 */
	updated() {

		const xPosition = this.offsetLeft - this.scrollLeft + this.clientLeft;

		const windowMiddleX = window.innerWidth / 2;

		if (xPosition <= windowMiddleX) {
			this.setAttribute(`position`, `left`);
		} else {
			this.setAttribute(`position`, `right`);
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Hides the popover.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_hidePopover() {
		this.opened = false;
		this.currentPage = 0;
	}

	/**
	 * Shows the popover.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_showPopover() {
		this.opened = true;
	}

	/**
	 * Reverses the popover opened state.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_togglePopover() {
		this.opened = !this.opened;
		this.currentPage = 0;
	}

	/**
	 * Increments page number.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_incrementPagenumber() {
		this.currentPage++;
	}

	/**
	 * Decrements page number.
	 *
	 * @ignore
	 * @returns {void}
	 */
	_decrementPagenumber() {
		this.currentPage--;
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

				.popover {
					position: relative;
					z-index: unset;
					display: inline-block;
					width: fit-content;
				}

				/* TOOLTIP ACTIVE STATE STYLES */

				.popover.active .container {
					display: block;
				}

				.movable-area {
					width: calc(100% + 50px);
					height: calc(100%);
					position: absolute;
					z-index: 0;
					top: 0;
				}

				/* TRIGGER STYLES */

				.trigger {
					display: inline-block;
					position: relative;
					z-index: var(--theme-popover-trigger-z-index, 10000);
				}

				/* HEADER */

				.header {
					box-sizing: border-box;
					width: 100%;
					border-bottom: var(--theme-popover-border, 1px solid #e1e1e1);
					border-radius: var(--theme-popover-border-radius, 4px) var(--theme-popover-border-radius, 4px) 0 0;
					box-shadow: var(--theme-popover-header-box-shadow, 0 3px 3px -3px rgba(0, 0, 0, 0.2));
					background-color: var(--theme-popover-background-color, #ffffff);
				}

				/* CONTENT STYLES */

				.popup {
					text-align: center;
					position: relative;
					z-index: 2;
					border-radius: var(--theme-popover-border-radius, 4px);
					background-color: var(--theme-popover-background-color, #ffffff);
				}

				.content {
					padding-top: var(--theme-popover-content-padding, 24px);
					padding-left: var(--theme-popover-content-padding, 24px);
					padding-right: var(--theme-popover-content-padding, 24px);
				}

				.heading {
					color: var(--theme-popover-heading-color, #003652);
					font-family: var(--theme-popover-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-popover-heading-font-size, 16px);
					font-weight: var(--theme-popover-font-weight, 600);
					text-align: var(--theme-popover-text-align, left);
					margin-top: 0;
					margin-bottom: var(--theme-popover-text-margin, 16px);
					line-height: var(--theme-popover-line-height, 18px);
				}

				.message {
					color: var(--theme-popover-text-color, #4e6066);
					font-family: var(--theme-popover-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-popover-font-size, 12px);
					text-align: var(--theme-popover-text-align, left);
					margin-top: 0;
					line-height: var(--theme-popover-line-height, 18px);
					margin-bottom: var(--theme-popover-text-margin, 16px);
				}

				.page-number {
					color: var(--theme-popover-text-color, #4e6066);
					font-family: var(--theme-popover-font-family, Arial, Helvetica, sans-serif);
					font-size: var(--theme-popover-font-size, 12px);
					font-weight: var(--theme-popover-font-weight, 600);
					margin: 0;
					padding: 0;
					line-height: var(--theme-popover-pagenumber-line-height, 14px);
					text-align: var(--theme-popover-text-align, left);
				}

				/* FOOTER STYLES */

				.footer {
					padding-bottom: var(--theme-popover-footer-padding-bottom, 8px);
					padding-right: var(--theme-popover-footer-padding-horizontal, 12px);
					padding-left: var(--theme-popover-footer-padding-horizontal, 12px);
				}

				.align-right {
					align-self: flex-end;
					text-align: right;
				}

				/* CONTAINER BOX STYLES */

				.container {
					display: none;
					position: absolute;
					z-index: var(--theme-popover-container-z-index, 9999);
					border-radius: var(--theme-popover-border-radius, 4px);
					width: var(--theme-popover-width, 320px);
					top: -15px;
					line-height: 2;
					border: var(--theme-popover-border, 1px solid #e1e1e1);
					background-color: var(--theme-popover-background-color, #ffffff);
					box-shadow: var(--theme-popover-box-shadow,	0 3px 3px 0 rgba(0, 0, 0, 0.2));
				}

				/* CONTAINER ARROW STYLES */

				.container::before {
					content: " ";
					display: block;
					position: absolute;
					top: 30px;
					z-index: 1;
					width: 20px;
					height: 20px;
					border: var(--theme-popover-border, 1px solid #e1e1e1);
					background-color: var(--theme-popover-background-color, #ffffff);
					box-shadow: var(--theme-popover-box-shadow, 0 3px 3px 0 rgba(0, 0, 0, 0.2));
				}

				/* POSITIONING STYLES */

				:host([position="right"]) .container {
					right: calc(100% + 20px);
					animation: fade 200ms, slide-left 200ms ease;
				}

				:host([position="left"]) .container {
					left: calc(100% + 20px);
					animation: fade 200ms, slide-right 200ms ease;
				}

				:host([position="right"]) .container::before {
					right: 0;
					transform: rotate(45deg) translateY(-15px);
				}

				:host([position="left"]) .container::before {
					left: 0;
					transform: rotate(-45deg) translateY(-15px);
				}

				:host([position="right"]) .movable-area {
					right: -50px;
				}
				
				:host([position="left"]) .movable-area {
					left: -50px;
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

				@keyframes slide-right {
					from {
						left: 100%;
					}
					to {
						left: calc(100% + 20px);
					}
				}

				@keyframes slide-left {
					from {
						right: 100%;
					}
					to {
						right: calc(100% + 20px);
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
		let pageNumber;
		if (this.messages.length > 1) {
			pageNumber = html`
				<p class="page-number">
					${this.currentPage + 1}/${this.messages.length}
				</p>
			`;
		}

		let heading;
		if (this.heading) {
			heading = html`<header class="heading">${this.heading}</header>`;
		}

		return html`
			<div class="popover ${this.opened ? `active` : ``}">
				<div class="container">
					<div class="popup">
						${this._renderheader()}
						<div class="content">
							${heading}
							<p class="message">${this.messages[this.currentPage]}</p>
							${pageNumber}
						</div>
						${this._renderFooter()}
					</div>
				</div>
				<div class="trigger" @click="${() => this._togglePopover()}">
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
		let pageNumber;
		if (this.messages.length > 1) {
			pageNumber = html`
				<p class="page-number">
					${this.currentPage + 1}/${this.messages.length}
				</p>
			`;
		}

		let heading;
		if (this.heading) {
			heading = html`<header class="heading">${this.heading}</header>`;
		}

		return html`
			<div class="popover ${this.opened ? `active` : ``}" @mouseleave="${() => this.clickable ? null : this._hidePopover()}"
				@mouseover="${() => this.clickable ? null : this._showPopover()}">
				<div class="container">
					<div class="movable-area"></div>
					<div class="popup">
						${this._renderheader()}
						<div class="content">
							${heading}
							<p class="message">${this.messages[this.currentPage]}</p>
							${pageNumber}
						</div>
						${this._renderFooter()}
					</div>
				</div>
				<div class="trigger" @click="${() => this.clickable ? this._togglePopover() : null}">
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

	_renderheader() {
		const header = html`
			<div class="header">
				<slot name="header"></slot>
			</div>
		`;

		const slots = this.shadowRoot.querySelectorAll(`slot`);
		slots.forEach((slot) => {
			if (slot.name === `header`) {
				const nodes = slot.assignedNodes();
				if (nodes.length <= 0) {
					this.hasHeader = false;
				}
			}
		});
		return this.hasHeader ? header : html``;
	}

	_renderFooter() {
		let nextBtn;
		if (this.currentPage < this.messages.length - 1) {
			nextBtn = html`
				<capitec-button type="clear" label="Next" @click="${() => {
					this._incrementPagenumber();
				}}">
				</capitec-button>
			`;
		}
		let prevBtn;
		if (this.currentPage > 0) {
			prevBtn = html`
				<capitec-button type="clear" label="Prev" @click="${() => {
					this._decrementPagenumber();
				}}">
				</capitec-button>
			`;
		}
		return html`
			<div class="footer">
				<div class="align-right">${prevBtn} ${nextBtn}</div>
				<div class="align-right">
					<slot name="footer"></slot>
				</div>
			</div>
		`;
	}
}

customElements.define(`capitec-popover`, Popover);