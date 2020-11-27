import { View, css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';

import 'app/components/common/ErrorScreen';

/**
 * The XDS Verification Failed screen is displayed the second time a client fails verification.
 *
 * @export
 * @class XdsVerificationFailed
 * @extends {View}
 */
export class XdsVerificationFailed extends View {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this.horizonStore = HorizonStore.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();

		this.state = this.horizonStore.recoverState();

		this.navigateToUnverifiedLandingPage = ivrOption => {

			const stopCard = () => this.horizonRouter.navigateToStopCard();
			const transact = () => this.horizonRouter.navigateToQuickTransactionFavourites();
			const insure = this.state.callerInformation.hasInsuranceProducts ? () => this.horizonRouter.navigateToInsureExistingClient() : () => this.horizonRouter.navigateToInsureProspectiveClient();

			return {
				StopCard: stopCard,
				Transact: transact,
				Insure: insure
			}[ivrOption];
		};
	}

	// ----------
	// PROPERTIES
	// ----------

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				:host{
					width: 100%;
					height: 100%;
				}
				#id-error-msg{
					width: 550px;
				}
			`
		];
	}

	_continueUnverifiedClick() {
		this.navigateToUnverifiedLandingPage(this.state.incomingCallDetails.ivrOptionCode)();
	}

	_rightClick() {
		console.log(`right`);
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<horizon--error-screen 
				header="Verification was unsuccessful" 
				left="Continue Unverified"
				right="Verify Via Banking App"
				toast="Your Verification has failed."
				@left-click=${() => this._continueUnverifiedClick()}
				@right-click=${() => this._rightClick()}>
				<section id="id-error-msg" slot="detail">If it's an urgent matter, please visit a branch or you can call again after 24 hours.</section>
			</horizon--error-screen>
		`;
	}
}

customElements.define(`horizon-xds-verification-failed`, XdsVerificationFailed);