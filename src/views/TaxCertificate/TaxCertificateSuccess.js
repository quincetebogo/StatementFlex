import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/Telemetry/Events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/Telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';

export class TaxCertificateSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isTaxFreeCertificate = false;

		this.mailId = `ivanmakatini@gmail.com`;
		this.taxableYear = [`2018`, `2019`, `2020`];
		this.taxFreeYear = [`2019`, `2020`];

		this._telemetry = HorizonTelemetry.instance;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isTaxFreeCertificate: { attribute: false, type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {

		//TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		// Telemetry
		// this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
		// 	"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
		// 	"nextScreen": TelemetryScreen.FAVOURITES
		// });
		// this.horizonStore.clearReturnScreen();

		
		//this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {

		//TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		// Telemetry
		// this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE, {
		// 	"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
		// 	"nextScreen": TelemetryScreen.TAX_CERTIFICATE
		// });

		//this.horizonRouter.navigateToReturnPage();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_taxableYears() {
		const taxableLength = this.taxableYear.length;
		if (taxableLength === 1) {
			return this.taxableYear;
		} else if (taxableLength === 2) {
			return this.taxableYear.join(` and `);
		} else if (taxableLength > 2) {
			const taxableLastYear = this.taxableYear.pop();
			const taxableResult = this.taxableYear.join(`, `) + ` and ` + taxableLastYear;
			return taxableResult; 
		}
	}

	_taxFreeYears() {
		const taxFreeLength = this.taxFreeYear.length;
		if (taxFreeLength === 1) {
			return this.taxFreeYear;
		} else if (taxFreeLength === 2) {
			return this.taxFreeYear.join(` and `);
		} else if (taxFreeLength > 2) {
			const taxFreeLastYear = this.taxFreeYear.pop();
			const taxFreeResult = this.taxFreeYear.join(`, `) + `and` + taxFreeLastYear;
			return taxFreeResult;
		}
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				#id-success-msg {
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
				subDetail="${this.isTaxFreeCertificate ? true : `` }"
				@left-click=${() => this._sendAnotherClick}
				@right-click=${() => this._doneClick()}>
					<section 
						id="id-success-msg" 
						slot="detail">
							Taxable savings certificate for <strong>${this._taxableYears()}</strong> has been emailed to <strong>${this.mailId}</strong>
					</section>
					${this._renderTaxFreeCertificateDetail()}
			</horizon-success-screen>
		`;
	}

	_renderTaxFreeCertificateDetail() {
		return this.isTaxFreeCertificate 
			? html`
				<section 
					class="id-update-msg" 
					slot="sub-detail">
						Tax-free certificate for <strong>${this._taxFreeYears()}</strong> has been emailed to <strong>${this.mailId}</strong>
				</section>`
			: html``;
	}

}

customElements.define(`horizon-tax-certificate-success`, TaxCertificateSuccess);