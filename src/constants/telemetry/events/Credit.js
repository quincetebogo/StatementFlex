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

	CREDIT_STATEMENTS: `call.fulfill-need.credit.statements`,
	CREDIT_STATEMENTS_DIALOG: `call.fulfill-need.credit.statements.pop-up`,
	CREDIT_STATEMENTS_CANCEL: `call.fulfill-need.credit.statements.pop-up.cancel`,
	CREDIT_STATEMENTS_VIEW_FEES: `call.fulfill-need.credit.statements.pop-up.view-fees`,
	CREDIT_STATEMENTS_NEXT: `call.fulfill-need.credit.statements.pop-up.next`,
	CREDIT_STATEMENTS_VIEW_DOCUMENTS: `call.fulfill-need.credit.statements.pop-up.view-document`,
	CREDIT_STATEMENTS_CLOSE_DOCUMENTS: `call.fulfill-need.credit.statements.pop-up.close-document`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_PREVIOUS: `call.fulfill-need.credit.statements.pop-up.view.previous`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_NEXT: `call.fulfill-need.credit.statements.pop-up.view.next`,
	CREDIT_STATEMENTS_BACK: `call.fulfill-need.credit.statements.pop-up.back`,
	CREDIT_STATEMENTS_SEND: `call.fulfill-need.credit.statements.pop-up.send`,
	CREDIT_STATEMENTS_SUCCESS: `call.fulfill-need.credit.statements.success`,
	CREDIT_STATEMENTS_SUCCESS_DONE: `call.fulfill-need.credit.statements.success.done`,
	CREDIT_STATEMENTS_SUCCESS_SEND_ANOTHER: `call.fulfill-need.credit.statements.success.send-another`,
	CREDIT_STATEMENTS_FAILURE: `call.fulfill-need.credit.statements.failure`,
	CREDIT_STATEMENTS_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.statements.failure.try-again`,
	CREDIT_STATEMENTS_FAILURE_DONE: `call.fulfill-need.credit.statements.failure.done`,

	CREDIT_PAID_UP_LETTER: `call.fulfill-need.paid-up-letter`,
	CREDIT_PAID_UP_LETTER_FILTER_SELECTION: `call.fulfill-need.paid-up-letter.filter`,
	CREDIT_PAID_UP_LETTER_CLEAR_FILTER_SELECTION: `call.fulfill-need.paid-up-letter.clear-filter`,
	CREDIT_PAID_UP_LETTER_CLEAR_ALL_FILTER_SELECTION: `call.fulfill-need.paid-up-letter.clear-all`,
	CREDIT_PAID_UP_LETTER_SEND: `call.fulfill-need.paid-up-letter.send-paid-up-letter`,
	CREDIT_PAID_UP_LETTER_POP_UP: `call.fulfill-need.paid-up-letter.pop-up`,
	CREDIT_PAID_UP_LETTER_POP_UP_CANCEL: `call.fulfill-need.paid-up-letter.pop-up.cancel`,
	CREDIT_PAID_UP_LETTER_POP_UP_SEND: `call.fulfill-need.paid-up-letter.pop-up.send`,
	CREDIT_PAID_UP_LETTER_POP_UP_VIEW_DOCUMENT: `call.fulfill-need.paid-up-letter.pop-up.view-document`,
	CREDIT_PAID_UP_LETTER_SUCCESS: `call.fulfill-need.paid-up-letter.success`,
	CREDIT_PAID_UP_LETTER_SUCCESS_DONE: `call.fulfill-need.paid-up-letter.success.done`,
	CREDIT_PAID_UP_LETTER_SUCCESS_SEND_ANOTHER: `call.fulfill-need.paid-up-letter.success.send-another`,
	CREDIT_PAID_UP_LETTER_FAILURE: `call.fulfill-need.paid-up-letter.failure`,
	CREDIT_PAID_UP_LETTER_FAILURE_ASSIGN: `call.fulfill-need.paid-up-letter.failure.assign`,
	CREDIT_PAID_UP_LETTER_FAILURE_DONE: `call.fulfill-need.paid-up-letter.failure.done`
};