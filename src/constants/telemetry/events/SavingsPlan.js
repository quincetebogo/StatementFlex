/**
 * The event names to use when logging Savings Plan telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} SavingsPlanEvents
 */

export const SavingsPlanEvents = {
SAVINGS_PLAN: `call.fulfill-need.savings-plan`, 
SAVINGS_PLAN_VERIFY_NOW: `call.fulfill-need.savings-plan.verify-now`,
SAVINGS_PLAN_VIEW_INFO: `call.fulfill-need.savings-plan.view-info`,
SAVINGS_PLAN_VIEW_BENEFITS: `call.fulfill-need.savings-plan.view-benefits`,
SAVINGS_PLAN_FIND_A_BRANCH: `call.fulfill-need.savings-plan.find-a-branch`,
SAVINGS_PLAN_ACCOUNT_DETAILS_CLOSE: `call.fulfill-need.savings-plan.close.account-details`,
SAVINGS_PLAN_TRANSACTION_HISTORY: `call.fulfill-need.savings-plan.select.transaction-history`,
SAVINGS_PLAN_FTSP_UNLOCK: `call.fulfill-need.savings-plan.select.ftsp-unlock`,

SAVINGS_PLAN_ACCOUNT_NUMBER_SELECT: `call.fulfill-need.savings-plan.select.account-number`, 
SAVINGS_PLAN_STATEMENTS_SELECT: `call.fulfill-need.savings-plan.select.statements`, 
SAVINGS_PLAN_TAX_CERTIFICATE_SELECT: `call.fulfill-need.savings-plan.select.tax-certificate`,

SAVINGS_PLAN_TAX_CERTIFICATE: `call.fulfill-need.savings-plan-tax-certificate`, 
SAVINGS_PLAN_TAX_CERTIFICATE_DIALOG: `call.fulfill-need.savings-plan-tax-certificate.pop-up`, 
SAVINGS_PLAN_TAX_CERTIFICATE_NEXT: `call.fulfill-need.savings-plan-tax-certificate.pop-up.next`, 
SAVINGS_PLAN_TAX_CERTIFICATE_CANCEL: `call.fulfill-need.savings-plan-tax-certificate.pop-up.cancel`, 
SAVINGS_PLAN_TAX_CERTIFICATE_BACK: `call.fulfill-need.savings-plan-tax-certificate.pop-up.back`, 
SAVINGS_PLAN_TAX_CERTIFICATE_SEND: `call.fulfill-need.savings-plan-tax-certificate.pop-up.send`, 
SAVINGS_PLAN_TAX_CERTIFICATE_VIEW_CERTIFICATE: `call.fulfill-need.savings-plan-tax-certificate.pop-up.view-certificate`, 
SAVINGS_PLAN_TAX_CERTIFICATE_VIEW_CERTIFICATE_CLOSE: `call.fulfill-need.savings-plan-tax-certificate.view-certificate.close`, 
SAVINGS_PLAN_TAX_CERTIFICATE_SUCCESS: `call.fulfill-need.savings-plan-tax-certificate.success`,
SAVINGS_PLAN_TAX_CERTIFICATE_SUCCESS_DONE: `call.fulfill-need.savings-plan-tax-certificate.success.done`,
SAVINGS_PLAN_TAX_CERTIFICATE_SUCCESS_SEND_ANOTHER: `call.fulfill-need.savings-plan-tax-certificate.success.send-another`,
SAVINGS_PLAN_TAX_CERTIFICATE_FAILURE: `call.fulfill-need.savings-plan-tax-certificate.failure`, 
SAVINGS_PLAN_TAX_CERTIFICATE_FAILURE_TRY_AGAIN: `call.fulfill-need.savings-plan-tax-certificate.failure.try-again`,
SAVINGS_PLAN_TAX_CERTIFICATE_FAILURE_DONE: `call.fulfill-need.savings-plan-tax-certificate.failure.done`,
SAVINGS_PLAN_TAX_CERTIFICATE_FIND_A_BRANCH: `call.fulfill-need.savings-plan-tax-certificate.find-a-branch`,
SAVINGS_PLAN_TAX_CERTIFICATE_CLICKED: `call.fulfill-need.savings-plan-tax-certificate.pop-up.certificate-clicked`
};

/**
 * The event names to use when logging telemetry events for statements flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} STATEMENT_EVENTS
 */
 export const STATEMENT_EVENTS = Object.freeze({
	STATEMENTS: `call.fulfill-need.savings-plan.statements`,
	STATEMENTS_POP: `call.fulfill-need.savings-plan.statements.pop-up`, 
	STATEMENTS_CANCEL: `call.fulfill-need.savings-plan.statements.pop-up.cancel`,
	SAVINGS_PLAN_STATEMENTS_VIEW_FEES: `call.fulfill-need.savings-plan.statements.pop-up.view-fees`, 
	
	STATEMENTS_PERIOD_NEXT: `call.fulfill-need.savings-plan.statements.pop-up.next`,
	STATEMENTS_BACK: `call.fulfill-need.savings-plan.statements.pop-up.back`, 
	STATEMENTS_SEND: `call.fulfill-need.savings-plan.statements.pop-up.send`,
	
	STATEMENTS_VIEW_PDF: `call.fulfill-need.savings-plan.statements.pop-up.view-document`,
	STATEMENTS_CLOSE_PDF: `call.fulfill-need.savings-plan.statements.pop-up.close-document`,
	SAVINGS_PLAN_STATEMENTS_VIEW_PREVIOUS: `call.fulfill-need.savings-plan.statements.pop-up.view.previous`, 
	SAVINGS_PLAN_STATEMENTS_VIEW_NEXT: `call.fulfill-need.savings-plan.statements.pop-up.view.next`, 
	SAVINGS_PLAN_STATEMENTS_CANCEL: `call.fulfill-need.savings-plan.statements.pop-up.cancel`, 

	// Outcome screens
	STATEMENTS_SUCCESS: `call.fulfill-need.savings-plan.statements.success`,
	STATEMENTS_SUCCESS_DONE: `call.fulfill-need.savings-plan.statements.success.done`,
	STATEMENTS_SEND_ANOTHER: `call.fulfill-need.savings-plan.statements.success.send-another`,

	STATEMENTS_FAILURE: `call.fulfill-need.savings-plan.statements.failure`,
	STATEMENTS_FAILURE_DONE: `call.fulfill-need.savings-plan.statements.failure.done`,
	STATEMENTS_FAILURE_ASSIGN: `call.fulfill-need.savings-plan.statements.failure.try-again`
});

export const TRANSACTION_ENQUIRY_EVENTS = Object.freeze({
	TRANSACTION_HISTORY: `call.fulfill-need.savings-plan.transaction-history`,
	TRANSACTION_HISTORY_FILTER: `call.fulfill-need.savings-plan.transaction-history.filter`,
	TRANSACTION_HISTORY_CLEAR_ALL: `call.fulfill-need.savings-plan.transaction-history.filter.clear-all`,
	TRANSACTION_HISTORY_CLEAR_FILTER: `call.fulfill-need.savings-plan.transaction-history.filter.clear`,
	TRANSACTION_HISTORY_INFO: `call.fulfill-need.savings-plan.transaction-history.view-info`,
	TRANSACTION_HISTORY_BACK: `call.fulfill-need.savings-plan.transaction-history.back`,
	TRANSACTION_HISTORY_LOAD_MORE: `call.fulfill-need.savings-plan.transaction-history.load-more`,
	TRANSACTION_HISTORY_SCROLL_TOP: `call.fulfill-need.savings-plan.transaction-history.scroll-to-top`
 });

 
/**
 * The event names to use when logging telemetry events for unlock FTSP flow.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} UNLOCK_FTSP_EVENTS
 */
 export const UNLOCK_FTSP_EVENTS = Object.freeze({
	UNLOCK_FTSP: `call.fulfill-need.savings-plan.ftsp-unlock`,
	UNLOCK_FTSP_CHOOSE_ACCOUNT: `call.fulfill-need.savings-plan.ftsp-unlock.choose-account`,
	UNLOCK_FTSP_CHOOSE_OPTION: `call.fulfill-need.savings-plan.ftsp-unlock.unlock-options`,
	UNLOCK_FTSP_UNLOCK_AMOUNT: `call.fulfill-need.savings-plan.ftsp-unlock.enter-unlock-amount`,
	UNLOCK_FTSP_ACCEPT_QUOTE: `call.fulfill-need.savings-plan.ftsp-unlock.accept-quote`,
	UNLOCK_FTSP_VIEW_AGREEMENT: `call.fulfill-need.savings-plan.ftsp-unlock.view-agreement`,
	UNLOCK_FTSP_CANCEL: `call.fulfill-need.savings-plan.ftsp-unlock.cancel`,
	UNLOCK_FTSP_SELECT_TRANSFER: `call.fulfill-need.savings-plan.ftsp-unlock.select-transfer`,
	UNLOCK_FTSP_TRANSFER: `call.fulfill-need.savings-plan.ftsp-unlock.transfer`,
	UNLOCK_FTSP_TRANSFER_CONFIRM: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.confirm`,
	UNLOCK_FTSP_TRANSFER_SUCCESS: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.success`,
	UNLOCK_FTSP_TRANSFER_SUCCESS_DONE: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.success.done`,
	UNLOCK_FTSP_TRANSFER_FAILURE: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.failure`,
	UNLOCK_FTSP_TRANSFER_FAILURE_TRY_AGAIN: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.failure.try-again`,
	UNLOCK_FTSP_TRANSFER_FAILURE_DONE: `call.fulfill-need.savings-plan.ftsp-unlock.transfer.failure.done`
 });