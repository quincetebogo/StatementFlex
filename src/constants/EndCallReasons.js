/**
 * The end call reasons for end call dialog.
 * 
 * @readonly
 * @enum {String} EndCallReasons
 */

 const NEED_FULFILLED = 0;
 const NEED_INCOMPLETE = 1;
 const NEED_ASSIGNED = 2; 
 const NEED_HANDED_OFF = 3;
 const FAILED_VERIFICATION = 4;
 const FOLLOW_UP = 5;
 const LANGUAGE_TRANSFER = 6;
 const BALANCE_ENQUIRY = 7;
 const CALL_TRANSFERED = 8;
 const PRODUCT_ENQUIRY = 9;

export const END_CALL_REASON = Object.freeze({
	NEED_FULFILLED: 0,
	NEED_INCOMPLETE: 1,
	NEED_ASSIGNED: 2,
	NEED_HANDED_OFF: 3,
	FAILED_VERIFICATION: 4,
	FOLLOW_UP: 5,
	LANGUAGE_TRANSFER: 6,
	BALANCE_ENQUIRY: 7,
	CALL_TRANSFERED: 8,
	PRODUCT_ENQUIRY: 9,

	table: [
		{
			key: NEED_FULFILLED,
			value: `Need fulfilled`,
			mapping: ``
		},
		{
			key: NEED_ASSIGNED,
			value: `Need assigned`,
			mapping: ``
		},
		{
			key: NEED_HANDED_OFF,
			value: `Need handed off`,
			mapping: ``
		},
		{
			key: LANGUAGE_TRANSFER,
			value: `Language transfer`,
			mapping: `telephony-disconnected`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `telephony-disconnected`
		},
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-bad-connection`
		},
		{
			key: BALANCE_ENQUIRY,
			value: `Balance enquiry`,
			mapping: `savings-account-balance`
		},
		{
			key: PRODUCT_ENQUIRY,
			value: `Product enquiry`,
			mapping: ``
		},
		{
			key: FAILED_VERIFICATION,
			value: `Client failed verification`,
			mapping: ``
		},
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	]
});