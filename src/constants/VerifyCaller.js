/**
 * Authorisation request status {@link VerifyCaller}
 * 
 * @readonly
 * @enum {Object} AUTH_STATUS
 */
 export const AUTH_STATUS = Object.freeze({
	APPROVED: 0,
	DECLINED: 1,
	PENDING: 2,
	FAILED: 3,
	NO_CONTACT: 4
});

/**
 * Authorisation request channel status {@link VerifyCaller}
 * 
 * @readonly
 * @enum {Object} AUTH_STATUS
 */
 export const AUTH_CHANNEL_STATUS = Object.freeze({
	APPROVED: `APPROVED`,
	DECLINED: `DECLINED`,
	SIM_SWAPPED: `SIM_SWAPPED`,
	NOT_DELIVERED: `NOT_DELIVERED`,
	TIMEOUT: `TIMEOUT`,
	SYSTEM_FAILURE: `SYSTEM_FAILURE`,
	AUTHENTICATION_FAILURE: `AUTHENTICATION_FAILURE`,
	CANCELLED: `CANCELLED`,
	PENDING: `PENDING`
});