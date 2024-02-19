/**
 * PrepareUpdate mock response
 *
 * @export
 * @constant PrepareUpdate
 */
export const PrepareUpdate = {
	"contractReference": `FP00001631`,
	"productCode": `Capitec`,
	"commencementDate": `2022-06-29T09:26:47.167Z`,
	"status": `Active`,
	"displayStatus": `string`,
	"deductionDetails": {
		"collectionDay": 0,
		"bankDetails": {
			"accountName": `string`,
			"branchCode": `string`,
			"accountNumber": `string`,
			"bank": `string`,
			"accountType": `Bond`
		},
		"collectionMethod": `EFT`,
		"mandateReferenceNumber": `string`,
		"frequency": `MONTHLY`,
		"effectiveFromDate": `2022-06-29T09:26:47.167Z`,
		"effectiveToDate": `2022-06-29T09:26:47.167Z`
	},
	"totalPremium": 0,
	"arrearDetails": {
		"outstandingAmount": 0,
		"monthsOutstanding": 0,
		"arrears": [
			{
				"amount": 0,
				"dueDate": `2022-06-29T09:26:47.167Z`,
				"objectID": `string`
			}
		]
	},
	"cancellationDetails": {
		"recordedCancellationDate": `2022-06-29T09:26:47.167Z`,
		"effectiveCancellationDate": `2022-06-29T09:26:47.167Z`,
		"reason": `string`
	},
	"paymentSchedule": {
		"previousArrearsPaymentDate": `2022-06-29T09:26:47.167Z`,
		"previousArrearsPaymentAmount": 0,
		"previousPaymentDate": `2022-06-29T09:26:47.167Z`,
		"previousPaymentAmount": 0,
		"nextPaymentDate": `2022-06-29T09:26:47.167Z`,
		"nextPaymentAmount": 0
	},
	"benefits": [
		{
			"type": `NewBorn`,
			"available": true,
			"availableDate": `2022-06-29T09:26:47.167Z`
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
			"firstCollectionDate": `2022-06-29T09:26:47.167Z`,
			"numberOfDebitInstalments": 0,
			"statusReason": `string`,
			"mandateStatus": `Inactive`,
			"mandateInitiationDate": `2022-06-29T09:26:47.167Z`,
			"mandateID": 0,
			"lastCollectionDate": `2022-06-29T09:26:47.167Z`,
			"instalmentAmount": 0,
			"contractReference": `FP00001631`,
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
				"dateOfBirth": `2022-06-29T09:26:47.167Z`,
				"recordID": `string`,
				"cifNumber": 0,
				"relationship": `MainLife`,
				"coverAmount": 0,
				"premium": 0,
				"coverStartDate": `2022-06-29T09:26:47.167Z`,
				"premiumStartDate": `2022-06-29T09:26:47.167Z`,
				"idType": `RSAID`,
				"rowID": 0
			},
			"claimsReference": `string`,
			"claimSettlementAmount": 0,
			"taskReference": `string`,
			"claimIntimationDate": `2022-06-29T09:26:47.167Z`,
			"claimReceivedOnDate": `2022-06-29T09:26:47.167Z`,
			"claimIncidentDate": `2022-06-29T09:26:47.167Z`,
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
						"dateOfBirth": `2022-06-29T09:26:47.167Z`,
						"recordID": `string`,
						"cifNumber": 0,
						"relationship": `MainLife`,
						"coverAmount": 0,
						"premium": 0,
						"coverStartDate": `2022-06-29T09:26:47.167Z`,
						"premiumStartDate": `2022-06-29T09:26:47.167Z`,
						"idType": `RSAID`,
						"rowID": 0
					},
					"payStatus": `Authorised`
				}
			],
			"incidentNumber": `string`,
			"lastComment": `string`,
			"repudiationDate": `2022-06-29T09:26:47.167Z`,
			"repudiationReason": `string`
		}
	],
	"policyRule": `Standard`,
	"policyMinumumPremium": 0,
	"roleplayers": [
		{
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
			"dateOfBirth": `2022-06-29T09:26:47.167Z`,
			"recordID": `string`,
			"cifNumber": 0,
			"relationship": `MainLife`,
			"coverAmount": 0,
			"premium": 0,
			"coverStartDate": `2022-06-29T09:26:47.167Z`,
			"premiumStartDate": `2022-06-29T09:26:47.167Z`,
			"idType": `RSAID`,
			"rowID": 0
		}
	]
};