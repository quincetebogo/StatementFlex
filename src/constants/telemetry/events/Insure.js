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
	CLIENT_POLICIES_GET_ESTIMATE: `call.fulfill-need.insure.client-policies.get-estimate`,
	CLIENT_POLICIES_LODGE_CLAIM_INFO: `call.fulfill-need.insure.client-policies.lodge-claim-info`,
	CLIENT_POLICIES_POLICY_DETAILS: `call.fulfill-need.insure.client-policies.policy-details`,
	CLIENT_POLICIES_CLAIM_DETAILS: `call.fulfill-need.insure.client-policies.claim-details`,
	CLIENT_POLICIES_UPDATE_PLAN: `call.fulfill-need.insure.client-policies.update-plan`,
	CLIENT_POLICIES_PAY_POLICY: `call.fulfill-need.insure.client-policies.pay-policy`,
	CLIENT_POLICIES_CANCEL_POLICY: `call.fulfill-need.insure.client-policies.cancel-policy`,
	CLIENT_POLICIES_TRANSACTION_HISTORY: `call.fulfill-need.insure.client-policies.transaction-history`,
	CLIENT_POLICIES_REINSTATE_PLAN: `call.fulfill-need.insure.client-policies.reinstate-plan`,
	CLIENT_POLICIES_SMS_HISTORY: `call.fulfill-need.insure.client-policies.sms-history`
};

/**
* @readonly
* @enum {String} PolicyEstimateEvents
*/
export const PolicyEstimateEvents = {
	ESTIMATE: `call.fulfill-need.insure.estimate`,
	ESTIMATE_CALCULATE: `call.fulfill-need.insure.estimate.calculate`,
	ESTIMATE_PRINT: `call.fulfill-need.insure.estimate.print`,
	ESTIMATE_ADD_LIFE_DIALOG: `call.fulfill-need.insure.estimate.add-life-dialog`,
	ESTIMATE_REMOVE_LIFE: `call.fulfill-need.insure.estimate.remove-life`
};

/**
* @readonly
* @enum {String} PolicySummaryEvents
*/
export const PolicySummaryEvents = {
	POLICY_SUMMARY: `call.fulfill-need.insure.policy-summary`,
	POLICY_SUMMARY_BACK: `call.fulfill-need.insure.policy-summary.back`
};

/**
* @readonly
* @enum {String} LodgeClaimEvents
*/
export const LodgeClaimEvents = {
	LODGE_CLAIM_INFO: `call.fulfill-need.insure.lodge-claim-info`,
	LODGE_CLAIM_INFO_CLAIM_SUMMARY: `call.fulfill-need.insure.lodge-claim-info.claim-summary`
};

/**
* @readonly
* @enum {String} PolicySummaryEvents
*/
export const ClaimSummaryEvents = {
	CLAIM_SUMMARY: `call.fulfill-need.insure.policy-summary`,
	CLAIM_SUMMARY_BACK: `call.fulfill-need.insure.policy-summary.back`
};

/**
* @readonly
* @enum {String} CancelPolicyEvents
*/
export const CancelPolicyEvents = {
	CANCEL_POLICY: `call.fulfill-need.insure.cancel-policy`,
	CANCEL_POLICY_AGREE: `call.fulfill-need.insure.cancel-policy.agree`,
	CANCEL_POLICY_CLOSE: `call.fulfill-need.insure.cancel-policy.close`
};

/**
* @readonly
* @enum {String} SMSHistoryEvents
*/
export const SMSHistoryEvents = {
	SMS_HISTORY: `call.fulfill-need.insure.sms-history`,
	SMS_HISTORY_BACK: `call.fulfill-need.insure.sms-history.back`
};

/**
* @readonly
* @enum {String} TransactionHistoryEvents
*/
export const TransactionHistoryEvents = {
	TRANSACTION_HISTORY: `call.fulfill-need.insure.transaction-history`,
	TRANSACTION_HISTORY_BACK: `call.fulfill-need.insure.transaction-history.back`
};

/**
* @readonly
* @enum {String} UpdatePlanEvents
*/
export const UpdatePlanEvents = {
	UPDATE_PLAN: `call.fulfill-need.insure.update-plan`,
	UPDATE_PLAN_CALCULATE: `call.fulfill-need.insure.update-plan.calculate`,
	UPDATE_PLAN_UPDATE: `call.fulfill-need.insure.update-plan.update`,
	UPDATE_PLAN_DISCLOSURE_FCP: `call.fulfill-need.insure.update-plan.disclosure-fcp`,
	UPDATE_PLAN_DISCLOSURE_YBP: `call.fulfill-need.insure.update-plan.disclosure-ybp`,
	UPDATE_PLAN_DISCLOSURE_YROA: `call.fulfill-need.insure.update-plan.disclosure-yroa`
};

/**
* @readonly
* @enum {String} PayArrearsEvents
*/
export const PayArrearsEvents = {
	PAY_ARREARS: `call.fulfill-need.insure.pay-arrears`,
	PAY_ARREARS_PAY: `call.fulfill-need.insure.pay-arrears.pay`,
	PAY_ARREARS_CANCEL: `call.fulfill-need.insure.pay-arrears.cancel`
};

/**
* @readonly
* @enum {String} EmailPlanEvents
*/
export const EmailPlanEvents = {
	SEND_EMAIL: `call.fulfill-need.insure.send-email`,
	SEND_EMAIL_SEND: `call.fulfill-need.insure.send-email.send`,
	SEND_EMAIL_CANCEL: `call.fulfill-need.insure.send-email.cancel`
};