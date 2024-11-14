import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import 'platform/components';

/**
 * @deprecated The Flexible Savings Product Plan view is no longer in use
 * @export
 * @class FlexibleSavingsPlanProduct
 * @extends {View}
 */
export class FlexibleSavingsPlanProduct extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.horizonRouter = HorizonRouter.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// RENDERING
	// ---------

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
				}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-group layout="vertical" halign="stretch" valign="top" gap="none" class="savingsproduct-info">
					<capitec-title-bar type="save">
						<capitec-icon size="small" icon="system/arrow-left"
									  @click="${() => this.horizonRouter.navigateToSavingsPlanProduct()}">
						</capitec-icon>
						<capitec-label label="Access Anytime" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-content-box class="content">
						<capitec-label id="label" label="Choose the deposit amount and the frequency of your deposits" type="default">
						</capitec-label>
						<hr>
							<capitec-label id="label" label="Benefits" type="strong"></capitec-label>
						<hr>
						<p id="benefits-text"> 
							The benefits of our access anytime plan:
						</p>
						<ul class="list-items">
							<li>Choose your deposit amount and the frequency of your deposits</li>
							<li>Choose a name for your plan</li>
							<li>Access your plan any time through Remote Banking or our ATMs</li>
							<li>No monthly admin fee or minimum balance</li>
						</ul>
						<span>Use our app to open an acess anytime</span>
						<p>
							Create an access anytime plan the easy way:
						</p>
						<ul class="list-items">
								<li>Open our app</li>
								<li>Tap on Save</li>
								<li>Enter your Remote PIN</li>
								<li>Tap on Add Access Anytime Plan</li>
							</ul>
					</capitec-content-box>
			</capitec-group>
		`;
	}
}

customElements.define(`horizon-flexible-savings-plan-product`, FlexibleSavingsPlanProduct);