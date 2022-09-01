import { Configuration, EventAggregator } from 'platform/core';
import { css, html } from 'platform/elements';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ServiceCallErrorScreen';
import 'app/components/common/RelatedOptions';

/**
 * Live Better Benefits failure Screen that can be displayed when channel service is unavailable. 
 *
 * @export
 * @class LBBServiceUnavailable
 * @extends {ViewBase}
 */

 export class LBBServiceUnavailable extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this._eventAggregator = EventAggregator.getInstance();

		this._configuration = Configuration.getInstance();

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

		this.horizonIncidentManager.setIncidentState(super.HORIZON_NEED_STATUS.FAILED);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		// TODO: Telemetry to be fully implemented when the CS call & Navigation for LBB is done 
		this._telemetry.endSpan(QuickTransactionEvents.LIVE_BETTER_BENEFITS, {
			"screen": TelemetryScreen.LIVE_BETTER_BENEFITS_UNAVAILABLE
		}); 
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _findBranchClick() {
		const branchLocatorUrl = await this._configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			horizon-service-call-error-screen {
					--horizon-service-call-error-screen:768px;
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
			${this._renderLBBServiceUnavailable()}
			${super._webTemplate()}
		`;
	}

	_renderLBBServiceUnavailable() {
		return html`
			<horizon-service-call-error-screen
				data-automation-id="lbb-service-unavailable-screen"
				image="/images/insure/assign-pay-arrears.svg"
				header="Live Better currently unavailable" 
				right="Find a Branch"
				bannerDetail= "Live Better is currently unavailable"
				displayToast = "${this.displayToast}"
				@right-click=${() => this._findBranchClick()}>
				<section id="id-error-msg" slot="detail">
					<p>We are experiencing technical difficulties.<br>
					We are sorry for the inconvenience and aim to have it resolved soon.</p>
					<p><b>For any urgent matters, please visit a branch</b></p>
				</section>
				
			</horizon-service-call-error-screen>
		`;
		
	}
}

customElements.define(`horizon-lbb-service-unavailable`, LBBServiceUnavailable);