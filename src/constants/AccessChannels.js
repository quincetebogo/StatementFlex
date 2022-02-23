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
 * Channels type, used to dynamically get telemetry events
 * 
 * @readonly
 * @enum {Object} CHANNEL_TYPE
 * 
 */
 export const CHANNEL_TYPE = Object.freeze({
	[ACCESS_CHANNELS_TYPE.APP]: `APP`,
	[ACCESS_CHANNELS_TYPE.INTERNET_BANKING]: `INTERNET_BANKING`,
	[ACCESS_CHANNELS_TYPE.USSD]: `USSD`,
	[ACCESS_CHANNELS_TYPE.NOTIFICATIONS]: `NOTIFICATIONS`
});

/**
 * Access channels App status
 * 
 * @readonly
 * @enum {Object} APP_STATUS
 * 
 */
 export const APP_STATUS = Object.freeze({
	ACTIVE: `Active`,
	SUSPENDED: `Suspended`
});

/**
 * Access channels reasons
 * 
 * @readonly
 * @enum {Object} ACCESS_CHANNELS_REASONS
 * 
 */
export const ACCESS_CHANNELS_REASONS = Object.freeze({
	DEFAULT: `Unspecified`
});