import { Component, css, html, ifDefined } from '../../elements/index.js';

/**
 * A chip control.
 *
 * ```js 
 * import 'platform/components/buttons/Chip'; 
 * ```
 * 
 * ```html
 * <capitec-chip 
 *   label="Chip title"
 *   avatar="Chip Avatar"
 *   avatar-image="/platform/icons/browser/chrome.svg"
 *   closable>
 * </capitec-chip>
 * ```
 */
export class Chip extends Component {

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
		this.avatar = ``;
		this.avatarImage = undefined;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 * @attribute {Boolean} [closable] - Sets if the close button should be shown.
	 * @prop {String} [avatar] - The text to be shown in the avatar.
	 * @prop {String} [avatarImage] - The image to be shown in the avatar.
	 */
	static get properties() {

		return {
			label: { type: String },
			avatar: { type: String },
			avatarImage: { type: String, attribute: `avatar-image` }
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
	_chipClicked(event) {

		// Notify any subscribers that the link was clicked.
		this.dispatchEvent(new CustomEvent(`click`, {
			detail: {}
		}));

		// Prevent the event from bubbling up.
		event.stopPropagation();
	}

	/**
	 * Handles component remove events.
	 * 
	 * @param {MouseEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_removeClicked(event) {

		// Notify any subscribers that the link was clicked.
		this.dispatchEvent(new CustomEvent(`remove`, {
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

				:host(:not([closable])) .icon {
					display: none;
				}
                                
                .chip {
					height: 32px;
					max-height: 32px;
                    box-sizing: border-box;
                    border: var(--theme-chip-border, 1px solid #E1E1E1);
                    border-radius: var(--theme-chip-border-radius, 16px);
					background-color: var(--theme-chip-background-color, #F7F7F7);
					padding: var(--theme-chip-padding, 4px);
                    cursor: pointer;
                    display: flex;
                    flex-direction: row;
                    align-items: center;
                }

                .chip:hover {
                    border: var(--theme-chip-hover-border, 1px solid #009DE0);
                    box-shadow: var(--theme-chip-hover-shadow, 0 2px 4px 0 rgba(0,0,0,0.25), 0 1px 3px 0 rgba(0,0,0,0.15));                
                }

                .label {
                    display: inline-block;
                    padding-left: var(--theme-chip-label-padding-left, 8px);
                    padding-right: var(--theme-chip-label-padding-right, 8px);
                    color: var(--theme-chip-label-color, #4E6066);
                    font-family: var(--theme-chip-font-family, "Hind Vadodara");
					font-size: var(--theme-chip-font-size, 14px);
					font-weight: var(--theme-chip-font-weight, 400);
                    line-height: var(--theme-chip-label-line-height, 20px);
                }

                .icon {    
					display: grid;
    				justify-content: center;
                    padding-left: var(--theme-chip-icon-padding-left, 0px);
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
			<button class="chip" @click="${this._chipClicked}" @keydown="${e => this._keyDown(e)}">
				${this.avatar || this.avatarImage ? html`<capitec-avatar class="avatar" value="${this.avatar}"
					icon="${ifDefined(this.avatarImage)}" size="x-small"></capitec-avatar>` : ``}
				<div class="label">${this.label}</div>
				<div class="icon" @click="${(e) => this._removeClicked(e)}">
					<img src="./platform/icons/system/close-circle-action.svg">
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

window.customElements.define(`capitec-chip`, Chip);

/**
 * When the chip is clicked.
 *
 * @example
 * <capitec-chip ... @click="${this._handler}"></capitec-chip>
 *
 * @event Chip#click
 * @type {Object}
 * @property {Object} detail Empty object.
*/

/**
* When the chip remove button is clicked.
 *
 * @example
 * <capitec-chip ... @remove="${this._handler}"></capitec-chip>
 *
 * @event Chip#remove
 * @type {Object}
 * @property {Object} detail Empty object.
*/