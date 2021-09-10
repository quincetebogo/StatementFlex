/**
 * The event names to use when logging live better telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} LiveBetterEvents
 */
 export const LiveBetterEvents = {

	LIVE_BETTER : `call.fulfill-need.live-better-savings`,
	LIVE_BETTER_ACCOUNT_NUMBER : `call.fulfill-need.live-better-savings.select.account-number`,
	LIVE_BETTER_ROUND_UP_TOGGLE : `call.fulfill-need.live-better-savings.toggle.round-up`,
	LIVE_BETTER_INTEREST_SWEEP_TOGGLE : `call.fulfill-need.live-better-savings.toggle.interest-sweep`,
	LIVE_BETTER_TRANSACTION_HISTORY : `call.fulfill-need.live-better-savings.select.transaction-history`,
	LIVE_BETTER_STATEMENTS : `call.fulfill-need.live-better-savings.select.statements`,
	LIVE_BETTER_AUTOMATIC_SAVINGS : `call.fulfill-need.live-better-savings.select.automatic-savings`,

	LIVE_BETTER_VIEW_BENEFITS: `call.fulfill-need.live-better-savings.view-benefits`
};