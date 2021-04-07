import { Component, css, html } from 'platform/elements';

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
					height: 888px;
				}
				.content{
					width: 100%;
					height: 788px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
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
				type="${this.viewType}">
					<capitec-icon
						size="medium"
						icon="product/${this.viewType}-white">
					</capitec-icon>
					<capitec-label
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
							label="More info to come">
						</capitec-label>
						<capitec-label
							class="insights-subtitle"
							label="Want to know the benefits and fees visit the Capitec website for all info and more">
						</capitec-label>
						<capitec-button
							class="benefits-button"
							type="primary"
							label="View Benefits"
							@click="${() => this._viewBenefits()}">
						</capitec-button>
				</capitec-content-box>
			</capitec-group>
		</capitec-card>`;
	}
}
window.customElements.define(`horizon-cnet-product-info`, CnetProductInfo);