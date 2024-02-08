export const getKey = (source, value) => source.find(item => item.value === value).key;
export const getValue = (source, key) => source.find(item => item.key === key).value;

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
	EMAIL: `Email address`,
	LINE_1: `Address line 1`,
	LINE_2: `Address line 2 (optional)`,
	SUBURB: `Suburb`,
	CITY: `City`,
	POSTAL_CODE: `Postal code`,
	EMP_STATUS: `Employment status`,
	EMP_TYPE: `Employment type`,
	EMPLOYER: `Employer`,
	INDUSTRY: `Industry`,
	SOF: `Source of funds`,
	EXP_INCOME: `Expected monthly income`,
	INCOME_FREQUENCY: `Income frequency`
});

export const INCOME_RANGE = Object.freeze([
	{ key: `NO_VALUE`, value: `` },
	{ key: `R0_R3000`, value: `R0 to R3000` },
	{ key: `R3001_R6000`, value: `R3001 to R6000` },
	{ key: `R6001_R9000`, value: `R6001 to R9000` },
	{ key: `R9001_R15000`, value: `R9001 to R15000` },
	{ key: `R15001_R25000`, value: `R15001 to R25000` },
	{ key: `R25001_R35000`, value: `R25001 to R35000` },
	{ key: `R35001_R50000`, value: `R35001 to R50000` },
	{ key: `R50000`, value: `> R50000` }
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
		{ key: `NONE`, value: `` },
		{ key: `CONTRACT_WORKER`, value: `Contract Worker` },
		{ key: `COMMISSION_EARNER`, value: `Commission Earner` },
		{ key: `LABOUR_BROKER`, value: `Labour Broker` },
		{ key: `PERMANENT_WORKER`, value: `Permanent Worker` },
		{ key: `TEMPORARY_CASUAL_SEASONAL`, value: `Temporary/Casual/Seasonal Worker` },
		{ key: `DOMESTIC_WORKER`, value: `Domestic Worker` }
	],
	"Self Employed": [
		{ key: `NONE`, value: `` },
		{ key: `BUSINESS_OWNER`, value: `Business Owner` },
		{ key: `SOLE_PROPRIETER_TRADER`, value: `Sole Proprieter: Trader` },
		{ key: `SOLE_PROPRIETER_CONTRACTOR`, value: `Sole Proprieter: Contractor` },
		{ key: `INFORMALLY_SELF_EMPLOYED`, value: `Informally Self-Employed` }
	],
	"Unemployed": [
		{ key: `NONE`, value: `` },
		{ key: `UNEMPLOYED`, value: `Unemployed` },
		{ key: `FULL_TIME_STUDENT`, value: `Full Time Student` },
		{ key: `HOME_EXECUTIVE`, value: `Home Executive` }
	],
	"Pensioner": [
		{ key: `NONE`, value: `` },
		{ key: `ALL_PAY_PENSION`, value: `All Pay Pension` },
		{ key: `ALL_PAY_PENSION_AND_GRANT`, value: `All Pay Pension and Grant` },
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
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `INHERITENCE`, value: `Inheritence` }
	],
	"Unemployed": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `INHERITENCE`, value: `Inheritence` }
	],
	"Self Employed": SOF_EMPLOYED,
	"Pensioner": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `INHERITENCE`, value: `Inheritence` }
	],
	"Minor": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `SALARY`, value: `Salary` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `COMMISSION`, value: `Commission` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `INHERITENCE`, value: `Inheritence` }
	]
});

export const INCOME_FREQUENCY = Object.freeze([
		{ key: `NONE`, value: `` },
		{ key: `A`, value: `Annually` },
		{ key: `B`, value: `Bi_Annually` },
		{ key: `Q`, value: `Quarterly` },
		{ key: `M`, value: `Monthly` },
		{ key: `F`, value: `Fortnightly` },
		{ key: `W`, value: `Weekly` }
]);

export const INDUSTRY_CODE = [
	{ key: `NONE`, value: `` },
	{ key: `INDIVIDUAL`, value: `Individual` },
	{ key: `AGRICULTURE_FORESTRY_AND_FISHING`, value: `Agriculture/forestry and fishing` }, 
	{ key: `MINING`, value: `Mining` }, 
	{ key: `MANUFACTURING`, value: `Manufacturing` },
	{ key: `CONSTRUCTION`, value: `Construction` }, 
	{ key: `ELECTRICITY_GAS_AND_WATER`, value: `Electricity/gas and water` }, 
	{ key: `TRADE_AND_ACCOMMODATION`, value: `Trade and accommodation` }, 
	{ key: `TRANSPORT_AND_COMMUNICATION`, value: `Transport and communication` }, 
	{ key: `FINANCE_AND_INSURANCE`, value: `Finance and insurance` }, 
	{ key: `REAL_ESTATE_AND_BUSINESS_SERVICES`, value: `Real estate and business services` }, 
	{ key: `COMMUNITY_SOCIAL_AND_PERSONAL`, value: `Community/social and personal` }, 
	{ key: `OTHER`, value: `Other` }, 
	{ key: `SMELTING_FERROUS_ALLOYS`, value: `Smelting - Ferrous Alloys` }, 
	{ key: `ALCOHOL`, value: `Alcohol` }, 
	{ key: `INFORMAL`, value: `Informal` }, 
	{ key: `PERSONAL_AND_HOUSEHOLD_GOODS`, value: `Personal & Household Goods` }, 
	{ key: `MANAGEMENT_AND_CONSULTING`, value: `Management and Consulting` }, 
	{ key: `SECURITY`, value: `Security` }, 
	{ key: `RESOURCES_BASIC`, value: `Resources - Basic` }, 
	{ key: `LEGAL`, value: `Legal` }, 
	{ key: `HEALTH_CARE`, value: `Health Care` }, 
	{ key: `SERVICES`, value: `Services` }, 
	{ key: `NOT_SELECTED_YET`, value: `Not Selected Yet` }, 
	{ key: `PENSIONERS_AND_SOCIAL_GRANTS`, value: `Pensioners & Social Grants` }, 
	{ key: `TRAINING_AND_EDUCATION`, value: `Training & Education` }, 
	{ key: `RELIGIOUS_ORGANIZATIONS`, value: `Religious organizations` }, 
	{ key: `POLITICAL_ORGANIZATIONS`, value: `Political organizations` }, 
	{ key: `NGOS`, value: `NGOs` }, 
	{ key: `PARASTATALS`, value: `Parastatals` }, 
	{ key: `MUNICIPALITIES`, value: `Municipalities` }, 
	{ key: `NO_VALUE`, value: `` }
];