let STATEMENTS_RO = {};
let CREDIT_RO = {};

/**
 * Related options list: Mapping based on need and the context of success/ failure
 * Related options common component imports this const to determine the options at runtime
 * 
 * @exports
 * @constant relatedOptions
 */
export const relatedOptions = {
	'debi-check-viewInfo': {
		Success: [`transaction-history`],
		Failure: [`transaction-history`]
	},
	'debi-check-approve': {
		Success: [`transaction-history`],
		Failure: [`transaction-history`]
	},
	'debi-check-decline': {
		Success: [`transaction-history`],
		Failure: [`transaction-history`]
	},
	'stop-card': {
		Success: [`transaction-history`],
		Failure: [`transaction-history`]
	},
	'update-card-limits': {
		Success: [
			`statements` // ,
			// `tap-to-pay`
		],
		Failure: [
			`statements`// ,
			// `tap-to-pay`
		]
	},
	'tap-to-pay': {
		Success: [
			`update-card-limits`,
			`statements`
		],
		Failure: [
			`update-card-limits`,
			`stop-card`
		]
	},
	'statements-transact': STATEMENTS_RO = {
		Success: [`proof-of-account`],
		Failure: [`proof-of-account`]
	},
	'statements-lbb': STATEMENTS_RO,
	'proof-of-account': {
		Success: [`statements`],
		Failure: [`statements`]
	},
	'tax-certificate': {
		Success: [
			`proof-of-account`,
			`statements`
		],
		Failure: [
			`proof-of-account`,
			`statements`
		]
	},
	'payshap-proof-of-payment': {
		Success: [
			`tax-certificate`,
			`proof-of-account`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	},
	'automatic-savings-lbb': {
		Success: [`statements`],
		Failure: [`statements`]
	},
	"statements-credit-card": CREDIT_RO = {
		Success: [
			`tax-certificate`,
			`proof-of-account`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	},
	'statements-access-facility': CREDIT_RO,
	'statements-term-loan': CREDIT_RO,
	'settlement-quote': CREDIT_RO,
	'settlement-quote-credit-card': CREDIT_RO,
	'settlement-quote-access-facility': CREDIT_RO,
	'settlement-quote-term-loan': CREDIT_RO,
	'pay-budget-credit-card': CREDIT_RO,
	'settle-close-credit-card': {
		Success: [
			`paid-up-accounts`,
			`statements`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	},
	'settle-close-term-loan': {
		Success: [
			`paid-up-accounts`,
			`statements`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	},
	'statements-save': CREDIT_RO,
	'tax-certificate-save': {
		Success: [
			`proof-of-account`,
			`statements`
		],
		Failure: [
			`proof-of-account`,
			`statements`
		]
	},
	'paid-up-accounts': {
		Success: [
			`tax-certificate`,
			`proof-of-account`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	},
	'send-cash': {
		Success: [
			`transaction-history`,
			`statements`
		],
		Failure: [
			`transaction-history`,
			`statements`
		]
	},
	'send-cash-place-hold': {
		Success: [
			`transaction-history`,
			`statements`
		],
		Failure: [
			`transaction-history`,
			`statements`
		]
	},
	'full-ftsp-unlock': CREDIT_RO,
	'partial-ftsp-unlock': CREDIT_RO
};

/**
 * Related options configuration: Holds label and icon src of each option
 * 
 * @exports
 * @constant optionsConfig
 */
export const optionsConfig = {
	'stop-card': {
		label: `Stop Card`,
		src: `system/stop-card-action`
	},
	'update-card-limits': {
		label: `Update Card Limits`,
		src: `system/cards-action`
	},
	'tap-to-pay': {
		label: `Tap To Pay`,
		src: `system/contactless-action`
	},
	'statements': {
		label: `Statements`,
		src: `system/documents-action`
	},
	'proof-of-account': {
		label: `Proof Of Account`,
		src: `system/documents-action`
	},
	'tax-certificate': {
		label: `Tax Certificate`,
		src: `system/sars-action`
	},
	'transaction-history': {
		label: `Transaction History`,
		src: `system/time-action`
	},
	'paid-up-accounts': {
		label: `Paid up Letter`,
		src: `system/documents-action`
	}
};