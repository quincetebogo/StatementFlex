import { InsureService } from 'app/services/InsureService';
import { ViewBase } from 'app/views/common/ViewBase';

/**
 * A Base class for view components to collect common functionality used within Insure product
 *
 * @export
 * @class InsureViewBase
 * @extends {ViewBase}
 */
export class InsureViewBase extends ViewBase {

	// #region  INITIALISATION

	constructor() {
		super();
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
	}

	// #endregions

	// #region  INITIALISATION

	/**
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {boolean} isBusy Toggle for busy indicator
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			productParams: { type: Object, state: true }
		};
	}

	// endregion

	// #region  LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * Fetch caller information
	 * Fetch insure product parameters
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.productParams = await this._retrieveInsureProductParams();
	}

	/**
	 * Unload the component once removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// #region PRIVATE METHODS

	/**
	 * Retrieve Insure Product Params from Channel Service
	 * @returns {Object} Product Params Array
	 */
	async _retrieveInsureProductParams() {
		const resp = await this.insureService.productParams();
		if (!resp.succeeded) {
			return;
		}
		return resp.result;
	}

	/**
	 * Error callback for channel services
	 * @param {Object} ex Error from Channel Service 
	 * @returns {Boolean} boolean
	 */
	_handleChannelServiceError(ex) {
		this.errorMessage = `System error. Please try again.`;
		this.horizonRouter.navigateToSystemError();
		return true;
	}

	// #endregion
}