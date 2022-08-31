/**
 * The event names to use when logging identify caller telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} IDCallerEvents
 */
 export const IDCallerEvents = {
	// Identify Caller
	IDENTIFY_CALLER: `call.id-caller`,

	// Confirm Caller
	CONFIRM_CALLER: `call.id-caller.confirm-caller`,
	CONFIRM_CALLER_CONFIRM_CLICK: `call.id-caller.confirm-caller.confirm`,
	CONFIRM_CALLER_SEARCH_CLICK: `call.id-caller.confirm-caller.search-client`,
	CONFIRM_CALLER_ADD_CALLER_CLICK: `call.id-caller.confirm-caller.add-caller-details`,
	CONFIRM_CALLER_END_CALL_CLICK: `call.id-caller.confirm-caller.end-call`,
	
	// Search Caller
	SEARCH_CLIENT: `call.id-caller.search-client`,
	SEARCH_CLIENT_SEARCH_CLICK: `call.id-caller.search-client.search`,
	SEARCH_CLIENT_CONTINUE_CLICK: `call.id-caller.search-client.continue`,
	SEARCH_CLIENT_END_CALL_CLICK: `call.id-caller.search-client.end-call`,

	// Add caller details
	ADD_CALLER: `call.id-caller.add-caller`,
	ADD_CALLER_CANCEL_CLICK: `call.id-caller.add-caller.cancel`,
	ADD_CALLER_CONFIRM_CLICK: `call.id-caller.add-caller.confirm`,
	ADD_CALLER_END_CALL_CLICK: `call.id-caller.add-caller.end-call`
 };