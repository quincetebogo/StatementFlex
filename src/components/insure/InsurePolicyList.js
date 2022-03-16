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
			// {
			// 	policyNumber: `ABC01`,
			// 	effectiveDate: `01 Feb 2019`,
			// 	debitOrderDate: `25 May 2019`,
			// 	coverAmount: 35000.50,
			// 	totalPremium: 88.50,
			// 	status: `Active`,
			// 	inArrears: false
			// }
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

		this._quotesPlaceholderData = html`
		<div style="padding: 5px">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ullamcorper neque eu tempus porta. Aliquam a elit
			non
			velit iaculis faucibus vel eget mauris. Etiam a rutrum arcu. Aliquam sollicitudin posuere tellus, vitae auctor diam
			commodo at. Morbi quam ipsum, dignissim ut ipsum a, sagittis vehicula ante.
			Aliquam pretium volutpat mauris, ac condimentum purus imperdiet ut. Fusce posuere ligula et diam congue dictum in eu
			sapien. Morbi vitae euismod tellus, eget semper nibh. Donec magna neque, convallis eget dapibus id, dapibus sit amet
			justo. Sed lobortis nibh at risus cursus euismod. Pellentesque vehicula ut eros ut aliquet.</div>
		
		<div style="padding: 5px">Duis ac diam tellus. Sed quis velit lobortis, consequat purus vel, tristique augue. Nulla a
			magna blandit, congue
			libero
			suscipit, tristique odio. Suspendisse commodo orci id volutpat faucibus.
			Duis posuere auctor dolor vel ultrices. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere
			cubilia
			curae; Sed urna ligula, scelerisque sit amet elit id, ullamcorper auctor odio. Fusce ultrices risus elit, ac maximus
			sem
			rhoncus et. Duis feugiat, leo in placerat fermentum, quam nulla tempor lorem, quis consectetur diam magna pulvinar
			ante.
			Sed posuere, ipsum elementum fringilla mattis, quam justo gravida tellus, a congue arcu libero at massa.
			Aliquam ut rutrum urna. Curabitur vel neque luctus, sagittis augue ac, finibus urna. Duis varius, tellus sit amet
			tincidunt efficitur, ligula felis tempor purus, ut faucibus libero augue vel justo.</div>
		
		<div style="padding: 5px">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus ullamcorper neque eu tempus porta. Aliquam a elit
			non
			velit iaculis faucibus vel eget mauris. Etiam a rutrum arcu. Aliquam sollicitudin posuere tellus, vitae auctor diam
			commodo at. Morbi quam ipsum, dignissim ut ipsum a, sagittis vehicula ante.
			Aliquam pretium volutpat mauris, ac condimentum purus imperdiet ut. Fusce posuere ligula et diam congue dictum in eu
			sapien. Morbi vitae euismod tellus, eget semper nibh. Donec magna neque, convallis eget dapibus id, dapibus sit amet
			justo. Sed lobortis nibh at risus cursus euismod. Pellentesque vehicula ut eros ut aliquet.</div>
		`;
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
				<img class="left-arrow-icon" src="/images/insure/left-arrow.svg" @click="${() => this._back()}" />
				<capitec-label label="Insure" type="title"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-button type="white" label="Get Estimate" @click=${(event)=>
										this._viewCalculateEstimate(event)}>
				</capitec-button>
			</capitec-title-bar>
		
			<capitec-tab-group>
				<capitec-tab label="Policies">
					${this._policies.map(policyItem => html`
					<horizon-insure-accordion
						.cardOptions="${policyItem.inArrears === true ? POLICY_CARDS_ORDER_ARREARS : POLICY_CARDS_ORDER_DEFAULT}"
						.policy="${policyItem}" .inArrears="${policyItem.inArrears}" @clickedRouteCard=${(event)=>
										this._actionCardClicked(event)} @clickedViewPlan=${(event)=>
										this._viewPlan(event)} >
					</horizon-insure-accordion>`)}
				</capitec-tab>
		
				<capitec-tab label="Quotes">
					<div>
						${this._quotesPlaceholderData}
					</div>
				</capitec-tab>
			</capitec-tab-group>
			<!-- ${this._renderExploreInsure()} -->
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