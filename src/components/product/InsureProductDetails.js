import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

export class InsureProductDetails extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.insureproduct-info{
				width:  100%;
				height: 876px;
				padding: 0px 0px 0px 0px;
				text-align: left;
				line-height: 40px;
				align-items: flex-start;
				background-color: white;
				border-radius: none;
			}
			.content{
				width:  100%;
				height:705px;
			}
			#label{
				text-align:left;
				padding: 0px 0px 0px 24px;
				line-height:40px;
				color: #003652;
				font-weight: bold;
				margin: 0px;
			}
		
			.list-items{
				text-align:left;
				color: #003652;
			}

			ul{
				margin: 0px;
				font:  12px/30px Hind Vadodara;
			}

			p{
				text-align:left;
				padding: 0px 0px 0px 24px;
				color: #003652;
				font:  12px/30px Hind Vadodara;
				margin:0px;
			}

			hr{
				margin:0px;
			}
		`
];
	}

	render() {
		return html`
				<capitec-card class="insureproduct-info">
				<capitec-title-bar type="insure" label="Insure"></capitec-title-bar>

				<capitec-content-box class="content">

				<p>The Capitec Funeral Plan, underwritten by Centriq Life Insurance Company Limited, is personalised according to your needs. You decide how much cover you need and we calculate your premiums. You can also choose a premium that fits your budget and we'll calculate the cover - putting you in control of your money.</p> 
				
				<capitec-label id="label" label="Ways to apply" type="subtitle"></capitec-label>
				<ul class="list-items">
						<li>On our app for lower premiums</li>
						<li>Visit a branch</li>
				</ul>

				<capitec-label id="label" label="What makes our funeral plan unique?" type="Strong"></capitec-label>

				<p><b>One plan, more cover</b><br/>A combination of high cover amounts and number of lives insured has made us the fastest-growing funeral plan in South Africa (ref: UBS South African Insurance Sector, June 2019 Market Share).</p>

				<p><b>Lower Premiums</b><br/>Use our banking app to get your funeral cover and pay lower premiums.</p>

				<p><b>Cover up to 21 dependants</b><br/>Get cover for one spouse and up to 4 parents, 8 children and 8 extended family members - all on one plan.</p>

				<p><b>Personalise your plan</b><br/>Only pay what you can afford. You tell us how many people you want to cover, and we calculate the premiums. Alternatively, tell us what you can afford, and we calculate the cover.</p>

				<p>No automatic annual premium increases<br>
				We want you to be in control, with no suprises or decision made without your knowledge. That's why your premiums will never increase<br>
				automatically - unless we provide you with at least 30 days' written notice of our decision to increase your premium, or if you decide to make<br>
				changes to your plan such as increasing your cover amounts or adding life assureds (subject to terms and conditions).</p>

				<capitec-label id="label" label="Simplified claims process" type="Strong"></capitec-label>
				<p>Visit a branch or simply claim through our 24hr Client Care Centre by emailing the revelant documentation. More about our funeral claim process.</p>

				<hr>
				<capitec-label id="label" label="Benefits" type="subtitle"></capitec-label>
				<hr>
				<ul class="list-items">
						<li>Waiting Period Waiver</li>
						<li>If you switch from a funeral policy with ny other registered insurer and that policy's waiting period is over, we'll waive your waiting period for natural death for the same life insured and related cover amounts as your previous policy. There's no waiting period in the event of an accidental death. </li>
						<li>A registered insurer is defined as a registered insurance company recognised by the Financial Services Conduct Authority (FSCA) and listed on the FSCA website.</li>
						<li>Double Accident Death Benefit</li>
						<li>From day one, the funeral payout is doubled if a life assured dies as a result of an accident. For children, this is limited to the maximum cover amounts as prescribed by law</li>
						<li>Voluntary Policy Pause</li>
						<li>Pause your plan for up to 6 months without any monthly premium payments and with no cover. You can restart your plan any time in the 6-month period to reactivate your cover and premium and get the same full benefits of your plan. This benefit has an initial waiting period of 24 months and can be applied for on an umlimited basis (subject to a further 24-month waiting period) over the term of your policy.</li>
						<li>Newborn Premium Waiver</li>
						<li>This benefit is Capitec's way of celebrating with our clients. You get full cover for up to 6 months without any monthly premium payments when you provide an unabridged birth certificate within 3 months of the birth or adoption.</li>
						<li>This benefit has an initial waiting period of 12 months. The premium waiver can be applied for on an unlimited basis (subject to further 12-month waiting periods) over the term of the policy.</li>
						<li>Burial Repatriation</li>
						<li>This benefit covers the transport of mortal remains of a life assured from within South Africa, Namibia. Zimbabwe, Botswana, Swaziland, Lesotho and Mozambique to the funeral home of choice closest to the place of burial in South Africa.</li>
						<li>It also includes transportation arrangements and overnight accomodation for one family member accompanying the remains.</li>
						<li>Death Premium Waiver</li>
						<li>If the policyholder dies 12 months after the policy inception, the remaining life assureds on the funeral plan will continue to receive full cover for a furthr 6 months from the date of the policyholder's death without any monthly premium payments, giving them time to reorganise their financial lives. The Death Premium Waiver is activated automatically upon the registration of the policyholder's death.</li>
				</ul>

				</capitec-content-box>
				</capitec-card>
		`;
	}
}

window.customElements.define(`horizon-insure-product-details`, InsureProductDetails);