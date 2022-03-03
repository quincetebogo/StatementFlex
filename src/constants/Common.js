/**
 * Transactions that require digital authentication to perform
 * 
 * @readonly
 * @enum {Object} HIGH_RISK_TRANSACTIONS
 * 
 */
export const HIGH_RISK_TRANSACTIONS = [`debi-check`];

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