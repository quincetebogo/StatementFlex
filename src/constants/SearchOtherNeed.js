/**
 * Feedback options object constant. Used to get feeback from user over an action.
 * Values in this object should align with EndCallReasons constant, since we do populate
 * default value in end call dialog based on this feedback at specific cases.
 * 
 * @readonly
 * @enum {Object} FEEDBACK_OPTIONS
 */
export const FEEDBACK_OPTIONS = [
	{
		key: 0,
		value: `Need fulfilled`
	},
	{
		key: 2,
		value: `Need was assigned/handed off`
	},
	{
		key: 1,
		value: `Need incomplete`
	}
];