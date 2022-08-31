import { css, html } from 'platform/elements';
import { Configuration } from 'platform/Configuration';
import { HorizonStore } from 'app/store/HorizonStore';
import { ViewBase } from 'app/views/common/ViewBase';

import 'app/components/common/ServiceCallErrorScreen';


/**
 * Display an failure screen indicating that the savings plans service is unavailable.
 *
 * @export
 * @class SavingsPlanServiceError
 * @extends {ViewBase}
 */
export class SavingsPlanServiceError extends ViewBase {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.endCallContext = `ServiceError`;

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

		// TODO: Is a telemetry event needed here?
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		// this.horizonStore.clearReturnScreen();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_findBranchClick() {
		this.dispatchEvent(new CustomEvent(`find-branch`, {}));
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
				.card {
					width: 100%;
					height: 888px;
				}
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
					--horizon-service-call-error-screen-height: 820px;
					--horizon-service-call-error-screen-size: 602px;
					--theme-alert-banner-height: 48px;
					--horizon-service-call-error-screen-img-height: 183px;
					--horizon-service-call-error-screen-img-width: 253px;
					--horizon-service-call-error-screen-header-margin-top: 28px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderSavingsPlanServiceError()}

			${super._webTemplate()}
		`;
	}

	_renderSavingsPlanServiceError() {
		return html`
		<capitec-card 
				data-automation-id="savings-plan-landing-screen"
				class="card">
					<capitec-title-bar 
						data-automation-id="savings-plan-landing-title"
						type="save">
							<capitec-icon
								size="medium"
								icon="product/save-white">
							</capitec-icon>
							<capitec-label label="Savings Plans" type="Title"></capitec-label>
					</capitec-title-bar>

					<capitec-group
						layout="vertical"
						halign="center"
						valign="top"
						gap="none">
							<horizon-service-call-error-screen
								bannerDetail=" Savings plans are currently unavailable" 
								image="/images/common/service-error.svg"
								header="Savings plans are currently unavailable"
								right="Find a Branch"
								@right-click=${() => this._findBranchClick()}>
									<section
										class="error-msg"
										slot="detail">
											<p>We are experiencing technical difficulties.
												<br> We are sorry for the inconvenience and aim to have it resolved soon.</p>
												<p><strong>For any urgent matters, access savings plans on our app or visit a branch.</strong></p>
									</section>
					
							</horizon-service-call-error-screen>
					</capitec-group>
			</capitec-card>`;
	}
}
customElements.define(`horizon-savings-plans-service-error`, SavingsPlanServiceError);