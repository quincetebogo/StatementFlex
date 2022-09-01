import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/SuccessScreen';
import 'app/components/common/RelatedOptions';

/**
 * Display an confirmation/success screen indicating the proof of account statement has been successfully sent.
 *
 * @export
 * @class ProofOfAccountSuccess
 * @extends {ViewBase}
 */
export class ProofOfAccountSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.acNumber = ``;
		this.mailId = ``;
		this.endCallContext = `QuickTransactionSuccess`;
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
		
		this._updateIncidentState();
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

	_sendAnotherClick() {
		this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME_ANOTHER, {
			"screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			"next-screen": TelemetryScreen.FAVOURITES
		});
		
		this.horizonRouter.navigateToReturnPage();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		this.horizonIncidentManager.IncidentState = super.HORIZON_NEED_STATUS.COMPLETED;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				#id-error-msg {
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
				data-automation-id="proof-of-account-success-screen"
				header="Proof of account sent" 
				image="/images/statements/send-documents.svg"
				left="Send Another"
				right="Done"
				toast="Proof of Account Sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section id="id-error-msg" slot="detail">
						Your proof of account document for account <b>${this.acNumber}</b> has been emailed to <b>${this.mailId}</b>.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-proof-of-account-success`, ProofOfAccountSuccess);