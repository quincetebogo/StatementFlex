import { ChannelServiceBase, DEFAULT_AUTO_RETRIES } from 'app/services/ChannelServiceBase';
// import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';

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
			`serviceURIs.sendCashServiceUrl`, 
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

		// TODO: Update URL once CS is deployed.
		const url = ``;

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

	getInstitutions(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
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

	enlistCapitec(enlisterrorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = ``;

		return this.post(
			url,
			this.setToken(),
			`enlistCapitecDefault`,
			false,
			null,
			null,
			errorHandler,
			autoRetries
		);
	}

	delistCapitec(errorHandler = null, autoRetries = DEFAULT_AUTO_RETRIES) {
		const url = ``;

		return this.post(
			url,
			this.setToken(),
			`delistCapitecDefault`,
			false,
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