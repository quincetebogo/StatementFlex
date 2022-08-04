import { ACCOUNT_TYPES, LANDING_PAGE_NEEDS } from 'app/constants/Common';
import { EXPANDER_LABEL, LINKED_TRANSACTION, TABLE_EXPANDER_CELL } from 'app/css/Lbb-TransactionHistory';
import { LiveBetterEvents, STATEMENT_EVENTS, TRANSACTION_ENQUIRY_EVENTS } from 'app/constants/telemetry/events/LiveBetter';
import { css, html, unsafeCSS } from 'platform/elements';
import { ACCOUNT_INTCAT_ENUM } from 'app/constants/Statements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { LiveBetterService } from 'app/services/LiveBetterService';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { SavingsAccountService } from 'app/services/SavingsAccountService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { Utilities } from 'platform/Utilities';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getMonthName } from 'app/utils/channelServiceUtilities';


import 'app/productControls/liveBetterSavingsAccount/src/LiveBetterSavings';
import 'app/productControls/liveBetterSavingsAccount/src/AccountDetails';

import 'app/components/common/TransactionHistory';
import 'app/components/liveBetter/LiveBetterUnverifiedPage';
import 'app/components/dialogs/liveBetter/ManageAutomaticSavings';
import 'app/components/dialogs/common/StatementsDialog';
import 'app/components/dialogs/liveBetter/LBBTransactionDetails';

const TRANSACTION_HISTORY = {
	ACCOUNT_TYPE: `LBB`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(Date.now() - 7776000000).toISOString().substr(0, 10), // 7776000000 is 90 days in milliseconds
	START_AT_INDEX: 0,
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
};

const LBB = 210;
// Tran codes which has aggregated details for transaction
const TRAN_CODES = [6447, 6448];

/**
 * Live Better View
 *
 * Events Raised
 * -------------
 * -
 * 
 * @export
 * @class LiveBetter
 * @extends {SavingsAccountBase}
 */
export class LiveBetter extends SavingsAccountBase {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.updateAutomaticSavings = false;
	
		// private properites
		this.loading = true;
		this.executed = false;
		this.showTooltip = false;
		this.journalNumber = `00000`;
		this.transactionHistory = [];
		this.automaticSavingsDetails = {};
		
		this.liveBetterService = new LiveBetterService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.savingsAccountService = new SavingsAccountService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.quickTransactionService = new QuickTransactionsService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

		this.returnToScreen = this.eventAggregator.subscribe(`horizon-return-to-screen`, (e) => this._optionClick(e.option));
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
		
		this._optionClick = async (option) => {

			const accountDetails = () => this._accountDetails();
			const transactionHistory = () => this._transactionHistory();
			const statements = () => this._getStatements();
			const automaticSavings = () => this._automaticSavings();
			const productEnquiry = () => this._productEnquiry();
			const partnerBenefits = () => this._partnerBenefits();
	
			const actions = {
				'lbb-account-enquiry': accountDetails,
				'transaction-history-lbb': transactionHistory,
				'statements-lbb': statements,
				'automatic-savings-lbb': automaticSavings,
				'product-enquiry': productEnquiry,
				'partner-benefits': partnerBenefits
			};
	
			if (actions[option]) {
				await super._inicidentManager_(option, () => this._toggleBusyFlag());
				this._refreshIncidentDetails();
				return actions[option]();
			}
		};
	}

	disconnectedCallback() {
		this.returnToScreen.dispose();
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			loading: { state: true },
			showTooltip: { state: true },
			transactionHistory: { state: true },
			journalNumber: { state: true },
			updateAutomaticSavings: { state: true },
			landingPageInfo: { state: true }
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

	async _accountDetails() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ACCOUNT_NUMBER, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_ACCOUNT_DETAILS
		});

		await super.createAndClassifySubsIncident();
		this.renderMode = RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS;
	}

	async _toggleRoundUp(event) {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_ROUND_UP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});

		this._getAutomaticSavingsDetails();
		this.landingPageInfo.accountRoundUpActive = event.detail.roundUpStatus;
		this.automaticSavingsDetails.accountRoundUpActive = event.detail.roundUpStatus;
		this._deepCopyProperty();

		// To classify incident, setting need as automatic savings
		await this._optionClick(`automatic-savings-lbb`);
	}

	async _toggleInterestSweep(event) {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_INTEREST_SWEEP_TOGGLE, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});

		this._getAutomaticSavingsDetails();
		this.landingPageInfo.accountInterestSweepActive = event.detail.interestSweepStatus;
		this.automaticSavingsDetails.accountInterestSweepActive = event.detail.interestSweepStatus;
		this._deepCopyProperty();

		// To classify incident, setting need as automatic savings
		await this._optionClick(`automatic-savings-lbb`);
	}

	async _backFromAutomaticSavings() {
		await this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_SELECT_CANCEL, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS,
			"next-screen": this.renderMode === RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS ? TelemetryScreen.LIVE_BETTER_ACCOUNT_DETAILS : TelemetryScreen.LIVE_BETTER
		});

		this._telemetry.endSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_POP, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS,
			"next-screen": this.renderMode === RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS ? TelemetryScreen.LIVE_BETTER_ACCOUNT_DETAILS : TelemetryScreen.LIVE_BETTER
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		this.landingPageInfo = screenDetails.LBSADetails;
		
		this._setIncidentNotstarted();
		this._deepCopyProperty();
		
		this.automaticSavingsDetails = {};
		this.updateAutomaticSavings = false;
	}

	_setIncidentDone() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	async _getMoreTransactions(request) {

		const result = await this.liveBetterService.liveBetterTransactionHistory(request, () => true);
		return result;
	}
	
	_linkedTransactionClick(transactionDetails, formatedAmount) {
		
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_VIEW_LINKED_TRANSACTIONS, {
			"screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY,
			"next-screen": TelemetryScreen.LIVE_BETTER_LINKED_TRANSACTIONS
		});

		this.selectedLinkedTransaction = transactionDetails;
		this.selectedLinkedTransaction.amount = formatedAmount;

		this.renderMode = RENDER_MODE.LINKED_TRANSACTION_DETAILS;
	}
	
	async _getLinkedransactionDetails(item) {

		let linkedTransactions = [];
		const transactionHistoryRequest = {
			"journalNumber": this.journalNumber, // "453858"// Details to work on DEV - for testing. 
			"accountNumber": this.landingPageInfo.accountNumber, // "1733256405"//
			"postingDate": item.postingDate // "2021-06-22"//
		};

		const returnValue = await this.liveBetterService.lbbLinkedTransactionDetails(transactionHistoryRequest);
		this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.TRANSACTION_HISTORY_INFO, {
			'journal-no': this.journalNumber
		});
			
		if (returnValue.succeeded && returnValue.result) {
			linkedTransactions = returnValue.result.linkedTransactions;
		}
		return linkedTransactions;
	}
	
	// Function that gets triggered on changing values for those set as properties ( eg: "journalNumber", "transactionHistory" ).
	async updated(changedProperties) {

		const journalNumber = Boolean(changedProperties.get(`journalNumber`));
	
		if (journalNumber) {
			const expandedItem = this.transactionHistory.find(item => item.journalNumber === this.journalNumber);
			expandedItem.linkedTransactionDetails = await this._getLinkedransactionDetails(expandedItem);
			this.requestUpdate();
		}
	}

	_errorHandler(exception) {
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	async _closeLinkedTransView() {
		await this._telemetry.logEvent(TRANSACTION_ENQUIRY_EVENTS.LINKED_TRANSACTIONS_DETAILS_CLOSE, {
			"screen": TelemetryScreen.LIVE_BETTER_LINKED_TRANSACTIONS,
			"next-screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY
		});
		await this._telemetry.endSpan(TRANSACTION_ENQUIRY_EVENTS.LINKED_TRANSACTIONS_DETAILS, {});

		this.renderMode = RENDER_MODE.TRANSACTION_HISTORY;
	}

	async _updateAutomaticSavings(updatedDetails) {

		const updateRequest = {
			"cifNumber": this.callerInformation.cifNumber,
			"accountRoundUpActive": updatedDetails?.accountRoundUpActive ?? this.automaticSavingsDetails.accountRoundUpActive,
			"roundupValue": updatedDetails?.roundUpValue ?? this.automaticSavingsDetails.roundupValue,
			"activateRoundUpAccounts": updatedDetails?.activatedRoundUpAccountNums ?? this.automaticSavingsDetails.activatedRoundUpAccountNums,
			"accountInterestSweepActive": updatedDetails?.accountInterestSweepActive ?? this.automaticSavingsDetails.accountInterestSweepActive
		};

		const returnValue = await this.liveBetterService.lbbUpdateRoundupDetails(updateRequest, () => true);
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `automatic-savings-lbb`);

		this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_SELECT_UPDATE, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS,
			"round-up": updatedDetails?.accountRoundUpActive ?? this.automaticSavingsDetails.accountRoundUpActive,
			"interest-sweep": updatedDetails?.accountInterestSweepActive ?? this.automaticSavingsDetails.accountInterestSweepActive,
			"roundup-value": updatedDetails?.roundUpValue ?? this.automaticSavingsDetails.roundupValue,
			"roundup-accounts": updatedDetails?.activatedRoundUpAccountNums ?? this.automaticSavingsDetails.activatedRoundUpAccountNums,
			"next-screen": returnValue.succeeded ? TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS : TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS_FAILURE
		});

		
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.updatedLBSADetails = updatedDetails;
		this.horizonStore.setScreenDetails(screenDetails);
	
		if (returnValue.succeeded) {
			this.horizonRouter.navigateToAutomaticSavingsSuccess();
		} else {
			this.horizonRouter.navigateToAutomaticSavingsFailure();
		}
	}

	_toggleRoundUpTelemetry() {
		this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_TOGGLE_ROUNDUP, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_toggleInterestSweepTelemetry() {
		this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_TOGGLE_INTEREST_SWEEP, {
			"screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
	}

	_unloadTransactionHistory() {
		this.endCallContext = `LandingPage`;
		this.transactionHistory = [];
		this._setIncidentDone();
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
					"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
					"liveBetter": true
				});

			// Live better landing page service call should come here - Data is mocked as below temporarily
				this.landingPageInfo = returnValue.result;
				this._updateLeftBar();

				await super._inicidentManager_(LANDING_PAGE_NEEDS.LBB, () => this._toggleBusyFlag());
				await super.createAndClassifySubsIncident(null, false);

			} else if (returnValue.succeeded) {

				// Navigate to Live better non-client page if a client is not registered with Live better account
				this.horizonRouter.navigateToProductInfo(`LiveBetter`);
			}
			
		}
		
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.endCallContext = `LandingPage`;
		this.loading = false;
		this._performReturnToScreen();
	}

	_updateLeftBar() {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.LBSADetails = this.landingPageInfo;
		this.horizonStore.setScreenDetails(screenDetails);

		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	async _transactionHistory() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_TRANSACTION_HISTORY_SELECT, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_TRANSACTION_HISTORY
		});

		await super.createAndClassifySubsIncident();
		await this._getTransactionHistory();
	}

	async _getTransactionHistory(startDate, endDate, startAtIndex) {
		const transactionHistoryRequest = {
			cifNumber: this.callerInformation.cifNumber,
			accountNumber: this.landingPageInfo.accountNumber,
			accountType: TRANSACTION_HISTORY.ACCOUNT_TYPE,
			startDate: startDate || TRANSACTION_HISTORY.START_DATE,
			endDate: endDate || TRANSACTION_HISTORY.END_DATE,
			startAtIndex: startAtIndex || TRANSACTION_HISTORY.START_AT_INDEX,
			maxResults: TRANSACTION_HISTORY.MAX_RESULTS,
			moneyType: TRANSACTION_HISTORY.MONEY_TYPE
		};

		const returnValue = await this.liveBetterService.liveBetterTransactionHistory(transactionHistoryRequest);

		if (returnValue.succeeded && returnValue.result) {
			const formattedTrans = returnValue.result.transactions
									.map((item) => {
										const date = new Date(Date.parse(item.transactionDate));
							
										item.tranDate = date;
										item.groupByItem = `${getMonthName(date.getMonth())} ${date.getFullYear()}`;
										item.formatedAmount = formatCurrency(item.amount);
										item.formatedBalance = formatCurrency(item.balance);
										item.description = item.statementDescription;
										item.getBreakdownDetails = TRAN_CODES.includes(item.transactionCode);
							
										return item;
									});
			this.transactionHistory.push(...formattedTrans);
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

	_getStatements() {
		this._telemetry.logEvent(LiveBetterEvents.LIVE_BETTER_STATEMENTS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_SATEMENTS
		});

		const productInfo = ACCOUNT_INTCAT_ENUM[LBB];
		this.clientProducts = [
			{
				'accountNumber': this.landingPageInfo.accountNumber,
				'accountName': productInfo.name,
				'accountType': LBB,
				'accountOpenDate': this.landingPageInfo.dateOpened,
				'name': productInfo.name,
				'type': productInfo.type,
				'category': productInfo.category,
				'subCategory': productInfo.subCategory,
				'icon': productInfo.icon,
				'customIcon': productInfo.customIcon,
				'order': productInfo.order,
				'choosePeriod': productInfo.choosePeriod
			}
		];
		this.renderMode = RENDER_MODE.STATEMENTS;
	}

	async _automaticSavings() {
		await this._telemetry.logEvent(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS, {
			"screen": TelemetryScreen.LIVE_BETTER_LANDING_PAGE,
			"next-screen": TelemetryScreen.LIVE_BETTER_AUTOMATIC_SAVINGS
		});
		this._telemetry.startSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS);
		this._telemetry.startSpan(LiveBetterEvents.LBB_AUTOMATIC_SAVINGS_POP);

		this._getAutomaticSavingsDetails();
		this.updateAutomaticSavings = true;
	}

	async _productEnquiry() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.live-better`);
		window.open(`${globalOneUrl}`);
	}

	async _partnerBenefits() {
		const globalOneUrl = await this.configuration.getSetting(`otherSystemsURL.partner-benefits`);
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
	
	// Tooltip is displayed by hovering on description only when description field is too long and is partially hidden
	_displayTooltip(e) {

		if (e.target.scrollWidth > e.target.offsetWidth) {
			this.showTooltip = true;
		}
	}

	_cancelStatements() {
		this._telemetry.endSpan(STATEMENT_EVENTS.STATEMENTS);
		super._backToLandingPage();
	}

	_getAutomaticSavingsDetails() {

		if (Boolean(Object.keys(this.automaticSavingsDetails).length)) {
			return true;
		}

		this.automaticSavingsDetails = {
			"accountRoundUpActive": this.landingPageInfo.accountRoundUpActive,
			"roundupValue": this.landingPageInfo.roundupValue,
			"roundUpAccounts": this.landingPageInfo.roundUpAccounts,
			"activatedRoundUpAccounts": this.landingPageInfo.activatedRoundUpAccounts,
			"activatedRoundUpAccountNums": this.landingPageInfo.activatedRoundUpAccounts.map(item => item.accountNumber),
			"accountInterestSweepActive": this.landingPageInfo.accountInterestSweepActive,
			
			// Following properties are used to detect toggel change from lbb landing screen
			"actualRoundUpStatus": this.landingPageInfo.accountRoundUpActive,
			"actualInterestSweepStatus": this.landingPageInfo.accountInterestSweepActive
		};
	}

	_deepCopyProperty() {
		// Creates and returns a deep copy of an Object this.landingPageInfo which helps to render main screen.
		this.landingPageInfo = Utilities.deepCopy(this.landingPageInfo);
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
			${super._webTemplate(ACCOUNT_TYPES.LBB)}
			${this._renderLandingPage()}
			${this._renderTransactionHistory()}
			${this._renderLinkedTransactionDetailsModal()}
			${this._renderAutomaticSavings()}
		`;
	}

	_renderLandingPage() {
		switch (this.renderMode) {
			case RENDER_MODE.MAIN_PAGE:
			case RENDER_MODE.VERIFY_NOW:
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

		return this.verificationStatus === `verified` ||
			   this.updateAutomaticSavings
			? html`
				<capitec-pc-live-better-savings
					class="liveBetter"
					.liveBetterAccountData = "${this.landingPageInfo}"
					@option-click = "${(e) => this._optionClick(e.detail.option)}"
					@round-up="${(event) => this._toggleRoundUp(event)}"
					@interest-sweep="${(event) => this._toggleInterestSweep(event)}">
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
		return this.renderMode === RENDER_MODE.LIVE_BETTER_ACCOUNT_DETAILS ||
			   this.updateAutomaticSavings
			? html`
				<capitec-pc-live-better-account-details
					.accountDetails = "${this.landingPageInfo}"
					@back="${() => this._setIncidentDone()}"
					@unloading="${() => this._setIncidentDone()}"
					@round-up="${(event) => this._toggleRoundUp(event)}"
					@interest-sweep="${(event) => this._toggleInterestSweep(event)}">
				</capitec-pc-live-better-account-details>`
			: html``;
	}

	_renderTransactionHistory() {
		return this.renderMode === RENDER_MODE.TRANSACTION_HISTORY || this.renderMode === RENDER_MODE.LINKED_TRANSACTION_DETAILS
			? html`
				<horizon-transaction-history
					.transactionHistory="${this.transactionHistory}"
					.accountDetails="${this.accountDetails}"
					type="${ACCOUNT_TYPES.LBB}"

					.renderTableColumns="${() => this._renderTransHistoryColumns()}"
					.renderTransactionDetails="${(item) => this._renderTransactionDetails(item)}"
					.getTransactionHistory="${(startDate, endDate, startAtIndex) => this._getTransactionHistory(startDate, endDate, startAtIndex)}"
					.disposeData="${() => this.transactionHistory = []}"

					@error-handler = "${() => this._errorHandler()}"
					@back="${() => this._setIncidentDone()}"
					@unloading="${() => this._unloadTransactionHistory()}">
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
				style="display: ${this.showTooltip ? `none` : `block`}; ${unsafeCSS(TABLE_EXPANDER_CELL.columnTooltip).toString()}"
				label="${fieldValue}"
				@mouseover="${(e) => this._displayTooltip(e)}">
			</capitec-label>
			<capitec-tooltip 
				style="display: ${this.showTooltip ? `block` : `none`}; ${unsafeCSS(TABLE_EXPANDER_CELL.toolTip).toString()}; text-align: left;"
				message="${fieldValue}" 
				@mouseout = "${() => this.showTooltip = false}"
				position="bottom">
			<capitec-label 
				style=" ${unsafeCSS(TABLE_EXPANDER_CELL.columnTooltip).toString()}; display: block; width: 315px;" 
				label="${fieldValue}">
			</capitec-label>
			</capitec-tooltip>`;
	}

	_renderTransactionDetails(item) {
		return html`
			<capitec-content-box style="height: auto;">
				<capitec-label
					style = "${unsafeCSS(EXPANDER_LABEL).toString()}"
					label="Transaction details"
					data-automation-id="transaction-history-item-header">
				</capitec-label>
		
				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
						label="Transaction type"
						value = "${item.transactionType ? item.transactionType : `-`}"
						data-automation-id="transaction-history-item-type">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
						label="Amount"
						value = "${item.formatedAmount}"
						data-automation-id="transaction-history-item-amount">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
						label="To account" 
						value = "${item.toAccount}"
						data-automation-id="transaction-history-item-to-account">
					</horizon-label>
					<horizon-label
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
						label="Posting date"
						value = "${this._formatDate(item.postingDate)}"
						data-automation-id="transaction-history-item-posting-date">
					</horizon-label>
				</capitec-group>

				<capitec-group layout="horizontal" gap="clear" halign="left" valign="center">
					<capitec-group 
						data-automation-id="transaction-history-item-description"
						class="toggle-group" 
						style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn).toString()}"
						layout="vertical" 
						gap="none" 
						halign="left" 
						valign="center">
							<capitec-label 
								style="${unsafeCSS(TABLE_EXPANDER_CELL.labelText).toString()}" 
								label="Description">
							</capitec-label>
							<capitec-label 
								style="display: ${this.showTooltip ? `none` : `block`}; ${unsafeCSS(TABLE_EXPANDER_CELL.labelValue).toString()}"
								id="desc-label"
								label="${item.statementDescription ? item.statementDescription : `-`}"
								@mouseover="${(e) => this._displayTooltip(e)}">
							</capitec-label>
							<capitec-tooltip 
								data-automation-id="transaction-history-item-description-tooltip"
								style="display: ${this.showTooltip ? `block` : `none`}; ${unsafeCSS(TABLE_EXPANDER_CELL.toolTip).toString()}"
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
						style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns)} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()} width: auto;" 
						label="Long Description"
						value = "${item.originalDescription ? item.originalDescription : `-`}"
						data-automation-id="transaction-history-item-long-description">
					</horizon-label>
				</capitec-group>

				${item.getBreakdownDetails
					? html`${this._renderBreakdown(item)}`
					: html``
				}
			</capitec-content-box>`;
	}

	_renderBreakdown(item) {
		// Updating "this.journalNumber" to trigger service call that gets "linkedTransactionDetails".
		this.journalNumber = item.journalNumber;
		this.linkedTransactionDetails = item.linkedTransactionDetails;

		return this.linkedTransactionDetails
			? html`
				<capitec-label
					style = "${unsafeCSS(EXPANDER_LABEL).toString()} ${unsafeCSS(LINKED_TRANSACTION.heading).toString()}"
					label="${this.linkedTransactionDetails.length} linked transactions (Round-up: R${this.landingPageInfo.roundupValue})"
					data-automation-id="transaction-history-item-linked-transactions-header">
				</capitec-label>

				<capitec-content-box style="${unsafeCSS(LINKED_TRANSACTION.contentBox).toString()}" layout="vertical" gap="clear" halign="left" valign="top">
					${this.linkedTransactionDetails.map(transaction => this._renderLinkedTransactionTile(transaction, item.formatedAmount))}
				</capitec-content-box>`
			: html``;
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
							style="${unsafeCSS(TABLE_EXPANDER_CELL.firstcolumn).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()} ${unsafeCSS(LINKED_TRANSACTION.description).toString()}" 
							label="Description"
							value = "${item.originalDescription}"
							data-automation-id="transaction-history-linked-transation-description"">
						</horizon-label>
						<div style="${unsafeCSS(LINKED_TRANSACTION.verticalLine).toString()}"></div>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
							label="Transaction Date"
							value = "${this._formatDate(item.transactionDate)}"
							data-automation-id="transaction-history-linked-transation-date"">
						</horizon-label>
						<horizon-label
							style="${unsafeCSS(TABLE_EXPANDER_CELL.expanderColumns).toString()} ${unsafeCSS(TABLE_EXPANDER_CELL.expanderCell).toString()}" 
							label="Round-up amount" 
							value = "${formatCurrency(item.roundUpAmount)}"
							data-automation-id="transaction-history-linked-round-up-amount">
						</horizon-label>
					</capitec-group>
			</capitec-card>`;
	}
	
	_renderLinkedTransactionDetailsModal() {
		return this.renderMode === RENDER_MODE.LINKED_TRANSACTION_DETAILS
			? html`
				<horizon-linked-transaction-details
					.transactionDetails = "${this.selectedLinkedTransaction}"
					@on-loading="${() => this._telemetry.startSpan(TRANSACTION_ENQUIRY_EVENTS.LINKED_TRANSACTIONS_DETAILS, {})}"
					@on-close = "${() => this._closeLinkedTransView()}">
				</horizon-linked-transaction-details>` 
			: html``;
	}

	_renderAutomaticSavings() {
		return this.updateAutomaticSavings 
			? html`
				<horizon-manage-automatic-savings
					.automaticSavingsDetails = "${this.automaticSavingsDetails}"

					@round-up = "${() => this._toggleRoundUpTelemetry()}"
					@interest-sweep = "${() => this._toggleInterestSweepTelemetry()}"
					@cancel = "${() => this._backFromAutomaticSavings()}"
					@update = "${(e) => this._updateAutomaticSavings(e.detail.updatedDetails)}">
				</horizon-manage-automatic-savings>`
			: html``;
	}
}

customElements.define(`horizon-live-better`, LiveBetter);