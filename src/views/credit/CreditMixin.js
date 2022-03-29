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

	_settlementQuoteDialog(selectedAccounts) {
		this.selectedAccountDetails = selectedAccounts;
		this.renderMode = RENDER_MODE.SETTLEMENT_QUOTE_DIALOG;
	},

	_sendSettlementQuote(details) {
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `settlement-quote`);
	
		// TO DO: CS call to send Settlement Quote sould come here
		// Settlement Quote outcome screens to be modified as per CS outcome to handle multiple account selection
		const outcome = [
			{
				"accountNumber": `6001613698`,
				"creditType": `CreditCard`,
				"sentStatus": true
			},
			{
				"accountNumber": `1605515955`,
				"creditType": `TermLoan`,
				"sentStatus": true
			}
		];

		const settlementQuoteOutcomeDetails = {
			selectedAccounts: details.selectedAccounts.filter(item => !isNullorEmpty(item)),
			emailAddress: details.emailAddress,
			emailStatus: outcome
		};

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.settlementQuoteOutcomeDetails = settlementQuoteOutcomeDetails;
		this.horizonStore.setScreenDetails(screenDetails);

		this.horizonRouter.navigateToSettlementQuoteSuccess();
		// this.horizonRouter.navigateToSettlementQuoteFailure();
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
	}
	
};