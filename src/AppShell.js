import { Shell, css, html } from 'platform/elements';
import { ExecutionContext } from 'platform/ExecutionContext';
import { Logger } from 'platform/Logger';
import { Platform } from 'platform/Platform';
import { SecurityContext } from 'platform/SecurityContext';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';
import { EventAggregator } from 'platform/EventAggregator';
import { Configuration } from 'platform/Configuration';

// Import all UI Components. 
import 'platform/components';
import 'platform/components/navigation/AppRouter';

//Import Horizon Routes
import horizonRoutes from './shell/HorizonRoutes';
import { HorizonViewManager, HORIZON_VIEWS } from './shell/HorizonViewManager';
import { DesktopAgentService, NewCallEvent } from './services/DesktopAgentService.js';

/**
 * Physical entry-point of the application, based on a platform-provided base class.
 */
export class AppShell extends Shell {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		// The below method call serves two functions:
		//   1. Initialise the runtime configuration.
		//   2. Initialise the authentication flow, which includes obtaining an identity token from one of the trusted IDPs. 
		// 
		// NOTE: This method call is only required once within the context of the application, but as early as possible.
		Platform.init();

		// Callback for user authentication success.
		Platform.onUserLoginSuccess(() => this._onUserLoginSuccess());

		// Callback for user authentication error.
		Platform.onUserLoginError(() => this._onUserLoginError());

		// Callback for user authentication logout.
		Platform.onUserLoggedOut(() => this._onUserLoggedOut());

		// Platform Non-UI Components.
		this.securityContext = SecurityContext.getInstance();
		this.executionContext = ExecutionContext.getInstance();
		this.logger = Logger.getInstance();
		this.router = Router.getInstance();
		this.configuration = Configuration.getInstance();


		// Adding routes to URL Routing Table
		horizonRoutes.map(route => this.router.addRoute(route));

		//Event Aggregator
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());
		this.eventAggregator.subscribe(`horizon-top-bar-data`, (event) => this._onTopBarUpdated(event));
		this.eventAggregator.subscribe(`horizon-status-bar-update`, (event) => this._onUpdateStatusBar(event));

		// Property defaults.
		this.isBusy = true;
		this.isSuccess = false;
		this.isError = false;
		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
		this.platformVersion = null;
		this.applicationName = null;
		this.applicationVersion = null;
		this.fullname = ``;
		this.employeeId = ``;
		this.cardStop = [];
		this.currentStatus = "success";
		this.currentMessage = "";

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.currentView = this.horizonViewManager.transitionToView(HORIZON_VIEWS.LANDING_PAGE);
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			isError: { type: Boolean },
			isSuccess: { type: Boolean },
			securityContext: { type: SecurityContext },
			roles: { type: Array },
			platformVersion: { type: String },
			applicationName: { type: String },
			applicationVersion: { type: String },
			fullname: { type: String },
			employeeId: { type: String },
			currentView: { type: String },
			currentStatus: { type: String },
			currentMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		// Listening for events from the Desktop Agent
		let registrationUrl = await this.configuration.getSetting(`DesktopAgent.registrationUrl`);

		console.log("registrationUrl: ", registrationUrl);
		DesktopAgentService.setRegistrationUrl(registrationUrl);
		DesktopAgentService.getValidationData();
		this.agentService = DesktopAgentService.getInstance();
		this.agentService.open();

		console.log(`Appshell: ConnectedCallback`);

		let nextView = this.horizonViewManager.getCurrentView();
		if (this.currentView !== nextView) {
			this.currentView = nextView;
		}
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onUserLoginSuccess() {

		// Put your logic here to handle allow the

		this.isBusy = false;
		this.roles = this.securityContext.roles != null && Array.isArray(this.securityContext.roles) ? this.securityContext.roles.join(`, `) : 'n/a';
		console.log(this.roles);
		this.platformVersion = await this.executionContext.platformVersion;
		this.applicationName = await this.executionContext.applicationName;
		this.applicationVersion = await this.executionContext.applicationVersion;
		this.clientIp = this.executionContext.clientIp;
	}

	_onUserLoginError() {
		console.log('onUserLoginError');
		// Put your logic here to handle a login error.
	}

	_onUserLoggedOut() {
		console.log('onUserLoggedOut');
		// Put your logic here, e.g. to inform the user that he / she
		// is now logged out and that the application will now perform a hard reload.
	}

	_openCatalogue() {
		window.open(`https://web-component-catalogue.int.capinet`, `_blank`);
	}

	_openConfluenceDocs() {
		window.open(`https://confluence.int.capinet:8443/display/CPT/Omni-channel+Web+Platform`, `_blank`);
	}

	_openShellDocs() {
		window.open(`https://platform/elements.polymer-project.org/guide`, `_blank`);
	}

	async _logViaChannelService() {

		try {
			this.isBusy = true;
			await this.logger.info(`Hello from [${this.applicationName}]`, `AppShell._logViaChannelService`);
			this._toggleSuccess();
		} catch (error) {
			this._toggleError();
		} finally {
			this.isBusy = false;
		}
	}

	_toggleSuccess() {
		this.isSuccess = !this.isSuccess;
	}

	_toggleError() {
		this.isError = !this.isError;
	}

	_onNavigationContextUpdated() {
		let nextView = this.horizonViewManager.getCurrentView();
		if (nextView !== this.currentView) {
			this.currentView = nextView;
		}

		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};

	_onTopBarUpdated(event) {
		this.fullName = event.agentFullName;
		this.employeeId = event.employeeId;
	}

	_onUpdateStatusBar(event) {
		this.currentStatus = event.status;
		this.currentMessage = event.message;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	navigate(path) {
		this.router.navigateByPath(`/${path}`);
	}

	// ---------
	// RENDERING
	// ---------	

	/**
	 * Generates the component stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				/* TRY TO MAINLY CONTROL THE SCREEN SIZE FROM HERE. LIMIT FIXED SIZES FURTHER WHERE POSSIBLE */
				.screen-size{
					width : 1920px; 
					height : 1080px;
					display: flex;
					flex-direction: column;
				}

				.title-bar{
					width: 100%;
					height: 72px;
					background-color: #ffffff;
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2);
					grid-template-columns: 1fr;
					grid-row-gap: 8px;
				}

				.additional-bar{
					width: 100%;
					height: 56px;
					margin: 0px 0px 0px 0px;
					background: #f4f4f4; 
				}

				.screen-content {
					width : 100%;
					height: auto;
					background : #f4f4f4; 
				}

				.status-bar{
					width: 100%;
					height: 72px;
				}

				.branding-logo-white{
					height: 32px;
					width: 193px;
				}

				.logged-in-user{
					color: #003652;
				}

				.grid-container {
					display: grid;
					grid-template-columns: 440px 1064px 320px;
					grid-template-areas: "left middle right";
					grid-gap: 24px;
					background-color: #F4F4F4;
					height: 823px;
					width: 1872px;
					margin-top: 24px;
					margin-left: 24px;
					margin-right: 24px;
					background: #f4f4f4; 
				}

				.left{
					width:440px; 
				}

				.right{
					width:320px; 
				}			`
		];
	}

	/**
	 * Core rendering method as expected by the platform for a Shell instance.
	 *
	 * @returns {html} HTML content for the component.
	 */
	_webTemplate() {
		return html`
            ${this.renderLoadingIndicator()}
            ${this.renderContent()}
            ${this.renderSuccessModel()}
			${this.renderErrorModal()}
        `;
	}

	_mobileTemplate() {
	}

	/*
	 * The following defines the screen framework in which various components will be displayed.
	 * The platforms App Router will switch the main display (class middle) 
	 * The Horizon View Manager will be responsible for switching other components
	 *
	 *		- Any additional button/toolbars
	 *		- Left and Right hand display components
	 *
	 *	The View manager will also facilitate communication between view components (i.e. between the main
	 * display and the left, right, and toolbar components. OK, OK! I used an Oxford comma; we can fight about that another time)
	 * 
	 */
	renderContent() {

		if (this.isBusy) {
			return html``;
		}

		return html`         
                <div class="screen-size">
				    ${this.renderTitleBar()}
					${this.horizonViewManager.renderAdditionalTopBar(this.currentView)}
					
                    <capitec-content-box class="screen-content" nopadding>
						<div class="grid-container">
							<div class="left">
								${this.horizonViewManager.switchArea(HORIZON_VIEWS.LANDING_PAGE, html`<landingpage-welcome .fullname="${this.fullName}"></landingpage-welcome>`)}
								${this.horizonViewManager.switchArea(HORIZON_VIEWS.CARD_STOP, html`<client-details></client-details>`)}
							</div>	
							<div class="middle">
								<capitec-app-router></capitec-app-router> 
							</div>
							<div class="right">							
								${this.horizonViewManager.renderRightBar(this.currentView)}
							</div>
						</div>	
                    </capitec-content-box>
	
					<capitec-status-bar class="status-bar" status="${this.currentStatus}" label="${this.currentMessage}"></capitec-status-bar>
                </div>
        `;
	}

	renderTitleBar() {
		return html`
			<capitec-title-bar class="title-bar" type="clear" row=1>
				<capitec-icon class="branding-logo-white" size="medium" icon="capitec-logo"></capitec-icon>
				<capitec-spacer></capitec-spacer>
				<div class="logged-in-user">
					<capitec-label label="${this.fullName}"></capitec-label>
					<capitec-label label="${this.employeeId}"></capitec-label>
				</div>
			</capitec-title-bar>
		`;
	}

	renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	renderSuccessModel() {

		if (!this.isSuccess) {
			return html``;
		}

		return html`
            <capitec-modal type="result" result="success" header="Success">
				<capitec-label slot="body" label="Logged via channel service."></capitec-label>
                <capitec-button slot="footer" type="clear" label="Ok" @click="${this._toggleSuccess}"></capitec-button>
            </capitec-modal>
				`;
	}

	renderErrorModal() {

		if (!this.isError) {
			return html``;
		}

		return html`
            <capitec-modal type="result" result="error" header="Error">
				<capitec-label slot="body" label="Unable to log via channel service."></capitec-label>
                <capitec-button slot="footer" type="clear" label="Ok" @click="${this._toggleError}"></capitec-button>
            </capitec-modal>
		`;
	}
}

// Creation of custom element, must be called "app-shell" by convention, as expected by the platform.
window.customElements.define(`app-shell`, AppShell);