import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

// TODO: Review styling (fonts, sizes etc. on page) against Invision

export class ProductInfo extends Component {

	constructor() {
		super();
	}

	_viewBenefits(){
		this.dispatchEvent(new CustomEvent(`view-benefits`, {}));
	}

	static get styles() {
		return [
			super.styles,
			css`
			.product-info{
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
			#id-verify-unsuccessful {
				height: 32px;
				width: 312px;
				margin: 43px auto 8px auto;
				color: #3E4547;
				font-family: "Hind Vadodara";
				font-size: 24px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 32px;
				text-align: center;		
			}
			.insights-subtitle{
				height: 20px;
				width: 528px;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 15px;
				letter-spacing: 0;
				line-height: 20px;
				text-align: center;
				margin-bottom: 32px;
			}
			.benefits-button {
				height: 48px;
				width: 146px;
				--theme-button-primary-border-width: 0px;
				--theme-button-line-height: 20px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-bottom: 14px;
			}
			`
];
	}

	render() {
		return html`
				<capitec-card class="product-info">
				<capitec-title-bar type="transact" label="Saving Account"></capitec-title-bar>
					<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
						<capitec-placeholder row ="1" column= "1" type="default" label="" size="1" nopadding=${true}></capitec-placeholder>
							<capitec-content-box class="box-items" row ="1" column= "2" layout="vertical" halign="center" valign="center" gap="none" type="default" label="2" nopadding=${true} size="6">
								<img class="box-image" src="images/landingPageImages/marketing.svg"/>
								<capitec-label id="id-verify-unsuccessful" label="More info to come"></capitec-label>
								<capitec-label class="insights-subtitle" label="Want to know the benefits and fees visit the Capitec website for all info and more"></capitec-label>
								<capitec-button class="benefits-button" type="primary" label="View Benefits" @click="${() => this._viewBenefits()}"></capitec-button>
							</capitec-content-box>
						<capitec-placeholder row ="1" column= "3" type="default" label="" size="1" nopadding=${true}></capitec-placeholder>
					</capitec-group>
			</capitec-card>
		`;
	}
}

window.customElements.define(`horizon-product-info`, ProductInfo);