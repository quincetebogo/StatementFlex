import { css, html } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * An error/failure screen that will be displayed when Tax Certificate is unsuccessful.
 */
export class TaxCertificateUnsuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isTaxFreeCertificate = false;

		this.mailId = `ivanmakatini@gmail.com`;

		//this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			mailId: { attribute: String },

			isTaxFreeCertificate: { attribute: false, type: Boolean }
		};
	}
	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		//TODO: Uncomment the below code when CS is being implemented.

		// this._updateIncidentState();

		// const screenDetails = this.horizonStore.getScreenDetails();
		// this.incidentDetails = super.HORIZON_NEED_STATUS.FAILED;
		// this.horizonStore.setIncidentDetails(this.incidentDetails);
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
	
	_handoffClick() {

		//TODO : Uncomment entire function once the Tax Certificate dialog is ready and navigation needs to be wired up.

		// this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_OUTCOME_HANDOFF, {
		// 	"screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME,
		// 	"next-screen": null
		// });

		// this.incidentDetails = super.HORIZON_NEED_STATUS.ASSIGNED;
		// this.horizonStore.setIncidentDetails(this.incidentDetails.incidentRecId);

		// this.horizonRouter.navigateToStrack(incidentRecId);
		// this.horizonStore.clearReturnScreen();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	//TODO : Uncomment the below code when CS is being implemented.

	// _updateIncidentState() {
	// 	const incidentDetails = this.horizonStore.getIncidentDetails();
	// 	incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
	// 	this.horizonStore.setIncidentDetails(incidentDetails);
	// }

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				#id-error-msg{
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
				subDetail="${this.isTaxFreeCertificate ? true : `` }"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._handoffClick()}>
					<section
						id="id-error-msg" 
						slot="detail">
							Your taxable savings certificate was not emailed to <strong>${this.mailId}</strong>
					</section>
					${this._renderTaxFreeCertificateDetail()}
			</horizon-error-screen>
		`;
	}

	_renderTaxFreeCertificateDetail() {
		return this.isTaxFreeCertificate 
			? html`
				<section 
					class="id-update-msg" 
					slot="sub-detail">
						Your tax-free certificate was not emailed to <strong>${this.mailId}</strong>.
				</section>`
			: html``;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Failure">
			</horizon-related-options>
		`;
	}
}
customElements.define(`horizon-tax-certificate-unsuccessful`, TaxCertificateUnsuccess);