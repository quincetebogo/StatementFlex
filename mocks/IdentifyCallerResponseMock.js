let mockResponse = []
export default mockResponse = {
	cards: [
		{
			"accountNumber": "5284 **** **** 1322",
			"encryptedCardId": "5284 **** **** 1322",
			"cardType": "Debit Card",
			"cardStatus": "Active",
			"cardId": "5284 **** **** 1322",
			"stopCard": {
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			}
		},
		{
			"accountNumber": "5284 **** **** 1222",
			"encryptedCardId": "5284 **** **** 1222",
			"cardType": "Credit Card",
			"cardStatus": "Active",
			"cardId": "5284 **** **** 1222",
			"stopCard": {
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			}
		}
	],
	clientPersonalInfo: {
		"required": true,
		"value": {
			"name": {
				"required": true,
				"value": 'PP Green',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"southAfricanIDNumber": {
				"required": true,
				"value": '7807230369085',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"verifiedTelephoneNumber": {
				"required": true,
				"value": '0631152973',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"livesIn": {
				"required": true,
				"value": 'South Africa',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"languagePreference": {
				"required": true,
				"value": 'English',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"birthdate": {
				"required": true,
				"value": '01-Jan-1997',
				"inputValidationOption": {
					"validationEnabled": true,
					"inputRegexValidation": "",
					"validationFailedMessage": ""
				},
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"viewProfileButton": {
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			},
			"documentsButton": {
				"enabled": true,
				"tabIndex": 0,
				"visible": true
			}
		},
		"inputValidationOption": {
			"validationEnabled": true,
			"inputRegexValidation": "",
			"validationFailedMessage": ""
		},
		"enabled": true,
		"tabIndex": 0,
		"visible": true
	},
	notAuthorizedLink: {
		"enabled": true,
		"tabIndex": 0,
		"visible": true
	},
	authorized: true,
	clientInsights: [],
	clientAccess: {
		"App": {
			"possibleValues": [
				{
					"key": 0,
					"value": "Update cellphone number/Network"
				},
				{
					"key": 1,
					"value": "Replace/Update remote banking"
				}
			],
			"required": true,
			"value": "",
			"inputValidationOption": {
				"validationEnabled": true,
				"inputRegexValidation": "",
				"validationFailedMessage": ""
			},
			"enabled": true,
			"tabIndex": 0,
			"visible": true
		},
		"USSD": {
			"possibleValues": [
				{
					"key": 0,
					"value": "Update"
				}
			],
			"required": true,
			"value": "string",
			"inputValidationOption": {
				"validationEnabled": true,
				"inputRegexValidation": "string",
				"validationFailedMessage": "string"
			},
			"enabled": true,
			"tabIndex": 0,
			"visible": true
		},
		"SMS Notifications": {
			"possibleValues": [
				{
					"key": 0,
					"value": "Update"
				},
				{
					"key": 1,
					"value": "Cancel"
				}
			],
			"required": true,
			"value": "",
			"inputValidationOption": {
				"validationEnabled": true,
				"inputRegexValidation": "",
				"validationFailedMessage": ""
			},
			"enabled": true,
			"tabIndex": 0,
			"visible": true
		},
		"Cards": {
			"possibleValues": [
				{
					"key": 0,
					"value": "Stop Card"
				},
				{
					"key": 1,
					"value": "Card Status"
				},
				{
					"key": 2,
					"value": "Replace Card"
				},
				{
					"key": 3,
					"value": "Change PIN"
				},
				{
					"key": 4,
					"value": "Change Daily Limits"
				}
			],
			"required": true,
			"value": "",
			"inputValidationOption": {
				"validationEnabled": true,
				"inputRegexValidation": "",
				"validationFailedMessage": ""
			},
			"enabled": true,
			"tabIndex": 0,
			"visible": true
		}
	}
}