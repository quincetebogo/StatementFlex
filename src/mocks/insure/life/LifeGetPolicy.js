/**
 * Life Get Policy mock response
 *
 * @export
 * @constant insureLifeGetPolicy
 */
export const insureLifeGetPolicy = {
	"policy": {
		"contractReference": `string`,
		"policyStatus": `string`,
		"policyStartDate": `2023-08-21T13:14:46.216Z`,
		"actualCancellationDate": `2023-08-21T13:14:46.216Z`,
		"cancellationReason": `string`,
		"totalPremium": 0,
		"lastCollectionDate": `2023-08-21T13:14:46.216Z`,
		"lastCollectionAmount": 0,
		"nextCollectionDate": `2023-08-21T13:14:46.216Z`,
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
			"arrearsPaymentDueDate": `2023-08-21T13:14:46.216Z`,
			"arrearsPaymentReceivedAmount": `string`,
			"arrearsPaymentReceivedDate": `2023-08-21T13:14:46.216Z`
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
			"dateOfBirth": `2023-08-21T13:14:46.216Z`
		  }
		],
		"roles": [
		  {
			"rolePlayer": `Spouse`,
			"firstName": `string`,
			"lastName": `string`,
			"gender": `Male`,
			"dateOfBirth": `2023-08-21T13:14:46.216Z`,
			"relationshipToInsured": `MainLife`
		  }
		],
		"collectionDay": 0
	  },
	  "coverageProjection": [
		{
		  "policyYear": 0,
		  "policyDate": `2023-08-21T13:14:46.216Z`,
		  "insurerAge": 0,
		  "coverAmount": 0,
		  "premium": 0
		}
	  ]
};