/**
 * The event names to use when logging end call telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} EndCallEvents
 */
 export const EndCallEvents = {
	END_CALL: `call.end-call`,
	END_CALL_CONFIRM: `call.end-call.confirm`,
	END_CALL_CANCEL: `call.end-call.cancel`
 };