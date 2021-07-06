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
			key: 1,
			value: `Need assigned`,
			mapping: ``
		},
		{
			key: 2,
			value: `Need handed off`,
			mapping: ``
		},
		{
			key: 3,
			value: `Language transfer`,
			mapping: `telephony-disconnected`
		},
		{
			key: 4,
			value: `Call transferred`,
			mapping: `telephony-disconnected`
		},
		{
			key: 5,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-bad-connection`
		},
		{
			key: 6,
			value: `Balance enquiry`,
			mapping: `savings-account-balance` || `credit-card-balance`
		},
		{
			key: 7,
			value: `Product enquiry`,
			mapping: ``
		},
		{
			key: 8,
			value: `Client failed verification`,
			mapping: ``
		},
		{
			key: 9,
			value: `Follow up required`,
			mapping: ``
		}
	];