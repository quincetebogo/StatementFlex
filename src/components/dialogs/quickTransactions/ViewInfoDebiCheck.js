import { Component, css, html } from 'platform/elements';

import 'platform/components/popups/Modal';

/**
 * The View Info Dialog invoked from the Debi-Checks display. This dialog displays details on
 * the selected debi-check mandate
 */
export class ViewInfoDebiCheck extends Component {

	// --------------
	// INITIALISATION
	// --------------
	
	constructor() {
		super();
		this.debiCheckDetails = {};
		this.isPending = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {object} debiCheckDetails The full details of the debi-check mandate
	 *
	 * @readonly
	 * @static
	 * @memberof ViewInfoDebiCheck
	 */
	static get properties() {
		return {
			debiCheckDetails: { type: Object },
			isPending: { type: Boolean }
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
		this.dispatchEvent(new CustomEvent(`viewed`));
	}

	_formartCollectionDate(collectionDate) {

		const date = collectionDate instanceof Date ? collectionDate : new Date(collectionDate);

		const months = [
						`January`, `February`, `March`, `April`, `May`, `June`,
						`July`, `August`, `September`, `October`, `November`, `December`
						];
	
		return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
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
			
			horizon-alert-banner{
				margin-left: -5px;
				--theme-alert-banner-font-size: 13.7px;
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
					line-height: 20px;
				}

				capitec-label {
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-weight: 500;
					--theme-label-default-font-size: 16px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-letter-spacing: 0;
					--theme-label-line-height: 20px;
				}
				.group-layout { 
					width: 500px;
					--theme-layout-grid-gap-row: 5.2px;
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
				${this._renderError()}
				<capitec-group class="group-layout" layout="grid" rows="uniform" columns="auto" row-gap="clear" >
					<capitec-label type="subtitle" label="Ultimate Creditor Name" row="1" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.ultimateCreditorName ? this.debiCheckDetails.ultimateCreditorName : `-`}" row="1" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="First collection date" row="2" column="1"></capitec-label>
					<capitec-label id="label-value"
						type="subtitle" 
						label="${this.debiCheckDetails.firstCollectionDate ? this._formartCollectionDate(this.debiCheckDetails.firstCollectionDate) : `-`}" row="2" column="2"></capitec-label>

					<capitec-label type="subtitle" label="Tracking allowed" row="3" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.tracking ? `Yes` : `No`}" row="3" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Contract reference" row="4" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.contractReference ? this.debiCheckDetails.contractReference : `-`}" row="4" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Collector contact number" row="5" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.collectorContact ? this.debiCheckDetails.collectorContact : `-`}" row="5" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Mandate reference" row="6" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.mandateReference ? this.debiCheckDetails.mandateReference : `-`}" row="6" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Collector email address" row="7" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.collectorEmail ? this.debiCheckDetails.collectorEmail : `-`}" row="7" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Mandate request transaction identifier" row="8" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.mrti ? this.debiCheckDetails.mrti : `-`}" row="8" column="2"></capitec-label>
					
					<capitec-label type="subtitle" label="Date Amended" row="9" column="1"></capitec-label>
					<capitec-label id="label-value" type="subtitle" label="${this.debiCheckDetails.dateAmended ? this._formartCollectionDate(this.debiCheckDetails.dateAmended) : `-`}" row="9" column="2"></capitec-label>
				</capitec-group>
		`;
	}

	_renderError() {
		return this.isPending
			? html`
				<horizon-alert-banner
					type="warning"
					header="Notify client: "
					label="The DebiCheck can only be approved/declined by contacting the bank you selected for this payment">
				</horizon-alert-banner>`
			: html``;
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