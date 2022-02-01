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