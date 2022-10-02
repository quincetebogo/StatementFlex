import { css, html } from 'platform/elements';
import { NavigationContext } from 'platform/core';
import { ViewBase } from 'app/views/common/ViewBase';
import { WidgetRegistryService } from 'app/services/WidgetRegistryService';

/**
 * View to render Widgets designed for the Horizon Shell
 * 
 * @export 
 * @class HorizonWidgetHost
 * @extends {ViewBase}
 */
export class HorizonWidgetHost extends ViewBase {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.widgetRegistryService = new WidgetRegistryService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));

		this.navigationContext = NavigationContext.getInstance();
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._initialize();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}
	

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			navigationContext: { attribute: false },
			widgetRegistryService: { attribute: false },
			widgetDetails: { attribute: false, type: Object }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	
	_handleInitializeMessage(e) {
		const mapVerificationMethods = { itaAttempts: `ITA`, sqAttempts: `KBA` };
		const verificationMethods = [];
		let verificationCount = 0;

		for (const [key, value] of Object.entries(this.callerInformation.verificationAttempts)) {
			verificationCount += value;
			verificationMethods.push(mapVerificationMethods[key]);
		}

		e.detail.callback({
			verified: this.callerInformation.verificationStatus === `verified`,
			verificationCount: verificationCount,
			clientVerficationMethods: verificationMethods,
			verificationMethod: this.callerInformation.verificationMethod,
			incidentNumber: this.incidentDetails.primaryIncidentRef,
			caseId: `-`,
			logicalRecordID: `-`,
			incomingTelephoneNumber: this.incomingCallDetails.incomingTelephoneNumber,
			clientNeed: this.incidentDetails.currentNeed
		});
	}

	_handleGetClientProfileInfoMessage(e) {
		e.detail.callback({
			name: this.callerInformation.name,
			title: this.callerInformation.title,
			southAfricanIDNumber: this.callerInformation.southAfricanIDNumber,
			verifiedTelephoneNumber: this.callerInformation.verifiedTelephoneNumber,
			address: this.callerInformation.livesIn,
			languagePreference: this.callerInformation.languagePreference,
			birthdate: this.callerInformation.birthdate,
			cifNumber: this.callerInformation.cifNumber,
			profilePhoto: this.callerInformation.profilePhoto,
			firstName: this.callerInformation.firstName,
			lastName: this.callerInformation.lastName,
			middleName1: this.callerInformation.middleName1,
			middleName2: this.callerInformation.middleName2,
			middleName3: this.callerInformation.middleName3,
			initials: this.callerInformation.initials,
			photo: `-`
		});
	}

	_handleLoadingCompleteMessage() {
		window.showToastTimed(`success`, `top`, `Success`, `Widget Loaded Successful`, 3000, true, null, `vertical`, null);
	}
	

	_handleTelemetryNewTraceIdMessage(e) {
		this._telemetry.newTrace(e.detail.content.traceId);
	}

	_handleTelemetryStartSpanMessage(e) {
		this._telemetry.startSpan(e.detail.content.eventName, e.detail.content.baggage, e.detail.content.systemTriggered, e.detail.content.originatingSystem);
	}

	_handleTelemetryEndSpanMessage(e) {
		this._telemetry.endSpan(e.detail.content.eventName, e.detail.content.baggage, e.detail.content.systemTriggered, e.detail.content.closeParentSpan, e.detail.content.closeChildSpans, e.detail.content.originatingSystem);
	}

	_handleTelemetryLogEventMessage(e) {
		this._telemetry.logEvent(e.detail.content.eventName, e.detail.content.baggage, e.detail.content.systemTriggered, e.detail.content.originatingSystem);
	}

	_handleTelemetryCloseChildSpansMessage(e) {
		this._telemetry.closeChildSpans(e.detail.content.parentEvent, e.detail.content.originatingSystem);
	}
	
	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialize() {
		const widgetName = this.navigationContext.current.pathParams.name;

		const response = await this.widgetRegistryService.getWidgetById(widgetName);

		this.widgetDetails = response.result.widget;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.widget {
					height: 100%;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			${super._webTemplate()}
			<!-- Display the widget at location "./widget.html". This will typically be a link to the widget, e.g. "https://my-widget.platform-dev.int.capinet/widget.html" -->
			<capitec-widget id="widget1" src="${this.widgetDetails.alias}" class="widget" 
				@initialize="${this._handleInitializeMessage}" 
				@get-client-profile="${this._handleGetClientProfileInfoMessage}" 
				@loading-complete="${this._handleLoadingCompleteMessage}"
				@telemetry-new-trace-id="${this._handleTelemetryNewTraceIdMessage}"
				@telemetry-start-span="${this._handleTelemetryStartSpanMessage}"
				@telemetry-end-span="${this._handleTelemetryEndSpanMessage}"
				@telemetry-log-event="${this._handleTelemetryLogEventMessage}"
				@telemetry-close-child-spans="${this._handleTelemetryCloseChildSpansMessage}">
			</capitec-widget>
		`;
	}
}

customElements.define(`horizon-widget-host`, HorizonWidgetHost);