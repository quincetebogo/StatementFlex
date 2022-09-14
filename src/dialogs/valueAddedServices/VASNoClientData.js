import { Component, css, html } from 'platform/elements';
import { AccessMenuBarEvents } from 'app/constants/telemetry/events/AccessMenuBar';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';

/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServiceUnavailable
 * @extends {Component}
 */
 export class ValueAddedServiceNoClientData extends Component {

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
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_NO_CLIENT_DATA
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(AccessMenuBarEvents.VALUE_ADDED_SERVICES_UNAVAILABLE, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_NO_CLIENT_DATA
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_okayClick() {

		this._telemetry.logEvent(AccessMenuBarEvents.VALUE_ADDED_SERVICES_NO_CLIENT_DATA_ACCEPTED, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES_NO_CLIENT_DATA,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.dispatchEvent(new CustomEvent(`okay-unavailable`, {}));
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
					--theme-modal-onboard-m-l-xl-width: 597px;
					--theme-modal-body-padding: 0px;
					--theme-modal-footer-padding: 0px;
				}

				capitec-label {
					align-items: center;
					--theme-label-font-family: "Hind Vadodara";
				}

				div[slot="body"] {
					height: 419px;
					width: 597px;
				}

				.image {
					padding-top: 30px;
					align-items: center;
					display: inline-flex;
				}

				.vas-header {
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
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-modal type="onboard">
				<div slot="body">
					<capitec-group layout="vertical" halign="center" valign="center" gap="none">
						${this._renderNoClientDataVAS()}
					</capitec-group>
					
				</div>
			</capitec-modal>
		`;
	}

	_renderNoClientDataVAS() {
		return html`
			<img class="image" src="/images/common/tap-to-pay-error.svg" alt="" />

			<capitec-label 
					class="vas-header"
					label="Value Added Services Unavailable">
			</capitec-label>

			<capitec-label 
					class="vas-content"
					label="Please email the client’s request to update Value Added Services to the following mailbox DLClientProfileSupport@capitecbank.co.za">
			</capitec-label>

			${this._renderButton()}
		`;
	}

	_renderButton() {
		return html`
			<capitec-button
						data-automation-id="value-added-services-no-client-data-okay"
						type="primary" 
						label="Okay"
						@click="${() => this._okayClick()}">
			</capitec-button>
		`;
	}

}

window.customElements.define(`horizon-value-added-services-no-client-data`, ValueAddedServiceNoClientData);