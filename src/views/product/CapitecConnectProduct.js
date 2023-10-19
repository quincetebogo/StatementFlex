import { ProductPageBase } from 'app/views/product/ProductPageBase';
import { html } from 'platform/elements';
import 'app/components/product/CnetProductInfo';
import 'app/views/capitecConnect/Teamleader/index'
import 'app/views/capitecConnect/Agent/index'
import { RoleManager } from '../../shell/RoleManager';

/**
 * This page allows an agent to view Live Better Savings Account information while waiting for an incoming call
 *
 * @export
 * @class CapitecConnectProduct
 * @extends {View}
 */
export class CapitecConnectProduct extends ProductPageBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		// If it is a teamleader with the connect role we should display the teamleader page.
		// if(RoleManager.getInstance().isCapitecConnectTeamleader) {
		// 	return html`
		// 	<div>
		// 		<horizon-capitec-connect-teamleader></horizon-capitec-connect-teamleader>
		// 	</div>
		// 	`;
		// }

		// if(RoleManager.getInstance().isCapitecConnectAgent) {
			return html`
			<div>
				<horizon-capitec-connect-agent></horizon-capitec-connect-agent>
			</div>
			`;
		// }

		// We should display the agent role.
		return html`
			<div>
				Unauthorized
			</div>
			`;
		
	}
}

customElements.define(`horizon-capitec-connect-product`, CapitecConnectProduct);