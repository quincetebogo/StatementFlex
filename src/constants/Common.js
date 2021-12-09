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