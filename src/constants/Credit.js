import { ACCOUNT_TYPE_CODE } from 'app/constants/Common';

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
	ACC_NOT_ACTIVE: `AccountNotActive`,
	ClientHandedOver: `Client is under CCS status`,
	AccountInArrears: `Please settle arrears of $ArrearsPayable$ to continue adding budget`
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

export const CCS_DECLINE_MESSAGE = Object.freeze({
	'settle-close': {
		'ClientApplicationForDebtReview': `Client has applied for debt review. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230`,
		'ClientOverIndebtedCapitecZeroBalance': `Client is under debt review. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientOverIndebtedCapitecBalance': `Client is under debt review. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientStatusIsDeceased': `Client is reported deceased. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientStatusIsPossibleDeceased': `Client is possibly deceased. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientUnderDebtReview': `Client is under debt review. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientHandedOver': `Client account is handed over to external debt collector. Settle and Close cannot be actioned . Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientAccountsSold': `Clients account has been sold to external debt collector. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientHandedOverEDC': `Client account is handed over to external debt collector. Settle and Close cannot be actioned . Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientApplicationUnderAdministration': `Client has applied to be under administration. Settle and Close cannot be actioned.  Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientIsPensioner': `Client status shows as pensioner. Settle and Close cannot be actioned.  Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientApplicationUnderSequestration': `Client has applied to be under sequestration. Settle and Close cannot be actioned.  Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientUnderSequestrationOrder': `Client is under sequestration. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientIsRetrenched': `Client status shows retrenched. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`,
		'ClientUnderAdministration': `Client is under administration. Settle and Close cannot be actioned. Please transfer this call to recoveries and collections at ext 212230.`
	}
});

export const CC_CLOSED_STATUS_DISABLE_NEEDS = Object.freeze([`settlement-quote`, `settle-close`]);