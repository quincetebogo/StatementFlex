import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';

/**
 * Channel Service Methods for Client insights micro-service
 *
 * @export
 * @class ClientInsightsService
 * @extends {ClientInsightsService}
 */
export class ClientInsightsService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc,
			defaultErrorHandlerFunc,
			`serviceURIs.clientInsightsUrl`,
			`ClientInsightsChannelService`,
			`v1`,
			() => import(`../mocks/HorizonChannelServiceMocks.js`)
		);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * @callback errorHandlerCallback
	 * @param {object} exception - The exception from the failing service call
	 */

	/**
	 * @typedef {Object} ReturnValue
	 * @property {boolean} succeeded - Indicates if the service call succeeded
	 * @property {object} result - The result of the service call if succeeded is true
	 */

	/**
	 * Retrives insights available for a client with given CIF number
	 *
	 * @param {String} cifNumber The client's CIF number
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} [autoRetries] Number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object with client insights and the result of the channel service call
	 */

	async getClientInsights(cifNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`getClientInsights`)) {
			return this.mock(`getClientInsights`);
		}

		return this.post(
			`/clientcare-insights-${this._version}/insights`,
			{
				cifNumber: cifNumber
			},
			this.setToken(),
			`getClientInsights`, 
			false,
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

	
	/**
	 * Sends chose insights action
	 *
	 * @param {String} replyReference chose reply for provided Insights
	 * @param {errorHandlerCallback} errorHandler An optional error handler
	 * @param {Number} [autoRetries] Number of times the call should be retried if it fails
	 * @returns {Promise<ReturnValue>} An object with the result of the channel service call
	 */

	sendInsightsAction(replyReference, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		return this.post(
			`/clientcare-insights-${this._version}/insights/action`,
			{
				replyReference: replyReference
			},
			this.setToken(),
			`sendInsightsAction`, 
			false,
			null, 
			1000,
			null,
			errorHandler,
			autoRetries
		);
	}

}