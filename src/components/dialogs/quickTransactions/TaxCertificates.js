import { Component, css, html } from 'platform/elements';
import { EventAggregator, NavigationContext } from 'platform/core';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { base64ToBlobUrl, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';

const RENDER_MODE = {
    EMAIL: 0,
	PDF: 1
};

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
		this.currentStep = 0;
		this.renderMode = RENDER_MODE.EMAIL;
		this.encodedPDF = ``;
		this.navigationContext = NavigationContext.getInstance();

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this._telemetry = HorizonTelemetry.instance;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));
		this.certType = {};
		this.showChoosePeriod = false;

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
		// Telemetry
		this._telemetry.endSpan(QuickTransactionEvents.VIEW_TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});

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

	_isNullorEmpty(fieldValue) {
		return fieldValue === `` || fieldValue === null || fieldValue === undefined;
	}

	_updateScreenDetails() {
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.emailAddress = this.idEmailAddress;
		screenDetails.accountNumber = this.landingPageInfo.accountNumber;
		
		this.horizonStore.setScreenDetails(screenDetails);
	}

	async _viewPDF() {
		console.log(`CS call for Viewing the document`);
		this.renderMode = RENDER_MODE.PDF;

		// Telemetry
		await this._telemetry.logEvent(QuickTransactionEvents.SELECT_VIEW_TAX_CERTIFICATE, { 
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
		});
		
		const taxCertificate = {
			"cifNumber": this.callerInformation.cifNumber,
			"accountYear": `2020`,
			"certificateType": `IT3(s)`
		};

		const returnValue = await this.quickTransactionService.viewStatement(taxCertificate, () => this._createIncidentOnError());
		if (returnValue.succeeded) {
			this.renderMode = RENDER_MODE.PDF;
			// render the PDF
			this.encodedPDF = base64ToBlobUrl(returnValue.result.statementData);
			// Telemetry
			this._telemetry.startSpan(QuickTransactionEvents.VIEW_TAX_CERTIFICATE, { 
				"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
			});
		} else {
			this.errorMessage = `System error. Please try again`;
			this.logger.log(`error`, `Unable to view statments due to a system error`, `_viewPDF`, returnValue.correlationId);
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
				--theme-wizard-modal-max-width: 896px;
				--theme-wizard-modal-max-height: 953px;
				--theme-modal-footer-padding: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-top: 0px;
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
				margin: 16px;
				--theme-label-font-color: #3A3A3A;
				--theme-label-font-size: 18px;
				--theme-label-line-height: 24px;
			}
			capitec-radio-group {
				margin-top: 10px;
				margin-bottom: 10px;
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

			.main-cb {
				height: 100%;
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-right: 16px;
				--theme-container-padding-bottom: 0px;
			}
			.pdf-viewer {
				height: 100%;
				width: 100%;
				background-color: #FFFFFF;
			}

			.pdf-cb {
				height: inherit;
				padding-right: inherit;
			}

			.footer {
				width: var(--horizon-tax-certificate-modal-footer-width, 100%);
				--theme-buttonbar-padding: 16px;
				padding-top: 8px;
				padding-bottom: 8px;
			}

			.seperator {
				width: 100%;
				margin-bottom: 30px;
				margin-top: 30px;
				border: 1px solid #E1E1E1;
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
				${this._renderEmail()}
				</capitec-content-box>`;
		}
			
	}

	_renderEmail() {
		if (this.currentStep === 1 && this.renderMode === RENDER_MODE.EMAIL) {
			return html`
				<hr class="seperator">
				${this._renderViewTaxcertificate()}
			`;
		}
	}

	_renderViewTaxcertificate() {
		const availableCards = this.cards.map(card => card.cardExpiryYear);
		console.log(availableCards);

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

	_renderViewTaxableCertificateTile(item, itemIndex) {
		const status = `Available`;
		return html`
			<horizon-product-tile
				class="view-document-tile"
				type="default"
				label="20${item}"
				subtitle="${CERTIFICATE_TYPE.taxableSavings} ${status}"
				@click="${() => this._viewPDF()}">
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
				subtitle="${CERTIFICATE_TYPE.taxFree} ${status}"
				@click="${() => this._viewPDF()}">
				${this._renderViewDocumnetLink()}
			</horizon-product-tile>`;
	}

	_renderViewDocumnetLink() {
		return html`
			<capitec-label
				slot="detail"
				type="strong"
				label="View Document">
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
					@click="${() => this._sendTaxCertificate()}"
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