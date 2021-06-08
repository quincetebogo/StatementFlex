/**
 * The screens on which telemetry events are logged.
 * This correspond to the "screen" column in the Data Spec.
 * 
 * @readonly
 * @enum {String} TelemetryScreen
 */
 export const TelemetryScreen = {
	WAIT_FOR_CALL: `Waiting For Call`,
	CONFIRM_CALLER: `Confirm Caller`,
	SEARCH_CLIENT: `Search Client`,
	ADD_CALLER_DETAILS: `Add Caller Details`,

	VERIFY_CALLER: `Verify Caller`,
	SECURITY_QUESTIONS: `Security Questions`,
	SECURITY_QUESTIONS_FAILURE: `Security Queations Failure`,
	XDS_FAILED: `XDS Verification Failed`,
	ITA_FAILED: `ITA Verification Failed`,

	STOP_CARD: `Stop Card`,
	STOP_CARD_OUTCOME: `Stop Card Outcome`,
	STOP_CARD_SUCCESS: `Stop Card Success`,
	STOP_CARD_FAILURE: `Stop Card Failure`,

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