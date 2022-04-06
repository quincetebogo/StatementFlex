import { css, html } from 'platform/elements';
import { CreditService } from 'app/services/CreditService';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/dialogs/common/ViewAndEmailDocuments';

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
		this.budgetName = screenDetails.budgetAccountName;
		this.documentData = screenDetails.documentData;

		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_sendEmailConfirmationClick() {
		this.popDetails = {
			action: `Pay Budget`,
			accountsList: [ 
				{
					title: this.budgetName,
					subtitle: `Proof of transfer`
				}
			]
		};
		
		this.showEmailModal = !this.showEmailModal;
	}

	_doneClick() {
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToCreditAccount();
		this.horizonStore.clearScreenDetails();
	}

	_payAnotherClick() {
		this.horizonRouter.navigateToReturnPage();
	}

	async _onSendPayBudgetPOP(event) {
		const request = {
			"cifNumber": this.callerInformation.cifNumber,
			"emailAddress": event.detail.email,
			"documentType": `CreditCardBudgetAccountSettlementLetter`,
			"creditType": `CreditCard`,
			"data": event.detail.documentData
		};

		const returnValue = await this.creditService.emailProofOfPayment(request);

		if (returnValue.succeeded && returnValue.result.isSuccess) {
			// TO DO: Navigation to the email success screen
		}
		// TO DO: Navigation to the email failure screen
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
				<span @click="${() => this._sendEmailConfirmationClick()}">Send Email Confirmation</span>
			</section>
		`;
	}

	_renderViewAndSendEmail() {
		return this.showEmailModal
		? html`
			<horizon-view-and-send-document
				.popDetails="${this.popDetails}"
				.loadDocumentContent="${() => this.documentData}"
				@send-email="${(event) => this._onSendPayBudgetPOP(event)}"
				@cancel="${() => this.showEmailModal = !this.showEmailModal}">
			</horizon-view-and-send-document>`
		: html``;
	}

}
customElements.define(`horizon-budget-facility-success`, BudgetFacilitySuccess);