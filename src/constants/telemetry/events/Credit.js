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
	CREDIT_BUDGET_FACILITY: `call.fulfill-need.credit.view-budget`,

	CREDIT_STATEMENTS_VIEW_FEES: `call.fulfill-need.credit.statements.pop-up.view-fees`,
	CREDIT_STATEMENTS_NEXT: `call.fulfill-need.credit.statements.pop-up.next`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_PREVIOUS: `call.fulfill-need.credit.statements.pop-up.view.previous`,
	CREDIT_STATEMENTS_DOCUMENTS_VIEW_NEXT: `call.fulfill-need.credit.statements.pop-up.view.next`,

	// Budget Details
	CREDIT_BUDGET_DETAILS: `call.fulfill-need.credit.budget`,
	CREDIT_BUDGET_DETAILS_BACK: `call.fulfill-need.credit.budget.back`,
	CREDIT_BUDGET_DETAILS_OPEN: `call.fulfill-need.credit.budget.open`,
	BUDGET_DETAILS_FILTER: `call.fulfill-need.credit.budget.filter`,
	BUDGET_DETAILS_CLEAR_FILTER: `call.fulfill-need.credit.budget.clear-filter`,
	BUDGET_DETAILS_TRANSFER_SELECT: `call.fulfill-need.credit.budget.select.transfer`,
	BUDGET_ACCOUNT_DETAILS_VIEW: `call.fulfill-need.credit.budget.view-details`,
	BUDGET_ACCOUNT_DETAILS_TRANSFER: `call.fulfill-need.credit.budget.view-details.transfer`,
	BUDGET_ACCOUNT_DETAILS_CLOSE: `call.fulfill-need.credit.budget.close.account-details`,

	// Open Budget
	OPEN_BUDGET: `call.fulfill-need.credit.budget.open`,
	OPEN_BUDGET_POPUP: `call.fulfill-need.credit.budget.open.pop-up`,
	OPEN_BUDGET_POPUP_CANCEL: `call.fulfill-need.credit.budget.open.pop-up.cancel`,
	OPEN_BUDGET_POPUP_CONFIRM: `call.fulfill-need.credit.budget.open.pop-up.confirm`,
	OPEN_BUDGET_SUCCESS: `call.fulfill-need.credit.budget.open.success`,
	OPEN_BUDGET_SUCCESS_DONE: `call.fulfill-need.credit.budget.open.success.done`,
	OPEN_BUDGET_FAILURE: `call.fulfill-need.credit.budget.open.failure`,
	OPEN_BUDGET_FAILURE_DONE: `call.fulfill-need.credit.budget.open.failure.done`,

	// Pay budget
	CREDIT_BUDGET_TRANSFER: `call.fulfill-need.credit.budget.transfer`,
	PAY_BUDGET_MODAL: `call.fulfill-need.credit.budget.transfer.pop-up`,
	PAY_BUDGET_CANCEL: `call.fulfill-need.credit.budget.transfer.pop-up.cancel`,
	PAY_BUDGET_TRANSFER: `call.fulfill-need.credit.budget.transfer.pop-up.transfer`,
	PAY_BUDGET_TRANSFER_SUCCESS: `call.fulfill-need.credit.budget.transfer.success`,
	PAY_BUDGET_TRANSFER_SUCCESS_DONE: `call.fulfill-need.credit.budget.transfer.success.done`,
	PAY_BUDGET_TRANSFER_SUCCESS_PAY_ANOTHER: `call.fulfill-need.credit.budget.transfer.success.pay-another`,
	PAY_BUDGET_SUCCESS_SEND_POP: `call.fulfill-need.credit.budget.transfer.success.send-proof-of-payment`,
	PAY_BUDGET_TRANSFER_FAILURE: `call.fulfill-need.credit.budget.transfer.failure`,
	PAY_BUDGET_TRANSFER_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.budget.transfer.failure.try-again`,
	PAY_BUDGET_TRANSFER_FAILURE_DONE: `call.fulfill-need.credit.budget.transfer.failure.done`,

	CREDIT_PAID_UP_LETTER: `call.fulfill-need.paid-up-letter`,
	CREDIT_PAID_UP_LETTER_FILTER_SELECTION: `call.fulfill-need.paid-up-letter.filter`,
	CREDIT_PAID_UP_LETTER_TEXT_FILTER_CLEAR: `call.fulfill-need.paid-up-letter.text-filter-clear`,
	CREDIT_PAID_UP_LETTER_SEND: `call.fulfill-need.paid-up-letter.send-paid-up-letter`,
	CREDIT_PAID_UP_LETTER_SELECT_ALL: `call.fulfill-need.paid-up-letter.select-all`,
	CREDIT_PAID_UP_LETTER_DESELECT_ALL: `call.fulfill-need.paid-up-letter.deselect-all`,
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

/**
 * The event names to use when logging telemetry events for statements flow from Credit.
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


/**
 * The event names to use when logging telemetry events for Proof of payment for pay budget flow
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} 
 */
 export const BUDGET_FACILITY_POP_EVENTS = Object.freeze({
	EMAIL_POP: `call.fulfill-need.credit.budget.transfer.proof-of-payment`,
	POP_MODAL: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-up`,
	POP_CANCEL: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-up.cancel`,
	POP_VIEW_DOCUMENT: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-up.view-document`,
	POP_CLOSE_DOCUMENT: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-up.view-document.close`,
	POP_SEND: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-up.send`,
	POP_SUCCESS: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-success`,
	POP_SUCCESS_DONE: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-success.done`,
	POP_SUCCESS_PAY_ANOTHER: `call.fulfill-need.credit.budget.transfer.proof-of-payment.pop-success.pay-another`,
	POP_FAILURE: `call.fulfill-need.credit.budget.transfer.proof-of-payment.failure`,
	POP_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.budget.transfer.proof-of-payment.failure.try-again`,
	POP_FAILURE_DONE: `call.fulfill-need.credit.budget.transfer.proof-of-payment.failure.done`
});

/**
 * The event names to use when logging telemetry events for setttlement flow from Credit.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SETTLEMENT_QUOTE_EVENTS
 */
export const SETTLEMENT_QUOTE_EVENTS = Object.freeze({
	SETTLEMENT_QUOTE: `call.fulfill-need.credit.settlement-quote`,
	SETTLEMENT_QUOTE_DIALOG: `call.fulfill-need.credit.settlement-quote.pop-up`,
	SETTLEMENT_QUOTE_CANCEL: `call.fulfill-need.credit.settlement-quote.pop-up.cancel`,
	SETTLEMENT_QUOTE_VIEW_DOCUMENT: `call.fulfill-need.credit.settlement-quote.pop-up.view-document`,
	SETTLEMENT_QUOTE_SEND: `call.fulfill-need.credit.settlement-quote.pop-up.send`,

	SETTLEMENT_QUOTE_SUCCESS: `call.fulfill-need.credit.settlement-quote.success`,
	SETTLEMENT_QUOTE_SUCCESS_DONE: `call.fulfill-need.credit.settlement-quote.success.done`,
	SETTLEMENT_QUOTE_SUCCESS_SEND_ANOTHER: `call.fulfill-need.credit.settlement-quote.success.send-another`,

	SETTLEMENT_QUOTE_FAILURE: `call.fulfill-need.credit.settlement-quote.failure`,
	SETTLEMENT_QUOTE_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.settlement-quote.failure.try-again`,
	SETTLEMENT_QUOTE_FAILURE_DONE: `call.fulfill-need.credit.settlement-quote.failure.done`,

	SETTLEMENT_QUOTE_PARTIAL_SUCCESS: `call.fulfill-need.credit.settlement-quote.partial-success`,
	SETTLEMENT_QUOTE_PARTIAL_SUCCESS_TRY_AGAIN: `call.fulfill-need.credit.settlement-quote.partial-success.try-again`,
	SETTLEMENT_QUOTE_PARTIAL_SUCCESS_DONE: `call.fulfill-need.credit.settlement-quote.partial-success.done`
});

/**
 * The event names to use when logging telemetry events for settle and close credit card flow from Credit.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SETTLE_AND_CLOSE_CREDIT_CARD_POP_EVENTS
 */
export const SETTLE_AND_CLOSE_CREDIT_CARD_POP_EVENTS = Object.freeze({
	EMAIL_POP: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment`,
	POP_MODAL: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-up`,
	POP_CANCEL: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-up.cancel`,
	POP_VIEW_DOCUMENT: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-up.view-document`,
	POP_CLOSE_DOCUMENT: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-up.view-document.close`,
	POP_SEND: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-up.send`,
	POP_SUCCESS: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-success`,
	POP_SUCCESS_DONE: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-success.done`,
	POP_SUCCESS_PAY_ANOTHER: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.pop-success.pay-another`,
	POP_FAILURE: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.failure`,
	POP_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.failure.try-again`,
	POP_FAILURE_DONE: `call.fulfill-need.credit.settle-and-close-credit-card.proof-of-payment.failure.done`
});

/**
 * The event names to use when logging telemetry events for settle and close term loan flow from Credit.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SETTLE_AND_CLOSE_TERM_LOAN_POP_EVENTS
 */
export const SETTLE_AND_CLOSE_TERM_LOAN_POP_EVENTS = Object.freeze({
	EMAIL_POP: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment`,
	POP_MODAL: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-up`,
	POP_CANCEL: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-up.cancel`,
	POP_VIEW_DOCUMENT: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-up.view-document`,
	POP_CLOSE_DOCUMENT: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-up.view-document.close`,
	POP_SEND: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-up.send`,
	POP_SUCCESS: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-success`,
	POP_SUCCESS_DONE: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-success.done`,
	POP_SUCCESS_PAY_ANOTHER: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.pop-success.pay-another`,
	POP_FAILURE: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.failure`,
	POP_FAILURE_TRY_AGAIN: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.failure.try-again`,
	POP_FAILURE_DONE: `call.fulfill-need.credit.settle-and-close-term-loan.proof-of-payment.failure.done`
});

/**
 * The event names to use when logging telemetry events for settle and close flow from Credit.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SETTLE_AND_CLOSE
 */
export const SETTLE_AND_CLOSE = Object.freeze({
	'Flexible': { NEED_SELECT: `call.fulfill-need.credit.select.settle-and-close`,
		NEED: `call.fulfill-need.credit.settle-and-close-credit-card`,
		DISCLAIMER_CANCEL: `call.fulfill-need.credit.settle-and-close-credit-card.disclaimer.cancel`,
		DISCLAIMER_CONTINUE: `call.fulfill-need.credit.settle-and-close-credit-card.disclaimer.continue`,
		POP_UP: `call.fulfill-need.credit.settle-and-close-credit-card.pop-up`,
		POP_UP_CANCEL: `call.fulfill-need.credit.settle-and-close-credit-card.pop-up.cancel`,
		POP_UP_CONFIRM: `call.fulfill-need.credit.settle-and-close-credit-card.pop-up.settle-and-close`,
		SUCCESS: `call.fulfill-need.credit.settle-and-close-credit-card.success`,
		SUCCESS_DONE: `call.fulfill-need.credit.settle-and-close-credit-card.success.done`,
		SUCCESS_SEND_POP: `call.fulfill-need.credit.settle-and-close-credit-card.success.send-proof-of-payment`,
		FAILURE: `call.fulfill-need.credit.settle-and-close-credit-card.failure`,
		FAILURE_TRY_AGAIN: `call.fulfill-need.credit.settle-and-close-credit-card.failure.try-again`,
		FAILURE_DONE: `call.fulfill-need.credit.settle-and-close-credit-card.failure.done`,
		POP_EVENTS: SETTLE_AND_CLOSE_CREDIT_CARD_POP_EVENTS },

	'Fixed': { NEED_SELECT: `call.fulfill-need.credit.select.settle-and-close-term-loan`,
		NEED: `call.fulfill-need.credit.settle-and-close-term-loan`,
		DISCLAIMER_CANCEL: `call.fulfill-need.credit.settle-and-close-term-loan.disclaimer.cancel`,
		DISCLAIMER_CONTINUE: `call.fulfill-need.credit.settle-and-close-term-loan.disclaimer.continue`,
		POP_UP: `call.fulfill-need.credit.settle-and-close-term-loan.pop-up`,
		POP_UP_CANCEL: `call.fulfill-need.credit.settle-and-close-term-loan.pop-up.cancel`,
		POP_UP_CONFIRM: `call.fulfill-need.credit.settle-and-close-term-loan.pop-up.settle-and-close`,
		SUCCESS: `call.fulfill-need.credit.settle-and-close-term-loan.success`,
		SUCCESS_DONE: `call.fulfill-need.credit.settle-and-close-term-loan.success.done`,
		SUCCESS_SEND_POP: `call.fulfill-need.credit.settle-and-close-term-loan.success.send-proof-of-payment`,
		FAILURE: `call.fulfill-need.credit.settle-and-close-term-loan.failure`,
		FAILURE_TRY_AGAIN: `call.fulfill-need.credit.settle-and-close-term-loan.failure.try-again`,
		FAILURE_DONE: `call.fulfill-need.credit.settle-and-close-term-loan.failure.done`,
		POP_EVENTS: SETTLE_AND_CLOSE_TERM_LOAN_POP_EVENTS }
});


/**
 * Credit Transaction History events 
 *
 * @export
 * @param {*} creditType type of credit product (Credit card/ Access facility/ Term loan)
 * @returns {*} set of transaction history telemetry events dynamically for given credit type
 */
 export const TRANSACTION_ENQUIRY_EVENTS = (creditType) => {
	const productType = creditType.toLowerCase().replace(` `, `-`);

	return { TRANSACTION_HISTORY: `call.fulfill-need.credit.${productType}-transaction-history`,
		TRANSACTION_HISTORY_FILTER: `call.fulfill-need.credit.${productType}-transaction-history.filter`,
		TRANSACTION_HISTORY_CLEAR_ALL: `call.fulfill-need.credit.${productType}-transaction-history.filter.clear-all`,
		TRANSACTION_HISTORY_CLEAR_FILTER: `call.fulfill-need.credit.${productType}-transaction-history.filter.clear`,
		TRANSACTION_HISTORY_INFO: `call.fulfill-need.credit.${productType}-transaction-history.view-info`,
		TRANSACTION_HISTORY_BACK: `call.fulfill-need.credit.${productType}-transaction-history.back`,
		TRANSACTION_HISTORY_VIEW_LINKED_TRANSACTIONS: `call.fulfill-need.credit.${productType}-transaction-history.linked-transaction-view`,
		TRANSACTION_HISTORY_LOAD_MORE: `call.fulfill-need.credit.${productType}-transaction-history.load-more`,
		TRANSACTION_HISTORY_SCROLL_TOP: `call.fulfill-need.credit.${productType}-transaction-history.scroll-to-top` };
 };