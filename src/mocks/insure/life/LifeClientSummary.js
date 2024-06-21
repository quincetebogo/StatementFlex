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
			"contractReference": `LP00008099`,
			"policyStatus": `Pending In Force`,
			"policyStatusEnum": `PendingInForce`,
			"displayPolicyStatus": `Active - Pending Payment`,
			"policyStartDate": `2024-06-04T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 373.3478346228,
			"nextCollectionDate": `2024-07-01T00:00:00+00:00`,
			"nextCollectionAmount": 373.3478346228,
			"bankDetails": {
				"accountName": `Savings Account`,
				"branchCode": `470010`,
				"accountNumber": `1302232795`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `001020240604AF2D149D9C`
			},
			"arrears": [
                {
                    "arrearsID": `AR0000000284`,
                    "arrearsPaymentStatus": `PENDING`,
                    "arrearsPaymentDueAmount": `542.1000000000`,
                    "arrearsPaymentDueDate": `2024-02-25T00:00:00+00:00`,
                    "arrearsPaymentReceivedAmount": `0.0000000000`
                }
            ],
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 658000.0,
					"premium": 248.26
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 57600.0,
					"premium": 21.73
				},
				{
					"pocketType": `Education`,
					"coverage": 600000.0,
					"premium": 175.46
				}
			],
			"beneficiaries": [
				{
					"title": `Mr`,
					"firstName": `Children`,
					"lastName": `Ben`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0,
					"educationBenefitAmount": 200000.0,
					"monthlyPayoutBenefitAmount": 0.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `2024-06-04T00:00:00+00:00`,
					"clientType": `Child`,
					"guardianId": `GD01`,
					"clientId": `EA6ECF25-3B38-4EBB-808C-7EE3180A91BD`
				},
				{
					"title": `Mr`,
					"firstName": `Children 2`,
					"lastName": `Ben`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0,
					"educationBenefitAmount": 200000.0,
					"monthlyPayoutBenefitAmount": 0.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Child`,
					"gender": `Male`,
					"dateOfBirth": `2024-06-04T00:00:00+00:00`,
					"clientType": `Child`,
					"guardianId": `GD01`,
					"clientId": `EA6ECF25-3B38-4EBB-808C-7EE3180A91BD`
				},,				
				{
					"title": `Mr`,
					"firstName": `Children 3`,
					"lastName": `Benificiary`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0,
					"educationBenefitAmount": 200000.0,
					"monthlyPayoutBenefitAmount": 0.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Child`,
					"gender": `Male`,
					"dateOfBirth": `2024-06-04T00:00:00+00:00`,
					"clientType": `Child`,
					"guardianId": `GD02`,
					"clientId": `EA6ECF25-3B38-4EBB-808C-7EE3180A91BD`
				},
				{
					"title": `Mr`,
					"firstName": `Monthly`,
					"lastName": `Ben`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 329000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 57600.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1997-06-04T00:00:00+00:00`,
					"contactNumber": `0842572454`,
					"clientType": `Adult`,
					"clientId": `63AA50E9-BEAB-49E1-8563-26088547E99D`
				},
				{
					"title": `Miss`,
					"firstName": `Lump`,
					"lastName": `Ben`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 329000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 0.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Female`,
					"dateOfBirth": `1990-06-04T00:00:00+00:00`,
					"contactNumber": `0614891717`,
					"clientType": `Adult`,
					"clientId": `B3E69DA4-91B7-4C10-8382-7A2BACF07B5C`
				}
			],
			"guardians": [
				{
					"title": `Mr`,
					"firstName": `Test`,
					"lastName": `Test`,
					"rolePlayer": `Guardian`,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1991-06-04T00:00:00+00:00`,
					"contactNumber": `0845725454`,
					"clientType": `Guardian`,
					"guardianId": `GD01`,
					"clientId": `780D47ED-2786-4886-8F8B-6322E5D4F3BA`
				},
				{
					"title": `Mr`,
					"firstName": `Test 2`,
					"lastName": `Test 2`,
					"rolePlayer": `Guardian`,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1991-06-04T00:00:00+00:00`,
					"contactNumber": `0845725454`,
					"clientType": `Guardian`,
					"guardianId": `GD02`,
					"clientId": `780D47ED-2786-4886-8F8B-6322E5D4F3BA`
				}
			],
			"totalPolicySumAssured": 915600.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false,
			"mandates": [
				{
					"accountName": `Mr SURNAME DEV`,
					"branchCode": `470010`,
					"accountNumber": `1302232795`,
					"bank": `CAPITEC BANK`,
					"accountType": `Bond`,
					"mandateType": `Debicheck`,
					"initialInstalmentAmount": 373.35,
					"firstCollectionDate": `2024-07-01T00:00:00+00:00`,
					"numberOfDebitInstalments": 9999,
					"statusReason": `ACCEPTED`,
					"mandateStatus": `Active`,
					"mandateInitiationDate": `2024-06-04T00:00:00+00:00`,
					"mandateId": 16047,
					"instalmentAmount": 373.35,
					"contractReference": `LP00008099`,
					"collectionDay": 1,
					"cifNumber": 161961533,
					"idNumber": `9002196146085`,
					"instalmentOccurrence": `RCUR`,
					"authRequired": false,
					"mandateReferenceNumber": `001020240604AF2D149D9C`,
					"contactNumber": ``,
					"voiceRecordingNumber": ``,
					"mandateRequestTransactionIdentifier": `00102024-06-04000000005`
				}
			],
			"channelFee": 27.9
		},
		{
			"contractReference": `LP00001813`,
			"policyStatus": `Cancelled`,
			"policyStatusEnum": `Cancelled`,
			"displayPolicyStatus": `Cancelled`,
			"policyStartDate": `2024-01-15T00:00:00+00:00`,
			"actualCancellationDate": `2024-02-29T00:00:00+00:00`,
			"effectiveCancellationDate": `2024-02-03T00:00:00+00:00`,
			"cancellationReason": `Insurer Cancelled Policy`,
			"cancellationReasonEnum": `InsurerCancelledPolicy`,
			"totalPremium": 0.0,
			"lastCollectionDate": `2024-02-01T00:00:00+00:00`,
			"lastCollectionAmount": 542.1,
			"nextCollectionDate": `2024-03-25T00:00:00+00:00`,
			"nextCollectionAmount": 542.1,
			"bankDetails": {
				"accountName": `Faith Holdings`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `Capitec Bank`,
				"accountType": `Current`,
				"collectionDay": 25,
				"mandateReference": `N/A`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 300000.0,
					"premium": 308.52
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 200000.0,
					"premium": 205.68
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"beneficiaries": [
				{
					"title": `Miss`,
					"firstName": `Frank`,
					"lastName": `Parkar`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 50000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 100000.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Female`,
					"dateOfBirth": `2005-01-02T00:00:00+00:00`,
					"contactNumber": `1234567890`,
					"contactEmail": `lisaparkar05@xyz.com`,
					"clientType": `Adult`,
					"guardianId": `GID001`,
					"clientId": `EBE03195-1C66-4397-813D-5FBE6522D45B`
				},
				{
					"title": `Miss`,
					"firstName": `Lisa`,
					"lastName": `Parkar`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 250000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 100000.0,
					"bankDetails": {
						"branchCode": `LEF00021`,
						"accountNumber": `63456765`,
						"bank": `Life Essence Financial`,
						"accountType": `Current`
					},
					"relationship": `Others`,
					"gender": `Female`,
					"dateOfBirth": `2000-05-02T00:00:00+00:00`,
					"contactNumber": `1234567890`,
					"contactEmail": `lisaparkar05@xyz.com`,
					"clientType": `Adult`,
					"clientId": `FDA5EB45-11E0-45D4-BAAF-ECB7126039E2`
				}
			],
			"guardians": [
				{
					"title": `Miss`,
					"firstName": `Nick`,
					"lastName": `Parkar`,
					"rolePlayer": `Guardian`,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Female`,
					"dateOfBirth": `1995-05-02T00:00:00+00:00`,
					"contactNumber": `1234567890`,
					"contactEmail": `lisaparkar05@xyz.com`,
					"clientType": `Guardian`,
					"guardianId": `GID001`,
					"clientId": `51A2EA8C-4391-45A6-BFCD-3FBC0BE8AA1B`
				}
			],
			"totalPolicySumAssured": 500000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": true,
			"channelFee": 25
		},
		{
			"contractReference": `LP00001692`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2024-02-26T00:00:00+00:00`,
			"actualCancellationDate": `2024-02-26T00:00:00+00:00`,
			"effectiveCancellationDate": `2024-02-27T00:00:00+00:00`,
			"cancellationReason": `Confidential`,
			"cancellationReasonEnum": `Confidential`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2024-03-25T00:00:00+00:00`,
			"nextCollectionAmount": 50.43,
			"bankDetails": {
				"accountName": `Justin Brennand`,
				"branchCode": `470010`,
				"accountNumber": `2010184188`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 25,
				"mandateReference": `cef6236a-8c7f-4f25-9359-983c724f619`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 0.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 150000.0,
					"premium": 29.43
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"beneficiaries": [
				{
					"title": `Mr`,
					"firstName": `Justin`,
					"lastName": `Brennand`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 150000.0,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1986-01-09T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"contactEmail": `justin@youwish.org`,
					"clientType": `Adult`,
					"clientId": `255AB036-E900-44C4-933D-8CA2D64D3F36`
				}
			],
			"totalPolicySumAssured": 150000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00001681`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2024-02-08T00:00:00+00:00`,
			"actualCancellationDate": `2024-02-08T00:00:00+00:00`,
			"effectiveCancellationDate": `2024-02-08T00:00:00+00:00`,
			"cancellationReason": `Confidential`,
			"cancellationReasonEnum": `Confidential`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2024-03-25T00:00:00+00:00`,
			"nextCollectionAmount": 50.43,
			"bankDetails": {
				"accountName": `Justin Brennand`,
				"branchCode": `470010`,
				"accountNumber": `2010184188`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 25,
				"mandateReference": `001020240208D960E98C9E`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 0.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 150000.0,
					"premium": 29.43
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"beneficiaries": [
				{
					"title": `Mr`,
					"firstName": `Justin`,
					"lastName": `Brennand`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 0.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 150000.0,
					"bankDetails": {
						"branchCode": `470010`,
						"accountNumber": `2010184188`,
						"bank": `CAPITEC`,
						"accountType": `Savings`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1986-01-09T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"contactEmail": `justin@youwish.org`,
					"clientType": `Adult`,
					"clientId": `7A020AC1-75EB-4D8C-B383-2032A768D403`
				}
			],
			"totalPolicySumAssured": 150000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000288`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2023-10-05T00:00:00+00:00`,
			"actualCancellationDate": `2023-10-18T00:00:00+00:00`,
			"effectiveCancellationDate": `2023-10-18T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2023-11-01T00:00:00+00:00`,
			"nextCollectionAmount": 101.3242,
			"bankDetails": {
				"accountName": `SAVINGS ACCOUNT`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `0010202310051508DA4A1A`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 21.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 6000.0,
					"premium": 25.32
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 21.0
				}
			],
			"totalPolicySumAssured": 6000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000289`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2023-10-05T00:00:00+00:00`,
			"actualCancellationDate": `2023-10-18T00:00:00+00:00`,
			"effectiveCancellationDate": `2023-10-18T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2023-11-01T00:00:00+00:00`,
			"nextCollectionAmount": 101.3242,
			"bankDetails": {
				"accountName": `SAVINGS ACCOUNT`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `001020231005A7E55F289F`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 21.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 6000.0,
					"premium": 25.32
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 21.0
				}
			],
			"totalPolicySumAssured": 6000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000297`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2023-10-05T00:00:00+00:00`,
			"actualCancellationDate": `2023-10-18T00:00:00+00:00`,
			"effectiveCancellationDate": `2023-10-18T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2023-11-01T00:00:00+00:00`,
			"nextCollectionAmount": 101.3242,
			"bankDetails": {
				"accountName": `SAVINGS ACCOUNT`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `0010202310058A5EA11D2F`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 21.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 6000.0,
					"premium": 25.32
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 21.0
				}
			],
			"totalPolicySumAssured": 6000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000273`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2023-10-04T00:00:00+00:00`,
			"actualCancellationDate": `2023-10-18T00:00:00+00:00`,
			"effectiveCancellationDate": `2023-10-18T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2023-11-01T00:00:00+00:00`,
			"nextCollectionAmount": 101.3242,
			"bankDetails": {
				"accountName": `SAVINGS ACCOUNT`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `001020231004E758A9AAA5`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 21.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 6000.0,
					"premium": 25.32
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 21.0
				}
			],
			"totalPolicySumAssured": 6000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000278`,
			"policyStatus": `Not Taken Up`,
			"policyStatusEnum": `NotTakenUp`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2023-10-04T00:00:00+00:00`,
			"actualCancellationDate": `2023-10-18T00:00:00+00:00`,
			"effectiveCancellationDate": `2023-10-18T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2023-11-01T00:00:00+00:00`,
			"nextCollectionAmount": 101.3242,
			"bankDetails": {
				"accountName": `SAVINGS ACCOUNT`,
				"branchCode": `470010`,
				"accountNumber": `1555867829`,
				"bank": `CAPITEC`,
				"accountType": `Savings`,
				"collectionDay": 1,
				"mandateReference": `001020231005FBD7928493`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 0.0,
					"premium": 21.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 6000.0,
					"premium": 25.32
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 21.0
				}
			],
			"totalPolicySumAssured": 6000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false
		},
		{
			"contractReference": `LP00000887`,
			"policyStatus": `Cool-Off`,
			"policyStatusEnum": `CoolOff`,
			"displayPolicyStatus": `Not Taken Up`,
			"policyStartDate": `2024-06-05T00:00:00+00:00`,
			"cancellationReason": ``,
			"cancellationReasonEnum": `Unknown`,
			"totalPremium": 0.0,
			"nextCollectionDate": `2024-07-25T00:00:00+00:00`,
			"nextCollectionAmount": 1027.9,
			"bankDetails": {
				"accountName": `Testing`,
				"branchCode": `470010`,
				"accountNumber": `1370520032`,
				"bank": `Capitec`,
				"accountType": `Savings`,
				"collectionDay": 25,
				"mandateReference": `21740c59-12b9-430c-a388-af1c4676089`
			},
			"pockets": [
				{
					"pocketType": `LumpSum`,
					"coverage": 200000.0,
					"premium": 1000.0
				},
				{
					"pocketType": `MonthlyPayout`,
					"coverage": 0.0,
					"premium": 0.0
				},
				{
					"pocketType": `Education`,
					"coverage": 0.0,
					"premium": 0.0
				}
			],
			"beneficiaries": [
				{
					"title": `Mr`,
					"firstName": `Justin`,
					"lastName": `Brennand`,
					"rolePlayer": `Primary Beneficiary`,
					"onceOffPayoutBenefitAmount": 200000.0,
					"educationBenefitAmount": 0.0,
					"monthlyPayoutBenefitAmount": 0.0,
					"bankDetails": {
						"accountType": `Bond`
					},
					"relationship": `Others`,
					"gender": `Male`,
					"dateOfBirth": `1974-04-04T00:00:00+00:00`,
					"contactNumber": `0823214321`,
					"contactEmail": `justin@youwish.org`,
					"clientType": `Adult`,
					"clientId": `CCCF17F6-B0E8-4A1B-ADFE-012B9794695C`
				}
			],
			"totalPolicySumAssured": 200000.0,
			"policyReinstatementCount": 0,
			"newBornPremiumWaiverAvailable": false,
			"voluntaryPremiumPauseAvailable": false,
			"canReIssue": false,
			"channelFee": 27.9
		}
	]
};