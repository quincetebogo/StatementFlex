/**
 * Policy Transaction History mock response
 *
 * @export
 * @constant PolicyTransactionHistory
 */
 export const PolicyTransactionHistory = {
	"contractReference": "CF0123456",
	"transactions": [
		{
			"premiumDueDate": "2022-05-20T12:16:05.229Z",
			"premium": 25,
			"type": "Premium Date",
			"date": "2022-05-15T12:16:05.229Z",
			"amount": 25,
			"reason": "Verify Statement",
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
			"premiumDueDate": "2022-05-18T12:16:05.229Z",
			"premium": 30,
			"type": "Premium Date",
			"date": "2022-06-15T12:16:05.229Z",
			"amount": 30,
			"reason": "",
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
			"premiumDueDate": "2022-04-15T12:16:05.229Z",
			"premium": 22,
			"type": "Date",
			"date": "2022-05-25T12:16:05.229Z",
			"amount": 22,
			"reason": "",
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