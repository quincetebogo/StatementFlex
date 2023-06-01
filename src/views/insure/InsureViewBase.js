import { HorizonInsureStore } from 'app/store/HorizonInsureStore';
import { InsureService } from 'app/services/InsureService';
import { ViewBase } from 'app/views/common/ViewBase';

const ERROR_TOAST_DELAY = 10000;

/**
 * A Base class for view components to collect common functionality used within Insure product
 *
 * @export
 * @class InsureViewBase
 * @extends {ViewBase}
 */
export class InsureViewBase extends ViewBase {

	// #region INITIALISATION

	constructor() {
		super();
		this.insureService = new InsureService(() => this._toggleBusyFlag(), (ex) => this._handleChannelServiceError(ex));
		this.horizonInsureStore = HorizonInsureStore.getInstance();
	}

	// #endregions INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Object} productParams Data & flags for insure product parameters
	 * @property {boolean} showInsureErrorToast Toggle for error toast
	 * 
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			productParams: { type: Object, state: true },
			showInsureErrorToast: { type: Boolean, state: true }
		};
	}

	// #endregion PROPERTIES

	// #region LIFECYCLE OVERRIDES

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
	 * Clears CFP value from state
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
		this.horizonInsureStore.setCFPStatus(false);
	}

	// #endregion LIFECYCLE OVERRIDES

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
		return true;
	}

	/**
	 * Pop toast with channel services error
	 * Clear toast after delay has passed
	 * @param {object} exception Exception thrown by channel service
	 * @returns {void}
	 */
	handleToastError(exception) {
		this.insureErrorToastMessage = exception.output[0].ErrorMessage;
		this.showInsureErrorToast = true;
		window.setTimeout(() => this._hideToastDisplay(), ERROR_TOAST_DELAY);
	}

	/**
	 * Reset error toast after delay
	 * @returns {void}
	 */
	_hideToastDisplay() {
		this.showInsureErrorToast = false;
		this.insureErrorToastMessage = ``;
	}

	// #endregion PRIVATE METHODS
}