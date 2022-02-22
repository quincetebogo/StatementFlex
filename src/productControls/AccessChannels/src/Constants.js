/**
 * Access channels type
 * 
 * @readonly
 * @enum {Object} ACCESS_CHANNELS_TYPE
 * 
 */
export const ACCESS_CHANNELS_TYPE = Object.freeze({
	APP: `app`,
	INTERNET_BANKING: `internetBanking`,
	USSD: `ussd`,
	NOTIFICATIONS: `notification`
});

/**
 * Access channels status
 * 
 * @readonly
 * @enum {Object} ACCESS_CHANNEL_STATUS
 * 
 */
export const ACCESS_CHANNEL_STATUS = Object.freeze({
	ACTIVE: `Active`,
	SUSPENDED: `Suspended`,
	UNAVAILABLE: `Service Unavailable`,
	BLOCKED: `Blocked`,
	INACTIVE: `Inactive`,
	NOTREGISTERED: `Not Registered`
});