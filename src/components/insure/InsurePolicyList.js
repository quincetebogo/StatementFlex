import { Component, css, html } from 'platform/elements';

import 'app/components/insure/InsureAccordion';
// import 'app/components/insure/InsureEmailPlanSuccess';
// import 'app/components/dialogs/InsureEmailFuneralPlan';

const POLICY_CARDS_ORDER_DEFAULT = [
	{
		label: `Update Plan`,
		type: `default`,
		route: `update-plan`,
		icon: `system/profile-action`,
		iconSize: `smaller`
	},
	{
		label: `Claims`,
		type: `default`,
		route: `claims`,
		icon: `system/documents-action`,
		iconSize: `smaller`
	},
	{
		label: `Email Plan`,
		type: `default`,
		route: `email-plan`,
		icon: `system/documents-action`,
		iconSize: `smaller`
	},
	{
		label: `Benefits`,
		type: `default`,
		route: ``,
		icon: `system/sars-action`,
		iconSize: `smaller`
	},
	{
		label: `More`,
		type: `menu`,
		icon: null,
		subMenu: [
			{
				label: `Pay Arrears`,
				icon: `system/once-off-payment-action`
			},
			{
				label: `Cancel Plan`,
				icon: `system/delete-action`
			}
		]
	}
];

const POLICY_CARDS_ORDER_ARREARS = [
	{
		label: `Pay Arrears`,
		type: `default`,
		route: ``,
		icon: `status/error`,
		iconSize: `medium`
	},
	{
		label: `Update Plan`,
		type: `default`,
		route: `update-plan`,
		icon: `system/profile-action`,
		iconSize: `smaller`
	},
	{
		label: `Claims`,
		type: `default`,
		route: `claims`,
		icon: `system/documents-action`,
		iconSize: `smaller`
	},
	{
		label: `Email Plan`,
		type: `default`,
		route: `email-plan`,
		icon: `system/mail-action`,
		iconSize: `smaller`
	},
	{
		label: `More`,
		type: `menu`,
		icon: null,
		subMenu: [
			{
				label: `Pay Arrears`,
				icon: `system/once-off-payment-action`
			},
			{
				label: `Benefits`,
				icon: `system/refresh-action`
			},
			{
				label: `Cancel Plan`,
				icon: `system/delete-action`
			}
		]
	}
];

/**
 * 
 * @class InsureLodgeClaim
 * @extends {Component}
 */
class InsurePolicyList extends Component {
	

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.showEmailDialog = false;

		/**
		 * Stubs
		 */

		 this._policies = [
			{
				policyNumber: `ABC01`,
				effectiveDate: `01 Feb 2019`,
				debitOrderDate: `25 May 2019`,
				coverAmount: 35000.50,
				totalPremium: 88.50,
				status: `Active`,
				inArrears: false
			}
		];

		// ,
		// 	{
		// 		policyNumber: `ABC02`,
		// 		effectiveDate: `01 Mar 2019`,
		// 		debitOrderDate: `28 May 2020`,
		// 		coverAmount: 38000.50,
		// 		totalPremium: 158.50,
		// 		status: `In Arrears`,
		// 		inArrears: true
		// 	}
	}

	// ---------------
	// EVENT HANDLERS
	// --------------

	_actionCardClicked(actionDetails){
		if(actionDetails.detail.route == `claims`){
			this.dispatchEvent(new CustomEvent(`viewClaims`, {}));
		}
		if(actionDetails.detail.route == `update-plan`){
			this.dispatchEvent(new CustomEvent(`updatePlan`, {}));
		}
		if(actionDetails.detail.route == `email-plan`){
			this.showEmailDialog = true;
			this.requestUpdate();
		}
	}

	_exitEmailPlanModal() {
		this.showEmailDialog = false;
		this.requestUpdate();
	}

	_sendEmailPlan() {
		// Send email here
		// If success, show view
		this.showEmailDialog = false;
		this.requestUpdate();
	}


	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_viewPlan(){
		this.dispatchEvent(new CustomEvent(`viewPlan`, {}));
	}

	_viewCalculateEstimate(){
		this.dispatchEvent(new CustomEvent(`calculateEstimate`, {}));
	}


	

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			`
		];
	}

	_webTemplate() {
		return html`
			<capitec-title-bar type="insure"
				style="margin-bottom: 0px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
				<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
				<capitec-label label="Insure" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button type="white" label="Get Estimate" @click=${(event)=>
										this._viewCalculateEstimate(event)}>
				</capitec-button>
			</capitec-title-bar>

			${this._policies.map(policyItem => html`
			<horizon-insure-accordion
				.cardOptions="${policyItem.inArrears === true ? POLICY_CARDS_ORDER_ARREARS : POLICY_CARDS_ORDER_DEFAULT}"
				.policy="${policyItem}" .inArrears="${policyItem.inArrears}" @clickedRouteCard=${(event)=>
								this._actionCardClicked(event)} @clickedViewPlan=${(event)=>
								this._viewPlan(event)} >
			</horizon-insure-accordion>`)}
		${this._renderEmailPlanModal()}`;
	}

	_renderEmailPlanModal() {
		if (this.showEmailDialog === true) {
			return html`
				<insure-email-plan-modal @confirmSend="${(e) => this._sendEmailPlan(e)}"
					@cancelSend="${(e) => this._exitEmailPlanModal(e)}"></insure-email-plan-modal>
			`;
		}
	}

	/**
	 * Render footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	 _renderExploreInsure() {
		return html`
			<div class="explore-insure-header">
				<capitec-label type="strong" label="Explore insure" style="padding-left: 8px; font-weight: bold;">
				</capitec-label>
			</div>
			<capitec-card noPadding style="border: none;">
				<div class="explore-insure-container">
					<capitec-card elevated class="action-card">
						<capitec-icon size="smaller" icon="system/info-action"></capitec-icon>
						<capitec-label type="Default" label="Product Enquiry">
						</capitec-label>
					</capitec-card>
				</div>
			</capitec-card>
		`;
	}
}

window.customElements.define(`insure-policy-list`, InsurePolicyList);