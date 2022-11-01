import { css, html } from 'platform/elements';
import { Select } from 'platform/components/inputs';

export class HorizonSelect extends Select {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.detailsLabel = ``;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 * @param {string} detailsLabel - Details label
	 *
	 * @readonly
	 * @static
	 * @memberof PayCreditCardBudget
	 */
	 static get properties() {
		return {
			detailsLabel: {
				type: String,
				attribute: `detail-label`
			}
		};
	}

	get selectedValue() {

		if (!this.value) {
			return ``;
		} else if (typeof this.value === `string`) {
			return this.value;
		} else if (typeof this.value === `object`) {
			return this.value[this.displayField] || ``;
		}

		return ``;
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
					padding-top: calc(var(--theme-input-padding-top, 8px) + 3px);
					padding-bottom: calc(var(--theme-input-padding-bottom, 8px) + 3px);
				}
				
				horizon-label{
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 15px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 12px;
					--horizon-label-value-font-size: 12px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 12px;
					--horizon-label-value-color:#3A3A3A;
					
					height: var(--theme-custom-input-label-height, 33px);
					left: calc(var(--theme-input-icon-margin-left, 0px) + var(--theme-icon-size-small, 0px) + 8px);
				}
				.details {
					margin-top: var(--theme-input-padding-top, 10px);
					position: absolute;
				}
				.disabled-select {
					--horizon-label-text-color: var(--horizon-disabled-label-text-color, #7C7C7C);
					--horizon-label-value-color: var(--horizon-disabled-label-value-color, #7C7C7C);
				}
				.pull-right {
					text-align: end;
					--theme-input-font-weight: 600;
				}`
		];
	};

	_mobileTemplate() {
		super._mobileTemplate();
	}

	_webTemplate() {
		
		const selectedObj = this.items.find(item => item[this.idField] === this.value[this.idField]);

		return html`
			<div
				class="select container ${this.mode === `inline` ? `inline` : ``} 
					   ${this.value && this.mode !== `filter` ? `completed` : ``}
					   ${this.value && this.mode === `filter` ? `filtered` : ``} 
					   ${this.error ? `error` : ``} 
					   ${this.focussed ? `focussed` : ``} 
					   ${this.disabled ? `disabled` : ``}">
				${this._getSelectedValueIcon(selectedObj)}
				${this.detailsLabel
					? html`
						<horizon-label
							class="details ${this.disabled ? `disabled-select` : ``}"
							for="inputField"
							label="${selectedObj.accountName}"
							value="${this.detailsLabel}">
						</horizon-label>`
					: html``
				}
				${super._renderLabel()}
				${this._renderInputField(selectedObj)}
				${super._renderIcons(`web`)}
				${super._renderOptions()}
			
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			
			</div>
		`;
	}

	_renderInputField() {
		return html`
			<input
				id="inputField"
				class="field ${this.mode === `filter` ? `icon-padding` : ``} ${this.detailsLabel ? `pull-right` : ``}"
				type="text"
				readonly
				value="${this.selectedValue}"
				tabindex="${this.disabled ? `-1` : undefined}"
				@click="${this._onInputClick}" />`;
	}

	_getSelectedValueIcon(selectedObj) {
		if (selectedObj) {
			return selectedObj.icon 
				? html`
					<capitec-icon
						class="selected-icon"
						size="small"
						icon=${selectedObj.icon}
						for="inputField">
					</capitec-icon>`
				: html`
					<img
						src="${selectedObj.customIcon}"
						class="selected-icon"
						for="inputField">
					</capitec-icon>`;
		}
	}

}

window.customElements.define(`horizon-select-icon`, HorizonSelect);