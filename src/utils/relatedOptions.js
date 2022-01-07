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
	'statements': {
		Success: [`proof-of-account`],
		Failure: [`proof-of-account`]
	},
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
	"statements-credit-card": {
		Success: [
			`tax-certificate`,
			`proof-of-account`
		],
		Failure: [
			`tax-certificate`,
			`proof-of-account`
		]
	}
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
	}
};