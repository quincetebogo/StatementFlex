import { Component, html, css } from 'platform/elements';
import { Router, NavigationContext, EventAggregator } from 'platform/core';


import 'platform/components/popups/Toast';
import 'platform/components/containers/TabGroup';
import 'platform/components/data/Table';
import 'platform/components/navigation/AppRouter';

export class InsureBenefitNonClient extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.router = Router.getInstance();

		EventAggregator
			.getInstance()
			.subscribe(`platform-navigation-context-updated`, () => this.onNavigationContextUpdated());

		this.benefitScreen = true;
		this.coverScreen = false;
		this.claimScreen = false;
		this.index = 0

		this.records = [
			{ columnOne: 'Policyholder', columnTwo: 'R100 000' },
			{ columnOne: 'Spouse(18 - 64)', columnTwo: 'R100 000' },
			{ columnOne: 'Children (newborn - 5 years)', columnTwo: 'R20 000 each*' },
			{ columnOne: 'Children (6 - 13 years)', columnTwo: 'R50 000 each*' },
			{ columnOne: 'Children (14 years and older)', columnTwo: 'R60 000 each*' },
			{ columnOne: 'Parents (26 - 85 years)', columnTwo: 'R50 000 each*' },
			{ columnOne: 'Extended Family (0 - 85 years)', columnTwo: 'R20 000 each*' }
		];
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			benefitScreen: { type: Boolean },
			coverScreen: { type: Boolean },
			claimScreen: { type: Boolean },

		};
	}


	onNavigationContextUpdated() {
		// Access the current route's information and log its name, e.g. "screen-one"
		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};
	navigate(path) {
		this.benefitScreen = path == `banefits`;
		this.coverScreen = path == `cover`;
		this.claimScreen = path == `claim`;
	}
	static get styles() {
		return [
			super.styles,
			css`
			.card{
				height: 888px;
				width: 100%;
			}
			.info-banner{
				width:100%;
				background-color: #DAF2F4;
				color: #05829B;
				font-family: "Hind Vadodara";
				font-size: 14px;
				font-weight: 500;
				letter-spacing: 0;
				line-height: 20px;
			}
			.benefit-content{
				height: 100%;
				width: 100%;
			  }
			}
			.calculate-button{
				border: 1px solid white; 
				color: white;
			}
			.label{
				height: 24px;
				width: 265px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.text-area{
				height: 120px;
				width: 1032px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.waiver-label{
				height: 24px;
				width: 160px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.waiver-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.accidental-label{
				height: 24px;
				width: 232px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.accidental-text-area{
				height: 48px;
 				width: 1015px;
  				color: #545D60;
  				font-family: "Hind Vadodara";
 				font-size: 15px;
  				letter-spacing: 0;
  				line-height: 24px;
			}
			.voluntary-label{
				height: 24px;
				width: 162px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.voluntary-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.newborn-label{
				height: 24px;
				width: 187px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.newborn-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 24px;
			}
			.premium-label{
				height: 24px;
 				width: 164px;
 				color: #3E4547;
 				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
  				letter-spacing: 0;
  				line-height: 24px;
			}
			.premium-text-area{
				height: 48px;
				width: 1015px;
				color: #545D60;	
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
  				line-height: 24px;
			}
			.burial-label{
				height: 24px;
				width: 133px;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			.burial-text-area{
				height: 24px;
  				width: 1015px;
  				color: #545D60;
  				font-family: "Hind Vadodara";
  				font-size: 15px;
  				letter-spacing: 0;
 				line-height: 24px;
			}
			`];
	}



	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-title-bar class="title-bar" type="insure">
					<capitec-icon size="medium" icon="product/insure-white"></capitec-icon>
					<capitec-label label="Insure" type="title"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-button class="calculate-button" type="white" label="Calculate Premium"></capitec-button>
				</capitec-title-bar>
				<capitec-tab-group>
						<capitec-tab label="Benefits" selectedIndex={0} @click="${() => this.navigate(`benefits`)}">${this.benefitScreen ? html`${this.renderBenefitContent()}` : html``}
						</capitec-tab>
						<capitec-tab label="Cover" layout="vertical" halign="left" selectedIndex={1}  @click="${() => this.navigate(`cover`)}">				${this.coverScreen ? html`<div>${this.renderCoverContent()}</div>` : html``}
						</capitec-tab>
						<capitec-tab label="Claim" layout="vertical" halign="left" selectedIndex={2}  @click="${() => this.navigate(`claim`)}">			${this.claimScreen ? html`<div>${this.renderClaimContent()}</div>` : html``}
						</capitec-tab>
				</capitec-tab-group>
		</capitec-card>
		`;
	}

	renderBenefitContent() {
		return html`
			<capitec-content-box>
				<capitec-alert-banner class="info-banner" type="info" closable>All Funeral Plan are subject to terms and conditions, including limitiations and exclusions.</capitec-alert-banner>
				<capitec-group>
					<capitec-label class="label" label="What makes our funeral plan unique?" type="strong">
					</capitec-label>
					<ul class="text-area">
						<li>High cover for you and up to 21 dependants all on one plan</li>
						<li>Personalise your plan – only pay what you can afford</li>
						<li>Get lower premiums when you apply on the app</li>
						<li>No automatic annual premium increases – putting you in control</li>
						<li>Simplified claims proccess </li>
					</ul>
					<capitec-label class="waiver-label" label="Waiting Period Waiver" type="strong">
					</capitec-label>
					<p class="waiver-text-area">If you switch from a funeral policy with any other registered insurer and
						 that policy’s waiting period is over, we’ll waive your waiting period for 
						 natural death for the same lives assured and related cover amounts as your previous policy.
					</p>
					<capitec-label  class="accidental-label" label="Double Accidental Death Benefit" type="strong">
					</capitec-label>
					<p class="accidental-text-area">
						From day one, the funeral payout is doubled if a life assured dies from unnatural causes. 
						For children, this is limited to the maximum cover amounts as prescribed by law.
					</p>
					<capitec-label  class="voluntary-label" label="Voluntary Policy Pause" type="strong">
					</capitec-label>
					<p class="voluntary-text-area">Pause your plan for up to 6 months without any monthly premium payments and with no cover.
						 You can restart your plan any time in the 6-month period to reactivate your cover and premium,
						 and get the same full benefits of the plan.</p>
					<capitec-label  class="newborn-label" label="Newborn Premium Waiver" type="strong">
					</capitec-label>
					<p class="newborn-text-area">If you apply, you get full cover for up to 6 months without any monthly premium payments as
						 soon as the policyholder or spouse (also a life assured) gives birth or adopts a child.</p>
					<capitec-label  class="premium-label" label="Death Premium Waiver" type="strong">
					</capitec-label>
					<p class="premium-text-area">If the policyholder dies 12 months after policy inception, the remaining life assureds on the
						 funeral plan will continue to receive full cover for a further 6 months from the date of the
						 policyholder's death without any monthly premium payments.</p>
					<capitec-label  class="burial-label" label="Burial Repatriation" type="strong">
					</capitec-label>
					<p class="burial-text-area">Repatriation of mortal remains of those covered, to the funeral home of choice closest to the place of burial.</p>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	renderCoverContent() {
		return html`
		<capitec-content-box>
			<capitec-group>
			<capitec-alert-banner class="info-banner" type="info" closable>All Funeral Plan are subject to terms and conditions, including limitiations and exclusions.</capitec-alert-banner>
				
				<capitec-label label="Life assured categories" type="strong"></capitec-label>
				<p class="text-area">Get cover for yourself, one spouse and up to 4 parents, 8 children and 8 extended family members – all on one plan.</p>

				<capitec-table .items="${this.records}" fixed>
					<capitec-table-column label="Relationship Types" field="columnOne"></capitec-table-column>
					<capitec-table-column label="Maximum Cover" field="columnTwo"></capitec-table-column>
				</capitec-table>

				<capitec-label type="Title " label="Spouse"></capitec-label>
				<p>The person you are married to who is not older than 64 years of age at the cover start date. 
					Married for purposes of this contract is when 2 people are: </p>

					<ul>
						<li>Married according to the laws of any sovereign country</li>
						<li>Married according to customary/tribal law</li>
						<li>Married under any religion practised in South Africa</li>
						<li>Living together and financially dependant on one another for at least 6 months</li>
						<li>Party to a civil union in terms of Civil Union Act (2006)</li>
					</ul>

				<p>When you have more than one spouse, or if your spouse falls outside the maximum age requirement for a spouse, then the additional spouses can be covered as extended family members. </p>
				<capitec-label type="Title" label="Parent"></capitec-label>
				<p>Your biological parents, parents-in-law, legal guardians if you are an adopted child and your stepparents who are under the age of 86 at the cover start date. Where you have more than 4 parents, additional parents can be covered as extended family members.</p>
				<capitec-label type="Title" label="Child"></capitec-label>
				<p>Your child, your spouse’s child or your legally adopted child, stepchild or where you/your spouse are the child’s legal guardian. A child must be unmarried and below the age of 25 years.</p>
				<capitec-label type="Title" label="Extended Family"></capitec-label>
				<capitec-label type="Title" label="We consider extended famu=ily member to be:"></capitec-label>
				<capitec-label type="Title " label="Spouse"></capitec-label>
				<p>Where you have more than one spouse, or if your spouse's age falls outside the 18 – 64 years requirement, then the additional...</p>
				<capitec-label type="strong" label="Parent"></capitec-label>
				<p>Where you have more than 4 parents, then the additional parents, if they are 85 years or younger, can be covered as extended family members.</p>
				<capitec-label type="strong" label="Child"></capitec-label>
				<p>Where you have more than 8 children, or the child falls outside the age requirements of 25 years or younger, then the additional children can be covered as extended family members.</p>
			</capitec-group>
		</capitec-content-box>
		`;
	}

	renderClaimContent() {
		return html`
		<capitec-content-box>
			<capitec-alert-banner class="info-banner" type="info" closable>All Capitec Funeral Plan are subject to terms and conditions, including limitiations and exclusions.</capitec-alert-banner>
			<capitec-label type="strong" label="Ways to claim"></capitec-label>
				<ul>
					<li>Email FuneralClaims@capitecbank.co.za</li>	
					<li>Visit a branch</li>
				</ul>
				<capitec-label type="strong" label="Documents needed"></capitec-label>
				<p>Once all documents are received, your claim will be processed and the money paid into your Capitec account immediately after your claim is approved.</p>
				<capitec-label type="strong" label="Natural Death claims"> </capitec-label>
					<ul>
						<li>Original or certified copy of the death certificate</li>
						<li>Fully completed BI-1663/BI-1680 or DHA-1663/DHA-1680 form BI-1663/BI-1680:</li>
						<li>This is a notification of death or stillbirth completed by the Department of Home Affairs</li>
						<li>DHA-1663/DHA-1680: This is a Death Report that will be issued after a death has been registered</li>
						<li>The valid identity document of the claimant</li>
						<li>The valid identity document of the beneficiary</li>
						<li>Beneficiary’s bank, bank account number and branch code if the beneficiary is not a Capitec Bank accountholder</li>
						<li>Any other documents/reports which we need to assess the validity of the claim</li>
					</ul>
				<capitec-label type="strong" label="In addition to the above documents, for"></capitec-label>
				<capitec-label type="strong" label="Accidental Death claims"></capitec-label>
				<ul>
					<li>A police report with the deatils of the cause of death</li>
				</ul>
				<capitec-label type="strong" label="Newborn Premium Waiver claims"></capitec-label>
				<ul>
					<li>An unabridged birth certificate</li>
				</ul>
				<capitec-label type="strong" label="Voluntary Premium Pause claims"></capitec-label>
				<ul>
					<li>A reason as to why you want to activate the benefit, no additional documents required</li>
				</ul>
				<capitec-label type="strong" label="Waiting Period Waiver"></capitec-label>
				<ul>
					<li>Policy schedule of previous policy showing that the cover was in force at the time of the Capitec policy acceptance</li>
				</ul>
		</capitec-content-box>
			
		`;
	}

}
window.customElements.define(`horizon-insure-benefit-nonclient`, InsureBenefitNonClient);