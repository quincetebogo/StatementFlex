import { Configuration, EventAggregator } from 'platform/core';
import { DesktopAgentService } from 'app/services/DesktopAgentService';
import { View } from 'platform/elements';

/**
 * A base class for the product page views. This base class subscribes to the 'search-caller` event
 * used for manually invoking the search dialog to handle a call. 
 *
 * @export
 * @class ProductPageBase
 * @extends {View}
 */
export class ProductPageBase extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._eventAggregator = EventAggregator.getInstance();

		this._desktopAgentService = DesktopAgentService.getInstance();
		this._configuration = Configuration.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.searchCallSub = this._eventAggregator.subscribe(`search-caller`, (newCallInfo) => this._createManualCall(newCallInfo));
	}

	disconnectedCallback() {
		this.searchCallSub.dispose();

		super.disconnectedCallback();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 *  Opens CNET on the appropriate product page
	 * 
	 * @param {String} viewType The CNET product page to invoke
	 * @returns {undefined}
	 * @memberof ProductPageBase
	 */
	async _viewBenefits(viewType) {
		let productUrl = '';

		if( viewType === `liveBetter`){
			productUrl = await this._configuration.getSetting(`otherSystemsURL.live-better`);
		} else {
			const globalOneUrl = await this._configuration.getSetting(`otherSystemsURL.global-one`);
			productUrl = `${globalOneUrl}${viewType}`;
		}
		
		window.open(`${productUrl}/`);
	}

	/**
	 * Manually trigger call handling. Since the call will not come via the IVR, no caller information will be 
	 * available for the created call.
	 *
	 * @returns {Promise<void>} A promise that once resolved will result in a manually created call being handled.
	 * @memberof ProductPageBase
	 */
	async _createManualCall() {
		await this._desktopAgentService.manualCreateCall();
	}
}