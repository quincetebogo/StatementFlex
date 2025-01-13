import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

// TODO: Review styling (fonts, sizes etc. on page) against Invision

export class SavingsAccountProductDetails extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.savingsaccountproduct-info{
				width: 100%;
				height: 876px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: flex-start;
				background-color: white;
				border-radius: none;
			}
			.content{
				width: 100%;
				height: 770px;
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
			#benefits-text{
				height:40px;
				margin: 0px 0px 0px 0px;
				font:  12px/30px Hind Vadodara;
			}
			p{
				text-align:left;
				padding: 0px 0px 0px 24px;
				color: #003652;
				font:  12px/30px Hind Vadodara;
			}
			hr{
				margin:0px;
			}
			sup{
				font: 6px/15px  Hind Vadodara;
			}
			`
		];
	}

	render() {
		return html`
				<capitec-card class="savingsaccountproduct-info">
				<capitec-title-bar type="transact" label="Main Account"></capitec-title-bar>
				<capitec-content-box class="content">
					<p id="benefits-text"> 
						The transaction and main account is your main account (R25 minimum balance; R5 monthly admin fee) 
						that gives you affordable banking and up to 4 free flexible,fixed or tax-free savings plans.
					</p>
					<hr>
					<capitec-label id="label" label="Benefits" type="subtitle"></capitec-label>
					<hr>
					<p>Some of the benefits of using our main main account:</p>
					<ul class="list-items">
						<li>Access to Mastercard<sup>@</sup> Priceless<sup>@</sup> Cities worldwide</li>
						<li>Easy transactions at lower, transparent bank costs</li>
						<li>Manage your savings plans and your money using our app, cellphone *120*3279#, the internet and your Global One Card</li>
					</ul>
				</capitec-content-box>
			</capitec-card>
		`;
	}
}

window.customElements.define(`horizon-savings-account-product-details`, SavingsAccountProductDetails);