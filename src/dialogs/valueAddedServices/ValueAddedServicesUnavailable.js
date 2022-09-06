import { Component, css, html } from 'platform/elements';
import { AccessMenuBarEvents } from 'app/constants/telemetry/events/AccessMenuBar';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

/**
 * The Horizon Value Added Services Unavailable dialog is used to display the
 * Value Added Services CS is currenlty down.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServiceUnavailable
 * @extends {Component}
 */
export class ValueAddedServiceUnavailable extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this._telemetry = HorizonTelemetry.instance;
	}

	// -----------
	// PROPERTIES
	// -----------

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(AccessMenuBarEvents.VALUE_ADDED_SERVICES_UNAVAILABLE, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_UNAVAILABLE
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(AccessMenuBarEvents.VALUE_ADDED_SERVICES_UNAVAILABLE, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_UNAVAILABLE
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_gotItClick() {

		this._telemetry.logEvent(AccessMenuBarEvents.VALUE_ADDED_SERVICES_UNAVAILABLE_ACCEPTED, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_UNAVAILABLE,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.dispatchEvent(new CustomEvent(`vas-unavailable`, {}));
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
				capitec-modal {
					--theme-modal-onboard-m-l-xl-width: 709px;
					--theme-modal-body-padding: 0px;
					--theme-modal-footer-padding: 0px;
				}

				horizon-alert-banner[type="error"] {
					margin-top: 16px;
					width: 677px;

					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					--theme-alert-banner-font-weight: 600;
					--theme-layout-gap-spacing: 16px;
					--theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;
				}

				capitec-label {
					align-items: center;

					--theme-label-default-font-size: 15px;
					--theme-label-font-family: "Hind Vadodara";
				}

				div[slot="body"] {
					height: 502px;
					width: 709px;
				}

				.image {
					padding-top: 13px;
					align-items: center;
					display: inline-flex;
				}

				.vas-header {
					padding-bottom: 8px;

					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}

				.vas-content {
					--theme-label-default-font-size: 15px;
					--theme-label-font-color: #3A3A3A;

					padding: 15px 23px 21px 23px;
					text-align: center;
				}

				.vas-technical-issues {
					padding-bottom: 12px;

					--theme-layout-gap-spacing: 0px;
				}

				.vas-email-content {
					padding-bottom: 32px;

					--theme-label-default-font-weight: 600;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal 
					data-automation-id="value-added-services-unavailable-header"
					type="onboard">
				<div slot="body">
					<capitec-group layout="vertical" halign="center" valign="center" gap="none">
						${this._renderVASUnvailable()}
					</capitec-group>
					
				</div>
			</capitec-modal>
		`;
	}

	_renderVASUnvailable() {
		return html`
				<horizon-alert-banner 
						type="error"
						header="Notify client: "
						label="Value Added Services is currently unavailable">
				</horizon-alert-banner>

				<img class="image" src="/images/common/tap-to-pay-error.svg" alt="" />

				<capitec-label 
						class="vas-header"
						label="Value added services currently unavailable">
				</capitec-label>

				<capitec-group layout="vertical" class="vas-technical-issues">
					<capitec-label 
							label="We are experiencing technical difficulties.">
					</capitec-label>

					<capitec-label 
							label="We are sorry for the inconvenience and aim to have it resolved soon.">
					</capitec-label>
				</capitec-group>

				<capitec-label 
						label="For urgent matters email the client’s request for updates to">
				</capitec-label>

				<capitec-label
						class="vas-email-content"
						label="DLCLientProfileSupport@capitecbank.co.za">
				</capitec-label>

				${this._renderButton()}
			`;
	}

	_renderButton() {
		return html`
			<capitec-button
						data-automation-id="value-added-services-unavailable-got-it"
						type="primary" 
						label="Got it"
						@click="${() => this._gotItClick()}">
			</capitec-button>
		`;
	}

}

window.customElements.define(`horizon-value-added-services-unavailable`, ValueAddedServiceUnavailable);