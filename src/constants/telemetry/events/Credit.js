/**
 * The event names to use when logging Credit telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} CreditEvents
 */
 export const CreditEvents = {

	CREDIT: `call.fulfill-need.credit`,
	CREDIT_VIEW_INFO: `call.fulfill-need.credit.view-info`,
	CREDIT_VERIFY_NOW: `call.fulfill-need.credit.verify-now`,
	CREDIT_FIND_A_BRANCH: `call.fulfill-need.credit.find-a-branch`,
	
	CREDIT_ACCOUNT_NUMBER_SELECT: `call.fulfill-need.credit.select.account-number`,
	CREDIT_ACCOUNT_DETAILS_CLOSE: `call.fulfill-need.credit.close.account-details`,
	CREDIT_TRANSACTION_HISTORY_SELECT: `call.fulfill-need.credit.select.transaction-history`,
	CREDIT_STATEMENTS_SELECT: `call.fulfill-need.credit.select.statements`,
	CREDIT_SETTLEMENT_QUOTE_SELECT: `call.fulfill-need.credit.select.settlement-quote`,
	CREDIT_SETTLE_CLOSE_SELECT: `call.fulfill-need.credit.select.settle-and-close`,

	CREDIT_STATEMENTS_VIEW_FEES: `call.fulfill-need.credit.statements.pop-up.view-fees`,
	CREDIT_STATEMENTS_NEXT: `call.fulfill-need.credit.statements.pop-up.next`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_PREVIOUS: `call.fulfill-need.credit.statements.pop-up.view.previous`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_NEXT: `call.fulfill-need.credit.statements.pop-up.view.next`
};

/**
 * The event names to use when logging telemetry events for statements flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} STATEMENT_EVENTS
 */
 export const STATEMENT_EVENTS = Object.freeze({
	STATEMENTS: `call.fulfill-need.credit.statements`,
	STATEMENTS_POP: `call.fulfill-need.credit.statements.pop-up`,
	STATEMENTS_CANCEL: `call.fulfill-need.credit.statements.pop-up.cancel`,
	
	STATEMENTS_PERIOD_NEXT: `call.fulfill-need.credit.statements.pop-up.choose-period.next`,
	STATEMENTS_BACK: `call.fulfill-need.credit.statements.pop-up.back`,
	STATEMENTS_SEND: `call.fulfill-need.credit.statements.pop-up.send`,
	
	STATEMENTS_VIEW_PDF: `call.fulfill-need.credit.statements.pop-up.view-document`,
	STATEMENTS_CLOSE_PDF: `call.fulfill-need.credit.statements.pop-up.close-document`,

	// Outcome screens
	STATEMENTS_SUCCESS: `call.fulfill-need.credit.statements.success`,
	STATEMENTS_SUCCESS_DONE: `call.fulfill-need.credit.statements.success.done`,
	STATEMENTS_SEND_ANOTHER: `call.fulfill-need.credit.statements.success.send-another`,

	STATEMENTS_FAILURE: `call.fulfill-need.credit.statements.failure`,
	STATEMENTS_FAILURE_DONE: `call.fulfill-need.credit.statements.failure.done`,
	STATEMENTS_FAILURE_ASSIGN: `call.fulfill-need.credit.statements.failure.assign`
});