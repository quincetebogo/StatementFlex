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
				"accountName": `Mr Cool Dave`,
				"branchCode": `012454`,
				"accountNumber": `55897854`,
				"bank": `CAPITEC BANK`,
				"accountType": `Savings`,
				"collectionDay": 21
			},
			"pockets": [
				{
					"pocketType": `OnceOffPayout`,
					"coverage": 25000,
					"premium": 261
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 12500,
					"premium": 251
				},
				{
					"pocketType": `Education`,
					"coverage": 0,
					"premium": 241
				}
			],
			"arrears": [
				{
					"arrearsID": `1`,
					"arrearsPaymentStatus": `string`,
					"arrearsPaymentDueAmount": 200,
					"arrearsPaymentDueDate": `2023-08-21T09:10:46.110Z`,
					"arrearsPaymentReceivedAmount": `string`,
					"arrearsPaymentReceivedDate": `2023-08-21T09:10:46.110Z`
				},
				{
					"arrearsID": `2`,
					"arrearsPaymentStatus": `string`,
					"arrearsPaymentDueAmount": 150,
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 0,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
		},
		{
			"contractReference": `LC00001288`,
			"policyStatus": `Cancelled`,
			"policyStartDate": `2023-08-21T09:10:46.110Z`,
			"actualCancellationDate": `2023-08-21T09:10:46.110Z`,
			"cancellationReason": `string`,
			"totalPremium": 753,
			"lastCollectionDate": `2023-08-21T09:10:46.110Z`,
			"lastCollectionAmount": 0,
			"nextCollectionDate": `2023-08-21T09:10:46.110Z`,
			"nextCollectionAmount": 0,
			"bankDetails": {
				"accountName": `Miss Mirriam Nxopo`,
				"branchCode": `470010`,
				"accountNumber": `1196035138`,
				"bank": `CAPITEC BANK LIMITED`,
				"accountType": `Savings`,
				"collectionDay": 11
			},
			"pockets": [
				{
					"pocketType": `OnceOffPayout`,
					"coverage": 25000,
					"premium": 261
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 12500,
					"premium": 251
				},
				{
					"pocketType": `Education`,
					"coverage": 0,
					"premium": 241
				}
			],
			"arrears": [
				{
					"arrearsPaymentStatus": `string`,
					"arrearsPaymentDueAmount": `22`,
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
		},
		{
			"contractReference": `LC00001299`,
			"policyStatus": `Lapsed`,
			"policyStartDate": `2023-08-21T09:10:46.110Z`,
			"actualCancellationDate": `2023-08-21T09:10:46.110Z`,
			"cancellationReason": `string`,
			"totalPremium": 753,
			"lastCollectionDate": `2023-08-21T09:10:46.110Z`,
			"lastCollectionAmount": 0,
			"nextCollectionDate": `2023-08-21T09:10:46.110Z`,
			"nextCollectionAmount": 0,
			"bankDetails": {
				"accountName": `Miss Mirriam Nxopo`,
				"branchCode": `470010`,
				"accountNumber": `1196035138`,
				"bank": `CAPITEC BANK LIMITED`,
				"accountType": `Savings`,
				"collectionDay": 11
			},
			"pockets": [
				{
					"pocketType": `OnceOffPayout`,
					"coverage": 25000,
					"premium": 261
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 12500,
					"premium": 251
				},
				{
					"pocketType": `Education`,
					"coverage": 0,
					"premium": 241
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 0,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
		},
		{
			"contractReference": `LC00001389`,
			"policyStatus": `Lapsed`,
			"policyStartDate": `2023-08-21T09:10:46.110Z`,
			"actualCancellationDate": `2023-08-21T09:10:46.110Z`,
			"cancellationReason": `string`,
			"totalPremium": 753,
			"lastCollectionDate": `2023-08-21T09:10:46.110Z`,
			"lastCollectionAmount": 0,
			"nextCollectionDate": `2023-08-21T09:10:46.110Z`,
			"nextCollectionAmount": 0,
			"bankDetails": {
				"accountName": `Miss Mirriam Nxopo`,
				"branchCode": `470010`,
				"accountNumber": `1196035138`,
				"bank": `CAPITEC BANK LIMITED`,
				"accountType": `Savings`,
				"collectionDay": 11
			},
			"pockets": [
				{
					"pocketType": `OnceOffPayout`,
					"coverage": 25000,
					"premium": 261
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 12500,
					"premium": 251
				},
				{
					"pocketType": `Education`,
					"coverage": 0,
					"premium": 241
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 12500,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 0,
					"bankDetails": {
						"accountName": `string`,
						"branchCode": `string`,
						"accountNumber": `string`,
						"bank": `string`,
						"accountType": `Savings`,
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