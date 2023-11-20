import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { RoleManager } from '../../shell/RoleManager';
import 'app/components/product/CnetProductInfo';
import 'app/components/product/CnetProductInfo';
import 'app/views/capitecConnect/Teamleader/CapitecConnectTeamLead'
import 'app/views/capitecConnect/Agent/CapitecConnectAgent'

/**
 * This page allows an agent to view Insure Product information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 *
 * @export
 * @class InsureProduct
 * @extends {View}
 */
export class CapitecConnectProduct extends ProductPageBase {
	constructor() {
		super();
	}

	_webTemplate() {
		var state = HorizonStore.getInstance().recoverState();
		var _roleManager = RoleManager.getInstance();

		if (state && state.callerInformation && state.callerInformation.verificationStatus && _roleManager.isCapitecConnectAgent) {
			return html`
				<div>
					<horizon-capitec-connect-agent></horizon-capitec-connect-agent>
				</div>`;
		} else if (_roleManager.isCapitecConnectTeamleader) {
			return html`
				<div>
					<horizon-capitec-connect-teamleader></horizon-capitec-connect-teamleader>
				</div>
				`;
		} else {
			return html`
			<horizon-cnet-product-info 
				data-automation-id="capitec-connect-product"
				viewType="capitecConnect" 
				viewHeader="Capitec Connect"
				@view-benefits="${() => this._viewBenefits(`connect`)}">
			</horizon-cnet-product-info>`;
		}
	}
}

customElements.define(`horizon-capitec-connect-product`, CapitecConnectProduct);
