/**
 * ClientPolicies mock response
 *
 * @export
 * @constant ClientPolicies
 */
export const ClientPolicies = {
	"checkInsuranceDetails": [
		{
			"insured": true,
			"maxAllowedCover": 100000,
			"productCode": "Capitec",
			"productName": "Capitec Funeral Cover Plan"
		}
	],
	"summaryDetails": {
		"policies": [
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Smith",
						"firstName": "John",
						"middleName1": "Marshal",
						"middleName2": "Wilson",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": false,
						"benefitPayout": 5000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"gender": "Male",
						"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 45.1,
						"age": 36,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Fritz",
						"firstName": "Jess",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 3000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "1992-04-06T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 35000,
						"premium": 32.5,
						"age": 31,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Black",
						"firstName": "Ian",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 0,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 15000,
						"premium": 12.35,
						"age": 13,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mrs",
						"surname": "Taylor",
						"firstName": "Leanne",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 0,
						"contactDetails": {
							"cellphone": "061 587 8542",
							"homephone": "string",
							"workphone": "string",
							"email": "LeanneT@gmail.com"
						  },
						"dateOfBirth": "1992-04-14T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 25000,
						"premium": 29.5,
						"age": 30,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Blake",
						"firstName": "Sam",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 15000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 10000,
						"premium": 9.85,
						"age": 8,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					}
				],
				"contractReference": "CF00192343",
				"productCode": "Capitec",
				"commencementDate": "2022-05-02T22:00:00.0000000+00:00",
				"status": "Cancelled",
				"displayStatus": "Cancelled",
				"deductionDetails": {
					"collectionMethod": "EFT",
					"mandateReferenceNumber": "",
					"frequency": "MONTHLY",
					"effectiveFromDate": "2020-02-29T22:00:00.0000000+00:00",
					"effectiveToDate": "2020-04-30T22:00:00.0000000+00:00",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				},
				"totalPremium": 120.8,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0,
					"arrears": [
						{
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2022-03-24T13:22:51.820Z",
					"effectiveCancellationDate": "2022-03-24T13:22:51.820Z",
					"reason": "Affordability"
				},
				"paymentSchedule": {
					"previousArrearsPaymentDate": "2022-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 120.8,
					"previousPaymentDate": "2022-04-04T22:00:00.0000000+00:00",
					"previousPaymentAmount": 120.8,
					"nextPaymentDate": "2022-05-04T22:00:00.0000000+00:00",
					"nextPaymentAmount": 120.8
				},
				"benefits": [
					{
						"type": "NewBorn",
						"available": true,
						"availableDate": "2022-03-24T13:22:51.820Z"
					}
				],
				"mandates": [
					{
						"mandateType": "EFT",
						"initialInstalmentAmount": 0,
						"firstCollectionDate": "2022-03-24T13:22:51.820Z",
						"numberOfDebitInstalments": 0,
						"statusReason": "string",
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "CF00192343",
						"collectionDay": 0,
						"cifNumber": 0,
						"idNumber": "string",
						"instalmentOccurrence": "OOFF",
						"messageAuthenticationCode": "string",
						"authRequired": true,
						"mandateReferenceNumber": "string",
						"contactNumber": "string",
						"voiceRecordingNumber": "string",
						"mandateRequestTransactionIdentifier": "string",
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				],
				"claims": [
					{
						"roleplayer": {
							"title": "Mr",
							"surname": "Smith",
							"firstName": "John",
							"middleName1": "Marshal",
							"middleName2": "Wilson",
							"idType": "RSAID",
							"idNumber": "string",
							"nationality": "AD",
							"lifeAssured": true,
							"beneficiary": false,
							"benefitPayout": 5000,
							"cellphone": "string",
							"homephone": "string",
							"workphone": "string",
							"email": "string",
							"gender": "Male",
							"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
							"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
							"recordID": "4924658741.288",
							"recordIDType": "RSAID",
							"relationship": "MainLife",
							"coverAmount": 10000,
							"premium": 100.3,
							"age": 31,
							"genderType": "Male",
							"rowID": 1,
							"validationErrors": [
								{
									"errorMessage": "Field cannot be empty",
									"fieldName": "Surname",
									"errorCode": "BANCS_TECHNICAL_FAILURE"
								}
							]
						},
						"claimsReference": "CLM-19238343",
						"claimSettlementAmount": 40000,
						"taskReference": "FLO-191023-RK4",
						"claimIntimationDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimReceivedOnDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimIncidentDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimStatus": "Claim initiated",
						"clientClaimStatus": "Claim Under Assessment",
						"claimType": "Other",
						"subClaimType": "",
						"causeOfIncident": "Natural",
						"documentsRequired": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"documentsReceived": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"paymentTransaction": [
							{
								"date": "2020-02-05",
								"amount": 50000,
								"bankDetails": [
									{
										"accountName": "Mr John Smith",
										"branchCode": "470010",
										"accountNumber": "8459878987",
										"bank": "Capitec Bank",
										"accountType": "Bond"
									}
								],
								"beneficiary": {
									"title": "Mr",
									"surname": "Smith",
									"firstName": "John",
									"middleName1": "Marshal",
									"middleName2": "Wilson",
									"idType": "RSAID",
									"idNumber": "string",
									"nationality": "AD",
									"lifeAssured": true,
									"beneficiary": false,
									"benefitPayout": 5000,
									"cellphone": "string",
									"homephone": "string",
									"workphone": "string",
									"email": "string",
									"gender": "Male",
									"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
									"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
									"recordID": "4924658741.288",
									"recordIDType": "RSAID",
									"relationship": "MainLife",
									"coverAmount": 10000,
									"premium": 100.3,
									"age": 31,
									"genderType": "Male",
									"rowID": 1,
									"validationErrors": [
										{
											"errorMessage": "Field cannot be empty",
											"fieldName": "Surname",
											"errorCode": "BANCS_TECHNICAL_FAILURE"
										}
									]
								},
								"payStatus": "Authorised"
							}
						],
						"incidentNumber": "63357450",
						"lastComment": "",
						"repudiationDate": "2019-10-23T22:00:00.0000000+00:00",
						"repudiationReason": ""
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 40,
				"canReinstate": true
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Smith",
						"firstName": "John",
						"middleName1": "Marshal",
						"middleName2": "Wilson",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": false,
						"benefitPayout": 5000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"gender": "Male",
						"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 45.1,
						"age": 36,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Fritz",
						"firstName": "Jess",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 3000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "1992-04-06T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 35000,
						"premium": 32.5,
						"age": 31,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Black",
						"firstName": "Ian",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 0,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 15000,
						"premium": 12.35,
						"age": 13,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mrs",
						"surname": "Taylor",
						"firstName": "Leanne",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 0,
						"contactDetails": {
							"cellphone": "061 587 8542",
							"homephone": "string",
							"workphone": "string",
							"email": "LeanneT@gmail.com"
						  },
						"dateOfBirth": "1992-04-14T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 25000,
						"premium": 29.5,
						"age": 30,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Blake",
						"firstName": "Sam",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 15000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 10000,
						"premium": 9.85,
						"age": 8,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					}
				],
				"contractReference": "FP254698",
				"productCode": "Capitec",
				"commencementDate": "2022-06-12T22:00:00.0000000+00:00",
				"status": "Active",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "EFT",
					"mandateReferenceNumber": "",
					"frequency": "MONTHLY",
					"effectiveFromDate": "2020-02-29T22:00:00.0000000+00:00",
					"effectiveToDate": "2020-04-30T22:00:00.0000000+00:00",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				},
				"totalPremium": 120.8,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0,
					"arrears": [
						{
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2022-03-24T13:22:51.820Z",
					"effectiveCancellationDate": "2022-03-24T13:22:51.820Z",
					"reason": "Affordability"
				},
				"paymentSchedule": {
					"previousArrearsPaymentDate": "2022-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 120.8,
					"previousPaymentDate": "2022-04-04T22:00:00.0000000+00:00",
					"previousPaymentAmount": 120.8,
					"nextPaymentDate": "2022-05-04T22:00:00.0000000+00:00",
					"nextPaymentAmount": 120.8
				},
				"benefits": [
					{
						"type": "NewBorn",
						"available": true,
						"availableDate": "2022-03-24T13:22:51.820Z"
					}
				],
				"mandates": [
					{
						"mandateType": "EFT",
						"initialInstalmentAmount": 0,
						"firstCollectionDate": "2022-03-24T13:22:51.820Z",
						"numberOfDebitInstalments": 0,
						"statusReason": "string",
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "CF00192343",
						"collectionDay": 0,
						"cifNumber": 0,
						"idNumber": "string",
						"instalmentOccurrence": "OOFF",
						"messageAuthenticationCode": "string",
						"authRequired": true,
						"mandateReferenceNumber": "string",
						"contactNumber": "string",
						"voiceRecordingNumber": "string",
						"mandateRequestTransactionIdentifier": "string",
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				],
				"claims": [
					{
						"roleplayer": {
							"title": "Mr",
							"surname": "Smith",
							"firstName": "John",
							"middleName1": "Marshal",
							"middleName2": "Wilson",
							"idType": "RSAID",
							"idNumber": "string",
							"nationality": "AD",
							"lifeAssured": true,
							"beneficiary": false,
							"benefitPayout": 5000,
							"cellphone": "string",
							"homephone": "string",
							"workphone": "string",
							"email": "string",
							"gender": "Male",
							"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
							"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
							"recordID": "4924658741.288",
							"recordIDType": "RSAID",
							"relationship": "MainLife",
							"coverAmount": 10000,
							"premium": 100.3,
							"age": 31,
							"genderType": "Male",
							"rowID": 1,
							"validationErrors": [
								{
									"errorMessage": "Field cannot be empty",
									"fieldName": "Surname",
									"errorCode": "BANCS_TECHNICAL_FAILURE"
								}
							]
						},
						"claimsReference": "CLM-19238343",
						"claimSettlementAmount": 40000,
						"taskReference": "FLO-191023-RK4",
						"claimIntimationDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimReceivedOnDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimIncidentDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimStatus": "Claim initiated",
						"clientClaimStatus": "Claim Under Assessment",
						"claimType": "Other",
						"subClaimType": "",
						"causeOfIncident": "Natural",
						"documentsRequired": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"documentsReceived": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"paymentTransaction": [
							{
								"date": "2020-02-05",
								"amount": 50000,
								"bankDetails": [
									{
										"accountName": "Mr John Smith",
										"branchCode": "470010",
										"accountNumber": "8459878987",
										"bank": "Capitec Bank",
										"accountType": "Bond"
									}
								],
								"beneficiary": {
									"title": "Mr",
									"surname": "Smith",
									"firstName": "John",
									"middleName1": "Marshal",
									"middleName2": "Wilson",
									"idType": "RSAID",
									"idNumber": "string",
									"nationality": "AD",
									"lifeAssured": true,
									"beneficiary": false,
									"benefitPayout": 5000,
									"cellphone": "string",
									"homephone": "string",
									"workphone": "string",
									"email": "string",
									"gender": "Male",
									"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
									"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
									"recordID": "4924658741.288",
									"recordIDType": "RSAID",
									"relationship": "MainLife",
									"coverAmount": 10000,
									"premium": 100.3,
									"age": 31,
									"genderType": "Male",
									"rowID": 1,
									"validationErrors": [
										{
											"errorMessage": "Field cannot be empty",
											"fieldName": "Surname",
											"errorCode": "BANCS_TECHNICAL_FAILURE"
										}
									]
								},
								"payStatus": "Authorised"
							}
						],
						"incidentNumber": "63357450",
						"lastComment": "",
						"repudiationDate": "2019-10-23T22:00:00.0000000+00:00",
						"repudiationReason": ""
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 40,
				"canReinstate": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Smith",
						"firstName": "John",
						"middleName1": "Marshal",
						"middleName2": "Wilson",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": false,
						"benefitPayout": 5000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"gender": "Male",
						"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 45.1,
						"age": 36,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Fritz",
						"firstName": "Jess",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 3000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "1992-04-06T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 35000,
						"premium": 32.5,
						"age": 31,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Black",
						"firstName": "Ian",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 0,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 15000,
						"premium": 12.35,
						"age": 13,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mrs",
						"surname": "Taylor",
						"firstName": "Leanne",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 0,
						"contactDetails": {
							"cellphone": "061 587 8542",
							"homephone": "string",
							"workphone": "string",
							"email": "LeanneT@gmail.com"
						  },
						"dateOfBirth": "1992-04-14T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 25000,
						"premium": 29.5,
						"age": 30,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Blake",
						"firstName": "Sam",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 15000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 10000,
						"premium": 9.85,
						"age": 8,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					}
				],
				"contractReference": "FP123456",
				"productCode": "Capitec",
				"commencementDate": "2021-04-02T22:00:00.0000000+00:00",
				"status": "Active",
				"displayStatus": "Active",
				"deductionDetails": {
					"collectionMethod": "EFT",
					"mandateReferenceNumber": "",
					"frequency": "MONTHLY",
					"effectiveFromDate": "2020-02-29T22:00:00.0000000+00:00",
					"effectiveToDate": "2020-04-30T22:00:00.0000000+00:00",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				},
				"totalPremium": 120.8,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0,
					"arrears": [
						{
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2022-03-24T13:22:51.820Z",
					"effectiveCancellationDate": "2022-03-24T13:22:51.820Z",
					"reason": "Affordability"
				},
				"paymentSchedule": {
					"previousArrearsPaymentDate": "2022-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 120.8,
					"previousPaymentDate": "2022-04-04T22:00:00.0000000+00:00",
					"previousPaymentAmount": 120.8,
					"nextPaymentDate": "2022-05-04T22:00:00.0000000+00:00",
					"nextPaymentAmount": 120.8
				},
				"benefits": [
					{
						"type": "NewBorn",
						"available": true,
						"availableDate": "2022-03-24T13:22:51.820Z"
					}
				],
				"mandates": [
					{
						"mandateType": "EFT",
						"initialInstalmentAmount": 0,
						"firstCollectionDate": "2022-03-24T13:22:51.820Z",
						"numberOfDebitInstalments": 0,
						"statusReason": "string",
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "CF00192343",
						"collectionDay": 0,
						"cifNumber": 0,
						"idNumber": "string",
						"instalmentOccurrence": "OOFF",
						"messageAuthenticationCode": "string",
						"authRequired": true,
						"mandateReferenceNumber": "string",
						"contactNumber": "string",
						"voiceRecordingNumber": "string",
						"mandateRequestTransactionIdentifier": "string",
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				],
				"claims": [
					{
						"roleplayer": {
							"title": "Mr",
							"surname": "Smith",
							"firstName": "John",
							"middleName1": "Marshal",
							"middleName2": "Wilson",
							"idType": "RSAID",
							"idNumber": "string",
							"nationality": "AD",
							"lifeAssured": true,
							"beneficiary": false,
							"benefitPayout": 5000,
							"cellphone": "string",
							"homephone": "string",
							"workphone": "string",
							"email": "string",
							"gender": "Male",
							"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
							"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
							"recordID": "4924658741.288",
							"recordIDType": "RSAID",
							"relationship": "MainLife",
							"coverAmount": 10000,
							"premium": 100.3,
							"age": 31,
							"genderType": "Male",
							"rowID": 1,
							"validationErrors": [
								{
									"errorMessage": "Field cannot be empty",
									"fieldName": "Surname",
									"errorCode": "BANCS_TECHNICAL_FAILURE"
								}
							]
						},
						"claimsReference": "CLM-19238343",
						"claimSettlementAmount": 40000,
						"taskReference": "FLO-191023-RK4",
						"claimIntimationDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimReceivedOnDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimIncidentDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimStatus": "Claim initiated",
						"clientClaimStatus": "Claim Under Assessment",
						"claimType": "Other",
						"subClaimType": "",
						"causeOfIncident": "Natural",
						"documentsRequired": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"documentsReceived": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"paymentTransaction": [
							{
								"date": "2020-02-05",
								"amount": 50000,
								"bankDetails": [
									{
										"accountName": "Mr John Smith",
										"branchCode": "470010",
										"accountNumber": "8459878987",
										"bank": "Capitec Bank",
										"accountType": "Bond"
									}
								],
								"beneficiary": {
									"title": "Mr",
									"surname": "Smith",
									"firstName": "John",
									"middleName1": "Marshal",
									"middleName2": "Wilson",
									"idType": "RSAID",
									"idNumber": "string",
									"nationality": "AD",
									"lifeAssured": true,
									"beneficiary": false,
									"benefitPayout": 5000,
									"cellphone": "string",
									"homephone": "string",
									"workphone": "string",
									"email": "string",
									"gender": "Male",
									"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
									"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
									"recordID": "4924658741.288",
									"recordIDType": "RSAID",
									"relationship": "MainLife",
									"coverAmount": 10000,
									"premium": 100.3,
									"age": 31,
									"genderType": "Male",
									"rowID": 1,
									"validationErrors": [
										{
											"errorMessage": "Field cannot be empty",
											"fieldName": "Surname",
											"errorCode": "BANCS_TECHNICAL_FAILURE"
										}
									]
								},
								"payStatus": "Authorised"
							}
						],
						"incidentNumber": "63357450",
						"lastComment": "",
						"repudiationDate": "2019-10-23T22:00:00.0000000+00:00",
						"repudiationReason": ""
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 40,
				"canReinstate": false
			},
			{
				"roleplayers": [
					{
						"title": "Mr",
						"surname": "Smith",
						"firstName": "John",
						"middleName1": "Marshal",
						"middleName2": "Wilson",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": false,
						"benefitPayout": 5000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"gender": "Male",
						"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "MainLife",
						"coverAmount": 50000,
						"premium": 45.1,
						"age": 36,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Fritz",
						"firstName": "Jess",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 3000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "1992-04-06T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 35000,
						"premium": 32.5,
						"age": 31,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Black",
						"firstName": "Ian",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": true,
						"beneficiary": false,
						"benefitPayout": 0,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 15000,
						"premium": 12.35,
						"age": 13,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mrs",
						"surname": "Taylor",
						"firstName": "Leanne",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 0,
						"contactDetails": {
							"cellphone": "061 587 8542",
							"homephone": "string",
							"workphone": "string",
							"email": "LeanneT@gmail.com"
						  },
						"dateOfBirth": "1992-04-14T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Spouse",
						"coverAmount": 25000,
						"premium": 29.5,
						"age": 30,
						"genderType": "Female",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					},
					{
						"title": "Mr",
						"surname": "Blake",
						"firstName": "Sam",
						"middleName1": "",
						"middleName2": "",
						"idType": "RSAID",
						"idNumber": "string",
						"nationality": "AD",
						"lifeAssured": false,
						"beneficiary": true,
						"benefitPayout": 15000,
						"cellphone": "string",
						"homephone": "string",
						"workphone": "string",
						"email": "string",
						"dateOfBirth": "2009-02-24T22:00:00.0000000+00:00",
						"gender": "Male",
						"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
						"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
						"recordID": "4924658741.288",
						"recordIDType": "RSAID",
						"relationship": "Child",
						"coverAmount": 10000,
						"premium": 9.85,
						"age": 8,
						"genderType": "Male",
						"rowID": 1,
						"validationErrors": [
							{
								"errorMessage": "Field cannot be empty",
								"fieldName": "Surname",
								"errorCode": "BANCS_TECHNICAL_FAILURE"
							}
						]
					}
				],
				"contractReference": "CF00190001",
				"productCode": "Capitec",
				"commencementDate": "2020-03-02T22:00:00.0000000+00:00",
				"status": "InForce",
				"displayStatus": "In Force",
				"deductionDetails": {
					"collectionMethod": "EFT",
					"mandateReferenceNumber": "",
					"frequency": "MONTHLY",
					"effectiveFromDate": "2020-02-29T22:00:00.0000000+00:00",
					"effectiveToDate": "2020-04-30T22:00:00.0000000+00:00",
					"collectionDay": 31,
					"bankDetails": {
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				},
				"totalPremium": 240.5,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 0,
					"arrears": [
						{
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2022-03-24T13:22:51.820Z",
					"effectiveCancellationDate": "2022-03-24T13:22:51.820Z",
					"reason": "Affordability"
				},
				"paymentSchedule": {
					"previousArrearsPaymentDate": "2022-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 120.8,
					"previousPaymentDate": "2022-04-04T22:00:00.0000000+00:00",
					"previousPaymentAmount": 120.8,
					"nextPaymentDate": "2022-05-04T22:00:00.0000000+00:00",
					"nextPaymentAmount": 120.8
				},
				"benefits": [
					{
						"type": "NewBorn",
						"available": true,
						"availableDate": "2022-03-24T13:22:51.820Z"
					}
				],
				"mandates": [
					{
						"mandateType": "EFT",
						"initialInstalmentAmount": 0,
						"firstCollectionDate": "2022-03-24T13:22:51.820Z",
						"numberOfDebitInstalments": 0,
						"statusReason": "string",
						"mandateStatus": "Active",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "CF00192343",
						"collectionDay": 0,
						"cifNumber": 0,
						"idNumber": "string",
						"instalmentOccurrence": "OOFF",
						"messageAuthenticationCode": "string",
						"authRequired": true,
						"mandateReferenceNumber": "string",
						"contactNumber": "string",
						"voiceRecordingNumber": "string",
						"mandateRequestTransactionIdentifier": "string",
						"accountName": "Mr John Smith",
						"branchCode": "470010",
						"accountNumber": "8459878987",
						"bank": "Capitec Bank",
						"accountType": "Bond"
					}
				],
				"claims": [
					{
						"roleplayer": {
							"title": "Mr",
							"surname": "Smith",
							"firstName": "John",
							"middleName1": "Marshal",
							"middleName2": "Wilson",
							"idType": "RSAID",
							"idNumber": "string",
							"nationality": "AD",
							"lifeAssured": true,
							"beneficiary": false,
							"benefitPayout": 5000,
							"cellphone": "string",
							"homephone": "string",
							"workphone": "string",
							"email": "string",
							"gender": "Male",
							"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
							"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
							"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
							"recordID": "4924658741.288",
							"recordIDType": "RSAID",
							"relationship": "MainLife",
							"coverAmount": 10000,
							"premium": 100.3,
							"age": 31,
							"genderType": "Male",
							"rowID": 1,
							"validationErrors": [
								{
									"errorMessage": "Field cannot be empty",
									"fieldName": "Surname",
									"errorCode": "BANCS_TECHNICAL_FAILURE"
								}
							]
						},
						"claimsReference": "CLM-19238343",
						"claimSettlementAmount": 40000,
						"taskReference": "FLO-191023-RK4",
						"claimIntimationDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimReceivedOnDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimIncidentDate": "2019-10-22T22:00:00.0000000+00:00",
						"claimStatus": "Claim initiated",
						"clientClaimStatus": "Claim Under Assessment",
						"claimType": "Other",
						"subClaimType": "",
						"causeOfIncident": "Natural",
						"documentsRequired": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"documentsReceived": [
							{
								"isMandatory": true,
								"docStatus": "Pending",
								"documentCode": "Death_Certificate",
								"documentName": "Death Certificate",
								"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e"
							}
						],
						"paymentTransaction": [
							{
								"date": "2020-02-05",
								"amount": 50000,
								"bankDetails": [
									{
										"accountName": "Mr John Smith",
										"branchCode": "470010",
										"accountNumber": "8459878987",
										"bank": "Capitec Bank",
										"accountType": "Bond"
									}
								],
								"beneficiary": {
									"title": "Mr",
									"surname": "Smith",
									"firstName": "John",
									"middleName1": "Marshal",
									"middleName2": "Wilson",
									"idType": "RSAID",
									"idNumber": "string",
									"nationality": "AD",
									"lifeAssured": true,
									"beneficiary": false,
									"benefitPayout": 5000,
									"cellphone": "string",
									"homephone": "string",
									"workphone": "string",
									"email": "string",
									"gender": "Male",
									"dateOfBirth": "1991-02-02T22:00:00.0000000+00:00",
									"coverStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"premiumStartDate": "2020-02-29T22:00:00.0000000+00:00",
									"coverEndDate": "2020-04-30T22:00:00.0000000+00:00",
									"recordID": "4924658741.288",
									"recordIDType": "RSAID",
									"relationship": "MainLife",
									"coverAmount": 10000,
									"premium": 100.3,
									"age": 31,
									"genderType": "Male",
									"rowID": 1,
									"validationErrors": [
										{
											"errorMessage": "Field cannot be empty",
											"fieldName": "Surname",
											"errorCode": "BANCS_TECHNICAL_FAILURE"
										}
									]
								},
								"payStatus": "Authorised"
							}
						],
						"incidentNumber": "63357450",
						"lastComment": "",
						"repudiationDate": "2019-10-23T22:00:00.0000000+00:00",
						"repudiationReason": ""
					}
				],
				"policyRule": "Standard",
				"policyMinumumPremium": 40,
				"canReinstate": false
			}
		]
	},
	"success": true,
};