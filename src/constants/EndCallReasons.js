/**
 * The end call reasons for end call dialog.
 * 
 * @readonly
 * @enum {String} EndCallReasons
 */
export const END_CALL_REASONS = [
	{
		key: 0,
		value: `Need fulfilled`,
		mapping: ``
	},
	{
		key: 2,
		value: `Need assigned`,
		mapping: ``
	},
	{
		key: 3,
		value: `Need handed off`,
		mapping: ``
	},
	{
		key: 6,
		value: `Language transfer`,
		mapping: `telephony-disconnected`
	},
	{
		key: 8,
		value: `Call transferred`,
		mapping: `telephony-disconnected`
	},
	{
		key: 1,
		value: `Need incomplete - bad connection`,
		mapping: `telephony-bad-connection`
	},
	{
		key: 7,
		value: `Balance enquiry`,
		mapping: `savings-account-balance`
	},
	{
		key: 9,
		value: `Product enquiry`,
		mapping: ``
	},
	{
		key: 4,
		value: `Client failed verification`,
		mapping: ``
	},
	{
		key: 5,
		value: `Follow up required`,
		mapping: ``
	}
];