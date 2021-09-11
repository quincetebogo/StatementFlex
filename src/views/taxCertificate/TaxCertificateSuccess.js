import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the selected tax certificates have been successfully sent.
 *
 * @export
 * @class TaxCertificateSuccess
 * @extends {ViewBase}
 */
export class TaxCertificateSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._telemetry = HorizonTelemetry.instance;

		this.email = {};
		this.primaryToast = `Tax certificate sent`;
		this.secondaryToast = `Tax-free certificate sent`;

		this.sendAnotherClicked = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @readonly
	 * @static
	 * @memberof TaxCertificateSuccess
	 */
	static get properties() {
		return {

			// Private Properties
			email: { attribute: false },
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

		this._updateIncidentState();
	}

	disconnectedCallback() {
		this.horizonStore.setScreenDetails({ taxCertificate: null });

		if (!this.sendAnotherClicked) {
			this.horizonStore.clearReturnScreen();
		}

		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
			"nextScreen": TelemetryScreen.FAVOURITES
		});

		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {
		this.sendAnotherClicked = true;

		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
			"nextScreen": TelemetryScreen.TAX_CERTIFICATE
		});

		this.horizonRouter.navigateToReturnPage();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.incidentDetails = this.horizonStore.getIncidentDetails();
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

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
				.success-msg {
					width: auto;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSuccessScreen()}
			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen 
				data-automation-id="tax-certificate-success"
				header="Tax certificate sent" 
				image="/images/tax-certificate/send-tax-certificate.svg"
				left="Send Another"
				right="Done"
				toast="${this.primaryToast}"
				secondaryToast="${this.secondaryToast}"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section
						data-automation-id="tax-certificate-success-tax-certificate-message"
						class="success-msg" 
						slot="detail">
							${this.type === `iT3BTaxCertificates` || this.type === `both` 
								? html`Taxable savings certificate for <strong>${this._taxableYears()}</strong> has been emailed to <strong>${this.email}</strong><br>` 
								: html``
							}
							${this.type === `iT3STaxCertificates` || this.type === `both` 
								? html`Tax free certificate for <strong>${this._taxFreeYears()}</strong> has been emailed to <strong>${this.email}</strong>` 
								: html``
							} 
					</section>
			</horizon-success-screen>
		`;
	}
}

customElements.define(`horizon-tax-certificate-success`, TaxCertificateSuccess);