import { Component, css, html } from 'platform/elements';

/**
 * A group of radio buttons with a border around it.
 *
 * **Usage**
 * ```html
 * 
 * <horizon-radio-button-group
 *   label="Label Test"
 *   .radioButtonsAvailable= "set of radio buttons available as an array | null"
 *   @value-change="function to be called on value cahnge event | null">
 * </horizon-radio-button-group>
 * 
 * ```
 */

export class HorizonRadioButtonGroup extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.label = ``;
		this.selectedItem = ``;
		this.radioButtonsAvailable = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [label] - The label string to display.
	 */

	static get properties() {
		return {
			label: { type: String },
			radioButtonsAvailable: { type: Array },
			selectedItem: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onValueChange(event, item) {
		this.selectedItem = item.value;

		if (event.currentTarget.__checked) {
			this.selectedReason = {
				old: event.detail.old,
				new: event.detail.new,
				key: item.key,
				value: item.value
			};
		}

		this.dispatchEvent(new CustomEvent(`value-change`, {
			detail: {
				old: this.selectedReason.old,
				new: this.selectedReason.new,
				key: this.selectedReason.key,
				value: this.selectedReason.value
			}
		}));

		event.stopPropagation();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.radio-button-container {
					margin: 8px 0px 0px 0px;
					height: 48px;
					padding: 0px;
					box-sizing: border-box;
					border-style: solid;
					border-width: thin;
					border-radius: 5px;
					border-color: lightgrey;
				}

				.radio-button-label {
					height:24px;
					margin:11px 0px 10px 16px;
					font-family: "Hind Vadodara";
					font-size: 15px;
					color: #545D60;
					line-height: 20px;
				}
				
				capitec-radio-group{
					margin-bottom: var(--horizon-radio-button-group-margin-bottom, 41px);
				}
			}`
		];
	}

	_webTemplate() {
		return html`
			<capitec-radio-group>
					${this.radioButtonsAvailable.map((item) => this._renderRadioButton(item))}
			</capitec-radio-group>
		`;
	}

	_renderRadioButton(item) {
		return html`
			<capitec-group class="radio-button-container" layout="vertical" gap="clear" halign="stretch" valign="center">
				<capitec-radio
							class="radio-button-label"
							label="${item.value}"
							@value-change="${(event) => this._onValueChange(event, item)}"
							?checked="${this.selectedItem === item.value}">
				</capitec-radio>
			</capitec-group>
		`;
	}

}

window.customElements.define(`horizon-radio-button-group`, HorizonRadioButtonGroup);