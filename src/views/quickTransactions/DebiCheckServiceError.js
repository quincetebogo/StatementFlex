import { css, html } from 'platform/elements';
import { Configuration } from 'platform/Configuration';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { QuickTransactionEvents } from 'app/constants/telemetry/events/QuickTransactions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ServiceCallErrorScreen';


/**
 * Display an failure screen indicating that the debi check service is unavailable.
 *
 * @export
 * @class DebiCheckServiceError
 * @extends {ViewBase}
 */
export class DebiCheckServiceError extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._telemetry = HorizonTelemetry.instance;
		this._configuration = Configuration.getInstance();
		this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// PROPERTIES
	// --------------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.endCallContext = `DebiCheckServiceError`;
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(QuickTransactionEvents.DEBICHECK, {
			"screen": TelemetryScreen.TAX_CERTIFICATE,
			"next-screen": TelemetryScreen.FAVOURITES
		});
		this.horizonStore.setScreenDetails({});
		this.horizonStore.clearReturnScreen();

		this.horizonIncidentManager.incidentState = super.HORIZON_NEED_STATUS.FAILED;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _findBranchClick() {
		const branchLocatorUrl = await this._configuration.getSetting(`otherSystemsURL.branch-locator`);
		window.open(`${branchLocatorUrl}`);
		
		this._telemetry.logEvent(QuickTransactionEvents.DEBICHECK_FIND_BRANCH, {
			"screen": TelemetryScreen.DEBICHECK,
			"next-screen": TelemetryScreen.FAVOURITES
		});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				.error-msg {
					width: auto;
					height: 60px;
					font-family: "Hind Vadodara";
					color: #3A3A3A;
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					text-align: center;
				}
	
				horizon-service-call-error-screen {
					--horizon-service-call-error-screen-height: 100%;
				
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderDebiCheckServiceError()}

			${super._webTemplate()}
		`;
	}

	_renderDebiCheckServiceError() {
		return html`
			<horizon-service-call-error-screen
				bannerDetail="DebiCheck is currently unavailable" 
				image="/images/common/service-error.svg"
				header="DebiCheck currently unavailable"
				right="Find a Branch"
				@right-click=${() => this._findBranchClick()}>
					<section
						class="error-msg"
						slot="detail">
							<p>We are experiencing technical difficulties.
								<br> We are sorry for the inconvenience and aim to have it resolved soon.</p>
								<p><strong>For any urgent matters, access our app or visit a branch.</strong></p>
					</section>
	
			</horizon-service-call-error-screen>
		`;
	}
}
customElements.define(`horizon-debi-check-service-error`, DebiCheckServiceError);