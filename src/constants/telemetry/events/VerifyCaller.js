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
	ITA_SERVICE_FAILURE: `call.verify-caller.ita.service-failure`,
	SECURITY_QUESTIONS_CLICK: `call.verify-caller.security-questions`,
	ITA_SKIP_CLICK: `call.verify-caller.ita.skip-verification`,
	ITA_TRY_AGAIN: `call.verify-caller.ita.try-again`,
	ITA_END_CALL: `call.verify-caller.ita.end-call`,
	ITA_OUTCOME: `call.verify-caller.ita.outcome`,
	ITA_TIMEDOUT: `call.verify-caller.ita.timeout`,
	ITA_CANCEL_CLICK: `call.verify-caller.ita.cancel`,

	// Verify Caller by Security Questions - XDS
	VERIFY_CALLER_XDS: `call.verify-caller.xds`,
	XDS_SKIP: `call.verify-caller.xds.skip-verification`,
	XDS_CANCEL: `call.verify-caller.xds.cancel`,
	XDS_NEXT_QUESTION: `call.verify-caller.xds.next`,
	XDS_VERIFY_ANSWERS: `call.verify-caller.xds.verify`,
	XDS_VERIFY_VIA_APP: `call.verify-caller.xds.verify-via-app`,
	XDS_SUCCESS: `call.verify-caller.xds.success`,
	XDS_FAILED: `call.verify-caller.xds.failed`,
	XDS_END_CALL: `call.verify-caller.xds.end-call`,
	XDS_SERVICE_FAILURE: `call.verify-caller.xds.service-failure`,

	// ITA failed 
	ITA_VERIFICATION_FAILED: `call.ita-failed`,
	ITA_VERIFICATION_FAILED_CONTINUE_UNVERIFIED: `call.ita-failed.continue-unverified`,

	// XDS failed
	XDS_VERIFICATION_FAILED: `call.xds-failed`,
	XDS_VERIFICATION_FAILED_CONTINUE_UNVERIFIED: `call.xds-failed.continue-unverified`,
	XDS_VERIFICATION_FAILED_VERIFY_VIA_APP: `call.xds-failed.verify-via-app-ussd`,

	// Verify Caller by Security Questions - KBA
	KBA: `call.verify-caller.kba`,
	KBA_SKIP: `call.verify-caller.kba.skip-verification`,
	KBA_CANCEL: `call.verify-caller.kba.cancel`,
	KBA_END_CALL: `call.verify-caller.kba.end-call`,
	KBA_VERIFY: `call.verify-caller.kba.verify`,
	KBA_OUTCOME: `call.verify-caller.kba.outcome`,

	// KBA failed
	KBA_VERIFICATION_FAILED: `call.kba-failed`,
	KBA_VERIFICATION_FAILED_CONTINUE_UNVERIFIED: `call.kba-failed.continue-unverified`,
	KBA_VERIFICATION_FAILED_VERIFY_VIA_APP: `call.kba-failed.verify-via-app-ussd`
 };