import { View, html, css } from 'platform/elements';

import 'platform/components';

import { StopCardService } from '../../../services/StopCardService';
import { HorizonViewManager } from '../../../shell/HorizonViewManager';
import { HorizonRouter } from '../../../shell/HorizonRouter';


export class FlexibleSavingsPlanProduct extends View {

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	async connectedCallback() {
		super.connectedCallback();

		let landingPageData = null;

		landingPageData = await this.GetLandingPageData(landingPageData);
		HorizonViewManager.getInstance().UpdateLoggedInUser({ agentFullName: landingPageData.agentFullName, employeeId: landingPageData.loggedInAgent.employeeId })
	}

	async GetLandingPageData(landingPageData) {
		try {
			landingPageData = await StopCardService.getInstance().initialise();
		}
		catch (ex) {
			// TODO: better handling must come here
			console.log(ex);
		}

		return landingPageData;
	}

	static get styles() {
		return [
			super.styles,
			css`
				.savingsproduct-info{
					width: 100%;
					height: 100%;
					padding: 0px 0px 0px 0px;
					text-align: center;
					line-height: 40px;
					align-items: flex-start;
					background-color: white;
					border-radius: none;
				}
				.content{
					width: 100%;
					height:705px;
					padding: 0px 0px 0px 0px;
				}
				#label{
					text-align:left;
					padding: 0px 0px 0px 24px;
					line-height:40px;
					color: #003652;
					margin: 0px;
				}
				.list-items{
					text-align:left;
					color: #003652;
					padding: 10px 0px 0px 40px;
				}
				ul{
					margin: 0px;
					font:  13px/30px Hind Vadodara;
				}
				#benefits-text{
					height: 25px;
					margin: 10px 0px 0px 0px;
					font:  13px/30px Hind Vadodara;
				}
				p{
					text-align:left;
					padding: 0px 0px 0px 24px;
					color: #003652;
					font:  13px/30px Hind Vadodara;
					margin: 0px;
				}
				hr{
					margin:0px;
				}
				capitec-label[type="strong"]{
					font-weight: bold;
					font-size: large;
				}
				capitec-title-bar > capitec-icon{
					cursor: pointer;
				}
				span{
					text-align:left;
					padding: 5px 0px 0px 24px;
					color: #003652;
					font:  13px/30px Hind Vadodara;
				}
			`];
	}

	render() {
		return html`
			<capitec-group layout="vertical" halign="stretch" valign="top" gap="none" class="savingsproduct-info">
					<capitec-title-bar type="save">
						<capitec-icon size="small" icon="system/arrow-left"
									  @click="${() => this.horizonRouter.navigateToSavingsPlanProduct()}">
						</capitec-icon>
						<capitec-label label="Flexible Savings" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content">
						<capitec-label id="label" label="Choose the deposit amount and the frequency of your deposits" type="default">
						</capitec-label>
						<hr>
							<capitec-label id="label" label="Benefits" type="strong"></capitec-label>
						<hr>
						<p id="benefits-text"> 
							The benefits of our flexible savings plans:
						</p>
						<ul class="list-items">
							<li>Choose your deposit amount and the frequency of your deposits</li>
							<li>Choose a name for your plan</li>
							<li>Access your plan any time through Remote Banking or our ATMs</li>
							<li>No monthly admin fee or minimum balance</li>
						</ul>
						<span>Use our app to open a flexible savings plan</span>
						<p>
							Create a flexible savings plan the easy way:
							<ul class="list-items">
								<li>Open our app</li>
								<li>Tap on Save</li>
								<li>Enter your Remote PIN</li>
								<li>Tap on Add Flexible Savings</li>
							</ul>
						</p>
					</capitec-content-box>
			</capitec-group>
		`;
	}
}

customElements.define(`product-flexible-savings-plan`, FlexibleSavingsPlanProduct);