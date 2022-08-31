/**
 * Incident manager need status constants.
 * This depicts the current status of primary or secondary incident
 * 
 * @readonly
 * @enum {object} HORIZON_NEED_STATUS
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
 * TODO: Refactor to get from actual end call reasons 
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
 * End call reason resolutions.
 * 
 * @readonly
 * @enum {object} REASON_RESOLUTIONS
 */
export const REASON_RESOLUTIONS = {
	'NeedFulfilled': `Need Fulfilled`,
	'NeedIncomplete': `Need incomplete - Transaction Failed`,
	'ClientAssigned': `Need assigned`
};

/**
 * Mapping cause code based on end call reason selected.
 * 
 * @readonly
 * @enum {object} CAUSE_CODE_BY_REASON
 */
export const CAUSE_CODE_BY_REASON = {
	'Abandoned Verification': `ClientFailedSecurityCheck`,
	'Client failed verification': `ClientFailedSecurityCheck`,
	'Follow up required': `FollowUpCall`,
	'Need incomplete - Transaction Failed': `TransactionFailed`,
	'Call transferred': {
		'Fraud Engagement Transfer': `FraudTransfer`
	}
};