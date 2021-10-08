import { css, html, unsafeCSS } from 'platform/elements';
import { Configuration } from 'platform/core';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { ViewBase } from 'app/views/common/ViewBase';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { LivBetterService } from 'app/services/LiveBetterService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';
import { ACCOUNT_TYPES } from 'app/constants/TransactionHistory';
import { EXPANDER_LABEL, TABLE_EXPANDER_CELL, LINKED_TRANSACTION } from 'app/css/Lbb-TransactionHistory';

import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';

import 'app/productControls/liveBetterSavingsAccount/src/LiveBetterSavings';
import 'app/productControls/liveBetterSavingsAccount/src/AccountDetails';

import 'app/components/common/TransactionHistory';
import 'app/components/liveBetter/LiveBetterUnverifiedPage';
import 'app/components/dialogs/liveBetter/ManageAutomaticSavings';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/dialogs/liveBetter/LBBTransactionDetails';
import { LBBLinkedTransactionDetails } from 'app/mocks/LiveBetterLandingMocks';

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: 'LBB',
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - 7776000000).toISOString().substr(0, 10),// 7776000000 is 90 days in milliseconds
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

/**
 * Live Better View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class LiveBetter
 * @extends {ViewBase}
 */
export class LiveBetter extends ViewBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	
		// private properites
		this.loading = true;
		this.executed = false;
		this.showTooltip = false;
		this.journalNumber = `00000`;
		
		this.livBetterService = new LivBetterService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();		
		this._initialise();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			loading: { attribute: false },
			showTooltip: { attribute: false },
			transactionHistory: { attribute: false },
			journalNumber: { type: String, attribute: false }
		};
	}
	
	// --------------
	// EVENT HANDLERS
	// --------------

	async _clientVerified(event) {
		super._clientVerified(event);

		// re-initialise the page when the verification status changes
		// verificationStatus is on the this.callerInformation object
		await this._initialise();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_accountDetails() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ACCOUNT_NUMBER, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_ACCOUNT_DETAILS
		});

		this.renderMode = RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS;
	}

	_toggleRoundUp() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ROUND_UP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_toggleInterestSweep() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_INTEREST_SWEEP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_backToLBBLandingScreen() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}
	
	_setIncidentDone() {
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _optionClick(option) {

		const transactionHistory = () => this._transactionHistory();
		const statements = () => this._getStatements();
		const automaticSavings = () => this._automaticSavings();
		const productEnquiry = () => this._productEnquiry();

		const actions = {
			'transaction-history': transactionHistory,
			'statements': statements,
			'automatic-savings': automaticSavings,
			'product-enquiry': productEnquiry
		};

		if (actions[option]) {
			await super._inicidentManager_(option, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();
			return actions[option]();
		}
	};

	async _getMoreTransactions(request) {

		const result = await this.livBetterService.liveBetterTransactionHistory(request, () => true);
		return result;
	}
	
	_linkedTransactionClick(transactionDetails, formatedAmount) {
		
		this._telemetry.logEvent(LiveBetterEvents.LBB_TRANSACTION_HISTORY_VIEW_LINKED_TRANSACTIONS, {
			"screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY,
			"next-screen": TelemetryScreen.LIVE_BETTER_LINKED_TRANSACTIONS
		});

		this.selectedLinkedTransaction = transactionDetails;
		this.selectedLinkedTransaction.amount = formatedAmount;

		this.renderMode = RENDER_MODE.LINKED_TRANSACTION_DETAILS;
	}
	
	async _getLinkedransactionDetails(item) {
		
			this._telemetry.logEvent(LiveBetterEvents.LBB_TRANSACTION_HISTORY_INFO, {
				"screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY
			});

			const transactionHistoryRequest = {
				"journalNumber": this.journalNumber, // "453858"// Details to work on DEV - for testing. 
				"accountNumber": this.landingPageInfo.accountNumber, //"1733256405"//
				"postingDate": item.postingDate //"2021-06-22"//
			};

			const returnValue = await this.livBetterService.lbbLinkedTransactionDetails(transactionHistoryRequest);
			
			if(returnValue.succeeded && returnValue.result) {
				return returnValue.result.linkedTransactions;
			} else {
				return [];
			}
	}
	
	// Function that gets triggered on changing values for those set as properties ( eg: "journalNumber", "transactionHistory" ).
	async updated(changedProperties) {

		const journalNumber = !(!changedProperties.get('journalNumber'));
	
		if(journalNumber) {
			const expandedItem = this.transactionHistory.find( item => item.journalNumber === this.journalNumber);
			expandedItem.linkedTransactionDetails = await this._getLinkedransactionDetails(expandedItem);
			this.requestUpdate();
		}
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialise() {

		this.verificationStatus = this.callerInformation.verificationStatus;
		
		if (this.verificationStatus === `verified`) {

			const clientDetails = {
				"cifNumber": this.callerInformation.cifNumber,
				"GetGenericData": true,
				"NationalIDNumber": this.callerInformation.southAfricanIDNumber
			  };

			const returnValue = await this.livBetterService.liveBetterLanding(clientDetails);

			if(returnValue.succeeded && returnValue.result) {
			
				// Navigate to Live better verified landing page if a client has Live better account 
				this._telemetry.startSpan(LiveBetterEvents.LIVE_BETTER, {
					"screen": TelemetryScreen.LIVE_BETTER,
					"liveBetter": true
				});

				this.landingPageInfo = returnValue.result;
				this._updateLeftBar()

			} else if(returnValue.succeeded) {

				// Navigate to Live better non-client page if a client is not registered with Live better account
				this.horizonRouter.navigateToProductInfo('LiveBetter');
			}
			
		}
		
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.endCallContext = `LandingPage`;
		this.loading = false;
	}

	_updateLeftBar() {
		let subtitle = null;
		let detail = null;

		if (this.landingPageInfo) {
			subtitle = {
				savingsAccount: this.landingPageInfo.savingsAccountProductDescription,
				liveBetterSavings: this.landingPageInfo.liveBetterBankingProductDescription,
				savingsPlan: this.landingPageInfo.savingsPlanProductDescription,
				insure: this.landingPageInfo.insureProductDescription,
				credit: this.landingPageInfo.creditProductDescription
			};

			detail = {
				savingsAccount: this.landingPageInfo.savingsAccountProductAmount,
				liveBetterSavings: this.landingPageInfo.liveBetterBankingProductAmount,
				savingsPlan: this.landingPageInfo.savingsPlanProductAmount,
				insure: this.landingPageInfo.insureProductAmount,
				credit: this.landingPageInfo.creditProductAmount
			};
		}
		
		this.horizonStore.setCallerInformation(this.callerInformation);

		const state = {
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: subtitle ? subtitle : ``,
				detail: detail ? detail : ``
			}
		};

		this.horizonStore.saveState(state);
	}

	async _transactionHistory() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_TRANSACTION_HISTORY_SELECT, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY
		});

		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.landingPageInfo.accountNumber,
			accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
			startDate: TRANSACTION_HISTORY.START_DATE,
			endDate: TRANSACTION_HISTORY.END_DATE,
			startAtIndex: TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		const returnValue = await this.livBetterService.liveBetterTransactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			
			this.transactionHistory = returnValue.result.transactions;

			this.accountDetails = {
				"Account number": this.landingPageInfo.accountNumber,
				"Available balance": formatCurrency(this.landingPageInfo.accountAvailableBalance),
				"Interest": `${this.landingPageInfo.interestRatePercentage}%`,
				"Status": this.landingPageInfo.accountStatus
			};
			
			this.endCallContext = `TransactionHistory`;
			this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
		}

	}

	async _getStatements() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_STATEMENTS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_SATEMENTS
		});

		const clientProductDetails = await this._getClientProducts();
		
		if (clientProductDetails) {
			this.clientProducts = clientProductDetails;
			this.renderMode = RENDER_MODE.STATEMENTS;
		}
	}

	_automaticSavings() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_AUTOMATIC_SAVINGS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});

		this.renderMode = RENDER_MODE.AUTOMATIC_SAVINGS;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.live-better`);
		window.open(`${globalOneUrl}`);
	}

	async _getClientProducts() {
		const request = {
			cifNumber: this.callerInformation.cifNumber,
			status: `OPEN`
		};
		const returnValue = await this.quickTransactionService.getClientProducts(request);

		if (returnValue.succeeded) {
			return returnValue.result.savingsProducts;
		}
		return [];
	}
	
	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
        const newdate = new Date(Date.parse(date));
        return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
    }
	
	// Tooltip is displayed by hovering on description only when description field is too long and is partially hidden
	_displayTooltip(e) {

		if (e.target.scrollWidth > e.target.offsetWidth) {
			this.showTooltip = true;
		}
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`
			.liveBetter{
				width: 100%;
				height: var(--horizon-panel-height, 888px);
			}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderLandingPage()}
			${this._renderTransactionHistory()}
			${this._renderLinkedTransactionDetailsModal()}
			${this._renderAutomaticSavings()}
			${this._renderStatementsModal()}
		`;
	}

	_renderLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.VERIFY_NOW:
			case RENDER_MODE.AUTOMATIC_SAVINGS:
			case RENDER_MODE.STATEMENTS:
				return !this.loading 
					? html`
						${this._renderLiveBetterVerifiedLandingPage()}
						${this._renderLiveBetterUnverifiedLandingPage()}`
					: html``;
			case RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS:
				return this._renderAccountDetails();
			default:
				return html``;
		}
	}

	_renderLiveBetterVerifiedLandingPage() { 

		return this.verificationStatus === `verified` && this.landingPageInfo
			? html`
				<capitec-pc-live-better-savings
					class="liveBetter"
					.liveBetterAccountData = "${this.landingPageInfo}"
					@option-click = "${(e) => this._optionClick(e.detail.option)}"
					@account-details="${() => this._accountDetails()}"
					@round-up="${() => this._toggleRoundUp()}"
					@interest-sweep="${() => this._toggleInterestSweep()}">
				</capitec-pc-live-better-savings>`
			: html``;
		}

	_renderLiveBetterUnverifiedLandingPage() {
		return this.verificationStatus === `unverified`
			? html`
				<horizon-live-better-unverified-page
					class="liveBetter"
					@verify-now= "${() => this._verifyClick()}"
					@product-enquiry="${() => this._productEnquiry()}">
				</horizon-live-better-unverified-page>`
			: html``;
	}

	_renderAccountDetails() {
		return this.renderMode === RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS 
			? html`
				<capitec-pc-live-better-account-details
					.accountDetails = "${this.landingPageInfo}"
					@back= "${() => this._backToLBBLandingScreen()}">
				</capitec-pc-live-better-account-details>`
			: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY || this.renderMode === RENDER_MODE.LINKED_TRANSACTION_DETAILS
			? html`
				<horizon-transaction-history
					.transactionHistoryList="${this.transactionHistory}"
					.accountDetails="${this.accountDetails}"
					cifNumber="${this.callerInformation.cifNumber}"
					type="${ACCOUNT_TYPES.LBB}"

					.renderTableColumns="${() => this._renderTransHistoryColumns()}"
					.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
					.getMoreTransactions="${request => this._getMoreTransactions(request)}"

					@error-handler = "${() => this._errorHandler()}"
					@back="${() => this._setIncidentDone()}">
				</horizon-transaction-history>`
			: html``;
	}

	_renderTransHistoryColumns() {
		return html`
			<capitec-table-column
				data-automation-id="transaction-history-transactionDate"
				label="Transaction Date"
				field="transactionDate"
				type="date"
				size="177px;">
			</capitec-table-column>
			<capitec-table-column
				data-automation-id="transaction-history-description"
				label="Description"
				?wrap="${true}"
				.renderer="${(item, Description, description) => this._renderDescriptionColumn(item, Description, description)}"
				field="description"
				size="347px;">
			</capitec-table-column>
			<capitec-table-column
				data-automation-id="transaction-history-fromAccount"
				label="From Account"
				field="fromAccount"
				size="196px;">
			</capitec-table-column>
			<capitec-table-column
				data-automation-id="transaction-history-amount"
				label="Amount(R)"
				field="formatedAmount"
				size="144px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				data-automation-id="transaction-history-balance"
				label="Balance"
				field="formatedBalance"
				size="158px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderDescriptionColumn(item, fieldName, fieldValue) {
		return html`
			<capitec-label 
				style="display: ${this.showTooltip ? `none` : `block`}; ${unsafeCSS(TABLE_EXPANDER_CELL.columnTooltip)}"
				label="${fieldValue}"
				@mouseover="${(e) => this._displayTooltip(e)}">
			</capitec-label>
			<capitec-tooltip 
				style="display: ${this.showTooltip ? `block` : `none`}; ${unsafeCSS(TABLE_EXPANDER_CELL.toolTip)}; text-align: left;"
				message="${fieldValue}" 
				@mouseout = "${() => this.showTooltip = false}"
				position="bottom">
			<capitec-label 
				style=" ${unsafeCSS(TABLE_EXPANDER_CELL.columnTooltip)}; display: block; width: 315px;" 
				label="${fieldValue}">
			</capitec-label>
			</capitec-tooltip>`;
	}

	_renderTransactionDetails(item) {

		// Updating "this.journalNumber" to trigger service call that gets "linkedTransactionDetails".
		this.journalNumber = item.journalNumber;
		this.linkedTransactionDetails = item.linkedTransactionDetails;

		return this.linkedTransactionDetails ? html`
		<capitec-content-box style="height: auto;">
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Transaction details"
				data-automation-id="transaction-history-item-header">
			</capitec-label>
	
			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Transaction type"
					value = "${item.transactionType ? item.transactionType : `-`}"
					data-automation-id="transaction-history-item-type">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Amount"
					value = "${item.formatedAmount}"
					data-automation-id="transaction-history-item-amount">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="To account" 
					value = "${item.toAccount}"
					data-automation-id="transaction-history-item-to-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date"
					value = "${this._formatDate(item.postingDate)}"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-group 
					data-automation-id="transaction-history-item-description"
					class="toggle-group" 
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)}"
					layout="vertical" 
					gap="none" 
					halign="left" 
					valign="center">
						<capitec-label 
							style="${unsafeCSS(TABLE_EXPANDER_CELL.labelText)}" 
							label="Description">
						</capitec-label>
						<capitec-label 
							style="display: ${this.showTooltip ? `none` : `block`}; ${unsafeCSS(TABLE_EXPANDER_CELL.labelValue)}"
							id="desc-label"
							label="${item.statementDescription ? item.statementDescription : `-`}"
							@mouseover="${(e) => this._displayTooltip(e)}">
						</capitec-label>
						<capitec-tooltip 
							data-automation-id="transaction-history-item-description-tooltip"
							style="display: ${this.showTooltip ? `block` : `none`}; ${unsafeCSS(TABLE_EXPANDER_CELL.toolTip)}"
							id="desc-tooltip-label"
							message="${item.statementDescription}" 
							@mouseout = "${() => this.showTooltip = false}"
							position="bottom">
							<capitec-label 
								style="${unsafeCSS(TABLE_EXPANDER_CELL.labelValue)} display: block;" 
								label="${item.statementDescription}">
							</capitec-label>
					</capitec-tooltip>
				</capitec-group>
				
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)} width: auto;" 
					label="Long Description"
					value = "${item.originalDescription ? item.originalDescription : `-`}"
					data-automation-id="transaction-history-item-long-description">
				</horizon-label>
			</capitec-group>
			
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()} ${unsafeCSS(LINKED_TRANSACTION.heading).toString()}"
				label="${this.linkedTransactionDetails.length} linked transactions (Round-up: R${this.landingPageInfo.roundupValue})"
				data-automation-id="transaction-history-item-linked-transactions-header">
			</capitec-label>

			<capitec-content-box style="${unsafeCSS(LINKED_TRANSACTION.contentBox).toString()}" layout="vertical" gap="clear" halign="left" valign="top">
				${this.linkedTransactionDetails.map(transaction => this._renderLinkedTransactionTile(transaction, item.formatedAmount))}
			</capitec-content-box>

		</capitec-content-box>
		` : html ``;
	}

	_renderLinkedTransactionTile(item, formatedAmount) {
		return html`
			<capitec-card 
				data-automation-id="transaction-history-linked-transation"
				?elevated="${true}" 
				class="row-selector"
				style="${unsafeCSS(LINKED_TRANSACTION.card).toString()}"
				@click="${() => this._linkedTransactionClick(item, formatedAmount)}">
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)} ${unsafeCSS(LINKED_TRANSACTION.description).toString()}" 
							label="Description"
							value = "${item.originalDescription}"
							data-automation-id="transaction-history-linked-transation-description"">
						</horizon-label>
						<div style="${unsafeCSS(LINKED_TRANSACTION.verticalLine).toString()}"></div>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
							label="Transaction Date"
							value = "${this._formatDate(item.transactionDate)}"
							data-automation-id="transaction-history-linked-transation-date"">
						</horizon-label>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
							label="Round-up amount" 
							value = "${formatCurrency(item.roundUpAmount)}"
							data-automation-id="transaction-history-linked-round-up-amount">
						</horizon-label>
					</capitec-group>
			</capitec-card>`;
	}
	
	_renderLinkedTransactionDetailsModal() {
		return this.renderMode === RENDER_MODE.LINKED_TRANSACTION_DETAILS ?
		 html`
			<horizon-linked-transaction-details
				.transactionDetails = "${this.selectedLinkedTransaction}"
				@on-close = "${() => this.renderMode = RENDER_MODE.TRANSACTION_HISTORY}">
			</horizon-linked-transaction-details>` 
			: html``;
	}

	_renderAutomaticSavings() {
		return this.renderMode === RENDER_MODE.AUTOMATIC_SAVINGS 
		? html`
			<horizon-manage-automatic-savings
				@cancel = "${() => this._backToLBBLandingScreen()}">
			</horizon-manage-automatic-savings>`
		: html``;
	}

	_renderStatementsModal() {
		return this.renderMode === RENDER_MODE.STATEMENTS 
			? html`
				<horizon-statements-dialog
					.callerInformation="${this.callerInformation}"
					.clientProducts="${this.clientProducts}"
					type="${ACCOUNT_TYPES.LBB}"
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-statements-dialog>`
			: html``;
	}
}

customElements.define(`horizon-live-better`, LiveBetter);