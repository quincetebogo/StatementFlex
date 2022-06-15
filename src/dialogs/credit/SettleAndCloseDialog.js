import { Component, css, html } from 'platform/elements';

import 'app/components/common/HorizonSelectIcon';

/**
 * Common component to settle & close credit card/Term loans by choosing an account
 * from which amount can be transfered.
 * 
 * Events Raised 
 * -------------
 * 
 * 
 *  
 * @export
 * @class SettleAndCloseDialog
 * @extends {Component}
 */
export class SettleAndCloseDialog extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.productSelected = {};
		this.hasEnoughFunds = false;
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
			settleAndCloseDetails: { type: Object },
			clientProducts: { type: Object },
			productSelected: { state: true },
			hasEnoughFunds: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		[this.productSelected] = this.clientProducts;
		this.hasEnoughFunds = this._deformatCurrency(this.productSelected.availableBalance) >= this._deformatCurrency(this.settleAndCloseDetails[`Settlement amount`]);
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

	_onSettleAndCloseClick(product) {
		if (this.hasEnoughFunds) {
			this.dispatchEvent(new CustomEvent(`settle-and-close`, {
				detail: {
					productSelected: product,
					settleAndCloseDetails: this.settleAndCloseDetails
				}
			}));
		}
	}

	_valueChanged(e) {
		if (e.detail.new) {
			this.productSelected = e.detail.new;
			this.hasEnoughFunds = this._deformatCurrency(this.productSelected.availableBalance) >= this._deformatCurrency(this.settleAndCloseDetails[`Settlement amount`]);
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

	_deformatCurrency(value) {
		const amount = value.split(`R`)[1].replaceAll(` `, ``);
		return parseFloat(amount);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-form-m-l-xl-width: 642px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 0;
					--theme-modal-body-padding: 0;
				}
				div[slot="body"] {
					height: 700px
				}
				capitec-content-box {
					--theme-layout-gap-spacing: 4px;
					padding: 16px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 84px;
					--theme-alert-banner-icon-margin-left: 16px;
					margin-bottom: 9px;
				}
				.error-banner {
					--theme-alert-banner-height: 64px;
				}
				capitec-label {
					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 16px;
					--theme-label-font-color: #3A3A3A;
				}
				.alert-header {
					--theme-label-default-font-size: 14px;
				}
				.alert-message {
					--theme-label-default-font-weight: 500;
					--theme-label-default-font-size: 14px;
				}
				horizon-label {
					height: 64px;
					width: 190px;
					padding: 12px 0px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-font-weight: 500;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-font-weight: 600;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}
				.details-group {
					--theme-layout-gap-spacing: 12px;
				}
				horizon-select-icon {
					padding-top: 16px;
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
				.footer-class {
					border-top: 1px solid #E1E1E1;
				}
				.footer-class > capitec-group {
					width: 642px;
					padding: 8px 16px; 
				}
				capitec-button {
					height: 48px;
					--theme-button-font-weight: 600;
				}
				capitec-button[disabled]{
					--theme-button-primary-background-color: #f5f5f5;
					--theme-button-primary-border-width: 1px;
					--theme-button-primary-border-color: #f5f5f5;
					--theme-button-primary-font-color: #7c7c7c;
				}`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal
				data-automation-id="settle-and-close-choose-account-modal"
				type="form"
				header-align="left"
				header="${this.settleAndCloseDetails.header}">
					<div slot="body">
						<capitec-content-box
							layout="vertical"
							halign="stretch"
							valign="top"
							gap="clear"
							?noPadding="${true}">
								${this._renderAlertBanner()}
								${this._renderContent()}
						</capitec-content-box>
					</div>
					<div slot="footer" class="footer-class">
						${this._renderFooter()}
					</div>
			</capitec-modal>`;
	}

	_renderAlertBanner() {
		return this.hasEnoughFunds
		? html`
			<capitec-alert-banner 
				type="warning" 
				data-automation-id="settle-and-close-notification-banner">
					<capitec-label class="alert-header" label="Notify client:"></capitec-label>
					<capitec-label class="alert-message" label="The settlement amount on your account is only valid if you conclude this settlement transaction now."></capitec-label>
			</capitec-alert-banner>`
		: html`
			<capitec-alert-banner 
				data-automation-id="settle-and-close-error-banner"
				class="error-banner" 
				type="unsuccessful-red">
					<capitec-label class="alert-header" label="Notify client:"></capitec-label>
					<capitec-label class="alert-message" label="You do not have enough funds in your account to do the transfer."></capitec-label>
			</capitec-alert-banner>
		`;
	}

	_renderContent() {
		return html`
			<capitec-label
				label="Account details">
			</capitec-label>
			
			<capitec-group
				class="details-group"
				valign="top"
				halign="left"
				gap="clear"
				layout="horizontal"
				wrap>
				${this._renderFields()}
			</capitec-group>

			<capitec-label
				label="Settle from account">
			</capitec-label>
			
			<horizon-select-icon
				data-automation-id="settle-and-close-select-account"
				label="Choose account"
				display-field="availableBalance"
				id-field="accountNumber"
				detail-label="Available balance"
				.items="${this.clientProducts}"
				.value="${this.productSelected}"
				.error="${this.hasEnoughFunds ? null : `Transfer cannot exceed available balance`}"
				.displayRenderer="${(e) => this._renderOptions(e)}"
				@value-changed="${(e) => this._valueChanged(e)}">
			</horizon-select-icon>
		`;
	}

	_renderFields() {
		// Creates similar constant to this.settleAndCloseDetails without 'header'.
		const { header: _, ...accDetails } = this.settleAndCloseDetails;
		
		return Object.entries(accDetails).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					label="${label}"
					value="${value ?? `-`}"
					data-automation-id="settle-and-close-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
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
					data-automation-id="settle-and-close-cancel-button"
					id="id-cancel-button"
					label="Cancel" 
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button 
					data-automation-id="settle-and-close-confirm-transfer"
					id="id-transfer-button" 
					type="primary" 
					?disabled="${!this.hasEnoughFunds}"
					label="${this.settleAndCloseDetails.header}"
					@click="${(e) => this._onSettleAndCloseClick(this.productSelected)}">
				</capitec-button>
			</capitec-group>`;
	}
}

window.customElements.define(`horizon-settle-and-close-dialog`, SettleAndCloseDialog);

/**
 * When cancel button is clicked
 *
 * @example
 * <horizon-settle-and-close-dialog ... @cancel="${this._handler}"></horizon-settle-and-close-dialog>
 *
 * @event SettleAndCloseDialog#cancel
 * @type {Object} N/A
 */

/**
 * When transfer button is clicked
 *
 * @example
 * <horizon-settle-and-close-dialog ... @settle-and-close="${this._handler}"></horizon-settle-and-close-dialog>
 *
 * @event SettleAndCloseDialog#settle-and-close
 * @type {Object} N/A
 */