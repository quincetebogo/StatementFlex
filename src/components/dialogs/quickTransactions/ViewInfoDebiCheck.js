import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';

export class ViewInfoDebiCheck extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();
		this.debiCheckDetails = {};
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
		
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_gotItClick() {
		this.dispatchEvent(new CustomEvent(`on-ok`));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`

			capitec-modal {
				height: auto;
				width: 690px;
				border-radius: 5px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-header-background-color:#F7F7F7;
				--theme-modal-footer-padding: 0px 18px 18px 0px;
			}
			
			div[slot="header"] {
				width: 690px;
				--theme-modal-header-height: 64px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -758px;
				top: -11px;
			}

			div[slot="header"] > span {
				width: 690px;
				background-color: #F7F7F7;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 15px;
				align-self: left;
			}

			.header-title {
				height: 24px;
				width: auto;
				color: #3A3A3A;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
			}
			
			div[slot="body"] {
				width: 780px;
				height: 583px;
			}
			.image {
				align-items: left;
				width: 128px;
				margin-top: 16px;
				margin-bottom: 18px;
			}

			capitec-button {
				height: 48px;
				border-radius: 5px;
				--theme-button-height: 20px;
				--theme-button-width: 41px;
				--theme-button-color: #FFFFFF;
				--theme-button-font-family: "Hind Vadodara";
				--theme-button-font-size: 16px;
				--theme-button-font-weight: 600;
				--theme-button-letter-spacing: 0;
				--theme-button-line-height: 20px;
				--theme-button-text-align: center;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 22px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 22px;
				}
				#label-value {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 28px;
				}

				capitec-label {
					width: 303px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 28px;
				}
				.group-layout { 
					width: 439px;
				}
				`
		];
	}

	_mobileTemplate() {
		_webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left">
				<div slot="header">
					<span>
						<capitec-label class="header-title" label="View DebiCheck Mandate Details"></capitec-label>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box class="body-box">
						${this._renderDebiCheckDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>`;
	}

	_renderDebiCheckDetails() {
		return html`
				<img class="image" src="/images/transactions/DebiCheck-logo-Banner-1024x256.svg"/>
				<capitec-group class="group-layout" layout="grid" rows="uniform" columns="auto" gap="none" >
				<capitec-label type="default" label="First collection date" row="1" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.firstCollectionDate}" row="1" column="2"></capitec-label>
				<capitec-label type="default" label="Tracking allowed" row="2" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.tracking}" row="2" column="2"></capitec-label>
				<capitec-label type="default" label="Contract reference" row="3" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.contractReference}" row="3" column="2"></capitec-label>
				<capitec-label type="default" label="Collector contact number" row="4" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.collectorContact}" row="4" column="2"></capitec-label>
				<capitec-label type="default" label="Mandate reference" row="5" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.mandateReference}" row="5" column="2"></capitec-label>
				<capitec-label type="default" label="Collector email address" row="6" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.collectorEmail}" row="6" column="2"></capitec-label>
				<capitec-label type="default" label="Mandate request transaction identifier" row="7" column="1"></capitec-label>
				<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.mrti ? this.debiCheckDetails.mrti : html`-`}"></capitec-label>
				</capitec-group>
		`;
	}

	_renderFooter() {
		return html`
				<capitec-button
							id="id-submit-button"
							type="primary"
							label="Got it"
							@click="${() => this._gotItClick()}">
				</capitec-button>
			`;
	}

}

window.customElements.define(`horizon-viewinfo-debicheck`, ViewInfoDebiCheck);