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

/**
 * Preferred meesage time to display in Notifications tile
 * 
 * @readonly
 * @enum {Object} PREFERRED_MSG_TIME
 */
export const PREFERRED_MSG_TIME = Object.freeze({
	'any': `Anytime`,
	'5am-10pm': `5am-10pm`,
	'7am-6pm': `7am-6pm`
});

/**
 * This function parses html string to DOM
 * 
 * @param {string} htmlString - HTML in string
 * @returns {string} DOM
 */
export const parseHTMLtoDOM = (htmlString) => {
	const htmlParser = new DOMParser();
	const parsedString = htmlParser.parseFromString(htmlString, `text/html`);

	return parsedString.body.innerHTML;
};