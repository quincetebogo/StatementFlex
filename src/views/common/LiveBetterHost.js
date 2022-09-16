import { css, html } from 'platform/elements';
import { LiveBetterService } from 'app/services/LiveBetterService';
import { NavigationContext } from 'platform/core';
import { SavingsAccountBase } from 'app/views/common/SavingsAccountBase';
import { WidgetRegistryService } from 'app/services/WidgetRegistryService';

/**
 * View to render Widgets designed for the Horizon Shell
 * 
 * @export 
 * @class HorizonWidgetHost
 * @extends {ViewBase}
 */
export class HorizonLbbWidgetHost extends SavingsAccountBase {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		
		this.widgetRegistryService = new WidgetRegistryService(() => super._toggleBusyFlag(), (ex) => super._handleChannelServiceError(ex));
		this.liveBetterService = new LiveBetterService(() => super._toggleBusyFlag(), ex => this._errorHandler(ex));

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
		e.detail.callback(this.callerInformation);
	}

	_handleLoadingCompleteMessage() {
		window.showToastTimed(`success`, `top`, `Success`, `Livebetter Loaded Successful`, 3000, true, null, `vertical`, null);
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
		const widgetName = `cec-widget-lbb`;

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
					width: 100%;
					height: var(--horizon-panel-height, 888px);
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
				@loading-complete="${this._handleLoadingCompleteMessage}">
			</capitec-widget>
		`;
	}
}

customElements.define(`horizon-livebetter-widget-host`, HorizonLbbWidgetHost);