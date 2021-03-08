import { Component, css, html } from 'platform/elements';
import 'platform/components/core/Label';

/**
 * A generic Product information screen. Used dynamically to view Product info screens via properties set.
 * 
 * @export
 * @class ProductInfo
 * @extends {Component}
 */
export class ProductInfo extends Component {

	constructor() {
		super();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} pageDetails Object which carries required page information
	 *
	 * @readonly
	 * @static
	 * @memberof ProductInfo
	 */

	static get properties() {
		return {
			pageDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// ---------
	// EVENTS
	// ---------

	_viewBenefits(){
		this.dispatchEvent(new CustomEvent(`view-benefits`, {}));
	}

	// ---------
	// RENDERING
	// ---------

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

			`];
	}

	_webTemplate() {
		return html`
				<capitec-card class="product-info">
				<capitec-title-bar type="${this.pageDetails.type}">
					<capitec-icon size="medium" icon="product/${this.pageDetails.image}"></capitec-icon>
					<capitec-label label="${this.pageDetails.title}" type="title"></capitec-label>
				</capitec-title-bar>
					<capitec-group class= "content" layout="grid" gap="none" columns="auto" rows="auto">
						<capitec-placeholder row ="1" column= "1" type="default" label="" size="1" nopadding=${true}></capitec-placeholder>
						<capitec-content-box row ="1" column= "2" layout="vertical" halign="center" valign="center" gap="none" type="default" label="2" nopadding=${true} size="6">
							<img src="images/landingPageImages/marketing.svg"/>
							<capitec-label id="id-more-info" label="More info to come"></capitec-label>
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