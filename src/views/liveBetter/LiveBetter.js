import { EXPANDER_LABEL, LINKED_TRANSACTION, TABLE_EXPANDER_CELL } from 'app/css/Lbb-TransactionHistory';
import { css, html, unsafeCSS } from 'platform/elements';
import { ACCOUNT_TYPES } from 'app/constants/TransactionHistory';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { LiveBetterEvents } from 'app/constants/telemetry/events/LiveBetter';
import { LiveBetterService } from 'app/services/LiveBetterService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';


import 'app/productControls/liveBetterSavingsAccount/src/LiveBetterSavings';
import 'app/productControls/liveBetterSavingsAccount/src/AccountDetails';

import 'app/components/common/TransactionHistory';
import 'app/components/liveBetter/LiveBetterUnverifiedPage';
import 'app/components/dialogs/liveBetter/ManageAutomaticSavings';
import 'app/components/dialogs/common/StatementsDialog';

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	// 7776000000 is 90 days in milliseconds
	START_DATE: new Date(Date.now() - 7776000000).toISOString().substr(0, 10),
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
		
		this.liveBetterService = new LiveBetterService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		
		// temporary use to load transaction history screen
		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
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
			loading: { state: true }
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

		// To Do: Temporarily using savings account's Transaction History service call to get the list of transaction.
		// should be replaced with Transaction History channel service call made for Live Better
		const result = await this.savingsAccountService.transactionHistory(request, () => true);
		return result;
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

			const returnValue = await this.liveBetterService.liveBetterLanding(clientDetails);

			if (returnValue.succeeded && returnValue.result) {
			
				// Navigate to Live better verified landing page if a client has Live better account 
				this._telemetry.startSpan(LiveBetterEvents.LIVE_BETTER, {
					"screen": TelemetryScreen.LIVE_BETTER,
					"liveBetter": true
				});

			// Live better landing page service call should come here - Data is mocked as below temporarily
				this.landingPageInfo = returnValue.result;
				this._updateLeftBar();

			} else if (returnValue.succeeded) {

				// Navigate to Live better non-client page if a client is not registered with Live better account
				this.horizonRouter.navigateToProductInfo(`LiveBetter`);
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
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_TRANSACTION_HISTORY, {
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

		// To Do: Temporarily using savings account's Transaction History service call to get the list of transaction.
		// should be replaced with Transaction History channel service call made for Live Better
		const returnValue = await this.savingsAccountService.transactionHistory(transactionHistoryRequest);

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
		this.logger.log(`error`, `Unable to retrieve client's products`, `_getClientProducts`, returnValue.correlationId);
		return [];
	}
	

	// Formating date in the form 'DD MMM YYYY'
	_formatDate(date) {
        const newdate = new Date(Date.parse(date));
        return `${newdate.getDate()} ${getMonthName(newdate.getMonth())} ${newdate.getFullYear()}`;
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
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY
			? html`
				<horizon-transaction-history
					.transactionHistory="${this.transactionHistory}"
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
				label="Transaction Date"
				field="transactionDate"
				type="date"
				size="177px;">
			</capitec-table-column>
			<capitec-table-column
				label="Description"
				field="description"
				size="354px;">
			</capitec-table-column>
			<capitec-table-column
				label="From Account"
				field="fromAccount"
				size="196px;">
			</capitec-table-column>
			<capitec-table-column
				label="Amount(R)"
				field="formatedAmount"
				size="144px;"
				type="currency">
			</capitec-table-column>
			<capitec-table-column
				label="Balance"
				field="formatedBalance"
				size="158px;"
				type="currency"
				align ="right">
			</capitec-table-column>
		`;
	}

	_renderTransactionDetails(item) {
	
		return html`
		<capitec-content-box style="height: auto;">
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
				label="Transaction details"
				data-automation-id="transaction-history-item-description">
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
					data-automation-id="transaction-history-item-transfer-account">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="To account" 
					value = "Live Better Savings"
					data-automation-id="transaction-history-item-posting-date">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Posting date"
					value = "${this._formatDate(item.postingDate)}"
					data-automation-id="transaction-history-item-processed-date">
				</horizon-label>
			</capitec-group>

			<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Description"
					value = "${item.description}"
					data-automation-id="transaction-history-item-code">
				</horizon-label>
				<horizon-label
					style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
					label="Long Description"
					value = "${item.description}"
					data-automation-id="transaction-history-item-card-number">
				</horizon-label>
			</capitec-group>
			
			<capitec-label
				style = "${unsafeCSS(EXPANDER_LABEL).toString()} ${unsafeCSS(LINKED_TRANSACTION.heading).toString()}"
				label="3 linked transactions (Round-up: R5)"
				data-automation-id="transaction-history-item-description">
			</capitec-label>

			<!-- TO DO: Should dynamically render the linked transactions tile based on number of linked transactions available -->
			${this._renderLinkedTransaction(item)}
			
			${this._renderLinkedTransaction(item)}
			
			${this._renderLinkedTransaction(item)}

		</capitec-content-box>
		`;
	}

	_renderLinkedTransaction(item) {
		return html`
			<capitec-card 
				?elevated="${true}" 
				class="row-selector" 
				style="${unsafeCSS(LINKED_TRANSACTION.card).toString()}">
					<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)} ${unsafeCSS(LINKED_TRANSACTION.description).toString()}" 
							label="Description"
							value = "${item.description}"
							data-automation-id="transaction-history-item-type">
						</horizon-label>
						<div style="${unsafeCSS(LINKED_TRANSACTION.verticalLine).toString()}"></div>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
							label="Transaction Date"
							value = "${this._formatDate(item.transactionDate)}"
							data-automation-id="transaction-history-item-transfer-account">
						</horizon-label>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell)}" 
							label="Round-up amount" 
							value = "R2.50"
							data-automation-id="transaction-history-item-posting-date">
						</horizon-label>
					</capitec-group>
			</capitec-card>`;
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
					.cifNumber="${this.callerInformation.cifNumber}"
					.clientProducts="${this.clientProducts}"
					type="${ACCOUNT_TYPES.LBB}"
					@cancel="${() => this.renderMode = RENDER_MODE.MAIN_PAGE}">
				</horizon-statements-dialog>`
			: html``;
	}
}

customElements.define(`horizon-live-better`, LiveBetter);