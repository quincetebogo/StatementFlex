import { ORG_UNITS } from "app/constants/Common";

const COMMON_RESOLUTIONS = {
	'NeedFulfilled': `Need Fulfilled`,
	'NeedIncomplete': `Need incomplete - Transaction Failed`,
	'ClientAssigned': `Need assigned`
};

/**
 * @typedef {string} IncidentState
 */

/**
 * Incident state constants.
 * This depicts the current state of a primary or secondary incident
 * 
 * @readonly
 * @enum {IncidentState}
 */
export const HORIZON_NEED_STATUS = {
	INPROGRESS: `InProgress`,
	COMPLETED: `Completed`,
	ASSIGNED: `Assigned`,
	FAILED: `Failed`,
	NOT_STARTED: `Not Started`,
	CLOSED: `Closed`
};

/**
 * End call reasons.
 * Refactor to get from actual end call reasons 
 * 
 * @readonly
 * @enum {object} CLOSE_REASONS
 */
export const CLOSE_REASONS = {
	'Completed': `NeedFulfilled`,
	'Failed': `NeedIncomplete`,
	'Assigned': `ClientAssigned`
};

/**
 * End call reason resolutions structured by agent roles.
 * 
 * @readonly
 * @enum {object} REASON_RESOLUTIONS
 */
export const REASON_RESOLUTIONS = {
	[ORG_UNITS.CAPITEC_CONNECT]: {
		'NeedFulfilled': `Query closed`,
		'NeedIncomplete': `Abandoned request`,
		'ClientAssigned': `Query resolved`
	},
	[ORG_UNITS.CLIENT_CARE]: COMMON_RESOLUTIONS,
	[ORG_UNITS.HELPDESK]: COMMON_RESOLUTIONS
};

/**
 * Mapping cause code based on end call reason selected.
 * 
 * @readonly
 * @enum {object} CAUSE_CODE_BY_REASON
 */
const CAUSE_CODE_BY_REASON = {
	'Abandoned Verification': `ClientFailedSecurityCheck`,
	'Client failed verification': `ClientFailedSecurityCheck`,
	'Follow up required': `FollowUpCall`,
	'Need incomplete - Transaction Failed': `TransactionFailed`,
	'Call transferred': {
		'Fraud Engagement Transfer': `FraudTransfer`
	}
};

/**
 * Mapping cause code based on agent role.
 * 
 * @readonly
 * @enum {object} CAUSE_CODE_BY_ROLE
 */
export const CAUSE_CODE_BY_ROLE = {
	[ORG_UNITS.CAPITEC_CONNECT]: {
		'Abandoned request': `Abandonedrequest`,
		'Client failed verification': `ClientFailedVerification`,
		'External factor': `ExternalFactor`,
		'Query closed': `QueryClosed`,
		'Query escalation': `QueryEscalation`,
		'Query resolved': `QueryResolved`,
		'Need fulfilled': `QueryClosed`,
		'Need was assigned/handed off': `QueryEscalation`,
		'Need incomplete': `Abandonedrequest`
	},
	[ORG_UNITS.HELPDESK]: CAUSE_CODE_BY_REASON,
	[ORG_UNITS.CLIENT_CARE]: CAUSE_CODE_BY_REASON
};