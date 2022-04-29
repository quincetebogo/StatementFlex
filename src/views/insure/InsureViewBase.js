import { ViewBase } from 'app/views/common/ViewBase';
import { InsureService } from 'app/services/InsureService';

/**
 * A Base class for view components to collect common functionality used within Insure product
 * 
 * This base class will contain the following common code
 * 
 *    - getting insure product parameters
 *
 * @export
 * @class InsureViewBase
 * @extends {ViewBase}
 */
export class InsureViewBase extends ViewBase {

	//#region  INITIALISATION

	constructor() {
		super();
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
	}

	//#endregions

	//#region  INITIALISATION

	/**
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {boolean} isBusy Toggle for busy indicator
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			productParams: { type: Object, state: true },
		};
	}

	//endregion

	//#region  LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * Fetch caller information
	 * Fetch insure product parameters
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.productParams = await this.retrieveInsureProductParams();
	}

	/**
	 * Unload the component once removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//#region PRIVATE METHODS

	/**
	 * API: Retrieve Insure Product Params from Channel Service
	 * @returns {Object} Product Params Array
	 */
	async retrieveInsureProductParams() {
		const resp = await this.insureService.productParams();
		return resp.result;
	}

	/**
	 * Error callback for channel services
	 * @param {Object} ex Error from Channel Service 
	 * @returns 
	 */
	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.errorCount++;

		if (this.errorCount > 2) {
			// Generic error
			this.horizonRouter.navigateToSystemError();
		}
		return true;
	}

	//#endregion
}