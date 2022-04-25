export const InsureProductParams = {
	"products": [
		{
			"parameters": {
				"policyParams": {
					"param": {
						"minAffordableAmountMessage": "string",
						"validateTotalAffordablePremiumMinCalcLimit": true,
						"totalAffordablePremiumMinCalcLimit": "string"
					}
				},
				"organisation": {
					"productCode": "string",
					"name": "string"
				},
				"rolePlayers": {
					"roleList": {
						"role": [
							{
								"ageRange": [
									{
										"maxPremiumAmount": "string",
										"minPremiumAmout": "string",
										"premiumAmountMessage": "string",
										"coverAmountMessage": "string",
										"coverAmountMinMessage": "string",
										"maxCoverAmount": "string",
										"minCoverAmount": "string",
										"maxAge": 0,
										"minAge": 0
									}
								],
								"benefitCode": "string",
								"ageMessage": "string",
								"validatePremium": true,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 0,
								"type": "string",
								"relationshipTypeEnum": "Unknown"
							}
						]
					},
					"genericFieldValidator": {
						"validation": {
							"fieldName": "string",
							"modelFieldName": "string",
							"type": "string",
							"allowedList": "string",
							"allowedValues": [
								"string"
							],
							"errorMessage": "string",
							"shouldValidate": true
						}
					}
				},
				"rulesParams": [
					{
						"ruleType": "string",
						"editAccountDetails": true,
						"addNewLives": true,
						"peopleRulesList": [
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": true,
								"editRelationship": true,
								"editLifeAssuredValues": true,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "string",
								"relationshipTypeEnum": "Unknown"
							}
						],
						"editDebitOrderDetails": true,
						"increaseCover": true,
						"ruleEnum": "Standard"
					}
				],
				"id": "string"
			},
			"type": "Capitec"
		}
	]
};