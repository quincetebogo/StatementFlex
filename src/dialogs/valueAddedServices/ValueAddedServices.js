import { Component, html } from 'platform/elements';
import { AccessMenuBarEvents } from 'app/constants/telemetry/events/AccessMenuBar';
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
		this.valueAddedService = new ValueAddedService(() => this._toggleBusyFlag(), () => this._valueAddedServiceErrorHandler());
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
			isBusy: { attribute: false }
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

	async _accept(e) {

		const returnValue = await this.valueAddedService.putValueAddedServiceStatus(e.detail.request);

		if (returnValue.succeeded) {

			this._telemetry.logEvent(AccessMenuBarEvents.VALUE_ADDED_SERVICES_ACCEPTED, {
				"screen": TelemetryScreen.VALUE_ADDED_SERVICES,
				"next-screen": TelemetryScreen.FAVOURITES,
				"capitec-entity-id": e.detail.request.capitecEntityId,
				"insights": e.detail.request.optOutInsights,
				"behavioural-marketing": e.detail.request.optOutBehaviouralMarketing,
				"pre-assessments": e.detail.request.optOutPreAssessments,
				"analysis": e.detail.request.optOutAnalysis,
				"third-parties": e.detail.request.optOutThirdParties
			});
		}

		this.dispatchEvent(new CustomEvent(`accept`, {
			detail: {}
		}));
	}

	_toggleValue(e) {
		this.alertBannerMessage = ``;
		this.optOutInsights = e.currentTarget.optOutInsights;
		this.optOutBehaviouralMarketing = e.currentTarget.optOutBehaviouralMarketing;
		this.optOutPreAssessments = e.currentTarget.optOutPreAssessments;
		this.optOutAnalysis = e.currentTarget.optOutAnalysis;
		this.optOutThirdParties = e.currentTarget.optOutThirdParties;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// NA

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_valueAddedServiceErrorHandler() {
		this.alertBannerMessage = `System error. Please try again.`;
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
			@accept="${(e) => this._accept(e)}"
			@toggle-value="${(e) => this._toggleValue(e)}"
			@on-cancel="${(e) => this._cancel(e)}">
		</capitec-pc-value-added-services>`;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`horizon-value-added-services`, ValueAddedServices);