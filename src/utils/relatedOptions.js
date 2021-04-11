/**
 * Related options list: Mapping based on need and the context of success/ failure
 * Related options common component imports this const to determine the options at runtime
 * 
 * @exports
 * @constant RelatedOptions
 */
export const RelatedOptions = {
	'debi-check': {
		Success,
		Failure: [
			`TRANSACTION_HISOTRY`
		]
	},
	'stop-card': {
		Success,
		Failure: [
			`UPDATE_CARD_LIMITS`,
			`TRANSACTION_HISOTRY`
		]
	},
	'update-card-limits': {
		Success,
		Failure: [
			`STATEMENTS`,
			`TAP_TO_PAY`
		]
	},
	'tap-to-pay': {
		Success: [
			`UPDATE_CARD_LIMITS`,
			`STATEMENTS`
		],
		Failure: [
			`UPDATE_CARD_LIMITS`,
			`STOP_CARD`
		]
	},
	'statements': {
		Success,
		Failure: [
			`TAX_CERTIFICATE`,
			`PROOF_OF_ACCOUNT`
		]
	},
	'proof-of-account': {
		Success: [
			`TAX_CERTIFICATE`,
			`STATEMENTS`
		],
		Failure: [
			`TAX_CERTIFICATE`,
			`PROOF_OF_ACCOUNT`
		]
	},
	'tax-certificate': {
		Success: [
			`PROOF_OF_ACCOUNT`,
			`STATEMENTS`
		],
		Failure: [
			`TAX_CERTIFICATE`,
			`PROOF_OF_ACCOUNT`
		]
	}
}

/**
 * Related options configuration: Holds label and icon src of each option
 * 
 * @exports
 * @constant OptionsConfig
 */
export const OptionsConfig = {
	STOP_CARD: {
		label: `Stop Card`,
		src: `system/stop-card-action`
	},
	UPDATE_CARD_LIMITS: {
		label: `Update Limits`,
		src: `system/cards-action`
	},
	TAP_TO_PAY: {
		label: `Tap To Pay`,
		src: `system/contactless-action`
	},
	STATEMENTS: {
		label: `Statements`,
		src: `system/documents-action`
	},
	PROOF_OF_ACCOUNT: {
		label: `Proof Of Account`,
		src: `system/documents-action`
	},
	TAX_CERTIFICATE: {
		label: `Tax Certificate`,
		src: `system/sars-action`
	},
	TRANSACTION_HISTORY: {
		label: `Transaction History`,
		src: `system/time-action`
	}
}