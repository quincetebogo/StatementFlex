/**
 * Create Policy mock response
 *
 * @export
 * @constant CreatePolicy
 */
export const CreatePolicy = {
	"contractReference": `CF0123456`,
	"productCode": `Capitec`,
	"commencementDate": `2022-05-02T22:00:00.0000000+00:00`,
	"status": `Active`,
	"displayStatus": `Active`,
	"deductionDetails": {
		"collectionDay": 1,
		"bankDetails": {
			"accountName": `SAVINGS ACCOUNT`,
			"branchCode": `470010`,
			"accountNumber": `1584182332`,
			"bank": `Capitec Bank`,
			"accountType": `Savings`
		},
		"collectionMethod": `EFT`,
		"mandateReferenceNumber": ``,
		"frequency": `MONTHLY`,
		"effectiveFromDate": `2022-05-14T12:54:01.549Z`,
		"effectiveToDate": `2022-07-14T12:54:01.549Z`
	},
	"totalPremium": 95.5,
	"arrearDetails": {
		"outstandingAmount": 94,
		"monthsOutstanding": 2,
		"arrears": [
			{
				"amount": 47,
				"dueDate": `2022-06-14T12:54:01.549Z`,
				"objectID": ``
			}
		]
	},
	"cancellationDetails": {
		"recordedCancellationDate": `2022-05-14T12:54:01.549Z`,
		"effectiveCancellationDate": `2022-06-14T12:54:01.549Z`,
		"reason": `string`
	},
	"paymentSchedule": {
		"previousArrearsPaymentDate": `2022-07-14T12:54:01.549Z`,
		"previousArrearsPaymentAmount": 47,
		"previousPaymentDate": `2022-07-14T12:54:01.549Z`,
		"previousPaymentAmount": 0,
		"nextPaymentDate": `2022-08-14T12:54:01.549Z`,
		"nextPaymentAmount": 47
	},
	"benefits": [
		{
			"type": `NewBorn`,
			"available": true,
			"availableDate": `2022-07-14T12:54:01.549Z`
		}
	],
	"mandates": [
		{
			"accountName": `string`,
			"branchCode": `string`,
			"accountNumber": `string`,
			"bank": `string`,
			"accountType": `Bond`,
			"mandateType": `EFT`,
			"initialInstalmentAmount": 0,
			"firstCollectionDate": `2022-07-14T12:54:01.549Z`,
			"numberOfDebitInstalments": 0,
			"statusReason": `string`,
			"mandateStatus": `Inactive`,
			"mandateInitiationDate": `2022-07-14T12:54:01.549Z`,
			"mandateID": 0,
			"lastCollectionDate": `2022-07-14T12:54:01.549Z`,
			"instalmentAmount": 0,
			"contractReference": `string`,
			"collectionDay": 0,
			"cifNumber": 0,
			"idNumber": `string`,
			"instalmentOccurrence": `OOFF`,
			"messageAuthenticationCode": `string`,
			"authRequired": true,
			"mandateReferenceNumber": `string`,
			"contactNumber": `string`,
			"voiceRecordingNumber": `string`,
			"mandateRequestTransactionIdentifier": `string`
		}
	],
	"claims": [
		{
			"roleplayer": {
				"title": `Mr`,
				"surname": `string`,
				"firstName": `string`,
				"middleName": `string`,
				"idNumber": `string`,
				"lifeAssured": true,
				"beneficiary": true,
				"benefitPayout": 0,
				"contactDetails": {
					"cellphone": `string`,
					"homephone": `string`,
					"workphone": `string`,
					"email": `string`
				},
				"gender": `Male`,
				"dateOfBirth": `2022-07-14T12:54:01.550Z`,
				"recordID": `string`,
				"cifNumber": 0,
				"relationship": `MainLife`,
				"coverAmount": 0,
				"premium": 0,
				"coverStartDate": `2022-07-14T12:54:01.550Z`,
				"premiumStartDate": `2022-07-14T12:54:01.550Z`,
				"idType": `RSAID`,
				"rowID": 0
			},
			"claimsReference": `string`,
			"claimSettlementAmount": 0,
			"taskReference": `string`,
			"claimIntimationDate": `2022-07-14T12:54:01.550Z`,
			"claimReceivedOnDate": `2022-07-14T12:54:01.550Z`,
			"claimIncidentDate": `2022-07-14T12:54:01.550Z`,
			"claimStatus": `string`,
			"clientClaimStatus": `string`,
			"claimType": `Other`,
			"subClaimType": `string`,
			"causeOfIncident": `string`,
			"documentsRequired": [
				{
					"documentCode": `string`,
					"documentName": `string`,
					"guid": `string`,
					"isMandatory": true,
					"docStatus": `Pending`
				}
			],
			"documentsReceived": [
				{
					"documentCode": `string`,
					"documentName": `string`,
					"guid": `string`,
					"isMandatory": true,
					"docStatus": `Pending`
				}
			],
			"paymentTransaction": [
				{
					"date": `string`,
					"amount": 0,
					"bankDetails": [
						{
							"accountName": `string`,
							"branchCode": `string`,
							"accountNumber": `string`,
							"bank": `string`,
							"accountType": `Bond`
						}
					],
					"beneficiary": {
						"title": `Mr`,
						"surname": `string`,
						"firstName": `string`,
						"middleName": `string`,
						"idNumber": `string`,
						"lifeAssured": true,
						"beneficiary": true,
						"benefitPayout": 0,
						"contactDetails": {
							"cellphone": `string`,
							"homephone": `string`,
							"workphone": `string`,
							"email": `string`
						},
						"gender": `Male`,
						"dateOfBirth": `2022-07-14T12:54:01.550Z`,
						"recordID": `string`,
						"cifNumber": 0,
						"relationship": `MainLife`,
						"coverAmount": 0,
						"premium": 0,
						"coverStartDate": `2022-07-14T12:54:01.550Z`,
						"premiumStartDate": `2022-07-14T12:54:01.550Z`,
						"idType": `RSAID`,
						"rowID": 0
					},
					"payStatus": `Authorised`
				}
			],
			"incidentNumber": `string`,
			"lastComment": `string`,
			"repudiationDate": `2022-07-14T12:54:01.550Z`,
			"repudiationReason": `string`
		}
	],
	"policyRule": `Standard`,
	"policyMinumumPremium": 26,
	"canReinstate": true,
	"roleplayers": [
		{
			"title": `Mr`,
			"surname": `Smith`,
			"firstName": `John`,
			"middleName": `string`,
			"idNumber": `8409010086085`,
			"lifeAssured": true,
			"beneficiary": false,
			"benefitPayout": 0,
			"contactDetails": {
				"cellphone": `061 587 5465`,
				"homephone": `string`,
				"workphone": `string`,
				"email": `abc@gmail.com`
			},
			"gender": `Male`,
			"dateOfBirth": `1992-07-14T12:54:01.550Z`,
			"recordID": `string`,
			"cifNumber": 264705092,
			"relationship": `MainLife`,
			"coverAmount": 10000.0,
			"premium": 7.0,
			"coverStartDate": `2018-05-28T00:00:00+00:00`,
			"premiumStartDate": `2018-05-28T00:00:00+00:00`,
			"idType": `CLNTCODE`,
			"rowID": 0
		}
	]
};