import { Component, css, html } from 'platform/elements';

/**
 * Live Better landing screen - un-verified view
 *
 * @export
 * @class CnetProductInfo
 * @extends {Component}
 */
export class LiveBetterUnverifiedPage extends Component {

	constructor() {
		super();
	}

	static get properties() {
		return {
		};
	}

	_verifyNow() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {}));
	}

	static get styles() {
		return [
			super.styles,
			css`
				.product-info{
					width: 100%;
					height: 918px;
				}
				.content{
					width: 100%;
					height: 709px;
				}
				capitec-title-bar {
					--theme-titlebar-shadow: 0px;
					--theme-titlebar-padding: 12px 16px;
					--theme-type-primary-background: url(../../images/Lbb-1.png);
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
				
				.other-options {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;

					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
				}
				
				.options-group {
					height: 80px; 
					margin: 17px 0px 15px 0px;
					width: auto;
				}
				horizon-option-button {
					width: 204px;
					height: 80px;

					--horizon-option-btn-text-margin-top: 3px;
				}
				.button-margin {
					height: 80px;
					width: 186px;
					margin-left: 16px;
					padding: 0px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}		
			`
		];
	}

	_mobileTemplate() {
		this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderContent()}
		`;
	}

	_renderContent() {
		return html`
			<capitec-card class="product-info">
				<capitec-title-bar
					data-automation-id=""
					type="primary">
						<capitec-icon
							size="medium"
							icon="product/transact-white">
						</capitec-icon>
						<capitec-label
							data-automation-id=""
							label="Live Better Savings Account"
							type="title">
						</capitec-label>
				</capitec-title-bar>
				
				<capitec-group
					class="content"
					layout="vertical"
					halign="center"
					valign="center"
					gap="none">
						<img src="platform/illustrations/authenticate.svg">
						<capitec-label
							id="id-more-info"
							label="Client not verified">
						</capitec-label>
						<capitec-label
							class="insights-subtitle"
							label="We need to verify your details before doing any transactions on your account.">
						</capitec-label>
						<capitec-button
							data-automation-id="cnet-product-info-view-benefits"
							class="benefits-button"
							type="primary"
							label="Verify Now"
							@click="${() => this._verifyNow()}">
						</capitec-button>
				</capitec-group>
				
				<capitec-group class= "" layout="vertical" gap="none" halign="left" valign="center">
					<capitec-title-bar
						type="default"
						label="Explore Live Better"
						class="other-options">
					</capitec-title-bar>
					<capitec-group class="options-group" layout="horizontal" gap="none" H-Align="left">
						<horizon-option-button 
								class="button-margin"
								label="Product enquiry"
								icon="system/info-action"
								@click="${() => this._liveBetterEnquiry(`product-enquiry`)}">
						</horizon-option-button>
					</capitec-group>
				</capitec-group>
			</capitec-card>`;
	}
}
window.customElements.define(`horizon-live-better-unverified-page`, LiveBetterUnverifiedPage);