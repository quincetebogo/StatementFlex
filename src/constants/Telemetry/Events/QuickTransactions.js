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
	// Stop card Outcome
	STOP_CARD_OUTCOME_DONE: `call.fulfill-need.stop-card.outcome.done`,
	STOP_CARD_OUTCOME_ANOTHER: `call.fulfill-need.stop-card.outcome.another`,
	STOP_CARD_OUTCOME_TRY_AGAIN: `call.fulfill-need.stop-card.outcome.try-again`,
	STOP_CARD_OUTCOME_ASSIGN: `call.fulfill-need.stop-card.outcome.assign`,
	// Stop card Assign
	STOP_CARD_ASSIGN: `call.fulfill-need.stop-card.assign`,
	STOP_CARD_ASSIGN_CONFIRM: `call.fulfill-need.stop-card.assign.confirm`,
	STOP_CARD_ASSIGN_CANCEL: `call.fulfill-need.stop-card.assign.cancel`,

	// Proof of Account
	PROOF_OF_ACCOUNT: `call.fulfill-need.proof-of-account`,
	PROOF_OF_ACCOUNT_CANCEL: `call.fulfill-need.proof-of-account.cancel`,
	PROOF_OF_ACCOUNT_SEND: `call.fulfill-need.proof-of-account.send`,
	PROOF_OF_ACCOUNT_OUTCOME: `call.fulfill-need.proof-of-account.outcome`,
	// Proof of Account - Outcome
	PROOF_OF_ACCOUNT_OUTCOME_DONE: `call.fulfill-need.proof-of-account.outcome.done`,
	PROOF_OF_ACCOUNT_OUTCOME_ANOTHER: `call.fulfill-need.proof-of-account.outcome.another`,
	PROOF_OF_ACCOUNT_OUTCOME_HANDOFF: `call.fulfill-need.proof-of-account.outcome.handoff`,

	// Search OtherNeed
	SEARCH_OTHER_NEED: `call.fulfill-need.other-needs`,
	SEARCH_OTHER_NEED_LAUNCH_STRACK: `call.fulfill-need.other-needs.launch-strack`,
	// Launch-STrack Feedback
	SEARCH_OTHER_NEED_DONE: `call.fulfill-need.other-needs.done`,

	// Tap to pay
	TAP_TO_PAY: `call.fulfill-need.tap-to-pay`,
	TAP_TO_PAY_TOGGLE: `call.fulfill-need.tap-to-pay.get-agreements`,
	TAP_TO_PAY_UPDATE_CANCEL: `call.fulfill-need.tap-to-pay.update.cancel`,
	TAP_TO_PAY_UPDATE: `call.fulfill-need.tap-to-pay.update.agree`,
	TAP_TO_PAY_OUTCOME: `call.fulfill-need.tap-to-pay.outcome`,
	TAP_TO_PAY_OUTCOME_DONE: `call.fulfill-need.tap-to-pay.outcome.done`,
	TAP_TO_PAY_OUTCOME_ANOTHER: `call.fulfill-need.tap-to-pay.outcome.another`,
	TAP_TO_PAY_OUTCOME_HANDOFF: `call.fulfill-need.tap-to-pay.outcome.hand-off`
 };