/**
 * The event names to use when logging verify caller telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} VerifyCallerEvents
 */
 export const VerifyCallerEvents = {
	// Verify Caller
	VERIFY_CALLER: `call.verify-caller`,

	// Verify Caller by ITA
	VERIFY_CALLER_ITA: `call.verify-caller.ita`,
	ITA_REQUEST_SENT: `call.verify-caller.ita.requested`,
	ITA_SQ_CLICK: `call.verify-caller.ita.security-questions`,
	ITA_SKIP_CLICK: `call.verify-caller.ita.skip-verification`,
	ITA_TRY_AGAIN: `call.verify-caller.ita.try-again`,
	ITA_SUCCESS: `call.verify-caller.ita.success`,
	ITA_FAILED: `call.verify-caller.ita.failed`,
	ITA_TIMEDOUT: `call.verify-caller.ita.timeout`,
	ITA_END_CALL: `call.verify-caller.ita.end-call`,
	ITA_CANCEL_CLICK: `call.verify-caller.ita.cancel`,

	// Verify Caller by Security Question
	VERIFY_CALLER_XDS: `call.verify-caller.xds`,
	XDS_SKIP: `call.verify-caller.xds.skip-verification`,
	XDS_CANCEL: `call.verify-caller.xds.cancel`,
	XDS_NEXT_QUESTION: `call.verify-caller.xds.next`,
	XDS_VERIFY_ANSWERS: `call.verify-caller.xds.verify`,
	XDS_TRY_AGAIN: `call.verify-caller.xds.try-again`,
	XDS_VERIFY_VIA_APP: `call.verify-caller.xds.verify-via-app`,
	XDS_SUCCESS: `call.verify-caller.xds.success`,
	XDS_FAILED: `call.verify-caller.xds.failed`,
	XDS_FIRST_FAILURE_ATTEMPT: `call.verify-caller.xds.failed.first-attempt`,
	XDS_END_CALL: `call.verify-caller.xds.end-call`,

	// ITA failed 
	ITA_VERIFICATION_FAILED: `call.ita-failed`,
	ITA_VERIFICATION_FAILED_CONTINUE_UNVERIFIED: `call.ita-failed.continue-unverified`,
	ITA_VERIFICATION_FAILED_END_CALL: `call.ita-failed.end-call`,

	//XDS failed
	XDS_VERIFICATION_FAILED: `call.xds-failed`,
	XDS_VERIFICATION_FAILED_CONTINUE_UNVERIFIED: `call.xds-failed.continue-unverified`,
	XDS_VERIFICATION_FAILED_VERIFY_VIA_APP: `call.xds-failed.verify-via-app-ussd`,
	XDS_VERIFICATION_FAILED_END_CALL: `call.xds-failed.end-call`
 };