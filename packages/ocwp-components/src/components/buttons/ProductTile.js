import { Component, css, html } from '../../elements/index.js';

/**
 * A control that displays product info.
 *
 * ```js 
 * import 'platform/components/buttons/ProductTile'; 
 * ```
 * 
 * ```html
 * <capitec-product-tile
 *   label="Savings Account"
 *   subtitle="Available Balance"
 *   detail="R7 890.00"
 *   type="transact"
 *   navigational>
 * </capitec-product-tile>
 * ```
 * @prop {"transact"|"save"|"credit"|"insure"|String} type - The product display type
 */
export class ProductTile extends Component {

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
		this.subtitle = ``;
		this.detail = ``;
		this.type = `transact`;
		this.navigational = false;
		this.add = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @property {String} [subtitle] - The sub label string to display.
	 * @property {String} [detail] - The detail string to display.
	 * @property {String} [type="transact"] - The product display type:
	 * - `transact` GlobalOne style variation.
	 * - `save` GlobalOne style variation.
	 * - `credit` GlobalOne style variation.
	 * - `insure` GlobalOne style variation.
	 * @property {Boolean} [navigational=false] - Whether to display navigation arrow for product tile.
	 * Note that "default" is still supported, but deprecated.
	 * @property {Boolean} [add=false] - Whether to display add icon for product tile.
	 */
	static get properties() {

		return {
			label: { type: String },
			subtitle: { type: String },
			detail: { type: String },
			type: { type: String },
			navigational: { type: Boolean },
			add: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

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

			event.stopPropagation();
		}
	}

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
					box-sizing: border-box;
					display: inline-flex;
                }

                .tile {
                    display: inline-flex;
                    flex-direction: row;
                    box-sizing: border-box;
                    height: var(--theme-product-tile-height, 72px);
                    border: var(--theme-product-tile-border, 1px solid #E1E1E1);
                    border-radius: var(--theme-product-tile-border-radius, 5.05px);
                    background-color: var(--theme-button-default-background-color, #FFFFFF);
                    padding: 0px;
                    width: 100%;
                    position: relative;
					outline: none;
					overflow: hidden;					
                }

                .tile-container {
                    display: inline-flex;
                    flex-direction: row;
                    box-sizing: border-box;
                    height: var(--theme-product-tile-height, 72px);
                    background-color: transparent;
                    padding: 0px;
                    width: 100%;
                    position: relative;
                }

                .tile:hover {
                    cursor: pointer;
                }

                .tile.transact:hover {
                    border: var(--theme-product-tile-hover-transact-border, 1px solid #009DE0);
                    box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
                }

                .tile.transact:focus {
                    border: var(--theme-product-tile-focus-transact-border, 1px solid #009DE0);
                    box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
                }

                .tile.save:hover {
                    border: var(--theme-product-tile-hover-save-border, 1px solid #00486D);
                    box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
                }

                .tile.save:focus {
                    border: var(--theme-product-tile-focus-save-border, 2px solid #00486D);
                    box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
                }

                .tile.credit:hover {
                    border: var(--theme-product-tile-hover-credit-border, 1px solid #C83B37);
                    box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
                }

                .tile.credit:focus {
                    border: var(--theme-product-tile-focus-credit-border, 2px solid #C83C37);
                    box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
                }

                .tile.insure:hover {
                    border: var(--theme-product-tile-hover-insure-border, 1px solid #5D737E);
                    box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
                }

                .tile.insure:focus {
                    border: var(--theme-product-tile-focus-insure-border, 2px solid #5D737E);
                    box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}

                .product {
					width: var(--theme-product-tile-colour-display-width, 57px);
					display: inline-flex;
					align-items: center;
					justify-content: center;
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
                    margin-left: var(--theme-product-tile-heading-margin-left, 16px);
                    margin-top: var(--theme-product-tile-heading-margin-top, 13px);
                }
                
                .title {
                    height: var(--theme-product-tile-title-height, 24px);
                    font-family: var(--theme-font-family, "Hind Vadodara");
                    font-size: var(--theme-product-tile-title-font-size, 18px);
                    font-weight: var(--theme-product-tile-title-font-weight, 600);
					line-height: var(--theme-product-tile-title-height, 24px);
					text-align: left;
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
                    height: var(--theme-product-tile-subtitle-height, 20px);
                    color: var(--theme-product-tile-subtitle-color, #3E4547);
                    font-family: var(--theme-font-family, "Hind Vadodara");
                    font-size: var(--theme-product-tile-subtitle-font-size, 15px);
                    line-height: var(--theme-product-tile-subtitle-height, 15px);
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
                    height: var(--theme-product-tile-detail-height, 24px);
                    color: var(--theme-product-tile-subtitle-color, #3E4547);
                    font-family: var(--theme-font-family, "Hind Vadodara");
                    font-size: var(--theme-product-tile-detail-font-size, 18px);
                    font-weight: var(--theme-product-tile-title-font-weight, 500);
                    line-height: var(--theme-product-tile-detail-height, 24px);
                    text-align: right;
                }

                .detail.nav {
                    right: var(--theme-product-tile-nav-right, 16px);
                }

                .detail > .icon {
                    margin-left: var(--theme-product-tile-nav-icon-margin-left, 16px);
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
			<button class="tile ${this.type ? this.type : `transact`}" @click="${this._tileClicked}"
				@keydown="${e => this._keyDown(e)}" tabindex="${this.disabled ? `` : 0}">
				<div class="tile-container">
					<div class="product ${this.type ? this.type : `transact`}">
						<capitec-icon class="icon" icon="product/${this.type}-white"></capitec-icon>
					</div>
					<div class="heading">
						<div class="title ${this.type ? this.type : `transact`}">${this.label}</div>
						<div class="subtitle">${this.subtitle}</div>
					</div>
					<div class="detail${this.navigational || this.add ? ` nav` : ``}">
						${this.detail}
						${this.navigational && !this.add ? html`<capitec-icon size="small" class="icon"
							icon="system/chevron-right-action"></capitec-icon>` : ``}
						${!this.navigational && this.add ? html`<capitec-icon size="small" class="icon" icon="system/add-action">
						</capitec-icon>` : ``}
					</div>
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

window.customElements.define(`capitec-product-tile`, ProductTile);

/**
 * When the tile is clicked.
 *
 * @example
 * <capitec-product-tile ... @click="${this._handler}"></capitec-product-tile>
 *
 * @event ProductTile#click
 * @type {Object}
 * @property {Object} detail Empty object.
*/