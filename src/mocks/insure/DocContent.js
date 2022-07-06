/**
 * DocContent mock response
 *
 * @export
 * @constant DocContent
 */
export const DocContent = {
	"contractReference": "CF09847678",
	"productCode": "Capitec",
	"commencementDate": "2020-05-10T17:35:05.190Z",
	"status": "PendingInForce",
	"displayStatus": "Pending In Force",
	"deductionDetails": {
		"collectionDay": 30,
		"bankDetails": {
			"accountName": "Mr John Smith",
			"branchCode": "470010",
			"accountNumber": "8459878987",
			"bank": "Capitec Bank",
			"accountType": "Bond"
		},
		"collectionMethod": "EFT",
		"mandateReferenceNumber": "",
		"frequency": "MONTHLY",
		"effectiveFromDate": "2022-05-10T17:35:05.190Z",
		"effectiveToDate": "2022-05-10T17:35:05.190Z"
	},
	"totalPremium": 95.5,
	"arrearDetails": {
		"outstandingAmount": 289.5,
		"monthsOutstanding": 3,
		"arrears": [
			{
				"amount": 95.5,
				"dueDate": "2022-02-10T17:35:05.191Z",
				"objectID": ""
			},
			{
				"amount": 95.5,
				"dueDate": "2022-03-08T17:35:05.191Z",
				"objectID": ""
			},
			{
				"amount": 95.5,
				"dueDate": "2022-04-06T17:35:05.191Z",
				"objectID": ""
			}
		]
	},
	"cancellationDetails": {
		"recordedCancellationDate": "2022-05-10T17:35:05.191Z",
		"effectiveCancellationDate": "2022-05-10T17:35:05.191Z",
		"reason": "Affordability"
	},
	"paymentSchedule": {
		"previousArrearsPaymentDate": "2022-01-27T22:00:00.0000000+00:00",
		"previousArrearsPaymentAmount": 95.5,
		"previousPaymentDate": "2022-05-24T22:00:00.0000000+00:00",
		"previousPaymentAmount": 95.5,
		"nextPaymentDate": "2022-06-24T22:00:00.0000000+00:00",
		"nextPaymentAmount": 95.5
	},
	"benefits": [
		{
			"type": "NewBorn",
			"available": true,
			"availableDate": "2022-05-10T17:35:05.191Z"
		}
	],
	"mandates": [
		{
			"accountName": "Mr John Smith",
			"branchCode": "470010",
			"accountNumber": "8459878987",
			"bank": "Capitec Bank",
			"accountType": "Bond",
			"mandateType": "EFT",
			"initialInstalmentAmount": 0,
			"firstCollectionDate": "2022-05-10T17:35:05.191Z",
			"numberOfDebitInstalments": 0,
			"statusReason": "string",
			"mandateStatus": "Inactive",
			"mandateInitiationDate": "2022-05-10T17:35:05.191Z",
			"mandateID": 0,
			"lastCollectionDate": "2022-05-10T17:35:05.191Z",
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
			"mandateRequestTransactionIdentifier": "string"
		}
	],
	"claims": [
		{
			"roleplayer": {
				"title": "Mr",
				"surname": "Smith",
				"firstName": "John",
				"middleName": "Marshal",
				"idNumber": "8006045095089",
				"lifeAssured": true,
				"beneficiary": true,
				"benefitPayout": 5000,
				"contactDetails": {
					"cellphone": "string",
					"homephone": "string",
					"workphone": "string",
					"email": "string"
				},
				"gender": "Male",
				"dateOfBirth": "2022-05-10T17:35:05.191Z",
				"recordID": "string",
				"cifNumber": 0,
				"relationship": "MainLife",
				"coverAmount": 10000,
				"premium": 100.3,
				"rowID": 0
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
					"documentCode": "Death_Certificate",
					"documentName": "Death Certificate",
					"guid": "3040c039-1c97-4ef5-8976-ee9083dccf3e",
					"isMandatory": true,
					"docStatus": "Pending"
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
						"idNumber": "8006045095089",
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 7000,
						"contactDetails": {
							"cellphone": "string",
							"homephone": "string",
							"workphone": "string",
							"email": "string"
						},
						"gender": "Male",
						"dateOfBirth": "2022-05-10T17:35:05.191Z",
						"recordID": "string",
						"cifNumber": 0,
						"relationship": "MainLife",
						"coverAmount": 0,
						"premium": 0,
						"rowID": 0
					},
					"payStatus": "Authorised"
				}
			],
			"incidentNumber": "string",
			"lastComment": "string",
			"repudiationDate": "2022-05-10T17:35:05.191Z",
			"repudiationReason": "string"
		}
	],
	"policyRule": "Standard",
	"policyMinumumPremium": 0,
	"roleplayers": [
		{
			"title": "Mr",
			"surname": "Motseko",
			"firstName": "Linda",
			"middleName": "",
			"idNumber": "8006045095089",
			"lifeAssured": false,
			"beneficiary": false,
			"benefitPayout": 15000,
			"contactDetails": {
				"cellphone": "061 111 1111",
				"homephone": "string",
				"workphone": "string",
				"email": "abc@gmail.com"
			},
			"gender": "Male",
			"dateOfBirth": "1982-04-15T12:15:05.191Z",
			"recordID": "string",
			"cifNumber": 0,
			"relationship": "MainLife",
			"coverAmount": 50000,
			"premium": 48.5,
			"rowID": 0
		},
		{
			"title": "Mrs",
			"surname": "Naidoo",
			"firstName": "Thaliya",
			"middleName": "Mishka",
			"idNumber": "8006045095089",
			"lifeAssured": true,
			"beneficiary": true,
			"benefitPayout": 15000,
			"contactDetails": {
				"cellphone": "061 111 1111",
				"homephone": "string",
				"workphone": "string",
				"email": "abc@gmail.com"
			},
			"gender": "Female",
			"dateOfBirth": "1989-10-11T12:15:05.191Z",
			"recordID": "string",
			"cifNumber": 0,
			"relationship": "Spouse",
			"coverAmount": 25000,
			"premium": 25,
			"rowID": 0
		},
		{
			"title": "Mr",
			"surname": "Makamu",
			"firstName": "Mano",
			"middleName": "",
			"idNumber": "8006045095089",
			"lifeAssured": false,
			"beneficiary": true,
			"benefitPayout": 12000,
			"contactDetails": {
				"cellphone": "",
				"homephone": "string",
				"workphone": "string",
				"email": ""
			},
			"gender": "Male",
			"dateOfBirth": "2012-02-24T05:25:05.191Z",
			"recordID": "string",
			"cifNumber": 0,
			"relationship": "Child",
			"coverAmount": 25000,
			"premium": 22,
			"rowID": 0
		},
		{
			"title": "Mr",
			"surname": "Mpai",
			"firstName": "Neo",
			"middleName": "Nyathi",
			"idNumber": "8006045095089",
			"lifeAssured": true,
			"beneficiary": false,
			"benefitPayout": 8000,
			"contactDetails": {
				"cellphone": "string",
				"homephone": "string",
				"workphone": "string",
				"email": "string"
			},
			"gender": "Male",
			"dateOfBirth": "1996-03-10T17:35:05.191Z",
			"recordID": "string",
			"cifNumber": 0,
			"relationship": "Child",
			"coverAmount": 25000,
			"premium": 22,
			"rowID": 0
		}
	]
};
