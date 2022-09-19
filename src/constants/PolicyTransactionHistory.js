/**
 * Available date types {@link PolicyTransactionHistory}
 * 
 * @readonly
 * @enum {Object} DATE_TYPE_LIST
 */
 export const DATE_TYPE_LIST = Object.freeze([
	{ code: `TransactionDate`, text: `Date` },
	{ code: `PremiumDueDate`, text: `Premium Due Date` }
]);

export const DEFAULTS = {
	DATE_LABEL: `Choose date type`,
	DATE_FORMAT: `dd mm yyyy`
};

export const MAX_RESULTS = 50;