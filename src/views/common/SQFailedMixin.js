import { html } from 'platform/elements';

const MAX_ITA_ATTEMPTS = 3;

/**
 * This mixin allows common functions for security questions failed screens i.e.,
 * This mixin provides the code that is common between XDS and KBA security questions failed screens.
 * Event handlers are provided here.
 * 
 *   this.horizonRouter
 * 
 */

export const SQFailedMixin = {

	// PRIVATE METHODS

	_updateMiniProfile() {
		this.horizonStore.setCallerInformation(this.callerInformation);
		
		const state = { 
			leftBarButtonConfig: {
				hasFavourites: true,
				subtitle: ``,
				detail: ``
			}
		};

		this.horizonStore.saveState(state);
	},

	_navigateToLP() {
		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	},

	_itaAvailable() {
		// itaAttempts is 0 based and is incremented on successful initiation of an ITA request
		return this.callerInformation.hasDigitalChannels && this.callerInformation.verificationAttempts.itaAttempts < MAX_ITA_ATTEMPTS;
	},

	async _clientVerified(event) {
		await super._clientVerified(event);

		this.horizonRouter.navigateToLandingPage(this.incomingCallDetails.ivrOption.value, this.callerInformation.hasInsuranceProducts);
	},

	// RENDERING

	_renderSQFailureScreen() {
		return html`
			<horizon-error-screen 
				header="Verification was unsuccessful" 
				left="Continue Unverified"
				right="${this._itaAvailable() ? `Verify Via App/USSD` : ``}"
				toast="Verification has failed."
				image="/images/insure/assign-pay-arrears.svg"
				@left-click=${() => this._continueUnverifiedClick()}
				@right-click=${() => this._verifyViaApp()}>
				<section id="id-error-msg" slot="detail">You can continue with limited transactions.</section>
			</horizon-error-screen>
		`;
	}
};