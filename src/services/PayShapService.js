import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

/**
 * Channel Service methods for Pay Shap related functionality
 *
 * @export
 * @class PayShapService
 * @extends {ChannelServiceBase}
 */
 export class PayShapService extends ChannelServiceBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor(toggleBusyFunc, defaultErrorHandlerFunc = null) {
		super(
			toggleBusyFunc, 
			defaultErrorHandlerFunc, 
			`serviceURIs.payShapServiceUrl`, 
			`PayShapChannelService`, 
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

	async getDetails(payShapDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`payShapDetails`)) {
			return this.mock(`payShapDetails`);
		}

		const url = `/payshap/details`;

		return this.post(
			url,
			payShapDetails,
			this.setToken(),
			`payShapDetails`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async getInstitutions(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		if (await this.isMockEnabled(`getInstitutions`)) {
			return this.mock(`getInstitutions`);
		}

		const url = `/payshap/institutions`;

		return this.get(
			url,
			this.setToken(),
			`getInstitutions`,
			false,

			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async enlistCapitec(verifiedTelephoneNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`enlistCapitec`)) {
			return this.mock(`enlistCapitec`);
		}
		const url = `/payshap/enlist-default`;

		return this.post(
			url,
			{
				"verifiedCellphoneNumber": verifiedTelephoneNumber
			},
			this.setToken(),
			`enlistCapitecDefault`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async delistCapitec(verifiedTelephoneNumber, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		await HorizonIncidentManager.getInstance().createAndClassifySubIncident(this._toggleBusyFlag);

		if (await this.isMockEnabled(`delistCapitec`)) {
			return this.mock(`delistCapitec`);
		}

		const url = `/payshap/delist-default`;

		return this.post(
			url,
			{
				"verifiedCellphoneNumber": verifiedTelephoneNumber
			},
			this.setToken(),
			`delistCapitecDefault`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async moneyIn(moneyInDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`moneyIn`)) {
			return this.mock(`moneyIn`);
		}

		const url = `/payshap/money-in`;

		return this.post(
			url,
			moneyInDetails,
			this.setToken(),
			`moneyIn`,
			null,
			null,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	async moneyOut(moneyOutDetails, errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {

		if (await this.isMockEnabled(`moneyOut`)) {
			return this.mock(`moneyOut`);
		}

		const url = `/payshap/money-out`;

		return this.post(
			url,
			moneyOutDetails,
			this.setToken(),
			`moneyIn`,
			null,
			null,
			null,
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