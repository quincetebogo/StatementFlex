import { css, html } from 'platform/elements';
import { Select } from 'platform/components/inputs'

export class HorizonSelect extends Select {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

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

		return [
			super.styles,
			css`
				.selected-icon {
					position: absolute;
					margin-top: 12px;
					margin-left: var(--theme-input-icon-margin-left, 16px);
				}

				#inputField {
					padding-left: calc(var(--theme-input-icon-margin-left, 0px) + var(--theme-icon-size-small, 0px) + 8px);
				}
			`
		]
	};

	_mobileTemplate() {
		super._mobileTemplate();
	}

	_webTemplate() {
		return html`
			<div
				class="select container ${this.mode === `inline` ? `inline` : ``} ${this.value && this.mode !== `filter` ? `completed` : ``} ${this.value && this.mode === `filter` ? `filtered` : ``} ${this.error ? `error` : ``} ${this.focussed ? `focussed` : ``} ${this.disabled ? `disabled` : ``}">
				${this._getSelectedValueIcon()}
				${super._renderLabel()}
				<input id="inputField" class="field ${this.mode === `filter` ? `icon-padding` : ``}" type="text" readonly
					value="${this.value.label ? this.value.label : ``}" tabindex="${this.disabled ? `-1` : undefined}" @click="${this._onInputClick}" />
			
				${super._renderIcons(`web`)}
				${super._renderOptions()}
			
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			
			</div>
		`;
	}

	_getSelectedValueIcon() {
		const selectedObj = this.items.find(item => item.label === this.value.label);
		if (selectedObj) {
			return selectedObj.icon 
			? html`<capitec-icon class="selected-icon" size="small" icon=${selectedObj.icon} for="inputField"></capitec-icon>`
			: html`<img src="${selectedObj.customIcon}" class="selected-icon" for="inputField"></capitec-icon>`;
		}
	}

}

window.customElements.define(`horizon-select-icon`, HorizonSelect);