import { Component, css, html } from '../../elements/index.js';

/**
 * A layout container that groups expanders, allowing for automatic expanding and collapsing of sibling expander controls.
 *
 * ```js
 * import 'platform/components/containers/ExpanderGroup';
 * ```
 *
 * ```html
 * <capitec-expander-group modeset="single" expanderStyle="simple">
 *   <capitec-expander label="Section 1" expanded>
 *       <capitec-label type="title" label="Your content here!"></h1>
 *   </capitec-expander>
 *
 *   <capitec-expander label="Section 2">
 *       <capitec-label type="title" label="Your content here!"></h1>
 *   </capitec-expander>
 * </capitec-expander-group>
 * ```
 *
 */
export class ExpanderGroup extends Component {

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();

		// Set the default property values.
		this.modeset = `single`;
		this.expanderStyle = `simple`;
		this.hasFocus = false;
		this.focussedChildIndex = -1;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [modeset="single"] The modeset type associated with expander group, either:
	 *    - `single` Allows only a single expander to be open at any given time.
	 *    - `multiple` Allows more than 1 expander to be open at any given time.
	 * @property {String} [expanderStyle="simple"] The style of the expanders, either:
	 *    - 'simple' Which is the basic design
	 *    - 'styled' Which is the design using icons
	 */
	static get properties() {
		return {
			modeset: { type: String },
			expanderStyle: { type: String },
			hasFocus: { type: Boolean, attribute: false }
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
		if (this.expanderStyle === `styled`) {
			this.querySelectorAll(`capitec-expander`).forEach((item) => {
				item.setAttribute(`class`, `styled`);
			});
		}

		this.componentFocusContext = this._handleChildFocus.bind(this);
		window.addEventListener(`keydown`, this.componentFocusContext);

		// Setup an observer to detect any changes to the attributes of direct child components.
		this._observer = new MutationObserver((mutations) => {
			for (const mutation of mutations) {
				if (
					mutation.type === `attributes` &&
					((mutation.attributeName === `expanding` &&
						mutation.target.hasAttribute(`expanding`)) ||
						(mutation.attributeName === `expanded` &&
							mutation.target.hasAttribute(`expanded`)))
				) {
					// Apply the expander group item expansion policy.
					this._childExpanded(mutation.target);
				}
			}
		});

		// Start observing child attribute changes.
		this._observer.observe(this, {
			attributes: true,
			attributeFilter: [`expanded`, `expanding`],
			subtree: true
		});
	}

	/**
	 * Clean-up the component once removed from the DOM.
	 *
	 * @ignore
	 *
	 * @returns {void}
	 */
	disconnectedCallback() {
		// Stop observing child attribute changes.
		if (this._observer) {
			this._observer.disconnect();
		}

		this.componentFocusContext = this._handleChildFocus.bind(this);
		window.removeEventListener(`keydown`, this.componentFocusContext);
		// Ensure the component is cleaned up correctly.
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handles the expansion and collapse of the children expanders to allow for keyboard navigation
	 *
	 * @param {Event} keyEvent The key event
	 *
	 * @returns {void}
	 */
	_handleChildFocus(keyEvent) {
		if (this.hasFocus) {
			const expanders = this.querySelectorAll(`capitec-expander`);
			this._collapseAllExpanders();
			if (keyEvent.keyCode === 38 && this.focussedChildIndex !== -1) {
				this.focussedChildIndex--;
				if (this.focussedChildIndex !== -1) {
					expanders[this.focussedChildIndex].expand();
				}
			} else if (
				keyEvent.keyCode === 40 &&
				this.focussedChildIndex < expanders.length
			) {
				this.focussedChildIndex++;
				if (this.focussedChildIndex < expanders.length) {
					expanders[this.focussedChildIndex].expand();
				}
			}
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
	 * Collapses all of the children expanders
	 *
	 *
	 * @returns {void}
	 */
	_collapseAllExpanders() {
		this.querySelectorAll(`capitec-expander`).forEach((item) => {
			item.collapse();
		});
	}

	/**
	 * Applying the item expansion policy to collapse other child items, when a child item has expanded.
	 *
	 * @ignore
	 *
	 * @param {Element} child - The child element that was expanded.
	 *
	 * @returns {void}
	 */
	_childExpanded(child) {
		// Collapse all expanders in the group, except for the one just expanded, if only 1 expander in the group may be open at a time.
		if (this.modeset === `single`) {
			this.querySelectorAll(`capitec-expander`).forEach((item) => {
				if (item !== child) {
					item.collapse();
				}
			});
		}
	}

	_hasFocus() {
		this.hasFocus = true;
		this._collapseAllExpanders();
	}

	_losesFocus() {
		this.hasFocus = false;
		this.focussedChildIndex = -1;
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

			/* ---------- LAYOUT POLICY ---------- */
			css`
				:host {
					min-width: var(--theme-expander-group-container-min-width, 200px);
					min-height: var(--theme-expander-group-container-min-height, 100px);
				}
			`,

			/* ---------- COMPONENT STYLING ---------- */
			css`
				:host {
					display: flex;
					flex-direction: column;
					justify-content: stretch;
					align-items: stretch;
				}

				::slotted(*.styled) {
					margin-bottom: var(--theme-expander-group-item-gap, 10px);
				}

				::slotted(*) {
					margin-bottom: var(--theme-expander-group-container-margin-bottom, 0px);
				}

				::slotted(*[expanded]) {
					flex: 1 1 auto;
				}

				.expander-container:focus {
					outline-color: var(--theme-input-hover-border-color);
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
		<capitec-group layout="vertical" class="expander-container" tabindex="0" @focus="${() => this._hasFocus()}" @blur="${() => this._losesFocus()}">
			<slot></slot>
		</capitec-group>`;
	}
}

window.customElements.define(`capitec-expander-group`, ExpanderGroup);