import { Component, css, html } from '../../elements/index.js';

import '../core/Label.js';
import '../core/Icon.js';
import '../layouts/Group.js';
import '../layers/ContentBox.js';

/**
 * A layout component that groups together content in an expanded box such as Client Insights, access information etc.
 *
 * ```js
 * import 'platform/components/containers/Expander';
 * ```
 *
 * ```html
 * <capitec-expander-group modeset="single">
 *     <capitec-expander icon="system/client-insights" label="Client Insights">
 *         <capitec-label label="No Records Found"></capitec-label>
 *     </capitec-expander>
 *     <capitec-expander icon="system/access" label="Access">
 *         <capitec-label label="No Records Found"></capitec-label>
 *     </capitec-expander>
 *     <capitec-expander icon="system/notes" label="Notes">
 *         <capitec-label label="No Records Found"></capitec-label>
 *     </capitec-expander>
 *     <capitec-expander icon="system/knowledge" label="Knowledge Base">
 *         <capitec-label label="No Records Found"></capitec-label>
 *     </capitec-expander>
 * </capitec-expander-group>
 * ```
 *
 */
export class Expander extends Component {
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();

		// Set the default property values.
		this.label = null;
		this.icon = null;

		this.expanded = false;
		this.disabled = false;

		this.layout = `vertical`;
		this.halign = `stretch`;
		this.valign = `top`;
		this.expandButtonAlignment = `right`;
		this.gap = `clear`;
		this.noPadding = false;
		this.wrap = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} label - The label data associated with expander.
	 * @property {String} icon - The icon to display on the expander.
	 *
	 * @property {Boolean} [expanded=false] - Indicator if the expander is currently expanded.
	 * @property {Boolean} [disabled=false] - Indicator if the expander is currently disabled.
	 *
	 * @property {LayoutAttribute} [layout=vertical] - The component content area layout.
	 * @property {HAlignAttribute} [halign=stretch] - The component content area horizontal item alignment.
	 * @property {VAlignAttribute} [valign=top] - The component content area vertical item alignment.
	 * @property {GapAttribute} [gap=clear] - The component content area item gap.
	 * @property {Boolean} [noPadding=false] - Suppresses the component content padding.
	 * @property {Boolean} [wrap=false] - Wrap the component content to a next line if needed.
	 * @property {String} [expandButtonAlignment="right"] - Sets in which direction the expander's arrow should be position relative to the title, either:
	 *    - 'right' - Meaning that the expander button is placed to the right of the title
	 *    - 'left' - Meaning that the expander button is placed to the left of the title
	 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },

			expanded: { type: Boolean },
			disabled: { type: Boolean },

			layout: { type: String },
			halign: { type: String },
			valign: { type: String },
			expandButtonAlignment: { type: String },
			gap: { type: String },
			noPadding: { type: Boolean },
			wrap: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	/**
	 * Setup the component once added to the DOM.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	connectedCallback() {
		// Ensure the component is setup correctly.
		super.connectedCallback();

		// Listen for child label change events.
		this.addEventListener(`animationend`, this._animationCompleted);
	}

	/**
	 * Clean-up the component once removed from the DOM.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	disconnectedCallback() {
		// Stop listening for child label change events.
		this.removeEventListener(`animationend`, this._animationCompleted);

		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handles component click events.
	 *
	 * @ignore
	 *
	 * @param {MouseEvent} event - The event details.
	 *
	 * @returns {void}
	 */
	_click(event) {
		// Prevent the event from bubbling up.
		event.stopPropagation();

		// Ignore the click event if the item is disabled.
		if (this.disabled) {
			return;
		}

		// Toggle the expanded state of the item.
		if (this.expanded) {
			this.collapse();
		} else {
			this.expand();
		}
	}

	/**
	 * Cleans up component animations upon completion.
	 *
	 * @ignore
	 *
	 * @param {AnimationEvent} event - The event details.
	 *
	 * @returns {void}
	 */
	_animationCompleted(event) {
		// Remove the expanding animation, if set.
		if (this.hasAttribute(`expanding`)) {
			this.removeAttribute(`expanding`);
			this.expanded = true;
		}

		// Remove the collapsing animation, if set.
		if (this.hasAttribute(`collapsing`)) {
			this.removeAttribute(`collapsing`);
			this.expanded = false;
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Expand the item to show it's content.
	 *
	 * @fires expand When the item is expanded.
	 * @returns {void}
	 */
	expand() {
		// Ignore the request to expand if the component is already expanded.
		if (this.expanded === true || this.hasAttribute(`expanding`)) {
			return;
		}

		// Trigger the expanding animation.
		this.removeAttribute(`collapsing`);
		this.setAttribute(`expanding`, ``);

		// Notify any direct subscribers that the component was expanded.
		this.dispatchEvent(new CustomEvent(`expand`, {
			detail: {
				label: this.label
			}
		}));
	}

	/**
	 * Collapse the item to hide it's content.
	 *
	 * @fires expand When the item is expanded.
	 * @returns {void}
	 */
	collapse() {
		// Ignore the request to collapse if the component is already collapsed.
		if (this.expanded === false || this.hasAttribute(`collapsing`)) {
			return;
		}

		// Trigger the collapsing animation.
		this.removeAttribute(`expanding`);
		this.setAttribute(`collapsing`, ``);

		// Notify any direct subscribers that the component was collapsed.
		this.dispatchEvent(new CustomEvent(`collapse`, {
			detail: {
				label: this.label
			}
		}));
	}

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

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					min-height: var(--theme-expander-header-height, 50px);
					max-height: var(--theme-expander-header-height, 50px);
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;
					width: var(--theme-expander-width, 100%);
					background-color: var(--theme-expander-background-color, white);
				}

				:host([expanded]) {
					max-height: unset;
					height: var(--theme-expander-height, 200px);
				}

				:host([expanded].styled) {
					box-shadow: var(--theme-expander-box-shadow, 0px 1px black);
				}

				:host([expanding].styled) {
					box-shadow: var(--theme-expander-box-shadow, 0px 1px black);
				}

				/* HEADER */

				:host > .header {
					width: var(--theme-expander-header-width, 100%);
					height: var(--theme-expander-header-height, 50px);
					padding: var(--theme-expander-header-padding, 10px);
					border-top: var(--theme-expander-border, 1px solid black);
					cursor: pointer;
				}

				:host(*.styled) > .header {
					border-radius: var(--theme-expander-border-radius, 5px);
				}

				:host > .header:hover {
					background-color: var(--theme-system-hover-color);
				}

				:host > .header > .indicator {
					width: var(--theme-expander-indicator-width, 20px);
					height: var(--theme-expander-indicator-height, 20px);
				}

				:host > .header > .icon {
					width: var(--theme-expander-icon-width, 20px);
					height: var(--theme-expander-icon-height, 20px);
				}

				:host > .header > capitec-label {
					color: var(--theme-expander-header-font-color, black);
					font-size: var(--theme-expander-header-font-size, 14px);
					font-weight: var(--theme-expander-header-font-weight, bold);
					margin-right: auto;
					cursor: pointer;
				}

				:host([disabled]) > .header {
					cursor: default;
				}

				:host([disabled]) > .header > .indicator {
					filter: grayscale(1);
				}

				:host([disabled]) > .header > capitec-label {
					cursor: default;
				}

				:host([expanded]) > .header {
					border-bottom-left-radius: 0px;
					border-bottom-right-radius: 0px;
				}

				:host([expanded]) > .header > .indicator {
					transform: rotate(180deg);
				}

				:host(:not([expanded])) > .header > .indicator {
					transform: none;
				}

				/* CONTENT */

				:host > .content {
					border-left: var(--theme-expander-border, 1px solid black);
					border-right: var(--theme-expander-border, 1px solid black);
					border-top: var(--theme-expander-border, 1px solid black);
					align-content: flex-start;
				}

				:host(*.styled[expanded]) > .content {
					border-bottom: var(--theme-expander-border, 1px solid black);
					border-bottom-left-radius: var(--theme-expander-border-radius, 5px);
					border-bottom-right-radius: var(--theme-expander-border-radius, 5px);
				}

				:host(:not([expanded])) > .content {
					overflow: hidden;
					padding-top: var(--theme-expander-content-padding-top, 0px);
					padding-bottom: var(--theme-expander-content-padding-bottom, 0px);
				}

				/** ANIMATIONS */

				:host([noanimate]) {
					animation-duration: 0s;
				}

				:host([expanding]) {
					animation: expand 0.5s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
				}

				:host([expanding]) > .header > .indicator {
					transition: all 0.15s linear 0s;
					transform: rotate(180deg);
				}

				:host([collapsing]) > .header > .indicator {
					transition: all 0.15s linear 0s;
					transform: none;
				}

				:host([expanding]) > .content {
					transition: padding linear 0.2s;
					padding-top: var(--theme-container-padding-top, 10px);
					padding-bottom: var(--theme-container-padding-bottom, 10px);
				}

				:host([expanding],[noPadding]) > .content {
                    transition: padding linear 0.2s;
                    padding-top: var(--theme-container-no-padding-top, 0px);
                    padding-bottom: var(--theme-container-no-padding-bottom, 0px);
                }

				:host([collapsing]) > .content {
					overflow: hidden;
				}

				/* Hide scrollbar for Chrome, Safari and Opera */
				:host([collapsing]) > .content::-webkit-scrollbar {
					display: none;
				}

				/* Hide scrollbar for IE and Edge */
				:host([collapsing]) > .content {
					-ms-overflow-style: none;
				}

				:host([collapsing]) {
					animation: collapse 0.5s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
				}

				@keyframes expand {
					0% {
						max-height: var(--theme-expander-header-height, 50px);
						height: var(--theme-expander-header-height, 50px);
					}
					99% {
						max-height: var(--theme-expander-expanding-max-height, 100vh);
						height: var(--theme-expander-height, 200px);
					}
					100% {
						max-height: unset;
						height: var(--theme-expander-height, 200px);
					}
				}

				@keyframes collapse {
					0% {
						max-height: var(--theme-expander-height, 200px);
						overflow: hidden;
					}
					100% {
						max-height: var(--theme-expander-header-height, 50px);
						overflow: hidden;
					}
				}
			`
		];
	}

	_renderExpanderButton() {
		if (this.icon) {
			return html`
				<capitec-icon class="icon" icon="${this.icon}"></capitec-icon>
				${this.label ? html`<capitec-label type="strong" label="${this.label}"></capitec-label>` : html`<capitec-spacer></capitec-spacer>`}
				<capitec-icon class="indicator right" icon="system/chevron-down-action"></capitec-icon>
			`;
		}
		return html`
				${this.expandButtonAlignment === `left` ? html`<capitec-icon class="indicator left" icon="system/chevron-down-action"></capitec-icon>` : html``}
				${this.label ? html`<capitec-label type="strong" label="${this.label}"></capitec-label>` : html`<capitec-spacer></capitec-spacer>`}
				${this.expandButtonAlignment === `right` ? html`<capitec-icon class="indicator right" icon="system/chevron-down-action"></capitec-icon>` : html``}
			`;
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
			<capitec-group class="header" layout="horizontal" halign="left" valign="center" @click="${(e) => this._click(e)}">
				${this._renderExpanderButton()}
			</capitec-group>

			<capitec-content-box class="content" layout="${this.layout}" halign="${this.halign}" valign="${this.valign}" gap="${this.gap}" ?noPadding="${this.noPadding}" ?wrap="${this.wrap}">
				<slot></slot>
			</capitec-content-box>
			`;
	}
}

window.customElements.define(`capitec-expander`, Expander);

/**
 * Notify direct subscribers that the component was collapsed.
 *
 * @example
 * <capitec-expander ... @collapse="${this._handler}"></capitec-expander>
 *
 * @event Expander#collapse
 * @type {Object}
 * @property {Object} detail Event object.
 * @property {String} detail.label Label value.
 */

/**
 * Notify direct subscribers that the component was expanded.
 *
 * @example
 * <capitec-expander ... @expand="${this._handler}"></capitec-expander>
 *
 * @event Expander#expand
 * @type {Object}
 * @property {Object} detail Event object.
 * @property {String} detail.label Label value.
 */