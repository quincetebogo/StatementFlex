import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonExpander';
import 'app/components/common/HorizonEmailInput';
import 'app/components/common/HorizonExpanderNoAnimations';


const RENDER_MODE = Object.freeze({
	EMAIL: 0,
	PDF: 1
});

const TAX_CERTIFICATE_STEPS = [
	{
		title: `Choose Certificate Type and Period`
	},
	{
		title: `Specify Email and View Certificates`
	}
];

const CERTIFICATE_TYPE = {
	'iT3STaxCertificates': { type: `IT3(s)`, displayName: `tax-free` },
	'iT3BTaxCertificates': { type: `IT3(b)`, displayName: `taxable savings` }
};

const ERROR_MESSAGE = {
	CERT_TYPE: `Please choose an option`,
	DOCUMENT_TYPE: `Choose a period`,
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Enter the correct email address`
};

/**
 * Tax Certificates dialog is used to send tax certificates from the primary savings account.
 * This component is envoked from the Favourites landing screen.
 * 
 * Event Raised
 * -------------
 * cancel
 * email client
 * 
 * @export
 * @class TaxCertificate
 * @extends {Component}
 */

export class TaxCertificates extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.currentStep = 0;
		this.renderMode = RENDER_MODE.EMAIL;
		this.encodedPDF = ``;
		this.email = ``;
		this.confirmEmail = ``;
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};
		this.emailLabel = `Enter email address`;
		this.confirmEmailLabel = `Confirm email`;
		this.selectedCertType = null;
		this.selectedCertificates = {};
		this.disableNext = false;
		this.taxCertType = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {taxCertificateDetails} taxCertificateDetails Object contains list of tax certificates
	 * @property {string} registeredEmailId Client's registered email ID
	 */

	static get properties() {
		return {
			taxCertificateDetails: { type: Object },
			getTaxCertificatePDFCallback: { type: Object },
			getIT3BContentData: { type: Object },
			taxCertType: { type: String },
			registeredEmailId: { type: String },

			// Private Properties
			currentStep: { state: true },
			renderMode: { state: true },
			errorMessage: { state: true },
			emailError: { state: true },
			confirmEmailError: { state: true },
			selectedCertType: { state: true },
			selectedCertificates: { state: true },
			alertBannerMessage: { state: true },
			emailText: { state: true },
			email: { state: true },
			confirmEmail: { state: true },
			disableNext: { type: Boolean, attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialize();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_selectedCertificateTypeChanged(e) {
		if (e.detail.new) {
			this.alertBannerMessage = ``;
			this.selectedCertType = e.target.id;
			this.selectedCertificates = {};
			this.disableNext = this.selectedCertType === `both`
								? this.taxCertificateDetails.iT3BTaxCertificates.length + this.taxCertificateDetails.iT3STaxCertificates.length === 0
								: this.taxCertificateDetails[this.selectedCertType].length === 0;
		}
	}

	_selectedTaxPeriodChanged(e, checkBoxDetails, certType) {
		this.selectedCertificates[certType] = this.selectedCertificates[certType] || [];

		if (e.detail.new) {
			this._selectCertificate(checkBoxDetails, certType);
			this.requestUpdate();
			return;
		}
		
		this.selectedCertificates[certType].splice(this.selectedCertificates[certType].indexOf(checkBoxDetails), 1);
		this.requestUpdate();
	}

	_backClick() {
		this.errorMessage = ``;
		this.currentStep--;
		
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_sendClick() {
		const isValid = this._validateEmailAddress();

		if (!isValid) {
			return false;
		}

		this.dispatchEvent(new CustomEvent(`send`, {
			detail: {
				email: this.email,
				selectedCertificates: this.selectedCertificates,
				selectedCertType: this.selectedCertType
			}
		}));

	}

	_cancelClick(e) {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_close() {
		this.renderMode = RENDER_MODE.EMAIL;
		this.dispatchEvent(new CustomEvent(`close`, {}));
	}

	async _nextClick() {
		if (isNullorEmpty(this.selectedCertType)) {
			this.alertBannerMessage = ERROR_MESSAGE.CERT_TYPE;
			return;
		} 

		const iTBsSelected = this.selectedCertificates.iT3BTaxCertificates && this.selectedCertificates.iT3BTaxCertificates.length;
		const iTSsSelected = this.selectedCertificates.iT3STaxCertificates && this.selectedCertificates.iT3STaxCertificates.length;
		
		if (!iTBsSelected && !iTSsSelected) {
			this.alertBannerMessage = ERROR_MESSAGE.DOCUMENT_TYPE;
			return;
		}

		this.currentStep++;
		await this.getIT3BContentData(this.selectedCertificates);

		if (this.selectedCertificates.iT3BTaxCertificates !== undefined) {
			this.selectedCertificates.iT3BTaxCertificates.sort((l, r) => r.year - l.year);
		}

		if (this.selectedCertificates.iT3STaxCertificates !== undefined) {
			this.selectedCertificates.iT3STaxCertificates.sort((l, r) => r.year - l.year);
		}
		
		this.selectedCertificates = Object.fromEntries(Object.entries(this.selectedCertificates).filter(([_, item]) => item !== 0));
		
		this.dispatchEvent(new CustomEvent(`next`, { 
			detail: {
				selectedCertType: this.selectedCertType,
				selectedCertificates: this.selectedCertificates
				}
			}));
	}

	// Only single expander to be seen as expanded at a time
	_onExpanded(e) {
		e.detail.expanderGroup(this);
	}

	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.alertBannerMessage = ERROR_MESSAGE.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_MISMATCH;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_initialize() {
		if (!isNullorEmpty(this.taxCertType)) {
			this.selectedCertType = this.taxCertType;
		}
	}

	_selectCertificate(checkBoxDetails, certType) {
		if (this._isInSelectedCertificates(this.selectedCertificates[certType], checkBoxDetails)) {
			return;
		}

		this.alertBannerMessage = ``;
		this.selectedCertificates[certType].push(checkBoxDetails);
	}

	_isInSelectedCertificates(selectedCertificate, checkBoxDetails) {
		return selectedCertificate.indexOf(checkBoxDetails) !== -1;
	}

	_isLeapYear(year) {
		return year % 100 === 0 ? year % 400 === 0 : year % 4 === 0;
	}

	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.alertBannerMessage = ERROR_MESSAGE.EMAIL_REQUIRED;
		}

		return isNullorEmpty(this.alertBannerMessage);
	}

	_getHeaderTitle() {
		return this.renderMode === RENDER_MODE.PDF ? `View Document` : `Tax Certificate`;
	}

	_getStepperVisibility() {
		return this.renderMode === RENDER_MODE.PDF;
	}

	async _viewPDF(item, type) {
		this.encodedPDF = await this.getTaxCertificatePDFCallback(item, type);

		if (this.encodedPDF) {
			this.renderMode = RENDER_MODE.PDF;
		} else {
			this.errorMessage = `Tax certificates are currently unavailable`;
			this.alertBannerMessage = `Notify client: Tax certificates are currently unavaialble`;
		}
	}

	_clearAlerts() {
		this.alertBannerMessage = ``;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				bb-stepper-modal {
					--theme-modal-header-height: 64px;
					--theme-modal-header-font-size: 18px;
					--theme-modal-header-padding-left: 16px;
					--theme-modal-header-color: #3A3A3A;
					--theme-modal-header-background-color: #F7F7F7;
					--theme-stepper-inner-step-container-width: 324px;
					--theme-stepper-step-title-font-style: 'Hind Vadodara SemiBold';
					--theme-stepper-step-title-font-size: 15px;
					--theme-stepper-step-title-max-width: 328px;
					--theme-wizard-modal-max-width: 896px;
					--theme-wizard-modal-max-height: 953px;
					--theme-modal-footer-padding: 0px;
				}
				.main-cb {
					height: auto;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-bottom: 16px;
				}
				.main-cb > capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 12px;
					--theme-layout-gap-spacing: 20px;
				}
				div[slot="step"] {
					height: 100%;
					max-height: var(--theme-wizard-modal-max-height, 826px);

					--theme-layout-gap-spacing: 0px;
				}
				capitec-stepper {
					--theme-stepper-step-title-font-color: #3A3A3A;
					--theme-font-weight: 600;
					--theme-stepper-inner-step-container-width: 448px;
				}
				.taxCertTitle {
					margin-bottom: 8px;
				}
				capitec-radio-group {
					margin-top: 12px;
					--theme-layout-gap-spacing: 12px;
				}
				capitec-radio-group > capitec-group {
					margin: 0px;
				}
				capitec-radio {
					--theme-label-font-weight: 500;
					--theme-label-font-size: 16px;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-color: #3a3a3a;
					margin-right: 32px;
				}
				horizon-label > .label-text {
					font-weight: 600;
				}
				horizon-label > {
					font-weight: 500;
				}
				.expander-header > horizon-label {
					width: 156px;
					height: auto;
					font-weight: 300;
					justify-content: left;
					padding: 0px 0px 0px 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 20px;
					--horizon-label-text-color:#3A3A3A;
				}
				.expander {
					width: 50px;
				}
				.available-cards {
					--theme-layout-gap-spacing: 16px;
				}
				.view-document-tile {
					width: 100%;
				}
				capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				capitec-label[type="title"] {
					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
				}
				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
				}
				.main-cb > capitec-label[type="subtitle"] {
					line-height: 24px;

					--theme-label-subtitle-font-size: 18px;
					--theme-label-subtitle-font-weight: 600;
					--theme-layout-gap-spacing: 16px;
				}
				.pdf-viewer {
					height: 100%;
					width: 100%;
					background-color: #FFFFFF;
				}
				.pdf-cb {
					height: inherit;
					padding-right: inherit;   
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 16px; 
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 0px
				}
				.footer {
					width: var(--horizon-tax-certificate-modal-footer-width, 100%);
					
					--theme-container-padding-left: 16px;
					--theme-container-padding-top: 8px;
					--theme-container-padding-right: 16px;
					--theme-container-padding-bottom: 8px;
					border-top: 1px solid #E1E1E1;
				}
				.check-box-label {
					width: 156px;
					justify-content: left;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-font-weight: 600;

					--horizon-label-value-height: 20px;
					--horizon-label-value-font-size: 14px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 20px;

					--horizon-label-text-color:#3A3A3A;
				}
				horizon-expander-noanime {
					--theme-layout-gap-spacing: 16px;
					--theme-expander-indicator-width: 13px;
					--theme-expander-header-height: 64px;
					height: auto;
				}
				horizon-expander {
					--theme-layout-gap-spacing: 16px;
					--theme-expander-indicator-width: 13px;
					--theme-expander-header-height: 64px;
					height: auto;
				}
				.choose-period-header {
					margin: 16px 0px;
				}
				capitec-button {
					--theme-layout-gap-spacing: 0px;
				}
				.next-btn {
					margin-left: 16px;
				}
				.expander-details > horizon-label {
					padding: 12px 0px;
					--horizon-label-value-height: 20px;
					--horizon-label-text-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 15px;
					--horizon-label-value-font-weight: 600;
				}
				.expander-content {
					padding: 14px 14px 8px 16px;
					background-color: #F7F7F7;
					height: auto;
				}
				.expander-content > capitec-label {
					margin-bottom: 16px;
					--theme-label-default-font-size: 14px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.notify-banner {
					margin-bottom: 7px;
				}
				.notify-banner > p {
					margin: 0px;
					font-size: 14px;
				}
				.notify-banner > p > b {
					color: #08A6B5;
				}
				.notify-banner > capitec-icon {
					margin-right: 7px;
					height: 26px;
					width: 26px
				}
				horizon-expander[checked] {
					--theme-expander-background-color: rgba(0,157,224,0.1);
				}
				.seperator {
					width: 100%;
					border: 0.01em solid #E1E1E1;
					margin-bottom: 30px;
					margin-top: 10px;
				}
				capitec-content-box > .contnent[slot="content"] {
					height: auto;
				}
				.no-results {
					margin-top: 88px;
				}
				capitec-image {
					height: 182px;
					width: 252px;
				}
				.no-results > capitec-label[type="strong"] {
					line-height: 32px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-strong-font-size: 24px;
					--theme-label-strong-font-weight: 600;
				}
				capitec-label[type="default"] {
					--theme-label-default-font-size: 16px;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
		<bb-stepper-modal
			data-automation-id="tax-certificate"
			header="${this._getHeaderTitle()}"
			.steps="${TAX_CERTIFICATE_STEPS}"
			current-active-step="${this.currentStep}"
			.hideStepper="${this._getStepperVisibility()}">
				<div slot="step">
					${this._renderContent()}
				</div>

				<div slot="footer">
					${this._renderFooter()}
				</div>
		</bb-stepper-modal>
		`;
	}

	_renderAlertBanner() {
		return !isNullorEmpty(this.alertBannerMessage)
			? html`
				<capitec-alert-banner 
					data-automation-id="tax-certificate-alert-banner"
					type="unsuccessful-red" 
					closable>
					<p><b>Notify:</b> ${this.alertBannerMessage}</p>
				</capitec-alert-banner>`
			: html``;
	}

	_renderContent() {
		switch (this.renderMode) {
			case RENDER_MODE.PDF:
				return html`
					${this._renderPDFViewer()}`;
			case RENDER_MODE.EMAIL:
			default:
				return html`
					<capitec-content-box
						class="main-cb"
						layout="vertical"
						gap="clear"
						?noScroll="${true}">
							${this._renderAlertBanner()}
							${this._renderChooseCertificate()}
							${this._renderCertificateTypes()}
							${this._renderEmail()}
					</capitec-content-box>`;
		}
	}

	_renderChooseCertificate() {
		return this.currentStep === 0 ? html`
			<capitec-label 
				type="title"
				label="Choose a certificate type"
				class="taxCertTitle">
			</capitec-label>
			<capitec-radio-group>
				<capitec-group layout="horizontal" gap="none" halign="left" valign="center" noPadding>
					<capitec-radio 
						id="iT3BTaxCertificates"
						?checked=${this.selectedCertType === `iT3BTaxCertificates`}
						data-automation-id="tax-certificate-taxable-savings"
						label="Taxable Savings IT3(b)"
						@value-changed="${(e) => this._selectedCertificateTypeChanged(e)}"
						row="1" column="1">
						</capitec-radio>
					<capitec-radio 
						id="iT3STaxCertificates" 
						?checked=${this.selectedCertType === `iT3STaxCertificates`}
						data-automation-id="tax-certificate-tax-free"
						label="Tax-free IT3(s)"
						@value-changed="${(e) => this._selectedCertificateTypeChanged(e)}"
						column="2">
						</capitec-radio>
					<capitec-radio 
						id="both" 
						?checked=${this.selectedCertType === `both`}
						data-automation-id="tax-certificate-both"
						label="Both"
						@value-changed="${(e) => this._selectedCertificateTypeChanged(e)}"
						column="3"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		` : html``;
	}
	
	_renderCertificateTypes() {

		if (this.disableNext) {
			return html`${this._renderNoResults()}`;
		}
	
		switch (this.selectedCertType) {
			case `iT3BTaxCertificates`:
				return html`${this._renderChoosePeriod(`iT3BTaxCertificates`)}`;
			case `iT3STaxCertificates`:
				return html`${this._renderChoosePeriod(`iT3STaxCertificates`)}`;
			case `both`:
				return html`${this._renderChoosePeriod(`iT3BTaxCertificates`)}
							${this._renderChoosePeriod(`iT3STaxCertificates`)}`;
			default:
				return html``;
		}
	}

	_renderNoResults() {
		return html`
			<capitec-group
				layout="vertical"
				gap="clear"
				halign="center"
				valign="top"
				class="no-results">
					<capitec-image alt="No results" src="/images/tax-certificate/send-tax-certificate.svg">
					</capitec-image>
					<capitec-label label="No results found" type="strong">
					</capitec-label>
			</capitec-group>`;
	}
	
	_renderEmail() {
		if (this.currentStep === 1 && this.renderMode === RENDER_MODE.EMAIL) {
			return html`
				<horizon-email-input
					labelOne="${this.emailLabel}"
					labelTwo="${this.confirmEmailLabel}"
					email="${this.email}"
					confirmEmail="${this.confirmEmail}"
					registeredEmailId="${this.registeredEmailId}"
					?showRequiredError="${this.alertBannerMessage === ERROR_MESSAGE.EMAIL_REQUIRED}"
					.callBack="${() => this._clearAlerts()}"
					@value-changed="${(e) => this._emailValueChanged(e)}">
				</horizon-email-input>

				<hr class="seperator">

				${this._renderViewTaxcertificate()}
			`;
		}
	}

	_renderChoosePeriod(certificateType) {
		const data = this.taxCertificateDetails[certificateType];

		return this.currentStep === 0 && this.selectedCertType
			? html`
				<capitec-label
					data-automation-id="tax-certificate-header-type"
					class="choose-period-header"
					label="Choose Period (${CERTIFICATE_TYPE[certificateType].displayName})"
					type="title">
				</capitec-label>
				
				${data.length > 0
					? data.map(item => this._renderCertificateYears(item, certificateType))
					: html`<capitec-label label="No results found" type="default"></capitec-label>`
				}`
			: html``;
	}

	_renderCertificateYears(item, certType) {
		if (certType === `iT3STaxCertificates`) {
			return html`
				<horizon-expander-noanime
					id="tax-expander"
					data-automation-id="tax-certificate-document-period"
					expandButtonAlignment="right"
					inputType = "Checkbox"
					@value-change="${(e) => this._selectedTaxPeriodChanged(e, item, certType)}"
					?selected = "${this.selectedCertificates[certType] && this.selectedCertificates[certType].indexOf(item) !== -1}"
					@expand="${(e) => this._onExpanded(e)}"
					?disabled = "${!item.isTaxYearAvailable}">
						<capitec-group slot="custom-header" layout="horizontal" gap="none" halign="left" valign="center">
							<horizon-label
								class="check-box-label"
								label="${item.year}"
								value="${CERTIFICATE_TYPE[certType].type} ${item.isTaxYearAvailable ? `Available` : `Unavailable`}">
							</horizon-label>
						</capitec-group>
						${this._renderOnlyIt3BExpanders(item, certType)}
				</horizon-expander-noanime>`;
		}
		return html`
				<horizon-expander
					id="tax-expander"
					data-automation-id="tax-certificate-document-period"
					expandButtonAlignment="right"
					inputType = "Checkbox"
					@value-change="${(e) => this._selectedTaxPeriodChanged(e, item, certType)}"
					?selected = "${this.selectedCertificates[certType] && this.selectedCertificates[certType].indexOf(item) !== -1}"
					@expand="${(e) => this._onExpanded(e)}"
					?disabled = "${!item.isTaxYearAvailable}">
						<capitec-group slot="custom-header" layout="horizontal" gap="none" halign="left" valign="center">
							<horizon-label
								class="check-box-label"
								label="${item.year}"
								value="${CERTIFICATE_TYPE[certType].type} ${item.isTaxYearAvailable ? `Available` : `Unavailable`}">
							</horizon-label>
						</capitec-group>
						${this._renderOnlyIt3BExpanders(item, certType)}
				</horizon-expander>`;
	}

	_renderOnlyIt3BExpanders(item, certType) {
		if (certType === `iT3STaxCertificates`) {
			return html``;
		}

		
		return html`
			<capitec-content-box 
				data-automation-id="tax-certificate-document-details"
				class="expander-content" 
				slot="content">
				${this._renderCertificateDetails(item, certType)}
			</capitec-content-box>`;
	}

	_renderCertificateDetails(item, certType) {
		const count = item.taxCertificateAccounts.length;

		return html`
			<capitec-label label="Overview (${count} ${count > 1 ? `accounts` : `account`})"></capitec-label>
			
			<capitec-group class="notify-banner" layout="horizontal">
				<capitec-icon
					size="default"
					icon="status/info-trans">
				</capitec-icon>
				<p><b>Notify Client: </b>Interest received on investments from 1 Mar ${item.year - 1} to ${this._isLeapYear(item.year) ? 29 : 28} Feb ${item.year}. Balance of accounts at ${this._isLeapYear(item.year) ? 29 : 28} Feb ${item.year}</p>
			</capitec-group>

			<!-- TO DO: Expander content can be made to render dynamically while impelmenting CS call.  -->
			<capitec-group class="expander-details" layout="grid" gap="none" columns="4" rows="2">
				${item.taxCertificateAccounts.map((account, index) => this._renderExpanderRow(account, index))}
			</capitec-group>
		`;
	}

	_renderExpanderRow(item, rowNum) {
		return html`
			<horizon-label row="${rowNum}" column="1" colspan="1" rowspan="1"
				label="${item.accountNumber.toString().startsWith(`6`) ? `Credit Account` : `Savings Account`}"
				value="${item.accountNumber}">
			</horizon-label>
			<horizon-label row="${rowNum}" column="2" colspan="1" rowspan="1"
				label="Balance"
				value="R ${item.balance}">
			</horizon-label>
			<horizon-label row="${rowNum}" column="3" colspan="1" rowspan="1"
				label="Interest received"
				value="R ${item.interestReceived}">
			</horizon-label>
			<horizon-label row="${rowNum}" column="4" colspan="1" rowspan="1"
				label="Status"
				value="${isNullorEmpty(item.accountStatus) || item.accountStatus === `UNKNOWN` ? `-` : item.accountStatus}">
			</horizon-label>
		`;
	}

	_renderViewTaxcertificate() {
		return Object.keys(this.selectedCertificates).map(certType => html`
				<capitec-label
					class="tax-certificate-heading"
					type="subtitle"
					label="View ${certType === `iT3BTaxCertificates` ? `taxable savings` : `tax-free`} certificate(s)">
				</capitec-label>
				<capitec-group
					class="available-cards"
					valign="top"
					halign="left"
					gap="clear"
					layout="vertical">
					${this._renderViewCertificateTile(certType)}
			</capitec-group>`);
	}

	_renderViewCertificateTile(certType) {
		return this.selectedCertificates[certType].map(certInfo => html`
				<horizon-product-tile
					data-automation-id="tax-certificate-dialog-view-document"
					class="view-document-tile"
					type="default"
					label="${certInfo.year}"
					subtitle="${certType === `iT3BTaxCertificates` ? `IT3(b)` : `IT3(s)`} ${certInfo.isTaxYearAvailable ? `Available` : `Unavailable`}"
					@click="${() => this._viewPDF(certInfo, certType)}">
					${this._renderViewDocumentLink()}
				</horizon-product-tile>`);
		
	}

	_renderViewDocumentLink() {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View certificate">
			</capitec-label>
		`;
	}

	_renderFooter() {
		return html`
		<capitec-button-bar 
		class="footer"
		layout="horizontal"
		gap="clear">
			<capitec-button
				type="clear"
				label="Back"
				@click="${() => this._backClick()}"
				?hidden="${this.currentStep === 0 || this.renderMode === RENDER_MODE.PDF}">
			</capitec-button>
			<capitec-spacer></capitec-spacer>
			<capitec-button
				data-automation-id="tax-certificate-dialog-cancel"
				class="cancel-button"
				type="secondary"
				label="Cancel"
				@click="${() => this._cancelClick()}"
				?hidden="${this.renderMode === RENDER_MODE.PDF}">
			</capitec-button>
			<capitec-button
				class="next-btn"
				type="primary" 
				label="Next"
				@click="${() => this._nextClick()}"
				?hidden="${this.currentStep === 1 || this.renderMode === RENDER_MODE.PDF}"
				.disabled="${this.disableNext}">
			</capitec-button>
			<capitec-button
				data-automation-id="tax-certificate-dialog-send"
				type="primary"
				label="Send"
				@click="${() => this._sendClick()}"
				?hidden="${this.currentStep !== 1 || this.renderMode === RENDER_MODE.PDF}">
			</capitec-button>
			<capitec-button
				data-automation-id="tax-certificate-dialog-close"
				type="primary"
				label="Close"
				@click="${() => this._close()}"
				?hidden="${this.renderMode !== RENDER_MODE.PDF}">
			</capitec-button>
		</capitec-button-bar>
		`;
	}

	_renderPDFViewer() {
		return html`
			<capitec-content-box
				data-automation-id="tax-certificate-dialog-pdf-viewer"
				class="pdf-cb"
				layout="vertical"
				gap="clear"
				?noScroll="${false}">
					<object
						class="pdf-viewer"
						data="${this.encodedPDF}"
						type="application/pdf">
					</object>
			</capitec-content-box>
		`;
	}
}

customElements.define(`capitec-pc-tax-certificate`, TaxCertificates);