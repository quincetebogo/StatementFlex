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
	 * @param {string} title Client's title
	 * @param {string} southAfricanIDNumber The client's South African ID number
	 * @param {string} verifiedTelephoneNumber The client's verified number (not necessarily the incoming number)
	 * @param {string} nonClientFirstName A third-party/non-client's first name
	 * @param {string} nonClientSurName A third-party/non-client's surname
	 * @param {string} nonClientFullName A third-party/non-client's full name
	 * @param {string} nonClientCellPhone The third-party/non-client's cell phone number
	 * @param {string} nonClientIDNumber  The third-party/non-client's South African ID number
	 * @param {string} nonClientRelationship The relationship between the third-party/non-client and the client
	 * @param {boolean} isConfirmed Indicates if the agent has confirmed that the details of the incoming caller are correct
	 * @param {"verified"|"unverified"|"3rdparty"|"non-client"|"failed"} verificationStatus  Indicates the verification status of the incoming caller
	 * @param {boolean} verificationToastDisplayed If false display the verification toast on landing pages
	 * @param {boolean} is3rdParty  Indicates if the incoming caller is a third-party calling in about a Capitec client
	 * @param {boolean} isNonClient Indicates if the incoming callers is not a client
	 * @param {boolean} [hasInsuranceProducts=false] Indicates if the incoming caller has insurance products
	 * @param {boolean} [hasDigitalChannels=false] Indicates if the incoming caller has digital channels (APP/USSD) 
	 * @param {Object} [verificationAttempts={ itaAttempts: 0, sqAttempts: 0 }] The number if SQ/ITA verification attempts for this client
	 * @param {boolean} [isBranchConsultant=false] if the caller is a branch consultant or not
	 * @param {boolean} [isClientPresent=false] if the client is present in branch when a consultant is phoning on their behalf
	 * @param {"unverified"|"SQ"|"ITA"} [verificationMethod="unverified"] Indicates the method used to verify the client
	 * @param {string} [firstName=""] the client's first name
	 * @param {string} [middleName1=""] The client's second name
	 * @param {string} [middleName2=""] The client's third name
	 * @param {string} [middleName3=""] the client's fourth name
	 * @param {string} [lastName=""] the client's surname/last name
	 * @param {string} [initials=""] Client's initials
	 * @param {string} [identifiedBy=""] Identification method used to confirm client
	 * @param {string} [emailId=""] Client's email id
	 */
	constructor(
		cifNumber,
		birthdate,
		languagePreference,
		livesIn,
		name,
		title,
		southAfricanIDNumber,
		verifiedTelephoneNumber,
		nonClientFirstName,
		nonClientSurName,
		nonClientFullName,
		nonClientCellPhone,
		nonClientIDNumber,
		nonClientRelationship,
		isConfirmed,
		verificationStatus,
		verificationToastDisplayed,
		is3rdParty,
		isNonClient,
		hasInsuranceProducts = false,
		hasDigitalChannels = false,
		verificationAttempts = { itaAttempts: 0, sqAttempts: 0 },
		isBranchConsultant = false,
		isClientPresent = false,
		verificationMethod = `unverified`,
		firstName = ``,
		middleName1 = ``,
		middleName2 = ``,
		middleName3 = ``,
		lastName = ``,
		initials = ``,
		identifiedBy = ``,
		emailId = ``
	) {
		this.cifNumber = cifNumber;
		this.birthdate = birthdate;
		this.languagePreference = languagePreference;
		this.livesIn = livesIn;
		this.name = name;
		this.title = title;
		this.southAfricanIDNumber = southAfricanIDNumber;
		this.verifiedTelephoneNumber = verifiedTelephoneNumber;
		this.nonClientFirstName = nonClientFirstName;
		this.nonClientSurName = nonClientSurName;
		this.nonClientFullName = nonClientFullName;
		this.nonClientCellPhone = nonClientCellPhone;
		this.nonClientIDNumber = nonClientIDNumber;
		this.nonClientRelationship = nonClientRelationship;
		this.isConfirmed = isConfirmed;
		this.verificationStatus = verificationStatus;
		this.verificationToastDisplayed = verificationToastDisplayed;
		this.is3rdParty = is3rdParty;
		this.isNonClient = isNonClient;
		this.hasInsuranceProducts = hasInsuranceProducts;
		this.hasDigitalChannels = hasDigitalChannels;
		this.verificationAttempts = verificationAttempts;
		this.isBranchConsultant = isBranchConsultant;
		this.isClientPresent = isClientPresent;
		this.verificationMethod = verificationMethod;
		this.firstName = firstName;
		this.middleName1 = middleName1;
		this.middleName2 = middleName2;
		this.middleName3 = middleName3;
		this.lastName = lastName;
		this.initials = initials;
		this.identifiedBy = identifiedBy;
		this.emailId = emailId;
		Object.seal();
	}
}