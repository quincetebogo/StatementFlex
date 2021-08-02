import { Component, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext } from 'platform/core';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';

const RENDER_MODE =  Object.freeze({
	EMAIL: 0,
	PDF: 1
});

const TAX_CERTIFICATE_STEPS = [
    {
        title: `Choose Certificate Type and Period`
    },
    {
        title: `Specify Email`
    }
];

const CERTIFICATE_TYPE = {
	taxFree: `IT3(s)`,
	taxableSavings: `IT3(b)`
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
		this.certType = {};
		this.showChoosePeriod = false;

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this._telemetry = HorizonTelemetry.instance;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

		// this.years = [`2016`, `2017`, `2018`, `2019`, `2020`];
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} cards Object contains the list of client's card
	 * @param {object} callerInformation Identified caller information
	 * @param {Object} landingPageInfo Favourites landing page info
	 */

	static get properties() {
		return {
			cards: { type: Object },
			currentStep: { attribute: false },
			renderMode: { attribute: false },
			callerInformation: { type: Object },
			landingPageInfo: { type: Object },

			showChoosePeriod: { type: Boolean },

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
		
		console.log(this.cards);
		// this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
		// "screen": TelemetryScreen.TAX_CERTIFICATE
		// });
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_errorHandler(ex) {
		return true;
	}

	toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_certChange(e) {
		if (e.detail.new) {
			this.certType.name = e.target.id;
			if (this.certType.name === `taxable savings`) {
				this.certType.detail = `IT3(b)`;
			} else {
				this.certType.detail = `IT3(s)`;
						}
			this.showChoosePeriod = e.detail.new;
		}
	}


	async _sendClick(e) {
		if (this._validateEmail(e)) {

			this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_SEND, {
				"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
				"next-screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME
			});

			// saving 'emailAddress' and 'accountNumber' in state.
			this._updateScreenDetails();

			const clientInfo = {
				"cifNumber": this.callerInformation.cifNumber,
				"accountNumber": this.landingPageInfo.accountNumber,
				"accountOpenedDate": this._formatDate(this.landingPageInfo.accountOpenedDate),
				"emailAddress": this.idEmailAddress,
				"accountType": ACCOUNT_TYPE
			};
			const returnValue = await this.quickTransactionService.sendProofOfAccount(clientInfo);

			this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME, {
				"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
				"next-screen": returnValue.succeeded ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
			});
			this.horizonStore.setReturnScreen(this.navigationContext.current.route, `proof-of-account`);

			if (returnValue.succeeded) {
				this.horizonRouter.navigateToProofOfAccountSuccess();
			} else {
				this.horizonRouter.navigateToProofOfAccountFailed();
			}
		}
	}

	_formatDate(dateToFormat) {
		const stringToDate = new Date(dateToFormat);
		const tempdate = stringToDate.toISOString().slice(0, 10);
		return tempdate;
	}

	_back() {

		// Telemetry
		this.errorMessage = ``;
		this.currentStep--;
	}

	_cancelClick(e) {
	
		// telemetry

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_close() {
		this.renderMode = RENDER_MODE.EMAIL;
		
	}

	_nextClick() {
		this.currentStep++;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

    _validateEmail(e) {

        // CORRECT
        if (!this._isNullorEmpty(this.idEmailAddress) && this.idEmailAddress === this.idConfirmEmailAddress) {
            if (EMAIL_REG_EXP.test(this.idEmailAddress)) {
                this.alertBannerMessage = ``;
                this.errMessage.idEmailAddress = ``;
                this.errMessage.idConfirmEmail = ``;
                return true;
            } else if (!this.idEmailAddress.includes(`@`)) {
                this.alertBannerMessage = `Email address is invalid`;
                this.errMessage.idEmailAddress = `An email must contain a single @`;
				return false;
            }

                this.alertBannerMessage = `Incorrect email address format ie. email@gmail.com`;
			this.errMessage.idEmailAddress = `Invalid email address`;
            this.errMessage.idConfirmEmail = `Invalid email address`;
            return false;
        } else if (this._isNullorEmpty(this.idEmailAddress)) {
			// EMAIL EMPTY
            if (this._isNullorEmpty(this.idConfirmEmailAddress)) {
                this.errMessage.idConfirmEmail = `Enter a valid email address i.e. email@gmail.com`;
				this.emailText = `email@gmail.com`;
			}
			this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.idEmailAddress = `Enter a valid email address i.e. email@gmail.com`;
            this.emailText = `email@gmail.com`;
            return false;
        } else if (this._isNullorEmpty(this.idConfirmEmailAddress)) {
            this.alertBannerMessage = `Complete all fields to continue`;
            this.errMessage.idConfirmEmail = `Enter a valid email address i.e. email@gmail.com`;
            this.emailText = `email@gmail.com`;
            return false;
        } else if (this.idEmailAddress !== this.idConfirmEmailAddress) {
			// EMAILS DON'T MATCH 
			this.alertBannerMessage = `Email and Confirm email don't match`;
            this.errMessage.idEmailAddress = `Invalid email`;
            this.errMessage.idConfirmEmail = `Invalid email`;
			return false;
		}
	}

	
	_onKeyPress(e) {
		this._clearErrors(e);
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

	_isNullorEmpty(fieldValue) {
		return fieldValue === `` || fieldValue === null || fieldValue === undefined;
	}

	_updateScreenDetails() {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = this.idEmailAddress;
		screenDetails.accountNumber = this.landingPageInfo.accountNumber;
		
		this.horizonStore.setScreenDetails(screenDetails);
	}

	_viewPDF() {
		console.log(`CS call for Viewing the document`);
		this.renderMode = RENDER_MODE.PDF;
		// Telemetry
		
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
				--theme-stepper-inner-step-container-width: 448px;
				--theme-wizard-modal-max-width: 896px;
				--theme-wizard-modal-max-height: 953px;

			}
			.main-cb {
				height: 100%;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-bottom: 0px;
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
				--theme-label-font-color: #3A3A3A;
				--theme-label-title-font-size: 18px;
				--theme-label-title-font-weight: 600;
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

			.tax-certificate-bar > capitec-expander {
				position: absolute;
				border-bottom: 1px solid #E1E1E1;
				border-radius:4px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-height: 210px;
				--theme-expander-indicator-width: 11.5px;
				--theme-expander-indicator-height: 6.5px;
				box-shadow:0 3px 6px 0.25px rgba(0,0,0,0.08);
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

			.footer {
				width: var(--horizon-tax-certificate-modal-footer-width, 100%);
				
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 16px;
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

			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
		<bb-stepper-modal
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
		if (!this._isNullorEmpty(this.alertBannerMessage)) {
			return html`
				<capitec-alert-banner type="unsuccessful-red">
					<capitec-group layout="horizontal">
						<capitec-label
							type="subtitle"
							label="Notify: "
							class="label-err-message">
						</capitec-label>
						<capitec-label
							label="${this.alertBannerMessage}"
							class="label-err-message">
						</capitec-label>
					</capitec-group>
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
						?noScroll="${false}">
							${this._renderChooseCertificate()}
							${this._renderChoosePeriod()}
							${this._renderViewTaxcertificate()}
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
						id="taxable savings" 
						label="Taxable Savings IT3(b)"
						@value-changed="${(e) => this._certChange(e)}"
						row="1" column="1">
						</capitec-radio>
					<capitec-radio 
						id="tax-free" 
						label="Tax-free IT3(s)"
						@value-changed="${(e) => this._certChange(e)}"
						column="2">
						</capitec-radio>
					<capitec-radio 
						id="both" 
						label="Both"
						@value-changed="${(e) => this._certChange(e)}"
						column="3"></capitec-radio>
				</capitec-group>
			</capitec-radio-group>
		` : html``;
	}

	_renderChoosePeriod() {
		const checkBoxLabel = [
			{year : "2017", status: `Available`},
			{year : "2018", status: `Available`},
			{year : "2019", status: `Available`},
			{year : "2020", status: `Available`}
		];
	
		if (this.showChoosePeriod) {
			return html`
				<capitec-label
					label="Choose Period (${this.certType.name})"
					type="default">
				</capitec-label>
				
				${this._renderExpanders(checkBoxLabel)}
			`;
		}
	}

	_renderExpanders(checkBoxLabel) {
		return checkBoxLabel.map(item => html`
			<horizon-expander
				id="tax-expander"
				expandButtonAlignment="right"
				checkBox = "${true}"
				@value-change="${(e) => this._onValueChange(e, item)}"
				@expand="${(e) => this._onExpanded(e)}">
					<capitec-group slot="custom-header" layout="horizontal" gap="none" halign="left" valign="center">
						<horizon-label
							class="check-box-label"
							label="${item.year}"
							value="IT3(b) ${item.status}">
						</horizon-label>
					</capitec-group>
					<capitec-content-box slot="content">
						<capitec-label
							label="Details coming soon...." >
						</capitec-label>
					</capitec-content-box>
			</horizon-expander>
		`);
	}

	_onExpanded(e) {
		e.detail.expFunc(this);
	}

	_renderViewTaxcertificate() {
		const availableCards = this.cards.map(card => card.cardExpiryYear);
		console.log(availableCards);
		if (this.currentStep === 1 && this.renderMode === RENDER_MODE.EMAIL) {
			if (CERTIFICATE_TYPE.taxableSavings) {
				return html`
					<capitec-label
						class="tax-certificate-heading"
						type="subtitle"
						label="View ${CERTIFICATE_TYPE.taxableSavings} certificate(s)">
					</capitec-label>

					<capitec-group
						class="available-cards"
						valign="top"
						halign="left"
						gap="clear"
						layout="vertical">
							${availableCards.map((item, itemIndex) => this._renderViewTaxableCertificateTile(item, itemIndex))}
					</capitec-group>`;
			}
				
			if (CERTIFICATE_TYPE.taxFree) {
					return html`
					<capitec-label
						class="tax-certificate-heading"
						type="subtitle"
						label="View ${CERTIFICATE_TYPE.taxFree} certificate(s)">
					</capitec-label>
					<capitec-group
						class="available-cards"
						valign="top"
						halign="left"
						gap="clear"
						layout="vertical">
							${availableCards.map((item, itemIndex) => this._renderViewTaxfreeCertificateTile(item, itemIndex))}
					</capitec-group>`;
			}
		}
	}

	_renderViewTaxableCertificateTile(item, itemIndex) {
		const status = `Available`;
		return html`
			<horizon-product-tile
				class="view-document-tile"
				type="default"
				label="20${item}"
				subtitle="${CERTIFICATE_TYPE.taxableSavings} ${status}">
				${this._renderViewDocumnetLink()}
			</horizon-product-tile>`;
	}

	_renderViewTaxfreeCertificateTile(item, itemIndex) {
		const status = `Available`;
		return html`
			<horizon-product-tile
				class="view-document-tile"
				type="default"
				label="20${item}"
				subtitle="${CERTIFICATE_TYPE.taxFree} ${status}">
				${this._renderViewDocumnetLink()}
			</horizon-product-tile>`;
	}

	_renderViewDocumnetLink() {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document"
				@click="${() => this._viewPDF()}">
			</capitec-label>
		`;
	}

	_renderFooter() {
		return html`
		<capitec-content-box 
		class="footer"
		layout="horizontal"
		gap="clear">
			<capitec-button
				type="clear"
				label="Back"
				@click="${() => this._back()}"
				?hidden="${this.currentStep === 0}">
			</capitec-button>
			<capitec-spacer></capitec-spacer>
			<capitec-button
				class="cancel-button"
				type="secondary"
				label="Cancel"
				@click="${() => this._cancelClick()}">
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
						@click="${() => this._sendTaxCertificate()}"
						?hidden="${this.currentStep !== 1 || this.renderMode === RENDER_MODE.PDF}">
					</capitec-button>
		</capitec-content-box>
		`;
	}

	_renderPDFViewer() {
		return html`
			<capitec-content-box
				data-automation-id="tax-certificate-dialog-pdf-viewer"
				class="main-cb pdf-cb"
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