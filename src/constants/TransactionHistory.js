/**
 * Render modes {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} RENDER_MODE
 */
export const RENDER_MODE = Object.freeze({
	MAIN_PAGE: 0,
	CALENDAR: 1
});


/**
 * Available transaction status types {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} TRANSACTION_STATUS_LIST
 */
export const TRANSACTION_STATUS_LIST = Object.freeze([
	`Fee`,
	`Financial`,
	`Non Financial`,
	`Processing`,
	`Reversed`
]);

// ninety days in milliseconds
const NINETY_DAYS = 7777000000;

/**
 * Config, used when clearing all filtered options to fetch transaction data {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} TRANSACTION_HISTORY
 */
export const TRANSACTION_HISTORY = Object.freeze({
	ACCOUNT_TYPE: `PRIMARY_SAVINGS`,
	END_DATE: new Date().toISOString().substr(0, 10),
	START_DATE: new Date(`January 01, 2000`).toISOString().substr(0, 10),
	MAX_RESULTS: 50,
	MONEY_TYPE: `BOTH`
});

export const ACCOUNT_TYPES_LIST = Object.freeze({
	'transact': `PRIMARY_SAVINGS`,
	'lbb': `LBB`,
	'credit': ``,
	'save': ``
});