import { View, html, css } from 'platform/elements';

import { HorizonViewManager } from '../../../shell/HorizonViewManager';
import { HorizonRouter } from '../../../shell/HorizonRouter';
import { InitialiseService } from '../../../services/InitialiseService';
import '../../../components/common/HorizonProductTile';

export class SavingsPlanProduct extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isBusy: { type: Boolean }
		}
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		HorizonViewManager.getInstance().UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async GetLandingPageData(landingPageData) {
		try {
			landingPageData = await InitialiseService.getInstance().initialise(() => {
				this._toggleBusyFlag();
			});
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		return landingPageData;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.savingsproduct-info{
					width:100%;
					height:100%;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				.margin-wrapper{
					width:auto;
					margin: 0px 24px 0px 24px;
				}				
				horizon-product-tile{
					width : 100%;
					margin: 24px 0px 0px 0px;
				}
			`];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="savingsproduct-info">
			<capitec-title-bar type="save" label="Savings Plan"></capitec-title-bar>
				<div class="margin-wrapper">
					<horizon-product-tile type="save" 
										  label="Flexible Savings" 
										  subtitle="Earn from 5.1% interest per year on your daily balances. You have immediate access to your money."
										  navigational="true"
										  @click="${() => this.horizonRouter.navigateToFlexibleSavingsPlanProduct()}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Fixed-term Savings" 
										  subtitle="Earn up to 9.25% interest when you fix your savings plan for 6 - 60 months. You can calculate your estimated payout."
										  navigational="true"
										  @click="${() => this.horizonRouter.navigateToFixedTermSavingsProduct()}">
					</horizon-product-tile>
					<horizon-product-tile type="save" 
										  label="Tax-free Savings" 
										  subtitle="Save up to R33 000 per year for 12 - 24 months and pay no tax on your interest earned."
										  navigational="true"
										  @click="${() => this.horizonRouter.navigateToTaxFreeSavingsProduct()}">
					</horizon-product-tile>
					</div>
			</capitec-card>
			${this._renderLoadingIndicator()}
		`;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		};

		return html`<capitec-loading-indicator></capitec-loading-indicator>`;
	}
}

customElements.define(`product-savings-plan`, SavingsPlanProduct);