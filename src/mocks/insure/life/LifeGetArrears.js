/**
 * Life Get Arrears mock response
 *
 * @export
 * @constant insureLifeGetArrears
 */
export const insureLifeGetArrears = {
	"arrears": [
		{
			"arrearsId": `AR0000000491`,
			"arrearsPaymentStatus": `PENDING`,
			"arrearsPaymentDueAmount": 1027.9,
			"arrearsPaymentDueDate": `2024-03-01T00:00:00+00:00`,
			"arrearsPaymentReceivedAmount": `0.0000000000`
		},
		{
			"arrearsId": `AR0000000492`,
			"arrearsPaymentStatus": `PENDING`,
			"arrearsPaymentDueAmount": 1027.9,
			"arrearsPaymentDueDate": `2024-04-01T00:00:00+00:00`,
			"arrearsPaymentReceivedAmount": `0.0000000000`
		}
	],
	"payableAccounts": [
		{
			"accountName": `Mentor`,
			"branchCode": `470010`,
			"accountNumber": `00000002100385123`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 0.0,
			"currentBalance": 0.0
		},
		{
			"accountName": `Nkocy`,
			"branchCode": `470010`,
			"accountNumber": `00000001996255582`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 0.67,
			"currentBalance": 0.67
		},
		{
			"accountName": `NADAR`,
			"branchCode": `470010`,
			"accountNumber": `00000001332889954`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 0.0,
			"currentBalance": -0.49
		},
		{
			"accountName": `SAVINGS ACCOUNT`,
			"branchCode": `470010`,
			"accountNumber": `00000001332886319`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`,
			"availableBalance": 2470.0,
			"currentBalance": 2500.0
		}
	]
};