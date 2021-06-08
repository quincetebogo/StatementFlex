/**
 * The event names to use when logging quick transactions telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} QuickTransactionEvents
 */
 export const QuickTransactionEvents = {
	FULFILL_NEED: `call.fulfill-need`,

	// Pending mandates alert
	DEBI_CHECK_ALERT: `call.fulfill-need.debicheck-alert`,
	DEBI_CHECK_ALERT_DISMISS: `call.fulfill-need.debicheck-alert.dismiss`,
	DEBI_CHECK_ALERT_ACCEPT: `call.fulfill-need.debicheck-alert.accept`,

	// Favourites events
	FAVOURITES_DEBI_CHECK: `call.fulfill-need.select-debicheck`,
	FAVOURITES_STOP_CARD: `call.fulfill-need.select-stop-card`,
	FAVOURITES_UPDATE_CARD_LIMITS: `call.fulfill-need.select-card-limits`,
	FAVOURITES_TAP_TO_PAY: `call.fulfill-need.select-tap-to-pay`,
	FAVOURITES_STATEMENTS: `call.fulfill-need.select-statements`,
	FAVOURITES_TAX_CERTIFICATE: `call.fulfill-need.select-tax-certificate`,
	FAVOURITES_PROOF_OF_ACCOUNT: `call.fulfill-need.select-proof-of-account`,
	FAVOURITES_SEARCH_OTHER_NEED: `call.fulfill-need.select-other-need`,
	FAVOURITES_END_CALL: `call.fulfill-need.end-call`,

	// Stop Card
	STOP_CARD: `call.fulfill-need.stop-card`,
	STOP_CARDS_CLICK: `call.fulfill-need.stop-card.stop`,
	CONFIRM_STOP_CARD: `call.fulfill-need.stop-card.confirm`,
	CANCEL_STOP_CARD: `call.fulfill-need.stop-card.cancel`,
	STOP_CARD_OUTCOME: `call.fulfill-need.stop-card.outcome`,
	// Stop card success
	STOP_CARD_SUCCESS: `call.fulfill-need.stop-card.success`,
	STOP_CARD_SUCCESS_DONE: `call.fulfill-need.stop-card.success.done`,
	STOP_CARD_SUCCESS_ANOTHER: `call.fulfill-need.stop-card.success.another`,
	// Stop card failure
	STOP_CARD_FAILURE: `call.fulfill-need.stop-card.failure`,
	STOP_CARD_TRY_AGAIN: `call.fulfill-need.stop-card.failure.try-again`,
	STOP_CARD_FAILURE_ASSIGN: `call.fulfill-need.stop-card.failure.assign`,
	// Stop card Assign
	STOP_CARD_ASSIGN: `call.fulfill-need.stop-card.failure.assign`,
	STOP_CARD_ASSIGN_CONFIRM: `call.fulfill-need.stop-card.failure.assign.confirm`,
	STOP_CARD_ASSIGN_CANCEL: `call.fulfill-need.stop-card.failure.assign.cancel`,
 };