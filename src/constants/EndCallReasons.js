/**
 * The end call reasons for end call dialog.
 * 
 * @readonly
 * @enum {Object} END_CALL_REASON
 * 
 * End call mapping refer from Confluience https://confluence.capitecbank.co.za:8443/display/HOR/Quick+Transactions%3A+STrack+Field+Mapping 
 * and https://confluence.capitecbank.co.za:8443/pages/viewpage.action?pageId=583797367
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
 const ABANDONED_VERIFICATION = 10;

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

	ConfirmClient: [
		{
			key: LANGUAGE_TRANSFER,
			value: `Language transfer`,
			mapping: `language-transfer`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: NEED_FULFILLED,
			value: `Need fulfilled`,
			mapping: `general-product-enquiry`
		},
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		}
		
	],
	VerifyClient: [
			{
				key: NEED_FULFILLED,
				value: `Need fulfilled`,
				mapping: `general-product-enquiry`
			},
			{
				key: LANGUAGE_TRANSFER,
				value: `Language transfer`,
				mapping: `language-transfer`
			},
			{
				key: CALL_TRANSFERED,
				value: `Call transferred`,
				mapping: `call-transfer`
			},
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			},
	], 

	VerifyClientFailed:[
		{
			key: FAILED_VERIFICATION,
			value: `Client failed verification`,
			mapping: `failed-verification`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		},
		{
			key: NEED_FULFILLED,
			value: `Need fulfilled`,
			mapping: `general-product-enquiry`
		}
	],
			
		
	VerifyClientInProgress:[
		{
			key: ABANDONED_VERIFICATION,
			value: `Abandoned Verification`,
			mapping: ``
		},
		{
			key: NEED_FULFILLED,
			value: `Need fulfilled`,
			mapping: `general-product-enquiry`
		},
		{
			key: LANGUAGE_TRANSFER,
			value: `Language transfer`,
			mapping: `language-transfer`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		},
	],

	LandingPage: {
		"unverified": [
			{
				key: NEED_FULFILLED,
				value: `Need fulfilled`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_ASSIGNED,
				value: `Need assigned`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_HANDED_OFF,
				value: `Need handed off`,
				mapping: `general-product-enquiry`
			},
			{
				key: LANGUAGE_TRANSFER,
				value: `Language transfer`,
				mapping: `language-transfer`
			},
			{
				key: CALL_TRANSFERED,
				value: `Call transferred`,
				mapping: `call-transfer`
			},
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			}
		],
		"verified": [
			{
				key: NEED_FULFILLED,
				value: `Need fulfilled`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_ASSIGNED,
				value: `Need assigned`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_HANDED_OFF,
				value: `Need handed off`,
				mapping: `general-product-enquiry`
			},
			{
				key: LANGUAGE_TRANSFER,
				value: `Language transfer`,
				mapping: `language-transfer`
			},
			{
				key: CALL_TRANSFERED,
				value: `Call transferred`,
				mapping: `call-transfer`
			},
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			}	
		],
		"non-client": [
			{
				key: NEED_FULFILLED,
				value: `Need fulfilled`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_ASSIGNED,
				value: `Need assigned`,
				mapping: `general-product-enquiry`
			},
			{
				key: NEED_HANDED_OFF,
				value: `Need handed off`,
				mapping: `general-product-enquiry`
			},
			{
				key: LANGUAGE_TRANSFER,
				value: `Language transfer`,
				mapping: `language-transfer`
			},
			{
				key: CALL_TRANSFERED,
				value: `Call transferred`,
				mapping: `call-transfer`
			}
		],
		"failed": [
			{
				key: FAILED_VERIFICATION,
				value: `Client failed verification`,
				mapping: `failed-verification`
			},
			{
				key: CALL_TRANSFERED,
				value: `Call transferred`,
				mapping: `call-transfer`
			},
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			},
			{
				key: PRODUCT_ENQUIRY,
				value: `Product enquiry`,
				mapping: `general-product-enquiry`
			}
		]
	},
	TransactionHistory: [
		{
			key: NEED_FULFILLED,
			value: `Need fulfilled`,
			mapping: `transaction-history`
		},
		{
			key: NEED_ASSIGNED,
			value: `Need assigned`,
			mapping: `transaction-history`
		},
		{
			key: NEED_HANDED_OFF,
			value: `Need handed off`,
			mapping: `transaction-history`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		},
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	],
	QuickTransactionSuccess: [
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		},
		{
			key: NEED_ASSIGNED,
			value: `Need assigned`,
			mapping: `general-product-enquiry`
		},
		{
			key: NEED_HANDED_OFF,
			value: `Need handed off`,
			mapping: `general-product-enquiry`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		}
	],
	QuickTransactionsUnSuccess : [
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - Transaction Failed`,
			mapping: ``
		},
		{
			key: NEED_ASSIGNED,
			value: `Need assigned`,
			mapping: `general-product-enquiry`
		},
		{
			key: NEED_HANDED_OFF,
			value: `Need handed off`,
			mapping: `general-product-enquiry`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	],
	QuickTransactionsInProgress : [
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		},
		{
			key: NEED_ASSIGNED,
			value: `Need assigned`,
			mapping: `general-product-enquiry`
		},
		{
			key: NEED_HANDED_OFF,
			value: `Need handed off`,
			mapping: `general-product-enquiry`
		},
		{
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`
		},
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	]
});