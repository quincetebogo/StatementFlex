import { css, html } from 'platform/elements';
import { Select } from 'platform/components/inputs';

export class HorizonSelect extends Select {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.detailsField = null;
		this.detailsLabel = ``;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 *
	 * @readonly
	 * @static
	 * @memberof PayCreditCardBudget
	 */
	 static get properties() {
		return {
			detailsField: { type: String },
			detailsLabel: { type: String }
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
				}
				
				.input-group {
					height: var(--theme-custom-input-group-height, 48px);
					border: 1px solid #E1E1E1;
					border-radius: 4px;
				}
				
				.input-group-error {
					border: 1px solid #C83C37;
				}
				
				.input-group > horizon-label{
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
					padding: var(--theme-custom-input-label-padding,0px);
					margin: var(--theme-custom-input-label-margin, 8px 0px 0px 48px);
					height: var(--theme-custom-input-label-height, 33px);
				}

				.input-details {
					position: absolute; 
					cursor: pointer;
					top: var(--theme-input-details-top, 13px);
					right: var(--theme-input-details-right, 47px);
					--theme-label-default-font-size: var(--theme-input-details-font-size, 15px);
					--theme-label-default-font-weight:  var(--theme-input-details-font-weight, 600);
					--theme-label-font-color: #3A3A3A;
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
				class="select container ${this.mode === `inline` ? `inline` : ``} ${this.value && this.mode !== `filter` ? `completed` : ``} ${this.value && this.mode === `filter` ? `filtered` : ``} ${this.error ? `error` : ``} ${this.focussed ? `focussed` : ``} ${this.disabled ? `disabled` : ``}">
				${this._getSelectedValueIcon(selectedObj)}
				${super._renderLabel()}
				${this._renderInputField(selectedObj)}
				${this._renderDetails(selectedObj)}
				${super._renderIcons(`web`)}
				${super._renderOptions()}
			
				${this.hint && !this.error ? html`<div class="hint">${this.hint}</div>` : ``}
				${this.error ? html`<div class="error">${this.error}</div>` : ``}
			
			</div>
		`;
	}

	_renderInputField(selectedObj) {
		return this.detailsLabel
		? html`
			<capitec-group class="input-group ${this.error ? `input-group-error` : ``}" ?noPadding="${true}" layout="horizontal" @click="${this._onInputClick}">
				<horizon-label
					label="${selectedObj.accountName}"
					value="${this.detailsLabel}">
				</horizon-label>
			</capitec-group>`
		: html`
			<input id="inputField" class="field ${this.mode === `filter` ? `icon-padding` : ``}" type="text" readonly
			value="${this.selectedValue}" tabindex="${this.disabled ? `-1` : undefined}" @click="${this._onInputClick}" />
			`;
	}

	_renderDetails(selectedObj) {
		return this.detailsField
		? html`
			<capitec-label class="input-details" label="${selectedObj[this.detailsField]}"  @click="${this._onInputClick}"></capitec-label>`
		: html``;
	}

	_getSelectedValueIcon(selectedObj) {
		if (selectedObj) {
			return selectedObj.icon 
			? html`<capitec-icon class="selected-icon" size="small" icon=${selectedObj.icon} for="inputField"></capitec-icon>`
			: html`<img src="${selectedObj.customIcon}" class="selected-icon" for="inputField"></capitec-icon>`;
		}
	}

}

window.customElements.define(`horizon-select-icon`, HorizonSelect);