import { Component, html } from 'platform/elements';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { base64ToBlobUrl, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { Logger } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';
import 'app/components/common/HorizonEmailInput';
import 'app/productControls/taxCertificates/src/TaxCertificates';


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
 * @class TaxCertificateDialog
 * @extends {Component}
 */
export class TaxCertificatesDialog extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();
		
		this.logger = Logger.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.certificateState = {};
		this.taxCertificateDetails = null;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {String} cifNumber The client's CIF Number
	 */
	static get properties() {
		return {
			cifNumber: { type: String },

			// Private Properties
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._loadTaxCertificates();
		const state = this.horizonStore.recoverState();
		this.certificateState = state.certificateState;
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
	_back() {
		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_BACK, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});

		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

	}

	async _send(e) {
		const email = e.detail.email;
		const selectedCertificates = e.detail.selectedCertificates;
		const selectedCertType = e.detail.selectedCertType;

		if (isNullorEmpty(email)) {
			return;
		}

		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE_OUTCOME
		});

		this._saveToState(email, selectedCertificates, selectedCertType);

		const request = {
			"cif": this.cifNumber,
			"emailAddress": email,
			"documentIds": selectedCertificates[selectedCertType].map(item => item.documentId),
			"messageParameters": {
				"title": this.taxCertificateDetails.title,
				"surname": this.taxCertificateDetails.lastName
			},
			"attachments": []
		};
		
		const returnValue = await this.quickTransactionService.sendTaxCertificate(request, () => true);
		
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_SELECT_SEND, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": returnValue.succeeded ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
		});

		if (returnValue.succeeded) {
			this.horizonRouter.navigateToTaxCertificateSuccessful();
		}

		this.logger.log(`error`, `Unable to send tax certificates`, `_sendTaxCertificateDocument`, returnValue.correlationId);
		this.horizonRouter.navigateToTaxCertificateUnsuccessful();
	}

	async _cancel() {
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_CANCEL, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_close() {
		this._telemetry.endSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_CLOSE_PDF, {
			"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE
		});
	}

	_next(e) {
		const certData = e.detail.selectedCertificates[e.detail.selectedCertType].map(item => item);

		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_NEXT, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": null,
			"certificate-type": e.detail.selectedCertType || `both`,
			// TODO: Add selected certificate types when CS is implemented
			"selected-documents": [
				{ 
					"document-type": e.detail.selectedCertType === `iT3BTaxCertificates` ? `IT3B` : `IT3S` || `Both`,
				"certificate-period": certData.map(element => element.year)
			} 
		]
		});
	}

	async _viewPDF(item, type) {
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_VIEW_DOCUMENT, { 
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
		});


		const request = this._formatRequest(item, type);

		const returnValue = await this.quickTransactionService.viewTaxCertificate(request, () => true);
	
		if (returnValue.succeeded && !isNullorEmpty(returnValue.result)) {
			const result = returnValue.result;
			const pdfData = result[type.replace(`TaxCertificates`, `Documents`)].find(certificate => certificate.year === item.year);
			const encodedPDF = base64ToBlobUrl(pdfData.contentData);
	
			this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_VIEW_PDF, { 
				"screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
			});
	
			return encodedPDF;
		} 
	
		this.logger.log(`error`, `Unable to get load tax certificates documents`, `_viewPDF`, returnValue.correlationId);
		this.horizonRouter.navigateToTaxCertificateServiceError();
		return null;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	async _loadTaxCertificates() {
		await this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE, {
			"screen": TelemetryScreen.TAX_CERTIFICATE
		});
			
		await this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP, {
				"screen": TelemetryScreen.TAX_CERTIFICATE
		});
	
		const returnValue = await this.quickTransactionService.getTaxCertificate(this.cifNumber, () => true);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to get load tax certificates information`, `_taxCertificates`, returnValue.correlationId);
			this.horizonRouter.navigateToTaxCertificateServiceError();
		}
	
		this.taxCertificateDetails = returnValue.result;
		this.requestUpdate();
	}

	_saveToState(email, selectedCertificates, selectedCertType) {
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.taxCertificate = {
			email: email,
			year: selectedCertificates[selectedCertType].map(item => item.year),
			type: selectedCertType
		};
		screenDetails.selectedCertificates = selectedCertificates;
		this.horizonStore.setScreenDetails(screenDetails);
	}

	_formatRequest(item, type) {
		const request = {
			"cif": this.cifNumber
		};

		if (type === `iT3BTaxCertificates`) {
			request.iT3BTaxCertificates = item.taxCertificateAccounts.map(account => ({
				year: item.year,
				documentId: item.documentId,
				accountNumber: account.accountNumber,
				payload: item.payload
			}));
		}

		if (type === `iT3STaxCertificates`) {
			request.iT3STaxCertificates = item.taxCertificateAccounts.map(account => ({
				year: item.year,
				documentId: item.documentId,
				accountNumber: account.accountNumber,
				payload: item.payload
			}));
		};

		return request;
	}

	// ---------------
	// PUBLIC METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderTaxCertificateDialog()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderTaxCertificateDialog() {
		if (!this.taxCertificateDetails) {
			return html``;
		}

		return html`
			<capitec-pc-tax-certificate
				.taxCertificateDetails="${this.taxCertificateDetails}"
				.getTaxCertificatePDFCallback="${(item, type) => this._viewPDF(item, type)}"
				@send="${e => this._send(e)}"
				@next="${e => this._next(e)}"
				@close="${e => this._close()}"
				@back="${e => this._back()}"
				@cancel="${e => this._cancel()}">
			</capitec-pc-tax-certificate>`;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}
customElements.define(`horizon-tax-certificate`, TaxCertificatesDialog);