import { Component, css, html } from '../../elements/index.js';
import '../buttons/KeyboardButton.js';

/**
 * An on-screen keyboard control component that is only available in Kiosk projects.
 *
 * ```js 
 * import 'platform/components/inputs/Keyboard'; 
 * ```
 * 
 * ```html
 * <capitec-keyboard
 *  mode="alpha-numeric"
 *  displayValue="A">
 *  </capitec-keyboard>
 * ```
 * @prop {"numeric"|"alpha-numeric"|"none"|String} mode - The mode to display.
 * 
 * @ignore
 */

export class Keyboard extends Component {

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
		this.mode = `alpha-numeric`;
		this.currentCase = `lower`;
		this.state = `alpha-numeric`;
		this.displayValue = ``;
		this.addEventListener(`focus`, this._focusGained.bind(this));
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [mode="alpha"] - The mode to display:
	 * - `alpha` Alphabetical mode.
	 * - `numeric` Numerical mode.
	 * - `alpha-numeric` Alphanumerical mode.
	 * - `none` No keyboard visible.
	 * @property {String} [displayValue] - The value for the Keyboard to display.
	 */
	static get properties() {

		return {
			mode: { type: String },
			displayValue: { type: String }
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
	 * Handles closing of the Keyboard component
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_close() {

		this.dispatchEvent(new CustomEvent(`keyboard-close`, {
			detail: {}
		}));

	}

	/**
	 * Handles component key down events.
	 * 
	 * @param {KeyboardEvent} event - The event details.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_keypress(event) {

		const data = {
			value: event.detail.value
		};
		this._notifyKeyboardFocus();
		this.dispatchEvent(new CustomEvent(`keyboard-key-press`, {
			detail: data
		}));

		event.stopPropagation();
		if (this.currentCase === `upper-single`) {
			this.currentCase = `lower`;
			this.requestUpdate();
		}

	}

	_focusGained(event) {
		this._notifyKeyboardFocus();
	}

	_notifyKeyboardFocus() {
		this.dispatchEvent(new CustomEvent(`keyboard-focused`, {
			detail: {}
		}));

		this.dispatchEvent(new CustomEvent(`keyboard-focus`, {
			detail: {}
		}));
	}

	_toggleCase() {
		if (this.currentCase === `lower`) {
			this.currentCase = `upper-single`;
		} else if (this.currentCase === `upper-single`) {
			this.currentCase = `upper`;
		} else {
			this.currentCase = `lower`;
		}
		this._notifyKeyboardFocus();
		this.requestUpdate();
	}

	_toggleState() {
		if (this.state === `special`) {
			this.state = `alpha-numeric`;
		} else {
			this.state = `special`;
		}
		this._notifyKeyboardFocus();
		this.requestUpdate();
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

	static get styles() {

		return [
			super.styles,
			css`
				:host {
					/* Keyboard needs to have a very high z index in order to be always on top */
					z-index: var(--theme-keyboard-z-index, 9999);
				}

				.footer{
					position: fixed;
					left: 0;
					bottom: 0;
					width: 100%;
					background-color: transparent;
					color: white;
					text-align: center;
				}
				.shadow {
					box-shadow: -5px 0px 30px rgba(0,0,0,0.2);
					border-radius: var(--theme-keyboard-shadow-border-radius,16px 16px 0px 0px);
					padding-bottom: var(--theme-keyboard-shadow-padding-bottom,-10px);
				}

				.topbar{
					height: var(--theme-keyboard-top-bar-height, 48px);
					width: var(--theme-keyboard-top-bar-width, 1080px);
					padding-left: var(--theme-keyboard-top-bar-padding-left, 24px); 
					padding-right: var(--theme-keyboard-top-bar-padding-right, 41px); 
					background-color: var(--theme-keyboard-top-bar-background-color,#F5F5F5);
					list-style: none;
					display: var(--theme-keyboard-flex-display, flex);
					border-radius: var(--theme-keyboard-top-bar-border-radius,16px 16px 0px 0px);
					align-items: center;
					justify-content: space-between;
				}

				.bottomBar {
					height: var(--theme-keyboard-bottom-bar-height,104px);
					width: var(--theme-keyboard-bottom-bar-width, 1080px);
					padding: var(--theme-keyboard-bottom-bar-padding, 0px 24px);
					background-color: var(--theme-keyboard-bottom-bar-background-color,#F5F5F5);
					background: var(--theme-keyboard-bottom-bar-background-color,#F5F5F5);
					border-top: var(--theme-keyboard-bottom-bar-border-top,3px solid #E1E1E1);
				}
				.ctaButton {
					height: var(--theme-keyboard-cta-button-height,56px);
					width: var(--theme-keyboard-cta-button-width,184px);
					color: var(--theme-keyboard-cta-button-color,#FFFFFF);
					background-color: var(--theme-keyboard-cta-button-background-color,#009DE0);
					border: none;
					text-align: center;
					font-size: var(--theme-keyboard-cta-button-font-size,20px);
					font-weight: var(--theme-keyboard-cta-button-font-weight,600);
					border-radius: var(--theme-keyboard-cta-button-border-radius,8px);
					margin: var(--theme-keyboard-cta-button-margin,24px);
					float: var(--theme-keyboard-cta-button-float, right);
				}
				.closeButton{
					cursor: pointer; 
					font-weight: var(--theme-keyboard-close-button-font-weight,600); 
					color: var(--theme-keyboard-close-button-color,#009DE0); 
					font-size: var(--theme-keyboard-close-button-font-size,18px);
				}
				
				.closer{
					display: var(--theme-keyboard-flex-display, flex);
					flex-direction: row; 
					align-items: center;
					justify-content: space-between;
					width: var(--theme-keyboard-closer-width,68px);
					padding-right: var(--theme-keyboard-closer-padding-right,81px);
				}

				.items{
					padding: 0;
					margin: 0;
					list-style: none;
					display: var(--theme-keyboard-flex-display, flex);
				}

				.firstItem{
					justify-content: flex-start; 
				}

				.secondItem{
					justify-content: flex-end; 
				}

				.wrapperContainer{
					display: flex;
					flex-direction: column; 
					align-items: center; 
					background-color: transparent;
				}

				.subWrapper{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
				}

				.wrapper {
					width: var(--theme-keyboard-wrapper-width,1080px);
					background: var(--theme-keyboard-input-background-color,#F5F5F5);
					border-top: 3px solid #E1E1E1;
				}

				.wrapper:first-child {
					margin-top: 0;
				}
				
				.keyrow {
					display: flex; 
					justify-content: center;
				}
				.keyrow {
					margin: var(--theme-keyboard-key-row-margin,14px 53px);
					width: var(--theme-keyboard-key-row-width,1080px);
				}
			`
		];
	}

	_webTemplate() {
		return html``;
	}

	_mobileTemplate() {
		return html``;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		if ((this.mode === `alpha-numeric` || this.mode === `alpha`) && (this.state === `alpha` || this.state === `alpha-numeric`)) {
			this.state = `alpha-numeric`;

			return html`
			<div class="footer">
				<div class="wrapperContainer">
					<div class="shadow">
					<div class="topbar">
						<capitec-label label="${this.displayValue}"></capitec-label>
						<div class="closer" @click="${this._close}" style="cursor: pointer;">
							<capitec-label class="closeButton" label="Close"></capitec-label>
							<capitec-icon size="medium" icon="system/chevron-down-action"></capitec-icon>
						</div>
					</div>
					<div class="wrapper">
						<div class="keyrow" style="padding-top: 24px;">
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="1"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="2"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="3"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="4"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="5"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="6"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="7"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="8"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="9"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="0"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
						</div>
						<div class="keyrow">
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="q"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="w"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="e"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="r"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="t"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="y"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="u"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="i"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="o"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="p"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
						</div>
						<div class="keyrow">
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="a"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="s"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="d"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="f"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="g"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="h"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="j"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="k"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="l"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="z"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
						</div>
						<div class="keyrow">
							<capitec-keyboard-button @keyboard-click="${this._toggleCase}" mode="action"
								icon="${this.currentCase === `lower` ? `system/caps-off-action` : ``}${this.currentCase === `upper-single` ? `system/caps-on` : ``}${this.currentCase === `upper` ? `system/caps-on-permanent` : ``}"
								character="caps" case="custom"></capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="x"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="c"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="v"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="b"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="n"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="m"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="action"
								icon="system/backspace-action" character="backspace" case="custom"></capitec-keyboard-button>
						</div>
						<div class="keyrow" style="padding-bottom: 24px;">
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="."
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha" label="@"
								case="${this.currentCase === `upper` || this.currentCase === `upper-single` ? `upper` : `lower`}">
							</capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._toggleState}"
								mode="alpha" label="!#$" case="custom"></capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="space" label="Space" character=" "
								case="custom"></capitec-keyboard-button>
							<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="return" label="Clear"
								character="clear" case="custom"></capitec-keyboard-button>
						</div>
						<div class="bottomBar">
						<button class="ctaButton" @click="${this._close}" mode="action">Enter</button>
						</div>
						</div>
						</div>
				</div>
			</div>
			`;
		} else if (this.state === `special`) {
			this.state = `special`;
			return html`
			<div class="footer">
				<div class="wrapperContainer">
					<div class="shadow">
					<div class="topbar">
						<capitec-label label="${this.displayValue}"></capitec-label>
						<div class="closer" @click="${this._close}" style="cursor: pointer;">
							<capitec-label class="closeButton" label="Close"></capitec-label>
							<capitec-icon size="medium" icon="system/chevron-down-action"></capitec-icon>
						</div>
					</div>
					<div class="wrapper">
						<div>
							<div>
								<div class="keyrow" style="padding-top: 24px;">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="!">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="|">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="#">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="_">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric"
								icon="system/backspace-action" character="backspace" case="custom"></capitec-keyboard-button>
								</div>
								<div class="keyrow">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="%">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="&">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="'">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="^">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="$">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow">
								<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="*">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="+">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="-">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="\`">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="~">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="/">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="=">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="?">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="{">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="}">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow" style="padding-bottom: 24px;">
								${this.mode === `alpha-numeric` || this.mode === `alpha` ? html`<capitec-keyboard-button
									@keyboard-click="${this._toggleState}" mode="alpha" label="abc" case="custom">
								</capitec-keyboard-button>` : html`<div
									style="background-color: transparent; height: 56px; width: 135px; border: 1.5px; ">
								</div>`}
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="@">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label=".">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="return" label="Clear"
								character="clear" case="custom"></capitec-keyboard-button>
								</div>
							</div>
						</div>
						<div class="bottomBar">
						<button class="ctaButton" @click="${this._close}" mode="action">Enter</button>
						</div>
					</div>
					</div>
				</div>
			</div>
			`;
		} else if (this.mode === `numeric`) {
			return html`
			<div class="footer">
				<div class="wrapperContainer">
					<div class="shadow">
					<div class="topbar">
						<capitec-label label="${this.displayValue}"></capitec-label>
						<div class="closer" @click="${this._close}" style="cursor: pointer;">
							<capitec-label class="closeButton" label="Close"></capitec-label>
							<capitec-icon size="medium" icon="system/chevron-down-action"></capitec-icon>
						</div>
					</div>
					<div class="wrapper">
						<div>
							<div>
								<div class="keyrow" style="padding-top: 24px;">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="1">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="2">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="3">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="4">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="5">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="6">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow">
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="7">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="8">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="9">
									</capitec-keyboard-button>
								</div>
								<div class="keyrow" style="margin-bottom:0px; padding-bottom: 24px">
								<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="Clear"
								character="clear" case="custom"></capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="numeric" label="0">
									</capitec-keyboard-button>
									<capitec-keyboard-button @keyboard-click="${this._keypress}" mode="alpha"
								icon="system/backspace-action" character="backspace" case="custom"></capitec-keyboard-button>
								</div>
								</div>
							</div>
						</div>
						<div class="bottomBar">
							<button class="ctaButton" @click="${this._close}" mode="action">Enter</button>
						</div>
					</div>
					</div>
				</div>
			</div>
			`;
		}

		return html``;
	}
}

window.customElements.define(`capitec-keyboard`, Keyboard);

/**
 * When a keyboard key is pressed.
 *
 * @example
 * <capitec-keyboard ... @keyboard-key-press="${this._handler}"></capitec-keyboard>
 *
 * @event Keyboard#keyboard-key-press
 * @type {Object}
 * @property {Object} detail details of the keyboard button that was pressed
 */

/**
 * When the keyboard component is closed.
 *
 * @example
 * <capitec-keyboard ... @keyboard-close="${this._handler}"></capitec-keyboard>
 *
 * @event Keyboard#keyboard-close
 * @type {Object}
 * @property {Object} detail
 */

/**
 * When the keyboard is focussed.
 *
 * @example
 * <capitec-keyboard ... @keyboard-focus="${this._handler}"></capitec-keyboard>
 *
 * @event Keyboard#keyboard-focus
 * @type {Object}
 * @property {Object} detail - The component that is focussed
 */