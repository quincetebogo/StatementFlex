/**
 * Policy Transaction History mock response
 *
 * @export
 * @constant PolicyTransactionHistory
 */
export const PolicyTransactionHistory =
{
	"contractReference": `FP00002189`,
	"transactions": [
		{
			"transactionStatus": `Financial`,
			"transactionType": `Billing`,
			"accountType": `SV`,
			"date": `2022-09-15T00:00:00+00:00`,
			"reason": `Here is your damn reason..!`,
			"bankDetails": {
				"collectionDay": 15,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2009939669`,
				"bank": `Capitec`,
				"accountType": `Savings`
			}
		},
		{
			"premiumDueDate": `2022-09-15T00:00:00+00:00`,
			"premium": 120.00,
			"transactionStatus": `Financial`,
			"transactionType": `PremiumCollection`,
			"accountType": `SV`,
			"date": `2022-09-15T00:00:00+00:00`,
			"amount": 120.00,
			"reason": `Another great reason, but this one is very long!`,
			"bankDetails": {
				"collectionDay": 15,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2009939669`,
				"bank": `Capitec`,
				"accountType": `Savings`
			}
		},
		{
			"transactionStatus": `Financial`,
			"transactionType": `PremiumReminder`,
			"accountType": `SV`,
			"date": `2022-08-19T00:00:00+00:00`,
			"reason": ``,
			"bankDetails": {
				"collectionDay": 15,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2009939669`,
				"bank": `Capitec`,
				"accountType": `Savings`
			}
		},
		{
			"transactionStatus": `Financial`,
			"transactionType": `Billing`,
			"accountType": `SV`,
			"date": `2022-08-15T00:00:00+00:00`,
			"reason": ``,
			"bankDetails": {
				"collectionDay": 15,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2009939669`,
				"bank": `Capitec`,
				"accountType": `Savings`
			}
		},
		{
			"premiumDueDate": `2022-08-15T00:00:00+00:00`,
			"premium": 120.00,
			"transactionStatus": `Financial`,
			"transactionType": `PremiumCollection`,
			"accountType": `SV`,
			"date": `2022-08-15T00:00:00+00:00`,
			"amount": 120.00,
			"reason": `Awesome reason goes here`,
			"bankDetails": {
				"collectionDay": 15,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2009939669`,
				"bank": `Capitec`,
				"accountType": `Savings`
			}
		}
	]
};