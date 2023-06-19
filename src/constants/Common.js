/**
 * Transactions that require digital authentication to perform
 * 
 * @readonly
 * @enum {Object} HIGH_RISK_TRANSACTIONS
 * 
 */
export const HIGH_RISK_TRANSACTIONS = [`debi-check`, `settle-close`, `pay-budget`, `unlock-ftsp`];

/**
 * Transactions that doesn't even require authentication to perform
 * 
 * @readonly
 * @enum {Object} LOW_RISK_TRANSACTIONS
 * 
 */
export const LOW_RISK_TRANSACTIONS = [`stop-card`, `search-other-need`];

/**
 * Transactions that doesn't even require authentication to perform
 * 
 * @readonly
 * @enum {Object} EMAIL_DOMAINS
 * 
 */
 export const EMAIL_DOMAINS = Object.freeze([
	`yahoo.com`,
	`gmail.com`,
	`google.com`,
	`hotmail.com`,
	`me.com`,
	`aol.com`,
	`mac.com`,
	`live.com`,
	`comcast.com`,
	`googlemail.com`,
	`msn.com`,
	`hotmail.co.uk`,
	`yahoo.co.uk`,
	`facebook.com`,
	`verizon.net`,
	`att.net`,
	`gmz.com`,
	`mail.com`
]);

/**
 * Account types that Transaction history component supports {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} ACCOUNT_TYPES
 */
 export const ACCOUNT_TYPES = Object.freeze({
	SAVINGS_ACCOUNT: `transact`,
	LBB: `lbb`,
	CREDIT: `credit`,
	SAVINGS_PLAN: `save`
});

/**
 * Account types and their respective product codes
 * 
 * @readonly
 * @enum {Object} ACCOUNT_TYPE_CODE
 */
 export const ACCOUNT_TYPE_CODE = Object.freeze({
	PRIMARY_SAVINGS: 300,
	FLEXIBLE_SAVINGS_PLAN: 200,
	FIXED_TERM_SAVINGS_PLAN: 201,
	LBB: 210,
	FIXED_TERM_CREDIT: 4010,
	FLEXIBLE_CREDIT_CARD: 101,
	FLEXIBLE_ACCESS_FACILITY: 6000
});

/**
 * 
 * @readonly
 */
 export const LANDING_PAGE_NEEDS = Object.freeze({
	SAVINGS_ACCOUNT: `savings-account`,
	LBB: `lbb-account-enquiry`,
	CREDIT: `credit-account-enquiry`,
	SAVINGS_PLAN: `savings-plan-account-enquiry`,
	INSURE: `funeral-plan-summary`
});

/**
 * Authentication methods in Horizon (XDS/ KBA)
 * 
 * @readonly
 * @enum {Object} AUTH_METHODS
 */
export const AUTH_METHODS = Object.freeze({
	XDS: `XDS`,
	KBA: `KBA`
});

export const AUTH_IDENTIFICATION_METHODS = Object.freeze({
	SAID_PASSPORT: `IDNUMBER`,
	ACCOUNT_NUMBER: `ACCOUNTNUMBER`,
	CELLPHONE_NUMBER: `VERIFIEDCELLPHONENUMBER`  
});
 