import { Component, css, html } from 'platform/elements';

const PAGE_INFO = {
	transact: {
		header: `More info to come`,
		icon: `transact-white`,
		details: `Want to know the benefits and fees visit the Capitec website for all info and more`
	},
	save: {
		header: `It's easy to move to simpler banking`,
		icon: `save-white`,
		details: `Visit capitecbank.co.za for more info on our Savings plans.`
	},
	insure: {
		header: `More info to come`,
		icon: `insure-white`,
		details: `Want to know the benefits and fees visit the Capitec website for all info and more`
	},
	credit: {
		header: `More info to come`,
		icon: `credit-white`,
		details: `Want to know the benefits and fees visit the Capitec website for all info and more`
	},
	liveBetter: {
		header: `More to come soon`,
		icon: `/images/liveBetter/liveBetter-white.svg`,
		details: `Visit capitecbank.co.za for more info on our Live Better benefits partners, automatic savings tools and other easy ways to grow your Live Better savings account.`
	}
};

/**
 * This is a temporary component for opening product information pages on CNET. The component will later
 * be replaced by Horizon built product information pages and/or product landing pages.
 *
 * @export
 * @class CnetProductInfo
 * @extends {Component}
 */
export class CnetProductInfo extends Component {

	constructor() {
		super();
	}

	static get properties() {
		return {
			viewType: { type: String },
			viewHeader: { type: String }
		};
	}

	_viewBenefits() {
		this.dispatchEvent(new CustomEvent(`view-benefits`, {}));
	}

	static get styles() {
		return [
			super.styles,
			css`
				.product-info{
					width: 100%;
					height: var(--horizon-panel-height, 888px);
				}
				.content{
					width: 100%;
					height: 788px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
				}
				.transact {
					--theme-type-primary-background: linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%);
				}
				.save {
					--theme-type-primary-background: linear-gradient(135deg, #002A3F 0%, #00537D 52.97%, #024D73 100%);
				}
				.credit {
					--theme-type-primary-background: linear-gradient(90deg, #B62825 0%, #E61414 100%);
				}
				.insure {
					--theme-type-primary-background: linear-gradient(315deg, #70838C 0%, #667F8C 47.52%, #41525B 100%);
				}
				.liveBetter {
					--theme-type-primary-background: url(/images/liveBetter/LBB_bg-1092x64.png);
				}
				#id-more-info {
					margin: 43px auto 8px auto;
					color: #3A3A3A;
					font-size: 24px;
					font-weight: 600;
				}
				.insights-subtitle{
					color: #3A3A3A;
					font-size: 15px;
					line-height: 20px;
					text-align: center;
					max-width: 684px;
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

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProductInfo()}
		`;
	}

	_renderProductInfo() {
		return html`
			<capitec-card class="product-info">
			<capitec-title-bar
				data-automation-id="cnet-product-info-title-bar"
				class="${this.viewType}"
				type="primary">
					${this._renderIcon()}
					<capitec-label
						data-automation-id="cnet-product-info-title"
						label="${this.viewHeader}"
						type="title">
					</capitec-label>
			</capitec-title-bar>
				
			<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
				<capitec-content-box
					layout="vertical"
					halign="center"
					valign="center"
					gap="none">
						<img src="images/landingPageImages/marketing.svg"/>
						<capitec-label
							id="id-more-info"
							label="${PAGE_INFO[this.viewType].header}">
						</capitec-label>
						<capitec-label
							class="insights-subtitle"
							label="${PAGE_INFO[this.viewType].details}">
						</capitec-label>
						<capitec-button
							data-automation-id="cnet-product-info-view-benefits"
							class="benefits-button"
							type="primary"
							label="View Benefits"
							@click="${() => this._viewBenefits()}">
						</capitec-button>
				</capitec-content-box>
			</capitec-group>
		</capitec-card>`;
	}

	_renderIcon() {
		return this.viewType === `liveBetter` 
			? html`
				<img src="${PAGE_INFO[this.viewType].icon}"/>`
			: html`
				<capitec-icon
					size="medium"
					icon="product/${PAGE_INFO[this.viewType].icon}">
				</capitec-icon>`
			;

	}
}
window.customElements.define(`horizon-cnet-product-info`, CnetProductInfo);