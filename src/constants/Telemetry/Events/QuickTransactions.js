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
	TAP_TO_PAY_OUTCOME_HANDOFF: `call.fulfill-need.tap-to-pay.outcome.hand-off`,
	LAUNCH_STRACK_FEEDBACK: `call.fulfill-need.feedback`,
     LAUNCH_STRACK_FEEDBACK_DONE: `call.fulfill-need.feedback.done`,

     // Update card limits 
     CARD_LIMITS: `call.fulfill-need.card-limits`,
     CARD_LIMITS_SELECT_CARD: `call.fulfill-need.card-limits.select-card`,

     // Update card limits modal
     UPDATE_LIMITS: `call.fulfill-need.card-limits.update-limits`,
     UPDATE_LIMITS_NEXT: `call.fulfill-need.card-limits.update-limits.next`,
     UPDATE_LIMITS_AGREE: `call.fulfill-need.card-limits.update-limits.agree`,
     UPDATE_LIMITS_BACK: `call.fulfill-need.card-limits.update-limits.back`,
     UPDATE_LIMITS_CANCEL: `call.fulfill-need.card-limits.update-limits.cancel`,

     // Discard changes modal
     DISCARD_CHANGES: `call.fulfill-need.card-limits.update-limits.discard-changes`,
     DISCARD_CHANGES_CANCEL: `call.fulfill-need.card-limits.update-limits.discard-changes.cancel`,
     DISCARD_CHANGES_CONFIRM: `call.fulfill-need.card-limits.update-limits.discard-changes.confirm`,

	 // Satements
	 STATEMENTS: `call.fulfill-need.statements`,
	 STATEMENTS_CANCEL: `call.fulfill-need.statements.cancel`,

	 STATEMENTS_SELECT_ACCOUNT: `call.fulfill-need.statements.select-account`,
	 STATEMENTS_SELECT_PLAN: `call.fulfill-need.statements.select-plan`,
	 STATEMENTS_ACCOUNT_NEXT: `call.fulfill-need.statements.next`,
	 STATEMENTS_SELECT_PERIOD: `call.fulfill-need.statements.select-period`,
	 STATEMENTS_BACK: `call.fulfill-need.statements.back`,
	 STATEMENTS_SELECT_DATE_RANGE: `call.fulfill-need.statements.select-custom-period`,
	 STATEMENTS_PERIOD_NEXT: `call.fulfill-need.statements.select-period.next`,

	SELECT_STATEMENTS_VIEW_PDF: `call.fulfill-need.statements.view-document`,
	SELECT_STATEMENTS_CLOSE_PDF: `call.fulfill-need.statements.close-document`,
	STATEMENTS_SEND: `call.fulfill-need.statements.send`,

	// Debi-check
	DEBICHECK: `call.fulfill-need.debicheck`,
	DEBICHECK_EXIT: `call.fulfill-need.debicheck.exit`,
	DEBICHECK_VIEW_MANDATE: `call.fulfill-need.debicheck.view-mandate`,
	DEBICHECK_VIEW_MANDATE_CLOSE: `call.fulfill-need.debicheck.view-mandate.close`,
	DEBICHECK_DECLINE_MANDATE: `call.fulfill-need.debicheck.decline-mandate`,
	DEBICHECK_DECLINE_MANDATE_CANCEL: `call.fulfill-need.debicheck.decline-mandate.cancel`,
	DEBICHECK_DECLINE_MANDATE_CONFIRM: `call.fulfill-need.debicheck.decline-mandate.confirm`,
	DEBICHECK_APPROVE_MANDATE: `call.fulfill-need.debicheck.approve-mandate`,
	// Yet to confiure events for Debi check mandates approve and outcome screens
	// It can be done when we implement those feature

	// Tax certificate
	SELECT_VIEW_TAX_CERTIFICATE: `call.fulfill-need.tax-certificate.pop-up.certificate-clicked`,
	VIEW_TAX_CERTIFICATE: `call.fulfill-need.tax-certificate.view-certificate`,
	SELECT_CLOSE_VIEW_TAX_CERTIFICATE: `call.fulfill-need.tax-certificate.view-certificate.close`
 };