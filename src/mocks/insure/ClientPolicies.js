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
					}
				],
				"contractReference": "CF0123456",
				"productCode": "Capitec",
				"commencementDate": "2020-03-02T22:00:00.0000000+00:00",
				"status": "PendingInForce",
				"displayStatus": "Pending In Force",
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
				"totalPremium": 2250.2,
				"arrearDetails": {
					"outstandingAmount": 0,
					"monthsOutstanding": 2,
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
					"previousArrearsPaymentDate": "2020-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 255.2,
					"previousPaymentDate": "2020-01-24T22:00:00.0000000+00:00",
					"previousPaymentAmount": 255.2,
					"nextPaymentDate": "2020-02-24T22:00:00.0000000+00:00",
					"nextPaymentAmount": 255.2
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
						"mandateStatus": "Inactive",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "string",
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
				"policyMinumumPremium": 40
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
					}
				],
				"contractReference": "CF09847678",
				"productCode": "Capitec",
				"commencementDate": "2020-03-02T22:00:00.0000000+00:00",
				"status": "PendingInForce",
				"displayStatus": "Pending In Force",
				"deductionDetails": {
					"collectionMethod": "EFT",
					"mandateReferenceNumber": "",
					"frequency": "MONTHLY",
					"effectiveFromDate": "2021-04-14T22:00:00.0000000+00:00",
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
				"totalPremium": 1800,
				"arrearDetails": {
					"outstandingAmount": 376.8,
					"monthsOutstanding": 2,
					"arrears": [
						{
							"amount": 225.2,
							"dueDate": "2020-02-29T22:00:00.0000000+00:00",
							"objectID": "24324234.43"
						}
					]
				},
				"cancellationDetails": {
					"recordedCancellationDate": "2022-03-24T13:22:51.820Z",
					"effectiveCancellationDate": "2022-03-24T13:22:51.820Z",
					"reason": "Affordability"
				},
				"paymentSchedule": {
					"previousArrearsPaymentDate": "2020-01-27T22:00:00.0000000+00:00",
					"previousArrearsPaymentAmount": 255.2,
					"previousPaymentDate": "2020-01-24T22:00:00.0000000+00:00",
					"previousPaymentAmount": 255.2,
					"nextPaymentDate": "2020-02-24T22:00:00.0000000+00:00",
					"nextPaymentAmount": 255.2
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
						"mandateStatus": "Inactive",
						"mandateInitiationDate": "2022-03-24T13:22:51.820Z",
						"mandateID": 0,
						"lastCollectionDate": "2022-03-24T13:22:51.820Z",
						"instalmentAmount": 0,
						"contractReference": "string",
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
				"policyMinumumPremium": 40
			}
		]
	},
	"success": true,
};