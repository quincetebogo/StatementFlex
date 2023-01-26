import { css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an failure screen indicating the selected tax certificates have not been sent.
 *
 * @export
 * @class TaxCertificateFailure
 * @extends {ViewBase}
 */
export class TaxCertificateFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isTaxFreeCertificate = false;

		this.email = {};

		this.primaryToast = `Taxable savings certificate not sent`;
		this.secondaryToast = `Tax-free certificate not sent`;
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this._telemetry = HorizonTelemetry.instance;
		this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

		/**
	 * Registry of all properties defined by the component.
	 * 
	 * @readonly
	 * @static
	 * @memberof TaxCertificateFailure
	 */
	static get properties() {
		return {
			// Private Properties
			email: { attribute: false },
			context: { attribute: false },
			taxYear: { attribute: false },
			type: { attribute: false }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();

		this.email = screenDetails.taxCertificate.email;
		this.type = screenDetails.taxCertificate.type;

		this.iT3BTaxCertificates = screenDetails.taxCertificate.iT3BTaxCertificates;
		this.iT3STaxCertificates = screenDetails.taxCertificate.iT3STaxCertificates;

		// Make adjustments depending on what type of certificates are available
		if (this.iT3BTaxCertificates && !this.iT3STaxCertificates) {
			this.type = `iT3BTaxCertificates`;
			this.secondaryToast = ``;
		}

		if (this.iT3STaxCertificates && !this.iT3BTaxCertificates) {
			this.type = `iT3STaxCertificates`;
			this.primaryToast = this.secondaryToast;
			this.secondaryToast = ``;
		}

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this.horizonStore.setScreenDetails({ taxCertificate: null });
		this.horizonStore.clearReturnScreen();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {

		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
			"nextScreen": TelemetryScreen.FAVOURITES
		});

		this.horizonRouter.navigateToReturnPage();
	}
	
	_assignClick() {
		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_OUTCOME_ASSIGN, {
		"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
		"next-screen": null
		});

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.ASSIGNED;

		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_taxableYears() {
		if (!this.iT3BTaxCertificates) {
			return ``;
		}

		if (this.type !== `iT3BTaxCertificates` && this.type !== `both`) {
			return ``;
		}
		
		const taxYear = this.iT3BTaxCertificates.taxYears;

		if (taxYear.length === 1) {
			return `${taxYear}`;
		}

		if (taxYear.length === 2) {
			return `${taxYear.join(` and `)}`;
		}

		if (taxYear.length > 2) {
			const taxableLastYear = taxYear.pop();
			return `${taxYear.join(`, `)} and ${taxableLastYear}`;
		}

		return ``;
	}

	_taxFreeYears() {
		if (!this.iT3STaxCertificates) {
			return ``;
		}

		if (this.type !== `iT3STaxCertificates` && this.type !== `both`) {
			return ``;
		}

		const taxYear = this.iT3STaxCertificates.taxYears;

		if (taxYear.length === 1) {
			return `${taxYear}`;
		}

		if (taxYear.length === 2) {
			return `${taxYear.join(` and `)}`;
		}

		if (taxYear.length > 2) {
			const taxFreeLastYear = taxYear.pop();
			return `${taxYear.join(`, `)} and ${taxFreeLastYear}`;
		}

		return ``;
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				.error-msg {
					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					text-align: center;
				}
				horizon-success-screen {
					--horizon-button-group-margin-top: 28px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderTaxCertificateFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderTaxCertificateFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="tax-certificate-failure"
				header="Tax certificate not sent" 
				image="/images/tax-certificate/send-tax-certificate.svg"
				left="Done"
				right="Assign"
				toast="${this.primaryToast}"
				secondaryToast="${this.secondaryToast}"
				?hasSubDetails=${this.type === `both`}
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
					${this._renderFirstTaxCertificate()}
					${this._renderSecondTaxCertificates()}
			</horizon-error-screen>
		`;
	}

	_renderFirstTaxCertificate() {
		if (this.type === `both` || this.type === `iT3BTaxCertificates`) {
			return this._renderTaxSavingsLine();
		}

		return this._renderTaxFreeLine(`detail`);
	}

	_renderSecondTaxCertificates() {
		if (this.type === `both` || this.type === `iT3STaxCertificates`) {
			return this._renderTaxFreeLine(`sub-detail`);
		}

		return html``;
	}
	
	_renderTaxSavingsLine() {
		return html`
			<section
				data-automation-id="tax-certificate-failure-tax-certificate-message"
				class="error-msg"
				slot="detail">
					Taxable savings certificate for <strong>${this._taxableYears()}</strong> has not been emailed to <strong>${this.email}</strong><br>
			</section>`;
	}

	_renderTaxFreeLine(slot) {
		return html`
			<section 
				data-automation-id="tax-certificate-success-tax-certificate-message" 
				class="error-msg" 
				slot="${slot}">
				Tax free certificate for <strong>${this._taxFreeYears()}</strong> has not been emailed to <strong>${this.email}</strong>
			</section>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="tax-certificate-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-tax-certificate-failure`, TaxCertificateFailure);