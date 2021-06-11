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
	XDS_END_CALL: `call.verify-caller.xds.end-call`,
 };