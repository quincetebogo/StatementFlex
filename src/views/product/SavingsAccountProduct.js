import { View, css, html } from 'platform/elements';
// import 'app/components/product/SavingsAccountproductDetails';
import 'app/components/product/CnetProductInfo';

/**
 * This page allows an agent to view Savings Account information while waiting for an incoming call
 * The page is temporarily directed top opening product information on CNET
 *
 * @export
 * @class SavingsAccountProduct
 * @extends {View}
 */
export class SavingsAccountProduct extends View {

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

	// --------------
	// EVENT HANDLERS
	// --------------

	_viewBenefits() {
		window.open(`https://www.capitecbank.co.za/global-one/transact/`);
	}

	// ---------
	// RENDERING
	// ---------

	/*
	static get styles() {
		return [
			super.styles,
			css`
				.savings-details{
					width:100%;
					height:100%;
			}`
		];
	}
	*/

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon-cnet-product-info 
				viewType="transact" 
				viewHeader="Savings Account"
				@view-benefits="${() => this._viewBenefits()}">
			</horizon-cnet-product-info>`;
		// return html`<horizon-savings-account-product-details class="savings-details"></horizon-savings-account-product-details>`;
	}
}

customElements.define(`horizon-savings-account-product`, SavingsAccountProduct);