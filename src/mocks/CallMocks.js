// accept-call mock for the positive case. Response fields that are null must be completed by the
// function/method that calls the mock

export const acceptCallSuccess = {
	"incidentReferenceNumber": null,
	"ivrOptionCode": null,
	"incomingTelephoneNumber": null,
	"agentTelephoneNumber": null,
	"callerInformation": {
		"name": `Joe Bloggs`,
		"southAfricanIDNumber": `9803095871081`,
		"verifiedTelephoneNumber": `0811212121`,
		"livesIn": `Somerset West`,
		"languagePreference": `English`,
		"birthdate": `1967-12-07T20:26:46.894Z`,
		"cifNumber": `289739225`,
		"profilePhoto": null
	}
};