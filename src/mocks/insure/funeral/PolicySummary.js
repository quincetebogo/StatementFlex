/**
 * PolicySummary mock response
 *
 * @export
 * @constant PolicySummary
 */
export const PolicySummary = {
	"contractReference": "FP00006737",
	"productCode": "Capitec",
	"commencementDate": "2025-12-01T02:00:00Z",
	"status": "Cancelled",
	"pasStatus": "Cancelled",
	"displayStatus": "Cancelled",
	"deductionDetails": {
		"collectionDay": 30,
		"bankDetails": {
			"accountName": "Hand",
			"branchCode": "470010",
			"accountNumber": "2476168552",
			"bank": "Capitec",
			"accountType": "Savings"
		},
		"collectionMethod": "DO",
		"frequency": "MONTHLY"
	},
	"totalPremium": 60.18,
	"arrearDetails": {
		"outstandingAmount": 0,
		"monthsOutstanding": 0
	},
	"cancellationDetails": {
		"recordedCancellationDate": "2026-04-14T02:00:00Z",
		"effectiveCancellationDate": "2026-04-14T02:00:00Z",
		"reason": "Affordability",
		"displayReason": "Affordability"
	},
	"paymentSchedule": {
		"previousPaymentDate": "2026-01-30T02:00:00Z",
		"previousPaymentAmount": 60.18,
		"nextPaymentDate": "2026-03-30T02:00:00Z",
		"nextPaymentAmount": 60.18
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
			"accountName": "Hand",
			"branchCode": "470010",
			"accountNumber": "2476168552",
			"accountType": "Bond",
			"mandateType": "Debicheck",
			"initialInstalmentAmount": 0,
			"numberOfDebitInstalments": 999999,
			"mandateStatus": "Active",
			"mandateInitiationDate": "2025-12-01T02:00:00Z",
			"mandateID": 0,
			"instalmentAmount": 60.18,
			"contractReference": "FP00006737",
			"collectionDay": 0,
			"cifNumber": 0,
			"instalmentOccurrence": "RCUR",
			"authRequired": false,
			"mandateReferenceNumber": "FP00006737"
		}
	],
	"policyRule": "Standard",
	"policyMinumumPremium": 0,
	"canReinstate": true,
	"isOptedOutForEarlyCollection": false,
	"hasInvalidRelationship": true,
	"roleplayers": [
		{
			"title": "Ms",
			"surname": "Carroll",
			"firstName": "Poppy",
			"idNumber": "7909054382085",
			"lifeAssured": true,
			"beneficiary": false,
			"contactDetails": {
				"cellphone": "0050803397",
				"homephone": "0360557319",
				"workphone": "0594201708"
			},
			"gender": "Female",
			"dateOfBirth": "1979-09-05T04:00:00Z",
			"recordID": "1B7FD81C-633F-4959-9BEE-E410177EC60C",
			"recordIDType": "PAS",
			"cifNumber": "441508960",
			"relationship": "MainLife",
			"coverAmount": 10200,
			"premium": 47.26,
			"coverStartDate": "2026-05-26T02:00:00Z",
			"premiumStartDate": "2026-07-01T02:00:00Z",
			"idType": "RSAID",
			"rowID": 0
		},
		{
			"title": "Dr",
			"surname": "Feil",
			"firstName": "Skye",
			"idNumber": "7401021761088",
			"lifeAssured": true,
			"beneficiary": false,
			"contactDetails": {
				"cellphone": "0050803397",
				"homephone": "0360557319",
				"workphone": "0594201708"
			},
			"gender": "Female",
			"dateOfBirth": "1974-01-02T04:00:00Z",
			"recordID": "D6800899-88E7-4296-AA1C-D9BDB835E94B",
			"recordIDType": "PAS",
			"relationship": "ExtendedParent",
			"coverAmount": 10000,
			"premium": 55.8,
			"coverStartDate": "2026-04-02T02:00:00Z",
			"premiumStartDate": "2026-05-01T02:00:00Z",
			"idType": "RSAID",
			"rowID": 1
		}
	]
};