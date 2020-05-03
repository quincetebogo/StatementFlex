import { Component, html, css } from 'platform/elements';
import 'platform/components/core/Label';

export class CreditProductDetails extends Component {

	constructor() {
		super();
	}

	static get styles() {
		return [
			super.styles,
			css`
			.creditproduct-info{
				width:  100%;
				height: 823px;
				padding: 0px 0px 0px 0px;
				text-align: center;
				line-height: 40px;
				align-items: flex-start;
				background-color: white;
				border-radius: none;
			}
			.content{
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
		
			#text{
				text-align: left;
				padding: 0px 24px 0px 24px;
				margin: 10px 0px 0px 0px;
				color: #003652;;
				height:75px;
				font: bold 12px/30px Hind Vadodara;
			}
			.list-items{
				text-align:left;
				color: #003652;
			}
			ul{
				margin: 0px;
				font:  12px/30px Hind Vadodara;
			}	
			#text-affordable{
				text-align:left;
				padding: 0px 0px 0px 24px;
				color: #003652;
			}
			#text-offer{
				padding: 0px 0px 0px 24px;
				margin: 0px;
				font: bold 12px/30px Hind Vadodara;
			}
			#doc-text{
				padding: 0px 0px 0px 24px;
				font: bold 12px/30px Hind Vadodara;
				margin: 0px 0px 10px 0px;
			}
			#benefits-text{
				height:65px;
				margin: 10px 0px 0px 0px;
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
			`];
	}

	render() {
		return html`
				<capitec-card class="creditproduct-info">
				<capitec-title-bar type="credit" label="Credit"></capitec-title-bar>

				<capitec-content-box class="content">
				<capitec-label id="label" label="Personalised Credit" type="subtitle"></capitec-label>
				<hr>
				<p id="text">Move to a simpler way to get credit. Get an estimate online or use our banking app
					 to apply for a loan of up to R250 000. You'll get a personalised offer based on your
					 affordability, and you can choose between the amount you want, the lowest monthly 
					instament or the lowest interest rate.
				</p>
				<hr>
				<capitec-label id="label" label="Benefits" type="subtitle"></capitec-label>
				<hr>
				<p id="benefits-text"> 
					Whether you need to do home improvements, pay for your children's education to secure their future
					or buy a reliable car to get your family there safely - living better starts when you get get credit for
					right reasons.
					<p id="text-offer">Your offer is based on your affordability and credit profile</p>
					<ul class="list-items">
						<li>Your banking and credit history</li>
						<li>Your income and expenses to see how much you can afford</li>
						<li>How stable your source of income is, to make the best offer</li>
						<li>You choose the credit amount that you want</li>
						<li>You choose the monthly instaments that suits your cash flow or the option that gives the best rate</li>
					</ul>
				</p>
				<hr>
				<capitec-label id="label" label="Credit Insurance" type="subtitle"></capitec-label>
				<hr>
				<p id="insure">Credit insurance is required for credit terms of 7 months or longer to cover death , permanent or temporal
					disability, unemployment, the inability to earn an income or retrenchment. Get an online credit estimate to
					see how much credit you qualify for or get more information about our credit insurance and claims process.
					<br>
					<p id="doc-text">
					Documents you need when applying
					</p>
					<ul class="list-items">
						<li>Original identification document (must be 18 years or older). If your name and/or surname differs from your identification document, a marriage
                            certificate, divorce court order or name change letter will be required.
                       </li>
						<li>Latest salary slip</li>
						<li>Any original bank statment showing your latest 3 consecutive salary deposits into an account in your name (an over-the-counter bank statement must be stamped)</li>
					</ul>
				</p>
				</capitec-content-box>
			</capitec-card>
		`;
	}
}
window.customElements.define(`creditproduct-details`, CreditProductDetails);