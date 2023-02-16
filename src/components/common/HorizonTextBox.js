import { html, ifDefined } from 'platform/elements';
import { TextBox } from 'platform/components/inputs';

export class HorizonTextBox extends TextBox {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.displayForLabel = true;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 * @param {string} enableClear - show or hide clear button
	 *
	 * @readonly
	 * @static
	 * @memberof HorizonTextField
	 */
	 static get properties() {
		return {
			displayForLabel: { type: Boolean }
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
		return [super.styles];
	};

	_mobileTemplate() {
		super._mobileTemplate();
	}

	render() {

		return html`
			<div class="container${this.value ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
			${this.displayForLabel ? html`
			<label
					class="label${this.focussed ? ` blue` : ``}${this.error ? ` red` : ``}"
					for="inputField"
					@click="${() => this.focus()}">${this.label}</label>
			` : ``
			}
				<div
					class="field"
					id="inputField"
					contenteditable="${!this.disabled}"
					?readonly="${this.disabled}"
					tabindex="${this.disabled ? `` : 0}"
					@input="${this._keyInput}">
				</div>
				
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			</div>
		`;
	}
}

window.customElements.define(`horizon-text-box`, HorizonTextBox);