import { Component, css, html } from 'platform/elements';
import { deformatCurrency, formatCurrency, formatTextFieldCurrency } from 'app/productControls/utilities/Currency';
import { formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonSelectIcon';
import 'app/components/common/HorizonTextField';

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
		this.savStatus = false;
		this.savingAccountsList = [];
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
			payBudgetfromAccounts: { type: Object },
			productSelected: { state: true },
			budgetAmount: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		[this.productSelected] = this.clientProducts;
		this.budgetAmount = this.budgetAccountDetails.settlementAmount;
		this.savingAccountsList = this.payBudgetfromAccounts;
		this._getErrorMessage();
		this._onLoading();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._onUnLoading();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	
	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_onTransferClick() {
		if (isNullorEmpty(this.bannerMessage) && isNullorEmpty(this.errorMessage)) {
			const transferDetails = {
				budgetName: this.budgetAccountDetails.budgetName,
				budgetAccountNumber: this.budgetAccountDetails.budgetAccountNumber,
				fromAccountNumber: this.productSelected.accountNumber,
				fromAccountType: this.productSelected.accountType,
				authorisedAmount: this.budgetAmount,
				budgetSequenceNumber: this.budgetAccountDetails.budgetSequence,
				productTypeCode: this.budgetAccountDetails.productTypeCode
			};

			this.dispatchEvent(new CustomEvent(`transfer`, { detail: transferDetails }));
		}
	}

	_accountValueChanged(e) {
		if (e.detail.new) {
			this.productSelected = e.detail.new;
			this._getErrorMessage();
		}
	}

	_budgetFocusOut(e) {
		this.budgetAmount = parseFloat(e.currentTarget.value || `0`).toFixed(2);
		this._getErrorMessage();
	}

	_budgetValueChange(e) {
		if (e.detail.action === `clear`) {
			this.budgetAmount = this.budgetAccountDetails.settlementAmount;
			this._getErrorMessage();
			return;
		}

		this.budgetAmount = e.detail.new || 0;
		this._getErrorMessage();
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_getErrorMessage() {
		
		this.errorMessage = ``;
		this.bannerMessage = ``;
		this.savStatus = false;

		// Entered budget amount exceeds the actual settlement amount
		if (parseFloat(this.budgetAmount) > parseFloat(this.budgetAccountDetails.settlementAmount)) {
			this.bannerMessage = `Transfer amount cannot exceed the budget amount.`;
			this.errorMessage = `Max amount ${formatCurrency(this.budgetAccountDetails.settlementAmount)}`;
			return;
		}

		// No account has enough funds to do transfer as entered amount
		const noFundsInAllAccounts = this.clientProducts.filter(account => deformatCurrency(account.availableBalance) > parseFloat(this.budgetAmount)).length === 0;
		if (noFundsInAllAccounts) {
			this.bannerMessage = `You do not have enough fund in your account to do the transfer.`;
			this.errorMessage = `Transfer cannot exceed available balance`;
			return;
		}

		// Entered budget amount exceeds the available balance of selected account
		if (parseFloat(this.budgetAmount) > deformatCurrency(this.productSelected.availableBalance)) {
			this.errorMessage = `Transfer cannot exceed available balance`;
		}

		const acc = this.productSelected.accountNumber;
			let i = 0;
			while (i < this.savingAccountsList.length) {
				if (acc == this.savingAccountsList[i].accountNumber && this.savingAccountsList[i].savingsPermissionStatus === `DENIED`) {
					this.bannerMessage = `The account selected cannot be used to perform this transaction`;
					this.savStatus = true;
					this.errorMessage = `   `;
					return;
				}
				i++;
			}

		if (isNullorEmpty(this.budgetAmount)) {
			this.errorMessage = `Transfer amount cannot be empty`;
		}
	}

	_onLoading() {
		this.dispatchEvent(new CustomEvent(`on-loading`, {}));
	}

	_onUnLoading() {
		this.dispatchEvent(new CustomEvent(`on-unloading`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					border-radius: 4px;

					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
				}

				div[slot="body"] {
					height: 530px;
					width: 640px;
					border-bottom: 1px solid #E1E1E1;
				}

				horizon-label {
					margin: 24px 0px 27px 0px;

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
				}

				horizon-select-icon {
					--theme-select-options-max-height: 304px;
					--theme-input-icon-margin-left: 16px;
					--theme-icon-size-small: 24px;
					--theme-layout-gap-spacing: 8px;
					--theme-input-padding-top: 8px;
					--theme-input-padding-bottom: 8px;

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

					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 15px;
					--theme-label-font-color: #3A3A3A;
				}

				capitec-label[type="title"] {
					--theme-label-title-font-weight: 600;
					--theme-label-title-font-size: 16px;
				}

				capitec-button {
					height: 48px;
					--theme-button-font-weight: 600;
				}

				capitec-alert-banner {
					--theme-alert-banner-height: 64px;
					--theme-alert-banner-icon-margin-left: 16px;
					margin-bottom: 16px;
				}

				capitec-alert-banner > capitec-label[type="strong"] {
					--theme-label-strong-font-weight: 600;
				}
			`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Transfer">
				<div slot="body">
					<capitec-content-box
						layout="vertical"
						halign="stretch"
						valign="top"
						gap="clear">
							${this._renderAlertBanner()}
							${this._renderContent()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderAlertBanner() {
		return this.bannerMessage 
		? html`
			<capitec-alert-banner
				data-automation-id="pay-budget-alert-banner"
				type="error">
					<capitec-label
						label="Notify client: ${this.bannerMessage}"
						type="strong">
					</capitec-label>
			</capitec-alert-banner>`
		: html``;
	}

	_renderContent() {
		return html`
			<capitec-label
				type="title" 
				label="Transfer from">
			</capitec-label>

			<horizon-select-icon
				data-automation-id="pay-budget-choose-from-account"
				label="Choose account"
				display-field="availableBalance"
				id-field="accountNumber"
				detail-label="Available balance"
				.items="${this.clientProducts}"
				.value="${this.productSelected}"
				.displayRenderer="${(e) => this._renderOptions(e)}"
				@value-changed="${(e) => this._accountValueChanged(e)}"> 
			</horizon-select-icon>
			
			<horizon-label
				data-automation-id="pay-budget-name"
				label="Budget name"
				value="${formatStringAsPascalCase(this.budgetAccountDetails.budgetName)}">
			</horizon-label>

			<horizon-text-field
				data-automation-id="pay-budget-balance"
				label="Budget amount"
				type="currency"
				?enableClear="${true}"
				.error="${this.errorMessage}"
				?disabled="${this.savStatus}"
				value="${this.budgetAmount}"
				@key-input="${(e) => this._budgetValueChange(e)}"
				@focusout="${(e) => this._budgetFocusOut(e)}">
			</horizon-text-field>
		`;
	}

	_renderOptions(e) {
		return html`
			<capitec-group ?noPadding="${true}" layout="horizontal" style="height: 36px;">
				${this._renderOptionIcon(e)}
				
				<horizon-label
					label="${e.accountName}"
					value="Available balance">
				</horizon-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label
					label="${e.availableBalance}">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderOptionIcon(e) {
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
			</capitec-image>
		`;
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
					?disabled="${this.savStatus}"
					@click="${() => this._onTransferClick()}">
				</capitec-button>
			</capitec-group>
		`;
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