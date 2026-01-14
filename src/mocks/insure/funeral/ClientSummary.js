/**
 * ClientSummary mock response
 *
 * @export
 * @constant ClientSummary
 */
export const ClientSummary = {
	checkInsuranceDetails: [
		{
			insured: true,
			maxAllowedCover: 55000,
			productCode: "Capitec",
			productName: "Funeral Insurance",
			isPhaseParticipating: true,
		},
	],
	summaryDetails: {
		policies: [
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "B0EFB2B7-7A14-4A42-82EB-7170FBA67231",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "08628FB6-39C6-4119-A365-6D33B05F67A2",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 7.35,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032873",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 47.35,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-08-02T02:00:00Z",
					"nextPaymentAmount": 47.35
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": true
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 47.35,
						"contractReference": "FP00032873",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032873"
					}
				],
				"policyRule": "PolicyPause",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "FEE29DE6-94C5-4627-8A50-B5075C22CF4E",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "C9D59187-AA29-45F0-A5E3-B9A3B28C59A3",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 7.35,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032867",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 47.35,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-26T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 47.35
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 47.35,
						"contractReference": "FP00032867",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032867"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "1DC2FDE5-C0AA-45E7-A629-57EF5E6290CC",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-02-01T02:00:00Z",
						"premiumStartDate": "2025-03-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "test",
						"firstName": "bene",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 100,
						"contactDetails": {
							"cellphone": "0823453453",
							"homephone": "",
							"workphone": ""
						},
						"gender": "Male",
						"dateOfBirth": "1990-05-03T04:00:00Z",
						"recordID": "9BFB1E9E-963D-4B1D-99E7-2BC448E9AEBB",
						"recordIDType": "PAS",
						"relationship": "BeneficiaryOnly",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 1
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 4900,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1995-01-02T04:00:00Z",
						"recordID": "F360BB01-F3D9-40BF-8CC0-F9B7481EE5A5",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 2
					}
				],
				"contractReference": "FP00011660",
				"productCode": "Capitec",
				"commencementDate": "2025-02-01T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "2339316274",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 40,
				"arrearDetails": {
					"outstandingAmount": 82.36,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 41.18,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014112",
							"totalArrearsAmount": 41.18
						},
						{
							"amount": 41.18,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014123",
							"totalArrearsAmount": 82.36
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-20T02:00:00Z",
					"effectiveCancellationDate": "2025-05-31T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-03-01T02:00:00Z",
					"previousPaymentAmount": 45.9,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 41.18
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-08-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-02-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "2339316274",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-02-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 40,
						"contractReference": "FP00011660",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00011660"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "5369726F-657F-4EF9-9BA8-97D4366554DE",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-01-25T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "00734DED-287C-48D8-89DB-1F1D9A3FAAB4",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-01-25T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020643",
				"productCode": "Capitec",
				"commencementDate": "2025-01-25T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1563373023",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 138.6,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 46.2,
							"dueDate": "2025-02-02T02:00:00Z",
							"objectID": "AR0000037914",
							"totalArrearsAmount": 46.2
						},
						{
							"amount": 46.2,
							"dueDate": "2025-03-02T02:00:00Z",
							"objectID": "AR0000037921",
							"totalArrearsAmount": 92.4
						},
						{
							"amount": 46.2,
							"dueDate": "2025-04-02T02:00:00Z",
							"objectID": "AR0000037928",
							"totalArrearsAmount": 138.6
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-21T02:00:00Z",
					"effectiveCancellationDate": "2025-04-21T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-05-02T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-25T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-25T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1563373023",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-25T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020643",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020643"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "35242EA3-4887-46B8-892E-A7B43F3B32FB",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "B92755D4-5222-48EA-B0D0-107F1C9A850E",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020645",
				"productCode": "Capitec",
				"commencementDate": "2025-01-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 28,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1563373023",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Other_Provider",
					"displayReason": "Policy with other service provider"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-02-28T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-03-28T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1563373023",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020645",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020645"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "C0738A6E-2AE3-44B8-BE87-80164F6BB01F",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "D855423E-FBCE-404E-99BB-44BB78056CD2",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00018846",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 14,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 66.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-08-28T02:00:00Z",
					"effectiveCancellationDate": "2025-08-28T02:00:00Z",
					"reason": "Other_Provider",
					"displayReason": "Policy with other service provider"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-06-14T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-08-14T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 66.6,
						"contractReference": "FP00018846",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018846"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "7DE82A6D-F743-45BB-8600-180763588664",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "B7ADDE5C-F5FF-4A77-AFBC-88B06043147E",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020665",
				"productCode": "Capitec",
				"commencementDate": "2025-01-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-31T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-02-28T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-05-02T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020665",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020665"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "E6F36D1B-1D61-401B-8DB7-83AA5ECDCB36",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00013709",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 63.6,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 63.6,
							"dueDate": "2025-07-02T02:00:00Z",
							"objectID": "AR0000014866",
							"totalArrearsAmount": 63.6
						}
					]
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-06-28T02:00:00Z",
					"previousPaymentAmount": 63.6,
					"nextPaymentDate": "2025-05-28T02:00:00Z",
					"nextPaymentAmount": 63.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00013709",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00013709"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "84C49695-7736-4662-85DA-B2C69060CCE8",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "9A3A8A09-0ADD-467B-8664-501EAB9CECEA",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020796",
				"productCode": "Capitec",
				"commencementDate": "2024-11-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 28,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2024-12-28T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-02-28T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020796",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020796"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "19A7B56D-58AE-42CC-A72B-0BFBF465B921",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 7000,
						"premium": 41.2,
						"coverStartDate": "2025-09-01T02:00:00Z",
						"premiumStartDate": "2025-09-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 7000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "78B46BEF-72CE-4B36-8011-3866FE3C51CE",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-05-01T02:00:00Z",
						"premiumStartDate": "2025-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00019519",
				"productCode": "Capitec",
				"commencementDate": "2025-05-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "Active",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 64.8,
				"arrearDetails": {
					"outstandingAmount": 66.6,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 66.6,
							"dueDate": "2025-08-15T02:00:00Z",
							"objectID": "AR0000016314",
							"totalArrearsAmount": 66.6
						}
					]
				},
				"paymentSchedule": {
					"previousArrearsPaymentAmount": 66.6,
					"previousPaymentDate": "2025-06-15T02:00:00Z",
					"previousPaymentAmount": 133.2,
					"nextPaymentDate": "2025-09-01T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-11-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-05-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-05-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 64.8,
						"contractReference": "FP00019519",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00019519"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "C2D225FF-51C8-4776-81C1-C5577BA93370",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "7EDAA8B6-DE7E-49B8-81AC-F6BACF4E8C8F",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012379",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 5,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014608",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-17T02:00:00Z",
					"effectiveCancellationDate": "2025-06-17T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-07-05T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012379",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012379"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "7CCADA28-FAA7-4309-AB1C-BEEE19DABC45",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "5397A1A2-C316-4925-97BA-F6129B9225E6",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012386",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 98.1,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014611",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014612",
							"totalArrearsAmount": 98.1
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-28T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012386",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012386"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "D0F3A94C-844C-4936-B9C3-DBCCA570A2DE",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "324F696B-1049-44E3-851E-E1C124F1EE8A",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012400",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014614",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-28T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012400",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012400"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "202BE1FF-46B0-46A6-A918-FDD80757EE53",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "2AF1EDFC-416A-4898-B801-84A873563398",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012401",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014615",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-28T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-05-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012401",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012401"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "94774152-935A-43ED-ABA6-9FDFE97A21C9",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "625FFB11-BD11-4A22-AEB6-85711EA3D1BC",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012406",
				"productCode": "Capitec",
				"commencementDate": "2025-01-01T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 147.15,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-03-01T02:00:00Z",
							"objectID": "AR0000014623",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014624",
							"totalArrearsAmount": 98.1
						},
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014625",
							"totalArrearsAmount": 147.15
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-05-31T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-02-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012406",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012406"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "D783643E-B4BD-4985-A2D8-29E6DCB28E74",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2024-07-01T02:00:00Z",
						"premiumStartDate": "2024-08-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "03C72F58-D1A5-4212-AB7D-D249BB11DEEF",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012410",
				"productCode": "Capitec",
				"commencementDate": "2024-07-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "NewBornPremium",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 42.85,
				"arrearDetails": {
					"outstandingAmount": 98.1,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2024-08-01T02:00:00Z",
							"objectID": "AR0000014628",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2024-09-01T02:00:00Z",
							"objectID": "AR0000014629",
							"totalArrearsAmount": 98.1
						}
					]
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-12-01T02:00:00Z",
					"nextPaymentAmount": 42.85
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": false,
						"availableDate": "2026-05-01T02:00:00Z",
						"isBenefitActive": false,
						"benefitStartDate": "2025-05-01T02:00:00Z",
						"benefitEndDate": "2025-11-01T02:00:00Z"
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2026-07-01T02:00:00Z",
						"isBenefitActive": true
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-07-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 42.85,
						"contractReference": "FP00012410",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012410"
					}
				],
				"policyRule": "PolicyPause",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "137781E5-60FD-47DE-B0BC-1BB879CA08A3",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "0DFFCFEE-8245-4C02-9867-3685C08B5CAB",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012405",
				"productCode": "Capitec",
				"commencementDate": "2025-01-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 10,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 42.85,
				"arrearDetails": {
					"outstandingAmount": 147.15,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-02-01T02:00:00Z",
							"objectID": "AR0000014620",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014621",
							"totalArrearsAmount": 98.1
						},
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014622",
							"totalArrearsAmount": 147.15
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-25T02:00:00Z",
					"effectiveCancellationDate": "2025-04-30T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-03-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-05-01T02:00:00Z",
					"nextPaymentAmount": 42.85
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 42.85,
						"contractReference": "FP00012405",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012405"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "75F578C4-8032-4463-BE8A-B513F57BF95A",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "EA05A0A6-0329-4C81-BD50-6A94FD66A0F6",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012408",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014627",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-18T02:00:00Z",
					"effectiveCancellationDate": "2025-06-18T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012408",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012408"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "1A2CFDAB-0C67-4250-B93B-B80A0C723FFC",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.55,
						"coverStartDate": "2022-01-01T02:00:00Z",
						"premiumStartDate": "2022-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "18C7DC63-803F-4C56-8749-4D4599D51ABE",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 6000,
						"premium": 6.79,
						"coverStartDate": "2025-06-18T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012411",
				"productCode": "Capitec",
				"commencementDate": "2022-01-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.34,
				"arrearDetails": {
					"outstandingAmount": 144.15,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 48.05,
							"dueDate": "2023-01-01T02:00:00Z",
							"objectID": "AR0000014631",
							"totalArrearsAmount": 48.05
						},
						{
							"amount": 48.05,
							"dueDate": "2024-05-01T02:00:00Z",
							"objectID": "AR0000014632",
							"totalArrearsAmount": 96.1
						},
						{
							"amount": 48.05,
							"dueDate": "2024-06-01T02:00:00Z",
							"objectID": "AR0000014633",
							"totalArrearsAmount": 144.15
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-07-29T02:00:00Z",
					"effectiveCancellationDate": "2025-07-31T02:00:00Z",
					"reason": "Insurer_Cancelled",
					"displayReason": "Insurer Cancelled Policy"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2022-02-01T02:00:00Z",
					"previousPaymentAmount": 48.05,
					"nextPaymentDate": "2024-08-01T02:00:00Z",
					"nextPaymentAmount": 48.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2022-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2024-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.34,
						"contractReference": "FP00012411",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012411"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "5431B6AC-5783-4443-87A3-BBBA59872DE0",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 5.5,
						"coverStartDate": "2022-01-01T02:00:00Z",
						"premiumStartDate": "2022-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00012412",
				"productCode": "Capitec",
				"commencementDate": "2022-01-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 5.5,
				"arrearDetails": {
					"outstandingAmount": 96.1,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 48.05,
							"dueDate": "2022-02-01T02:00:00Z",
							"objectID": "AR0000014634",
							"totalArrearsAmount": 48.05
						},
						{
							"amount": 48.05,
							"dueDate": "2022-03-01T02:00:00Z",
							"objectID": "AR0000014635",
							"totalArrearsAmount": 96.1
						}
					]
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2024-01-01T02:00:00Z",
					"previousPaymentAmount": 48.05,
					"nextPaymentDate": "2023-02-01T02:00:00Z",
					"nextPaymentAmount": 48.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2022-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2024-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 5.5,
						"contractReference": "FP00012412",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012412"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "783AB543-1F9F-4149-909C-54B78F688FBB",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 5.7,
						"coverStartDate": "2023-01-01T02:00:00Z",
						"premiumStartDate": "2023-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00012416",
				"productCode": "Capitec",
				"commencementDate": "2023-01-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 15,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 5.7,
				"arrearDetails": {
					"outstandingAmount": 48.3,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 48.3,
							"dueDate": "2025-04-10T02:00:00Z",
							"objectID": "AR0000014665",
							"totalArrearsAmount": 48.3
						}
					]
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-15T02:00:00Z",
					"previousPaymentAmount": 48.3,
					"nextPaymentDate": "2025-07-15T02:00:00Z",
					"nextPaymentAmount": 48.3
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2023-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2025-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2023-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 5.7,
						"contractReference": "FP00012416",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012416"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "C059637B-2035-450C-870C-1B155FC38463",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-02-01T02:00:00Z",
						"premiumStartDate": "2025-03-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "F74D1A03-3742-4B8C-9027-BA49188DEBD4",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-02-01T02:00:00Z",
						"premiumStartDate": "2025-03-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012403",
				"productCode": "Capitec",
				"commencementDate": "2025-02-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 10,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 147.15,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-03-01T02:00:00Z",
							"objectID": "AR0000014617",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014618",
							"totalArrearsAmount": 98.1
						},
						{
							"amount": 49.05,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014619",
							"totalArrearsAmount": 147.15
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-28T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-08-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-02-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-02-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012403",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012403"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "4F77FC8E-B34C-471E-9179-21A20F128807",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "569F65A6-574B-44A8-8C8D-16F2E1F6E965",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012413",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"bank": "First National Bank",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-08-04T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012413",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012413"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "0EAC7AAB-026F-4B13-9842-12D5B6175051",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "90933CF4-ED1D-4737-AC91-43A474C28F12",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012402",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014616",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-28T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-06-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012402",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012402"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [],
				"contractReference": "FP00012404",
				"productCode": "Capitec",
				"commencementDate": "2025-02-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 4,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 0,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-07-04T02:00:00Z",
					"nextPaymentAmount": 42.85
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-08-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-02-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-02-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 0,
						"contractReference": "FP00012404",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012404"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "8222F62C-A0C4-43AD-825B-60231B5C1F39",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "F37FAD25-1DD0-4C66-99E6-264074A39B28",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012414",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012414",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012414"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "59CFB07C-7C94-4A64-AA64-0C9CAC6FF0C9",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "A87FE1C4-BB6F-435A-9E6A-ADD651D55B0F",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00017782",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 66.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-07-29T02:00:00Z",
					"effectiveCancellationDate": "2025-07-31T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-06-30T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-08-31T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 66.6,
						"contractReference": "FP00017782",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00017782"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "2D34B012-BF67-402D-8F0D-C3A464555E56",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00017784",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 25,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-25T02:00:00Z",
					"effectiveCancellationDate": "2025-04-01T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-06-25T02:00:00Z",
					"nextPaymentAmount": 23.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00017784",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00017784"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "796D0CC9-72AF-4B9C-BF5B-FE1DF67F9C9C",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "CC48066E-440E-43FA-8011-1006A0F52362",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00018770",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "Active",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 66.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-02T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-07-02T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 66.6,
						"contractReference": "FP00018770",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018770"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0274178171",
							"homephone": "0000000000",
							"workphone": "0000000000",
							"email": "cgxegclagyoc@cwgrn.tme"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "B01036AD-88F7-46BF-83FE-E18F3B10B4E2",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 40000,
						"premium": 59.95,
						"coverStartDate": "2024-11-22T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "Isuue",
						"firstName": "Child",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "",
							"homephone": "",
							"workphone": ""
						},
						"gender": "Male",
						"dateOfBirth": "2009-11-06T04:00:00Z",
						"recordID": "83D0B68D-67B9-48CA-8159-42EAF6F87C60",
						"recordIDType": "PAS",
						"relationship": "Child",
						"coverAmount": 20000,
						"premium": 7.8,
						"coverStartDate": "2024-11-22T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					},
					{
						"title": "Mrs",
						"surname": "xgqix",
						"firstName": "xhfgvrig",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 40000,
						"contactDetails": {
							"cellphone": "0436243199",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1958-01-12T04:00:00Z",
						"recordID": "8264F66E-6607-431B-AFE1-808296506F9F",
						"recordIDType": "PAS",
						"relationship": "Parent",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 2
					}
				],
				"contractReference": "FP00010943",
				"productCode": "Capitec",
				"commencementDate": "2024-11-22T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 19,
					"bankDetails": {
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 67.75,
				"arrearDetails": {
					"outstandingAmount": 406.5,
					"monthsOutstanding": 6,
					"arrears": [
						{
							"amount": 67.75,
							"dueDate": "2024-12-19T02:00:00Z",
							"objectID": "AR0000002849",
							"totalArrearsAmount": 67.75
						},
						{
							"amount": 67.75,
							"dueDate": "2025-01-19T02:00:00Z",
							"objectID": "AR0000002852",
							"totalArrearsAmount": 135.5
						},
						{
							"amount": 67.75,
							"dueDate": "2025-02-19T02:00:00Z",
							"objectID": "AR0000002855",
							"totalArrearsAmount": 203.25
						},
						{
							"amount": 67.75,
							"dueDate": "2025-03-19T02:00:00Z",
							"objectID": "AR0000008215",
							"totalArrearsAmount": 271
						},
						{
							"amount": 67.75,
							"dueDate": "2025-04-19T02:00:00Z",
							"objectID": "AR0000010900",
							"totalArrearsAmount": 338.75
						},
						{
							"amount": 67.75,
							"dueDate": "2025-05-19T02:00:00Z",
							"objectID": "AR0000013810",
							"totalArrearsAmount": 406.5
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-28T02:00:00Z",
					"effectiveCancellationDate": "2025-04-30T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-05-19T02:00:00Z",
					"nextPaymentAmount": 67.75
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-22T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-22T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-22T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 67.75,
						"contractReference": "FP00010943",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00010943"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Ms",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0788572300",
							"homephone": "0788572300",
							"workphone": "0788572300",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "3F463386-556A-40B6-85EF-2DB7D12C3E55",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 20000,
						"premium": 49,
						"coverStartDate": "2025-09-01T02:00:00Z",
						"premiumStartDate": "2025-10-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Ms",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 20000,
						"contactDetails": {
							"cellphone": "0788572300",
							"homephone": "0788572300",
							"workphone": "0788572300",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "7CE83AAF-0A65-4B2D-AA13-AF3D6F3D292F",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 20000,
						"premium": 25.8,
						"coverStartDate": "2025-09-01T02:00:00Z",
						"premiumStartDate": "2025-10-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00081815",
				"productCode": "Capitec",
				"commencementDate": "2025-09-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 20,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 74.8,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-10-20T02:00:00Z",
					"nextPaymentAmount": 74.8
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": false,
						"availableDate": "2026-03-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-09-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-09-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 74.8,
						"contractReference": "FP00081815",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00081815"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "John",
						"firstName": "Snow",
						"middleName": "Johnie",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0834834365",
							"homephone": "0834834365",
							"workphone": "0834839999"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "B5006E31-4D9B-46A5-B649-D28E8B54C73C",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-07-24T02:00:00Z",
						"premiumStartDate": "2024-08-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "Test",
						"firstName": "TT",
						"middleName": "TT",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0834834365",
							"homephone": "0834834365",
							"workphone": "0834834365"
						},
						"gender": "Female",
						"dateOfBirth": "1995-03-31T04:00:00Z",
						"recordID": "8C0733BF-524E-43B5-806C-32C2DED7EC06",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 5.7,
						"coverStartDate": "2024-07-24T02:00:00Z",
						"premiumStartDate": "2024-08-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00004503",
				"productCode": "Capitec",
				"commencementDate": "2024-07-24T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 15,
					"bankDetails": {
						"accountName": "tester",
						"branchCode": "470010",
						"accountNumber": "1411186107",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 45.7,
				"arrearDetails": {
					"outstandingAmount": 274.2,
					"monthsOutstanding": 6,
					"arrears": [
						{
							"amount": 45.7,
							"dueDate": "2024-10-15T02:00:00Z",
							"objectID": "AR0000006582",
							"totalArrearsAmount": 45.7
						},
						{
							"amount": 45.7,
							"dueDate": "2024-11-15T02:00:00Z",
							"objectID": "AR0000006584",
							"totalArrearsAmount": 91.4
						},
						{
							"amount": 45.7,
							"dueDate": "2024-12-15T02:00:00Z",
							"objectID": "AR0000006586",
							"totalArrearsAmount": 137.1
						},
						{
							"amount": 45.7,
							"dueDate": "2025-01-15T02:00:00Z",
							"objectID": "AR0000006587",
							"totalArrearsAmount": 182.8
						},
						{
							"amount": 45.7,
							"dueDate": "2025-02-15T02:00:00Z",
							"objectID": "AR0000006588",
							"totalArrearsAmount": 228.5
						},
						{
							"amount": 45.7,
							"dueDate": "2025-04-15T02:00:00Z",
							"objectID": "AR00011273",
							"totalArrearsAmount": 274.2
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-03-06T02:00:00Z",
					"effectiveCancellationDate": "2025-03-06T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-08-04T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-03-15T02:00:00Z",
					"nextPaymentAmount": 45.7
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-01-24T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-07-24T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "tester",
						"branchCode": "470010",
						"accountNumber": "1411186107",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-07-24T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 45.7,
						"contractReference": "FP00004503",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00004503"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0834834365",
							"homephone": "0834834365",
							"workphone": "0834839999"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "CD9AACDB-4BE7-4536-83B0-4B391819E884",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-06-06T02:00:00Z",
						"premiumStartDate": "2024-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "Test",
						"firstName": "TT",
						"middleName": "TT",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0834834365",
							"homephone": "0834834365",
							"workphone": "0834834365"
						},
						"gender": "Female",
						"dateOfBirth": "1995-03-31T04:00:00Z",
						"recordID": "E3E1F175-E802-431A-AFC0-9CFB477EC919",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 5.7,
						"coverStartDate": "2024-06-06T02:00:00Z",
						"premiumStartDate": "2024-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00004540",
				"productCode": "Capitec",
				"commencementDate": "2024-06-06T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 15,
					"bankDetails": {
						"accountName": "tester",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 45.7,
				"arrearDetails": {
					"outstandingAmount": 137.1,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 45.7,
							"dueDate": "2025-02-15T02:00:00Z",
							"objectID": "AR0000004071",
							"totalArrearsAmount": 45.7
						},
						{
							"amount": 45.7,
							"dueDate": "2025-03-15T02:00:00Z",
							"objectID": "AR0000008225",
							"totalArrearsAmount": 91.4
						},
						{
							"amount": 45.7,
							"dueDate": "2025-04-15T02:00:00Z",
							"objectID": "AR0000011703",
							"totalArrearsAmount": 137.1
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-04T02:00:00Z",
					"effectiveCancellationDate": "2025-05-04T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousArrearsPaymentAmount": 45.7,
					"previousPaymentDate": "2024-12-15T02:00:00Z",
					"previousPaymentAmount": 45.7,
					"nextPaymentDate": "2025-05-15T02:00:00Z",
					"nextPaymentAmount": 45.7
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2024-12-06T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-06-06T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "tester",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-06-06T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 45.7,
						"contractReference": "FP00004540",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00004540"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Ms",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0788572300",
							"homephone": "0788572300",
							"workphone": "0788572300",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "5996655A-5CB0-4113-BF60-2578E9976110",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 20000,
						"premium": 49,
						"coverStartDate": "2025-09-01T02:00:00Z",
						"premiumStartDate": "2025-10-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Ms",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 20000,
						"contactDetails": {
							"cellphone": "0788572300",
							"homephone": "0788572300",
							"workphone": "0788572300",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "A7023B67-14BD-4914-A328-C2345D277B22",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 20000,
						"premium": 25.8,
						"coverStartDate": "2025-09-01T02:00:00Z",
						"premiumStartDate": "2025-10-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00081139",
				"productCode": "Capitec",
				"commencementDate": "2025-09-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 20,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 74.8,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-10-20T02:00:00Z",
					"nextPaymentAmount": 74.8
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": false,
						"availableDate": "2026-03-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-09-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-09-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 74.8,
						"contractReference": "FP00081139",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00081139"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "4B708A9D-D9A8-48A1-ACB6-78BF1839AF55",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00013198",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 2,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "CAPITEC",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-07-02T02:00:00Z",
					"previousPaymentAmount": 63.6,
					"nextPaymentDate": "2025-08-02T02:00:00Z",
					"nextPaymentAmount": 63.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00013198",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00013198"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "B14175C9-7CA5-4E59-878D-EA046906A2B1",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-05-01T02:00:00Z",
						"premiumStartDate": "2025-06-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "16753AAF-F6D5-4138-B885-A86D459E7A0A",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-05-01T02:00:00Z",
						"premiumStartDate": "2025-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00018969",
				"productCode": "Capitec",
				"commencementDate": "2025-05-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 15,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 66.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-08-28T02:00:00Z",
					"effectiveCancellationDate": "2025-08-28T02:00:00Z",
					"reason": "Other_Provider",
					"displayReason": "Policy with other service provider"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-06-15T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-08-15T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-11-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-05-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-05-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 66.6,
						"contractReference": "FP00018969",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018969"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "010E4EDA-E324-4D29-83AD-289320895345",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "B131FB92-FC63-495D-9752-36EAEAA32CD9",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-01-01T02:00:00Z",
						"premiumStartDate": "2025-02-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020741",
				"productCode": "Capitec",
				"commencementDate": "2025-01-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 28,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-08-04T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-02-28T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-07-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-01-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-01-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020741",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020741"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "FCB5AA68-AFE4-4C08-8486-F903B814C9D9",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "41A783F6-00D1-4912-841D-D8D7C30AD926",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020751",
				"productCode": "Capitec",
				"commencementDate": "2024-11-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Confidential",
					"displayReason": "Confidential"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-08-04T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-03-31T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020751",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020751"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "BC650467-38B1-4AD7-8ECC-998D0E3698BC",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00018554",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "Active",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 5,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-05T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-07-05T02:00:00Z",
					"nextPaymentAmount": 23.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00018554",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018554"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "994ED645-C037-4321-8F68-9E65DE8F7188",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "3C8F3D4D-FA45-4E4A-ACA2-9719EDC8CA33",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020958",
				"productCode": "Capitec",
				"commencementDate": "2024-11-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 30,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Confidential",
					"displayReason": "Confidential"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2024-12-31T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-01-30T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020958",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020958"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "080A76EE-EF3A-4421-B37E-A8117C33A802",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "D69CCDB3-4ECE-40B7-AC3B-F8BB6551330D",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012437",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"bank": "First National Bank",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012437",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012437"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "1343DB80-DFEF-41A7-98E4-587DE6EED3BC",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "2E6E228A-CBF3-4D56-A131-4060A6F401FE",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012439",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "First National Bank",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-07-18T02:00:00Z",
					"effectiveCancellationDate": "2025-07-18T02:00:00Z",
					"reason": "Insurer_Cancelled",
					"displayReason": "Insurer Cancelled Policy"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012439",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012439"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "9B76D6FA-3DC4-421B-92DB-CE2BC628288D",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "65034856-4045-461B-BD62-CA9B002721EA",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020956",
				"productCode": "Capitec",
				"commencementDate": "2024-11-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 29,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2024-12-29T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-02-28T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020956",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020956"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "DD2359C4-8FE4-41F7-A437-116E2A3CD05E",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-18T04:00:00Z",
						"recordID": "1967898A-515A-4FC5-8202-3184252281B1",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2024-11-01T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00020957",
				"productCode": "Capitec",
				"commencementDate": "2024-11-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Other_Provider",
					"displayReason": "Policy with other service provider"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2024-12-31T02:00:00Z",
					"previousPaymentAmount": 46.2,
					"nextPaymentDate": "2025-01-31T02:00:00Z",
					"nextPaymentAmount": 46.2
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-05-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-11-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-11-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.2,
						"contractReference": "FP00020957",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00020957"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Miss",
						"surname": "Surnamegol",
						"firstName": "Devcar",
						"middleName": "Name",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "791722269",
							"homephone": "215550000",
							"workphone": "215560000",
							"email": "test@test.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "C38170BC-C9E8-48E6-BA58-E5C3F647ACD4",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-10-29T02:00:00Z",
						"premiumStartDate": "2024-11-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "spouse",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0782222222",
							"homephone": "",
							"workphone": ""
						},
						"gender": "Male",
						"dateOfBirth": "1978-05-01T04:00:00Z",
						"recordID": "9182439B-E315-4F2D-88AC-F871EE188EAA",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 50000,
						"premium": 101.5,
						"coverStartDate": "2024-10-29T02:00:00Z",
						"premiumStartDate": "2024-11-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00010406",
				"productCode": "Capitec",
				"commencementDate": "2024-10-29T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 141.5,
				"arrearDetails": {
					"outstandingAmount": 849,
					"monthsOutstanding": 6,
					"arrears": [
						{
							"amount": 141.5,
							"dueDate": "2025-01-01T02:00:00Z",
							"objectID": "AR0000007360",
							"totalArrearsAmount": 141.5
						},
						{
							"amount": 141.5,
							"dueDate": "2025-02-01T02:00:00Z",
							"objectID": "AR0000007364",
							"totalArrearsAmount": 283
						},
						{
							"amount": 141.5,
							"dueDate": "2025-03-01T02:00:00Z",
							"objectID": "AR0000009580",
							"totalArrearsAmount": 424.5
						},
						{
							"amount": 141.5,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000009585",
							"totalArrearsAmount": 566
						},
						{
							"amount": 141.5,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000013799",
							"totalArrearsAmount": 707.5
						},
						{
							"amount": 141.5,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014567",
							"totalArrearsAmount": 849
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-13T02:00:00Z",
					"effectiveCancellationDate": "2025-06-30T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 141.5
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-04-29T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-10-29T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-10-29T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 141.5,
						"contractReference": "FP00010406",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00010406"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "C9F02387-384F-43D4-8D6D-ACFF339399EE",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 21.95,
						"coverStartDate": "2025-02-01T02:00:00Z",
						"premiumStartDate": "2025-03-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00013681",
				"productCode": "Capitec",
				"commencementDate": "2025-02-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 21.95,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-29T02:00:00Z",
					"previousPaymentAmount": 61.95,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 61.95
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-08-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-02-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-02-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 21.95,
						"contractReference": "FP00013681",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00013681"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "0A658D43-AC43-4D00-B61F-516588A336E2",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00013735",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-08-04T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-08-30T02:00:00Z",
					"nextPaymentAmount": 63.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00013735",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00013735"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Miss",
						"surname": "Surnamegol",
						"firstName": "Devcar",
						"middleName": "Name",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "791722269",
							"homephone": "215550000",
							"workphone": "215560000",
							"email": "test@test.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "8297A2FB-019B-4521-8F11-FCBACB60C95C",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-10-25T02:00:00Z",
						"premiumStartDate": "2024-11-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "parentinlaw",
						"firstName": "one",
						"idNumber": "7906130480081",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0786043153",
							"homephone": "",
							"workphone": ""
						},
						"gender": "Male",
						"dateOfBirth": "1979-06-13T04:00:00Z",
						"recordID": "717AFBF4-9D84-4169-AF3E-A220EA3ED05E",
						"recordIDType": "PAS",
						"relationship": "ParentInLaw",
						"coverAmount": 20000,
						"premium": 80.6,
						"coverStartDate": "2024-10-25T02:00:00Z",
						"premiumStartDate": "2024-11-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 1
					}
				],
				"contractReference": "FP00010315",
				"productCode": "Capitec",
				"commencementDate": "2024-10-25T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "CAPITEC BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 120.6,
				"arrearDetails": {
					"outstandingAmount": 241.2,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 120.6,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000011557",
							"totalArrearsAmount": 120.6
						},
						{
							"amount": 120.6,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014566",
							"totalArrearsAmount": 241.2
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-13T02:00:00Z",
					"effectiveCancellationDate": "2025-06-30T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-02T02:00:00Z",
					"previousPaymentAmount": 120.6,
					"nextPaymentDate": "2026-01-01T02:00:00Z",
					"nextPaymentAmount": 120.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": false,
						"availableDate": "2026-06-01T02:00:00Z",
						"isBenefitActive": false,
						"benefitStartDate": "2025-06-01T02:00:00Z",
						"benefitEndDate": "2025-12-01T02:00:00Z"
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-10-25T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-10-25T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 120.6,
						"contractReference": "FP00010315",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00010315"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Miss",
						"surname": "Surnamegol",
						"firstName": "Devcar",
						"middleName": "Name",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "791722269",
							"homephone": "215550000",
							"workphone": "215560000",
							"email": "test@test.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "D394B222-CB38-44E4-BD19-1D349AD108A0",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2024-09-27T02:00:00Z",
						"premiumStartDate": "2024-10-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "spouse",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0786431310",
							"homephone": "",
							"workphone": ""
						},
						"gender": "Male",
						"dateOfBirth": "1978-06-05T04:00:00Z",
						"recordID": "D50EC1EE-D927-4565-8326-8F39C5F89027",
						"recordIDType": "PAS",
						"relationship": "ExtendedSpouse",
						"coverAmount": 7555,
						"premium": 30.45,
						"coverStartDate": "2024-09-27T02:00:00Z",
						"premiumStartDate": "2024-11-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00010308",
				"productCode": "Capitec",
				"commencementDate": "2024-09-27T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "CAPITEC BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 70.45,
				"arrearDetails": {
					"outstandingAmount": 211.35,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 70.45,
							"dueDate": "2024-10-01T02:00:00Z",
							"objectID": "AR0000004671",
							"totalArrearsAmount": 70.45
						},
						{
							"amount": 70.45,
							"dueDate": "2024-11-01T02:00:00Z",
							"objectID": "AR0000004680",
							"totalArrearsAmount": 140.9
						},
						{
							"amount": 70.45,
							"dueDate": "2024-12-01T02:00:00Z",
							"objectID": "AR0000004685",
							"totalArrearsAmount": 211.35
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2024-12-05T02:00:00Z",
					"effectiveCancellationDate": "2024-12-05T02:00:00Z",
					"reason": "Other_Provider",
					"displayReason": "Policy with other service provider"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-01-01T02:00:00Z",
					"nextPaymentAmount": 70.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-03-27T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2026-09-27T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2024-09-27T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 70.45,
						"contractReference": "FP00010308",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00010308"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "C78E815C-5FF2-4CCD-8F01-6D34CBDBD568",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 6000,
						"premium": 40.6,
						"coverStartDate": "2025-08-28T02:00:00Z",
						"premiumStartDate": "2025-09-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 6000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "A5C1DB64-8489-4732-AA7D-B83D8170C135",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 7.35,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032707",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 47.95,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-09-01T02:00:00Z",
					"effectiveCancellationDate": "2025-09-30T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 47.35
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 47.95,
						"contractReference": "FP00032707",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032707"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "DECB9DDE-9464-4D1B-B1B9-6721149C18AC",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 6500,
						"premium": 40.9,
						"coverStartDate": "2025-06-26T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 6500,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "86DCED69-3AB6-4204-A1DD-76194275958E",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 7.35,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032716",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 30,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 48.25,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-06-26T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-30T02:00:00Z",
					"nextPaymentAmount": 48.25
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 48.25,
						"contractReference": "FP00032716",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032716"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "F2A51DB3-1BBE-4EF4-9B57-D58054EBC3BF",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 6000,
						"premium": 40.6,
						"coverStartDate": "2025-07-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 6000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "C0F83730-E696-4986-BFAA-CE155D4841FB",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 4000,
						"premium": 5.88,
						"coverStartDate": "2025-07-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032761",
				"productCode": "Capitec",
				"commencementDate": "2025-05-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 30,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.48,
				"arrearDetails": {
					"outstandingAmount": 48.55,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 48.55,
							"dueDate": "2025-06-30T02:00:00Z",
							"objectID": "AR0000018154",
							"totalArrearsAmount": 48.55
						}
					]
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-06-30T02:00:00Z",
					"nextPaymentAmount": 46.48
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-11-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-05-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-05-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.48,
						"contractReference": "FP00032761",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032761"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "E5562628-C587-4F8C-8333-BD8E6D3F75CE",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 6000,
						"premium": 40.6,
						"coverStartDate": "2025-07-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 6000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "BCB52A8D-133E-41DF-A192-5E5587120143",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 4000,
						"premium": 5.88,
						"coverStartDate": "2025-07-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032758",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 30,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 46.48,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-08-30T02:00:00Z",
					"nextPaymentAmount": 46.48
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 46.48,
						"contractReference": "FP00032758",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032758"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "315006FC-515E-4959-AE73-B665442FA1D9",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "ED29B154-C410-45C0-92D9-805138589979",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00018048",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 3,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 66.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-31T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-06-03T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-08-03T02:00:00Z",
					"nextPaymentAmount": 66.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 66.6,
						"contractReference": "FP00018048",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018048"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": true,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "86DA5C24-9DB9-4221-B81B-6EB41C6FF36C",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-05-01T02:00:00Z",
						"premiumStartDate": "2025-06-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0847129080",
							"homephone": "0847129080",
							"workphone": "0847129080",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1990-04-13T04:00:00Z",
						"recordID": "E7141C6A-AEDD-4CD1-9124-CD3B917EC2E4",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 4000,
						"premium": 5.88,
						"coverStartDate": "2025-05-01T02:00:00Z",
						"premiumStartDate": "2025-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00032765",
				"productCode": "Capitec",
				"commencementDate": "2025-05-01T02:00:00Z",
				"status": "PendingInForce",
				"pasStatus": "PendingInForce",
				"displayStatus": "Active - Pending Payment",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 30,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 45.88,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-06-30T02:00:00Z",
					"nextPaymentAmount": 45.88
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-11-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-05-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-05-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 45.88,
						"contractReference": "FP00032765",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00032765"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMESUR",
						"firstName": "DEVDEV",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "yonellaskilly@capitecbank.co.za"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "0AF2A8A7-32BA-4A6D-9A29-5488B5599758",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 5000,
						"premium": 40,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 5000,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "7B509A32-1C59-467C-B3B4-EF5465AFFC87",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00013195",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 25,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 63.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-04-15T02:00:00Z",
					"effectiveCancellationDate": "2025-04-15T02:00:00Z",
					"reason": "Insurer_Cancelled",
					"displayReason": "Insurer Cancelled Policy"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-19T02:00:00Z",
					"previousPaymentAmount": 63.6,
					"nextPaymentDate": "2025-04-19T02:00:00Z",
					"nextPaymentAmount": 63.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 63.6,
						"contractReference": "FP00013195",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00013195"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1966-02-18T04:00:00Z",
						"recordID": "E77297D7-9624-415F-B73D-BF6332B7DAAC",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 23.6,
						"coverStartDate": "2025-04-01T02:00:00Z",
						"premiumStartDate": "2025-05-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00018291",
				"productCode": "Capitec",
				"commencementDate": "2025-04-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 27,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 23.6,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-12-04T02:00:00Z",
					"effectiveCancellationDate": "2025-12-04T02:00:00Z",
					"reason": "Confidential",
					"displayReason": "Confidential"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-31T02:00:00Z",
					"previousPaymentAmount": 66.6,
					"nextPaymentDate": "2025-07-27T02:00:00Z",
					"nextPaymentAmount": 23.6
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-10-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-04-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-04-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 23.6,
						"contractReference": "FP00018291",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00018291"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "8105FC1E-AA74-42D9-80BD-8F9161295B43",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00012391",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 6.2,
				"arrearDetails": {
					"outstandingAmount": 98.1,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-04-01T02:00:00Z",
							"objectID": "AR0000014609",
							"totalArrearsAmount": 49.05
						},
						{
							"amount": 49.05,
							"dueDate": "2025-06-01T02:00:00Z",
							"objectID": "AR0000014681",
							"totalArrearsAmount": 98.1
						}
					]
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-05-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 6.2,
						"contractReference": "FP00012391",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012391"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "99EB40E1-A2BE-4528-AF81-495DD6D087A0",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 0
					}
				],
				"contractReference": "FP00012394",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Active",
				"pasStatus": "PendingOutOfForce",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Cheque"
					}
				},
				"totalPremium": 6.2,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014861",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"effectiveCancellationDate": "2026-01-29T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-07-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-08-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 6.2,
						"contractReference": "FP00012394",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012394"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "77F175E3-320A-4B98-A1D2-72872F6D2B39",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 42.85,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "3B0593DF-976E-4CC0-8FE1-C5C36E8A128C",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.2,
						"coverStartDate": "2025-03-01T02:00:00Z",
						"premiumStartDate": "2025-04-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012407",
				"productCode": "Capitec",
				"commencementDate": "2025-03-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.05,
				"arrearDetails": {
					"outstandingAmount": 49.05,
					"monthsOutstanding": 1,
					"arrears": [
						{
							"amount": 49.05,
							"dueDate": "2025-05-01T02:00:00Z",
							"objectID": "AR0000014626",
							"totalArrearsAmount": 49.05
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-05-29T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentDate": "2025-04-01T02:00:00Z",
					"previousPaymentAmount": 49.05,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.05
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-09-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-03-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-03-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.05,
						"contractReference": "FP00012407",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012407"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "6917730E-5270-4765-9495-E51870BE835E",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "9BE6E3DD-A5A1-45DA-AAAC-798F9FA65E09",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-06-01T02:00:00Z",
						"premiumStartDate": "2025-07-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012415",
				"productCode": "Capitec",
				"commencementDate": "2025-06-01T02:00:00Z",
				"status": "NotTakenUp",
				"pasStatus": "NotTakenUp",
				"displayStatus": "Not Taken Up",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-05-29T02:00:00Z",
					"effectiveCancellationDate": "2025-06-01T02:00:00Z",
					"reason": "Affordability",
					"displayReason": "Affordability"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2025-07-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2025-12-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-06-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-06-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012415",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012415"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Qaewamafyfy",
						"firstName": "Shaxaeruhe",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0717284215",
							"homephone": "0717284215",
							"workphone": "0717284215",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Female",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "796CBAA2-B04B-4B68-8AD9-5749DBA16375",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 10000,
						"premium": 43,
						"coverStartDate": "2025-12-01T02:00:00Z",
						"premiumStartDate": "2026-01-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "email",
						"firstName": "test",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 10000,
						"contactDetails": {
							"cellphone": "0717284216",
							"homephone": "0717284216",
							"workphone": "0717284216",
							"email": "TDIName315190@gmail.com"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "6A7FADBB-3722-41CB-A674-53141FA1891A",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 5000,
						"premium": 6.45,
						"coverStartDate": "2025-12-01T02:00:00Z",
						"premiumStartDate": "2026-01-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "FP00012396",
				"productCode": "Capitec",
				"commencementDate": "2025-12-01T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 1,
					"bankDetails": {
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"bank": "Capitec",
						"accountType": "Savings"
					}
				},
				"totalPremium": 49.45,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-07-22T02:00:00Z",
					"effectiveCancellationDate": "2025-12-01T02:00:00Z",
					"reason": "Insurer_Cancelled",
					"displayReason": "Insurer Cancelled Policy"
				},
				"paymentSchedule": {
					"previousPaymentAmount": 0,
					"nextPaymentDate": "2026-01-01T02:00:00Z",
					"nextPaymentAmount": 49.45
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": false,
						"availableDate": "2026-06-01T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": false,
						"availableDate": "2027-12-01T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Test",
						"branchCode": "470010",
						"accountNumber": "1509245373",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2025-12-01T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 49.45,
						"contractReference": "FP00012396",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "FP00012396"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0274178171",
							"homephone": "0000000000",
							"workphone": "0000000000",
							"email": "cgxegclagyoc@cwgrn.tme"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "BB990930-9AF5-483F-9BF0-C3C6DB4962D6",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 25.5,
						"coverStartDate": "2019-05-03T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "xgqix",
						"firstName": "xhfgvrig",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 50000,
						"contactDetails": {
							"cellphone": "0436243199",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1958-01-12T04:00:00Z",
						"recordID": "BB990930-1348-4A4E-BA3C-848BCADC3551",
						"recordIDType": "PAS",
						"relationship": "Parent",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 1
					}
				],
				"contractReference": "CF08451484",
				"productCode": "Centriq",
				"commencementDate": "2019-05-03T02:00:00Z",
				"status": "Cancelled",
				"pasStatus": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 19,
					"bankDetails": {
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"bank": "FIRST NATIONAL BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 25.5,
				"arrearDetails": {
					"outstandingAmount": 349.95,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 116.65,
							"dueDate": "2024-05-19T02:00:00Z",
							"objectID": "MZ0000000037",
							"totalArrearsAmount": 116.65
						},
						{
							"amount": 116.65,
							"dueDate": "2024-07-19T02:00:00Z",
							"objectID": "MZ0000000038",
							"totalArrearsAmount": 233.3
						},
						{
							"amount": 116.65,
							"dueDate": "2024-10-19T02:00:00Z",
							"objectID": "AR0000001860",
							"totalArrearsAmount": 349.95
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2024-11-21T02:00:00Z",
					"effectiveCancellationDate": "2024-11-21T02:00:00Z",
					"reason": "Already_Covered",
					"displayReason": "Already Covered"
				},
				"paymentSchedule": {
					"previousArrearsPaymentAmount": 116.65,
					"previousPaymentDate": "2025-07-25T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2024-12-19T02:00:00Z",
					"nextPaymentAmount": 25.5
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2019-11-03T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2021-05-03T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "Miss Devcar Surnamegol",
						"branchCode": "250655",
						"accountNumber": "62001883174",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2019-05-03T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 25.5,
						"contractReference": "CF08451484",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "CF08451484"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "SURNAMEGOL",
						"firstName": "DEVCAR",
						"middleName": "NAME",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0275563029",
							"homephone": "0000000000",
							"workphone": "0984084245"
						},
						"gender": "Male",
						"dateOfBirth": "1993-03-03T04:00:00Z",
						"recordID": "BB990930-9C57-4D16-B4F2-4AD5E1FBBF14",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 25.5,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2024-12-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mr",
						"surname": "CLXDX",
						"firstName": "NQABLL",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Male",
						"dateOfBirth": "2012-03-13T04:00:00Z",
						"recordID": "BB990930-BBF3-4435-B225-84F3C8DDAC9A",
						"recordIDType": "PAS",
						"relationship": "Child",
						"coverAmount": 20000,
						"premium": 6.6,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 1
					},
					{
						"title": "Mr",
						"surname": "CLXDX",
						"firstName": "XKVUKDJMI",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Male",
						"dateOfBirth": "2017-06-03T04:00:00Z",
						"recordID": "BB990930-5261-4AC7-A8FC-351C85E1A2C8",
						"recordIDType": "PAS",
						"relationship": "Child",
						"coverAmount": 20000,
						"premium": 6,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 2
					},
					{
						"title": "Ms",
						"surname": "MAEWKL",
						"firstName": "VTTAHTC",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1983-04-10T04:00:00Z",
						"recordID": "BB990930-76AC-406C-8DDD-8C56B3FAD06D",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 20000,
						"premium": 91,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 3
					},
					{
						"title": "Mr",
						"surname": "MAEWKL",
						"firstName": "GYTAXVQ",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Male",
						"dateOfBirth": "2008-04-14T04:00:00Z",
						"recordID": "BB990930-BABC-4882-8C15-D0817B36A1E9",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 20000,
						"premium": 10.4,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 4
					},
					{
						"title": "Ms",
						"surname": "MAEWKL",
						"firstName": "WANBLSSE",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "2010-03-08T04:00:00Z",
						"recordID": "BB990930-CBD3-479B-8DBB-9C0B6964F45B",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 20000,
						"premium": 9.8,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 5
					},
					{
						"title": "Ms",
						"surname": "MAEWKL",
						"firstName": "MAKBPMPWSJ",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "2012-09-18T04:00:00Z",
						"recordID": "BB990930-A128-421C-8710-9542E44230A6",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 20000,
						"premium": 9.4,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 6
					},
					{
						"title": "Ms",
						"surname": "BTBE",
						"firstName": "LVTWZVC",
						"idNumber": "4603100192084",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1946-03-10T04:00:00Z",
						"recordID": "BB990930-9739-4E4B-9787-4450FDB3B4A5",
						"recordIDType": "PAS",
						"relationship": "Parent",
						"coverAmount": 50000,
						"premium": 671,
						"coverStartDate": "2024-04-19T02:00:00Z",
						"premiumStartDate": "2024-05-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 7
					},
					{
						"title": "Ms",
						"surname": "CLXDX",
						"firstName": "JTKBZAEW",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 50000,
						"contactDetails": {
							"cellphone": "0473162609",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1984-09-01T04:00:00Z",
						"recordID": "BB990930-7602-431B-A0A9-16D1E5832B81",
						"recordIDType": "PAS",
						"relationship": "Spouse",
						"coverAmount": 50000,
						"premium": 79.5,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "PAS",
						"rowID": 8
					}
				],
				"contractReference": "CF08880486",
				"productCode": "Centriq",
				"commencementDate": "2019-05-16T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 21,
					"bankDetails": {
						"accountName": "IM RZ Rgqiso",
						"branchCode": "470010",
						"accountNumber": "1231606124",
						"bank": "CAPITEC BANK",
						"accountType": "Savings"
					}
				},
				"totalPremium": 909.2,
				"arrearDetails": {
					"outstandingAmount": 2823.2,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 957,
							"dueDate": "2024-10-21T02:00:00Z",
							"objectID": "AR0000001933",
							"totalArrearsAmount": 957
						},
						{
							"amount": 957,
							"dueDate": "2024-11-21T02:00:00Z",
							"objectID": "AR0000001994",
							"totalArrearsAmount": 1914
						},
						{
							"amount": 909.2,
							"dueDate": "2025-04-21T02:00:00Z",
							"objectID": "AR00005341",
							"totalArrearsAmount": 2823.2
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-01-09T02:00:00Z",
					"effectiveCancellationDate": "2025-01-09T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousArrearsPaymentAmount": 768.4,
					"previousPaymentDate": "2025-07-25T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-01-21T02:00:00Z",
					"nextPaymentAmount": 957
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2019-11-16T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2021-05-16T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "IM RZ Rgqiso",
						"branchCode": "470010",
						"accountNumber": "1231606124",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2019-05-16T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 909.2,
						"contractReference": "CF08880486",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "CF08880486"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Wtvbk",
						"firstName": "Bgcova",
						"idNumber": "9303031253080",
						"lifeAssured": true,
						"beneficiary": false,
						"contactDetails": {
							"cellphone": "0236673292",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Male",
						"dateOfBirth": "1989-04-25T04:00:00Z",
						"recordID": "BB990930-4EC8-460F-811A-6222900B4FE7",
						"recordIDType": "PAS",
						"cifNumber": "241155207",
						"relationship": "MainLife",
						"coverAmount": 100000,
						"premium": 86.55,
						"coverStartDate": "2019-05-16T02:00:00Z",
						"premiumStartDate": "2019-06-01T02:00:00Z",
						"idType": "RSAID",
						"rowID": 0
					},
					{
						"title": "Mrs",
						"surname": "XYSUSL",
						"firstName": "TTSZIL",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 50000,
						"contactDetails": {
							"cellphone": "0532269844",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Female",
						"dateOfBirth": "1985-02-03T04:00:00Z",
						"recordID": "BB990930-667D-483D-A93F-A003B38351F5",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 1
					},
					{
						"title": "Mr",
						"surname": "WYXBZ",
						"firstName": "FHFC",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 50000,
						"contactDetails": {
							"cellphone": "0532269844",
							"homephone": "0",
							"workphone": "0"
						},
						"gender": "Male",
						"dateOfBirth": "1996-01-06T04:00:00Z",
						"recordID": "BB990930-B6AD-41AC-9F0D-9F2B5D87F725",
						"recordIDType": "PAS",
						"relationship": "ExtendedFamily",
						"coverAmount": 0,
						"premium": 0,
						"idType": "PAS",
						"rowID": 2
					}
				],
				"contractReference": "CF08895109",
				"productCode": "Centriq",
				"commencementDate": "2019-05-16T02:00:00Z",
				"status": "Lapsed",
				"pasStatus": "Lapsed",
				"displayStatus": "Lapsed",
				"deductionDetails": {
					"collectionMethod": "DO",
					"collectionDay": 21,
					"bankDetails": {
						"accountName": "IM CT Uhdyn",
						"branchCode": "470010",
						"accountNumber": "1231606124",
						"bank": "CAPITEC BANK LIMITED",
						"accountType": "Savings"
					}
				},
				"totalPremium": 86.55,
				"arrearDetails": {
					"outstandingAmount": 259.65,
					"monthsOutstanding": 3,
					"arrears": [
						{
							"amount": 86.55,
							"dueDate": "2024-12-21T02:00:00Z",
							"objectID": "AR0000002912",
							"totalArrearsAmount": 86.55
						},
						{
							"amount": 86.55,
							"dueDate": "2025-01-21T02:00:00Z",
							"objectID": "AR0000002915",
							"totalArrearsAmount": 173.1
						},
						{
							"amount": 86.55,
							"dueDate": "2025-02-21T02:00:00Z",
							"objectID": "AR0000002918",
							"totalArrearsAmount": 259.65
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2025-03-12T02:00:00Z",
					"effectiveCancellationDate": "2025-03-12T02:00:00Z",
					"reason": "Lapsed",
					"displayReason": "Lapsed"
				},
				"paymentSchedule": {
					"previousArrearsPaymentAmount": 86.55,
					"previousPaymentDate": "2025-07-25T02:00:00Z",
					"previousPaymentAmount": 109.98,
					"nextPaymentDate": "2025-03-21T02:00:00Z",
					"nextPaymentAmount": 86.55
				},
				"benefits": [
					{
						"type": "NewBornPremiumWaiver",
						"available": true,
						"availableDate": "2019-11-16T02:00:00Z",
						"isBenefitActive": false
					},
					{
						"type": "VoluntaryPolicyPause",
						"available": true,
						"availableDate": "2021-05-16T02:00:00Z",
						"isBenefitActive": false
					}
				],
				"mandates": [
					{
						"accountName": "IM CT Uhdyn",
						"branchCode": "470010",
						"accountNumber": "1231606124",
						"accountType": "Bond",
						"mandateType": "Debicheck",
						"initialInstalmentAmount": 0,
						"numberOfDebitInstalments": 999999,
						"mandateStatus": "Active",
						"mandateInitiationDate": "2019-05-16T02:00:00Z",
						"mandateID": 0,
						"instalmentAmount": 86.55,
						"contractReference": "CF08895109",
						"collectionDay": 0,
						"cifNumber": 0,
						"instalmentOccurrence": "RCUR",
						"authRequired": false,
						"mandateReferenceNumber": "CF08895109"
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 0,
				"canReinstate": false,
				"isOptedOutForEarlyCollection": false
			}
		],
	},
	featureResponse: {
		features: [
			{
				enabled: true,
				visible: true,
				message: "testbingbong",
				feature: "ActivateNewBorn",
			},
			{
				enabled: true,
				visible: true,
				message: "Activate Policy Pause not available",
				feature: "ActivatePolicyPause",
			},
			{
				enabled: true,
				visible: true,
				message: "Adhoc Payment not available",
				feature: "AdhocPayment",
			},
			{
				enabled: false,
				visible: false,
				message: "Heads up: We're in mock mode!",
				feature: "Banner",
			},
			{
				enabled: true,
				visible: true,
				message: "Cancel NewBorn not available",
				feature: "CancelNewBorn",
			},
			{
				enabled: true,
				visible: true,
				message: "Cancel Policy not available",
				feature: "CancelPolicy",
			},
			{
				enabled: true,
				visible: true,
				message: "Cancel Policy Pause not available",
				feature: "CancelPolicyPause",
			},
			{
				enabled: true,
				visible: true,
				message: "Claims not available",
				feature: "Claim",
			},
			{
				enabled: true,
				visible: true,
				message: "Emailing not available",
				feature: "Emailing",
			},
			{
				enabled: true,
				visible: true,
				message: "Estimate not available",
				feature: "Estimate",
			},
			{
				enabled: true,
				visible: true,
				message: "Issue Policy not available",
				feature: "IssuePolicy",
			},
			{
				enabled: false,
				visible: false,
				message: "Reissue Policy not available",
				feature: "ReissuePolicy",
			},
			{
				enabled: true,
				visible: true,
				message: "Update Policy not available",
				feature: "UpdatePolicy",
			},
			{
				enabled: true,
				visible: true,
				message: "Waiver Waiting test not available",
				feature: "WaiverWaitingPeriod",
			},
		],
	},
};
