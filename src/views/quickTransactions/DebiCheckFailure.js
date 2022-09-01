import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/OptionButton';
import 'app/components/common/ErrorScreen';
import 'app/components/common/RelatedOptions';
import { ScreenDetails } from '../../models/ScreenDetails';

/**
 * Display a failure screen indicating the selected debicheck mandate have been unsuccessful when trying to decline/approve.
 *
 * @export
 * @class DebiCheckFailure
 * @extends {ViewBase}
 */
export class DebiCheckFailure extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();
		this.isApproved = ``;
		this.mandateId = ``;

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

		const screenDetails = this.horizonStore.getScreenDetails();
		this.isApproved = screenDetails.isApproved;
		this.mandateId = screenDetails.mandateId;
		this.endCallContext = `QuickTransactionsUnSuccess`;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_doneClick() {
		//this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME_DONE, {
		//    "screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
		//    "next-screen": TelemetryScreen.FAVOURITES
		//});

		this.horizonStore.clearReturnScreen();
		this.horizonRouter.navigateToQuickTransactionFavourites();
	}

	_assignClick() {
		//this._telemetry.logEvent(QuickTransactionEvents.PROOF_OF_ACCOUNT_OUTCOME_HANDOFF, {
		//    "screen": TelemetryScreen.PROOF_OF_ACCOUNT_OUTCOME,
		//    "next-screen": TelemetryScreen.FAVOURITES
		//});

		this.horizonIncidentManager.setIncidentState(super.HORIZON_NEED_STATUS.ASSIGNED);

		this.horizonRouter.navigateToStrack(this.horizonIncidentManager.getCurrentIncident().incidentRecId);
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
				--horizon-error-screen-height:750px;
			}
				#id-error-msg {
					width: auto;
				}
				.button-margin {
					height: 80px;
					width: 182px;
					margin-right:16px;
					--horizon-option-btn-icon-height: 26px;
					--horizon-option-btn-icon-width: 26px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderFailureScreen()}
			
			${this._renderRelatedOptions()}
			${super._webTemplate()}
		`;
	}

	_renderFailureScreen() {
		if (this.isApproved) {
			return html`
			<horizon-error-screen
				data-automation-id="debi-check-failure-screen"
				image="/images/insure/assign-pay-arrears.svg"
				secondaryImage="/images/debi-check/debi-check-logo.svg"
				header="DebiCheck mandate not approved" 
				left="Done"
				right="Assign"
				toast="DebiCheck mandate not approved"
				@left-click=${() => this._doneClick()}
				@right-click=${() => this._assignClick()}>
				<section id="id-error-msg" slot="detail">
					DebiCheck mandate for <b>${this.mandateId}</b> was not approved.
				</section>
			</horizon-error-screen>
		`;
		};
		
		return html`
		<horizon-error-screen
			data-automation-id="debi-check-failure-screen"
			image="/images/insure/assign-pay-arrears.svg"
			secondaryImage="/images/debi-check/debi-check-logo.svg"
			header="DebiCheck mandate not declined" 
			left="Done"
			right="Assign"
			toast="DebiCheck mandate not declined"
			@left-click=${() => this._doneClick()}
			@right-click=${() => this._assignClick()}>
			<section id="id-error-msg" slot="detail">
				DebiCheck mandate for <b>${this.mandateId}</b> was not declined.
			</section>
		</horizon-error-screen>`;
	}

	_renderRelatedOptions() {
		return html`
			<horizon-related-options
			data-automation-id="debi-check-failure-related-options"
				context = "Failure">
			</horizon-related-options>
		`;
	}
}

customElements.define(`horizon-debi-check-failure`, DebiCheckFailure);