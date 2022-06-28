import { CreditService } from 'app/services/CreditService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { formatStringAsPascalCase } from 'app/utils/channelServiceUtilities';
import { html } from 'platform/elements';

import 'app/components/dialogs/common/ViewAndEmailDocuments';

const DOCUMENT_TYPE = {
	'pay-budget-credit-card': `CreditCardBudgetAccountSettlementLetter`,
	'paid-up-letter-credit-card': `PaidUpLetter`,
	'settlement-quote-credit-card': `SettlementQuote`,
	'settle-close-credit-card': `SettleAndCloseLetter`,

	'paid-up-letter-access-facility': `PaidUpLetter`,
	'settlement-quote-access-facility': `SettlementQuote`,
	'settle-close-access-facility': `SettleAndCloseLetter`,

	'paid-up-letter-term-loan': `PaidUpLetter`,
	'settlement-quote-term-loan': `SettlementQuote`,
	'settle-close-term-loan': `SettleAndCloseLetter`
};

/**
 * A sub-base class of ViewBase for a common functionality of Proof of Payments flow.
 * This sub-class will contain code for the common functionalities like;
 *    - display proof of payment dialog
 *    - handling cancel from proof of payment dialog
 *    - view-document
 *    - send proof of payment and navigate to outcome screen
 *
 * @export
 * @class OutcomeBase
 * @extends {ViewBase}
 */
export class OutcomeBase extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.showEmailModal = false;
		this.telemetryEvents = {};
		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
	}
	
	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			showEmailModal: { state: true }
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
	
	_viewDocument(details) {
		this._telemetry.logEvent(this.telemetryEvents.POP_VIEW_DOCUMENT, {
			"budget-name": details.title,
			"budget-amount": null, // TO DO: Store and Get details from state while wiring up screens 
			"from-account": null // TO DO: Store and Get details from state while wiring up screens
		});
	
		return details.documentData;
	}

	_cancelEmailModal() {
		this._telemetry.logEvent(this.telemetryEvents.POP_CANCEL, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS
		});
		this._telemetry.endSpan(this.telemetryEvents.POP_MODAL, {}, true, true);

		this.showEmailModal = !this.showEmailModal;
	}

	_closePDFViewer() {
		this._telemetry.logEvent(this.telemetryEvents.POP_CLOSE_DOCUMENT, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG
		});
	}

	async _sendCreditDocument(event) {
		const screenDetails = this.horizonStore.getScreenDetails();
		let request;
		if (screenDetails.settleAndCloseCreditOption === `CreditCard`) {
			 request = {
				"cifNumber": this.callerInformation.cifNumber,
				"emailAddress": event.detail.email,
				"documentType": `CreditCardSettlementLetter`,
				"creditType": screenDetails.settleAndCloseCreditOption,
				"data": screenDetails.settleAndCloseDocumentData
			};
			
		} else if (screenDetails.settleAndCloseCreditOption === `Loan`) {
			request = {
				"cifNumber": this.callerInformation.cifNumber,
				"emailAddress": event.detail.email,
				"documentType": `TermLoanSettlementLetter`,
				"creditType": `TermLoan`,
				"data": screenDetails.settleAndCloseDocumentData
			};
			
		} else {
			request = {
				"cifNumber": this.callerInformation.cifNumber,
				"emailAddress": event.detail.email,
				"documentType": DOCUMENT_TYPE[this.incidentDetails.currentNeed],
				"creditType": formatStringAsPascalCase(screenDetails.productType).replace(` `, ``),
				"data": event.detail.documentData
			};
			
		}
		 

		screenDetails.emailAddress = event.detail.email;
		this.horizonStore.setScreenDetails(screenDetails);
		const returnValue = await this.creditService.emailProofOfPayment(request);

		this._telemetry.logEvent(this.telemetryEvents.POP_SEND, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG,
			"next-screen": returnValue.succeeded && returnValue.result?.isSuccess ? TelemetryScreen.PROOF_OF_PAYMENT_SUCCESS : TelemetryScreen.PROOF_OF_PAYMENT_FAILURE,
			"email-address": event.detail.email
		});

		this._telemetry.endSpan(this.telemetryEvents.POP_MODAL);

		if (returnValue.succeeded && returnValue.result.isSuccess) {
			this.horizonRouter.navigateProofOfPaymentSuccess();
			return;
		}
		this.horizonRouter.navigateProofOfPaymentFailure();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	_showPopDialog(popDetails, telemetryEvents, parentSpan) {
		this.emailAccountsList = popDetails;
		this.telemetryEvents = telemetryEvents;

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.parentSpan = parentSpan;
		this.horizonStore.setScreenDetails(screenDetails);
		
		this._telemetry.startSpan(this.telemetryEvents.EMAIL_POP);
		this._telemetry.startSpan(this.telemetryEvents.POP_MODAL);
		
		this.showEmailModal = !this.showEmailModal;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderViewAndSendEmail()}
		`;
	}

	_renderViewAndSendEmail() {
		return this.showEmailModal
		? html`
			<horizon-view-and-send-document
				.emailAccountsList="${this.emailAccountsList}"
				encodedPDF="${this.documentData}"
				registeredEmailId="${this.callerInformation.emailId}"
				.loadDocumentContent="${(documentDetails) => this._viewDocument(documentDetails)}"
				@send-email="${(event) => this._sendCreditDocument(event)}"
				@cancel="${() => this._cancelEmailModal()}"
				@close-pdf="${() => this._closePDFViewer()}">
			</horizon-view-and-send-document>`
		: html``;
	}

}