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
import horizonRoutes from './shell/HorizonRouter';
import { HorizonViewManager, HORIZON_VIEW_SET } from './shell/HorizonViewManager';
import { DesktopAgentService } from './services/DesktopAgentService.js';

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

		// Event Aggregator
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());
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
		this.currentStatus = "success";
		this.currentMessage = "";

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.currentView = this.horizonViewManager.transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
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
			currentView: { type: String },
			currentStatus: { type: String },
			currentMessage: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		// Listening for events from the Desktop Agent
		this.agentService = DesktopAgentService.getInstance();
		this.agentService.open();

		const nextView = this.horizonViewManager.getCurrentView();
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
		const nextView = this.horizonViewManager.getCurrentView();
		if (nextView !== this.currentView) {
			this.currentView = nextView;
		}

		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};

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

				.grid-container {
					display: grid;
					grid-template-columns: 440px 1064px 320px;
					grid-template-areas: "left middle right";
					grid-gap: 24px;
					background-color: #F4F4F4;
					height: auto;
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
				}

				.status-bar-group{
					display: flex;
					flex-direction: row;
					background-color: #333;
					column-count: 2;
					height: 72px;
					margin: 0px;
					width: 100%;
				}
				.status-bar{
					--theme-statusbar-min-height: 59px;
					margin:0px;
					width: 1716px;
				}
				.status-bar-icon{
					float: right;
					width: 33.3%;
					height: 60px;
					margin: 0px;
					align-content: center;
				}
				img{
					margin-left: 14px;
				}
				.status-bar-icon-group{
					width: 204px;
				}
				.icon-caption{
					height: 15px;
					color: #FFFFFF;
					font-family: "Hind Vadodara";
					font-size: 13px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 16px;
					text-align: center;
				}
				* {
					/* Platform CSS - Overriding
					 * If it is generic change(i.e., applies across application) please specify here
					 * else override in specific component/view
					*/

					/* Modal popup */
					--theme-modal-header-background-color: #4A4848;
					--theme-modal-header-color: white;
					--theme-modal-header-font-size: 18px;
					--theme-modal-header-font-weight: 600;
					--theme-modal-header-padding-left: 16px;

					/* StatusBar */
					--theme-statusbar-min-height: 72px;

					/* Products Menu */
					--theme-product-tile-heading-margin-top: 11px;
					--theme-product-tile--height: 72px;
					--theme-product-tile-title-height: 27px;
					--theme-product-tile-title-font-size: 18px;
					--theme-product-tile-subtitle-height: 23px;
					--theme-product-tile-subtitle-font-size: 15px;
				}`
		];
	}

	/**
	 * Core rendering method as expected by the platform for a Shell instance.
	 *
	 * @returns {html} HTML content for the component.
	 */
	_webTemplate() {
		return html`
            ${this._renderLoadingIndicator()}
            ${this._renderContent()}
            ${this._renderSuccessModel()}
			${this._renderErrorModal()}
        `;
	}

	_mobileTemplate() {
	}

	/*
	 * The following defines the screen framework in which various components will be displayed.
	 * The platforms App Router will switch the main display (class middle) 
	 * The Horizon View Manager will be responsible for switching other components
	 *
	 *      - Any additional button/toolbars
	 *      - Left and Right hand display components
	 *
	 * The View manager will also facilitate communication between view components (i.e. between the main
	 * display and the left, right, and toolbar components. OK, OK! I used an Oxford comma; we can fight about that another time)
	 * 
	 */
	_renderContent() {

		if (this.isBusy) {
			return html``;
		}

		return html`         
                <div class="screen-size">
					${this.horizonViewManager.renderTopBar(this.currentView)}
					
                    <capitec-content-box class="screen-content" nopadding>
						<div class="grid-container">
							<div class="left">
							    ${this.horizonViewManager.renderLeftBar(this.currentView)}
							</div>
							<div class="middle">
								<capitec-app-router></capitec-app-router> 
							</div>
							<div class="right">
								${this.horizonViewManager.renderRightBar(this.currentView)}
							</div>
						</div>
					</capitec-content-box>
					
					<div class="status-bar-group">
						<capitec-status-bar class="status-bar" 
											status="${this.currentStatus}" 
											label="${this.currentMessage}">
						</capitec-status-bar>
						<capitec-group class="status-bar-icon-group" layout="horizontal" halign="right" valign="center" gap="clear">
							<div class="status-bar-icon" column="1" row="1">
								<a href="http://standardbancslinkv3.int.capinet:8080/" target="_blank">
									<img src="../images/statusBar/SBL.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="SBL"></capitec-label>
							</div>
							<div class="status-bar-icon" column="2" row="1">
								<a href="" target="_blank">
									<img src="../images/statusBar/CDS.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="CDS"></capitec-label>
							</div>
							<div class="status-bar-icon" column="3" row="1">
								<a href="http://c-net.int.capinet:51001/Pages/default.aspx" target="_blank">
									<img id="image" src="../images/statusBar/C-Net.svg" alt=""/>
								</a>
								<capitec-label class="icon-caption" label="C-Net"></capitec-label>
							</div>
						</capitec-group>
					</div>
				</div>
        `;
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`
            <capitec-loading-indicator></capitec-loading-indicator>
        `;
	}

	_renderSuccessModel() {

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

	_renderErrorModal() {

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