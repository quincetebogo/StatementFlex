export const DETAILS_TYPE = Object.freeze({
	PREFERENCES: `Preferences`,
	PERSONAL_DETAILS: `Personal details`,
	CONTACT_DETAILS: `Contact details`,
	ADDRESS: `Address`,
	EMPLOYMENT_DETAILS: `Employment details`,
	INCOME_DETAILS: `Income details`
});

export const FIELDS = Object.freeze({
	PREFERRED_LANGUAGE: `Preferred Language`,
	TITLE: `Title`,
	NAME: `Name`,
	SURNAME: `Surname`,
	NICKNAME: `Nickname`,
	DOB: `Date of birth`,
	NATIONALITY: `Nationality`,
	ID_NUMBER: `ID number / Passport Number`,
	CELL_NO: `Cellphone number`,
	RES_PHONE_NO: `Home contact number`,
	WORK_PHONE_NO: `Work contact number`,
	EMAIL: `Email address (unverified)`,
	LINE_1: `Address line 1`,
	LINE_2: `Address line 2 (optional)`,
	SUBURB: `Suburb`,
	CITY: `City`,
	POSTAL_CODE: `Postal code`,
	EMP_STATUS: `Employment status`,
	EMP_TYPE: `Employment type`,
	EMPLOYER: `Employer`,
	INDUSTRY: `Industry`,
	SOF: `Source funds`,
	EXP_INCOME: `Expected income`,
	INCOME_FREQUENCY: `Income frequency`
});

export const INCOME_RANGE = Object.freeze([
	{ key: 0, value: `< R1000` },
	{ key: 14, value: `R1001 to R6000` },
	{ key: 16, value: `R6001 to R9000` },
	{ key: 17, value: `R9001 to R15000` },
	{ key: 18, value: `R15001 to R25000` },
	{ key: 19, value: `R25001 to R35000` },
	{ key: 20, value: `R35001 to R50000` },
	{ key: 21, value: `> R50000` }
]);

export const EMPLOYMENT_STATUS = Object.freeze([
	{ key: `EMPLOYED`, value: `Employed` },
	{ key: `SELF_EMPLOYED`, value: `Self Employed` },
	{ key: `UNEMPLOYED`, value: `Unemployed` },
	{ key: `PENSIONER`, value: `Pensioner` },
	{ key: `MINOR_16`, value: `Minor` }
]);

export const EMPLOYMENT_TYPE = Object.freeze({
	"Employed": [
		{ key: `CONTRACT_WORKER`, value: `Contract Worker` },
		{ key: `COMMISSION_EARNER`, value: `Commission Earner` },
		{ key: `LABOUR_BROKER`, value: `Labour Broker` },
		{ key: `PERMANENT_WORKER`, value: `Permanent Worker` },
		{ key: `TEMPORARY_CASUAL_SEASONAL`, value: `Temporary Casual Seasonal` },
		{ key: `DOMESTIC_WORKER`, value: `Domestic Worker` }
	],
	"Self Employed": [
		{ key: `BUSINESS_OWNER`, value: `Business Owner` },
		{ key: `SOLE_PROPRIETER_TRADER`, value: `Sole Proprieter Trader` },
		{ key: `SOLE_PROPRIETER_CONTRACTOR`, value: `Sole Proprieter Contractor` },
		{ key: `INFORMALLY_SELF_EMPLOYED`, value: `Informally Self Employed` }
	],
	"Unemployed": [
		{ key: `UNEMPLOYED`, value: `Unemployed` },
		{ key: `FULL_TIME_STUDENT`, value: `Full Time Student` },
		{ key: `HOME_EXECUTIVE`, value: `Home Executive` }
	],
	"Pensioner": [
		{ key: `ALL_PAY_PENSION`, value: `All Pay Pension` },
		{ key: `ALL_PAY_PENSION_AND_GRANT`, value: `All Pay Pension And Grant` },
		{ key: `GOVERNMENT_PENSION`, value: `Government Pension` },
		{ key: `GRANT`, value: `Grant` },
		{ key: `PRIVATE_PENSION`, value: `Private Pension` }
	],
	"Minor": [{ key: `NONE`, value: `None` }]
});

let SOF_EMPLOYED = [];
export const SOURCE_FUNDS = Object.freeze({
	'Employed': SOF_EMPLOYED = [
		{ key: `NO_VALUE`, value: `` },
		{ key: `SALARY`, value: `Salary` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `COMMISSION`, value: `Commission` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance And Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations And Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` }
	],
	"Unemployed": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance And Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations And Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` }
	],
	"Self Employed": SOF_EMPLOYED,
	"Pensioner": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance And Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations And Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` }
	],
	"Minor": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `SALARY`, value: `Salary` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `COMMISSION`, value: `Commission` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance And Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations And Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` }
	]
});

export const INCOME_FREQUENCY = Object.freeze([
			`None`,
			`Annually`,
			`Bi-Annually`,
			`Quaterly`,
			`Monthly`,
			`Fortnightly`,
			`Weekly`
]);

export const INDUSTRY_CODE = {
	'00': `NONE`,
	'01': `INDIVIDUAL`,
	'02': `AGRICULTURE_FORESTRY_AND_FISHING`, 
	'03': `MINING`, 
	'04': `MANUFACTURING`,
	'05': `CONSTRUCTION`, 
	'06': `ELECTRICITY_GAS_AND_WATER`, 
	'07': `TRADE_AND_ACCOMMODATION`, 
	'08': `TRANSPORT_AND_COMMUNICATION`, 
	'09': `FINANCE_AND_INSURANCE`, 
	'10': `REAL_ESTATE_AND_BUSINESS_SERVICES`, 
	'11': `COMMUNITY_SOCIAL_AND_PERSONAL`, 
	'12': `OTHER`, 
	'13': `SMELTING_FERROUS_ALLOYS`, 
	'14': `ALCOHOL`, 
	'18': `INFORMAL`, 
	'20': `PERSONAL_AND_HOUSEHOLD_GOODS`, 
	'21': `MANAGEMENT_AND_CONSULTING`, 
	'22': `SECURITY`, 
	'23': `RESOURCES_BASIC`, 
	'24': `LEGAL`, 
	'25': `HEALTH_CARE`, 
	'26': `SERVICES`, 
	'27': `NOT_SELECTED_YET`, 
	'35': `PENSIONERS_AND_SOCIAL_GRANTS`, 
	'38': `TRAINING_AND_EDUCATION`, 
	'39': `RELIGIOUS_ORGANIZATIONS`, 
	'40': `POLITICAL_ORGANIZATIONS`, 
	'41': `NGOS`, 
	'42': `PARASTATALS`, 
	'43': `MUNICIPALITIES`, 
	'': `NO_VALUE`
};