import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

/**
 * A control that displays product info.
 *
 * ```js 
 * import 'components/common/HorizonProductTile'; 
 * ```
 * 
 * **Usage**
 * ```html
 * <horizon-product-tile
 *   label="Savings Account"
 *   subtitle="Available Balance"
 *   detail="R7 890.00"
 *   type="transact|save|credit|insure"
 *   navigational="true">
 * </horizon-product-tile>
 * ```
 * 
 * **Events**
 * - ```click``` When the tile is clicked.
 */
export class HorizonProductTile extends Component {

	/**
	 * Initialises the component.
	 *
	 * @hideconstructor
	 */
	constructor() {

		super();
		
		// Set the default property values.
		this.label = ``;
		this.subtitle = ``;
		this.detail = ``;
		this.type = `transact`;
		this.navigational = false;
		this.detailIcon = false;
		this.icon = ``;
        this.selected = false;
		this.disabled = false;
		this.showToolTip = false;
		this.toolTipMessage = ``;
		this.toolTipPosition = `top`;
	}

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} [subtitle] - The sub label string to display.
	 * @property {String} [detail] - The detail string to display.
	 * @property {String} [type="transact"] - The product display type, i.e. "transact", "save", "credit", "insure".
	 * @property {Boolean} [navigational=false] - Whether to display navigation arrow for product tile
	 * @property {String} [icon] - Whether to display/hide icon based on value
     * @property {String} [selected] - Boolean value tells menu is in active state or not
	 * @property {Boolean} [showToolTip] - Boolean to show or hide a tooltip
	 * @property {String} [toolTipMessage] - message displayed on tooltip
	 * @property {String} [toolTipPosition] - To place the position of the tooltip
	 * Note that "default" is still supported, but deprecated.
	 */
	static get properties() {

		return {
			label: { type: String },
			subtitle: { type: String },
			detail: { type: String },
			type: { type: String },
			navigational: { type: Boolean },
			detailIcon: { type: Boolean },
			icon: { type: String },
            selected: { type: Boolean },
			disabled: { type: Boolean },
			showToolTip: {type: Boolean},
			toolTipMessage: {type: String},
			toolTipPosition: {type: String}
        };
	}

	/**
	 * Handles component click events.
	 * 
	 * @param {MouseEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
    _tileClicked(event) {
		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Notify any subscribers that the link was clicked.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
		}));
		// Prevent the event from bubbling up.
		event.stopPropagation();
	}

	/**
	 * Handles component key down events.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_keyDown(event) {

		// Ignore the event if the component is disabled.
		if (this.disabled) {
			return event.stopImmediatePropagation();
		}

		// Intercept space and enter key events to toggle the component checked state.
		const keyCode = (event.code || ``).toUpperCase();

		if (keyCode === `SPACE` || keyCode === `ENTER` || keyCode === `NUMPADENTER`) {

			this.dispatchEvent(new CustomEvent(`click`, {
				detail: {}
			}));

			// Deprecated event
			this.dispatchEvent(new CustomEvent(`on-click`, {
				detail: {}
			}));

			event.stopPropagation();
		}
	}

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

				.tile {
					display: inline-flex;
					flex-direction: row;
					box-sizing: border-box;
					height: var(--theme-product-tile--height, 80px);
					border: var(--theme-product-tile-border, 1px solid #E1E1E1);
					border-radius: var(--theme-product-tile-border-radius, 5.05px);
					background-color: var(--theme-button-default-background-color, #FFFFFF);
					padding: 0px;
					width: 100%;
					position: relative;
					outline:none;
				}

				.tile-container {
					display: inline-flex;
					flex-direction: row;
					box-sizing: border-box;
					height: var(--theme-product-tile--height, 80px);
					background-color: transparent;
					padding: 0px;
					width: 100%;
					position: relative;
				}

				/* Hove & Focus styles */
				.tile:hover {
					cursor: pointer;
				}
				
				.tile.favourites:hover {
					border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.favourites:focus {
					border: var(--theme-product-tile-focus-transact-border, 1.5px solid #009DE0);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.default:hover {
					border: var(--theme-product-tile-hover-default-border, 1px solid #E1E1E1);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.default:focus, .tile.default.selected {
					border: var(--theme-product-tile-focus-default-border, 1px solid #E1E1E1);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.radio-button:hover {
					border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.radio-button:focus, .tile.radio-button.selected {
					border: var(--theme-product-tile-focus-transact-border, 1.5px solid #009DE0);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}
				.tile.radio-button.disabled {
					border: var(--theme-product-tile-disabled-radio-button-border, 1px solid #E1E1E1);
					box-shadow: var(--theme-product-tile-disabled-shadow, none);
					cursor: default;
				}
				.tile.transact:hover {
					border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.transact:focus, .tile.transact.selected {
					border: var(--theme-product-tile-focus-transact-border, 2px solid #009DE0);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.save:hover {
					border: var(--theme-product-tile-hover-save-border, 1px solid #00486D);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.save:focus, .tile.save.selected {
					border: var(--theme-product-tile-focus-save-border, 2px solid #00486D);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.credit:hover {
					border: var(--theme-product-tile-hover-credit-border, 1px solid #C83B37);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.credit:focus, .tile.credit.selected{
					border: var(--theme-product-tile-focus-credit-border, 2px solid #C83C37);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.live-better:hover {
					border: var(--theme-product-tile-hover-live-better-border, 1px solid #1629DA);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.live-better:focus, .tile.live-better.selected{
					border: var(--theme-product-tile-focus-live-better-border, 2px solid #1629DA);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

				.tile.insure:hover {
					border: var(--theme-product-tile-hover-insure-border, 1px solid #5D737E);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.insure:focus, .tile.insure.selected{
					border: var(--theme-product-tile-focus-insure-border, 2px solid #5D737E);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}
				.tile.capitec-connect:focus,
				.tile.capitec-connect:hover {
					border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.capitec-connect:focus, .tile.capitec-connect.selected {
					border: var(--theme-product-tile-focus-transact-border, 2px solid #009DE0);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}
				/* Hove & Focus styles - End*/
				
				/* Overriding product tile component styles when tile is disabled */
				.tile.disabled {
					cursor: default;
					filter: grayscale(100%);
				}
				.tile.disabled:hover {
					border: var(--theme-product-tile-border, 1px solid #E1E1E1);
					box-shadow: none;
				}
				.tile.disabled:focus, .tile.disabled.selected{
					border: var(--theme-product-tile-border, 1px solid #E1E1E1);
					box-shadow: none;
				}
				/* Overriding product tile component styles when tile is disabled - End */

				.product {
					height: calc(var(--theme-product-tile--height, 80px) - 3px);
					width: var(--theme-product-tile-colour-display-width, 57px);
					border-radius:  var(--theme-product-tile-colour-border-radius, 5.05px 0 0 5.05px);
					border-left: var(--theme-product-tile-default-border-left, none);
					display: inline-flex;
					align-items: center;
					justify-content: center;
				}

				.product.default {
					background-color: var(--theme-product-tile-default-colour, #FFFFFF);
				}

				.product.radion-button {
					background-color: var(--theme-product-tile-radio-button-colour, #FFFFFF);
				}

				.product.transact {
					background-color: var(--theme-product-tile-transact-colour, #009DE0);
				}

				.product.credit {
					background-color: var(--theme-product-tile-credit-colour, #C83C37);
				}

				.product.save {
					background-color: var(--theme-product-tile-save-colour, #00486D);
				}

				.product.insure {
					background-color: var(--theme-product-tile-insure-colour, #5D737E);
				}

				.product.live-better {
					background-color: var(--theme-product-tile-live-better-colour, #FFFFFF);
				}

				.product.capitec-connect {
					background-color: var(--theme-product-tile-transact-colour, #009DE0);
					background-size: cover;
					background-repeat: no-repeat;
				}

				.heading {
					margin-left: var(--theme-product-tile-heading-margin-left, 20px);
					margin-top: var(--theme-product-tile-heading-margin-top, 8px);
				}
				
				.title {
					height: var(--theme-product-tile-title-height, 36px);
					font-family: var(--theme-font-family, "Hind Vadodara");
					font-size: var(--theme-product-tile-title-font-size, 24px);
					font-weight: var(--theme-product-tile-title-font-weight, 600);
					line-height: var(--theme-product-tile-title-height, 36px);
					text-align: left;
				}
				.fav-icon{
					height:23px;
					width:24px;
					margin: 24px 0px 24px 23px;
				}
				.title.favourites{
					color: black;
				}

				.title.default, .title.radio-button {
					color: var(--theme-product-tile-default-colour, #3A3A3A);
				}

				.title.transact {
					color: var(--theme-product-tile-transact-colour, #009DE0);
				}

				.title.save {
					color: var(--theme-product-tile-save-colour, #00486D);
				}

				.title.credit {
					color: var(--theme-product-tile-credit-colour, #C83C37);
				}

				.title.insure {
					color: var(--theme-product-tile-insure-colour, #5D737E);
				}

				.title.live-better {
					color: var(--theme-product-tile-live-better-colour, #1629DA);
				}

				.title.capitec-connect {
					color: var(--theme-product-transact-colour, #009DE0);
				}

				.subtitle {
					height: var(--theme-product-tile-subtitle-height, 27px);
					color: var(--theme-product-tile-subtitle-color, #4E6066);
					font-family: var(--theme-font-family, "Hind Vadodara");
					font-size: var(--theme-product-tile-subtitle-font-size, 18px);
					line-height: var(--theme-product-tile-subtitle-height, 27px);
					text-align: left;
				}

				.detail {
					display: inline-flex;
					flex-direction: row;
					position: absolute;
					align-items: center;
					justify-content: center;
					right: var(--theme-product-tile-detail-right, 26px);
					top: var(--theme-product-tile-detail-top, 25px);
					height: var(--theme-product-tile-detail-height, 30px);
					color: var(--theme-product-tile-subtitle-color, #4E6066);
					font-family: var(--theme-font-family, "Hind Vadodara");
					font-size: var(--theme-product-tile-detail-font-size, 20px);
					font-weight: var(--theme-product-tile-title-font-weight, 600);
					line-height: var(--theme-product-tile-detail-height, 30px);
					text-align: right;
					--theme-product-tile-detail-height:20px;
				}

				.detail.nav {
					right: var(--theme-product-tile-nav-right, 16px);
				}

				.nav-icon {
					margin-left: var(--theme-product-tile-nav-icon-margin-left, 16.25px);
				}
				.nav-icon-right{
					width : 20px;
					height : 20px;
				}
				.hide-icon{
					display: none;
				}

				.radio-container {
					display: flex;
					align-items: center;
				}

				/* RADIO BUTTON STYLES */

				.radio-container > #content {
					box-sizing: border-box;
					cursor: pointer;

					display: flex;
					align-items: center;
					justify-content: center;

					width: var(--theme-radio-width, 22px);
					height: var(--theme-radio-height, 22px);

					background-color: var(--theme-radio-background-color, #FFFFFF);

					border-width: var(--theme-radio-border-width, 1px);
					border-style: solid;
					border-color: var(--theme-radio-border-color, #009DE0);
					border-radius: var(--theme-radio-border-radius, 50%);
					
					outline: 0;
				}
				
				.radio-container.checked > #content > .indicator {
					width: 100%;
					height: 100%;

					border-width: var(--theme-radio-indictor-border-width, 1px);
					border-style: solid;
					border-color: var(--theme-radio-indictor-border-color, #FFFFFF);
					border-radius: var(--theme-radio-border-radius, 50%);

					color: var(--theme-radio-indictor-color, #FFFFFF);
				}
				
				/* CHECKED STATE STYLES */

				.radio-container.checked > #content {
					background-color: var(--theme-radio-checked-background-color, #0096DA);
				}
				
				/* HOVER STATE STYLES */

				.radio-container > #content:hover {
					box-shadow: var(--theme-radio-hover-box-shadow,0 0 4px 4px #e6f7ff);
					background-color: var(--theme-radio-hover-background-color,#e6f7ff);
				}

				.radio-container.checked:hover > #content {
					background-color: var(--theme-radio-checked-background-color, #0096DA);
				}
				/* DISABLED STATE STYLES */

				.radio-container.disabled > #content {
					cursor: default;
					border-color: var(--theme-radio-disabled-border-color, #E1E1E1);
					background-color: var(--theme-radio-disabled-background-color, #F7F7F7);
				}

				.radio-container.disabled:hover > #content {
					box-shadow: none;
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

	_tileState() {
		if (this.disabled) {
			return ` disabled`;
		}

		if (this.selected) {
			return ` selected`;
		}

		return ``;
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return this.showToolTip
		? html`
			<capitec-tooltip 
				message=${this.toolTipMessage} 
				position=${this.toolTipPosition}>
				${this._renderButton()}
			</capitec-tooltip>`
		: html`
			${this._renderButton()}
		`;
	} 

	_renderButton() {
		return html`
			<button 
				class="tile ${this.type ? this.type : `transact`}${this._tileState()}"
				@click="${(e) => this._tileClicked(e)}"
				@keydown="${e => this._keyDown(e)}"
				tabindex="${this.disabled ? `` : 0}">
					<div class="tile-container">
						${this._renderProduct()}
						<div class="heading">
							<div class="title ${this.type ? this.type : `transact`}">${this.label}</div>
							<div class="subtitle">${this.subtitle}</div>
						</div>
						<div class="detail${this.navigational ? ` nav` : ``}">
							${this.detail.substring(1) > 999 ? formatCurrency(this.detail) : this.detail}
							${this.detailIcon ? html`<capitec-icon class="nav-icon-right" icon="system/add-action"></capitec-icon>` : ``}
							${this.navigational ? html`<capitec-icon size="small" class="nav-icon" icon="system/chevron-right-action"></capitec-icon>` : ``}
							<slot name="detail"></slot>
						</div>
					</div>
			</button>
		`;
	}

	_renderRadioIcon() {
		return html`
			<div class="radio-container${this.selected ? ` checked` : ``}${this.disabled ? ` disabled` : ``}">
				<div id="content" tabindex="${this.disabled ? `` : 0}">
					${this.selected ? html`<div class="indicator"></div>` : ``}
				</div>
			</div>
		`;
	}

	_renderProduct() {        
        if (this.type === `radio-button`) {
            
			return html`
				<div class="product radion-button">
					${this._renderRadioIcon()}
				</div>
			`;
		}

		if (this.type === `live-better`) {
			return html`
				<div class="product ${this.type ? this.type : `transact`}">
					<img alt="liveBetter" src="images/common/mask.png" style="object-fit: fill">
				</div>
			`;
		}

		if (this.type === `capitec-connect`) {
			return html`
				<div class="product ${this.type ? this.type : `transact`}">
					<img alt="liveBetter" src="images/liveBetter/capitec-connect-white.svg" style="object-fit: fill">
				</div>
			`;
		}

		return html`
			${this.icon 
				? html`<div class="product ${this.type ? this.type : `transact`}">
							<capitec-icon
								class="icon"
								icon="${this.icon ? this.icon : `product/${this.type}-white`}">
							</capitec-icon>
						</div>`
				: html``
			}
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

window.customElements.define(`horizon-product-tile`, HorizonProductTile);