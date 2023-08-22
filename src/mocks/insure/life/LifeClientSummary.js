/**
 * LifeClientSummary mock response
 *
 * @export
 * @constant insureLifeClientSummary
 */
export const insureLifeClientSummary = {
		"policies": [
		  {
			"contractReference": `string`,
			"policyStatus": `string`,
			"policyStartDate": `2023-08-21T09:10:46.110Z`,
			"actualCancellationDate": `2023-08-21T09:10:46.110Z`,
			"cancellationReason": `string`,
			"totalPremium": 0,
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
				"coverage": 0,
				"premium": 0
			  }
			],
			"arrears": [
			  {
				"arrearsPaymentStatus": `string`,
				"arrearsPaymentDueAmount": `string`,
				"arrearsPaymentDueDate": `2023-08-21T09:10:46.110Z`,
				"arrearsPaymentReceivedAmount": `string`,
				"arrearsPaymentReceivedDate": `2023-08-21T09:10:46.110Z`
			  }
			],
			"beneficiaries": [
			  {
				"firstName": `string`,
				"lastName": `string`,
				"rolePlayer": `string`,
				"onceOffPayoutBenefitAmount": 0,
				"educationBenefitAmount": 0,
				"monthlyPayoutBenefitAmount": 0,
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