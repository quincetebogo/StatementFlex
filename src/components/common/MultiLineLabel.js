import { Component, css, html } from 'platform/elements';

/**
 * Description for your Component here.
 *
 * ```html
 * <component-multi-line-label label="Heading" value="body">
 * </component-multi-line-label>
 * ```
 */
export class ComponentMultiLineLabel extends Component {
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
		this.label = ``;
		this.value = [];
		this.noPadding = false;
	}
	
	// ----------
	// PROPERTIES
	// ----------
	/**
	 * Registry of all properties defined by the component.
	 */
	static get properties() {
		return {
			label: { type: String },
			value: { type: Array },
			noPadding: { type: Boolean, attribute: `no-padding` }
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
					padding: 8px;
				}
				:host([no-padding]) {
					padding: 0px;
				}
				:host([reverse]) capitec-group {
					flex-direction: column-reverse;
				}
				.value {
					height: var(--horizon-multi-line-value-font-size, 12px);
					font-size: var(--horizon-multi-line-value-font-size, 12px);
					line-height: var(--horizon-multi-line-value-line-height, 12px);
					font-weight: var(--horizon-multi-line-value-font-weight, 400);
					--theme-layout-gap-spacing: var(--horizon-multi-line-value-gap, 10px);
				}
				capitec-label{
					height: var(--horizon-multi-line-label-line-height, 20px);
					width: auto;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: var(--horizon-multi-line-label-font-size, 14px);
					font-weight: var(--horizon-multi-line-label-font-weight, 400);
					letter-spacing: 0;
					line-height: var(--horizon-multi-line-label-line-height, 20px);
					text-align: var(--horizon-multi-line-label-align, right);
				}
			`
		];
	}

	_renderValue() {
		if (Array.isArray(this.value) && this.value.length > 0) {
			return html`
					<capitec-group layout="vertical">
						${this.value.map(val => html`<capitec-label class="value" label="${val}"></capitec-label>`)}
					</capitec-group>
				`;
		}
		return html`<capitec-label class="value" label="${this.value}"></capitec-label>`;
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
			<capitec-group layout="vertical" gap="none">
				<capitec-label label="${this.label}" ></capitec-label>
				${this._renderValue()}
			</capitec-group>
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
window.customElements.define(`bb-multi-line-label`, ComponentMultiLineLabel);