import { BUDGET_FACILITY_POP_EVENTS, CreditEvents } from 'app/constants/telemetry/events/Credit';
import { css, html } from 'platform/elements';
import { CreditService } from 'app/services/CreditService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/ViewAndEmailDocuments';
import 'app/views/credit/ProofOfPaymentSuccess';
import 'app/views/credit/ProofOfPaymentFailure';

const DOCUMENT_TYPE = `CreditCardBudgetAccountSettlementLetter`;

/**
 * Display an confirmation/success screen indicating the budget facility for the selected account has been paid successfully.
 *
 * @export
 * @class BudgetFacilitySuccess
 * @extends {ViewBase}
 */
 export class BudgetFacilitySuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.budgetName = ``;
		this.showEmailModal = false;

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
		
		const screenDetails = this.horizonStore.getScreenDetails();
		this.budgetName = screenDetails.accountName;
		this.documentData = screenDetails.documentData;

		this._telemetry.startSpan(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS);
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_sendEmailClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_SUCCESS_SEND_POP, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS,
			"next-screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG
		});
		
		this._telemetry.endSpan(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS);

		this.emailAccountsList = [
				{
					title: this.budgetName,
					subtitle: `Proof of transfer`,
					documentData: this.documentData
				}
			];
		
		this._telemetry.startSpan(BUDGET_FACILITY_POP_EVENTS.EMAIL_POP);
		this._telemetry.startSpan(BUDGET_FACILITY_POP_EVENTS.POP_MODAL);
		
		this.showEmailModal = !this.showEmailModal;
	}

	_doneClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS_DONE, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS);
		this._telemetry.endSpan(CreditEvents.CREDIT_BUDGET_TRANSFER, {}, true, true);

		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToCreditAccount();
		this.horizonStore.clearScreenDetails();
	}

	_payAnotherClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS_PAY_ANOTHER, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_BUDGET_ACCOUNT
		});

		this._telemetry.endSpan(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS, {}, true, true);

		this.horizonRouter.navigateToReturnPage();
	}

	async _sendPayBudgetPOP(event) {
	
		const request = {
			"cifNumber": this.callerInformation.cifNumber,
			"emailAddress": event.detail.email,
			"documentType": DOCUMENT_TYPE,
			"creditType": `CreditCard`,
			"data": event.detail.documentData
		};

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.emailAddress = event.detail.email;
		this.horizonStore.setScreenDetails(screenDetails);

		const returnValue = await this.creditService.emailProofOfPayment(request);

		this._telemetry.logEvent(BUDGET_FACILITY_POP_EVENTS.POP_SEND, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG,
			"next-screen": returnValue.succeeded && returnValue.result.isSuccess ? TelemetryScreen.PROOF_OF_PAYMENT_SUCCESS : TelemetryScreen.PROOF_OF_PAYMENT_FAILURE,
			"email-address": event.detail.email
		});

		this._telemetry.endSpan(BUDGET_FACILITY_POP_EVENTS.POP_MODAL);

		if (returnValue.succeeded && returnValue.result.isSuccess) {
			this.horizonRouter.navigateProofOfPaymentSuccess();
			return;
		}
		this.horizonRouter.navigateProofOfPaymentFailure();
	}

	_cancelEmailModal() {
		this._telemetry.logEvent(BUDGET_FACILITY_POP_EVENTS.POP_CANCEL, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG,
			"next-screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS
		});
		this._telemetry.endSpan(BUDGET_FACILITY_POP_EVENTS.POP_MODAL, {}, true, true);

		this.showEmailModal = !this.showEmailModal;
	}

	_viewDocument(details) {
		this._telemetry.logEvent(BUDGET_FACILITY_POP_EVENTS.POP_VIEW_DOCUMENT, {
			"budget-name": details.title,
			"budget-amount": null, // TO DO: Store and Get details from state while wiring up screens 
			"from-account": null // TO DO: Store and Get details from state while wiring up screens
		});
	
		return details.documentData;
	}

	_closePDFViewer() {
		this._telemetry.logEvent(BUDGET_FACILITY_POP_EVENTS.POP_CLOSE_DOCUMENT, {
			"screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG
		});
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

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-success-screen {
					--theme-slot-detail-width: auto;
				}
				.success-msg {
					width: auto;
				}
				span {
					cursor: pointer;
					color: #009DE0;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			${this._renderSuccessScreen()}
			${this._renderViewAndSendEmail()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="budget-facility-success-screen"
				header="Budget facility paid"
				image="/images/credit/budget-facility.svg"
				left="Pay Another"
				right="Done"
				toast="Budget facility paid"
				?subContent=${true}
				@left-click=${() => this._payAnotherClick()}
				@right-click=${() => this._doneClick()}>
					${this._renderDetail()}
					${this._renderSubContent()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="detail">
					Budget facility for <strong>${this.budgetName}</strong> has been paid.
			</section>
		`;
	}

	_renderSubContent() {
		return html`
			<section slot="sub-content">
				Would you like proof of payment? 
				<span @click="${() => this._sendEmailClick()}">Send Email Confirmation</span>
			</section>
		`;
	}

	_renderViewAndSendEmail() {
		return this.showEmailModal
		? html`
			<horizon-view-and-send-document
				.emailAccountsList="${this.emailAccountsList}"
				encodedPDF="${this.documentData}"
				.loadDocumentContent="${(documentDetails) => this._viewDocument(documentDetails)}"
				@send-email="${(event) => this._sendPayBudgetPOP(event)}"
				@cancel="${() => this._cancelEmailModal()}"
				@close-pdf="${() => this._closePDFViewer()}">
			</horizon-view-and-send-document>`
		: html``;
	}

}
customElements.define(`horizon-budget-facility-success`, BudgetFacilitySuccess);