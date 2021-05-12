import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from '../common/ViewBase';

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
		
		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
	}


	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @readonly
	 * @static
	 * @memberof ProofOfAccountSuccess
	 */
	static get properties() {
		return {
			renderMode: { attribute: false },

			list: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		const state = this.horizonStore.recoverState();

		if (state) {
			this.incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			this.incidentDetails = this.horizonStore.getIncidentDetails();

			this.mailId = state.emailAddress;
            this.acNumber = state.accountNumber;

		}
		this._updateIncidentState();
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
		
		const state = this.horizonStore.recoverState();
		state.returnToScreen.option = this.incidentDetails.currentNeed;
		
		this.horizonStore.saveState({ returnToScreen: state.returnToScreen });
		
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