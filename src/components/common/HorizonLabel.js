import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

export class HorizonLabel extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.label = ``;
		this.value = ``;
		this.icon = ``;
		this.textOverflow = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
 	* 
 	* @property {String} [label] - The label string to display.
 	* @property {String} [value] - The value string to display beneath the label.
 */

	static get properties() {
		return {
			label: { type: String },
			value: { type: String },
			icon: { type: String },
			textOverflow: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

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

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.outer-wrapper{
					display: flex;
					flex-direction: row;
					align-items: center;
				}

				capitec-icon {
					width: 24px;
					height: 24px;
					margin-right: 21px;
					
					--theme-icon-size-small: 24px;
				}
				.label-text{
					height: var(--horizon-label-text-height, 21px);
					color: var(--horizon-label-text-color, #4E6066);
					font-family: "Hind Vadodara";
					font-size: var(--horizon-label-text-font-size, 14px);
					font-weight: var(--horizon-label-text-font-weight, 500);
					letter-spacing: 0;
					line-height: var(--horizon-label-text-line-height, 21px);
				}

				.label-value{
					
					--theme-text-select: text;
					margin-top: var(--horizon-label-value-margin-top, 0px);
					height: var(--horizon-label-value-height, 27px);
					color: var(--horizon-label-value-color, #003652);
					font-family: "Hind Vadodara";
					font-size: var(--horizon-label-value-font-size, 18px);
					font-weight: var(--horizon-label-value-font-weight, 600);
					letter-spacing: 0;
					line-height: var(--horizon-label-value-line-height, 27px);
				}
				.label-overflow{
					display: inline-block;
					white-space: nowrap;
					overflow: hidden;
					width: var(--horizon-label-max-overflow-width, 200px);
					line-height: var(--horizon-label-overflow-label-line-height, 24px);
				}
				.ellipsis{
					text-overflow: ellipsis;
				}
				.value-overflow{
					--horizon-label-value-line-height: var(--horizon-label-overflow-value-line-height, 12px);
				}`
		];
	}

	render() {
		return html`
			<div class="outer-wrapper">
				${this._renderIcon()}
				<div class="wrapper">
					<capitec-label
						class="label-text ${this.textOverflow ? `label-overflow ${this.textOverflow}` : ``}"
						label="${this.label}">
					</capitec-label>
					<capitec-label 
						class="label-value ${this.textOverflow ? `value-overflow` : ``}"
						label="${this.value}">
					</capitec-label>
				</div>
			</div>`;
	}

	_renderIcon() {
		if (this.icon) {
			return html`
				<capitec-icon size="small" icon="${this.icon}"></capitec-icon>
			`;
		}
		return html``;
	}
}

window.customElements.define(`horizon-label`, HorizonLabel);