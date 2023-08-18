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
	{ code: `TransactionDate`, text: `Change Actioned Date` }, // TODO: Endpoint doesn't include it in request payload. code: `ActionedDate`
	{ code: `TransactionDate`, text: `Effective Date` } // code: `EffectiveDate`
]);

/**
 * Default values
 */
export const DEFAULTS = {
	DATE_LABEL: `Choose date type`,
	DATE_FORMAT: `dd mm yyyy`,
	ACTIVITY_TYPE_LABEL: `Choose activity type`
};

/**
 * Max no of Results
 */
export const MAX_RESULTS = 50;

/**
 * date of last 90 days 
 */
export const NINETY_DAYS = 7777000000;

/**
 * Filter by Types
 */
export const FILTER_BY = {
	ALL: `ALL`,
	DATE: `DATE`,
	DATE_TYPE: `DATE_TYPE`,
	ACTIVITY_TYPE: `ACTIVITY_TYPE`
};

/**
 * Render chips to filter by types
 */
export const RENDER_CHIPS = {
	DATE: ``,
	DATE_TYPE: ``,
	ACTIVITY_TYPE: ``
};

/**
 * Available activity types code and text {@link InsureTransactionHistory}
 * 
 * @readonly
 * @enum {Object} ACTIVITY_TYPE_LIST
 */
export const ACTIVITY_TYPE_LIST = Object.freeze([
	{ code: `UpdatePolicyQuote`, text: `Premium Change` },
	{ code: `UpdateBankDetails`, text: `Bank Details Changes` },
	{ code: `MAINLIFECHANGES`, text: `Main Life Changes` },
	{ code: `AddLife`, text: `Lives Assured Changes` },
	{ code: `BENEFICIARYCHANGES`, text: `Beneficiary Changes` },
	{ code: `POLICYSTATUSCHANGES`, text: `Policy Status Changes` },
	{ code: `AddWaiverInfo`, text: `Waiver Changes` },
	{ code: `CLAIMSLODGESCHANGES`, text: `Claims Lodges and Changes` }
]);

/**
* Activity types key/value pair
* 
* @readonly
* @enum {Object} ACTIVITY_TYPE
*/
export const ACTIVITY_TYPE = Object.freeze({
	PREMIUM_CHANGE: `UpdatePolicyQuote`,
	BANKDETAILS_CHANGES: `UpdateBankDetails`,
	MAINLIFE_CHANGES: `MainLifeChanges`,
	LIVESASSURED_CHANGES: `AddLife`,
	BENEFICIARY_CHANGES: `BeneficiaryChanges`,
	POLICYSTATUS_CHANGES: `PolicyStatusChanges`,
	WAIVER_CHANGES: `AddWaiverInfo`,
	CLAIMSLODGES_CHANGES: `ClaimsLodgesChanges`
});

/**
 * List of Activity Type Descriptions
 * @readonly
 * @enum {Object} ACTIVITY_TYPE_DESCRIPTION
 */
export const ACTIVITY_TYPE_DESCRIPTION = Object.freeze({
	UpdatePolicyQuote: `Update Policy Quote`,
	UpdateBankDetails: `Update Bank Details`,
	MainLifeChanges: `Main Life Changes`,
	AddLife: `Add Life`,
	BeneficiaryChanges: `Beneficiary Changes`,
	PolicyStatusChanges: `Policy Status Changes`,
	AddWaiverInfo: `Add Waiver Info`,
	ClaimsLodgesChanges: `Claims Lodges Changes`
});


/**
 * Transaction Types display values
 * @readonly
 * @enum {Object} ROLE_PLAYER_RELATIONSHIP
 */
export const TRANSACTION_TYPE = Object.freeze({
	SUBMIT: `Submit`,
	DISBURSEMENT: `Disbursement`,
	CANCELLATIONOFPOLICY: `Cancellation Of Policy`,
	ADDLIFE: `Add Life`,
	REVIVAL: `Revival`,
	UPDATEBANKDETAILS: `Update Bank Details`,
	RESETVOLUNTARYPAUSECOUNTER: `Reset Voluntary Pause Counter`,
	GENERATEBILL: `Generate Bill`,
	UPDATEREFERENCENUMBER: `Update Reference Number`,
	ESTIMATE: `Estimate`,
	INCREASEOFSUMASSURED: `Increase Of Sum Assured`,
	ACCEPTQUOTE: `Accept Quote`,
	RELATIONSHIPCHANGE: `Relationship Change`,
	EXPIREQUOTE: `Expire Quote`,
	NOTTAKEN: `Not Taken`,
	VOLUNTARYPAUSE: `Voluntary Pause`,
	DATEOFBIRTHCHANGE: `Date Of Birth Change`,
	ADDWAIVERINFO: `Add Waiver Info`,
	BILLING: `Billing`,
	SAVEUPDATEQUOTE: `Save Update Quote`,
	REMOVELIFEASSURED: `Remove Life Assured`,
	PREMIUMCOLLECTION: `Premium Collection`,
	PREMIUMREMINDER: `Premium Reminder`,
	ACCEPTPOLICY: `Accept Policy`,
	GRACE: `Grace`,
	DECREASEOFSUMASSURED: `Decrease Of Sum Assured`,
	UPDATEPOLICYQUOTE: `Update Policy Quote`,
	UNKNOWN: `Unknown`
});