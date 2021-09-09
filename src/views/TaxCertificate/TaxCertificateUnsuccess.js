import { css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/views/common/ViewBase';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an failure screen indicating the selected tax certificates have not been sent.
 *
 * @export
 * @class TaxCertificateUnsuccess
 * @extends {ViewBase}
 */
export class TaxCertificateUnsuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isTaxFreeCertificate = false;

		// TODO: To be removed once the navigation is wired up
		this.email = {};
		this.taxYear = [];
		this.certificateType = {};

		this._telemetry = HorizonTelemetry.instance;
		this.horizonStore = HorizonStore.getInstance();
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
	 * @memberof TaxCertificateUnsuccess
	 */
	static get properties() {
		return {
			context: { type: String },
			email: { attribute: false, type: Object },
			taxYear: { attribute: false, type: Array },
			type: { attribute: false, type: Object },
			isTaxFreeCertificate: { attribute: false, type: Boolean },
			selectedCertificates: { type: Object }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// TODO: Uncomment the below code when CS is being implemented.



		const screenDetails = this.horizonStore.getScreenDetails();
		this.email = screenDetails.taxCertificate.email;
		this.type = screenDetails.taxCertificate.type;
		this.selectedTaxCertificates = screenDetails.selectedCertificates;
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

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
	
	_assignClick() {

		// TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_OUTCOME_ASSIGN, {
		"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
		"next-screen": null
		});

		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.ASSIGNED;

		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
		this.horizonStore.clearReturnScreen();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

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
				data-automation-id="tax-certificate-unsuccessful"
				header="Tax certificate not sent" 
				image="/images/tax-certificate/send-tax-certificate.svg"
				left="Done"
				right="Assign"
				toast="Taxable savings certificate not sent"
				secondaryToast="${this.isTaxFreeCertificate ? `Tax-free certificate not sent` : ``}"
				subDetail="${this.isTaxFreeCertificate ? true : ``}"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
					<section
						data-automation-id="tax-certificate-unsuccessful-tax-certificate-message"
						class="error-msg" 
						slot="detail">
							${this.type === `iT3BTaxCertificates` || this.type === `both` ? html`Taxable savings certificate for <strong>${this._taxableYears()}</strong> has not been emailed to <strong>${this.email}</strong>` : html``}
							<br>
							${this.type === `iT3STaxCertificates` || this.type === `both` ? html`Tax free certificate for <strong>${this._taxFreeYears()}</strong> has not been emailed to <strong>${this.email}</strong>` : html``}
					</section>
					${this._renderTaxFreeCertificateDetail()}
			</horizon-error-screen>
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

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="tax-certificate-unsuccessful-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}
customElements.define(`horizon-tax-certificate-unsuccessful`, TaxCertificateUnsuccess);