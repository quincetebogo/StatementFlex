import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 */
export class ITAChannelService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`signalRUrl`, 
			`HorizonITAChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// --------------
	// PUBLIC METHODS
	// --------------

	itaVerification(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = `/clientcare/call/${this._version}/ita-verification?CifNumber=${request.cifNumber}&ConnectionId=${request.connectionID}`;
		return this.get(
			url, 
			this.setToken(), 
			`itaVerification`,
			false,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async digitalVerificationChannelsAvailable(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`digitalVerificationChannelsAvailable`)) {
			if (Object.prototype.hasOwnProperty.call(this._mocking.digitalVerificationChannelsAvailable, `positiveCase`)) {
				return {
					succeeded: true,
					result: this._mocking.digitalVerificationChannelsAvailable.positiveCase
				};
			}
			return {
				succeeded: false,
				result: this._mocking.digitalVerificationChannelsAvailable.positiveCase
			};
		}

		const url = `/clientcare-call-${this._version}/has-digital-verification-capability`; 
		
		return this.post(
			url,
			{
				"cif": cifNumber
			},
			this.setToken(),
			`digitalVerificationChannelsAvailable`,
			false,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Verifies collected answers for security questions against KBA
	 * 
	 * @param {string} cifNumber Client's cif number
	 * @param {string} identificationType Identification type used to identify client
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} autoRetries Number of times to retry on failure
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	 async loadKBA(cifNumber, identificationType, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`loadKBA`)) {
			return this.mock(`loadKBA`, identificationType);
		}

		const url = `/clientcare-call-${this._version}/verify/kba-questions`;
		return this.post(
			url,
			{
				"cifNumber": cifNumber,
				"identificationType": identificationType
			},
			this.setToken(),
			`endCall`,
			false,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	/**
	 *  Verifies collected answers for security questions against KBA
	 * 
	 * @param {*} request An object containing the responses/answers to the asked security questoins
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} autoRetries Number of times to retry on failure
	 * @returns {Promise<ReturnValue>} An object indicating if the verification process was successful or if not, the reason for failure
	 */
	 async verifyKBA(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`verifyKBA`)) {
			return this.mock(`verifyKBA`, request);
		}

		const url = `/clientcare-call-${this._version}/verify/kba-answer`;
		return this.post(
			url,
			request,
			this.setToken(),
			`endCall`,
			false,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}