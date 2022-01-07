/**
 * The event names to use when logging View benefits click from Product info screens(SavingsAccount/ Savings Plan/ Insure/ Credit/ LBB) telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} ProductInfoEvents
 */

export const ProductInfoEvents = {
	'VIEW_BENEFITS_transact': `call.fulfill-need.transact.view-benefits`,
	'VIEW_BENEFITS_save': `call.fulfill-need.save.view-benefits`,
	'VIEW_BENEFITS_insure': `call.fulfill-need.insure.view-benefits`,
	'VIEW_BENEFITS_credit': `call.fulfill-need.credit.view-benefits`,
	'VIEW_BENEFITS_liveBetter': `call.fulfill-need.live-better.view-benefits`
};