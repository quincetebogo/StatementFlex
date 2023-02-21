import { Component, html } from 'platform/elements';
import { AccessMenuBarEvents } from 'app/constants/telemetry/events/AccessMenuBar';
import { ClientProfileService } from 'app/services/ClientProfileService';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { ValueAddedService } from 'app/services/ValueAddedService';

import 'app/productControls/valueAddedServices/src/ValueAddedServices';

/**
 * The Horizon Value Added Services dialog is used to seek permission to access client data.
 * 
 * Events Raised 
 * -------------
 * -
 * 
 * @export
 * @class ValueAddedServices
 * @extends {Component}
 */
export class ValueAddedServices extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.isBusy = false;
		this._telemetry = HorizonTelemetry.instance;
		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => true);
		this.clientProfileService = new ClientProfileService(() => this._toggleBusyFlag(), () => true);
	}

	// -----------
	// PROPERTIES
	// -----------

	/**
	 * @property {Object} statusVAS - Information about the client's current value added services
	 *
	 * @readonly
	 * @static
	 * @memberof ValueAddedServices
	 */
	static get properties() {
		return {
			statusVAS: { type: Object },

			isBusy: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(AccessMenuBarEvents.VALUE_ADDED_SERVICES, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES
		});

		this.capitecEntityId = this.statusVAS.capitecEntityId;

	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(AccessMenuBarEvents.VALUE_ADDED_SERVICES, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancel() {
		this._telemetry.logEvent(AccessMenuBarEvents.VALUE_ADDED_SERVICES_CANCEL, {
			"screen": TelemetryScreen.VALUE_ADDED_SERVICES,
			"next-screen": TelemetryScreen.FAVOURITES
		});

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}


	_accept(e) {
		this.dispatchEvent(new CustomEvent(`accept`, {}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// NA

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _updateValueAddedServices(valueAddedServices) {
		
		const returnValue = await this.clientProfileService.putClientConsent(valueAddedServices);

		if (returnValue.succeeded) {

			this._telemetry.logEvent(AccessMenuBarEvents.VALUE_ADDED_SERVICES_ACCEPTED, {
				"screen": TelemetryScreen.VALUE_ADDED_SERVICES,
				"next-screen": TelemetryScreen.FAVOURITES,
				"capitec-entity-id": valueAddedServices.capitecEntityId,
				"insights": valueAddedServices.optOutInsights,
				"behavioural-marketing": valueAddedServices.optOutBehaviouralMarketing
				
				
			});
		}

		return returnValue.succeeded;
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderValueAddedServicesDialog()}
			${this._renderLoadingIndicator()}
		`;
	}

	_renderValueAddedServicesDialog() {
		return html`
		<capitec-pc-value-added-services
			.statusVAS="${this.statusVAS}"
			.updateValueAddedServicesCallback="${(valueAddedServices) => this._updateValueAddedServices(valueAddedServices)}"
			@accept="${(e) => this._accept(e)}"
			@cancel="${(e) => this._cancel(e)}">
		</capitec-pc-value-added-services>`;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="vas-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`horizon-value-added-services`, ValueAddedServices);