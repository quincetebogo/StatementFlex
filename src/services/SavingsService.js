import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Savings Account/Plan/Product documents
 *
 * @export
 * @class SavingsService
 * @extends {ChannelServiceBase}
 */

 export class SavingsService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.savingsPlanChannelServiceUrl`, 
			`SavingsChannelService`, 
			`v1`, 
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

	// --------------
	// PUBLIC METHODS
	// --------------

	// Get client Products

	getClientProducts(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const requestObject = {
			"cifNumber": request.cifNumber,
			"productStatus": request.status
		};
		
		const url = `/cec-save-${this._version}/savings-product/products`;

		return this.post(
			url, 
			requestObject, 
			this.setToken(), 
			`getClientProducts`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	// Fixed Term Savings Plan Unlock

	async ftspUnlockOptions(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`ftspUnlockOptions`)) {
			return this.mock(`ftspUnlockOptions`);
		}

		const url = `/cec-save-${this._version}/savings-plan/unlock-options`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`ftspUnlockOptions`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async ftspUnlockQuote(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		if (await this.isMockEnabled(`ftspUnlockQuote`)) {
			return this.mock(`ftspUnlockQuote`);
		}

		const url = `/cec-save-${this._version}/savings-plan/generate/quote`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`ftspUnlockQuote`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async ftspUnlockAgreement(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		if (await this.isMockEnabled(`ftspUnlockAgreement`)) {
			return this.mock(`ftspUnlockAgreement`);
		}
			
		const url = `/cec-save-${this._version}/savings-plan/unlock/generate/agreement`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`ftspUnlockAgreement`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	async ftspUnlock(request, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		
		if (await this.isMockEnabled(`ftspUnlock`)) {
			return this.mock(`ftspUnlock`);
		}

		const url = `/cec-save-${this._version}/savings-plan/unlock`;

		return this.post(
			url, 
			request, 
			this.setToken(), 
			`ftspUnlock`, 
			null, 
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
 }