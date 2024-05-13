/**
 * premium
 * LifeClientSummary mock response
 *
 * @export
 * @constant insureLifeClientSummary
 */

export const insureLifeClientSummary = {
	"policies": [
		{
			"contractReference": `LP00001393`,
			"policyStatus": `Pending In Force`,
			"policyStatusEnum": `PendingInForce`,
			"displayPolicyStatus": `Active - Pending Payment`,
			"policyStartDate": `2023-11-14T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 1163.2000000000,
			"nextCollectionDate": `2023-12-28T00:00:00+00:00`,
			"nextCollectionAmount": 1163.2000000000,
			"bankDetails": {
				"accountName": `Justin Brennand`,
				"branchCode": `470010`,
				"accountNumber": `2010184199`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 28,
				"mandateReference": `N/A`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 1000000.000000000,
					"premium": 571.1000000000000
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 1000000.000000000,
					"premium": 571.1000000000000
				},
				{
					"pocketType": `Education`,
					"coverage": 0.000000000000000,
					"premium": 0.000000000000000
				}
			],
			"arrears": [],
			"beneficiaries": [
				{
					"firstName": `Bene`,
					"lastName": `Fish`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 1000000.0000000000,
					"educationBenefitAmount": 0.0000000000,
					"monthlyPayoutBenefitAmount": 1000000.0000000000,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1968-12-16T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"clientType": `Adult`,
					"clientId": `E17FEFFB-BC20-4662-9718-C520C99C3E53`
				}
			],
			"guardians": [
				{
					"firstName": `Fred`,
					"lastName": `Flintstone`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 1000000.0000000000,
					"educationBenefitAmount": 0.0000000000,
					"monthlyPayoutBenefitAmount": 1000000.0000000000,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1968-12-16T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"clientType": `Adult`,
					"clientId": `E17FEFFB-BC20-4662-9718-C520C99C3E53`,
					"guardianId": `E17FEFFB-BC20-4662-9718-C520C99C3E54`
				}
			],
			"totalPolicySumAssured": 2000000.0000000000,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"mandates": [
				{
					"mandateType": `EFT`,
					"initialInstalmentAmount": 0,
					"firstCollectionDate": `2022-03-24T13:22:51.820Z`,
					"numberOfDebitInstalments": 0,
					"statusReason": `string`,
					"mandateStatus": `Active`,
					"mandateInitiationDate": `2022-03-24T13:22:51.820Z`,
					"mandateID": 0,
					"lastCollectionDate": `2022-03-24T13:22:51.820Z`,
					"instalmentAmount": 0,
					"contractReference": `CF00192343`,
					"collectionDay": 0,
					"cifNumber": 0,
					"idNumber": `string`,
					"instalmentOccurrence": `OOFF`,
					"messageAuthenticationCode": `string`,
					"authRequired": true,
					"mandateReferenceNumber": `string`,
					"contactNumber": `string`,
					"voiceRecordingNumber": `vrn123`,
					"mandateRequestTransactionIdentifier": `string`,
					"accountName": `Mr John Smith`,
					"branchCode": `470010`,
					"accountNumber": `8459878987`,
					"bank": `Capitec Bank`,
					"accountType": `Bond`
				}
			]
		},
		{
			"contractReference": `LP00001379`,
			"policyStatus": `Cancelled`,
			"policyStatusEnum": `Cancelled`,
			"displayPolicyStatus": `Cancelled`,
			"policyStartDate": `2023-11-09T00:00:00+00:00`,
			"actualCancellationDate": `2023-11-14T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 1163.0000000000,
			"nextCollectionDate": `2023-12-28T00:00:00+00:00`,
			"nextCollectionAmount": 1163.2000000000,
			"canReIssue": true,
			"bankDetails": {
				"accountName": `Justin Brennand`,
				"branchCode": `470010`,
				"accountNumber": `2010184188`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 28,
				"mandateReference": `f17651f4-f3bd-4445-adf8-58ec69c3be40`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 1000000.000000000,
					"premium": 571.1000000000000
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 0.000000000000000,
					"premium": 0.000000000000000
				},
				{
					"pocketType": `Education`,
					"coverage": 0.000000000000000,
					"premium": 0.000000000000000
				}
			],
			"beneficiaries": [
				{
					"title": `Mr`,
					"gender": `Male`,
					"firstName": `Bene`,
					"lastName": `Fish`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0000000000,
					"educationBenefitAmount": 0.0000000000,
					"monthlyPayoutBenefitAmount": 1000000.0000000000,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1968-12-16T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"idNumber": `9299292939292`,
					"clientType": `Adult`,
					"clientId": `983A69FA-E493-4E70-B9A9-1CB577DED4F4`
				}
			],
			"guardians": [
				{
					"firstName": `Fred`,
					"lastName": `Flintstone`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 1000000.0000000000,
					"educationBenefitAmount": 0.0000000000,
					"monthlyPayoutBenefitAmount": 1000000.0000000000,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1968-12-16T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"clientType": `Adult`,
					"clientId": `E17FEFFB-BC20-4662-9718-C520C99C3E53`,
					"guardianId": `E17FEFFB-BC20-4662-9718-C520C99C3E54`
				}
			],
			"totalPolicySumAssured": 3000000.0000000000,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"mandates": []
		}
	]
};