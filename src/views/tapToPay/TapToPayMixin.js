import { HorizonTelemetry, TelemetryScreen } from 'app/services/HorizonTelemetryService';
import { RENDER_MODE } from 'app/views/common/RenderModes';

/**
 * This mixin allows common tap to pay code to be mixed into different views. 
 * The view must use the horizon-tap-to-pay-landing component. 
 * This mixin provides the code that sets up the component. Call back functions
 * and event handlers are provided here.
 * 
 *   this.navigationContext
 *   this.logger

 *   this.horizonStore
 *   this.horizonRouter
 * 
*    this.quickTransactionService

 *   this.renderMode 
 *   this.callerInformation
 *   this.incidentDetails
 * 
 *   this.cards
 */
export const tapToPayMixin = {
	async _tapToPay() {

		// Telemetry select Tap to Pay
		HorizonTelemetry.instance.selectTapToPay({
			screen: TelemetryScreen.FAVOURITES,
			nextScreen: TelemetryScreen.TAP_TO_PAY
		});

		const returnValue = await this.quickTransactionService.tapToPayLanding(this.callerInformation.cifNumber, this.incidentDetails.incidentRecId);
			
		if (returnValue.succeeded) {
			this.cards = returnValue.result.cards;
			this.renderMode = RENDER_MODE.TAP_TO_PAY;
		} else {
			this.logger.log(`error`, `Unable to load Tap To Pay Landing Page data`);
		}
	},

	async _getAgreement(agreementRequest) {
		const returnValue = await this.quickTransactionService.tapToPayAgreement(agreementRequest);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		return null;
	},

	async _updateTapToPay(updateRequest) {
		const returnValue = await this.quickTransactionService.updateTapToPay(updateRequest, (ex) => this._tapToPayErrorHandler(ex));
		return returnValue.succeeded;
	},

	_tapToPayErrorHandler(ex) {
		return true;
	},

	_tapToPayResult(eventData) {
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
	}
};