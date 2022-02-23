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
 * @class SettlementQuoteFailure
 * @extends {ViewBase}
 */

 export class SettlementQuoteFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.selectedAccounts = [];
		this.emailAddress = ``;
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

		this.selectedAccounts = this.screenDetails && this.screenDetails.selectedAccounts;
		this.emailAddress = this.screenDetails && this.screenDetails.emailAddress;

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
		const returnToScreen = this.horizonStore.getReturnToScreen();
		this.horizonStore.setReturnScreen(returnToScreen.route, ``);
		
		this.horizonRouter.navigateToReturnPage();
	}

	_assignClick() {
		this.incidentDetails.needStatus = super.HORIZON_NEED_STATUS.ASSIGNED;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		this.horizonRouter.navigateToStrack(this.incidentDetails.incidentRecId);
		this.horizonStore.clearReturnScreen();
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
				data-automation-id="settlement-quote-failure-screen"
				image="/images/statements/senddocuments.svg"
				header="Settlement quote not sent" 
				left="Done"
				right="Assign"
				toast="Settlement quote not sent"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
				<section id="id-error-msg" slot="detail">
						Settlement quote for ${this.selectedAccounts[0].accountName.toLowerCase()} was not emailed to <b>${this.emailAddress}</b>.
				</section>
			</horizon-error-screen>
		`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
				data-automation-id="settlement-quote-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}

}

customElements.define(`horizon-settlement-quote-failure`, SettlementQuoteFailure);