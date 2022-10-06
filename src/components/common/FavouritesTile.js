import { Component, css, html } from 'platform/elements';

/**
 * Favourites Tile menu component
 * 
 * @export
 * @class FavouritesTile
 * @extends {Component}
 */
export class FavouritesTile extends Component {

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
		this.navigational = false;
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
	 * @property {Boolean} [navigational=false] - Whether to display navigation arrow for product tile.
     * @property {Boolean} [selected] - Boolean value tells menu is in active state or not
	 */
	static get properties() {

		return {
			label: { type: String },
			subtitle: { type: String },
			detail: { type: String },
			navigational: { type: Boolean },
			selected: { type: Boolean }
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
					height: var(--theme-product-tile--height, 80px);
					border: var(--theme-product-tile-border, 1px solid #E1E1E1);
					border-radius: var(--theme-product-tile-border-radius, 5.05px);
					background-color: var(--theme-button-default-background-color, #FFFFFF);
					padding: 0px;
					width: 100%;
					position: relative;
					outline:none;
					overflow: hidden;
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

				.tile:hover {
					cursor: pointer;
				}

				.tile.favourites:hover {
					border:  1px solid #009DE0;
					box-shadow: var(--theme-product-tile-hover-shadow, 0 1px 3px 0 rgba(0,0,0,0.25), 0 2px 4px 0 rgba(0,0,0,0.15));
				}

				.tile.favourites:focus, .tile.favourites.selected {
					border: 1px solid #009DE0;
					box-shadow: var(--theme-product-tile-focus-shadow, 0 3px 6px 0 rgba(0,0,0,0.15));
				}
				
				.product {
					width: var(--theme-product-tile-colour-display-width, 57px);
					display: inline-flex;
					align-items: center;
					justify-content: center;
				}

				.product.favourites {
					background-color: white;
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

				.title.favourites {
					color:  #3E4547;
				}

				.subtitle {
					height: var(--theme-product-tile-subtitle-height, 27px);
					color:  #3E4547;
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
				}

				.detail.nav {
					right: var(--theme-product-tile-nav-right, 16px);
				}

				.nav-icon {
					margin-left: var(--theme-product-tile-nav-icon-margin-left, 16.25px);
				}

				.rectangle{
					height: 72px;
					width: 4px;
					border-radius: 4px 0 0 4px;
					background-color: #009DE0;
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
				class="tile favourites ${this.selected ? `selected` : ``}"
				@click="${(e) => this._tileClicked(e)}"
				@keydown="${e => this._keyDown(e)}"
				tabindex="${this.disabled ? `` : 0}">
					<div class="tile-container">
						<div class="rectangle"></div>
						<div class="product favourites">
							<img src="/images/common/buttons/favourites-star.svg">
						</div>
						<div class="heading">
							<div class="title favourites">${this.label}</div>
							<div class="subtitle">${this.subtitle}</div>
						</div>
						<div class="detail${this.navigational ? ` nav` : ``}">
							${this.detail}
							${this.navigational ? html`<capitec-icon size="small" class="nav-icon" icon="system/chevron-right-action"></capitec-icon>` : ``}
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

window.customElements.define(`horizon-favourites-tile`, FavouritesTile);

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