
export const stopCardMockResponse = {
	instruction: ``,
	cards: [
		{
			cardNumber: `4000000000000060`,
			maskedCardNumber: `4000********0060`,
			cardDisplayName: `Cheque Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `10`,
			cardSequenceNumber: `02`,
			supplementaryCard: false,
			cardStopDate: `2023-02-06 04:20:11.767+0000`,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		},
		{
			cardNumber: `4000000000000061`,
			maskedCardNumber: `4000********0061`,
			cardDisplayName: `Cheque Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `10`,
			cardSequenceNumber: `02`,
			supplementaryCard: true,
			cardStopDate: `2023-03-06 04:11:11.767+0000`,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		},
		{
			cardNumber: `4000000000000063`,
			maskedCardNumber: `4000********0063`,
			cardDisplayName: `Cheque Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `10`,
			cardSequenceNumber: `02`,
			supplementaryCard: true,
			cardStopDate: `2023-04-06 04:11:11.767+0000`,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		},
		{
			cardNumber: `4000000000000064`,
			maskedCardNumber: `4000********0064`,
			cardDisplayName: `Cheque Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `10`,
			cardSequenceNumber: `02`,
			supplementaryCard: true,
			cardStopDate: `2023-04-06 04:50:11.767+0000`,
			stopCard: {
				enabled: true,
				tabIndex: 0,
				visible: true
			}
		},
		{
			cardNumber: `4000080000000065`,
			maskedCardNumber: `4000********0065`,
			cardDisplayName: `Credit Card`,
			cardStopReason: `LOST`,
			cardExpiryYear: `2020`,
			cardExpiryMonth: `08`,
			cardSequenceNumber: `03`,
			supplementaryCard: false,
			cardStopDate: `2023-05-06 04:11:11.767+0000`,
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