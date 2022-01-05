/**
 * The event names to use when logging live better telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} LiveBetterEvents
 */
 export const LiveBetterEvents = {

	LIVE_BETTER: `call.fulfill-need.live-better-savings`,
	LIVE_BETTER_ACCOUNT_NUMBER: `call.fulfill-need.live-better-savings.select.account-number`,
	LIVE_BETTER_ROUND_UP_TOGGLE: `call.fulfill-need.live-better-savings.toggle.round-up`,
	LIVE_BETTER_INTEREST_SWEEP_TOGGLE: `call.fulfill-need.live-better-savings.toggle.interest-sweep`,
	LIVE_BETTER_TRANSACTION_HISTORY_SELECT: `call.fulfill-need.live-better-savings.select.transaction-history`,
	LIVE_BETTER_STATEMENTS: `call.fulfill-need.live-better-savings.select.statements`,
	LIVE_BETTER_AUTOMATIC_SAVINGS: `call.fulfill-need.live-better-savings.select.automatic-savings`,

	LBB_TRANSACTION_HISTORY: `call.fulfill-need.live-better-savings.transaction-history`,
	LBB_TRANSACTION_HISTORY_FILTER: `call.fulfill-need.live-better-savings.transaction-history.filter`,
	LBB_TRANSACTION_HISTORY_CLEAR_ALL: `call.fulfill-need.live-better-savings.transaction-history.filter.clear-all`,
	LBB_TRANSACTION_HISTORY_CLEAR_FILTER: `call.fulfill-need.live-better-savings.transaction-history.filter.clear`,
	LBB_TRANSACTION_HISTORY_INFO: `call.fulfill-need.live-better-savings.transaction-history.view-info`,
	LBB_TRANSACTION_HISTORY_VIEW_LINKED_TRANSACTIONS: `call.fulfill-need.live-better-savings.transaction-history.linked-transaction-view`,
	LBB_LINKED_TRANSACTIONS_DETAILS: `call.fulfill-need.live-better-savings.transaction-history.detailed-view`,
	LBB_LINKED_TRANSACTIONS_DETAILS_CLOSE: `call.fulfill-need.live-better-savings.transaction-history.detailed-view.close`,

	LIVE_BETTER_VIEW_BENEFITS: `call.fulfill-need.live-better-savings.view-benefits`
};

/**
 * The event names to use when logging telemetry events for statements flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} STATEMENT_EVENTS
 */
 export const STATEMENT_EVENTS = Object.freeze({
	STATEMENTS: `call.fulfill-need.live-better-savings.statements`,
	STATEMENTS_POP: `call.fulfill-need.live-better-savings.statements.pop-up`,
	STATEMENTS_CANCEL: `call.fulfill-need.live-better-savings.statements.pop-up.cancel`,
	
	STATEMENTS_PERIOD_NEXT: `call.fulfill-need.live-better-savings.statements.pop-up.choose-period.next`,
	STATEMENTS_BACK: `call.fulfill-need.live-better-savings.statements.pop-up.back`,
	STATEMENTS_SEND: `call.fulfill-need.live-better-savings.statements.pop-up.send`,
	
	STATEMENTS_VIEW_PDF: `call.fulfill-need.live-better-savings.statements.pop-up.view-document`,
	STATEMENTS_CLOSE_PDF: `call.fulfill-need.live-better-savings.statements.pop-up.close-document`,

	// Outcome screens
	STATEMENTS_SUCCESS: `call.fulfill-need.live-better-savings.statements.success`,
	STATEMENTS_SUCCESS_DONE: `call.fulfill-need.live-better-savings.statements.success.done`,
	STATEMENTS_SEND_ANOTHER: `call.fulfill-need.live-better-savings.statements.success.send-another`,

	STATEMENTS_FAILURE: `call.fulfill-need.live-better-savings.statements.failure`,
	STATEMENTS_FAILURE_DONE: `call.fulfill-need.live-better-savings.statements.failure.done`,
	STATEMENTS_FAILURE_ASSIGN: `call.fulfill-need.live-better-savings.statements.failure.assign`
});