import { Component, html, css } from 'platform/elements';
import 'platform/components/containers/TabGroup';

export class InsureBenefitNonClient extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
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

	navigate(path) {
		this.benefitScreen = path == `benefit`;
		this.coverScreen = path == `cover`;
		this.claimScreen = path == `claim`;
	}
	static get styles() {
		return [
			super.styles,
			css`
			.card{
				height: 888px;
				width: 1064px;
			}
			.benefit-content{
				height: 679px;
				width: 1032px;
			  }
			}
			`];
	}



	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-title-bar class="title-bar" icon="product/insure-white" iconsize="small" color="#00486D" type="default" label="Insure">
					<capitec-spacer></capitec-spacer>
					<capitec-button type="clear" label="Calculate Premium"></capitec-button>
				</capitec-title-bar>

				<capitec-tab-group>
					<capitec-tab  label="Benefits">
						<capitec-content-box>
							${this.benefitScreen ? html`<div>${this.renderBenefitContent()}</div>` : html``}
							${this.coverScreen ? html`<div>${this.renderCoverContent()}</div>` : html``}
							${this.claimScreen ? html`<div>${this.renderClaimContent()}</div>` : html``}
  				   		</capitec-content-box>
					</capitec-tab>
				<capitec-button label="Cover" layout="vertical" halign="left" @click="${() => this.navigate(`cover`)}">
		
				</capitec-button>

					<capitec-button label="Claim" layout="vertical" halign="left" @click="${() => this.navigate(`claim`)}">
					
					</capitec-button>
			</capitec-tab-group>
		
			</capitec-card>
		`;
	}

	renderBenefitContent() {
		return html`
			<capitec-content-box class="benefit-content">	
				<img src="../../images/insure/info.svg"/>

				<capitec-label title="What makes our funeral plan unique">
				</capitec-label>
				<ul>
					<li> High cover for you and up to 21 dependants all on one plan.</li>
					<li>Personalise your plan – only pay what you can afford</li>
					<li>Get lower premiums when you apply on the app</li>
					<li>	No automatic annual premium increases – putting you in control</li>
					<li>Simplified claims proccess </li>
				</ul>
				<capitec-label title="Waiting Period Waiver" type="Strong">
				</capitec-label>
				<p>If you switch from a funeral policy with any other registered insurer and
				 that policy’s waiting period is over, we’ll waive your waiting period for 
				 natural death for the same lives assured and related cover amounts as your previous policy.
				</p>
				<capitec-label label="Double Accidental Death Benefit" type="Strong">
				</capitec-label>
				<p>
				From day one, the funeral payout is doubled if a life assured dies from unnatural causes. 
				For children, this is limited to the maximum cover amounts as prescribed by law.
				</p>
				<capitec-label label="Voluntary Policy Pause" type="Strong">
				</capitec-label>
				<p>Pause your plan for up to 6 months without any monthly premium payments and with no cover.
				 You can restart your plan any time in the 6-month period to reactivate your cover and premium,
				 and get the same full benefits of the plan.</p>
				<capitec-label label="Newborn Premium Waiver" type="Strong">
				</capitec-label>
				<p>If you apply, you get full cover for up to 6 months without any monthly premium payments as
				 soon as the policyholder or spouse (also a life assured) gives birth or adopts a child.</p>
				<capitec-label label="Death Premium Waiver" type="Strong">
				</capitec-label>
				<p>If the policyholder dies 12 months after policy inception, the remaining life assureds on the
				 funeral plan will continue to receive full cover for a further 6 months from the date of the
				 policyholder's death without any monthly premium payments.</p>
				<capitec-label label="Burial Repatriation" type="Strong">
				</capitec-label>
				<p>Repatriation of mortal remains of those covered, to the funeral home of choice closest to the place of burial.</p>
			</capitec-content-box>
		`;
	}

}
window.customElements.define(`horizon-insure-benefit-nonclient`, InsureBenefitNonClient);