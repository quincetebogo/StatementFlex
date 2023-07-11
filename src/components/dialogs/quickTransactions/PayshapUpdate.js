import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

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

		this.isCapitecBankDefault = false;
		this.agreementAccepted = false;
		this.showAgreement = false;
		this.showWarningModal = false;
		this.removalConfirmed = false;

		this._telemetry = HorizonTelemetry.getInstance();
	}


	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			payShapModalDetails: { type: Object },
			isCapitecBankDefault: { state: true },
			agreementAccepted: { state: true },
			showAgreement: { state: true },
			showWarningModal: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.isCapitecBankDefault = this.payShapModalDetails.isCapitecBankDefault;
		this.defaultInstitutionName = this.payShapModalDetails.defaultInstitution;

		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_DETAILS_TAB);
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD);
		this._telemetry.startSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP);
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD_POP, null, true, true);
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_UPDATE_ON_LOAD, null, true, true);
		this._telemetry.endSpan(QuickTransactionEvents.PAY_SHAP_DETAILS_TAB, null, true, true);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancel() {
		this._telemetry.logEvent(QuickTransactionEvents.PAY_SHAP_UPDATE_DETAILS_CANCEL);

		this.dispatchEvent(new CustomEvent(`on-cancel`, {}));
	}

	_toggleValue() {
		this.isCapitecBankDefault = !this.isCapitecBankDefault;
		this.showAgreement = this.isCapitecBankDefault; 

		this.agreementAccepted = false;
		this.showWarningModal = !this.isCapitecBankDefault;

		this.defaultInstitutionName = this.isCapitecBankDefault ? `CAPITEC` : this.payShapModalDetails.defaultInstitution;
	}

	_acceptAgreement() {
		this.agreementAccepted = !this.agreementAccepted;
	}

	_onSave() {
		this.dispatchEvent(new CustomEvent(`set-capitec-as-defult`));
	}

	_onConfirm() {
		this.dispatchEvent(new CustomEvent(`remove-capitec-as-default`, {}));
	}

	_onRemovalCancel() {
		this.showWarningModal = false;
		this.isCapitecBankDefault = true;
	}

	_onRemovalContinue() {
		this.defaultInstitutionName = `None Assigned`;
		this.removalConfirmed = true;
		this.showWarningModal = false;
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
					padding-top: 10px;
					--theme-input-disabled-background-color: #fbfbfb;
					--theme-input-disabled-font-color: #B4B4B4;
					--theme-input-label-font-color: #7C7C7C;
					--theme-input-hint-font-color: #3A3A3A;
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
				}
				.warning-modal{
					--theme-modal-free-max-width: 500px;
					--theme-modal-free-max-height: 400px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 31px;
					--theme-modal-header-padding-left: 31px;
				}
				.warning-header {
					width: 341px;
					height: auto;
					position: absolute;
					display: flex;
					align-items: center;
					left: -464px;
					top: -11px;
					--theme-modal-header-height: 64px;
				}
				.warning-label {
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
				}
				.warning-modal > div[slot="body"] {
					height: 268px;
					width: 500px;
				}
				.warning-body > capitec-content-box > capitec-label {
					--theme-label-default-font-size: 16px;
					--theme-label-default-font-weight: 400;
					margin-bottom: 24px;
				}
				capitec-alert-banner {
					--theme-toast-box-shadow: none;
					--theme-toast-width: 664px;
					--theme-toast-border-radius: 0px;
				}
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
						${this._renderAlertBanner()}
						${this._renderCellPhoneNumber()}
						${this._renderDefaultInstitution()}
					</capitec-content-box>
				</div>
				<div slot="footer" class="footer-class">
					${this._renderFooter()}
				</div>
			</capitec-modal>
			${this._renderWarningModal()}
		`;
	}

	_renderAlertBanner() {
		return !isNullorEmpty(this.payShapModalDetails.defaultInstitution) && !this.payShapModalDetails.isCapitecBankDefault
		? html`
			<capitec-alert-banner 
				type="warning" 
				header="Notify client:" 
				label="To set Capitec as your main bank, please first de-list with your current main bank." 
				layout="vertical">
			</capitec-alert-banner>`
		: html``;
	}

	_renderCellPhoneNumber() {
		return html`
			<capitec-text-field 
					label="Verfied Phone number"
					value="${this.payShapModalDetails.verifiedCellphoneNumber}"
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
			<capitec-label type="title" label="Main Bank"></capitec-label>
			<capitec-card class="default-institute">
				<capitec-group layout="horizontal">
					<capitec-label class="institute-name" type="strong" label="${isNullorEmpty(this.defaultInstitutionName) ? `None Assigned` : this.defaultInstitutionName}"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label type="strong" label="Set as Capitec"></capitec-label>
					<capitec-toggle 
						label=""
						?checked="${this.isCapitecBankDefault}"
						@click ="${() => this._toggleValue()}"
						?disabled=${!isNullorEmpty(this.payShapModalDetails.defaultInstitution) && !this.payShapModalDetails.isCapitecBankDefault}>
					</capitec-toggle>
				</capitec-group>
				${this._renderDisclaimer()}
			</capitec-card>
		`;
	}

	_renderDisclaimer() {
		return this.showAgreement && !this.payShapModalDetails.isCapitecBankDefault
		? html`
			<capitec-card>
				<capitec-title-bar type="clear" label="Disclaimer"></capitec-title-bar>
				<capitec-content-box layout="vertical" noPadding class="agreement-box">
					<ul class="list-items">
						<li><capitec-label label="Capitec Bank will not charge you for setting Capitec Bank as the default bank for PayShap."></capitec-label></li>
						<li><capitec-label label="Capitec Bank will only charge you the fees associated with the payment instruction sent through PayShap."></capitec-label></li>
						<li><capitec-label label="Your ShapID will be your registered cell phone number @capitec."></capitec-label></li>
						<li><capitec-label label="All payment instructions sent through PayShap will be credited to your global one savings account."></capitec-label></li>
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

	_renderWarningModal() {
		return this.showWarningModal && this.payShapModalDetails.isCapitecBankDefault
		? html`
		<capitec-modal type="free" class="warning-modal" header-align="left">
			<div slot="header" class="warning-header">
				<span>
					<capitec-group layout="horizontal">
						<img class="status-icon" src="/images/statusIcons/horizon-warning-trans.svg"/>
						<capitec-label class="warning-label" label="Warning"></capitec-label>
					</capitec-group>
				</span>
			</div>
			<div slot="body" class="warning-body">
				<capitec-content-box>
					<capitec-label label="You are about to remove Capitec Bank as the default institution for payshap."></capitec-label>
					<capitec-label label="Do you wish to continue?"></capitec-label>
				</capitec-content-box>
			</div>
			<div slot="footer">
				<capitec-group layout="horizontal">
					<capitec-button 
							data-automation-id=""
							id="id-cancel-button"
							label="Cancel" 
							@click="${() => this._onRemovalCancel()}">
					</capitec-button>

					<capitec-button 
							data-automation-id=""
							id="id-discard-button" 
							type="primary" 
							label="Continue" 
							@click="${() => this._onRemovalContinue()}">
					</capitec-button>
				</capitec-group>
			</div>
		</capitec-modal>`
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
					?disabled="${!this.agreementAccepted}"
					?hidden="${this.payShapModalDetails.isCapitecBankDefault || !isNullorEmpty(this.payShapModalDetails.defaultInstitution)}"
					@click="${() => this._onSave()}">
			</capitec-button>

			<capitec-button 
					type="primary"
					label="Confirm"
					?disabled="${!this.removalConfirmed || this.isCapitecBankDefault}"
					?hidden="${!this.payShapModalDetails.isCapitecBankDefault && !this.payShapModalDetails.defaultInstitution}"
					@click="${() => this._onConfirm()}">
			</capitec-button>
		`;
	}

}
customElements.define(`horizon-pay-shap-update`, PayShapUpdate);