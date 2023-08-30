/**
 * LifeClientSummary mock response
 *
 * @export
 * @constant insureLifeClientSummary
 */

export const insureLifeClientSummary = {
	"policies": [
		{
			"contractReference": `LC00001234`,
			"policyStatus": `Active`,
			"policyStartDate": `2023-08-21T09:10:46.110Z`,
			"actualCancellationDate": `2023-08-21T09:10:46.110Z`,
			"cancellationReason": `string`,
			"totalPremium": 753,
			"lastCollectionDate": `2023-08-21T09:10:46.110Z`,
			"lastCollectionAmount": 0,
			"nextCollectionDate": `2023-08-21T09:10:46.110Z`,
			"nextCollectionAmount": 0,
			"bankDetails": {
				"accountName": `string`,
				"branchCode": `string`,
				"accountNumber": `string`,
				"bank": `string`,
				"accountType": `Bond`,
				"collectionDay": 0
			},
			"pockets": [
				{
					"pocketType": `OnceOffPayout`,
					"coverage": 25000,
					"premium": 251
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 25000,
					"premium": 251
				},
				{
					"pocketType": `Education`,
					"coverage": 25000,
					"premium": 251
				}
			],
			"arrears": [
				{
					"arrearsPaymentStatus": `string`,
					"arrearsPaymentDueAmount": `0`,
					"arrearsPaymentDueDate": `2023-08-21T09:10:46.110Z`,
					"arrearsPaymentReceivedAmount": `string`,
					"arrearsPaymentReceivedDate": `2023-08-21T09:10:46.110Z`
				},
				{
					"arrearsPaymentStatus": `string`,
					"arrearsPaymentDueAmount": `0`,
					"arrearsPaymentDueDate": `2023-07-21T09:10:46.110Z`,
					"arrearsPaymentReceivedAmount": `string`,
					"arrearsPaymentReceivedDate": `2023-07-21T09:10:46.110Z`
				}
			],
			"beneficiaries": [
				{
					"firstName": `Demo`,
					"lastName": `Dave`,
					"rolePlayer": `string`,
					"onceOffPayoutBenefitAmount": 12500,
					"educationBenefitAmount": 12500,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Bond`,
						"collectionDay": 0
					},
					"relationship": `MainLife`,
					"gender": `Male`,
					"dateOfBirth": `2023-08-21T09:10:46.110Z`
				},
				{
					"firstName": `Mocked`,
					"lastName": `Mark`,
					"rolePlayer": `string`,
					"onceOffPayoutBenefitAmount": 12500,
					"educationBenefitAmount": 12500,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Bond`,
						"collectionDay": 0
					},
					"relationship": `MainLife`,
					"gender": `Male`,
					"dateOfBirth": `2023-08-21T09:10:46.110Z`
				}
			],
			"roles": [
				{
					"rolePlayer": `Spouse`,
					"firstName": `string`,
					"lastName": `string`,
					"gender": `Male`,
					"dateOfBirth": `2023-08-21T09:10:46.110Z`,
					"relationshipToInsured": `MainLife`
				}
			],
			"collectionDay": 0
		}
	]
};