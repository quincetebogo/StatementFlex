import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger, NavigationContext } from 'platform/core';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { base64ToBlobUrl, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';
import 'app/components/common/HorizonEmailInput';

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
	DOCUMENT_TYPE: `Choose a period`
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

export class TaxCertificate extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.navigationContext = NavigationContext.getInstance();

		this.currentStep = 0;
		this.renderMode = RENDER_MODE.EMAIL;
		this.encodedPDF = ``;
		this.logger = Logger.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.email = ``;
		this.confirmEmail = ``;
		this.mailClientError = {
			email: ``,
			confirmEmail: ``
		};
		this.emailLabel = `Email address`;
		this.confirmEmailLabel = `Confirm email address`;
		this.selectedCertType = null;
		this.selectedCertificates = {};
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		
		this._telemetry = HorizonTelemetry.instance;

	/* This.availableCert = {
			taxableSavings: [
				{ year: `2014`, status: `Available` },
				{ year: `2015`, status: `Available` },
				{ year: `2016`, status: `Available` },
				{ year: `2017`, status: `Unavailable` }
				],
			taxFree: [
				{ year: `2018`, status: `Available` },
				{ year: `2019`, status: `Available` },
				{ year: `2020`, status: `Available` },
				{ year: `2021`, status: `Available` }
			]
		};*/

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} cards Object contains the list of client's card
	 * @param {object} callerInformation Identified caller information
	 * @param {Object} landingPageInfo Favourites landing page info
	 * @param {Object} clientDetails Tac certificates client info
	 * @property {getTaxCertificateDocument} getTaxCertificateDocument Callback function to get tax certificate document
	 * @property {taxCertificateDetails} taxCertificateDetails Object contains list of tax certificates
	 */

	static get properties() {
		return {
			cards: { type: Object },
			currentStep: { attribute: false },
			renderMode: { attribute: false },
			callerInformation: { type: Object },
			getTaxCertificateDocument: { type: Object, attribute: false },
			landingPageInfo: { type: Object },
			taxCertificateDetails: { type: Object },
			errorMessage: { attribute: false },
			emailError: { attribute: false },
			confirmEmailError: { attribute: false },
			selectedCertType: { type: String },
			selectedCertificates: { attribute: false, 
										type: Object },
			isBusy: { attribut: false },
			alertBannerMessage: { attribute: false },
			emailText: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});
	}

	disconnectedCallback() {
		
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.FAVOURITES
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	_back() {

		// Telemetry
		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_BACK, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});
		
		this.selectedCertificates = {};
		
		this.errorMessage = ``;
		this.currentStep--;
	}

	_isLeapYear(year) {
		let day = 1;
		if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
			day = 29;
		} else {
			day = 28;
		}
		return day;
	}

	toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_certChange(e) {
		if (e.detail.new) {
			this.alertBannerMessage = ``;
			this.selectedCertType = e.target.id;
		}
	}

	_onValueChange(e, checkBoxDetails, certType) {
		this.selectedCertificates[certType] = [];
		if (e.detail.new) {
			this.alertBannerMessage = ``;
			this.selectedCertificates[certType].push(checkBoxDetails);
		} else {
			this.selectedCertificates[certType].splice(this.selectedCertificates[certType].indexOf(checkBoxDetails), 1);
		}
		this.requestUpdate();
	}

	async _sendClick(e) {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {

			this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_SEND, {
				"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
				"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME
			});

			// saving 'emailAddress' and 'accountNumber' in state.
			this._updateScreenDetails();

			const requestInfo = {
				"cif": this.callerInformation.cifNumber,
				"emailAddress": this.idEmailAddress,
				"documentIds": [
							`${this.clientDetails.iT3BTaxCertificates.documentId}`,
							 `${this.clientDetails.iT3BTaxCertificates.documentId}`
							],
  				"messageParameters": {
   				"title": this.clientDetails.title,
				"surname": this.clientDetails.surname
				},
				"attachments": [
				{
					"name": this.clientDetails.name,
					"data": this.clientDetails.contentData
				}
				]
			};
			
			const resultValue = await this.quickTransactionService.sendTaxCertificate(requestInfo);

			this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_SELECT_SEND, {
				"screen": TelemetryScreen.TAX_CERTIFICATE,
				"next-screen": returnValue.succeeded ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
			});
			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `tax-certificate`);

		}
	}

	async _cancelClick(e) {
		
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_CANCEL, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_close() {
		this.renderMode = RENDER_MODE.EMAIL;
		// Telemetry
		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_CLOSE_PDF, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});

	}

	_nextClick() {
		if (isNullorEmpty(this.selectedCertType)) {
			this.alertBannerMessage = ERROR_MESSAGE.CERT_TYPE;
			return false;
		} else if (isNullorEmpty(this.selectedCertificates[this.selectedCertType])) {
			this.alertBannerMessage = ERROR_MESSAGE.DOCUMENT_TYPE;
			return false;
		}
		
		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_NEXT, {
		
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": null,

			"certificate-type": this.selectedCertType,
			// TODO: Add selected certificate types when CS is implemented
			"selected-documents": [
				{ "document-type": null,
				"certificate-period": null },
				{ "document-type": null,
				"certificate-period": null }
			]
		});
		this.currentStep++;
		return this.selectedCertificates[this.selectedCertType];
	}


	// Only single expander to be seen as expanded at a time
	_onExpanded(e) {
		e.detail.expanderGroup(this);
	}

	_onEmailValueChange(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;
	}

	_validEmailAddressCheck(e) {
		this.errorMessage = e.detail.errorMessage;
		this.mailClientError.email = e.detail.emailError;
		this.mailClientError.confirmEmail = e.detail.confirmEmailError;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	
	_validateEmailAddress() {
		this.mailClientError.email = isNullorEmpty(this.email) ? `Please enter email` : ``;
		this.mailClientError.confirmEmail = isNullorEmpty(this.confirmEmail) ? `Please enter email` : ``;

		const errorMessage = this.mailClientError.email || this.mailClientError.confirmEmail ? `Complete all fields.` : ``;
		return errorMessage === ``;
	}

	_onKeyPress(e) {
		this._clearErrors(e);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_getHeaderTitle() {
		return this.renderMode === RENDER_MODE.PDF ? `View Document` : `Tax Certificate`;
	}

	_getStepperVisibility() {
		return this.renderMode === RENDER_MODE.PDF;
	}

	_clearErrors(e) {
        this.errMessage.idEmailAddress = ``;
        this.errMessage.idConfirmEmail = ``;
		this.alertBannerMessage = ``;
		this.emailText = `Email address`;
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors(e);
		this.emailText = `Email address`;
	}

	_updateScreenDetails() {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = this.idEmailAddress;
		
		this.horizonStore.setScreenDetails(screenDetails);
	}

	async _viewPDF() {
		// Telemetry
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_VIEW_DOCUMENT, { 
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
		});
		
		const taxCertificateRequest = {
			"cif": this.callerInformation.cifNumber,
			"iT3BTaxCertificates": [
			  {
				"year": this.clientDetails.iT3BTaxCertificates.year,
				"documentId": this.clientDetails.iT3BTaxCertificates.documentId,
				"accountNumber": this.clientDetails.iT3BTaxCertificates.accountNumber,
				"payload": this.clientDetails.iT3BTaxCertificates.payload
			  }
			],
			"iT3STaxCertificates": [
			  {
				"year": this.clientDetails.iT3STaxCertificates.year,
				"documentId": this.clientDetails.iT3STaxCertificates.documentId,
				"accountNumber": this.clientDetails.iT3STaxCertificates.accountNumber
			  }
			]
		};

		const result = await this.getTaxCertificateDocument(taxCertificateRequest);

		if (result) {
			this.renderMode = RENDER_MODE.PDF;
			// render the PDF
			this.encodedPDF = base64ToBlobUrl(result.taxCertificateData);
			// Telemetry
			this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_VIEW_PDF, { 
				"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
			});
		} else {
			this.errorMessage = `Tax ${this.selectedCertType.Count > 1 ? html`certificates are` : html`certificate is`} currently unavailble`;
			this.alertBannerMessage = `Notify client: Tax ${this.selectedCertType.Count > 1 ? html`certificates are` : html`certificate is`} currently unavailble`;
			this.horizonRouter.navigateToTaxCertificateUnavailable();
		}
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
				--theme-container-padding-bottom: 0px;
				
			}
			.main-cb > capitec-alert-banner {
				--theme-alert-banner-height: 48px;
				--theme-alert-banner-icon-margin-left: 16px;
    			--theme-alert-banner-icon-margin-right: 12px;
				--theme-layout-gap-spacing: 20px;
			}
			div[slot="step"]{
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
				margin-bottom: 12px;
			}
			capitec-radio-group > capitec-group{
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
				height: 100%;
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

			.expander{
				width: 50px;
			}

			.tax-certificate-bar > capitec-group {
				width: 100%;
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				border-right: 1px solid #dfdfdf;
			}

			.tax-certificate-bar {
				display: flex;
				position: relative;
			}

			.check-details {
				margin-left: 8px; 
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

			capitec-label[type="title"]{
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
			.check-details {
				margin-left: 8px; 
			}

			horizon-expander{
				--theme-layout-gap-spacing: 16px;
				--theme-expander-indicator-width: 13px;
				--theme-expander-header-height: 64px;
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
			}
			.expander-content {
				padding: 14px 14px 8px 16px;
				background-color: #F7F7F7;
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

		${this._renderLoadingIndicator()}
		`;
	}

	_renderAlertBanner() {
		if (!isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<capitec-alert-banner 
					data-automation-id="tax-certificate-alert-banner"
					type="unsuccessful-red" 
					closable>
					<p><b>Notify:</b> ${this.alertBannerMessage}</p>
				</capitec-alert-banner>
			`;
		}
		return html``;
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
						data-automation-id="tax-certificate-taxable-savings"
						label="Taxable Savings IT3(b)"
						@value-changed="${(e) => this._certChange(e)}"
						row="1" column="1">
						</capitec-radio>
					<capitec-radio 
						id="iT3STaxCertificates" 
						data-automation-id="tax-certificate-tax-free"
						label="Tax-free IT3(s)"
						@value-changed="${(e) => this._certChange(e)}"
						column="2">
						</capitec-radio>
					<capitec-radio 
						id="both" 
						data-automation-id="tax-certificate-both"
						label="Both"
						@value-changed="${(e) => this._certChange(e)}"
						column="3"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		` : html``;
	}
	
    _renderCertificateTypes() {
	
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
	
	_renderEmail() {
		if (this.currentStep === 1 && this.renderMode === RENDER_MODE.EMAIL) {
			return html`
				<horizon-email-input
					@value-changed="${(e) => this._onEmailValueChange(e)}"
					@validation-update="${(e) => this._validEmailAddressCheck(e)}"
					.labelOne="${this.emailLabel}"
					.labelTwo="${this.confirmEmailLabel}"
					.emailError="${this.mailClientError.email}"
					.confirmEmailError="${this.mailClientError.confirmEmail}">
				</horizon-email-input>

				<hr class="seperator">

				${this._renderViewTaxcertificate()}
			`;
		}
	}

	_renderChoosePeriod(certificateType) {
		
		if (this.selectedCertType && this.currentStep === 0) {
			return html`
				<capitec-label
					data-automation-id="tax-certificate-header-type"
					class="choose-period-header"
					label="Choose Period (${CERTIFICATE_TYPE[certificateType].displayName})"
					type="title">
				</capitec-label>
				
				${this.taxCertificateDetails[certificateType].map(item => this._renderCertificateYears(item, certificateType))}
			`;
		}
	}

	_renderCertificateYears(item, certType) {

			return html`
				<horizon-expander

				id="tax-expander"
					data-automation-id="tax-certificate-document-period"
					expandButtonAlignment="right"
					inputType = "Checkbox"
					@value-change="${(e) => this._onValueChange(e, item, certType)}"
					?selected = ${this.selectedCertificates === `` ? this.selectedCertificates[certType].indexOf(item) >= 0 : ``}
					@expand="${(e) => this._onExpanded(e)}"
					?disabled = ${!item.isTaxYearAvailable}>
						<capitec-group slot="custom-header" layout="horizontal" gap="none" halign="left" valign="center">
							<horizon-label
								class="check-box-label"
								label="${item.year}"
								value="${CERTIFICATE_TYPE[certType].type} ${item.isTaxYearAvailable ? `Available` : `Unavailable`}">
							</horizon-label>
						</capitec-group>
						<capitec-content-box 
							data-automation-id="tax-certificate-document-details"
							class="expander-content" 
							slot="content">
							${this._renderCertificateDetails(item, certType)}
						</capitec-content-box>
				</horizon-expander>`;
	}

	_renderCertificateDetails(item, certType) {
		return html`
			<capitec-label label="Overview (4 accounts)"></capitec-label>
			
			<capitec-group class="notify-banner" layout="horizontal">
				<capitec-icon
					size="default"
					icon="status/info-trans">
				</capitec-icon>
				<p><b>Notify Client: </b>Interest received on investments from 1 Mar ${item.year - 1} to ${this._isLeapYear(item.year)} Feb ${item.year}. Balance of accounts at ${this._isLeapYear()} Feb ${item.year}</p>
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
				label="Savings Account"
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
				value="${item.accountStatus}">
			</horizon-label>
		`;
	}

	_renderViewTaxcertificate() {
		
		return this.selectedCertificates[this.selectedCertType].map(type => (this.selectedCertificates[this.selectedCertType].length > 0
		 ? html`<capitec-label
						class="tax-certificate-heading"
						type="subtitle"
						label="View ${this.selectedCertificates[this.selectedCertType] === `iT3BTaxCertificates` ? `taxable savings` : `taxfree`} certificate(s)">
					</capitec-label>
					<capitec-group
						class="available-cards"
						valign="top"
						halign="left"
						gap="clear"
						layout="vertical">
						${this._renderViewCertificateTile(type)}
				</capitec-group>` 
		: html``));
				
	}

	_renderViewCertificateTile(type) {
		
		return this.selectedCertificates[this.selectedCertType].map(item => html`
				<horizon-product-tile
					data-automation-id="tax-certificate-dialog-view-document"
					class="view-document-tile"
					type="default"
					label="${item.year}"
					subtitle="${this.selectedCertType === `iT3BTaxCertificates` ? `IT3(b)` : `IT3(s)`} ${type.isTaxYearAvailable ? `Available` : `Unavaiable`}"
					@click="${() => this._viewPDF()}">
					${this._renderViewDocumnetLink()}
				</horizon-product-tile>`);
		
	}

	_renderViewDocumnetLink() {
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
				@click="${() => this._back()}"
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
				?hidden="${this.currentStep === 1 || this.renderMode === RENDER_MODE.PDF}">
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

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
    }

}
customElements.define(`horizon-tax-certificate`, TaxCertificate);