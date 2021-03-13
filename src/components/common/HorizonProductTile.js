import { Component, css, html } from 'platform/elements';

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
		this.tileIcon = ``;
		this.icon = ``;
		this.selected = false;
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
			tileIcon: { type: String },
			icon: { type: String },
			selected: { type: Boolean }
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
				
				.tile.transact:hover {
					border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.transact:focus, .tile.transact.selected {
					border: var(--theme-product-tile-focus-transact-border, 1.5px solid #009DE0);
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

				.tile.insure:hover {
					border: var(--theme-product-tile-hover-insure-border, 1px solid #5D737E);
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}
				.tile.insure:focus, .tile.insure.selected{
					border: var(--theme-product-tile-focus-insure-border, 2px solid #5D737E);
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}
				/* Hove & Focus styles - End*/

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
			<button 
				class="tile ${this.type ? this.type : `transact`}${this.selected ? ` selected` : ``}"
				@click="${this._tileClicked}}"
				@keydown="${e => this._keyDown(e)}"
				tabindex="${this.disabled ? `` : 0}">
					<div class="tile-container">
						${this._renderProduct()}
						<div class="heading">
							<div class="title ${this.type ? this.type : `transact`}">${this.label}</div>
							<div class="subtitle">${this.subtitle}</div>
						</div>
						<div class="detail${this.navigational ? ` nav` : ``}">
							${this.detail}
							${this.detailIcon ? html`<capitec-icon class="nav-icon-right" icon="system/add-action"></capitec-icon>` : ``}
							${this.navigational ? html`<capitec-icon size="small" class="nav-icon" icon="system/chevron-right-action"></capitec-icon>` : ``}
						</div>
					</div>
			</button>
		`;
	}

	_renderProduct() {

		if (this.type === `radio-button`) {
			return html`
				<div class="product radion-button">
					<capitec-radio
						label=""
						?checked="${this.selected}"
						@click="${this._tileClicked}}">
					</capitec-radio>
				</div>
			`;
		}

		return html`
			${this.tileIcon 
				? html`<img src = "${this.tileIcon}" class="fav-icon" />` 
				: html`<div class="product ${this.type ? this.type : `transact`} ${this.icon ? `` : `hide-icon`}">
							<capitec-icon
								class="icon"
								icon="${this.icon ? this.icon : `product/${this.type}-white`}">
							</capitec-icon>
						</div>`
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