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
		}
	]
};