import { Component, html } from 'platform/elements';
import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { Logger, NavigationContext } from 'platform/core';
import { base64ToBlobUrl, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { QuickTransactionsService } from 'app/services/QuickTransactionsService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/HorizonExpander';
import 'app/components/common/HorizonEmailInput';
import 'app/productControls/taxCertificates/src/TaxCertificates';


const MESSAGE_OPTION = {
	'iT3STaxCertificates': `SEND_IT3S_STATEMENT`,
	'iT3BTaxCertificates': `SEND_IT3B_STATEMENT`,
	'both': `SEND_IT3B_AND_IT3S_STATEMENT`
};

/**
 * Tax Certificates dialog is used to send tax certificates from the primary savings account.
 * This component is invoked from the Favourites landing screen.
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
		this.navigationContext = NavigationContext.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.taxCertificateDetails = null;

		this.quickTransactionService = new QuickTransactionsService(() => this._toggleBusyFlag(), () => true);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {string} cifNumber The client's CIF number
	 * @property {String} accountNumber Primary savings account number
	 */
	static get properties() {
		return {
			cifNumber: { type: String },
			accountNumber: { type: String },
			taxCertType: { type: String, attribute: `type` },

			// Private Properties
			isBusy: { attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.callerInformation = this.horizonStore.getCallerInformation();
		
		this._loadTaxCertificates();
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
	async _back() {
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_BACK, {
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

		const request = this._formatSendRequest(selectedCertType, selectedCertificates, email);
		
		const returnValue = await this.quickTransactionService.sendTaxCertificate(request, () => true);
		
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_SELECT_SEND, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": returnValue.succeeded ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
		});
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `tax-certificate`);
		
		if (returnValue.succeeded) {
			this.horizonRouter.navigateToTaxCertificateSuccessful();
			return;
		}

		this.logger.log(`error`, `Unable to send tax certificates`, `_sendTaxCertificateDocument`, returnValue.correlationId);
		this.horizonRouter.navigateToTaxCertificateFailure();
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
		const selectedDocuments = [];
		const selectedCertType = e.detail.selectedCertType;
		const selectedCertificates = e.detail.selectedCertificates;
		
		if (selectedCertificates.iT3BTaxCertificates && (selectedCertType === `iT3BTaxCertificates` || selectedCertType === `both`)) {
			selectedDocuments.push(...selectedCertificates.iT3BTaxCertificates.map(certificate => ({
				"document-type": `iT3B`,
				"certificate-period": certificate.year
			})));
		}

		if (selectedCertificates.iT3STaxCertificates && (selectedCertType === `iT3STaxCertificates` || selectedCertType === `both`)) {
			selectedDocuments.push(...selectedCertificates.iT3STaxCertificates.map(certificate => ({
				"document-type": `iT3S`,
				"certificate-period": certificate.year
			})));
		}

		this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_NEXT, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": null,
			"certificate-type": e.detail.selectedCertType.replace(`TaxCertificates`, ``),
			"selected-documents": selectedDocuments
		});
	}

	async _viewPDF(item, type) {
		await this._telemetry.logEvent(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP_VIEW_DOCUMENT, { 
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.TAX_CERTIFICATE_DOCUMENT
		});

		if (type === `iT3BTaxCertificates`) {
			return base64ToBlobUrl(item.contentData);
		}

		const request = this._formatViewCertificateRequest(item, type);

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

	async _getIT3BContentData(selectedCertificates) {
		if (!selectedCertificates.iT3BTaxCertificates || selectedCertificates.iT3BTaxCertificates.length === 0) {
			return [];
		}

		const request = {
			cif: this.cifNumber,
			iT3STaxCertificates: [],
			iT3BTaxCertificates: selectedCertificates.iT3BTaxCertificates.map(item => {
				const temp = {
					year: item.year,
					documentId: item.documentId,
					accountNumber: this.accountNumber,
					payload: item.payload
				};
				return temp;
			})
		};
		const returnValue = await this.quickTransactionService.viewTaxCertificate(request, () => true);
	
		if (returnValue.succeeded && !isNullorEmpty(returnValue.result)) {
			const result = returnValue.result;
			
			selectedCertificates.iT3BTaxCertificates.forEach(item => {
				const docData = result.iT3BDocuments.find(doc => doc.year === item.year && doc.documentId === item.documentId);
				item.contentData = docData.contentData;
			});
			return true;
		}
	
		this.logger.log(`error`, `Unable to get iT3S content data`, `_getIT3SContentData`, returnValue.correlationId);
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
			
		this._telemetry.startSpan(QuickTransactionEvents.TAX_CERTIFICATE_POP_UP, {
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
			type: selectedCertType
		};

		if (selectedCertificates.iT3BTaxCertificates) {
			screenDetails.taxCertificate.iT3BTaxCertificates = {};
			screenDetails.taxCertificate.iT3BTaxCertificates.taxYears = selectedCertificates.iT3BTaxCertificates.map(certificate => certificate.year).reverse();
		}

		if (selectedCertificates.iT3STaxCertificates) {
			screenDetails.taxCertificate.iT3STaxCertificates = {};
			screenDetails.taxCertificate.iT3STaxCertificates.taxYears = selectedCertificates.iT3STaxCertificates.map(certificate => certificate.year).reverse();
		}

		this.horizonStore.setScreenDetails(screenDetails);
	}

	_getMessageOption(selectedCertificates) {
		
		return selectedCertificates.iT3STaxCertificates ? MESSAGE_OPTION.iT3STaxCertificates : MESSAGE_OPTION.iT3BTaxCertificates;
	}

	_formatSendRequest(selectedCertType, selectedCertificates, email) {
		const documentIds = [];
		const attachments = [];
		const messageOption = selectedCertificates.iT3BTaxCertificates && selectedCertificates.iT3STaxCertificates
		? MESSAGE_OPTION.both
		: this._getMessageOption(selectedCertificates);

		if (selectedCertificates.iT3BTaxCertificates && (selectedCertType === `iT3BTaxCertificates` || selectedCertType === `both`)) {
			attachments.push(...selectedCertificates.iT3BTaxCertificates.map(item => {
				const temp = {
					name: `${item.year} IT3b Tax Certificate`,
					data: item.contentData
				};
				return temp;
			}));
		}

		if (selectedCertificates.iT3STaxCertificates && (selectedCertType === `iT3STaxCertificates` || selectedCertType === `both`)) {
			documentIds.push(...selectedCertificates.iT3STaxCertificates.map(item => item.documentId));
		}
		
		const request = {
			"cif": this.cifNumber,
			"emailAddress": email,
			"messageOption": messageOption,
			"documentIds": documentIds,
			"messageParameters": {
				"title": this.taxCertificateDetails.title,
				"surname": this.taxCertificateDetails.lastName
			},
			"attachments": attachments
		};
		
		return request;
	}

	_formatViewCertificateRequest(item, type) {

		/**
		 * Rule for picking account num to view iT3S/ iT3B
		 *  - To view a iT3B doc for any year its decided we can always pass primary savings account number
		 *  - And for iT3S, since it will have only one account in a year, we can use the specific account number
		 */
		const [first] = item.taxCertificateAccounts; // Extracting first element from taxcertificate accounts array
		const request = {
			"cif": this.cifNumber,
			"iT3BTaxCertificates": [],
			"iT3STaxCertificates": []
		};

		request[type].push({
			year: item.year,
			documentId: item.documentId,
			accountNumber: type === `iT3STaxCertificates` ? first.accountNumber : this.accountNumber,
			payload: type === `iT3BTaxCertificates` ? item.payload : null
		});

		return request;
	}

/*
	_formatViewCertificateRequest(item, type) {
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
				payload: null
			}));
		};

		return request;
	}
*/

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
				taxCertType="${this.taxCertType}"
				.taxCertificateDetails="${this.taxCertificateDetails}"
				registeredEmailId="${this.callerInformation.emailId}"
				.getTaxCertificatePDFCallback="${(item, type) => this._viewPDF(item, type)}"
				.getIT3BContentData="${(selectedCertificates) => this._getIT3BContentData(selectedCertificates)}"
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