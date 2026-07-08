export const ProductParams = {
	"products": [
		{
			"parameters": {
				"policyParams": {
					"param": {
						"minAffordableAmountMessage": "The specified premium cannot be less than R40. Please specify a new premium.",
						"validateTotalAffordablePremiumMinCalcLimit": true,
						"totalAffordablePremiumMinCalcLimit": "40"
					}
				},
				"organisation": {
					"productCode": "Capitec",
					"name": "CapitecBank"
				},
				"rolePlayers": {
					"roleList": {
						"role": [
							{
								"ageRange": [
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"premiumAmountMessage": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} on main life assured is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the main life.",
										"maxCoverAmount": "100000",
										"minCoverAmount": "5000",
										"maxAge": 64,
										"minAge": 18
									}
								],
								"benefitCode": "FunMainRsk",
								"ageMessage": "The age for main life assured must be {0} to {1}",
								"validatePremium": true,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 1,
								"type": "MainLife",
								"relationshipTypeEnum": "MainLife"
							},
							{
								"ageRange": [
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} on a spouse/partner is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the spouse.",
										"maxCoverAmount": "100000",
										"minCoverAmount": "1000",
										"maxAge": 85,
										"minAge": 18
									}
								],
								"benefitCode": "FunSpouseRsk",
								"ageMessage": "The age for spouse/partner must be {0} to {1}",
								"validatePremium": false,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 2,
								"type": "Spouse",
								"relationshipTypeEnum": "Spouse"
							},
							{
								"ageRange": [
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} for a child up to 5 years old is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
										"maxCoverAmount": "20000",
										"minCoverAmount": "1000",
										"maxAge": 5,
										"minAge": 0
									},
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} for a child between 6 and 50 years old is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
										"maxCoverAmount": "50000",
										"minCoverAmount": "1000",
										"maxAge": 50,
										"minAge": 6
									}
								],
								"benefitCode": "FunChildRsk",
								"ageMessage": "The age for child must be {0} to {1}",
								"validatePremium": false,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 10,
								"type": "Child",
								"relationshipTypeEnum": "Child"
							},
							{
								"ageRange": [
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} on a parent is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the parent.",
										"maxCoverAmount": "50000",
										"minCoverAmount": "1000",
										"maxAge": 85,
										"minAge": 26
									}
								],
								"benefitCode": "FunParentRsk",
								"ageMessage": "The age for parents must be {0} to {1}",
								"validatePremium": false,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 5,
								"type": "Parent",
								"relationshipTypeEnum": "Parent"
							},
							{
								"ageRange": [
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} for a child up to 5 years old is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
										"maxCoverAmount": "20000",
										"minCoverAmount": "1000",
										"maxAge": 5,
										"minAge": 0
									},
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} for a child between 6 and 13 years old is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the child.",
										"maxCoverAmount": "50000",
										"minCoverAmount": "1000",
										"maxAge": 13,
										"minAge": 6
									},
									{
										"maxPremiumAmount": "",
										"minPremiumAmout": "",
										"coverAmountMessage": "Only cover up to R{0:#,##0} on an extended family member is allowed.",
										"coverAmountMinMessage": "A minimum cover amount of R{0:#,##0} is required for the extended family member.",
										"maxCoverAmount": "50000",
										"minCoverAmount": "1000",
										"maxAge": 85,
										"minAge": 14
									}
								],
								"benefitCode": "FunWiderRsk",
								"ageMessage": "The age for extended family must be {0} to {1}",
								"validatePremium": false,
								"validateCover": true,
								"validateAge": true,
								"perPolicy": 8,
								"type": "ExtendedFamily",
								"relationshipTypeEnum": "ExtendedFamily"
							}
						]
					},
					"genericFieldValidator": {
						"validation": {
							"fieldName": "Cellphone",
							"modelFieldName": "Cellphone",
							"type": "StartsWith",
							"allowedList": "60,61,62,63,64,65,66,67,71,72,73,74,76,78,79,81,82,83,84,85",
							"allowedValues": [
								"60",
								"61",
								"62",
								"63",
								"64",
								"65",
								"66",
								"67",
								"71",
								"72",
								"73",
								"74",
								"76",
								"78",
								"79",
								"81",
								"82",
								"83",
								"84",
								"85"
							],
							"errorMessage": "Cellphone number must start with {0}",
							"shouldValidate": false
						}
					}
				},
				"rulesParams": [
					{
						"ruleType": "MaternityWaiver",
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
								"editDateOfBirth": false,
								"editRelationship": true,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Unknown",
								"relationshipTypeEnum": "Unknown"
							},
							{
								"editTitle": false,
								"editGender": false,
								"editSurname": false,
								"editFirstName": false,
								"editMiddleName1": false,
								"editMiddleName2": false,
								"editIDNumber": false,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "MainLife",
								"relationshipTypeEnum": "MainLife"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Spouse",
								"relationshipTypeEnum": "Spouse"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Parent",
								"relationshipTypeEnum": "Parent"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "ExtendedFamily",
								"relationshipTypeEnum": "ExtendedFamily"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Child",
								"relationshipTypeEnum": "Child"
							}
						],
						"editDebitOrderDetails": true,
						"increaseCover": true,
						"ruleEnum": "MaternityWaiver"
					},
					{
						"ruleType": "PolicyPause",
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
								"editDateOfBirth": false,
								"editRelationship": true,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Unknown",
								"relationshipTypeEnum": "Unknown"
							},
							{
								"editTitle": false,
								"editGender": false,
								"editSurname": false,
								"editFirstName": false,
								"editMiddleName1": false,
								"editMiddleName2": false,
								"editIDNumber": false,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "MainLife",
								"relationshipTypeEnum": "MainLife"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Spouse",
								"relationshipTypeEnum": "Spouse"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Parent",
								"relationshipTypeEnum": "Parent"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "ExtendedFamily",
								"relationshipTypeEnum": "ExtendedFamily"
							},
							{
								"editTitle": true,
								"editGender": true,
								"editSurname": true,
								"editFirstName": true,
								"editMiddleName1": true,
								"editMiddleName2": true,
								"editIDNumber": true,
								"editDateOfBirth": false,
								"editRelationship": false,
								"editLifeAssuredValues": false,
								"editBeneficiaryValues": true,
								"editContactDetails": true,
								"type": "Child",
								"relationshipTypeEnum": "Child"
							}
						],
						"editDebitOrderDetails": true,
						"increaseCover": true,
						"ruleEnum": "PolicyPause"
					},
					{
						"ruleType": "Standard",
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
								"type": "Unknown",
								"relationshipTypeEnum": "Unknown"
							},
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
								"type": "MainLife",
								"relationshipTypeEnum": "MainLife"
							},
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
								"type": "Spouse",
								"relationshipTypeEnum": "Spouse"
							},
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
								"type": "Parent",
								"relationshipTypeEnum": "Parent"
							},
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
								"type": "ExtendedFamily",
								"relationshipTypeEnum": "ExtendedFamily"
							},
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
								"type": "Child",
								"relationshipTypeEnum": "Child"
							}
						],
						"editDebitOrderDetails": true,
						"increaseCover": true,
						"ruleEnum": "Standard"
					}
				],
				"id": "SBL"
			},
			"type": "Capitec"
		}
	]
};