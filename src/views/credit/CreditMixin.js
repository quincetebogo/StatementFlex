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

	_settlementQuoteDialog(selectedAccounts) {

		this._telemetry.startSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG, {});

		this.selectedAccountDetails = selectedAccounts;
		this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_DIALOG;
	},

	_sendSettlementQuote(details) {

		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `settlement-quote`);
	
		// TO DO: CS call to send Settlement Quote sould come here
		// "accountsEmailStatus" - Response from the CS call
		
		// const accountsEmailStatus = [
		// {
		// "accountNumber": `6001736552`,
		// "creditType": `CreditCard`,
		// "sentStatus": false
		// },
		// {
		// "accountNumber": `1633823409`,
		// "creditType": `AccessFacility`,
		// "sentStatus": false
		// },
		// {
		// "accountNumber": `1657155046`,
		// "creditType": `TermLoan`,
		// "sentStatus": true
		// }
		// ];
			
		const formatedResponse = accountsEmailStatus.map(item => {
			const itemDetails = details.selectedAccounts.find(account => account.accountNumber === item.accountNumber);
			item.productTypeDescription = itemDetails.productTypeDescription;

			return item;
		});

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.selectedAccounts = details.selectedAccounts.length === 1 ? details.selectedAccounts[0] : details.selectedAccounts.filter(item => !isNullorEmpty(item));
		screenDetails.emailAddress = details.emailAddress;
		screenDetails.emailStatus = formatedResponse;
		this.horizonStore.setScreenDetails(screenDetails);
		
		const failedAccounts = formatedResponse.filter(account => !account.sentStatus);
	
		if (failedAccounts.length === formatedResponse.length) {
			this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_SEND, {
				"screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG,
				"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_FAILURE,
				"email-address": details.emailAddress
			});
			this.horizonRouter.navigateToSettlementQuoteFailure();
		} else if (failedAccounts.length > 0) {
			this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_SEND, {
				"screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG,
				"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_PARTIAL_SUCCESS,
				"email-address": details.emailAddress
			});
			this.horizonRouter.navigateToSettlementQuoteOutcome();
		} else {
			this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_SEND, {
				"screen": TelemetryScreen.SETTLEMENT_QUOTE_DIALOG,
				"next-screen": TelemetryScreen.SETTLEMENT_QUOTE_SUCCESS,
				"email-address": details.emailAddress
			});
			this.horizonRouter.navigateToSettlementQuoteSuccess();
		}
		
		this._telemetry.endSpan(this.settlementQuoteEvents.SETTLEMENT_QUOTE_DIALOG);
	},

	async _navigatePDF(currPage) {
		// add CS call to get encodedPDF 
		// currPage is date currently selected
		const returnValue = await this.quickTransactionService.viewStatement(currPage, () => this._createIncidentOnError());
		if (returnValue) {
			return returnValue.result.statementData;
		}
	},

	_viewDocumentTelemetry(e) {
		const callerInformation = this.horizonStore.getCallerInformation();

		this._telemetry.logEvent(this.settlementQuoteEvents.SETTLEMENT_QUOTE_VIEW_DOCUMENT, {
			"cifNumber": callerInformation.cifNumber,
			"accountNumber": e.detail.accountNumber,
			"accountType": e.detail.accountType
		});
	},

	_renderSettlementQuoteDialog() {
		return this.renderMode === RENDER_MODE.SETTLEMENT_QUOTE_DIALOG 
		? html`
			<horizon-settlement-quote-dialog
				.selectedAccounts="${this.selectedAccountDetails}"
				@cancel="${() => this._backFromSettlementQuoteDialog()}"
				@send="${(e) => this._sendSettlementQuote(e.detail)}"
				@view-pdf="${(e) => this._viewDocumentTelemetry(e)}"
				.navigatePDF="${(currPage) => this._navigatePDF(currPage)}">
			</horizon-settlement-quote-dialog>`
		: html``;
	}
	
};