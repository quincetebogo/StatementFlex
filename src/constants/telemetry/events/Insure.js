/**
 * The event names to use when logging Insure telemetry events.
 * This correspond to the `Action` and `eventName` columns in the Data Spec.
 */

/**
* @readonly
* @enum {String} ClientPoliciesEvents
*/
export const ClientPoliciesEvents = {
	CLIENT_POLICIES: `call.fulfill-need.insure.client-policies`,
	CLIENT_POLICIES_GET_ESTIMATE: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_LODGE_CLAIM_INFO: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_POLICY_DETAILS: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_CLAIM_DETAILS: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_UPDATE_PLAN: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_PAY_POLICY: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_CANCEL_POLICY: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_TRANSACTION_HISTORY: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_AUDIT_TRANSACTION_HISTORY: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_REINSTATE_PLAN: `call.fulfill-need.insure.client-policies?`,
	CLIENT_POLICIES_SMS_HISTORY: `call.fulfill-need.insure.client-policies?`
};


/**
* @readonly
* @enum {String} PolicyEstimateEvents
*/
export const PolicyEstimateEvents = {
	ESTIMATE: `call.fulfill-need.insure.estimate`,
	ESTIMATE_CALCULATE: `call.fulfill-need.insure.estimate`,
	ESTIMATE_PRINT: `call.fulfill-need.insure.estimate`,
	ESTIMATE_ADD_LIFE_DIALOG: `call.fulfill-need.insure.estimate`,
	ESTIMATE_REMOVE_LIVE: `call.fulfill-need.insure.estimate`
};