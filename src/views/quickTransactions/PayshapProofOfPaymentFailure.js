import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Proof of Account send failure Screen that can be displayed when channel service calls fail. 
 *
 * @export
 * @class ProofOfAccountFailure
 * @extends {ViewBase}
 */

 export class PayshapProofofPaymentFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
		this.endCallContext = `QuickTransactionsUnSuccess`;
		this._telemetry = HorizonTelemetry.instance;
	}

	
	// ----------
	// PROPERTIES
	// ----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.screenDetails = this.horizonStore.getScreenDetails();

		this.mailId = this.screenDetails && this.screenDetails.emailAddress;
		this.acNumber = this.screenDetails && this.screenDetails.accountNumber;
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.PROOF_OF_ACCOUNT, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME_DONE, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_assignClick() {
		this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME_HANDOFF, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});


		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.ASSIGNED;
		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.currentIncident);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon-error-screen {
					--horizon-error-screen-height:768px;
				}
				#id-error-msg {
					width: auto;
                    font-weight:500;
                    color:#3A3A3A;
                    margin-bottom:35px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderProofOfAccountFailure()}
			${this._renderRelatedOptions()}

			${super._webTemplate()}
		`;
	}

	_renderProofOfAccountFailure() {
		return html`
			<horizon-error-screen
				data-automation-id="proof-of-account-failure-screen"
				image="/images/insure/assign-pay-arrears.svg"
				header="Proof of payment not sent" 
				left="Done"
				right="Assign"
				toast="Proof of account not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
				<section id="id-error-msg" slot="detail">
					Your proof of payment document for account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="proof-of-account-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-payshap-proof-of-payment-failure`, PayshapProofofPaymentFailure);