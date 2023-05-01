import { ACCOUNT_TYPE_CODE } from 'app/constants/common';

export const DEFAULTS = Object.freeze({
	SEARCH_TEXT_LABEL: `Search loan, amount or account number`,
	TYPE_LABEL: `Credit type`
});

export const CREDIT_TYPE_LIST = Object.freeze([
`All`,
`Fixed credit`,
`Flexible credit`
]);

export const PRODUCTS = {
	CREDIT_CARD: `Credit card`,
	ACCESS_FACILITY: `Access facility`,
	TERM_LOAN: `Term Loan`
};

export const CREDIT_TYPE = {
	FLEXIBLE: `Flexible`,
	FIXED: `Fixed`
};

export const FROM_ACCOUNTS_LIST = [
	ACCOUNT_TYPE_CODE.PRIMARY_SAVINGS,
	ACCOUNT_TYPE_CODE.FLEXIBLE_SAVINGS_PLAN
];
	
export const CREDIT_ACCOUNT_TYPE = {
		101: CREDIT_TYPE.FLEXIBLE, // Credit card
		6000: CREDIT_TYPE.FLEXIBLE, // Access facility
		4010: CREDIT_TYPE.FIXED // Term loan
	};
	
export const PRODUCT_TYPE = {
		101: PRODUCTS.CREDIT_CARD,
		6000: PRODUCTS.ACCESS_FACILITY,
		4010: PRODUCTS.TERM_LOAN
	};

/**
 * Need actions and operation identifier mapping to check credit permissions
 * 
 * @readonly
 * @enum {Object} PERMISSION_STATUS
 */
export const ACTION_IDENTIFIER = Object.freeze({
	'transaction-history': `SendViewTransactionHistory`,
	'statements': `SendViewStatements`,
	'settlement-quote': `SettlementQuote`,
	'paid-up-letter': `PaidUp`,
	'settle-close': `SettleAndClose`
});

/**
 * Available permission statuses for credit options
 * 
 * @readonly
 * @enum {Object} PERMISSION_STATUS
 */
export const PERMISSION_STATUS = Object.freeze({
	GRANTED: `Granted`,
	DENIED: `Denied`
});

/**
 * Available account statuses for input to the credit overview CS.
 */
export const ACCOUNT_STATUS = Object.freeze({
	UNSPECIFIED: `Unspecified`,
	ALL: `All`,
	ACTIVE: `Active`,
	CLOSED: `Closed`,
	PAID_UP: `Paidup`
});
	
export const FROM_ACCOUNTS = {
	'Primary': {
		icon: `product/transact`,
		order: 1
	},
	'Flexible': {
		icon: `product/save`,
		order: 2
	}
};

/**
 * Credit permission decline reasons
 * 
 * @readonly
 * @enum {Object} PERMISSION_DECLINE_REASONS
 */
 export const PERMISSION_DECLINE_REASONS = Object.freeze({
	ACC_NOT_ACTIVE: `AccountNotActive`
});

/**
 * Decline reasons exclusion list, to set CCS false if the decline
 * reason is one of the below
 * 
 * @readonly
 * @enum {Object} DECLINE_REASONS_EXCLUSION_LIST
 */
export const DECLINE_REASONS_EXCLUSION_LIST = Object.freeze([PERMISSION_DECLINE_REASONS.ACC_NOT_ACTIVE]);

/**
 * Possible budget terms to choose on opening budget
 * @readonly
 * @enum {Object} BUDGET_TERMS
 */
export const BUDGET_TERMS = Object.freeze({
	"Three": 3,
	"Six": 6,
	'Twelve': 12,
	"Eighteen": 18,
	"TwentyFour": 24,
	"Thirty": 30,
	"ThirtySix": 36,
	"FourtyTwo": 42,
	"FourtyEight": 48
});