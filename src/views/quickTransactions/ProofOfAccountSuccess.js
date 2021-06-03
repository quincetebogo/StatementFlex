import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
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
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {

		// Telemetry
		HorizonTelemetry.instance.proofOfAccountOutcome({
			screen: TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			nextScreen: TelemetryScreen.FAVOURITES
		});
	
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_sendAnotherClick() {
		
		// Telemetry
		HorizonTelemetry.instance.proofOfAccountOutcome({
			screen: TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			nextScreen: TelemetryScreen.PROOF_OF_ACCOUNT
		});
		
		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.returnToOption = this.incidentDetails.currentNeed;
		
		this.horizonStore.setScreenDetails(screenDetails);
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateIncidentState() {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		incidentDetails.needStatus = super.HORIZON_NEED_STATUS.COMPLETED;
		this.horizonStore.setIncidentDetails(incidentDetails);
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
				header="Proof of account sent" 
				image="/images/statements/senddocuments.svg"
				left="Done"
				right="Send Another"
				toast="Proof of Account Sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._sendAnotherClick()}>
					<section id="id-error-msg" slot="detail">
						Your proof of account document for account <b>${this.acNumber}</b> has been emailed to <b>${this.mailId}</b>.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-proof-of-account-success`, ProofOfAccountSuccess);