import { Logger, NavigationContext } from 'platform/core';
import { css, html } from 'platform/elements';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { ViewBase } from 'app/views/common/ViewBase';
import { WidgetRegistryService } from 'app/services/WidgetRegistryService';

import 'app/components/common/ServiceCallErrorScreen';

const RENDER_MODES = {
	WIDGET: 0,
	WIDGET_NOT_FOUND: 1,
	UNKNOWN_WIDGET: 2,
	DIALOG: 3
};
const WidgetLoaderTimeout = 8; // in secs

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

		// Private variables
		this.renderMode = RENDER_MODES.WIDGET;
		this._widgetID = ``;
		this.timerInterval = null;
		this.timePassed = 0;
		
		this.widgetRegistryService = new WidgetRegistryService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));

		this.horizonRouter = HorizonRouter.getInstance();
		this.logger = Logger.getInstance();
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
			navigationContext: { state: false, attribute: false },
			widgetRegistryService: { state: false, attribute: false },
			widgetDetails: { state: false, attribute: false, type: Object },
			renderMode: { state: false }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	
	_handleInitializeMessage(e) {
		clearInterval(this.timerInterval);
		
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

	_handleDialogLoad() {
		this.renderMode = RENDER_MODES.DIALOG;
	}

	_handleDialogUnLoad() {
		this.renderMode = RENDER_MODES.WIDGET;
	}
	
	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialize() {
		// const widgetName = this.navigationContext.current.pathParams.name;

		this._widgetID = this.navigationContext.current.pathParams.name;
		// 804FA25C-5508-4D08-94F7-F2598D891AD8 - Registered
		// 517B7245-6669-43FE-A9B3-E88054AB8312 - Registered but not available
		// BE11799D-20ED-4D15-9537-7055084FE0DF - Unknown

		const response = await this.widgetRegistryService.getWidgetById(this._widgetID, () => true);
		const result = response.result;

		// Service unavailable
		if (!response.succeeded) {
			this.logger.log(`error`, `Widget service is unavailable. Requested widgetID:${this._widgetID}`, `WidgeHost._initialize`, response.correlationId);
			this.horizonRouter.navigateToWidgetUnavailable();
			
			return true;
		}

		// Widget not found
		if (!result.widget) {
			this.logger.log(`error`, `Requested widgetID:${this._widgetID} is not found`, `WidgeHost._initialize`, response.correlationId);
			this.renderMode = RENDER_MODES.WIDGET_NOT_FOUND;

			return true;
		}

		this.widgetDetails = result.widget;
		// Widget details found, but if not available?
		this._startTimer();
	}

	_startTimer() {
		this.timerInterval = setInterval(() => {
			this.timePassed += 1;
			
			if (WidgetLoaderTimeout === this.timePassed) {
				this._widgetLoaderTimedOut();
			}
		}, 1000);
	}

	_widgetLoaderTimedOut() {
		clearInterval(this.timerInterval);
		this.renderMode = RENDER_MODES.UNKNOWN_WIDGET;
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
					z-index: 2;
				}
				.card{
					width:100%;
					height:100%;
				}
				horizon-service-call-error-screen {
					--horizon-service-call-error-screen-height: 862px;
					--horizon-service-call-error-screen-header-margin-top: 16px;
					--horizon-service-call-error-screen-img-height: 182px;
					--horizon-service-call-error-screen-img-width: 252px;
				}

				.overlay {
					position: fixed;
					top: 0;
					left: 0;
					bottom: 0;
					right: 0;

					z-index: 1;
					display: flex;
					justify-content: center;
					align-items: center;

					background-color: var(--theme-modal-screen-background-color, rgba(0,0,0,0.6));
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
			<capitec-card class="card" halign="center" valign="center" gap="none">
				${this._renderWidget()}
				${this._renderWidgetNotFound()}
				${this._renderUnknownWidget()}
			</capitec-card>
			${this._renderDialog()}
		`;
	}

	_renderWidget() {
		return !this.widgetDetails || (this.renderMode !== RENDER_MODES.WIDGET && this.renderMode !== RENDER_MODES.DIALOG)
			? html``
			: html`
				<capitec-widget
					id="widget1"
					src="${this.widgetDetails.alias}"
					class="widget"
					@initialize="${this._handleInitializeMessage}"
					@get-client-profile="${this._handleGetClientProfileInfoMessage}"
					@loading-complete="${this._handleLoadingCompleteMessage}"
					@telemetry-new-trace-id="${this._handleTelemetryNewTraceIdMessage}"
					@telemetry-start-span="${this._handleTelemetryStartSpanMessage}"
					@telemetry-end-span="${this._handleTelemetryEndSpanMessage}"
					@telemetry-log-event="${this._handleTelemetryLogEventMessage}"
					@telemetry-close-child-spans="${this._handleTelemetryCloseChildSpansMessage}"
					@loading-dialog="${this._handleDialogLoad}"
					@unloading-dialog="${this._handleDialogUnLoad}">
				</capitec-widget>`;
	}

	_renderWidgetNotFound() {
		return this.renderMode === RENDER_MODES.WIDGET_NOT_FOUND
		? html`
			<horizon-service-call-error-screen
				data-automation-id="widget-not-found-section"
				image="/images/insure/assign-pay-arrears.svg"
				header="Unable to fetch requested widget">
				<section id="id-error-msg" slot="detail">
					<p>widget: ${this._widgetID}<br>
					Please contact Horizon support for assistance.</p>
				</section>
			</horizon-service-call-error-screen>`
		: html``;
	}

	_renderUnknownWidget() {
		return this.renderMode === RENDER_MODES.UNKNOWN_WIDGET
		? html`
			<horizon-service-call-error-screen
				data-automation-id="unknown-widget-section"
				image="/images/insure/assign-pay-arrears.svg"
				header="Unable to load ${this.widgetDetails?.widgetName} widget">
				<section id="id-error-msg" slot="detail">
					<p>Please contact Horizon support for assistance.<br></p>
				</section>
			</horizon-service-call-error-screen>`
		: html``;
	}

	_renderDialog() {
		return this.renderMode === RENDER_MODES.DIALOG
		? html`
			<div class="overlay"></div>`
		: html``;
	}

}

customElements.define(`horizon-widget-host`, HorizonWidgetHost);