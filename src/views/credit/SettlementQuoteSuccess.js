import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
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
export class SettlementQuoteSuccess extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedAccounts = [];
		this.emailAddress = ``;
		this.endCallContext = `QuickTransactionSuccess`;
		this._telemetry = HorizonTelemetry.instance;
	}

	// ----------
	// PROPERTIES
	// ----------
	
	// N/A

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		
		this.screenDetails = this.horizonStore.getScreenDetails();

		this.selectedAccounts = this.screenDetails && this.screenDetails.selectedAccounts;
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;
		
		this._updateIncidentState();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);

		this.horizonRouter.navigateToReturnPage();
	}

	_sendAnotherClick() {
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

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
				data-automation-id="settlement-quote-success-screen"
				header="Settlement quote sent" 
				image="/images/statements/senddocuments.svg"
				left="Send Another"
				right="Done"
				toast="Settlement quote sent"
				@left-click=${() => this._sendAnotherClick()}
				@right-click=${() => this._doneClick()}>
					<section id="id-error-msg" slot="detail">
						Settlement quote for ${this.selectedAccounts[0].accountName.toLowerCase()} has been emailed to <b>${this.emailAddress}</b>.
					</section>
			</horizon-success-screen>
		`;
	}

}

customElements.define(`horizon-settlement-quote-success`, SettlementQuoteSuccess);