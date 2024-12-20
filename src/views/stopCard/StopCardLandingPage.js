import { HorizonTelemetry, OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { css, html } from 'platform/elements';
import { NavigationContext } from 'platform/core';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'platform/components/buttons/Button';
import 'app/components/stopCard/StopCard';
import 'app/components/stopCard/CardHistory';

/**
 * The Stop Card Landing Page. This view is currently based on the v1 Stop Card designs and will be completely redone
 * with the newer designs at some point.
 *
 * @export
 * @class StopCardLandingPage
 * @extends {ViewBase}
 */
export class StopCardLandingPage extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.screenDetails = this.horizonStore.getScreenDetails();
		this.cards = this.screenDetails && this.screenDetails.cards;

		this._telemetry = HorizonTelemetry.getInstance();
		this.navigationContext = NavigationContext.getInstance();
		this.displayToast = false;
		this.cardsDetails = {};
		this.renderMode = RENDER_MODE.MAIN_PAGE;
		this.context = `sc`; // stop card
	}

	// --------------
	// PROPERTIES
	// --------------
	static get properties() {
		return {
			displayToast: { attribute: false },
			renderMode: { attribute: false }
		};
	}

	// ------------------
	// LIFCYCLE OVERRIDES
	// ------------------

	connectedCallback() {
		super.connectedCallback();
		this.horizonIncidentManager.setCurrentNeed(`stop-card`);

		const state = this.horizonStore.recoverState();
		this.landingPageInfo = state.landingPageInfo;
		this._updateLeftBar();

		this._telemetry.startSpan(QuickTransactionEvents.FULFILL_NEED, {
			"screen": TelemetryScreen.STOP_CARD
		});

		const { pathParams } = this.navigationContext.current;
		this.context = pathParams.context || this.context;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_clientVerified(event) {
		super._clientVerified(event);

		// Toggle the toast message 
		this.displayToast = true;
		window.setTimeout(() => this._toggleToastDisplay(), 3000);

		// Prevent the toast from being displayed when we go to the Favourites landing page
		// because we are now verified
		this.callerInformation = event.detail.callerInformation;
		this.callerInformation.verificationToastDisplayed = true;

		// Update state with information from verification dialog
		this.horizonStore.setCallerInformation(this.callerInformation);
		this.horizonStore.setIncomingCallDetails(event.detail.incomingCallDetails);
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	_stoppedCards(event) {
		const stoppedCardsFailed = event.detail.stoppedCards.some(cards => !cards.cardStopped);

		// The stop card incident can be closed if all cards were stopped successfully.
		// Otherwise we go to the failure screen where a retry can be attempted or an assignment done
		const screenDetails = this.horizonStore.getScreenDetails();

		screenDetails.stoppedCards = event.detail.stoppedCards;
		screenDetails.cardStopAttemptMade = true;
		screenDetails.stoppedCardsFailed = stoppedCardsFailed;

		this.horizonStore.setScreenDetails(screenDetails);
		this._telemetry.logEvent(QuickTransactionEvents.STOP_CARD_OUTCOME, {
			"screen": TelemetryScreen.STOP_CARD_OUTCOME,
			"next-screen": stoppedCardsFailed ? OutcomeScreen.FAIL : OutcomeScreen.SUCCESS
		}, true);

		if (stoppedCardsFailed) {
			this.horizonRouter.navigateToStopCardFailed();
		} else {
			this.horizonRouter.navigateToStoppedCards(this.context);
		}
	}

	async _cardHistory(_event) {
		this._telemetry.logEvent(QuickTransactionEvents.CARD_HISTORY, {
			"screen": TelemetryScreen.STOP_CARD,
			"next-screen": TelemetryScreen.CARD_HISTORY_PAGE
		});

		this.horizonIncidentManager.setCurrentNeed(`card-history`);
		await this.createAndClassifySubIncident();

		const returnValue = await this.cardService.getStoppedCardDetails(this.callerInformation, this.horizonIncidentManager.getIncidentDetails());

		if (returnValue.succeeded) {

			this.cardsDetails = this.horizonStore.getScreenDetails();
			this.cardsDetails.cards = returnValue.result && returnValue.result.cards;
			this.horizonStore.setScreenDetails(this.cardsDetails);

			this.renderMode = RENDER_MODE.CARD_HISTORY_VIEW;
		} else {
			this.horizonRouter.navigateToSystemError();
		}


	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateLeftBar() {
		this.horizonStore.setProductButtonState(this.landingPageInfo);
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_toggleToastDisplay() {
		this.displayToast = false;
	}

	_setIncidentDone() {
		/* Removed during incident management refactor
		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.COMPLETED;
		*/
		this.renderMode = RENDER_MODE.MAIN_PAGE;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				#verifyToast {
					position: absolute;
					top : 70px;
					left: 790px;
					height: 64px;
					width: 428px;
					border-radius: 4px;
					color: #70AF00;
					z-index: 201;
					left: calc(50.8% - 200px);
					justify-content: center;
					align-items: center;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderStopCardComponent()}
			${this._renderVerifiedToast()}
			${this._renderCardHistoy()}
			${super._webTemplate()}
		`;
	}

	_renderStopCardComponent() {
		return this.renderMode === RENDER_MODE.MAIN_PAGE
			? html`
			<horizon-stop-card
				data-automation-id="stop-card-landing-page"
				.cards="${this.cards || []}"
				.incomingCallDetails="${this.incomingCallDetails}"
				.shouldDisableByRole="${need => this._shouldDisableByRole(need)}"
				@cards-stopped="${(event) => this._stoppedCards(event)}"
				@card-history="${(event) => this._cardHistory(event)}">
			</horizon-stop-card>
			${this._renderLoadingIndicator()}`
			: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="stop-card-landing-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderVerifiedToast() {
		if (this.displayToast) {
			return html`
				<capitec-toast
					data-automation-id="stop-card-verified-toast"
					id="verifyToast"
					type="success"
					header="Successful"
					detail="Thank you, you have been verified."
					closable>
				</capitec-toast>`;
		}
		return html``;
	}

	_renderCardHistoy() {
		return this.renderMode === RENDER_MODE.CARD_HISTORY_VIEW
			? html`
			<horizon-card-history
				.cardHistoryDetails = "${this.cardsDetails || []}" 
				@back = "${() => this._setIncidentDone()}">
			</horizon-card-history>`
			: html``;
	}
}

customElements.define(`horizon-stop-card-landing-page`, StopCardLandingPage);