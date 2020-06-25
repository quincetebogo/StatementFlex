import { Component, html, css } from 'platform/elements';
import { Router, NavigationContext, EventAggregator } from 'platform/core';

import 'platform/components/popups/Toast';
import 'platform/components/containers/TabGroup';
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

		this.router.addRoute({
			name: `claim`,
			title: `claim`,
			icon: null,
			path: `/claim`,
			load: () => import(`../../../views/product/InsureLandingPages/InsureClaim`),
			isDefault: false
		});

		// Define a route for screen "Two".
		this.router.addRoute({
			name: `cover`,
			title: `cover`,
			icon: null,
			path: `/cover`,
			load: () => import(`../../../views/product/InsureLandingPages/InsureCover`)
		});
		this.benefitScreen = true;
		this.coverScreen = false;
		this.claimScreen = false;
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			benefitScreen: { type: Boolean },
			coverScreen: { type: Boolean },
			claimScreen: { type: Boolean }
		};
	}


	onNavigationContextUpdated() {
		// Access the current route's information and log its name, e.g. "screen-one"
		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};
	navigate(path) {
		this.router.navigateByPath(`/${path}`);
	}
	static get styles() {
		return [
			super.styles,
			css`
			.card{
				height: 888px;
				width: 100%;
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
					<capitec-tab label="Benefits">
					
							${this.benefitScreen ? html`${this.renderBenefitContent()}` : html``}
							${this.claimScreen ? html`<div>${this.renderClaimContent()}</div>` : html``}
	
					</capitec-tab>
				<capitec-tab label="Cover" layout="vertical" halign="left">
									${this.coverScreen ? html`<div>${this.renderCoverContent()}</div>` : html``}

				</capitec-tab>

					<capitec-button label="Claim" layout="vertical" halign="left" @click="${() => this.navigate(`claim`)}">
					
					</capitec-button>
			</capitec-tab-group>
		
			</capitec-card>
		`;
	}

	renderBenefitContent() {
		return html`
				<capitec-toast type="info" detail="All Funeral Plan are subject to terms and conditions, including limitiations and exclusions." closable style="width:650px"></capitec-toast>
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
			
		`;
	}

	renderCoverContent() {
		return html`
			<capitec-group>
				<capitec-label label="Life assured categories" type="strong"></capitec-label>
				<p calss="text-area">Get cover for yourself, one spouse and up to 4 parents, 8 children and 8 extended family members – all on one plan.</p>

				<capitec-table></capitec-table>
			</capitec-group>
		
		`;
	}

}
window.customElements.define(`horizon-insure-benefit-nonclient`, InsureBenefitNonClient);