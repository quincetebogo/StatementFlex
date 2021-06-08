/**
 * The event names to use when logging accept call telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} AcceptCallEvents
 */
 export const AcceptCallEvents = {
	INCOMING_CALL: `call`,
	INCIDENT_CREATED: `call.incident-created`
 };