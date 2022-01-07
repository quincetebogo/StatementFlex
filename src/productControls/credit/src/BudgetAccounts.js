import { Component, css, html } from 'platform/elements';
import { Utilities } from '@cb/platform-web-core';
import { formatCurrency } from 'app/utils/channelServiceUtilities';

import 'app/components/common/OptionButton';
import 'app/components/common/HorizonLabel';

/**
 * Budget facility Accounts view Product Control
 * 
 * Events Raised
 * -------------
 * back
 * account-details
 * 
 * @export
 * @class BudgetFacilityAccounts
 * @extends {Component}
 */
 export class BudgetFacilityAccounts extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.budgetFacilityAccounts = null;
		this.groupAccountsByTerm = null;
		this.filteredAccounts = null;
		this.searchText = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
		
		// Grouping budget accounts available based on total number of term months.
		this.groupAccountsByTerm = Utilities.groupBy(this.budgetFacilityAccounts.creditCardBudgetList, `originalTerm`);
		this.filteredAccounts = { ...this.groupAccountsByTerm };
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {budgetFacilityAccounts} budgetFacilityAccounts List of Budget facility accounts and their details
	 *
	 */
	static get properties() {
		return {
			budgetFacilityAccounts: { type: Object },

			groupAccountsByTerm: { state: true },
			filteredAccounts: { state: true }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------
	
	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_accountDetails(selectedBudgetAccount) {
		this.dispatchEvent(new CustomEvent(`account-details`, {
			detail: { selectedAccountDetails: selectedBudgetAccount }
		}));
	}

	_searchValueChange(event) {
		
		this.filteredAccounts = { ...this.groupAccountsByTerm };
		this.searchText = event.detail.new.toLowerCase();

		if (this.searchText) {
			Object.keys(this.filteredAccounts).forEach(term => {
				this.filteredAccounts[term] = this.filteredAccounts[term].filter(item => item.budgetName.toLowerCase().indexOf(this.searchText) !== -1 ||
																						parseFloat(item.budgetInstallment).toFixed(2).startsWith(this.searchText) ||
																						parseFloat(item.originalAmount).toFixed(2).startsWith(this.searchText) ||
																						parseFloat(item.budgetBalance).toFixed(2).startsWith(this.searchText));
			});
		}

		this.requestUpdate();
	}

	_transferClick() {
		// TO DO: Transfer click functionality should come here.
	}

	// --------------
	// PUBLIC METHODS
	// --------------
	
	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------
	
	// N/A
	
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					width: 100%;
					height: 888px;
				}

				/* Title Bar styles */
				capitec-title-bar {
					--theme-titlebar-padding: 14px 16px 0px 16px;
					--theme-titlebar-item-gap: 0px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
					width: 900px;
					margin-bottom: 16px;
					height: 32px;
				}
				.left-arrow {
					cursor: pointer;
					margin: 0px 15px 8px 0px;
				}

				/* Account details bar styles */
				.account-details-bar {
					width: auto;
					height: 64px;
				}
				.account-details-bar > horizon-label {
					width: auto;
					padding: 12px 62px 12px 0px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-value-color:#FFFFFF;
				}

				/* Search bar styles */
				capitec-search-field {
					margin: 8px 16px;
				}

				/* Busget Accounts content styles */
				capitec-content-box {
					width: auto;
					height: 678px;
					
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
				}
				horizon-label {
					height: 100%;
					width: 158px;
					font-weight: 300;
					justify-content: left;
					padding: 12px 0px 12px 16px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color:#3A3A3A;
				}
				horizon-label[label="Budget name"] {
					width: 284px;
					--theme-label-cursor: pointer;
				}
				.term-header {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 16px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-item-gap: 0px;
					border-top: 1px solid rgb(225, 225, 225);
					border-bottom: 1px solid rgb(225, 225, 225);
				}
				.accounts-group {
					padding-bottom: 24px;
					height: auto;
					--theme-layout-gap-spacing: 0px;
				}
				.account-details-tile {
					margin: 16px 16px 0px 16px;
					width: 1032px;
					height: 64px;
					border: 1px solid #e1e1e1;
					border-radius: 4px;
					padding: 0px 16px;
				}
				.account-details-tile > capitec-icon {
					--theme-icon-size-medium: 24px;
					cursor: pointer;
				}
				.account-details-tile > capitec-button {
					--theme-button-font-weight: 600;
				}
				.vertical-line{
					height: 48px;
					width: 1px;
					margin-left: 16px;
					background-color: #E1E1E1;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card 
				data-automation-id="budget-facility-list-view"
				class="card">
					<capitec-title-bar 
						data-automation-id="budget-facility-title"
						type="credit">
							<img
								data-automation-id="budget-facility-back-button"
								src="src/productControls/credit/images/left-arrow.svg"
								@click="${() => this._back()}"
								class="left-arrow"/>
							<capitec-label label="Budget Facility" type="Title"></capitec-label>
						
							${this._renderAccountDetailsBar()}
				
					</capitec-title-bar>

					<capitec-content-box>
						${this._renderSearchBar()}
						${this._renderBudgetAccounts()}
					</capitec-content-box>

			</capitec-card>
		`;
	}
	
	_renderAccountDetailsBar() {
		return html`
			<capitec-group class= "account-details-bar" layout="horizontal" gap="none" halign="left" valign="center">

				<horizon-label
					data-automation-id="budget-facility-credit-card-number"
					label="Credit card"
					value="${this.budgetFacilityAccounts.creditCardNumber}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-number-of-budgets"
					label="Number of budget accounts"
					value="${this.budgetFacilityAccounts.numberOfBudgetAccounts}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-total-budget-balance"
					label="Total budget balance"
					value="${formatCurrency(this.budgetFacilityAccounts.totalBudgetBalance)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-total-budget-installment"
					label="Total budget installment (monthly)"
					value="${formatCurrency(this.budgetFacilityAccounts.totalBudgetInstallmentAmount)}">
				</horizon-label>
			</capitec-group>
		`;
	}

	_renderSearchBar() {
		return html`
			<capitec-search-field
				data-automation-id="budget-facility-search-bar"
				label="Search for amount or transaction name" 
				value="${this.searchText}"
				@key-input="${(event) => this._searchValueChange(event)}">
			</capitec-search-field>
		`;
	}

	_renderBudgetAccounts() {
		return Object.entries(this.filteredAccounts).map(termGroup => {
			const [term, accountsList] = termGroup;
			return accountsList.length !== 0
			 ? html`
					<capitec-group class="accounts-group" layout="vertical" gap="none" halign="left" valign="center">
						<capitec-title-bar
							data-automation-id="budget-facility-term-group-header"
							class="term-header"
							type="default"
							label="${term} months">
						</capitec-title-bar>
						${accountsList.map(budgetAccount => this._renderBudgetAccountTile(budgetAccount))}
					</capitec-group>`
				: html``;
		});
	}

	_renderBudgetAccountTile(budgetAccount) {
		return html`
			<capitec-group class="account-details-tile" layout="horizontal" gap="none" halign="left" valign="center">
				<capitec-icon
					data-automation-id="budget-facility-account-info"
					size="medium" 
					icon="system/info-action"
					@click="${() => this._accountDetails(budgetAccount)}">
				</capitec-icon>

				<horizon-label
					data-automation-id="budget-facility-account-name"
					label="Budget name"
					value="${budgetAccount.budgetName}"
					@click="${() => this._accountDetails(budgetAccount)}">
				</horizon-label>

				<div class="vertical-line"></div>

				<horizon-label
					data-automation-id="budget-facility-monthly-repayment"
					label="Monthly repayment"
					value="${formatCurrency(budgetAccount.budgetInstallment)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-purchase-amount"
					label="Purchase amount"
					value="${formatCurrency(budgetAccount.originalAmount)}">
				</horizon-label>

				<horizon-label
					data-automation-id="budget-facility-outstanding-balance"
					label="Outstanding balance"
					value="${formatCurrency(budgetAccount.budgetBalance)}">
				</horizon-label>

				<capitec-spacer></capitec-spacer> 
				
				<capitec-button
					data-automation-id="budget-facility-transfer-button"
					type="clear"
					label="Transfer"
					@click="${() => this._transferClick()}">
				</capitec-button>
			</capitec-group>`;
	}
}

customElements.define(`capitec-pc-budget-facility-accounts`, BudgetFacilityAccounts);

/**
 * When back arrow is clicked
 *
 * @example
 * <capitec-pc-budget-facility-accounts ... @back"${this._handler}"></capitec-pc-budget-facility-accounts>
 *
 * @event BudgetFacilityAccounts#click
 * @type {Object} N/A
 */

/**
 * When Account name or info icon is clicked
 *
 * @example
 * <capitec-pc-budget-facility-accounts ... @account-details"${this._handler}"></capitec-pc-budget-facility-accounts>
 *
 * @event BudgetFacilityAccounts#click
 * @type {Object} 
 * @property {Object} detail - Contains information on the clicked item
 * @property {String} detail.selectedAccountDetails - Selected budget facility account details
 */