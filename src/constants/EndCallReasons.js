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
	
	NEED_FULFILLED: NEED_FULFILLED,
	NEED_INCOMPLETE: NEED_INCOMPLETE,
	NEED_ASSIGNED: NEED_ASSIGNED,
	NEED_HANDED_OFF: NEED_HANDED_OFF,
	FAILED_VERIFICATION: FAILED_VERIFICATION,
	FOLLOW_UP: FOLLOW_UP,
	LANGUAGE_TRANSFER: LANGUAGE_TRANSFER,
	BALANCE_ENQUIRY: BALANCE_ENQUIRY,
	CALL_TRANSFERED: CALL_TRANSFERED,
	PRODUCT_ENQUIRY: PRODUCT_ENQUIRY,

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