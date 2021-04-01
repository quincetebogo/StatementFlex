import { Component, css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'platform/components/buttons/ProductTile';
import 'app/components/common/HorizonProductTile';

const DEFAULT_SUBTITLE = {
	SAVINGS_ACCOUNT: `Know what you get, know what you pay`,
	SAVINGS_PLAN: `Let your money make money`,
	INSURE: `One plan, more cover`,
	CREDIT: `Rethink credit, realise dreams`
};

/**
 * Left hand bar menu product button panel
 *
 * @export
 * @class ProductButtonPanel
 * @extends {Component}
 */
export class ProductButtonPanel extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.disableNavigation = false;
		
		this.subtitle = {
			savingsAccount: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};

		this.detail = {
			savingsAccount: ``,
			savingsPlan: ``,
			insure: ``, 
			credit: ``
		};
		
		this._configuration = Configuration.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Boolean} disableNavigation Flag to disable navigation to client need landing pages
	 * @property {Object} subtitle Object holds the subtitle info to be shown on menu button
	 * @property {Object} detail Object holds the detail info to be shown on menu button
	 *
	 * @readonly
	 * @static
	 * @memberof ProductButtonPanel
	 */
	static get properties() {
		return {
			subtitle: { type: Object },
			detail: { type: Object },

			disableNavigation: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// TODO Refeactor these methods to raise events. The caller should handle the navigation
	_savingsAccountClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToSavingsAccountProduct();
		} else {
			this._performNavigation(`SavingsAccount`, false);
		}
	}

	_savingsPlanClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToSavingsPlanProduct();
		} else {
			this._performNavigation(`SavingsPlan`, false);
		}
	}

	_insureClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToInsureProduct();
		} else {
			// Note we will not have callerInformation when being invoked from the Agent's waiting for call landing page
			const state = this.horizonStore.recoverState();
			this._performNavigation(`Insure`, state && state.callerInformation ? state.callerInformation.hasInsuranceProducts : false);
		}
	}

	_creditClick() {
		if (!this.disableNavigation) {
			this.horizonRouter.navigateToCreditProduct();
		} else {
			this._performNavigation(`Credit`, false);
		}
	}

	_performNavigation(type, hasInsuranceProducts) {

		const state = this.horizonStore.recoverState();
		const callerInfo = state && state.callerInformation;
		
		/**
		 * Scenario 1: When a 3rd party or non-client is dialing for any need, clicking on the products buttons
		 *             should display product info coming soon screen
		 * Scenario 2: We are going production only with stop card, apart from dev / int regions product buttons
		 *             are set to do nothing
		 * TODO: Remove this environment check when product screens are ready/ when we want to map it to other needs
		 */

		// Note that when invoked from the agent's waiting for call landing page we will
		// not have caller information
		if (callerInfo && (callerInfo.is3rdParty || callerInfo.isNonClient)) {
			this.horizonRouter.navigateToProductInfo(type);
		} else {
			this.horizonRouter.navigateToLandingPage(type);
		}
	}

	// ---------
	// RENDERING
	// ---------

	// TODO: remove top margin for top most button. 
	static get styles() {
		return [
			super.styles,
			css`
			.products-card{
				padding: 0px;
				background-color: #f4f4f4;
				border: 0px;
				margin-top: 8px;
			}

            .product-button{
                padding: 0px 0px 0px 0px;
				width: 440px;
				margin-top: 16px;
			}
			.hide-tile{
				display: none;
			}
			`
		];
	}

	render() {

		// TODO: Refactor this out into the calling components
		let activePage = this.horizonRouter._getCurrentRoute(); // TODO: _getCurrentRoute() was supposed to be a private function, re-evaluate

		// Initialise activePage properly if the current route is not yet readable
		if (!activePage) {
			activePage = {
				title: ``
			};
		}

		return html`
			<horizon-product-tile 
				class="product-button"
				type="transact"
				label="Savings Account"
				subtitle="${this.subtitle.savingsAccount ? this.subtitle.savingsAccount : DEFAULT_SUBTITLE.SAVINGS_ACCOUNT}"
				detail="${this.detail.savingsAccount ? this.detail.savingsAccount : ``}"
				icon="product/transact-white"
				@click="${() => this._savingsAccountClick()}"
				?selected="${activePage.title === `SavingsAccount`}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="save"
				label="Savings Plan"
				subtitle="${this.subtitle.savingsPlan ? this.subtitle.savingsPlan : DEFAULT_SUBTITLE.SAVINGS_PLAN}"
				detail="${this.detail.savingsPlan ? this.detail.savingsPlan : ``}"
				icon="product/save-white"
				@click="${() => this._savingsPlanClick()}"
				?selected="${activePage.title === `SavingsPlan`}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="insure"
				label="Insure"
				subtitle="${this.subtitle.insure ? this.subtitle.insure : DEFAULT_SUBTITLE.INSURE}"
				detail="${this.detail.insure ? this.detail.insure : ``}"
				icon="product/insure-white"
				@click="${() => this._insureClick()}"
				?selected="${activePage.title === `Insure`}">
			</horizon-product-tile>
			<horizon-product-tile 
				class="product-button"
				type="credit"
				label="Credit"
				subtitle="${this.subtitle.credit ? this.subtitle.credit : DEFAULT_SUBTITLE.CREDIT}"
				detail="${this.detail.credit ? this.detail.credit : ``}"
				icon="product/credit-white"
				?detailIcon="${false}"
				@click="${() => this._creditClick()}"
				?selected="${activePage.title === `Credit`}">
			</horizon-product-tile>
		`;
	}
}

window.customElements.define(`horizon-product-button-panel`, ProductButtonPanel);