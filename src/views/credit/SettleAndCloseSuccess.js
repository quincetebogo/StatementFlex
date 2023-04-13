import { CREDIT_TYPE, PRODUCTS } from 'app/constants/Credit';
import { css, html } from 'platform/elements';
import { OutcomeBase } from '../common/OutcomeBase';
import { SETTLE_AND_CLOSE } from 'app/constants/telemetry/events/Credit';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';
import { creditMixin } from 'app/views/credit/CreditMixin';
import 'app/components/common/SuccessScreen';

/**
 * Display an confirmation/success screen indicating the selected account has been settle and closed successfully.
 *
 * @export
 * @class SettleAndCloseSuccess
 * @extends {ViewBase}
 */
 export class SettleAndCloseSuccess extends OutcomeBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.creditCardNumber = ``;
		this.creditType = ``;
		this.accountName = ``;

		this.settleAndCloseTelemetryEvents = {};
		
		this.primaryToast = `Account Settled`;
		Object.assign(SettleAndCloseSuccess.prototype, creditMixin);
	}

	get incidentDescription() {
		const settleAccDetails = this.type === PRODUCTS.TERM_LOAN
								? `Loan Account: ${this.creditCardNumber}`
								: `Credit Card Account Number: ${this.creditCardNumber}`;
		return `From Account Number: ${this.fromAccountNumber}\n${settleAccDetails}\nSettlement Amount Paid: ${this.settlementAmount}`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this._initialise();

		this._telemetry.startSpan(this.settleAndCloseTelemetryEvents.SUCCESS);
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------
	_initialise() {
		const screenDetails = this.horizonStore.getScreenDetails();
		this.creditType = screenDetails.settleAndCloseCreditType;
		this.creditCardNumber = screenDetails.settleAndCloseAccountNumber;
		this.accountName = screenDetails.accountName;
		this.type = screenDetails.type;
		this.settlementAmount = screenDetails.settlementAmount;
		this.fromAccountNumber = screenDetails.fromAccountNumber;
		
		this.primaryToast = this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account settled and closed` : `Account settled`;
		this.settleAndCloseTelemetryEvents = SETTLE_AND_CLOSE[this.creditType];
	}

	_sendEmailConfirmationClick() {
		this._telemetry.logEvent(this.settleAndCloseTelemetryEvents.SUCCESS_SEND_POP, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_SUCCESS : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN_SUCCESS,
			"next-screen": TelemetryScreen.PROOF_OF_PAYMENT_DIALOG
		});
		
		const screenDetails = this.horizonStore.getScreenDetails();
		const emailAccountsList = [
			{
				title: this.accountName,
				subtitle: this.creditType === CREDIT_TYPE.FLEXIBLE ? `Settle and Close` : `Settle term loan`,
				documentData: screenDetails.settleAndCloseDocumentData
			}
		];

	this._showPopDialog(emailAccountsList, this.settleAndCloseTelemetryEvents.POP_EVENTS, this.settleAndCloseTelemetryEvents.NEED);
	}

	_doneClick() {
		this._telemetry.logEvent(this.settleAndCloseTelemetryEvents.SUCCESS_DONE, {
			"screen": this.creditType === CREDIT_TYPE.FLEXIBLE ? TelemetryScreen.CREDIT_SETTLE_CLOSE_SUCCESS : TelemetryScreen.CREDIT_SETTLE_TERM_LOAN_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(this.settleAndCloseTelemetryEvents.SUCCESS, {}, true, true);
	
		this.horizonRouter.navigateToCreditAccount();
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
		this.incidentDetails.description = this.incidentDescription;
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
			${this._renderSuccessScreen()}
			${super._webTemplate()}
		`;
	}

	_renderSuccessScreen() {
		return html`
			<horizon-success-screen
				data-automation-id="settle-and-close-success"
				header="${this.creditType === CREDIT_TYPE.FLEXIBLE ? `Account has been settled and closed` : `Account has been settled`}"
				image="/images/credit/settle-and-close-account.svg"
				right="Done"
				toast="${this.primaryToast}"
				?hasSubDetails=${this.creditType === CREDIT_TYPE.FLEXIBLE}
				?subContent=${true}
				@right-click=${() => this._doneClick()}>
					${this._renderDetail()}
					${this._renderSubDetail()}
					${this._renderSubContent()}
			</horizon-success-screen>
		`;
	}

	_renderDetail() {
		return html`
			<section 
				class="id-update-msg" 
				slot="detail">
					Your ${this.accountName} account <strong>${this.creditCardNumber}</strong> has been ${this.creditType === CREDIT_TYPE.FLEXIBLE ? `settled and closed.` : `settled.`}
			</section>
		`;
	}

	_renderSubDetail() {
		return this.creditType === CREDIT_TYPE.FLEXIBLE 
		? html`
			<section 
				class="id-update-msg" 
				slot="sub-detail">
					${this.accountName} was stopped successfully.
			</section>`
		: html``;
	}

	_renderSubContent() {
		return html`
			<section slot="sub-content">
				<strong>Would you like proof of payment?</strong>
				<span @click="${() => this._sendEmailConfirmationClick()}">Send Email Confirmation</span>
			</section>
		`;
	}

}
customElements.define(`horizon-settle-and-close-success`, SettleAndCloseSuccess);