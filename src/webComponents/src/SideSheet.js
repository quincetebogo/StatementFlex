import { Component, css, html } from 'platform/elements';

/**
 * Side sheets are surfaces containing supplementary content that are anchored to the left or right edge of the screen.
 *
 * ```js
 * import 'platform/components/popups/SideSheet';
 * ```
 *
 * ```html
 * <capitec-side-sheet alignment="right">
 *     <capitec-label type="Strong" label="Content comes here.."></capitec-label>
 *     <capitec-button type="primary" label="Close" @click="${() => this._showSlidingPanel()}"></capitec-button>
 * </capitec-side-sheet>
 * ```
 *
 */
export class SideSheet extends Component {

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
		this.alignment = `right`;
		this.expanded = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [alignment="right"] - Sets in which direction the side sheet should slide from, either:
	 *    - 'right' - Meaning that the side sheet slides from right to left
	 *    - 'left' - Meaning that the side sheet slides from left to right
	 * @property {Boolean} [expanded=false] - Indicator if the expander is currently expanded.
	 */
	static get properties() {
		return {
			alignment: { type: String },
			expanded: {
				type: Boolean,
				hasChanged: (newVal, oldVal) => oldVal !== null && oldVal !== undefined && newVal !== oldVal
			}
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
	}

	/**
	 * Clean-up the component once removed from the DOM.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	disconnectedCallback() {
		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
	}

	/**
	 * Invoked when one of the element’s observedAttributes changes.
	 *
	 * @param {string} name Attribute name.
	 * @param {string} oldValue Attribute's old value.
	 * @param {string} newValue Attribute's new value.

	 *
	 * @returns {void}
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		super.attributeChangedCallback(name, oldValue, newValue);

		if (name === `expanded` && this.expanded) {
			this.expand();
		} else if (name === `expanded` && !this.expanded) {
			this.collapse();
		} else {
			// do nothing
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

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

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Expand the item to show it's content.
	 *
	 * @fires expand When the item is expanded.
	 * @returns {void}
	 */
	expand() {
		// Trigger the expanding animation.
		this.removeAttribute(`collapsing`);
		this.setAttribute(`expanding`, ``);
	}

	/**
	 * Collapse the item to hide it's content.
	 *
	 * @fires collapse When the item is collapsed.
	 * @returns {void}
	 */
	collapse() {
		// Trigger the collapsing animation.
		this.removeAttribute(`expanding`);
		this.setAttribute(`collapsing`, ``);
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

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: row;
					align-items: stretch;
					position: absolute;
					width: 0%;
					height: 0%;
					left: 0px;
					top: 0px;
					z-index: 100;
					background-color: var(--theme-modal-screen-background-color, rgba(0,0,0,0.6));
					cursor: default;
				}

				:host([alignment=right]) {
					justify-content: flex-end;
				}

				:host([alignment=left]) {
					justify-content: flex-start;
				}

				:host([expanded]) {
					width: var(--theme-side-sheet-expanded-screen-width, 1920px);
					height: var(--theme-side-sheet-expanded-screen-height, 1082px);
				}

				.content {
					width: var(--theme-side-sheet-width, 250px);
					height: var(--theme-side-sheet-height, 250px);
					top: var(--theme-side-sheet-top, 16px);
					background-color: var(--theme-side-sheet-background-color, white);
					position: absolute;
					border-top-left-radius: 4px;
					border-bottom-left-radius: 4px;
				}

				:host([expanded]) > .content {
					display: block;
				}

				/** EXPANDING */

				:host([expanding][alignment=right]) > .content {
					animation: slideLeft 0.6s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
					display: block;
				}

				:host([expanding][alignment=left]) > .content {
					animation: slideRight 0.6s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
					display: block;
				}

				/** COLLAPSING */

				:host([collapsing]) {
					width: var(--theme-side-sheet-collapsing-screen-width, 1920px);
					height: var(--theme-side-sheet-collapsing-screen-height, 1082px);
				}

				:host([collapsing][alignment=right]) > .content {
					animation: collapseRight 0.6s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
					display: block;
				}

				:host([collapsing][alignment=left]) > .content {
					animation: collapseLeft 0.6s;
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;
					display: block;
				}

				/* Hide scrollbar for Chrome, Safari and Opera */
				:host([collapsing]) > .content::-webkit-scrollbar {
					display: none;
				}

				/* Hide scrollbar for IE and Edge */
				:host([collapsing]) > .content {
					-ms-overflow-style: none;
				}

				@keyframes slideLeft {
					0% {
						transform: translateX(50%);
					},
					100% {
						transform: translateX(100%);
					}
				}

				@keyframes slideRight {
					0% {
						transform: translateX(-100%);
					},
					100% {
						transform: translateX(0%);
					}
				}

				@keyframes collapseRight {
					100% {
						transform: translateX(calc(0px + var(--theme-side-sheet-width, 250px)));
					}
				}

				@keyframes collapseLeft {
					100% {
						transform: translateX(calc(0px - var(--theme-side-sheet-width, 250px)));
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
			<div class="content"
				 @animationend=${this._animationCompleted}>
				<slot></slot>
			</div>
		`;
	}
}

window.customElements.define(`capitec-side-sheet`, SideSheet);