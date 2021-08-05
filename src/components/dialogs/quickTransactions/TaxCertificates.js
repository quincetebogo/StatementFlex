import { Component, css, html } from 'platform/elements';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { NavigationContext, EventAggregator } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';

const RENDER_MODE = {
    TAX_CERTIFICATE: 1,
    EMAIL: 2
};

const TAX_CERTIFICATE_STEPS = [
    {
        title: `Choose Certificate Type and Period`
    },
    {
        title: `Specify Email`
    }
];
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
		this.renderMode = RENDER_MODE.TAX_CERTIFICATE;
		this.navigationContext = NavigationContext.getInstance();

		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.eventAggregator = EventAggregator.getInstance();

		this._telemetry = HorizonTelemetry.instance;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), ex => this._errorHandler(ex));

		this.certType = {};
		this.showChoosePeriod = false;

		this.tableRecords = [
			{ columnOne: `Savings account`, columnTwo: `Balance`, columnThree: `Interest Recieved`, columnFour: `Status` },
			{ columnOne: `Savings account`, columnTwo: `Balance`, columnThree: `Interest Recieved`, columnFour: `Status` }
		];
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @param {object} callerInformation Identified caller information
	 * @param {Object} landingPageInfo Favourites landing page info
	 */

	static get properties() {
		return {
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
		
		// this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
		// 	"screen": TelemetryScreen.TAX_CERTIFICATE
		// });
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_certChange(e) {
		if(e.detail.new) {
			this.certType.name = e.target.id;
			if (this.certType.name === "taxable savings") {
				this.certType.detail = "IT3(b)"
			} else {
				this.certType.detail = "IT3(s)"
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

	_cancelClick(e) {
		// this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_CANCEL, {
		// 	"screen": TelemetryScreen.PROOF_OF_ACCOUNT,
		// 	"next-screen": TelemetryScreen.FAVOURITES
		// });
		// this._telemetry.endSpan(QuickTransactionEvents.PROOF_OF_ACCOUNT, { "screen": TelemetryScreen.PROOF_OF_ACCOUNT });

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_nextClick() {

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
				--theme-container-padding-left: 16px;
				--theme-container-padding-top: 16px;
				--theme-container-padding-right: 16px;
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
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<bb-stepper-modal
				header="Tax Certificate"
				.steps="${TAX_CERTIFICATE_STEPS}"
				current-active-step="${this.renderMode}">
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
		return html`
			<capitec-content-box
				class="main-cb"
				layout="vertical"
				gap="clear"
				?noScroll="${true}">
					${this._renderChoosePeriod()}
					${this._renderEmailFields()}
			</capitec-content-box>`;
	}

	_renderChooseCerificate() {
		return this.renderMode === RENDER_MODE.TAX_CERTIFICATE ? html`
			<capitec-label 
				type="title"
				label="Choose a certificate type"
				class="taxCertTitle">
			</capitec-label>
			<capitec-radio-group>
			<capitec-group layout="grid" rows="auto" columns="auto">
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
		` : html ``;
	}

	_renderChoosePeriod() {
		this.years = ["2017", "2018", "2019", "2020"];
		const status = `Available`;
		if (this.showChoosePeriod) {
		return html`
		<capitec-label
			label="Choose Period (${this.certType.name})"
			type="default">
		</capitec-label>

		<div class="tax-certificate-bar">
			<!-- ${this.years.map(() => html`
				code for expander goes here `)}
	-->
			<capitec-expander label="" ?expanded="${true}" expandable>
				${this._renderOptions()}
			</capitec-expander>
			<capitec-group class="expander-header" layout="horizontal" gap="none" halign="left" valign="center">
					<capitec-check class="check-details"></capitec-check>
					<horizon-label
						label="2020"
						value="${this.certType.detail} ${status}">
					</horizon-label>
			</capitec-group>
		</div>
		`;
		}
	}

	_renderOptions() {
		return html`
			<capitec-table .items="${this.tableRecords}">
				<capitec-table-column label="Overview(4 accounts)" field="columnOne" value="1457065930"></capitec-table-column>
				<capitec-table-column label="" field="columnTwo"></capitec-table-column>
				<capitec-table-column label="" field="columnThree"></capitec-table-column>
				<capitec-table-column label="" field="columnFour"></capitec-table-column>
			</capitec-table>
		`;
	}

	_renderEmailFields() {
		return html``;
	}

	_renderFooter() {
		return html`
		<capitec-content-box 
		class="footer"
		layout="horizontal"
		gap="clear">
			<capitec-group style="display: inline; border-top: 1px solid grey;">
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
				@click="${() => this._nextClick()}">
				</capitec-button>
			</capitec-group>
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