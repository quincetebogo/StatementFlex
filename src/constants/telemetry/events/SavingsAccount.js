/**
 * The event names to use when logging savings account landing page telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SavingsAccLandingPage
 */
 export const SavingsAccLandingPage = {
	SAVINGS_ACCOUNT: `call.fulfill-need.savings-account`,

	// Savings account events
	SAVINGS_ACC_TRANSACTION_HISTORY: `call.fulfill-need.savings-account.select.transaction-history`,
	SAVINGS_ACC_STATEMENTS: `call.fulfill-need.savings-account.select.statements`,
	SAVINGS_ACC_DEBI_CHECK: `call.fulfill-need.savings-account.select.debi-check`,
	SAVINGS_ACC_PRODUCT_ENQUIRY: `call.fulfill-need.savings-account.select.product-enquiry`
};

/**
 * The event names to use when logging telemetry events for statements flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} STATEMENT_EVENTS
 */
 export const STATEMENT_EVENTS = Object.freeze({
	STATEMENTS: `call.fulfill-need.savings-account.statements`,
	STATEMENTS_POP: `call.fulfill-need.savings-account.statements.pop-up`,
	STATEMENTS_CANCEL: `call.fulfill-need.savings-account.statements.pop-up.cancel`,
	
	STATEMENTS_PERIOD_NEXT: `call.fulfill-need.savings-account.statements.pop-up.choose-period.next`,
	STATEMENTS_BACK: `call.fulfill-need.savings-account.statements.pop-up.back`,
	STATEMENTS_SEND: `call.fulfill-need.savings-account.statements.pop-up.send`,
	
	STATEMENTS_VIEW_PDF: `call.fulfill-need.savings-account.statements.pop-up.view-document`,
	STATEMENTS_CLOSE_PDF: `call.fulfill-need.savings-account.statements.pop-up.close-document`,

	// Outcome screens
	STATEMENTS_SUCCESS: `call.fulfill-need.savings-account.statements.success`,
	STATEMENTS_SUCCESS_DONE: `call.fulfill-need.savings-account.statements.success.done`,
	STATEMENTS_SEND_ANOTHER: `call.fulfill-need.savings-account.statements.success.send-another`,

	STATEMENTS_FAILURE: `call.fulfill-need.savings-account.statements.failure`,
	STATEMENTS_FAILURE_DONE: `call.fulfill-need.savings-account.statements.failure.done`,
	STATEMENTS_FAILURE_ASSIGN: `call.fulfill-need.savings-account.statements.failure.assign`
});

/**
 * The event names to use when logging telemetry for transaction history flow from LBB.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} TRANSACTION_ENQUIRY_EVENTS
 */
 export const TRANSACTION_ENQUIRY_EVENTS = Object.freeze({
	TRANSACTION_HISTORY: `call.fulfill-need.savings-account.transaction-history`,
	TRANSACTION_HISTORY_FILTER: `call.fulfill-need.savings-account.transaction-history.filter`,
	TRANSACTION_HISTORY_CLEAR_ALL: `call.fulfill-need.savings-account.transaction-history.filter.clear-all`,
	TRANSACTION_HISTORY_CLEAR_FILTER: `call.fulfill-need.savings-account.transaction-history.filter.clear`,
	TRANSACTION_HISTORY_INFO: `call.fulfill-need.savings-account.transaction-history.view-info`,
	TRANSACTION_HISTORY_BACK: `call.fulfill-need.savings-account.transaction-history.back`,
	TRANSACTION_HISTORY_LOAD_MORE: `call.fulfill-need.savings-account.transaction-history.load-more`,
	TRANSACTION_HISTORY_SCROLL_TOP: `call.fulfill-need.savings-account.transaction-history.scroll-to-top`
 });