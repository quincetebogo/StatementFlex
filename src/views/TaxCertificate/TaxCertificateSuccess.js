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

		this.isTaxFreeCertificate = true;

		// TODO: To be removed once the navigation is wired up
		this.email = {};
		this.taxYear = [];
		this.certificateType = {};

		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {Boolean} [isTaxFreeCertificate=true] - Specifies if a Tax Free Certificate is being sent.
	 * 
	 * @readonly
	 * @static
	 * @memberof TaxCertificateSuccess
	 */
	static get properties() {
		return {
			isTaxFreeCertificate: { attribute: false, type: Boolean },
			email: { attribute: false, type: Object },
			taxYear: { attribute: false, type: Array },
			type: { attribute: false, type: Object },
			selectedCertificates: { type: Object }
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
		this.selectedCertificates = screenDetails.selectedCertificates;

		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {

		// TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		// Telemetry
		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
			"nextScreen": TelemetryScreen.FAVOURITES
		});
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {

		// TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		// Telemetry
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
		this.taxYear = [];
		if (this.type === `iT3BTaxCertificates` || this.type === `both`) {
			
			this.taxYear.push(...this.selectedCertificates.iT3BTaxCertificates.map(item => item.year));
			if (this.taxYear.length === 1) {
				return `${this.taxYear}`;
			}
			if (this.taxYear.length === 2) {
				return `${this.taxYear.join(` and `)}`;
			}
			if (this.taxYear.length > 2) {
				const taxableLastYear = this.taxYear.pop();
				return `${this.taxYear.join(`, `)} and ${taxableLastYear}`;
			}
		}
	}

	_taxFreeYears() {
		this.taxYear = [];
		if (this.type === `iT3STaxCertificates` || this.type === `both`) {
			this.taxYear.push(...this.selectedCertificates.iT3STaxCertificates.map(item => item.year));
			if (this.taxYear.length === 1) {
				return `${this.taxYear}`;
			}
			if (this.taxYear.length === 2) {
				return `${this.taxYear.join(` and `)}`;
			}
			if (this.taxYear.length > 2) {
				const taxFreeLastYear = this.taxYear.pop();
				return `${this.taxYear.join(`, `)} and ${taxFreeLastYear}`;
			}
		}
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
				toast="Tax certificate sent"
				secondaryToast="${this.isTaxFreeCertificate ? `Tax-free certificate sent` : ``}"
				@left-click=${() => this._sendAnotherClick}
				@right-click=${() => this._doneClick()}>
					<section 
						data-automation-id="tax-certificate-success-tax-certificate-message"
						class="success-msg" 
						slot="detail">
							${this.type === `iT3BTaxCertificates` || this.type === `both` ? html`Taxable savings certificate for <strong>${this._taxableYears()}</strong> has been emailed to <strong>${this.email}</strong>` : html``}
							<br> 
							${this.type === `iT3STaxCertificates` || this.type === `both` ? html`Tax free certificate for <strong>${this._taxFreeYears()}</strong> has been emailed to <strong>${this.email}</strong>` : html``} 
							${this._renderTaxFreeCertificateDetail()}
						</section>
			</horizon-success-screen>
		`;
	}

	_renderTaxFreeCertificateDetail() {
		return this.type === `iT3STaxCertificate` && this.type === `iT3BTaxCertificate`
		? html`
				<section 
					data-automation-id="tax-certificate-success-tax-free-certificate-message"
					slot="sub-detail">
						Tax-free certificate for <strong>${this._taxFreeYears()}</strong> has been emailed to <strong>${this.email}</strong>
				</section>`
			: html``;
		}
}

customElements.define(`horizon-tax-certificate-success`, TaxCertificateSuccess);