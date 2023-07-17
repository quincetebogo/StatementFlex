import { ORG_UNITS } from "app/constants/Common";

const callTransferedResoltuion = (issueType) => {
	const returnValue = issueType === `Fraud Engagement Transfer` ? `Fraud Transfer` : ``;
	return returnValue;
};

/**
 * The end call reasons for end call dialog.
 * 
 * @readonly
 * @enum {Object} END_CALL_REASON
 * 
 * End call mapping refer from Confluience https://confluence.capitecbank.co.za:8443/display/HOR/Quick+Transactions%3A+STrack+Field+Mapping 
 * and https://confluence.capitecbank.co.za:8443/pages/viewpage.action?pageId=583797367
 * End call contexts confluence https://confluence.capitecbank.co.za:8443/display/HOR/User+Story+1%3A+End+call+session+-+Enhanced
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

 let CALLTRANSFERED = {};
 let UNCOMMON_REASONS = {};
 let PRODUCT_ENQUIRY_REASONS = {};
 let UNSUCCESSFUL_REASONS = {};

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
		CALLTRANSFERED = {
			key: CALL_TRANSFERED,
			value: `Call transferred`,
			mapping: `call-transfer`,
			getResolution: callTransferedResoltuion
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
		CALLTRANSFERED,
		{
			key: NEED_INCOMPLETE,
			value: `Need incomplete - bad connection`,
			mapping: `telephony-disconnected`
		}
	], 
	VerifyClientFailed: [
		{
			key: FAILED_VERIFICATION,
			value: `Client failed verification`,
			mapping: `failed-verification`
		},
		CALLTRANSFERED,
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
	VerifyClientInProgress: [
		{
			key: ABANDONED_VERIFICATION,
			value: `Abandoned Verification`,
			mapping: `abandoned-verification`
		},
		{
			key: LANGUAGE_TRANSFER,
			value: `Language transfer`,
			mapping: `language-transfer`
		},
		CALLTRANSFERED,
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
			CALLTRANSFERED,
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
			CALLTRANSFERED,
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			}
		],
		"non-client": PRODUCT_ENQUIRY_REASONS = [
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
			CALLTRANSFERED,
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			}
		],
		"failed": [
			{
				key: FAILED_VERIFICATION,
				value: `Client failed verification`,
				mapping: `failed-verification`
			},
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
			CALLTRANSFERED,
			{
				key: NEED_INCOMPLETE,
				value: `Need incomplete - bad connection`,
				mapping: `telephony-disconnected`
			}
		]
	},
	TransactionHistory: UNCOMMON_REASONS = [
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
		CALLTRANSFERED,
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
		CALLTRANSFERED,
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
	QuickTransactionsUnSuccess: UNSUCCESSFUL_REASONS = [
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
		CALLTRANSFERED,
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	],
	QuickTransactionsInProgress: [
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
		CALLTRANSFERED,
		{
			key: FOLLOW_UP,
			value: `Follow up required`,
			mapping: ``
		}
	],
	DebiCheck: UNCOMMON_REASONS,
	DebiCheckServiceError: UNCOMMON_REASONS,
	SearchOtherNeed: UNCOMMON_REASONS,
	ProductEnquiry: PRODUCT_ENQUIRY_REASONS,
	ServiceError: UNSUCCESSFUL_REASONS, 
	SystemError: UNSUCCESSFUL_REASONS
});

/**
 * Classification for call transferred end call reason
 * 
 * @readonly
 * @enum {Object} CALL_TRANSFERED_CLASSIFICATION
 */
export const CALL_TRANSFERED_CLASSIFICATION = Object.freeze({
	category: `Telephony`,
	subcategory: `Transfer`
});

/**
 * Enum - For the below reasons, we need to recognize need when incident not classified
 * 
 * @readonly
 * @enum {Object} RECOGNIZE_NEED_REASONS
 */
export const RECOGNIZE_NEED_REASONS = Object.freeze([
	END_CALL_REASON.NEED_FULFILLED,
	END_CALL_REASON.NEED_ASSIGNED,
	END_CALL_REASON.NEED_HANDED_OFF,
	END_CALL_REASON.PRODUCT_ENQUIRY,
	END_CALL_REASON.CALL_TRANSFERED
]);

/**
 * Exceptional end call contexts that do not fall under Incident inprogress logic
 * 
 * @readonly
 * @enum {Object} EXCEPTIONAL_ENDCALL_CONTEXTS
 */
 export const EXCEPTIONAL_ENDCALL_CONTEXTS = Object.freeze([
	 `TransactionHistory`,
	 `DebiCheck`,
	 `SearchOtherNeed`,
	 `ProductEnquiry`,
	 `LandingPage`
 ]);

 /**
 * The end call reasons based on agent role.
 * @readonly
 * @enum {Object} END_CALL_REASON_BY_ROLE
 */
 export const END_CALL_REASON_BY_ROLE = Object.freeze({
	[ORG_UNITS.CAPITEC_CONNECT]: [
		{
			key: NEED_INCOMPLETE,
			value: `Abandoned request`,
			mapping: `telephony-disconnected`
		},
		{
			key: FAILED_VERIFICATION,
			value: `Client failed verification`,
			mapping: `failed-verification`
		},
		{
			key: LANGUAGE_TRANSFER,
			value: `External factor`,
			mapping: `language-transfer`
		},
		{
			key: NEED_FULFILLED,
			value: `Query closed`,
			mapping: `general-product-enquiry`
		},
		{
			key: NEED_HANDED_OFF,
			value: `Query escalation`,
			mapping: `general-product-enquiry`
		},
		{
			key: CALL_TRANSFERED,
			value: `Query resolved`,
			mapping: `call-transfer`,
			getResolution: callTransferedResoltuion
		}
	],
	[ORG_UNITS.CLIENT_CARE]: END_CALL_REASON,
	[ORG_UNITS.HELPDESK]: END_CALL_REASON
});

 /**
 * Roles structured with end call context
 * @readonly
 * @enum {Object} ROLES_WITH_END_CALL_CONTEXT
 */
export const ROLES_WITH_END_CALL_CONTEXT = [ORG_UNITS.CLIENT_CARE, ORG_UNITS.HELPDESK];