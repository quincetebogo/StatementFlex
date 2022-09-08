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

	// async _liveBetterLandingDetails(e) {
	// 	const returnValue = await this.liveBetterService.liveBetterLanding(e.detail.content);

	// 	if (returnValue.succeeded && returnValue.result) {
	// 		e.detail.callback(returnValue.result);
	// 	}
	// }

	async _optionClick(e) {
		const option = e.detail.content;

		const accountDetails = () => this._accountDetails();
		const transactionHistory = () => this._transactionHistory();
		const statements = () => this._getStatements();
		const automaticSavings = () => this._automaticSavings();
		const productEnquiry = () => this._productEnquiry();
		const partnerBenefits = () => this._partnerBenefits();

		const actions = {
			'lbb-account-enquiry': accountDetails,
			'transaction-history-lbb': transactionHistory,
			'statements-lbb': statements,
			'automatic-savings-lbb': automaticSavings,
			'product-enquiry': productEnquiry,
			'partner-benefits': partnerBenefits
		};

		if (actions[option]) {
			await super._inicidentManager_(option, () => this._toggleBusyFlag());
			this._refreshIncidentDetails();
			return actions[option]();
		}
	};
	
	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _initialize() {
		const widgetName = `LbbWidget`;

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
				@get-client-profile="${this._handleGetClientProfileInfoMessage}" 
				@loading-complete="${this._handleLoadingCompleteMessage}"
				@option-click="${this._optionClick}"
			
				@telemetry-new-trace-id="${this._handleTelemetryNewTraceIdMessage}"
				@telemetry-start-span="${this._handleTelemetryStartSpanMessage}"
				@telemetry-end-span="${this._handleTelemetryEndSpanMessage}"
				@telemetry-log-event="${this._handleTelemetryLogEventMessage}"
				@telemetry-close-child-spans="${this._handleTelemetryCloseChildSpansMessage}">
			</capitec-widget>
		`;
	}
}

customElements.define(`horizon-livebetter-widget-host`, HorizonLbbWidgetHost);