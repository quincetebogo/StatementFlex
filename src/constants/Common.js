/**
 * Transactions that doesn't even require authentication to perform
 * 
 * @readonly
 * @enum {Object} LOW_RISK_TRANSACTIONS
 * 
 */
export const LOW_RISK_TRANSACTIONS = [`stop-card`, `search-other-need`, `card-history`];

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
	FLEXIBLE_ACCESS_FACILITY: 6000,
	NOTICE_DEPOSIT: 205
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


/**
 * Available language list for choosing preferred language
 * 
 * @readonly
 * @enum {Object} LANGUAGE_LIST
 */
export const LANGUAGE_LIST = Object.freeze([
	{ key: `ENGLISH`, value: `English` },
	{ key: `AFRIKAANS`, value: `Afrikaans` },
	{ key: `ISIZULU`, value: `isiZulu` },
	{ key: `ISIXHOSA`, value: `isiXhosa` },
	{ key: `XITSONGA`, value: `Xitsonga` },
	{ key: `SISWATI`, value: `siSwati` },
	{ key: `ISINDEBELE`, value: `isiNdebele` },
	{ key: `TSHIVENDA`, value: `Tshivenda` },
	{ key: `SEPEDI`, value: `Sepedi` },
	{ key: `SESOTHO`, value: `Sesotho` },
	{ key: `SETSWANA`, value: `Setswana` }
]);

/**
 * Available card display types to distinguish between cards
 * 
 * @readonly
 * @enum {Object} CARD_DISPLAY_TYPES
 */
export const CARD_DISPLAY_TYPES = {
	PRIMARY_CARD: `Primary_Card`,
	SUPPLEMENTARY_CARD: `Supplementary_Card`,
	VIRTUAL_CARD: `Virtual_Card`
};

/* Available org units 
* 
* @readonly
* @enum {Object} ORG_UNITS
*/
export const ORG_UNITS = {
	CLIENT_CARE: `Client Care`,
	HELPDESK: `Helpdesk`,
	CAPITEC_CONNECT: `Capitec Connect`
};

/**
 * Roles to org units mappings
 * key - roles
 * value - orgunit
 * @readonly
 * @enum {Object} ROLES_TO_ORG_UNITS
 */
export const ROLES_TO_ORG_UNITS = {
	'clientcare-agent': { orgUnit: ORG_UNITS.CLIENT_CARE, order: 3 },
	'helpdesk-agent': { orgUnit: ORG_UNITS.HELPDESK, order: 2 },
	'capitecconnect-teamleader': { orgUnit: ORG_UNITS.CAPITEC_CONNECT, order: 1 },
	'capitecconnect-agent': { orgUnit: ORG_UNITS.CAPITEC_CONNECT, order: 1 }
};

/**
 * Available features based on given role of an agent
 * Client-care and Helpdesk are given access to All features on Horizon
 * 
 * @readonly
 * @enum {Object} AVAILABLE_FEATURES_BY_ROLE
 */
export const AVAILABLE_FEATURES_BY_ROLE = {
	[ORG_UNITS.CAPITEC_CONNECT]: [`stop-card`, `search-other-need`, `transaction-history`]
};

/**
 * Transactions that require digital authentication to perform
 * 
 * @readonly
 * @enum {Object} HIGH_RISK_TRANSACTIONS
 * 
 */
let CC_HIGH_RISK = [];
export const HIGH_RISK_TRANSACTIONS = {
	[ORG_UNITS.CLIENT_CARE]: CC_HIGH_RISK = [
		`debi-check`,
		`settle-close`,
		`pay-budget`,
		`full-unlock`,
		`partial-unlock`,
		`open-budget`,
		`update-card-limits`,
		`statements`,
		`tap-to-pay`,
		`tax-certificate`,
		`proof-of-account`
	],
	[ORG_UNITS.HELPDESK]: [
		`debi-check`,
		`settle-close`,
		`pay-budget`,
		`full-unlock`,
		`partial-unlock`,
		`open-budget`,
		`update-card-limits`,
		`tap-to-pay`
	],
	[ORG_UNITS.CAPITEC_CONNECT]: CC_HIGH_RISK
};