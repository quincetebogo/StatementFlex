import { Component, css, html, unsafeCSS } from 'platform/elements';

import 'app/components/common/HorizonSelectIcon';

/**
 * Pay credit card budget by selecting from which account amount can be transfered.
 * 
 * Events Raised 
 * -------------
 * cancel
 * transfer
 *  
 * @export
 * @class PayCreditCardBudget
 * @extends {Component}
 */
export class PayCreditCardBudget extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.productSelected = {};
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 *
	 * @readonly
	 * @static
	 * @memberof PayCreditCardBudget
	 */
	static get properties() {
		return {
			budgetAccountDetails: { type: Object },
			clientProducts: { type: Object },
			productSelected: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		[this.productSelected] = this.clientProducts;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_onTransferClick() {
		this.dispatchEvent(new CustomEvent(`transfer`, {}));
	}

	_valueChanged(e) {
		if (e.detail.new) {
			this.productSelected = e.detail.new;
			this.requestUpdate();
		}
	}
	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

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
				capitec-modal {
					--theme-modal-form-m-l-xl-width: 500px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 0;
					--theme-modal-body-padding: 0;
				}
				div[slot="body"] {
					height: 370px;
				}
				capitec-content-box {
					--theme-layout-gap-spacing: 0px;
					padding: 16px;
				}
				horizon-label {
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 18px;
					--horizon-label-value-color:#3A3A3A;

					margin: 9px 0px 24px;
				}
				horizon-select-icon {
					--theme-select-options-max-height: 304px;
					--theme-input-icon-margin-left: 16px;
					--theme-icon-size-small: 24px;
					--theme-layout-gap-spacing: 8px;
				}
				.transfer-from {
					margin: 24px 0px 12px 0px;
					--theme-label-title-font-weight: 600;
					--theme-label-title-font-size: 16px;
				}
				.footer-class {
					border-top: 1px solid #E1E1E1;
				}
				.footer-class > capitec-group {
					width: 500px;
					padding: 8px 16px; 
				}
				capitec-button {
					height: 48px;
					--theme-button-font-weight: 600;
				}
`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="form" header-align="left" header="Transfer">
				<div slot="body">
					<capitec-content-box
						layout="vertical"
						halign="stretch"
						valign="top"
						gap="clear"
						?noPadding="${true}">
							${this._renderContent()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderContent() {
		return html`
			<horizon-label
				data-automation-id="pay-budget-name"
				label="Budget name"
				value="${this.budgetAccountDetails.budgetName}">
			</horizon-label>

			<capitec-text-field
				data-automation-id="pay-budget-balance"
				label="Budget amount"
				type="currency"
				value="${this.budgetAccountDetails.budgetBalance}">
			</capitec-text-field>

			<capitec-label
				class="transfer-from"
				type="title" 
				label="Transfer from">
			</capitec-label>
			
			<horizon-select-icon
				data-automation-id="pay-budget-choose-from-account"
				label="Choose account"
				.items="${this.clientProducts}"
				display-field="accountName"
				id-field="accountNumber"
				.value="${this.productSelected}"
				.displayRenderer="${(e) => this._renderOptions(e)}"
				@value-changed="${(e) => this._valueChanged(e)}"> 
			</horizon-select-icon>
			`;
	}

	_renderOptions(e) {
		return html`
			<capitec-group ?noPadding="${true}" layout="horizontal">
				${this._renderOptionIcon(e)}
				<capitec-label label="${e.accountName}"></capitec-label>
			</capitec-group>
		`;
	}

	_renderOptionIcon(e) {
		const iconClass = `width: 24px; height: 24px;`;

		return e.icon
			? html`
				<capitec-icon
					size="small"
					icon="${e.icon}">
				</capitec-icon>`
			: html`
				<capitec-image
					style="${unsafeCSS(iconClass).toString()}"
					src="${e.customIcon}">
				</capitec-image>`;
	}

	_renderFooter() {
		return html`
			<capitec-group 
				layout="horizontal"
				valign="center"
				halign="right">
				<capitec-button 
					data-automation-id="pay-budget-cancel-button"
					id="id-cancel-button"
					label="Cancel" 
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button 
					data-automation-id="pay-budget-transfer-button"
					id="id-transfer-button" 
					type="primary" 
					label="Transfer"
					@click="${() => this._onTransferClick()}">
				</capitec-button>
			</capitec-group>`;
	}
}

window.customElements.define(`capitec-pc-pay-budget-dialog`, PayCreditCardBudget);

/**
 * When cancel button is clicked
 *
 * @example
 * <capitec-pc-pay-budget-dialog ... @cancel="${this._handler}"></capitec-pc-pay-budget-dialog>
 *
 * @event PayCreditCardBudget#cancel
 * @type {Object} N/A
 */

/**
 * When transfer button is clicked
 *
 * @example
 * <capitec-pc-pay-budget-dialog ... @transfer="${this._handler}"></capitec-pc-pay-budget-dialog>
 *
 * @event PayCreditCardBudget#transfer
 * @type {Object} N/A
 */