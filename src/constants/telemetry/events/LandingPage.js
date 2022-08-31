/**
 * The event names to use when logging landing page(Favourites/ SavingsAccount/ Credit/ LBB) telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} LandingPageEvents
 */
 export const LandingPageEvents = {
	PRODUCT_BUTTON_FAVOURITES: `call.product.favourites`,
	PRODUCT_BUTTON_SavingsAccount: `call.product.savings-account`,
	PRODUCT_BUTTON_LiveBetter: `call.product.live-better-savings`,
	PRODUCT_BUTTON_SavingsPlan: `call.product.savings-plan`,
	PRODUCT_BUTTON_Insure: `call.product.insure`,
	PRODUCT_BUTTON_Credit: `call.product.credit`,
	ADD_CALLER_DETAILS: `call.add-caller`,
	END_CALL: `call.end-call`
 };