export const getKey = (source, value) => {
	return source?.find(item => item.value === value)?.key || ``;
}
export const getValue = (source, key) => {
	return source?.find(item => item.key === key)?.value || ``
};

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
		{ key: `DOMESTIC_WORKER`, value: `Domestic Worker` },
		{ key: `LABOUR_BROKER`, value: `Labour Broker` },
		{ key: `PERMANENT_WORKER`, value: `Permanent Worker` },
		{ key: `TEMPORARY_CASUAL_SEASONAL`, value: `Temporary/Casual/Seasonal Worker` }
	],
	"Self Employed": [
		{ key: `NONE`, value: `` },
		{ key: `BUSINESS_OWNER`, value: `Business Owner` },
		{ key: `INFORMALLY_SELF_EMPLOYED`, value: `Informally Self-Employed` },
		{ key: `SOLE_PROPRIETER_TRADER`, value: `Sole Proprieter: Trader` },
		{ key: `SOLE_PROPRIETER_CONTRACTOR`, value: `Sole Proprieter: Contractor` }
	],
	"Unemployed": [
		{ key: `NONE`, value: `` },
		{ key: `FULL_TIME_STUDENT`, value: `Full Time Student` },
		{ key: `HOME_EXECUTIVE`, value: `Home Executive` },
		{ key: `UNEMPLOYED`, value: `Unemployed` }
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
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `COMMISSION`, value: `Commission` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `INHERITENCE`, value: `Inheritence` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `SALARY`, value: `Salary` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` }
	],
	"Unemployed": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `INHERITENCE`, value: `Inheritence` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` }
	],
	"Self Employed": SOF_EMPLOYED,
	"Pensioner": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `INHERITENCE`, value: `Inheritence` },
		{ key: `PENSION`, value: `Pension` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` }
	],
	"Minor": [
		{ key: `NO_VALUE`, value: `` },
		{ key: `ALLOWANCE_AND_MAINTENANCE`, value: `Allowance/Maintenance` },
		{ key: `BUSINESS_PROFIT`, value: `Business Profit` },
		{ key: `COMMISSION`, value: `Commission` },
		{ key: `DONATIONS_AND_GIFTS`, value: `Donations and Gifts` },
		{ key: `INHERITENCE`, value: `Inheritence` },
		{ key: `INVESTMENT_INCOME`, value: `Investment Income` },
		{ key: `PRIZE_WINNINGS`, value: `Prize Winnings` },
		{ key: `RENTAL_INCOME`, value: `Rental Income` },
		{ key: `SALARY`, value: `Salary` },
		{ key: `SOCIAL_GRANT`, value: `Social Grant` }
	]
});

export const INCOME_FREQUENCY = Object.freeze([
		{ key: `NONE`, value: `` },
		{ key: `Annually`, value: `Annually` },
		{ key: `Bi_Annually`, value: `Bi-Annually` },
		{ key: `Fortnightly`, value: `Fortnightly` },
		{ key: `Monthly`, value: `Monthly` },
		{ key: `Quarterly`, value: `Quarterly` },
		{ key: `Weekly`, value: `Weekly` }
]);

export const INDUSTRY_CODE = [
	{ key: `NONE`, value: `` },
	{ key: `INDIVIDUAL`, value: `Individual` },
	{ key: `AGRICULTURE_FORESTRY_AND_FISHING`, value: `Agriculture/forestry and fishing` }, 
	{ key: `COMMUNITY_SOCIAL_AND_PERSONAL`, value: `Community/social and personal` }, 
	{ key: `CONSTRUCTION`, value: `Construction` }, 
	{ key: `ELECTRICITY_GAS_AND_WATER`, value: `Electricity/gas and water` },
	{ key: `FINANCE_AND_INSURANCE`, value: `Finance and insurance` }, 
	{ key: `HEALTH_CARE`, value: `Health Care` }, 
	{ key: `INFORMAL`, value: `Informal` }, 
	{ key: `LEGAL`, value: `Legal` }, 
	{ key: `MANAGEMENT_AND_CONSULTING`, value: `Management and Consulting` }, 
	{ key: `MANUFACTURING`, value: `Manufacturing` },
	{ key: `MINING`, value: `Mining` }, 
	{ key: `MUNICIPALITIES`, value: `Municipalities` }, 
	{ key: `NGOS`, value: `NGOs` }, 
	{ key: `NOT_SELECTED_YET`, value: `Not Selected Yet` },  
	{ key: `OTHER`, value: `Other` }, 
	{ key: `PARASTATALS`, value: `Parastatals` }, 
	{ key: `PENSIONERS_AND_SOCIAL_GRANTS`, value: `Pensioners and Social Grants` }, 
	{ key: `PERSONAL_AND_HOUSEHOLD_GOODS`, value: `Personal and Household Goods` }, 
	{ key: `POLITICAL_ORGANIZATIONS`, value: `Political organizations` }, 
	{ key: `REAL_ESTATE_AND_BUSINESS_SERVICES`, value: `Real estate and business services` },
	{ key: `RELIGIOUS_ORGANIZATIONS`, value: `Religious organizations` }, 
	{ key: `RESOURCES_BASIC`, value: `Resources - Basic` }, 
	{ key: `SECURITY`, value: `Security` }, 
	{ key: `SERVICES`, value: `Services` }, 
	{ key: `SMELTING_FERROUS_ALLOYS`, value: `Smelting - Ferrous Alloys` }, 
	{ key: `TRADE_AND_ACCOMMODATION`, value: `Trade and accommodation` }, 
	{ key: `TRAINING_AND_EDUCATION`, value: `Training and Education` }, 
	{ key: `TRANSPORT_AND_COMMUNICATION`, value: `Transport and communication` }, 
	{ key: `ALCOHOL`, value: `Wine, beer and Spirits` }, 
	{ key: `NO_VALUE`, value: `` }
];

export const ERROR = {
	NICK_NAME: `No special characters allowed`,
	CONTACT_NUMBER: `Incorrect contact number`,
	EMP_TYPE: `Employment type cannot be empty`,
	EMP_NAME: `Employer name cannot be empty`,
	ADDRESS1: `Address line 1 cannot be empty`,
	SUBURB: `Suburb cannot be empty`,
	CITY: `City cannot be empty`,
	POSTAL_CODE: `Postal code cannot be empty`,
	SOF: `Source of funds cannot be empty`,
	INCOME_RANGE: `Expected monthly income cannot be empty`,
	INCOME_FREQUENCY: `Income frequency cannot be empty`
};