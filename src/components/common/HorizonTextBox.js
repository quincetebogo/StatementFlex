import { css, html } from 'platform/elements';
import { TextBox } from 'platform/components/inputs';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

export class HorizonTextBox extends TextBox {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.displayForLabel = true;
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
			displayForLabel: { type: Boolean },
			exceedsMaxLength: { type: Boolean, attribute: false }
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

	static get styles() {
		return [
			super.styles,
			css`
				.errorDescriptionTexBox {
					--theme-input-focussed-border-color: #cc706d;
				}

				.descriptionTexBox {
					--theme-input-focussed-border-color: #E1E1E1;
				}
			`
		];
	};

	_mobileTemplate() {
		super._mobileTemplate();
	}

	_renderLabel() {
		return this.displayForLabel ? html`
		<label
			class="label${this.focussed ? ` blue` : ``}${this.error ? ` red` : ``}"
			for="inputField"
			@click="${() => this.focus()}">${this.label}</label>
		` : ``;
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
						@input="${this._keyInput}"> Whats going on?
					</div>
					
					${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
			</div>
		`;
	}
}

window.customElements.define(`horizon-text-box`, HorizonTextBox);