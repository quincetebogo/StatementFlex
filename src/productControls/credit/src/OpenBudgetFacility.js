import { Component, css, html } from 'platform/elements';
import { formatCurrency, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { BUDGET_TERMS } from 'app/constants/Credit';
import { Logger } from 'platform/core';

import 'app/components/common/HorizonLabel';

const minAmount = 300;

/**
 * This component helps in opening budget facility
 * 
 * Events Raised 
 * -------------
 * cancel
 * add-budget
 * 
 * @export
 * @class OpenBudgetFacility
 * @extends {Component}
 */
export class OpenBudgetFacility extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.budgetName = ``;
		this.budgetAmount = 0;
		this.formattedBudgetAmount = ``;
		this.paymentPlans = [];
		this.selectedTerm = {};

		this._budgetNameErrBanner = ``;
		this._budgetAmountErrBanner = ``;

		this.logger = Logger.getInstance();
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
			ccAccNumber: { type: String },
			revolvingBalance: { type: Number },
			calculateBudget: { type: Object },

			budgetName: { type: String, state: true },
			budgetAmount: { type: Number, state: true },
			budgetAmountErr: { type: String, state: true },
			_budgetNameErrBanner: { type: String, state: true },
			_budgetAmountErrBanner: { type: String, state: true },
			formattedBudgetAmount: { type: String, state: true }
		};
	}

	get budgetSummary() {
		const term = !this.selectedTerm?.term ? `0` : `${BUDGET_TERMS[this.selectedTerm.term]} Months`;
		const instalment = this.selectedTerm?.instalment || 0;
		const interest = this.selectedTerm?.interestRate || 0;

		return {
			term: `${term}`,
			instalment: `${formatCurrency(instalment)}`,
			interest: `${interest}%`
		};
	}

	get addBtnDisabled() {
		const hasEmptyFields = !this.budgetName || this.budgetAmount === 0 || !this.selectedTerm.term;
		return Boolean(this.errorBannerMsg) || hasEmptyFields;
	}

	get errorBannerMsg() {
		if (Boolean(this._budgetNameErrBanner) && Boolean(this._budgetAmountErrBanner)) {
			return `You must complete all fields to add budget`;
		}
		return this._budgetNameErrBanner || this._budgetAmountErrBanner;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();
		await this._initialise();
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

	_onAddBudgetClick() {
		this.dispatchEvent(new CustomEvent(`add-budget`, {
			detail: {
				budgetName: this.budgetName,
				budgetAmount: this.budgetAmount,
				selectedTermInfo: this.selectedTerm
			}
		}));
	}

	_onBudgetNameInput() {
		this.budgetNameErr = ``;
		this._budgetNameErrBanner = ``;
	}

	_onBudgetNameChanged(event) {
		this.budgetName = event.detail.new?.trim();

		if (!RegExp(/^[A-Za-z0-9 ]+$/, `g`).test(this.budgetName)) {
			this.budgetNameErr = `Budget name cannot have special characters.`;
			this._budgetNameErrBanner = `Invalid Special Character(s)`;
		}
	}

	_onBudgetAmountFocus() {
		this.formattedBudgetAmount = this.budgetAmount;
	}

	_onBudgetAmountChange(e) {
		// platform disptaches multiple events on change, one of which is not object
		// skipping when detail is not an object
		if (typeof e.detail !== `object`) {
			return;
		}

		this.budgetAmount = this.formattedBudgetAmount = parseFloat(e.detail.new || 0);
		this._validateBudgetAmount();
	}

	async _onBudgetAmountFocusOut() {
		this.formattedBudgetAmount = formatCurrency(this.budgetAmount, 2, false);
		await this._calculateBudget();
	}

	_onTermChanged(event) {
		this.selectedTerm = event.detail.new;
		this.requestUpdate();
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {
		this.revolvingBalance = this.revolvingBalance < 0 ? this.revolvingBalance * -1 : this.revolvingBalance;
		this.budgetAmount = this.revolvingBalance;
		this.formattedBudgetAmount = formatCurrency(this.budgetAmount, 2, false);
		await this._calculateBudget();
	}

	async _validateBudgetAmount() {
		switch (true) {
			case this.budgetAmount < minAmount:
				this._budgetAmountErrBanner = `Budget amount cannot be less than the minimum amount.`;
				this.budgetAmountErr = `Min budget amount ${formatCurrency(minAmount)}`;
				break;
			case this.budgetAmount > this.revolvingBalance:
				this._budgetAmountErrBanner = `Budget amount cannot be more than the avaiable budget.`;
				this.budgetAmountErr = `Max available budget amount ${formatCurrency(this.revolvingBalance)}`;
				break;
			default:
				this._budgetAmountErrBanner = ``;
				this.budgetAmountErr = ``;
				break;
		}
		await this.requestUpdate();
	}

	async _calculateBudget() {
		
		if (!isNullorEmpty(this.budgetAmountErr)) {
			this.paymentPlans = [];
			return;
		}

		const returnValue = await this.calculateBudget(this.ccAccNumber, this.budgetAmount);
		
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to calculate budget for ${this.budgetAmount}.`, `_calculateBudget`, returnValue.correlationId);
			this.paymentPlans = [];
		}

		this.paymentPlans = returnValue.result.map(item => {
			item.label = `${BUDGET_TERMS[item.term]} Months - Instalment amount R${item.instalment}`;
			return item;
		});
		this.requestUpdate();
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				capitec-modal {
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
				}

				div[slot="body"] {
					width: 500px;
					height: 594px;
					border-bottom: 1px solid #E1E1E1;
				}

				.content {
					--theme-layout-gap-spacing: 32px;
				}
				.content > *:first-child {
					--theme-layout-gap-spacing: 24px;
				}
				.content > capitec-text-field([error=""]) {
					--theme-layout-gap-spacing: 32px;
				}
				.content > capitec-text-field:not([error=""]) {
					--theme-layout-gap-spacing: 23px;
				}
				
				capitec-alert-banner {
					--theme-toast-width: 100%;
				}
				capitec-select {
					--theme-select-options-max-height: 170px;
				}
				capitec-label[type="strong"] {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 400;
				}

				horizon-label {
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-font-weight: 400;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}

				.budget-summary-box {
					height: auto;
					--theme-layout-gap-spacing: 12px;
					background-color: #F5F5F5;
				}
				.budget-summary-box > capitec-label[type="subtitle"] {
					--theme-label-font-color: #3A3A3A;
					--theme-label-subtitle-font-weight: 600;
				}
				.budget-summary-box > capitec-group {
					--theme-layout-gap-spacing: 32px;
				}

				div[slot="footer"] > *:first-child {
					margin-right: 16px;
				}
				
				capitec-button {
					--theme-button-font-weight: 600;
					--theme-button-padding-top: 12px;
					--theme-button-padding-bottom: 12px;
					--theme-button-padding-right: 14px;
					--theme-button-padding-left: 14px;
				}
			`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Add budget facility">
				<div slot="body">
					<capitec-content-box
						class="content"
						layout="vertical"
						halign="stretch"
						valign="top"
						gap="clear">
							${this._renderBanner()}
							${this._renderContent()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderBanner() {
		return !this.errorBannerMsg
		? html`${this._renderInfoBanner()}`
		: html`${this._renderErrorBanner()}`;
	}

	_renderInfoBanner() {
		return html`
			<capitec-alert-banner
				type="info"
				header="Notify client:"
				label="Confirm the following information to approve adding a new budget facility."
				layout="vertical">
			</capitec-alert-banner>
		`;
	}

	_renderErrorBanner() {
		return html`
			<capitec-alert-banner
				type="error"
				header="Notify client:"
				label="${this.errorBannerMsg}"
				layout="vertical">
			</capitec-alert-banner>
		`;
	}

	_renderContent() {
		return html`
			<capitec-text-field
				label="Enter budget name"
				value="${this.budgetName}"
				type="alpha-numeric"
				error="${this.budgetNameErr}"
				keyboardMode="alpha-numeric"
				@input="${() => this._onBudgetNameInput()}"
				@value-change="${(event) => this._onBudgetNameChanged(event)}">
			</capitec-text-field>
			<capitec-text-field
				label="Available for budget"
				value="${formatCurrency(this.revolvingBalance, 2, false)}"
				type="currency"
				error=""
				disabled>
			</capitec-text-field>
			<capitec-text-field
				label="Budget Amount (min ${formatCurrency(minAmount)})"
				value="${this.formattedBudgetAmount}"
				type="currency"
				error="${this.budgetAmountErr}"
				keyboardMode="numeric"
				@input="${(e) => this._onBudgetAmountChange(e)}"
				@keyboard-input-focus="${(e) => this._onBudgetAmountFocus(e)}"
				@blur="${(e) => this._onBudgetAmountFocusOut(e)}">
			</capitec-text-field>
			<capitec-select
				.items="${this.paymentPlans}"
				label="Choose term"
				display-field="label"
				id-field="term"
				.value="${this.selectedTerm}"
				.displayRenderer="${(e) => this._renderTermOptions(e)}"
				@value-change="${(event) => this._onTermChanged(event)}">
			</capitec-select>

			${this._renderBudgetSummary()}
		`;
	}

	_renderTermOptions(e) {
		return html`
			<span><b>${BUDGET_TERMS[e.term]} Months</b> - </span>
			<span>Instalment amount R${e.instalment}</span>
		`;
	}

	_renderBudgetSummary() {
		const summary = this.budgetSummary;
		return html`
			<capitec-content-box
				class="budget-summary-box"
				layout="vertical"
				gap="clear">
					<capitec-label type="subtitle" label="Budget facility summary"></capitec-label>

					<capitec-group layout="horizontal" gap="clear">
						<horizon-label
							label="Budget term"
							value="${summary.term}">
						</horizon-label>
						<horizon-label
							label="Monthly instalment amount"
							value="${summary.instalment}">
						</horizon-label>
						<horizon-label
							label="Interest"
							value="${summary.interest}">
						</horizon-label>
					</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-button
				label="Cancel"
				@click="${() => this._onCancelClick()}">
			</capitec-button>
			<capitec-button
				label="Add budget"
				type="primary"
				@click="${() => this._onAddBudgetClick()}"
				?disabled="${this.addBtnDisabled}">
			</capitec-button>
		`;
	}
}

window.customElements.define(`capitec-pc-open-budget-facility`, OpenBudgetFacility);

/**
 * When cancel button is clicked
 *
 * @example
 * <capitec-pc-open-budget-facility ... @cancel="${this._handler}"></capitec-pc-open-budget-facility>
 *
 * @event OpenBudgetFacility#cancel
 * @type {Object} N/A
 */

/**
 * When transfer button is clicked
 *
 * @example
 * <capitec-pc-open-budget-facility ... @add-budget="${this._handler}"></capitec-pc-open-budget-facility>
 *
 * @event OpenBudgetFacility#addBudget
 * @type {Object} N/A
 */