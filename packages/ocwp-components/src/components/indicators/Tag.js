import { Component, css, html } from '../../elements/index.js';

export const TAGTYPE = {
	INFO: `info`,
	SUCCESS: `success`,
	WARNING: `warning`,
	ERROR: `error`,
	CUSTOM: `custom`
};

/**
 * A tag control used to visually label and identify.
 *
 * ```js 
 * import 'platform/components/indicators/Tag'; 
 * ```
 * 
 * ```html
 * <capitec-tag 
 *   label="TAGNAME"
 *   label-color="#4E6066"
 *   color="#4E6066"
 *   type=`info`>
 * </capitec-tag>
 * ```
 *
 * @prop {"info"|"success"|"warning"|"error"|"custom"|String} type - type of the tag.
 */
export class Tag extends Component {

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
		this.label = ``;
		this.labelColor = ``;
		this.color = ``;
		this.type = TAGTYPE.CUSTOM;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} [labelColor="#4E6066"] - The css color of the tag label. Valid values are css color names e.g. 'red', color hex e.g. '#70AF00', color rgb values e.g. 'rgb(255,4,1)'. Type custom required.
	 * @property {String} [color="#4E6066"] - The css color of the tag background. Valid values are css color names e.g. 'red', color hex e.g. '#70AF00', color rgb values e.g. 'rgb(255,4,1)'. Type custom required.
	 * @property {String} [type="info"] - Set the tag type:
	 * - info Type variation
	 * - success Type variation
	 * - warning Type variation
	 * - error Type variation
	 * - custom Type variation - color and label-color required when using this variation
	 */
	static get properties() {

		return {
			label: { type: String },
			labelColor: { type: String, attribute: `label-color` },
			color: { type: String },
			type: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

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

				:host([type="info"]) > button > .tag-container {
					background-color: var(--theme-tag-info-background-color, #DAF2F4);
					color: var(--theme-tag-info-font-color, #08A6B5);
				}

				:host([type="success"]) > button > .tag-container {
					background-color: var(--theme-tag-success-background-color, #EAF3D9);
					color: var(--theme-tag-success-font-color, #5A9600);
				}

				:host([type="warning"]) > button > .tag-container {
					background-color: var(--theme-tag-warning-background-color, #F9EBDD);
					color: var(--theme-tag-warning-font-color, #D4781C);
				}

				:host([type="error"]) > button > .tag-container {
					background-color: var(--theme-tag-error-background-color, #F7E2E1);
					color: var(--theme-tag-error-font-color, #C83B37);
				}

				.tag {
					position: relative;
					display: inline-flex;
					box-sizing: border-box;
					display: flex;
					flex-direction: row;
					align-items: center;
					padding: 0px;
					border-width: 0px;
					border-style: outset;
					border-image: initial;
					background-color: transparent;
					outline: none;
				}
								
				.tag-container {
					position: relative;
					display: inline-flex;
					box-sizing: border-box;
					display: flex;
					flex-direction: row;
					align-items: center;
					border-radius: var(--theme-tag-border-radius, 16px);
					padding-top: var(--theme-tag-label-padding, 8px);
					padding-bottom: var(--theme-tag-label-padding, 8px);
				}
				
				.label {
					position: relative;
					font-family: var(--theme-font-family);
					font-size: var(--theme-tag-font-size, 12px);
					font-weight: 600;
					line-height: var(--theme-tag-label-line-height, 14px);
					text-align: center;
					margin-left: var(--theme-tag-label-margin, 16px);
					margin-right: var(--theme-tag-label-margin, 16px);
					height: var(--theme-tag-label-height, 13px);
				}

				.icon {
					position: relative;
					padding-right: var(--theme-tag-icon-padding, 4px);
					padding-top: var(--theme-tag-icon-padding, 4px);
					padding-bottom: var(--theme-tag-icon-padding, 4px);
					cursor: pointer;
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
			<button class="tag" >
				<div class="tag-container" style="${this.type === TAGTYPE.CUSTOM ? `background-color:${this.color};` : ``}">
					<div class="label" style="${this.type === TAGTYPE.CUSTOM ? `color:${this.labelColor};` : ``}">${this.label}</div>
				</div>
			</button>
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

window.customElements.define(`capitec-tag`, Tag);