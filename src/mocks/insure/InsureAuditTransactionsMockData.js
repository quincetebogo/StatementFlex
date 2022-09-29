/**
 * Audit Transaction History mock response
 *
 * @export
 * @constant AuditTransactionHistory
 */
 export const AuditTransactionHistory = [
	{
		"contractReference": `FP123456`,
		"transactions": [
			{
				"changeActionedDate": `2022-09-01T12:16:05.229Z`,
				"activityType": `Premium Change`,
				"effectiveDate": `2022-09-25T12:16:05.229Z`,
				"reason": `Decrease Cover`,
				"additionalDetails": {
				  "requestedDate": `2022-09-01T12:16:05.229Z`,
				  "previousPremium": `100`,
				  "effectiveDate": `2022-09-25T12:16:05.229Z`,
				  "currentPremium": `80`,
				  "actionedBy": `Client: John Dough`,
				  "channelAppliedOn": `Mobile Application`
				}
			},
			{
				"changeActionedDate": `2022-08-02T12:16:05.229Z`,
				"activityType": `Waiver Changes`,
				"effectiveDate": `2022-08-02T12:16:05.229Z`,
				"reason": `New Born`,
				"additionalDetails": {
				  "requestedDate": `2022-08-02T12:16:05.229Z`,
				  "benefitWaiverType": `New Born`,
				  "effectiveDate": `2022-08-02T12:16:05.229Z`,
				  "endDate": `2022-10-02T12:16:05.229Z`,
				  "status": `Active`,
				  "actionedBy": `Consultant: Arthur Lang`,
				  "channelAppliedOn": `NBS: Stellenbosch Branch`
				}
			},
			{
				"changeActionedDate": `2022-07-01T12:16:05.229Z`,
				"activityType": `Bank Details Changes`,
				"effectiveDate": `2022-07-25T12:16:05.229Z`,
				"reason": `Mandate Change`,
				"additionalDetails": {
				  "requestedDate": `2022-07-01T12:16:05.229Z`,
				  "effectiveDate": `2022-08-02T12:16:05.229Z`,
				  "accountName": `John Doe`,
				  "accountNumber": `123456789`,
				  "accountType": `Cheque`,
				  "bank": `Capitec Bank`,
				  "branchCode": `470010`,
				  "collectionDay": `25`,
				  "actionedBy": `Consultant: Arthur Lang`,
				  "channelAppliedOn": `NBS: Stellenbosch Branch`
				}
			},
			{
				"changeActionedDate": `2022-06-04T12:16:05.229Z`,
				"activityType": `Lives Assured Changes`,
				"effectiveDate": `2022-06-04T12:16:05.229Z`,
				"reason": `Add Lives Assured`,
				"additionalDetails": {
				  "requestedDate": `2022-06-04T12:16:05.229Z`,
				  "fullName": `Jane Doe`,
				  "effectiveDate": `2022-06-04T12:16:05.229Z`,
				  "relationship": `Added`,
				  "premium": ``,
				  "coverAmount": `40000`,
				  "actionedBy": `Agent: Martha Max`,
				  "channelAppliedOn": `Horizon`
				}
			},
			{
				"changeActionedDate": `2022-06-05T12:16:05.229Z`,
				"activityType": `Beneficiary Changes`,
				"effectiveDate": `2022-06-05T12:16:05.229Z`,
				"reason": `Delete Beneficiary`,
				"additionalDetails": {
				  "requestedDate": `2022-06-05T12:16:05.229Z`,
				  "fullName": `Arthur Doe`,
				  "effectiveDate": `2022-06-05T12:16:05.229Z`,
				  "relationship": `Deleted`,
				  "contactNumber": `021 1234567`,
				  "email": `arthur.doe@something.com`,
				  "benefitPayout": `20000`,
				  "actionedBy": `Client: John Dough`,
				  "channelAppliedOn": `Mobile Application`
				}
			},
			{
				"changeActionedDate": `2022-06-06T12:16:05.229Z`,
				"activityType": `Policy Status Changes`,
				"effectiveDate": `2022-06-06T12:16:05.229Z`,
				"reason": `New Born Waiver expired`,
				"additionalDetails": {
				  "requestedDate": `2022-06-06T12:16:05.229Z`,
				  "previousStatus": `Active (New Born Waiver)`,
				  "effectiveDate": `2022-06-06T12:16:05.229Z`,
				  "currentStatus": `Active/In Force`,
				  "actionedBy": `John Dough`,
				  "channelAppliedOn": `Mobile Application`
				}
			},
			{
				"changeActionedDate": `2022-06-10T12:16:05.229Z`,
				"activityType": `Claims Lodges Changes`,
				"effectiveDate": `2022-06-10T12:16:05.229Z`,
				"reason": `Claim Status Changed`,
				"additionalDetails": {
				  "requestedDate": `2022-06-10T12:16:05.229Z`,
				  "caseNumber": `1234567`,
				  "effectiveDate": `2022-06-10T12:16:05.229Z`,
				  "claimStatus": `Active`,
				  "actionedBy": `John Dough`,
				  "channelAppliedOn": `Horizon`
				}
			}
		]
	}
];