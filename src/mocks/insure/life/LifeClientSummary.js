/**
 * LifeClientSummary mock response
 *
 * @export
 * @constant insureLifeClientSummary
 */

export const insureLifeClientSummary = {
	"policies": [
		{
			"contractReference": "LP00001393",
			"policyStatus": "In Force",
			"policyStartDate": "2023-11-14T00:00:00+00:00",
			"totalPremium": 1163.2,
			"nextCollectionDate": "2023-12-28T00:00:00+00:00",
			"nextCollectionAmount": 1163.2,
			"bankDetails": {
				"accountName": "Justin Brennand",
				"branchCode": "470010",
				"accountNumber": "2010184199",
				"bank": "CAPITEC",
				"accountType": "Savings",
				"collectionDay": 28,
				"mandateReference": "N/A"
			},
			"pockets": [
				{
					"pocketType": "LumpSum",
					"coverage": 1000000.0,
					"premium": 571.1
				},
				{
					"pocketType": "MonthlyPayout",
					"coverage": 1000000.0,
					"premium": 571.1
				},
				{
					"pocketType": "Education",
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"arrears": [
				{
					"arrearsID": "AR0000000194",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "414.1200000000",
					"arrearsPaymentDueDate": "2023-09-05T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				},
				{
					"arrearsID": "AR0000000195",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "414.1200000000",
					"arrearsPaymentDueDate": "2023-10-05T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				},
				{
					"arrearsID": "AR0000000196",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "414.1200000000",
					"arrearsPaymentDueDate": "2023-11-05T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				}
			],
			"beneficiaries": [
				{
					"firstName": "Bene",
					"lastName": "Fish",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 1000000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 1000000.0,
					"bankDetails": {
						"branchCode": "470010",
						"accountNumber": "2010184188",
						"bank": "CAPITEC",
						"accountType": "Savings"
					},
					"relationship": "Others",
					"gender": "Male",
					"dateOfBirth": "1968-12-16T00:00:00+00:00",
					"contactNumber": "0823214321",
					"clientType": "Adult",
					"clientId": "E17FEFFB-BC20-4662-9718-C520C99C3E53"
				}
			],
			"totalPolicySumAssured": 2000000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false
		},
		{
			"contractReference": "LP00001379",
			"policyStatus": "Cancelled",
			"policyStartDate": "2023-11-09T00:00:00+00:00",
			"actualCancellationDate": "2023-11-14T00:00:00+00:00",
			"cancellationReason": "Better Off at Another Provider",
			"totalPremium": 0.0,
			"nextCollectionDate": "2023-12-28T00:00:00+00:00",
			"nextCollectionAmount": 1163.2,
			"bankDetails": {
				"accountName": "Justin Brennand",
				"branchCode": "470010",
				"accountNumber": "2010184188",
				"bank": "CAPITEC",
				"accountType": "Savings",
				"collectionDay": 28,
				"mandateReference": "f17651f4-f3bd-4445-adf8-58ec69c3be40"
			},
			"pockets": [
				{
					"pocketType": "LumpSum",
					"coverage": 1000000.0,
					"premium": 571.1
				},
				{
					"pocketType": "MonthlyPayout",
					"coverage": 1000000.0,
					"premium": 571.1
				},
				{
					"pocketType": "Education",
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"beneficiaries": [
				{
					"firstName": "Bene",
					"lastName": "Fish",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 1000000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 1000000.0,
					"bankDetails": {
						"branchCode": "470010",
						"accountNumber": "2010184188",
						"bank": "CAPITEC",
						"accountType": "Savings"
					},
					"relationship": "Others",
					"gender": "Male",
					"dateOfBirth": "1968-12-16T00:00:00+00:00",
					"contactNumber": "0823214321",
					"clientType": "Adult",
					"clientId": "983A69FA-E493-4E70-B9A9-1CB577DED4F4"
				}
			],
			"totalPolicySumAssured": 2000000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false
		}
	]
};