import { Component, css, html } from 'platform/elements';
import { Button } from 'platform/components/buttons/Button'; 
import 'platform/components/popups/Tooltip';

/**
 * A button control with an icon above a label.
 *
 * **Usage**
 * ```html
 * <horizon-option-button
 *   label="The label string to display"
 *   icon="platform icon | null"
 *   iconSize="platform icon size | null"
 *   img-src="path to image | null"
	  >
 * </horizon-option-button>
 * ```
 * 
 * **Events**
 * - ```click``` When the button is clicked.
 */

export class OptionButton extends Button {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();
		
		this.iconPlacement = `top`;
		this.type = `clear`;
		this.badgeText = null;
		this.showTooltip = false;
		this.tooltipMessage = null;
		this.tooltipPosition = `left-edge`;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} [icon] - A platform icon to display.
	 * @property {String} [iconSize] - Used in conjunction with the icon attribute. This is a <capitec-icon>, icon size setting.
	 * @property {String} [img-src] - Path to an image to display. This will only be displayed if icon is NOT provided.
	 * @property {String} [badgeText] - Optional number to display in a badge, top right hand.
	 * @property {String} [showTooltip] - display a tooltip or not
	 * @property {String} [tooltipMessage] - The tooltip text.
	 * @property {String} [tooltipPosition] - Position of the tooltip.
	 */
	static get properties() {
		return {
			label: { type: String },
			icon: { type: String },
			image: { type: String, attribute: `img-src` },
			disabled: { type: Boolean },
			iconSize: { type: String },
			badgeText: { type: String },
			showTooltip: { type: Boolean },
			tooltipMessage: { type: String },
			tooltipPosition: { type: String }
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

	static get styles() {
		return [
			super.styles,
			css`
				.option-button {
					position: relative;
				}
				.badge {
					position: absolute;
					justify-content: flex-end;
					width: 24px;
					right: 8px;
					top: 8px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 12px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 18px;
					text-align: center;
				}

				/* Overriding Button component necessary styles */
				.button.disabled {
					cursor: default;
					filter: grayscale(100%);
					color: #009DE0;
				}
				.button.clear {
					--theme-button-clear-background-color: #FFFFFF;
					--theme-button-clear-border-color: #E1E1E1;
					--theme-button-clear-border-width: 1px;
					--theme-button-clear-font-color: #3A3A3A;
					--theme-check-disabled-background-color: #FFFFFF;
				}
				.button.clear:hover {
					background-color: #FFFFFF;
				}
				capitec-image.spacing {
					margin-bottom: var(--theme-button-icon-spacing, 10px);
				}
			`
		];
	}

	_mobileTemplate() {
		return html`${super._mobileTemplate()}`;
	}

	_webTemplate() {
		return this.showTooltip && this.tooltipMessage
		? html`
			<capitec-tooltip part="tooltip"
				message=${this.tooltipMessage} 
				position=${this.tooltipPosition}>
				${this._renderButton()}
			</capitec-tooltip>`
		: html`
			${this._renderButton()}
		`;
	}

	_renderButton() {
		return html`
			<button
				class="button option-button icon-${this.iconPlacement} ${this.type ? this.type : `secondary`} ${this.disabled ? `disabled` : ``}" 
				@click="${this._buttonClicked}" 
				@keydown="${e => this._keyDown(e)}"
				tabindex="${this.disabled ? `` : 0}">
					${this.renderBadge()}
					${this.icon ? html`<capitec-icon icon="${this.icon}" size="${this.iconSize}" class="${this.label ? `spacing` : `no-spacing`}"></capitec-icon>` : ``}
					${this.image ? html`<capitec-image src="${this.image}" class="spacing"></capitec-image>` : html``}
					${this.label ? html`<div class="label">${this.label}</div>` : ``}
					<slot></slot>
			</button>
		`;
	}

	_kioskTemplate() {
		return html`${super._kioskTemplate()}`;
	}

	renderBadge() {
		return this.badgeText && this.badgeText !== `0` ? html`<capitec-badge class="badge" color="#B71C1A" number="${this.badgeText}"></capitec-badge>` : html``;
	}
}

window.customElements.define(`horizon-option-button`, OptionButton);