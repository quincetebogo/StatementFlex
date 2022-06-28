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
	FAVOURITES_PAID_UP_LETTER: `call.fulfill-need.select.paid-up-letter`,

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
	// Debi-check
	DEBICHECK: `call.fulfill-need.debicheck`,
	DEBICHECK_EXIT: `call.fulfill-need.debicheck.exit`,
	DEBICHECK_VIEW_MANDATE: `call.fulfill-need.debicheck.view-mandate`,
	DEBICHECK_VIEW_MANDATE_CLOSE: `call.fulfill-need.debicheck.view-mandate.close`,
	DEBICHECK_DECLINE_MANDATE: `call.fulfill-need.debicheck.decline-mandate`,
	DEBICHECK_DECLINE_MANDATE_CANCEL: `call.fulfill-need.debicheck.decline-mandate.cancel`,
	DEBICHECK_DECLINE_MANDATE_CONFIRM: `call.fulfill-need.debicheck.decline-mandate.confirm`,
	DEBICHECK_APPROVE_MANDATE: `call.fulfill-need.debicheck.approve-mandate`,
	DEBICHECK_APPROVE_MANDATE_CANCECL: `call.fulfill-need.debicheck.approve-mandate.cancel`,
	DEBICHECK_APPROVE_MANDATE_CONFIRM: `call.fulfill-need.debicheck.approve-mandate.confirm`,
	DEBICHECK_FIND_BRANCH: `call.fulfill-need.debicheck.find-a-branch`,

	// Yet to configure events for Debi check mandates approve and outcome screens
	// It can be done when we implement those feature

	// Tax certificate
	TAX_CERTIFICATE: `call.fulfill-need.tax-certificate`,
	TAX_CERTIFICATE_POP_UP: `call.fulfill-need.tax-certificate.pop-up`,
	TAX_CERTIFICATE_POP_UP_BACK: `call.fulfill-need.tax-certificate.pop-up.back`,
	TAX_CERTIFICATE_POP_UP_NEXT: `call.fulfill-need.tax-certificate.pop-up.next`,
	TAX_CERTIFICATE_POP_UP_CANCEL: `call.fulfill-need.tax-certificate.pop-up.cancel`,
	TAX_CERTIFICATE_POP_UP_VIEW_DOCUMENT: `call.fulfill-need.tax-certificate.pop-up.certificate-clicked`,
	TAX_CERTIFICATE_POP_UP_VIEW_PDF: `call.fulfill-need.tax-certificate.view-certificate`,
	TAX_CERTIFICATE_POP_UP_CLOSE_PDF: `call.fulfill-need.tax-certificate.view-certificate.close`,
	TAX_CERTIFICATE_SELECT_SEND: `call.fulfill-need.tax-certificate.pop-up.send`,
	TAX_CERTIFICATE_OUTCOME: `call.fulfill-need.tax-certificate.outcome`,
	TAX_CERTIFICATE_OUTCOME_DONE: `call.fulfill-need.tax-certificate.outcome.done`,
	TAX_CERTIFICATE_OUTCOME_ASSIGN: `call.fulfill-need.tax-certificate.outcome.hand-off`,
	TAX_CERTIFICATE_FIND_BRANCH: `call.fulfill-need.tax-certificate.find-a-branch`,
	TAX_CERTIFICATE_NOT_AVAILABLE: `call.fulfill-need.tax-certificate.not-available`,

	// Settlement Quote
	SETTLEMENT_QUOTE_SELECT: `call.fulfill-need.select.settlement-quote`,
	SETTLEMENT_QUOTE: `call.fulfill-need.settlement-quote`,
	SETTLEMENT_QUOTE_FILTER: `call.fulfill-need.settlement-quote.filter`,
	SETTLEMENT_QUOTE_SELECT_ALL: `call.fulfill-need.settlement-quote.select-all`,
	SETTLEMENT_QUOTE_DESELECT_ALL: `call.fulfill-need.settlement-quote.deselect-all`,
	SETTLEMENT_QUOTE_SEND: `call.fulfill-need.settlement-quote.send-settlement-quote`,
	SETTLEMENT_QUOTE_BACK: `call.fulfill-need.settlement-quote.back`

};

/**
 * The event names to use when logging telemetry events for statements flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} STATEMENT_EVENTS
 */
export const STATEMENT_EVENTS = Object.freeze({
	STATEMENTS: `call.fulfill-need.statements`,
	STATEMENTS_POP: `call.fulfill-need.statements.pop-up`,
	STATEMENTS_CANCEL: `call.fulfill-need.statements.pop-up.cancel`,
	
	STATEMENTS_ACCOUNT_NEXT: `call.fulfill-need.statements.pop-up.choose-account.next`,
	STATEMENTS_PERIOD_NEXT: `call.fulfill-need.statements.pop-up.choose-period.next`,
	STATEMENTS_BACK: `call.fulfill-need.statements.pop-up.back`,
	STATEMENTS_SEND: `call.fulfill-need.statements.pop-up.send`,
	
	STATEMENTS_VIEW_PDF: `call.fulfill-need.statements.pop-up.view-document`,
	STATEMENTS_CLOSE_PDF: `call.fulfill-need.statements.pop-up.close-document`,

	// Outcome screens
	STATEMENTS_SUCCESS: `call.fulfill-need.statements.success`,
	STATEMENTS_SUCCESS_DONE: `call.fulfill-need.statements.success.done`,
	STATEMENTS_SEND_ANOTHER: `call.fulfill-need.statements.success.send-another`,

	STATEMENTS_FAILURE: `call.fulfill-need.statements.failure`,
	STATEMENTS_FAILURE_DONE: `call.fulfill-need.statements.failure.done`,
	STATEMENTS_FAILURE_ASSIGN: `call.fulfill-need.statements.failure.assign`
});

/**
 * The event names to use when logging telemetry events for setttlement flow from Favourites.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} SETTLEMENT_QUOTE_EVENTS
 */
export const SETTLEMENT_QUOTE_EVENTS = Object.freeze({
	SETTLEMENT_QUOTE_DIALOG: `call.fulfill-need.settlement-quote.pop-up`,
	SETTLEMENT_QUOTE_CANCEL: `call.fulfill-need.settlement-quote.pop-up.cancel`,
	SETTLEMENT_QUOTE_VIEW_DOCUMENT: `call.fulfill-need.settlement-quote.pop-up.view-document`,
	SETTLEMENT_QUOTE_SEND: `call.fulfill-need.settlement-quote.pop-up.send`,

	SETTLEMENT_QUOTE_SUCCESS: `call.fulfill-need.settlement-quote.success`,
	SETTLEMENT_QUOTE_SUCCESS_DONE: `call.fulfill-need.settlement-quote.success.done`,
	SETTLEMENT_QUOTE_SUCCESS_SEND_ANOTHER: `call.fulfill-need.settlement-quote.success.send-another`,

	SETTLEMENT_QUOTE_FAILURE: `call.fulfill-need.settlement-quote.failure`,
	SETTLEMENT_QUOTE_FAILURE_TRY_AGAIN: `call.fulfill-need.settlement-quote.try-again`,
	SETTLEMENT_QUOTE_FAILURE_DONE: `call.fulfill-need.settlement-quote.failure.done`,

	SETTLEMENT_QUOTE_PARTIAL_SUCCESS: `call.fulfill-need.settlement-quote.partial-success`,
	SETTLEMENT_QUOTE_PARTIAL_SUCCESS_TRY_AGAIN: `call.fulfill-need.settlement-quote.partial-success.try-again`,
	SETTLEMENT_QUOTE_PARTIAL_SUCCESS_DONE: `call.fulfill-need.settlement-quote.partial-success.done`
});