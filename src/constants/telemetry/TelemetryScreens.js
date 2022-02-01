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
	SECURITY_QUESTIONS_FAILURE: `Security Questions Failure`,
	XDS_FAILED: `XDS Verification Failed`,
	ITA_FAILED: `ITA Verification Failed`,

	STOP_CARD: `Stop Card`,
	STOP_CARD_OUTCOME: `Stop Card Outcome`,

	FAVOURITES: `Favourite Transactions`,

	DEBICHECK: `DebiCheck Mandates`,
	VIEWINFO: `DebiCheck View Info`,
	DECLINE_DEBICHECK: `Decline Debi Check`,
	APPROVE_DEBICHECK: `Approve Debi Check`,
	DEBICHECK_OUTCOME: `DebiCheck Outcome`,

	UPDATE_CARD_LIMITS: `Update Card Limits`,

	TAP_TO_PAY: `Tap to Pay`,
	TAP_TO_PAY_AGREEMENT: `Tap to Pay Agreement`,
	TAP_TO_PAY_OUTCOME: `Tap to Pay Outcome`,

	STATEMENTS: `Statements`,
	STATEMENTS_OUTCOME: `Statements Outcome`,
	TAX_CERTIFICATE: `Tax Certificate`,
	TAX_CERTIFICATE_DOCUMENT: `Tax Certificate Document`,
	TAX_CERTIFICATE_OUTCOME: `Tax Certificate Outcome`,
	PROOF_OF_ACCOUNT: `Proof of Account`,
	PROOF_OF_ACCOUNT_OUTCOME: `Proof of Account Outcome`,

	SEARCH_OTHER_NEED: `Search Other Need`,
	FEEDBACK: `Feedback`,
	
	ASSIGN_STOP_CARD: `Assign Stop Card`,
	END_CALL: `End Call Session`,
	
    PRODUCT_INFO: `Product Info`,

    CARD_LIMITS_LANDING: `Card limits`,
    DISCARD_CHANGES: `Discard Changes`,
    LIMITS_AGREEMENT: `Update Limits Agreement`,
    UPDATE_LIMITS_OUTCOME: `Update Limits Outcome`,

	VALUE_ADDED_SERVICES: `Value Added Services`,
	VALUE_ADDED_SERVICES_UNAVAILABLE: `Value Added Services Unavailable`,
	VALUE_ADDED_SERVICES_NO_CLIENT_DATA: `Value Added Services No Client Data`,

	SAVINGS_ACCOUNT: `Savings Account`,
	TRANSACTION_HISTORY: `Transaction History`,

	LIVE_BETTER_LANDING_PAGE: `Live Better verified landing page`,
	LIVE_BETTER_ACCOUNT_DETAILS: `Live Better Account details`,
	LIVE_BETTER_TRANSACTION_HISTORY: `Live Better Transaction History`,
	LIVE_BETTER_SATEMENTS: `Live Better Statements`,
	LIVE_BETTER_AUTOMATIC_SAVINGS: `Live Better Automatic savings`,
	LIVE_BETTER_LINKED_TRANSACTIONS: `Live Better Linked Transactions`,

	LIVE_BETTER_BENEFITS: `Live Better Benefits`,
	LIVE_BETTER_BENEFITS_UNAVAILABLE: `Live Better Benefits Unavailable`,

	LIVE_BETTER_AUTOMATIC_SAVINGS_SUCCESS: `Live Better Automatic savings success`,
	LIVE_BETTER_AUTOMATIC_SAVINGS_FAILURE: `Live Better Automatic savings failure`,

	CREDIT_LANDING: `Credit Landing`,
	CREDIT_ACCOUNT_DETAILS: `Credit Account details`,
	CREDIT_TRANSACTION_HISTORY: `Credit Transaction History`,
	CREDIT_STATEMENTS: `Credit Statements`,
	CREDIT_SETTLEMENT_QUOTE: `Credit Settlement Quote`,
	CREDIT_SETTLE_CLOSE: `Credit Settle Close`,
	CREDIT_STATEMENTS_SUCCESS: `Credit Statement success`,
	CREDIT_STATEMENTS_FAILURE: `Credit Statement failure`
};