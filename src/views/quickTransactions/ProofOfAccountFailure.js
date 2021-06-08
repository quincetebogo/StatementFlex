import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
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

 export class ProofOfAccountFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.mailId = ``;
		this.acNumber = ``;
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
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.FAILED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
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

	_assignClick() {

		// Telemetry
		HorizonTelemetry.instance.proofOfAccountOutcome({
			screen: TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
			nextScreen: TelemetryScreen.PROOF_OF_ACCOUNT
		});

		this.horizonRouter.navigateToReturnPage(`proofofaccount`);
		// TODO: might make service call over here to resend or navigate to Proof of account model again
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				horizon--error-screen {
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
			<horizon--error-screen
				image="/images/insure/assign-pay-arrears.svg"
				header="Proof of account not sent" 
				left="Done"
				right="Assign"
				toast="Proof of account not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
				<section id="id-error-msg" slot="detail">
					Your proof of account document for account <b>${this.acNumber}</b> was not emailed to <b>${this.mailId}</b>
				</section>
			</horizon--error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-proof-of-account-failure`, ProofOfAccountFailure);