import { ACCOUNT_TYPE_CODE } from 'app/constants/Common';

export const DEFAULTS = Object.freeze({
	SEARCH_TEXT_LABEL: `Search loan, amount or account number`,
	TYPE_LABEL: `Credit type`
});

export const CREDIT_TYPE_LIST = Object.freeze([
'All',
'Fixed credit',
'Flexible credit'
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
	
export const FROM_ACCOUNTS = {
	'Primary': {
		icon: `product/transact`,
		order: 1
	},
	'Flexible': {
		icon: `product/save`,
		order: 2
	}
}