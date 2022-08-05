import { html, ifDefined } from 'platform/elements';
import { TextField } from 'platform/components/inputs';

export class HorizonTextField extends TextField {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.enableClear = false;
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
			enableClear: { type: Boolean }
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

	_keyInput(event) {
		const inputText = this.shadowRoot.getElementById(`inputField`);

		if (this.enableClear) {
			if (inputText.value === ``) {
				this._toggleClearHide();
			} else {
				this._toggleClearShow();
			}
		}

		super._keyInput(event);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [super.styles];
	};

	_mobileTemplate() {
		super._mobileTemplate();
	}

	_webTemplate() {
		return html`
			<div class="container${this.value && (!this.focussed || this.focussed === false) ? ` completed` : ``}${this.error ? ` error` : ``}${this.focussed === true ? ` focussed` : ``}${this.disabled ? ` disabled` : ``}">
			
			${this.type === `search`
				? html`
					<capitec-icon class="search-icon" icon="system/search"></capitec-icon>
					<div class="search-clear-icon ${this.clearVisible === true ? `clearShow` : `clearHide`}" id="clear" @click="${(e) => this._clear()}">
						<img class="clear-icon" src="./platform/icons/status/unsuccessful-blue.svg">
					</div>`
				: ``
			}

			${this.type === `currency`
				? html`
					<div class="search-clear-icon ${this.clearVisible === true ? `clearShow` : `clearHide`}" id="clear" @click="${(e) => this._clear()}">
						<img class="clear-icon" src="./platform/icons/status/unsuccessful-blue.svg">
					</div>`
				: ``
			}

			<label
					class="label${this.error ? ` error` : ``}${this.type === `currency` ? ` currency-label` : ``}${this.type === `search` ? ` search` : ``}${this.focussed === true ? ` blue` : ` idle`}"
					for="inputField"
					@click="${() => this.focus()}">${this.label}</label>

				${this.type === `currency` ? html`<label class="currency-symbol">R</label>` : ``/* Currency only supports South African Rand */}

				${this.type === `password`
				? html`
						<capitec-icon class="password-icon" 
							icon="${this.passwordVisible === true
						? `system/eye-visible-action`
						: `system/eye-hidden-action`}" 
							@click="${(e) => this._togglePasswordVisible()}">`
				: ``}

				<input
					class="field${this.type === `currency` ? ` currency-field` : ``}${this.type === `search` ? ` search` : ``}${this.rightIcon === true ? ` icon-padding` : ``}"
					id="inputField"
					.type="${this.type === `alpha-numeric` ? `text` : ``}${this.type === `numeric` || this.type === `currency` ? `tel` : ``}${this.type === `password` && this.passwordVisible === false ? `password` : ``}${this.type === `password` && this.passwordVisible === true ? `text` : ``}${this.type === `search` ? `text` : ``}"
					.value="${this.value}"
					?readonly="${this.disabled}"
					tabindex="${this.disabled ? `` : 0}"
					placeholder="${this.type === `currency` && this.focussed === true ? `0.00` : ``}"
					minlength="${ifDefined(this.minlength > 0 ? this.minlength : undefined)}"
					maxlength="${ifDefined(this.maxlength > 0 ? this.maxlength : undefined)}"
					@input="${e => this._keyInput(e)}"
					@keyup="${e => this._keyUp(e)}"
					/>

				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			</div>
		`;
	}

}

window.customElements.define(`horizon-text-field`, HorizonTextField);