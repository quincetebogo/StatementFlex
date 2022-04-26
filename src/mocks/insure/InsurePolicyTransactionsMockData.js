/**
 * Policy Transaction History mock response
 *
 * @export
 * @constant PolicyTransactionHistory
 */
 export const PolicyTransactionHistory = {
	"contractReference": "CRef12345",
	"transactions": [
		{
			"premiumDueDate": "2022-04-20T12:16:05.229Z",
			"premium": 12000,
			"type": "Premium Date",
			"date": "2022-04-15T12:16:05.229Z",
			"amount": 5000,
			"reason": "verify statement",
			"bankDetails": {
			  "accountName": "John Smith",
			  "branchCode": "250655",
			  "accountNumber": "627***5642",
			  "bank": "FNB",
			  "accountType": "Cheque",
			  "collectionDay": 0
			}
		},
		{
			"premiumDueDate": "2022-02-18T12:16:05.229Z",
			"premium": 9000,
			"type": "Premium Date",
			"date": "2022-04-15T12:16:05.229Z",
			"amount": 10000,
			"reason": "due",
			"bankDetails": {
			  "accountName": "Sophia",
			  "branchCode": "250655",
			  "accountNumber": "657***4258",
			  "bank": "FNB",
			  "accountType": "Savings",
			  "collectionDay": 0
			}
		},
		{
			"premiumDueDate": "2022-03-15T12:16:05.229Z",
			"premium": 8000,
			"type": "Date",
			"date": "2022-03-25T12:16:05.229Z",
			"amount": 7500,
			"reason": "due date is over",
			"bankDetails": {
			  "accountName": "Lethabo",
			  "branchCode": "537155",
			  "accountNumber": "802***524",
			  "bank": "ABSA",
			  "accountType": "Bond",
			  "collectionDay": 0
			}
		}
	]
}