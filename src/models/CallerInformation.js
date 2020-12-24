/**
 * The Caller Information model
 * 
 * @module models/CallerInformation
 */


/**
 * CallerInformation records the details of the incoming caller/client. This object
 * is preserved in state for the duration of a call.
 */
export class CallerInformation {

	/**
	 * Creates an instance of CallerInformation.
	 * 
	 * @param {string} cifNumber - The client's CIF number
	 * @param {string} birthdate The client's birth date
	 * @param {string} languagePreference The client's language preference
	 * @param {string} livesIn An indication of where the client lives
	 * @param {string} name The client's full name
	 * @param {string} southAfricanIDNumber The client's South African ID number
	 * @param {string} verifiedTelephoneNumber The client's verified number (not necessarily the incoming number)
	 * @param {string} nonClientFullName A third-party/non-client's full name
	 * @param {string} nonClientCellPhone The third-party/non-client's cell phone number
	 * @param {string} nonClientIDNumber  The third-party/non-client's South African ID number
	 * @param {string} nonClientRelationship The relationship between the third-party/non-client and the client
	 * @param {boolean} isConfirmed Indicates if the agent has confirmed that the details of the incoming caller are correct
	 * @param {"verified"|"unverified"|"3rdparty"|"non-client"} verificationStatus  Indicates the verification status of the incoming caller
	 * @param {boolean} is3rdParty  Indicates if the incoming caller is a third-party calling in about a Capitec client
	 * @param {boolean} isNonClient Indicates if the incoming callers is not a client
	 * @param {boolean} hasInsuranceProducts Indicates if the incoming caller has insurance products
	 * @param {Object} verificationAttempts The number if XDS/ITA verification attempts for this client
	 */
	constructor(
		cifNumber,
		birthdate, 
		languagePreference, 
		livesIn, 
		name, 
		southAfricanIDNumber, 
		verifiedTelephoneNumber,
		nonClientFullName,
		nonClientCellPhone,
		nonClientIDNumber,
		nonClientRelationship,
		isConfirmed,
		verificationStatus,
		is3rdParty,
		isNonClient,
		hasInsuranceProducts,
		verificationAttempts = { itaAttempts: 0, xdsAttempts: 0 }
	) {
		this.cifNumber = cifNumber;
		this.birthdate = birthdate;
		this.languagePreference = languagePreference;
		this.livesIn = livesIn;
		this.name = name;
		this.southAfricanIDNumber = southAfricanIDNumber;
		this.verifiedTelephoneNumber = verifiedTelephoneNumber;
		this.nonClientFullName = nonClientFullName;
		this.nonClientCellPhone = nonClientCellPhone;
		this.nonClientIDNumber = nonClientIDNumber;
		this.nonClientRelationship = nonClientRelationship;
		this.isConfirmed = isConfirmed;
		this.verificationStatus = verificationStatus;
		this.is3rdParty = is3rdParty;
		this.isNonClient = isNonClient;
		this.hasInsuranceProducts = hasInsuranceProducts;
		this.verificationAttempts = verificationAttempts;

		Object.seal();
	}
}