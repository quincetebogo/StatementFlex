/**
 * Policy Transaction History mock response
 *
 * @export
 * @constant PolicyTransactionHistory
 */
export const PolicyTransactionHistory =
{
	"contractReference": `FP00008602`,
	"transactions": [
		{
			"status": `Pending`,
			"premiumDueDate": `2025-01-02T00:00:00+02:00`,
			"premiumAllocatedDate": `2025-01-02T00:00:00+02:00`,
			"premium": 100.00,
			"transactionStatus": `Financial`,
			"premiumType": `PremiumCollection`,
			"date": `2025-01-02T00:00:00+02:00`,
			"amount": 100.00,
			"bankDetails": {
				"collectionDay": 2,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2010186040`,
				"bank": `Capitec`,
				"accountType": `Savings`
			},
			reason: `Not Provided For`
		},
		{
			"status": `Successful`,
			"premiumDueDate": `2024-12-02T00:00:00+02:00`,
			"premiumAllocatedDate": `2024-11-02T00:00:00+02:00`,
			"premium": 100.00,
			"transactionStatus": `Financial`,
			"premiumType": `PremiumCollection`,
			"date": `2024-12-02T00:00:00+02:00`,
			"amount": 100.00,
			"bankDetails": {
				"collectionDay": 2,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2010186040`,
				"bank": `Capitec`,
				"accountType": `Savings`
			},
			reason: `November Premium`
		},
		{
			"status": `Failed`,
			"premiumDueDate": `2024-11-02T00:00:00+02:00`,
			"premiumAllocatedDate": `2024-11-02T00:00:00+02:00`,
			"premium": 100.00,
			"transactionStatus": `Financial`,
			"premiumType": `PremiumCollection`,
			"date": `2024-11-02T00:00:00+02:00`,
			"amount": 100.00,
			"bankDetails": {
				"collectionDay": 2,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2010186040`,
				"bank": `Capitec`,
				"accountType": `Savings`
			},
			reason: `Debit Order Dispute`
		},
		{
			"status": `Successful`,
			"premiumDueDate": `2024-10-02T00:00:00+02:00`,
			"premiumAllocatedDate": `2024-10-02T00:00:00+02:00`,
			"premium": 100.00,
			"transactionStatus": `Financial`,
			"premiumType": `PremiumCollection`,
			"date": `2024-10-02T00:00:00+02:00`,
			"amount": 100.00,
			"bankDetails": {
				"collectionDay": 2,
				"accountName": `Capitec Bank`,
				"branchCode": `470010`,
				"accountNumber": `2010186040`,
				"bank": `Capitec`,
				"accountType": `Savings`
			},
			reason: ""
		}
	]
};