/**
 * The event names to use when logging access menu bar telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} AccessMenuBarEvents
 */
 export const AccessMenuBarEvents = {

	// Value Added Services
	VALUE_ADDED_SERVICES: `call.fulfill-need.value-added-services`,
	VALUE_ADDED_SERVICES_UNAVAILABLE: `call.fulfill-need.value-added-services-unavailable`,
	VALUE_ADDED_SERVICES_NO_CLIENT_DATA: `call.fulfill-need.value-added-services-no-client-data`,

	// Value Added Services - Available
	VALUE_ADDED_SERVICES_ACCEPTED: `call.fulfill-need.value-added-services.accepted`,
	VALUE_ADDED_SERVICES_CANCEL: `call.fulfill-need.value-added-services.cancel`,

	// Value Added Services - No Client Data
	VALUE_ADDED_SERVICES_NO_CLIENT_DATA_ACCEPTED: `call.fulfill-need.value-added-services-no-client-data.accepted`,

	// Value Added Services - Unavailable
	VALUE_ADDED_SERVICES_UNAVAILABLE_ACCEPTED: `call.fulfill-need.value-added-services-unavailable.accepted`
 };

 /**
 * The event names to use when logging access menu bar telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 * 
 * @readonly
 * @enum {Object} NBAEvents
 */
  export const NBAEvents = {

	// Insights (NBA)
	LOAD: `call.fulfill-need.insights.info`,
	ACTION: `call.fulfill-need.insights.action`
 };