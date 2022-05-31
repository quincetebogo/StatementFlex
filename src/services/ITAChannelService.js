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
		const url = `/clientcare-call-${this._version}/ita-verification`;
		return this.post(
			url,
			{
				"cifNumber": request.cifNumber,
				"connectionId": request.connectionID
			},
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

		const url = `/clientcare/call/${this._version}/has-digital-verification-capability?Cif=${cifNumber}`; 
		
		return this.get(
			url,
			this.setToken(),
			`digitalVerificationChannelsAvailable`,
			false,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}
}