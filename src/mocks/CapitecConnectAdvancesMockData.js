/**
 * Advances History mock response
 *
 * @export
 * @constant advancesMockData
 */

export const advancesMockData = {
	"content": [
		{
			"reversible": true,
			"channel": "app",
			"cif": "123456789",
			"msisdn": "27623456789",
			"transactionReference": "c9cd1324-24d1-11ee-be56-0242ac120002",
			"amount": 5,
			"productName": "30MB",
			"bundleType": "DATA",
			"type": "ADVANCE",
			"recharges": [
				{
					"beneficiaryName": "27623456789",
					"msisdn": "27623456789",
					"bundleType": "DATA",
					"resourceType": "DATA",
					"type": "ADVANCE",
					"transactionReference": "c9cd1324-24d1-11ee-be56-0242ac120002",
					"status": "SUCCESSFUL",
					"statusReason": "string",
					"quantity": 30,
					"quantityMeasurement": "MB",
					"productId": 1234,
					"productShortDescription": "30MB Bundle",
					"staffBundle": true,
					"promoBundle": true,
					"expiryBundle": true,
					"transactionDateTime": "2024-01-04T08:15:48.553Z"
				}
			],
			"transactionDate": "2024-01-04T08:15:48.553Z",
			"notReversible": true,
			"transactions": [
				{
					"msisdn": "27623456789",
					"type": "ADVANCE",
					"transactionReference": "c9cd1324-24d1-11ee-be56-0242ac120002",
					"status": "SUCCESSFUL",
					"statusReason": "string",
					"amount": 5,
					"accountNumber": 3000000000,
					"sourceOfFunds": "SAVINGS",
					"journalReference": "433899",
					"transactionDateTime": "2024-01-04T08:15:48.554Z",
					"reversalReason": "string",
					"reversedBy": "string"
				}
			]
		}
	],
	"totalElements": 1
};