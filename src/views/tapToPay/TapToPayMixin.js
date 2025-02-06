import { OutcomeScreen } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { RENDER_MODE } from 'app/views/common/RenderModes';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { html } from 'platform/elements';

/**
 * This mixin allows common tap to pay code to be mixed into different views. 
 * The view must use the horizon-tap-to-pay-landing component. 
 * This mixin provides the code that sets up the component. Call back functions
 * and event handlers are provided here.
 * 
 */
export const tapToPayMixin = {
	async _tapToPay() {
		this._telemetry.logEvent(QuickTransactionEvents.FAVOURITES_TAP_TO_PAY, {
			"screen": TelemetryScreen.FAVOURITES,
			"next-screen": TelemetryScreen.TAP_TO_PAY
		});

		const currentIncident = this.horizonIncidentManager.currentIncident;

		const returnValue = await this.cardService.tapToPayLanding(this.callerInformation.cifNumber, currentIncident);

		if (returnValue.succeeded) {
			this.cards = returnValue.result.cards;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		} else {
			this.logger.log(`error`, `Unable to load Tap To Pay Landing Page data`, `_tapToPay`, returnValue.correlationId);
		}
	},

	async _updateTapToPay(updateRequest) {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_UPDATE, {
			"screen": TelemetryScreen.TAP_TO_PAY,
			"next-screen": TelemetryScreen.TAP_TO_PAY_OUTCOME
		});

		const returnValue = await this.cardService.updateTapToPay(updateRequest, (ex) => this._tapToPayErrorHandler(ex));

		if (returnValue.succeeded) {
			this._tapToPayResult({ detail: { success: true, tapToPayDetails: updateRequest } });
		} else {
			this._tapToPayResult({ detail: { success: false, failureReason: "Failed to activate Tap to Pay" } });
		}
	},

	_tapToPayErrorHandler(ex) {
		return true;
	},

	_tapToPayResult(eventData) {
		this._telemetry.logEvent(QuickTransactionEvents.TAP_TO_PAY_OUTCOME, {
			"screen": TelemetryScreen.TAP_TO_PAY_OUTCOME,
			"next-screen": eventData.detail.success ? OutcomeScreen.SUCCESS : OutcomeScreen.FAIL
		}, true);

		const screenDetails = this.horizonStore.getScreenDetails();
		screenDetails.tapToPayDetails = eventData.detail.tapToPayDetails;
		this.horizonStore.setScreenDetails(screenDetails);
		
		this.horizonStore.setReturnScreen(this.navigationContext.current.route, `tap-to-pay`);

		if (eventData.detail.success) {
			this.horizonRouter.navigateToTapToPaySuccess();
		} else {
			this.logger.log(`error`, eventData.detail.failureReason);
			this.horizonRouter._navigateToTapToPayUnsuccessful();
		}
	},

	_renderTapToPay() {
		return this.renderMode === RENDER_MODE.TAP_TO_PAY
			? html`
            <horizon-tap-to-pay-landing
                .cards="${this.cards}"
                .cifNumber=${this.callerInformation.cifNumber}
                client-title="${this.callerInformation.title}"
                .lastName="${this.callerInformation.lastName}"
                .updateAgreement="${renderRequest => this._updateTapToPay(renderRequest)}"
                @loading="${() => this._telemetryStartSpan(QuickTransactionEvents.TAP_TO_PAY, TelemetryScreen.TAP_TO_PAY)}"
                @back="${() => this._backToLandingPage()}"
                @result=${eventData => this._tapToPayResult(eventData)}
            ></horizon-tap-to-pay-landing>
        ` : html``;
	}
};
