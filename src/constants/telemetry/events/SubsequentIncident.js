/**
 * The event names to use when logging telemetry events on creating subsequent incident.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {String} SubsequentNeedEvents
 */
 export const SubsequentNeedEvents = {
	SUBSEQUENT_INCIDENT: `call.fulfill-need.subsequent-incident.created`
 };