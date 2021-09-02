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
 * Filter transaction data by one of these options {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} FILTER_BY
 */
export const FILTER_BY = Object.freeze({
	ALL: `ALL`,
	TEXT: `TEXT`,
	DATE: `DATE`,
	STATUS: `STATUS`
});

/**
 * Constant to handle/ display filtered options as chips {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} RENDER_CHIPS
 */
export const RENDER_CHIPS = Object.freeze({
	TEXT: ``,
	DATE: ``,
	STATUS: ``
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

/**
 * Account types that Transaction history component supports {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} ACCOUNT_TYPES
 */
export const ACCOUNT_TYPES = Object.freeze({
	SAVINGS_ACCOUNT: `transact`,
	LBB: `lbb`,
	CREDIT: `credit`
});

/**
 * Money types used to filter the transaction {@link TransactionHistory}
 * 
 * @readonly
 * @enum {Object} MONEY_TYPES
 */
 export const MONEY_TYPES = Object.freeze({
	'All': `all`,
	'Money In': `money-in`,
	'Money Out': `money-out`
});