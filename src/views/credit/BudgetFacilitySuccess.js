import { BUDGET_FACILITY_POP_EVENTS, CreditEvents } from 'app/constants/telemetry/events/Credit';
import { css, html } from 'platform/elements';
import { CreditService } from 'app/services/CreditService';
import { OutcomeBase } from 'app/views/common/OutcomeBase';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';


/**
 * Display an confirmation/success screen indicating the budget facility for the selected account has been paid successfully.
 *
 * @export
 * @class BudgetFacilitySuccess
 * @extends {ViewBase}
 */
export class BudgetFacilitySuccess extends OutcomeBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.budgetName = ``;

		this.creditService = new CreditService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const screenDetails = this.horizonStore.getScreenDetails();
		this.budgetName = screenDetails.accountName;
		this.documentData = screenDetails.documentData;

		this._telemetry.startSpan(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS);
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

		const emailAccountsList = [
			{
				title: this.budgetName,
				subtitle: `Proof of transfer`,
				documentData: this.documentData
			}
		];
		this._showPopDialog(emailAccountsList, BUDGET_FACILITY_POP_EVENTS, CreditEvents.CREDIT_BUDGET_DETAILS);
	}

	_doneClick() {
		this._telemetry.logEvent(CreditEvents.PAY_BUDGET_TRANSFER_SUCCESS_DONE, {
			"screen": TelemetryScreen.CREDIT_PAY_BUDGET_SUCCESS,
			"next-screen": TelemetryScreen.CREDIT_LANDING
		});

		this._telemetry.endSpan(CreditEvents.CREDIT_BUDGET_DETAILS, {}, true, false, true);

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

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

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
			${this._renderRelatedOptions()}
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

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context="Success">
			</horizon-related-options>
		`;
	}

}
customElements.define(`horizon-budget-facility-success`, BudgetFacilitySuccess);