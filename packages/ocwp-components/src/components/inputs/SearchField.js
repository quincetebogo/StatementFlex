import { Component, css, html } from '../../elements/index.js';
import { InputLayouts } from '../input-layouts.js';

/**
 * An input control that allows a user to enter a single line of text.
 * 
 * ```js
 * import 'platform/components/inputs/SearchField';
 * ```
 *  
 * ```html
 * <capitec-search-field 
 *		label="Search"
 *	  	hint="Search"
  *     keyboardMode="alpha"
  *     realtimeSearch>
 *	</capitec-search-field>
 * ```
 * @prop {"alpha"|"numeric"|"alpha-numeric"|"none"|String} keyboardMode - Keyboard mode supported
 */
export class SearchField extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		// Set the default property values.
		this.label = ``;
		this.value = null;
		this.data = null;
		this.keyboardMode = `alpha-numeric`;

		this.hint = ``;
		this.error = null;

		this.focussed = false;
		this.disabled = false;

		this.realtimeSearch = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * @property {String} [label] - The input label text.
	 * @property {String} [value] - The value entered into the input.
	 * @property {Object} [data] - Data associated with the component.
	 * @property {String} [keyboardMode="alpha-numeric"] - Keyboard mode supported:
	 * - `alpha` Alphabetical mode.
	 * - `numeric` Numerical mode.
	 * - `alpha-numeric` Alphanumerical mode.
	 * - `none` No keyboard visible.
	 * @property {Boolean} [realtimeSearch=false] - When true, value-change is fired when the value being displayed changes.
	 * @property {String} [hint] - A hint message to assist the user.
	 * @property {String} [error] - An error message to guide users to correct a mistake.
	 * 
	 * @property {Boolean} [focussed=false] - Indicator if the component should be focussed.
	 * @property {Boolean} [disabled=false] - Indicator if the component should be editable.
	 */
	static get properties() {

		return {
			label: { type: String },
			value: { type: String },
			data: { type: Object },
			keyboardMode: { type: String },
			realtimeSearch: { type: Boolean },

			hint: { type: String },
			error: { type: String },

			focussed: { type: Boolean },
			disabled: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	/**
	 * Activates the component once all initialization processes are complete.
	 * 
	 * @ignore
	 * @returns {void}
	 */
	connectedCallback() {

		// Ensure the base class activation logic is applied.
		super.connectedCallback();

		// Ensure the input value is initialized.
		if (!this.value) {
			this.value = ``;
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * Handles key input events.
	 * 
	 * Called when a keyboard key is typed, text is pasted into component.
	 *
	 * @param {KeyboardEvent} event - The key input event details.
	 * @returns {void}
	 */
	_keyInput(event) {

		// Notify any subscribers that input occurred.
		this.dispatchEvent(new CustomEvent(`input`, event));

		// Deprecated event
		this.dispatchEvent(new CustomEvent(`key-input`, event));

		// Broadcast value-change event if user indicated they want value-change on any change to the value being displayed.
		// This allows a user to subscribe to a single event to catch a change to the value, regardless of mechanism used to alter the value.
		// E.g. either key type, paste via Ctrl+V or right-click paste AS well as via using the 'clear' button in the component.
		if (this.realtimeSearch) {

			this.dispatchEvent(new CustomEvent(`value-change`, event));

			// Deprecated event
			this.dispatchEvent(new CustomEvent(`value-changed`, event));
		}
	}

	/**
	 * Handles value change events.
	 * 
	 * Called when component loses focus and when clear button is clicked.
	 * 
	 * @param {CustomEvent} event - Detail relating to the action which triggered the event.
	 * @returns {void}
	 */
	_valueChanged(event) {

		this.dispatchEvent(new CustomEvent(`value-change`, event));

		// Deprecated event
		this.dispatchEvent(new CustomEvent(`value-changed`, event));
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
			<capitec-text-field label="${this.label}" ?focussed="${this.focussed}" hint="${this.hint}" .value="${this.value}"
				keyboardMode="${this.keyboardMode}" type="search" @key-input="${(e) => this._keyInput(e)}"
				@value-changed="${(e) => this._valueChanged(e)}">
			</capitec-text-field>
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

// Register the custom component tag in the browser.
window.customElements.define(`capitec-search-field`, SearchField);

/**
 * When the control loses focus and the input value has changed from originally gaining focus.
 *
 * @example
 * <capitec-search-field ... @value-change="${this._handler}"></capitec-search-field>
 *
 * @event SearchField#value-change
 * @type {Object}
 * @property {Object} detail Event detail.
 */

/**
 * When the user enters or changes any text characters in the input.
 *
 * @example
 * <capitec-search-field ... @key-input="${this._handler}"></capitec-search-field>
 *
 * @event SearchField#key-input
 * @type {Object}
 * @property {Object} detail Event detail.
 */