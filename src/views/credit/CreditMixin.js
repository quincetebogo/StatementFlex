import { ACTION_IDENTIFIER, PERMISSION_STATUS, PRODUCTS } from 'app/constants/Credit';
import { ACCOUNT_TYPES } from 'app/constants/Common';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

/**
 * This mixin allows common credit products (settlement quote and Paid up letter) code to be mixed into different views.
 * This mixin provides the code that is common between Favourites and CreditAccount views for settlement quote.
 * Event handlers are provided here.
 * 
 *   this.navigationContext
 * 
 *   this.horizonStore
 *   this.horizonRouter
 * 
*    this.quickTransactionService

 *   this.renderMode 
 *   this.selectedAccountDetails
 */

export const creditMixin = {

	/**
	 * This function gets the credit permission for the option selected
	 * 
	 * @param {option} option need (statement/ transaction-history/ paid-up)
	 * @param {*} accNum - account number of selected product
	 * @param {*} productType - credit product type
	 * @returns {boolean} True - has CCS status, False - No CCS status
	 */

	async _checkCreditPermisions(option, cifNumber, accNum, productType) {

		const credProducts = {
			[PRODUCTS.CREDIT_CARD]: `CreditCard`,
			[PRODUCTS.ACCESS_FACILITY]: `AccessFacility`,
			[PRODUCTS.TERM_LOAN]: `Loan`
		};
		const returnValue = await this.creditService.permissions(cifNumber, accNum, credProducts[productType]);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get credit permissions.`, `_getCreditPermisions`, returnValue.correlationId);
		}

		const permission = returnValue.result.permissionsResultsList.find(item => item.operationIdentifier === ACTION_IDENTIFIER[option]);
		return permission?.permissionResult === PERMISSION_STATUS.DENIED;
	},

	async _settlementQuoteDialog(selectedAccounts) {

		await this._telemetry.startSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG, {});

		this.selectedAccountDetails = selectedAccounts;

		// This is to get the case-id for the client, without case-id we cannot send a settlement quote
		const [first] = this.selectedAccountDetails;
		await this._viewSettlementQuote(first);

		this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_DIALOG;
	},

	async _sendSettlementQuote(details) {
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `settlement-quote`);

		const accountsList = details.selectedAccounts.map(item => {
			const account = { 
								'accountNumber': item.accountNumber,
								'creditType': item.type.replace(` `, ``)
							};
			return account;
		});

		const request = {
			"cifNumber": this.callerInformation.cifNumber,
			"caseId": this.caseId || ``,
			"emailAddress": details.emailAddress,
			"accountList": accountsList
		};

		const returnValue = await this.creditService.sendSettlementQuoteEmail(request, () => true);

		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.selectedAccounts = details.selectedAccounts.filter(item => !isNullorEmpty(item));
		screenDetails.emailAddress = details.emailAddress;
		
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to send settlement quote.`, `_sendSettlementQuote`, returnValue.correlationId);

			this.horizonStore.setScreenDetails(screenDetails);
			this.horizonRouter.navigateToSettlementQuoteFailure();
			return;
		}

		// Formatting data before navigating to outcome screen
		const accountsEmailStatus = returnValue.result.sendStatusList;
		const formatedResponse = accountsEmailStatus.map(item => {
			const itemDetails = details.selectedAccounts.find(account => account.accountNumber === item.accountNumber);
			item.productTypeDescription = itemDetails.productTypeDescription;

			return item;
		});

		screenDetails.emailStatus = formatedResponse;
		this.horizonStore.setScreenDetails(screenDetails);

		switch (true) {
			case returnValue.result?.sendStatusList.every(item => item.sentStatus): // If all success
				this.horizonRouter.navigateToSettlementQuoteSuccess();
				break;

				case returnValue.result?.sendStatusList.every(item => !item.sentStatus): // If all failure
				this.horizonRouter.navigateToSettlementQuoteFailure();
				break;

			default: // Partially success
				this.horizonRouter.navigateToSettlementQuoteOutcome();
				break;
		}
	},

	async _viewSettlementQuote(item) {

		await this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_VIEW_DOCUMENT, {
			"cifNumber": this.callerInformation.cifNumber,
			"accountNumber": item.accountNumber,
			"accountType": item.productTypeDescription
		});

		const request = {
			"creditType": item.type.replace(` `, ``),
			"accountNumber": item.accountNumber,
			"cifNumber": this.callerInformation.cifNumber,
			"caseBranchNumber": 0,
			"idNumber": this.callerInformation.southAfricanIDNumber,
			"firstName": this.callerInformation.firstName,
			"surname": this.callerInformation.lastName,
			"caseId": ``
		};

		const returnValue = await this.creditService.settlementQuote(request);

		if (returnValue.succeeded) {
			this.caseId = returnValue.result.caseId;
			return returnValue.result.data;
		}
	},

	async _cancelSettlementQuoteDialog() {
		await this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_CANCEL, {
			"screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._exitSettlementQuoteDialog(); // This is implemented in corresponding parent class
	},

	_renderSettlementQuoteDialog() {
		return this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_DIALOG 
		? html`
			<horizon-settlement-quote-dialog
				.selectedAccounts="${this.selectedAccountDetails}"
				.viewSettlementQuote="${(item) => this._viewSettlementQuote(item)}"
				@on-unloading="${() => this._telemetry.endSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG, {})}"
				@cancel="${() => this._cancelSettlementQuoteDialog()}"
				@send="${(e) => this._sendSettlementQuote(e.detail)}">
			</horizon-settlement-quote-dialog>`
		: html``;
	},

	_renderCcsModal() {
		return this.ccsStatus
		? html`
			<horizon-ccs-status-dialog
				@on-okay="${() => this.ccsStatus = false}">
			</horizon-ccs-status-dialog>`
		: html``;
	}
	
};