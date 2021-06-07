/** The event names to use when logging telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * @readonly
 * @enum {String} TelemetryEvent
 */
 export const TelemetryEvents = {
	// Accept Call
	INCOMING_CALL: `call`,
	INCIDENT_CREATED: `call.incident-created`,

	// Identify Caller
	IDENTIFY_CALLER: `call.id-caller`,

	// Confirm Caller
	CONFIRM_CALLER: `call.id-caller.confirm-caller`,
	CONFIRM_CALLER_CONFIRM_CLICK: `call.id-caller.confirm-caller.confirm`,
	CONFIRM_CALLER_SEARCH_CLICK: `call.id-caller.confirm-caller.search-client`,
	CONFIRM_CALLER_ADD_CALLER_CLICK: `call.id-caller.confirm-caller.add-caller-details`,
	
	// Search Caller
	SEARCH_CLIENT: `call.id-caller.search-client`,
	SEARCH_CLIENT_SEARCH_CLICK: `call.id-caller.search-client.search`,
	SEARCH_CLIENT_CONTINUE_CLICK: `call.id-caller.search-client.continue`,

	// Add caller details
	ADD_CALLER_DETAILS: `call.id-caller.add-caller`,
	ADD_CALLER_DETAILS_CANCEL_CLICK: `call.id-caller.add-caller.cancel`,
	ADD_CALLER_DETAILS_CONFIRM_CLICK: `call.id-caller.add-caller.confirm`,

	// Verify Caller
	VERIFY_CALLER: `call.verify-caller`,
	VERIFY_CALLER_SQ_CLICK: `call.verify-caller.security-questions`,
	VERIFY_CALLER_SKIP_CLICK: `call.verify-caller.skip-ita`,
	VERIFY_CALLER_TRY_AGAIN: `call.verify-caller.try-again-ita`,

	// Verify Caller by Security Question
	VERIFY_CALLER_XDS: `call.verify-caller.xds`,
	XDS_SKIP: `call.verify-caller.xds.skip-verification`,
	XDS_CANCEL: `call.verify-caller.xds.cancel`,
	XDS_NEXT_QUESTION: `call.verify-caller.xds.next`,
	XDS_VERIFY_ANSWERS: `call.verify-caller.xds.verify`,
	XDS_TRY_AGAIN: `call.verify-caller.xds.try-again`,
	XDS_VERIFY_VIA_APP: `call.verify-caller.xds.verify-via-app`
};

/** The screens on which telemetry events are logged.
 * This correspond to the "screen" column in the Data Spec.
 * @readonly
 * @enum {String} TelemetryScreen
 * @enum {String} TelemetryScreen
 */
 export const TelemetryScreen = {
	WAIT_FOR_CALL: `Waiting For Call`,
	CONFIRM_CALLER: `Confirm Caller`,
	SEARCH_CLIENT: `Search Client`,
	ADD_CALLER_DETAILS: `Add Caller Details`,

	VERIFY_CALLER: `Verify Caller`,
	SECURITY_QUESTIONS: `Security Questions`,
	SECURITY_QUESTIONS_FAILURE: `Security Questions First Time Failure`,
	XDS_FAILED: `XDS Verification Failed`,
	ITA_FAILED: `ITA Verification Failed`,

	STOP_CARD: `Stop Card`,
	STOP_CARD_OUTCOME: `Stop Card Outcome`,

	FAVOURITES: `Favourite Transactions`,

	DEBICHECK: `DebiCheck Mandates`,
	VIEWINFO: `DebiCheck View Info`,
	DECLINE_DEBICHECK: `Decline Debi Check`,
	DEBICHECK_OUTCOME: `DebiCheck Outcome`,

	UPDATE_CARD_LIMITS: `Update Card Limits`,

	TAP_TO_PAY: `Tap to Pay`,
	STATEMENTS: `Statements`,
	STATEMENTS_OUTCOME: `Statements Outcome`,
	TAX_CERTIFICATE: `Tax Certificate`,
	PROOF_OF_ACCOUNT: `Proof of Account`,

	SEARCH_OTHER_NEED: `Search Other Need`,
	FEEDBACK: `Feedback`,
	
	ASSIGN_STOP_CARD: `Assign stop card`,
	END_CALL: `End Call Session`,
	
	PRODUCT_INFO: `Product Info`
};