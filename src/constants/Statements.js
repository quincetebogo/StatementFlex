/**
 * Render modes in statements flow {@link StatementsDialog}
 * 
 * @readonly
 * @enum {Object} RENDER_MODE
 */
 export const RENDER_MODE = Object.freeze({
	CHOOSE_ACCOUNT: 0,
	CHOOSE_PERIOD: 1,
	EMAIL: 2,
	PDF: 3
});

/**
 * Steps involved in statements flow {@link StatementsDialog}
 * Render mode in each step should align with render modes in statements dialog
 * 
 * @readonly
 * @enum {Object} STATEMENTS_STEPS
 */
 export const STATEMENTS_STEPS = Object.freeze([
	{
		title: `Choose Account`,
		renderMode: RENDER_MODE.CHOOSE_ACCOUNT
	},
	{
		title: `Choose Period`,
		renderMode: RENDER_MODE.CHOOSE_PERIOD
	},
	{
		title: `Specify Email and View Documents`,
		renderMode: RENDER_MODE.EMAIL
	}
]);

/**
 * List the available type of selectors
 */
 export const RANGE_SELECTOR = Object.freeze({
	DATE: `date`,
	MONTH: `month`
});

export const PERIOD_TYPE = Object.freeze({
	STATIC: `static`,
	CUSTOM: `custom`
});

/**
 * Account types based on interest category {@link StatementsDialog}
 * 
 * @readonly
 * @enum {Object} ACCOUNT_INTCAT_ENUM
 */
 export const ACCOUNT_INTCAT_ENUM = Object.freeze({
	300: {
		name: `Savings account`,
		type: `PRIMARY_SAVINGS`,
		category: `transact`,
		subCategory: ``,
		icon: `product/transact`,
		order: 1,
		choosePeriod: RANGE_SELECTOR.DATE
	},
	200: {
		name: ``,
		type: `FLEXIBLE_SAVINGS`,
		category: `save`,
		subCategory: ``,
		icon: `product/save`,
		order: 2,
		choosePeriod: RANGE_SELECTOR.DATE
	},
	201: {
		1: {
			name: ``,
			type: `FIXED_TERM_MULTIPLE_DEPOSITS`,
			category: `save`,
			subCategory: ``,
			icon: `product/save`,
			order: 3,
			choosePeriod: RANGE_SELECTOR.DATE
		},
		2: {
			name: ``,
			type: `FIXED_TERM_SINGLE_DEPOSIT`,
			category: `save`,
			subCategory: ``,
			icon: `product/save`,
			order: 4,
			choosePeriod: RANGE_SELECTOR.DATE
		}
	},
	210: {
		name: `Live better savings account`,
		type: `LBB`,
		category: `lbb`,
		subCategory: ``,
		customIcon: `/images/liveBetter/live-better-icon.png`,
		order: 5,
		choosePeriod: RANGE_SELECTOR.DATE
	},
	4010: {
		name: `Term Loan`,
		type: `FIXED_TERM_CREDIT`,
		category: `credit`,
		subCategory: `term-loan`,
		icon: `product/credit`,
		order: 6,
		choosePeriod: RANGE_SELECTOR.DATE
	},
	101: {
		name: `Credit card`,
		type: `FLEXIBLE_CREDIT`,
		category: `credit`,
		subCategory: `credit-card`,
		icon: `product/credit`,
		order: 7,
		choosePeriod: RANGE_SELECTOR.MONTH
	},
	6000: {
		name: `Access facility`,
		type: `FLEXIBLE_CREDIT`,
		category: `credit`,
		subCategory: `access-facility`,
		icon: `product/credit`,
		order: 8,
		choosePeriod: RANGE_SELECTOR.MONTH
	}
});

/**
 * Static time slots to get statments {@link StatementsDialog}
 * 
 * @readonly
 * @enum {Object} TIME_PERIOD
 */
export const TIME_PERIOD = Object.freeze({
	ONE_MONTH: {
		value: `ONE_MONTH`,
		label: `1 month`,
		range: 30
	},
	THREE_MONHTS: {
		value: `THREE_MONTH`,
		label: `3 months`,
		range: 90
	},
	SIX_MONTHS: {
		value: `SIX_MONTH`,
		label: `6 months`,
		range: 180
	},
	NINE_MONTHS: {
		value: `NINE_MONTH`,
		label: `9 months`,
		range: 270
	}
});

/**
 * Notification messages based on different flows {@link StatementsDialog}
 * 
 * @readonly
 * @enum {Object} NOTIFICATION_MESSAGE
 */
export const NOTIFICATION_MESSAGE = Object.freeze({
	APP: ` Did you know you can email statements from the app for free?`,
	FEE: ` A fee will be charged for email statements`,
	NO_FEE: ` A fee won't be charged for a fixed term savings statement`,
	FLEXIBLE_SAVINGS_FEE: ` A fee will be charged for flexible saving account statements.`
});

export const ERRORS = Object.freeze({
	SYSTEM_ERROR: `System error. Please try again`,
	REQUIRED_PERIOD: `You must choose an option in order to continue`,
	DATE_RANGE: `Out of range, please select the correct range up to 90 days`,
	CALENDER_RANGE: `Date range up to 90 days only`,
	OnlyOneSelection: `You can only select one range at a time`
});