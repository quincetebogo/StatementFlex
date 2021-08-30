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

	FAVOURITES: `Favourite Transactions`,

	DEBICHECK: `DebiCheck Mandates`,
	VIEWINFO: `DebiCheck View Info`,
	DECLINE_DEBICHECK: `Decline Debi Check`,
	DEBICHECK_OUTCOME: `DebiCheck Outcome`,

	UPDATE_CARD_LIMITS: `Update Card Limits`,

	TAP_TO_PAY: `Tap to Pay`,
	TAP_TO_PAY_AGREEMENT: `Tap to Pay Agreement`,
	TAP_TO_PAY_OUTCOME: `Tap to Pay Outcome`,

	STATEMENTS: `Statements`,
	STATEMENTS_OUTCOME: `Statements Outcome`,
	TAX_CERTIFICATE: `Tax Certificate`,
	PROOF_OF_ACCOUNT: `Proof of Account`,
	PROOF_OF_ACCOUNT_OUTCOME: `Proof of Account`,

	SEARCH_OTHER_NEED: `Search Other Need`,
	FEEDBACK: `Feedback`,
	
	ASSIGN_STOP_CARD: `Assign stop card`,
	END_CALL: `End Call Session`,
	
    PRODUCT_INFO: `Product Info`,

    CARD_LIMITS_LANDING: `Card limits`,
    DISCARD_CHANGES: `Discard changes`,
    LIMITS_AGREEMENT: `Update Limits Agreement`,
    UPDATE_LIMITS_OUTCOME: `Update limits outcome`,

	VALUE_ADDED_SERVICES: `Value Added Services`,
	VALUE_ADDED_SERVICES_UNAVAILABLE: `Value Added Services Unavailable`,
	VALUE_ADDED_SERVICES_NO_CLIENT_DATA : `Value Added Services No Client Data`,

	LIVE_BETTER_BENEFITS: `Live Better Benefits`,
	LIVE_BETTER_BENEFITS_UNAVAILABLE: `Live Better Benefits Unavailable`

};