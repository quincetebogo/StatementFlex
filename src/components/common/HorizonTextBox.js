import { TextBox } from 'platform/components/inputs';
import { html } from 'platform/elements';

export class HorizonTextBox extends TextBox {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.hideForLabel = false;
		this.exceedsMaxLength = false;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 * @param {string} enableClear - show or hide clear button
	 *
	 * @readonly
	 * @static
	 * @memberof HorizonTextBox
	 */
	 static get properties() {
		return {
			hideForLabel: { type: Boolean },
			exceedsMaxLength: { type: Boolean, attribute: false }
		};
	}

	get labelVisibility() {
		return !this.hideForLabel ? true : this.hideForLabel && !this.value && !this.focussed;
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
	_keyInput(event) {
		super._keyInput(event);
	}
	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// // ---------------

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		super._mobileTemplate();
	}

	_renderLabel() {
		return this.labelVisibility
		? html`
			<label
				class="label${this.focussed ? ` blue` : ``}${this.error ? ` red` : ``}"
				for="inputField"
				@click="${() => this.focus()}">${this.label}
			</label>`
		: html``;
	}

	render() {
		return html`
			<div class="container${this.value ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
				${this._renderLabel()}
					<div
						class="field"
						id="inputField"
						contenteditable="${!this.disabled}"
						?readonly="${this.disabled}"
						tabindex="${this.disabled ? `` : 0}"
						@input="${this._keyInput}">
					</div>
					
					${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
			</div>
		`;
	}
}

window.customElements.define(`horizon-text-box`, HorizonTextBox);