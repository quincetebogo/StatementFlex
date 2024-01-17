/**
 * Savings Account Landing page mock response
 *
 * @export
 * @constant savingsAccountDetails
 */

export const savingsAccountDetails = {
	"accountNumber": '1928247288',
	"accountBalance": 20916.1,
	"accountAvailableBalance": 20567.23,
	"accountPendingAmount": 349,
	"interestRatePercentage": '5.5%',
	"accountStatus": 'Active',
	"pendingMandateCount": 2
};

export const savingsPlanDetails = {
	"creditProductAmount": null,
	"creditProductDescription": null,
	"insureProductAmount": null,
	"insureProductDescription": null,
	"liveBetterBankingProductAmount": null,
	"liveBetterBankingProductDescription": null,
	"pendingMandateCount": 0,
	"savingsAccountProductAmount": "R167.64",
	"savingsAccountProductDescription": "Available balance",
	"savingsPlanProductAmount": "R23501.96",
	"savingsPlanProductDescription": "Total saved",
	"savingsPlans": [
		{
			"accountNumber": 1707712962,
			"accountStatus": "OPEN",
			"accruedInterestCurrentMonth": 0,
			"accruedInterestLastMonth": 0,
			"availableBalance": 0,
			"currentBalance": 0,
			"dateOpened": "2020-05-11T00:00:00+00:00",
			"feesLastMonth": 0,
			"holds": 0,
			"interestEarned": 0,
			"interestRate": 2.75,
			"lastUpdate": "9999-12-31T23:59:59+00:00",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"outstandingAuthorizations": 0,
			"planName": "THABANG",
			"planType": "SAVINGS PLAN",
			"postingRestrictions": "N"
		},
		{
			"accountNumber": 1702767165,
			"accountStatus": "CLOSED",
			"accruedInterestCurrentMonth": 0,
			"accruedInterestLastMonth": 0,
			"availableBalance": 0,
			"currentBalance": 0,
			"dateOpened": "2020-03-19T00:00:00+00:00",
			"feesLastMonth": 0,
			"holds": 0,
			"interestEarned": 0,
			"interestRate": 2.75,
			"lastUpdate": "2020-03-19T00:00:00+00:00",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"outstandingAuthorizations": 0,
			"planName": "Dipuo",
			"planType": "SAVINGS PLAN",
			"postingRestrictions": "N"
		},
		{
			"accountNumber": 1682399611,
			"accountStatus": "OPEN",
			"accruedInterestCurrentMonth": 138.8226,
			"accruedInterestLastMonth": 152.7,
			"availableBalance": 0,
			"availableContributions": 19979970,
			"contributionLimit": 20000000,
			"currentBalance": 23501.96,
			"dateFixed": "2019-12-19T00:00:00+00:00",
			"dateOpened": "2019-12-19T00:00:00+00:00",
			"effectiveInterestRate": 7.98,
			"feesLastMonth": 0,
			"holds": 0,
			"interestEarned": 1593.05,
			"interestOption": "R",
			"interestTiers": [
				{
					"effective": "7.12",
					"nominal": "6.9",
					"range": "R0 - R9 999",
					"term": "48"
				},
				{
					"effective": "7.98",
					"nominal": "7.7",
					"range": "R10 000 - R24 999",
					"term": "48"
				},
				{
					"effective": "8.3",
					"nominal": "8",
					"range": "R25 000 - R99 999",
					"term": "48"
				},
				{
					"effective": "8.41",
					"nominal": "8.1",
					"range": "R100 000+",
					"term": "48"
				}
			],
			"lastUpdate": "2022-01-18T00:00:00+00:00",
			"maturityDate": "2023-12-19T00:00:00+00:00",
			"nominalInterestRate": 7.7,
			"outstandingAuthorizations": 0,
			"planName": "INVESTMENT",
			"planType": "FIXED TERM SAVINGS PLAN",
			"postingRestrictions": "N",
			"term": 48,
			"totalContributions": 20030
		},
		{
			"dateFixed": "2022-01-31T00:00:00+00:00",
			"term": 9,
			"interestOption": "R",
			"totalContributions": 100000.0,
			"availableContributions": 19900000.0,
			"contributionLimit": 20000000.0,
			"nominalInterestRate": 4.65,
			"effectiveInterestRate": 4.75,
			"maturityDate": "2022-10-31T00:00:00+00:00",
			"interestTiers": [
				{
					"term": "9",
					"range": "R0 - R9 999",
					"nominal": "3.85",
					"effective": "3.92"
				},
				{
					"term": "9",
					"range": "R10 000 - R24 999",
					"nominal": "3.9",
					"effective": "3.97"
				},
				{
					"term": "9",
					"range": "R25 000 - R99 999",
					"nominal": "4.45",
					"effective": "4.54"
				},
				{
					"term": "9",
					"range": "R100 000+",
					"nominal": "4.65",
					"effective": "4.75"
				}
			],
			"planType": "FIXED TERM SAVINGS PLAN",
			"planName": "BELEGGING",
			"accountType": 201,
			"accountNumber": 1630196159,
			"currentBalance": 103138.0,
			"availableBalance": 0.0,
			"accruedInterestLastMonth": 405.72,
			"accruedInterestCurrentMonth": 131.395,
			"interestEarned": 2768.55,
			"interestCategory": 2,
			"feesLastMonth": "",
			"postingRestrictions": "N",
			"outstandingAuthorizations": 0.0,
			"holds": 0.0,
			"dateOpened": "2019-03-07T00:00:00+00:00",
			"lastUpdate": "2022-09-30T00:00:00+00:00",
			"accountStatus": "OPEN"
		},
		{
			"dateFixed": "2021-04-06T00:00:00+00:00",
			"term": 9,
			"interestOption": "R",
			"totalContributions": 100000.0,
			"availableContributions": 19900000.0,
			"contributionLimit": 20000000.0,
			"nominalInterestRate": 4.65,
			"effectiveInterestRate": 4.75,
			"maturityDate": "2022-10-31T00:00:00+00:00",
			"interestTiers": [
				{
					"term": "9",
					"range": "R0 - R9 999",
					"nominal": "3.85",
					"effective": "3.92"
				},
				{
					"term": "9",
					"range": "R10 000 - R24 999",
					"nominal": "3.9",
					"effective": "3.97"
				},
				{
					"term": "9",
					"range": "R25 000 - R99 999",
					"nominal": "4.45",
					"effective": "4.54"
				},
				{
					"term": "9",
					"range": "R100 000+",
					"nominal": "4.65",
					"effective": "4.75"
				}
			],
			"planType": "FIXED TERM SAVINGS PLAN",
			"planName": "BELEGGING First",
			"accountType": 201,
			"accountNumber": 1630196158,
			"currentBalance": 103138.0,
			"availableBalance": 10634.0,
			"accruedInterestLastMonth": 405.72,
			"accruedInterestCurrentMonth": 131.395,
			"interestEarned": 2768.55,
			"interestCategory": 2,
			"feesLastMonth": "",
			"postingRestrictions": "N",
			"outstandingAuthorizations": 0.0,
			"holds": 0.0,
			"dateOpened": "2019-03-07T00:00:00+00:00",
			"lastUpdate": "2022-09-30T00:00:00+00:00",
			"accountStatus": "OPEN"
		}

	]
};


export const getClientProducts = {
	"savingsProducts": [
		{
			"accountNumber": 2120083343,
			"availableBalance": 20.33,
			"currentBalance": 20.33,
			"accountName": "Christmas party",
			"accountType": 200,
			"interestCategory": 1,
			"accountTypeDescription": "SAVINGS PLAN",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2023-05-29T00:00:00+00:00",
			"accountStatus": 0,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 3.0,
			"interestForTheTaxYear": 0.33,
			"accrueIntrestCurrentMonth": 0.05179,
			"interestRecivedLastMonth": 0.1
		},
		{
			"accountNumber": 2095556816,
			"availableBalance": 9.03,
			"currentBalance": 9.03,
			"accountName": "LIVE BETTER SAVINGS ACCOUNT",
			"accountType": 210,
			"interestCategory": 1,
			"accountTypeDescription": "LIVE BETTER SAVINGS ACCOUNT",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2023-03-04T00:00:00+00:00",
			"accountStatus": 0,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 3.0,
			"interestForTheTaxYear": 0.07,
			"accrueIntrestCurrentMonth": 0.0259,
			"interestRecivedLastMonth": 0.02
		},
		{
			"accountNumber": 2095540812,
			"availableBalance": 3201.44,
			"currentBalance": 3231.44,
			"accountName": "SAVINGS ACCOUNT",
			"accountType": 300,
			"interestCategory": 1,
			"accountTypeDescription": "SAVINGS ACCOUNT",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2023-03-04T00:00:00+00:00",
			"accountStatus": 0,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 3.0,
			"interestForTheTaxYear": 15.07,
			"accrueIntrestCurrentMonth": 8.85172,
			"interestRecivedLastMonth": 10.36
		},
		{
			"accountNumber": 2095520692,
			"availableBalance": 0.0,
			"currentBalance": 0.0,
			"accountName": "LIVE BETTER SAVINGS ACCOUNT",
			"accountType": 210,
			"interestCategory": 1,
			"accountTypeDescription": "LIVE BETTER SAVINGS ACCOUNT",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2023-03-04T00:00:00+00:00",
			"accountStatus": 10,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 3.0,
			"interestForTheTaxYear": 0.0,
			"accrueIntrestCurrentMonth": 0.0,
			"interestRecivedLastMonth": 0.0
		},
		{
			"accountNumber": 1900558511,
			"availableBalance": 0.0,
			"currentBalance": 0.0,
			"accountName": "STOP ORDER",
			"accountType": 200,
			"interestCategory": 1,
			"accountTypeDescription": "SAVINGS PLAN",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2022-02-27T00:00:00+00:00",
			"accountStatus": 10,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 3.0,
			"interestForTheTaxYear": 0.0,
			"accrueIntrestCurrentMonth": 0.0,
			"interestRecivedLastMonth": 0.0
		},
		{
			"accountNumber": 1648842540,
			"availableBalance": 0.0,
			"currentBalance": 0.0,
			"accountName": "SAVINGS ACCOUNT",
			"accountType": 300,
			"interestCategory": 1,
			"accountTypeDescription": "SAVINGS ACCOUNT",
			"maturityDate": "9999-12-31T23:59:59+00:00",
			"termFromDate": "9999-12-31T23:59:59+00:00",
			"termDay": 0,
			"accountOpenDate": "2019-06-15T00:00:00+00:00",
			"accountStatus": 10,
			"moneyInAllowed": true,
			"moneyOutAllowed": true,
			"interestRate": 0.0,
			"interestForTheTaxYear": 0.0,
			"accrueIntrestCurrentMonth": 0.0,
			"interestRecivedLastMonth": 0.0
		}
	]
};

export const disputeQuestions = [
	{
		cueSheetId: `1001045`,
		caseId: `47E5572C-4187-4AFA-92F4-5753A1176A42`,
		clientQuestionWording: `Did you transact with the merchant, or give permission to someone else to transact with this merchant?`,
		agentQuestionWording: ``,
		answers: [
			{
				answerId: `1000001`,
				clientAnswerWording: `Yes`,
				agentAnswerWording: ``
			},
			{
				answerId: `1000002`,
				clientAnswerWording: `No`,
				agentAnswerWording: ``
			}
		]
	},
	{
		cueSheetId: `1001047`,
		caseId: `47E5572C-4187-4AFA-92F4-5753A1176A42`,
		clientQuestionWording: `Did you contact or attempt to contact the merchant?`,
		agentQuestionWording: ``,
		answers: [
			{
				answerId: `1000007`,
				clientAnswerWording: `Yes`,
				agentAnswerWording: ``
			},
			{
				answerId: `1000008`,
				clientAnswerWording: `No`,
				agentAnswerWording: ``
			}
		]
	},
	{
		cueSheetId: `1001058`,
		caseId: `47E5572C-4187-4AFA-92F4-5753A1176A42`,
		clientQuestionWording: `Please select one of the following:`,
		agentQuestionWording: ``,
		answers: [
			{
				answerId: `1000015`,
				clientAnswerWording: `Accomodation or Booking related.`,
				agentAnswerWording: ``
			},
			{
				answerId: `1000016`,
				clientAnswerWording: `Debited for another amount after original transaction.`,
				agentAnswerWording: ``
			},
			{
				answerId: `1000017`,
				clientAnswerWording: `Charged more than once for the same transaction`,
				agentAnswerWording: ``
			},
			{
				answerId: `1000018`,
				clientAnswerWording: `Transaction/Debit amount different`,
				agentAnswerWording: ``
			}
		],
		finalCue: true
	}
];