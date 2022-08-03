import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service Methods for Savings Plan
 *
 * @export
 * @class SavingsPlanService
 * @extends {ChannelServiceBase}
 */

 export class SavingsPlanService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.savingsPlanChannelServiceUrl`, 
			`HorizonChannelService`, 
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

	async savingsPlanTransactionHistory(transactionHistoryRequest, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`savingsPlanTransactionHistory`)) {
			return this.mock(`savingsPlanTransactionHistory`, transactionHistoryRequest);
		}

		const request = {
			"accountNumber": transactionHistoryRequest.accountNumber,
			"startDate": transactionHistoryRequest.startDate,
			"endDate": transactionHistoryRequest.endDate,
			"startAtIndex": transactionHistoryRequest.startAtIndex,
			"maxResults": transactionHistoryRequest.maxResults,
			"moneyType": transactionHistoryRequest.moneyType
		};

		const url = `/cec-save-${this._version}/savings-plan/transactions`;

		return this.post(
			url,
			request,
			this.setToken(), 
			`transactionHistory`, 
			null, 
			null, 
			2000,
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