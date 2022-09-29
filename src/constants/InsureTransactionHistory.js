/**
 * Available date types {@link InsureTransactionHistory}
 * 
 * @readonly
 * @enum {Object} DATE_TYPE_LIST
 */
 export const DATE_TYPE_LIST = Object.freeze([
	{ code: `TransactionDate`, text: `Date` },
	{ code: `PremiumDueDate`, text: `Premium Due Date` }
]);

/**
 * Available audit transactions date types {@link InsureTransactionHistory}
 * 
 * @readonly
 * @enum {Object} AUDIT_DATE_TYPE_LIST
 */
 export const AUDIT_DATE_TYPE_LIST = Object.freeze([
	{ code: `ActionedDate`, text: `Change Actioned Date` },
	{ code: `EffectiveDate`, text: `Effective Date` }
]);

/**
 * Default values for Dates
 */
export const DEFAULTS = {
	DATE_LABEL: `Choose date type`,
	DATE_FORMAT: `dd mm yyyy`
};

/**
 * Max no of Results
 */
export const MAX_RESULTS = 50;

/**
 * Filter by Types
 */
export const FILTER_BY = {
	ALL: `ALL`,
	DATE: `DATE`,
	DATE_TYPE: `DATE_TYPE`
};

/**
 * Render chips to filter by types
 */
export const RENDER_CHIPS = {
	DATE: ``,
	DATE_TYPE: ``
};

/**
 * Current date
 */
export const TODAY_DATE = new Date();

/**
 * Available activity types code and text {@link InsureTransactionHistory}
 * 
 * @readonly
 * @enum {Object} ACTIVITY_TYPE_LIST
 */
 export const ACTIVITY_TYPE_LIST = Object.freeze([
	{ code: `PREMIUMCHANGE`, text: `Premium Change` },
	{ code: `BANKDETAILSCHANGES`, text: `Bank Details Changes` },
	{ code: `MAINLIFECHANGES`, text: `Main Life Changes` },
	{ code: `LIVESASSUREDCHANGES`, text: `Lives Assured Changes` },
	{ code: `BENEFICIARYCHANGES`, text: `Beneficiary Changes` },
	{ code: `POLICYSTATUSCHANGES`, text: `Policy Status Changes` },
	{ code: `WAIVERCHANGES`, text: `Waiver Changes` },
	{ code: `CLAIMSLODGESCHANGES`, text: `Claims Lodges and Changes` }
]);

 /**
 * Activity types key/value pair
 * 
 * @readonly
 * @enum {Object} ACTIVITY_TYPE
 */
 export const ACTIVITY_TYPE = Object.freeze({
	PREMIUM_CHANGE: `Premium Change`,
	BANKDETAILS_CHANGES: `Bank Details Changes`,
	MAINLIFE_CHANGES: `Main Life Changes`,
	LIVESASSURED_CHANGES: `Lives Assured Changes`,
	BENEFICIARY_CHANGES: `Beneficiary Changes`,
	POLICYSTATUS_CHANGES: `Policy Status Changes`,
	WAIVER_CHANGES: `Waiver Changes`,
	CLAIMSLODGES_CHANGES: `Claims Lodges Changes`
});