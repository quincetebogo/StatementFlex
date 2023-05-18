import { Component, css, html } from 'platform/elements';
import 'platform/components/popups/Modal';

/**
 * The Horizon Pay shap update implements the modal for updating the default institute.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class PayShapUpdate
 * @extends {Component}
 */

export class PayShapUpdate extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.defaultInstitute = false;
		this.agreementAccepted = false;
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			defaultInstitute: { state: true },
			agreementAccepted: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_toggleValue() {
		this.defaultInstitute = !this.defaultInstitute;
	}

	_acceptAgreement() {
		this.agreementAccepted = !this.agreementAccepted;
	}

	_onSave() {
		this.dispatchEvent(new CustomeEvent(`on-save`), { detail: this.agreementAccepted });
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
					width: 808px;
					height: 856px;

					--theme-modal-free-max-width: 808px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-modal-header-padding-top: 20px;
					--theme-modal-header-padding-bottom: 20px;
					--theme-modal-footer-padding: 8px 16px 8px 0px;
				}

				div[slot="body"] {
					width: var(--horizon-modal-width, 690px);
					height: 600px;
				}

				capitec-text-field {
					padding-top: 10px;
				}

				capitec-label[label="Default institution"] {
					--theme-label-title-font-size: 16px;
					--theme-label-title-font-weight: 600;
				}

				.default-institute {
					--theme-card-min-height: 48px;
				}

				capitec-card > capitec-group {
					padding: 10px;
					height: 48px;
				}

				capitec-check {
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					--theme-label-font-color: #3A3A3A;
				}

				.terms-and-conditions {
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
				}

				.terms-and-conditions > ol {
					margin: 0px;
					padding-left: 20px;
				}

				.terms-and-conditions > ol > li {
					padding-left: 10px;
				}

				.accept-terms-and-conditions {
					justify-content: center;
					margin-bottom: 13px;

					--theme-card-min-height: 48px;
				}

				.main {
					height: 728px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px;
				}

				.scroll {
					height: 728px;
					width: 808px;
					border-bottom: 1px solid #E1E1E1;

					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 18px;
					--theme-container-padding-right: 2px;
					--theme-container-padding-bottom: 0px;
				}

				.agreement-viewer {
					width: 100%;
					height: 100%;
				}

				capitec-title-bar {
					padding: 0px 0px 0px 10px;
					background: #E1E1E1;

					--theme-label-title-font-size: 14px;
					--theme-titlebar-min-height: 35px;
					--theme-label-title-font-weight: 600;
				}

				.institute-name {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}

				.list-items {
					margin: 0px;
					padding-inline-start: 20px;
				}

				.agreement {
					padding: 10px;
				}

				.agreement-box {
					padding: 10px;
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="Update PayShap Details">
				<div slot="body">
					<capitec-content-box class="main-container">
						${this._renderCellPhoneNumber()}
						${this._renderPayShapName()}
						${this._renderDefaultInstitution()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderCellPhoneNumber() {
		return html`
			<capitec-text-field 
					label="Cell Phone number"
					value="076 457 5577"
					disabled>
			</capitec-text-field>
		`;
	}

	_renderPayShapName() {
		return html`
			<capitec-text-field 
					label="Enter Shap Name"
					value=""
					hint="Assign a custom name for Payshap ID."
					disabled>
			</capitec-text-field>
		`;
	}

	_renderDefaultInstitution() {
		return html`
			<capitec-label type="title" label="Default institution"></capitec-label>
			<capitec-card class="default-institute">
				<capitec-group layout="horizontal">
					<capitec-label class="institute-name" type="strong" label="Capitec"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label type="strong" label="Set as Capitec"></capitec-label>
					<capitec-toggle 
							label=""
							?checked="${this.defaultInstitute}"
							@click ="${() => this._toggleValue()}"></capitec-toggle>
				</capitec-group>
				${this._renderDisclaimer()}
			</capitec-card>
		`;
	}

	_renderDisclaimer() {
		return this.defaultInstitute
		? html`
			<capitec-card>
				<capitec-title-bar type="clear" label="Disclaimer"></capitec-title-bar>
				<capitec-content-box layout="vertical" noPadding class="agreement-box">
					<ul class="list-items">
						<li><capitec-label label="Capitec will charge you a penalty fee for unlocking before the agreed maturity date"></capitec-label></li>
						<li><capitec-label label="The penalty fee does not reduce the interest you've earned"></capitec-label></li>
						<li><capitec-label label="You may still be liable to pay income tax to SARS on the interest you've earned"></capitec-label></li>
						<li><capitec-label label="Your interest rate may change after an unlock and withdrawal of money"></capitec-label></li>
						<li><capitec-label label="The penalty fee will be deducted from your Capitec Fixed-term Savings Account"></capitec-label></li>
						<li><capitec-label label="The unlock criteria may change at any time and will be determined at Capitec's discretion"></capitec-label></li>
					</ul>
					<capitec-card class="agreement">
						<capitec-check
							label="I agree to the above terms and conditions"
							?checked="${this.agreementAccepted}"
							@value-change="${(e) => this._acceptAgreement(e)}">
						</capitec-check>
					</capitec-card>
				</capitec-content-box>
			</capitec-card>`
		: html``;
	}

	_renderFooter() {
		return html`
			<capitec-button
					label="Cancel"
					@click="${() => this._onCancel()}">
			</capitec-button>

			<capitec-button 
					type="primary"
					label="Save"
					?disabled=${!this.agreementAccepted}
					@click="${() => this._onSave}">
			</capitec-button>
		`;
	}

}
customElements.define(`horizon-pay-shap-update`, PayShapUpdate);