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
			"contractReference": "LP00003393",
			"policyStatus": "Pending In Force",
			"policyStatusEnum": "VoluntaryPolicyPause",
			"displayPolicyStatus": "Active - Pending Payment",
			"policyStartDate": "2025-05-30T00:00:00+00:00",
			"cancellationReason": "",
			"cancellationReasonEnum": "Unknown",
			"totalPremium": 50.85826096,
			"nextCollectionDate": "2025-07-03T00:00:00+00:00",
			"nextCollectionAmount": 50.85826096,
			"bankDetails": {
				"accountName": "Main Account",
				"branchCode": "470010",
				"accountNumber": "2338922081",
				"bank": "CAPITEC",
				"accountType": "Savings",
				"collectionDay": 3,
				"mandateReference": "1c0c2c34-2d39-4797-bf33-e51213e9244",
				"mandateStatus": "ACTIVE"
			},
			"pockets": [
				{
					"pocketType": "LumpSum",
					"coverage": 0,
					"premium": 0
				},
				{
					"pocketType": "MonthlyPayout",
					"coverage": 120000,
					"premium": 19.86
				},
				{
					"pocketType": "Education",
					"coverage": 0,
					"premium": 0
				}
			],
			"beneficiaries": [
				{
					"title": "Mr",
					"firstName": "test",
					"lastName": "nish",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 0,
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 120000,
					"bankDetails": {},
					"relationship": "MainLife",
					"gender": "Male",
					"dateOfBirth": "1995-01-01T00:00:00+00:00",
					"contactNumber": "0666666666",
					"clientType": "Adult",
					"clientId": "B58726F4-6EE8-4CDB-9FAE-4D3BC8ABB1C0"
				}
			],
			"totalPolicySumAssured": 120000,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": true,
			"canReIssue": false,
			"canIncreaseCover": true,
			"channelFee": 31
		},
		{
			"contractReference": "LP00001625",
			"policyStatus": "Lapsed",
			"policyStatusEnum": "Lapsed",
			"displayPolicyStatus": "Lapsed",
			"policyStartDate": "2024-07-01T00:00:00+00:00",
			"actualCancellationDate": "2025-03-06T00:00:00+00:00",
			"cancellationReason": "",
			"cancellationReasonEnum": "Unknown",
			"totalPremium": 157.35,
			"lastCollectionDate": "2025-01-15T00:00:00+00:00",
			"lastCollectionAmount": 157.35,
			"nextCollectionDate": "2025-03-15T00:00:00+00:00",
			"nextCollectionAmount": 157.35,
			"bankDetails": {
				"accountName": "Rigardt Smit",
				"branchCode": "470010",
				"accountNumber": "1412506423",
				"bank": "Capitec",
				"accountType": "Savings",
				"collectionDay": 15,
				"mandateReference": "001020250114FA9F7105CB",
				"mandateStatus": "ACTIVE"
			},
			"pockets": [
				{
					"pocketType": "LumpSum",
					"coverage": 100000,
					"premium": 40.45
				},
				{
					"pocketType": "MonthlyPayout",
					"coverage": 100000,
					"premium": 40.45
				},
				{
					"pocketType": "Education",
					"coverage": 100000,
					"premium": 40.45
				}
			],
			"arrears": [
				{
					"arrearsID": "AR0000001261",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "157.3500000000",
					"arrearsPaymentDueDate": "2024-09-15T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				},
				{
					"arrearsID": "AR0000001270",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "157.3500000000",
					"arrearsPaymentDueDate": "2024-12-15T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				},
				{
					"arrearsID": "AR0000001790",
					"arrearsPaymentStatus": "PENDING",
					"arrearsPaymentDueAmount": "157.3500000000",
					"arrearsPaymentDueDate": "2025-02-15T00:00:00+00:00",
					"arrearsPaymentReceivedAmount": "0.0000000000"
				}
			],
			"beneficiaries": [
				{
					"title": "Dr",
					"idNumber": "1911147826082",
					"firstName": "Antonio",
					"lastName": "Lee",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 0,
					"educationBenefitAmount": 50000,
					"monthlyPayoutBenefitAmount": 0,
					"bankDetails": {},
					"relationship": "Spouse",
					"gender": "Male",
					"dateOfBirth": "2019-11-14T00:00:00+00:00",
					"contactNumber": "0731855252",
					"contactEmail": "jdoe@youwish.org",
					"clientType": "Child",
					"guardianId": "GD00124",
					"clientId": "CA8728D6-4138-4143-B2A0-44345BF7A45C"
				},
				{
					"title": "Dr",
					"idNumber": "1711147826082",
					"firstName": "Antonio",
					"lastName": "Lee",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 0,
					"educationBenefitAmount": 50000,
					"monthlyPayoutBenefitAmount": 0,
					"bankDetails": {},
					"relationship": "Sibling",
					"gender": "Male",
					"dateOfBirth": "2017-11-14T00:00:00+00:00",
					"contactNumber": "0731855252",
					"contactEmail": "jdoe@youwish.org",
					"clientType": "Child",
					"guardianId": "GD00123",
					"clientId": "5E4311C3-6FCF-4E32-948B-4EC06AC56212"
				},
				{
					"title": "Dr",
					"idNumber": "0011147826082",
					"firstName": "Antonio",
					"lastName": "Lee",
					"rolePlayer": "Primary Beneficiary",
					"onceOffPayoutBenefitAmount": 100000,
					"educationBenefitAmount": 0,
					"monthlyPayoutBenefitAmount": 100000,
					"bankDetails": {},
					"relationship": "Sibling",
					"gender": "Male",
					"dateOfBirth": "2000-11-14T00:00:00+00:00",
					"contactNumber": "0731855252",
					"contactEmail": "jdoe@youwish.org",
					"clientType": "Adult",
					"clientId": "67DB678D-9C57-4D7D-A0AA-3220FDCE99A8"
				}
			],
			"totalPolicySumAssured": 300000,
			"policyLapseDate": "2025-03-06T00:00:00+00:00",
			"arrearsMissedPremiumCount": 3,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": true,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": true,
			"canIncreaseCover": true,
			"channelFee": 36
		}
	],
	"idealPayDate": 1,
	"doNotDoBusiness": true
};