export const stopCardMockResponse = {
	"instruction": "string",
	cards: [
		{
			cardNumber: `4000000000000062`,
			maskedCardNumber: `4*************62`,
			cardDisplayName: `Cheque Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `10`,
			cardSequenceNumber: `02`,
			supplementaryCard: false,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		},
		{
			cardNumber: `4000080000000048`,
			maskedCardNumber: `4*************48`,
			cardDisplayName: `Credit Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `08`,
			cardSequenceNumber: `03`,
			supplementaryCard: false,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		}
	],
	"incomingTelephoneNumber": "string",
	"voiceReferenceNumber": "string",
	"notificationBell": {
	  "enabled": true,
	  "tabIndex": 0,
	  "visible": true
	},
	"clientPersonalInformation": {
	  "required": true,
	  "value": {
		"name": {
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
		"southAfricanIDNumber": {
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
		"verifiedTelephoneNumber": {
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
		"livesIn": {
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
		"languagePreference": {
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
		"birthdate": {
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
		"inputRegexValidation": "string",
		"validationFailedMessage": "string"
	  },
	  "enabled": true,
	  "tabIndex": 0,
	  "visible": true
	},
	"notAuthorizedLink": {
	  "enabled": true,
	  "tabIndex": 0,
	  "visible": true
	},
	"authorized": true,
	"clientInsights": {},
	"clientAccess": {
	  "app": {
		"possibleValues": [
		  {
			"key": 0,
			"value": "string"
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
	  "ussd": {
		"possibleValues": [
		  {
			"key": 0,
			"value": "string"
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
	  "smsNotification": {
		"possibleValues": [
		  {
			"key": 0,
			"value": "string"
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
	  "cards": {
		"possibleValues": [
		  {
			"key": 0,
			"value": "string"
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
	  }
	}
  };