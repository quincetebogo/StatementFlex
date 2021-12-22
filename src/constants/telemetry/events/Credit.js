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
	CREDIT_SETTLE_CLOSE_SELECT: `call.fulfill-need.credit.select.settle-and-close`

};