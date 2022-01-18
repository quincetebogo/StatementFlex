/**
 * The event names to use when logging Savings Plan telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} SavingsPlanEvents
 */

export const SavingsPlanEvents = {
SAVINGS_PLAN: `call.fulfill-need.savings-plan`,
SAVINGS_PLAN_VERIFY_NOW:`call.fulfill-need.savings-plan.verify-now`,
SAVINGS_PLAN_VIEW_INFO: `call.fulfill-need.savings-plan.view-info`,

SAVINGS_PLAN_ACCOUNT_NUMBER_SELECT: `call.fulfill-need.savings-plan.select.account-number`,
SAVINGS_PLAN_DETAILS_BACK: ``,
SAVINGS_PLAN_EXPANDER_CLOSE: ``,
SAVINGS_PLAN_STATEMENTS_SELECT: `call.fulfill-need.savings-plan.select.statements`,
SAVINGS_PLAN_TAX_CERTIFICATE_SELECT: `call.fulfill-need.savings-plan.select.tax-certificate`,
SAVINGS_PLAN_PRODUCT_ENQUIRY_SELECT: `call.fulfill-need.savings-plan.select.product-enquiry`,
SAVINGS_PLAN_SAVINGS_CALCULATOR_SELECT: `call.fulfill-need.savings-plan.select.savings-calculator`,
SAVINGS_PLAN_INTEREST_RATES_SELECT: `call.fulfill-need.savings-plan.select.interest-rates`,

SAVINGS_PLAN_STATEMENTS: `call.fulfill-need.savings-plan.statements`,
SAVINGS_PLAN_STATEMENTS_DIALOG: `call.fulfill-need.savings-plan.statements.pop-up`,
SAVINGS_PLAN_STATEMENTS_CANCEL: `call.fulfill-need.savings-plan.statements.pop-up.cancel`,
SAVINGS_PLAN_STATEMENTS_NEXT: `call.fulfill-need.savings-plan.statements.pop-up.next`,
SAVINGS_PLAN_STATEMENTS_SEND: `call.fulfill-need.savings-plan.statements.pop-up.send`,
SAVINGS_PLAN_STATEMENTS_BACK: `call.fulfill-need.savings-plan.statements.pop-up.back`,
SAVINGS_PLAN_STATEMENTS_VIEW_DOCUMENT: `call.fulfill-need.savings-plan.statements.pop-up.view-document`,
SAVINGS_PLAN_STATEMENTS_CLOSE_DOCUMENTS: `call.fulfill-need.savings-plan.statements.pop-up.close-document`,
SAVINGS_PLAN_STATEMENTS_SUCCESS: `call.fulfill-need.savings-plan.statements.success`,
SAVINGS_PLAN_STATEMENTS_SUCCESS_DONE: `call.fulfill-need.savings-plan.statements.success.done`,
SAVINGS_PLAN_STATEMENTS_SUCCESS_SEND_ANOTHER: `call.fulfill-need.savings-plan.statements.success.send-another`,
SAVINGS_PLAN_STATEMENTS_FAILURE: `call.fulfill-need.savings-plan.statements.failure`,
SAVINGS_PLAN_STATEMENTS_FAILURE_TRY_AGAIN: `call.fulfill-need.savings-plan.statements.failure.try-again`,
SAVINGS_PLAN_STATEMENTS_FAILURE_DONE: `call.fulfill-need.savings-plan.statements.failure.done`

};