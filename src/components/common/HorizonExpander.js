import { Component, css, html } from 'platform/elements';

const INPUT_TYPES = {
	CHECKBOX: `Checkbox`
};

/**
 * A generic component that replicates the platform expander with few add-on properties.
 *
 * ```js
 * import 'app/components/common/HorizonExpander';
 * ```
 *
 * ```html
 * <horizon-expander 
	* label="Client Insights"
	* icon="system/access"
	* inputType="checkbox"
	* expandButtonAlignment="right | left"
	* layout="vertical"
	* halign="stretch"
	* valign="top"
	* gap="clear"
	* wrap=false
	* noPadding=false
	* expanded=false
	* disabled=false>
	* <capitec-label slot="custom-header" label="No Records Found"></capitec-label>
	* <capitec-label slot="content" label="No Records Found"></capitec-label>
 * </horizon-expander>
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
		this.label = ``;
		this.icon = ``;
		this.inputType = ``;

		this.expanded = false;
		this.disabled = false;
		this.selected = false;

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
	 * @property {String} inputType - Input type (Checkbox | ``).
	 *
	 * @property {Boolean} [expanded=false] - Indicator if the expander is currently expanded.
	 * @property {Boolean} [disabled=false] - Indicator if the expander is currently disabled.
	 * @property {Boolean} [selected=false] - Boolean value tells if checkbox/input is selected or not or not
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
	 *    -  Only either of the label or slot='custom-header' can be used for an instance
	 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			inputType: { type: String },
			
			expanded: { type: Boolean },
			disabled: { type: Boolean },
			selected: { type: Boolean },

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
				label: this.label,
				expanderGroup: (component) => this.expanderGroupMode(component)
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

	/**
	 * Collapse all the other expanders except the current target expander in the component when given expand as an event.
	 */

	expanderGroupMode(component) {
		component.shadowRoot.querySelectorAll(`horizon-expander`).forEach((item) => {
			item.expanded = false;
		});
	}

	/**
	 * Provides status of the check-box
	 * 
	 * @fires value-change When the check-box value is changed.
	 * @returns {void}
	 */

	 _onValueChange(e) {

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: e.detail.old,
				new: e.detail.new,
				currentTarget: e.target.checked
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
					height: var(--theme-expander-height, 100%);
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
					border: 1px solid #E1E1E1;
					border-left: var(--theme-expander-border-left, 1px solid #E1E1E1);
					cursor: pointer;
					padding: var(--theme-expander-header-padding, 0px);
					border-radius:4px;
					min-height: 64px;
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
				.content{
					padding: 0px;
				}

				:host > .content {
					//border-left: var(--theme-expander-border, 1px solid black);
					//border-right: var(--theme-expander-border, 1px solid black);
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
					//padding-top: var(--theme-container-padding-top, 10px);
					//padding-bottom: var(--theme-container-padding-bottom, 10px);
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

				.indicator.right{
					height: 24px;
					width: 24px;
					margin: 20px;
				}

				.input {
					margin-left: var(--theme-expander-check-box-margin-left, 16px);
				}

				capitec-label {
					padding-left: var(--horizon-expander-header-padding-left, 0px);
				}
				
				slot[name="custom-header"] {
					display: flex;
					padding-left: var(--horizon-expander-header-padding-left, 0px);
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

	_renderExpanderTile() {
		return html`
			${this.expandButtonAlignment === `left`
				? html`<capitec-icon class="indicator-left" icon="system/chevron-down-action"></capitec-icon>`
				: html``}
			${this._renderInput()}
			${this._renderIcon()}
			${this._renderTileHeader()}
			${this.expandButtonAlignment === `right`
				? html`<capitec-spacer></capitec-spacer><capitec-icon class="indicator right" icon="system/chevron-down-action"></capitec-icon>`
				: html``}
		`;
	}

	_renderInput() {
		switch (this.inputType) {
			case INPUT_TYPES.CHECKBOX:
				return html`
						<capitec-check
							class="input"
							?checked = "${this.selected}"
							?disabled = "${this.disabled}"
							@value-changed="${(e) => this._onValueChange(e)}">
						</capitec-check>`;
			default:
				return html``;
		}
	}

	_renderIcon() {
		return this.icon
			? html`<capitec-icon class="icon" icon="${this.icon}"></capitec-icon>`
			: html``;
	}

	_renderTileHeader() {
		return this.label
			? html`<capitec-label type="strong" label="${this.label}"></capitec-label>`
			: html`<slot name="custom-header"></slot>`;
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
				${this._renderExpanderTile()}
			</capitec-group>

			<capitec-content-box class="content"
				layout="${this.layout}"
				halign="${this.halign}"
				valign="${this.valign}"
				gap="${this.gap}"
				?noPadding="${this.noPadding}"
				?wrap="${this.wrap}">
					<slot name="content"></slot>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`horizon-expander`, Expander);

/**
 * Notify direct subscribers that the component was collapsed.
 *
 * @example
 * <horizon-expander ... @collapse="${this._handler}"></horizon-expander>
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
 * <horizon-expander ... @expand="${this._handler}"></horizon-expander>
 *
 * @event Expander#expand
 * @type {Object}
 * @property {Object} detail Event object.
 * @property {String} detail.label Label value.
 */