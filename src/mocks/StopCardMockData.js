
export const stopCardMockResponse = {
	instruction: ``,
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
	incomingTelephoneNumber: ``,
	voiceReferenceNumber: ``,
	notificationBell: {
		enabled: true,
		tabIndex: 0,
		visible: true
	},
	clientPersonalInformation: {
		required: true,
		value: {
			name: {
				required: true,
				value: `Mr A RUITERS`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			southAfricanIDNumber: {
				required: true,
				value: `7207125191084`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			verifiedTelephoneNumber: {
				required: true,
				value: null,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			livesIn: {
				required: true,
				value: `ROBERTSON`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			languagePreference: {
				required: true,
				value: `Y`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			birthdate: {
				required: true,
				value: `07/12/1972`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			cifNumber: {
				required: true,
				value: `152486852`,
				inputValidationOption: {
					validationEnabled: false,
					inputRegexValidation: ``,
					validationFailedMessage: ``
				},
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			viewProfileButton: {
				enabled: false,
				tabIndex: -1,
				visible: true
			},
			documentsButton: {
				enabled: false,
				tabIndex: -1,
				visible: true
			}
		},
		inputValidationOption: {
			validationEnabled: true,
			inputRegexValidation: ``,
			validationFailedMessage: ``
		},
		enabled: false,
		tabIndex: -1,
		visible: true
	},
	notAuthorizedLink: {
		enabled: true,
		tabIndex: -1,
		visible: true
	},
	authorized: true,
	clientInsights: {},
	clientAccess: {}
};