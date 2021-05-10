// accept-call mock for the positive case. Response fields that are null must be completed by the
// function/method that calls the mock

export const acceptCallSuccess = {
	"incidentReferenceNumber": null,
	"ivrOptionCode": null,
	"incomingTelephoneNumber": null,
	"agentTelephoneNumber": null,
	"callerInformation": {
		"name": `Joe Bloggs`,
		"southAfricanIDNumber": `7612073182086`,
		"verifiedTelephoneNumber": `0811212121`,
		"livesIn": `Somerset West`,
		"languagePreference": `English`,
		"birthdate": `1967-12-07T20:26:46.894Z`,
		"cifNumber": `103769250`,
		"profilePhoto": null
	}
};