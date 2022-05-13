import { ACTION_IDENTIFIER, PERMISSION_STATUS, PRODUCTS } from 'app/constants/Credit';
import { RENDER_MODE } from 'app/views/common/RenderModes';
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

	_settlementQuoteDialog(selectedAccounts) {
		this.selectedAccountDetails = selectedAccounts;
		this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_DIALOG;
	},

	_sendSettlementQuote(details) {
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `settlement-quote`);
	
		// TO DO: CS call to send Settlement Quote sould come here
		// "accountsEmailStatus" - Response from the CS call  

		const formatedResponse = accountsEmailStatus.map(item => {
			const itemDetails = details.selectedAccounts.find(account => account.accountNumber === item.accountNumber);
			item.productTypeDescription = itemDetails.productTypeDescription;

			return item;
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.selectedAccounts = details.selectedAccounts.filter(item => !isNullorEmpty(item));
		screenDetails.emailAddress = details.emailAddress;
		screenDetails.emailStatus = formatedResponse;
		this.horizonStore.setScreenDetails(screenDetails);

		this.horizonRouter.navigateToSettlementQuoteOutcome();
	},

	async _navigatePDF(currPage) {
		// add CS call to get encodedPDF 
		// currPage is date currently selected
		const returnValue = await this.quickTransactionService.viewStatement(currPage, () => this._createIncidentOnError());
		if (returnValue) {
			return returnValue.result.statementData;
		}
	},

	_renderSettlementQuoteDialog() {
		return this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_DIALOG 
		? html`
			<horizon-settlement-quote-dialog
				.selectedAccounts="${this.selectedAccountDetails}"
				@cancel="${() => this._backFromSettlementQuoteDialog()}"
				@send="${(e) => this._sendSettlementQuote(e.detail)}"
				.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
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