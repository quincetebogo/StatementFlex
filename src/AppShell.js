import { Configuration, EventAggregator, ExecutionContext, Logger, NavigationContext, Platform, Router, Security, SecurityContext } from 'platform/core';
import { HORIZON_VIEW_SET, HorizonViewManager } from 'app/shell/HorizonViewManager';
import { Shell, css, html } from 'platform/elements';

import { DesktopAgentService } from 'app/services/DesktopAgentService.js';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonStore } from 'app/store/HorizonStore';

// Import Horizon Routes
import horizonRoutes from 'app/shell/HorizonRouter';
 
// Import all UI Components. 
import 'platform/components';
import 'platform/components/navigation/AppRouter';

import 'app/components/shell/HorizonStatusBar';

import 'app/components/common/AlertBanner';

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
		Platform.onUserLoginSuccess(() => this._userLoginSuccess());

		// Callback for user authentication error.
		Platform.onUserLoginError(() => this._userLoginError());

		// Callback for user authentication logout.
		Platform.onUserLoggedOut(() => this._userLoggedOut());

		// Variables
		this._router = Router.getInstance();
		this._navigationContext = NavigationContext.getInstance();
		this._security = Security.getInstance();
		this._securityContext = SecurityContext.getInstance();
		this._executionContext = ExecutionContext.getInstance();
		this._appStore = HorizonStore.getInstance();

		this._logger = Logger.getInstance();
		this._configuration = Configuration.getInstance();


		// Adding routes to URL Routing Table
		horizonRoutes.map(route => this._router.addRoute(route));

		// Event Aggregator
		this.eventAggregator = EventAggregator.getInstance();

		this.eventAggregator.subscribe(`platform-navigation-context-updated`, () => this._onNavigationContextUpdated());
		this.eventAggregator.subscribe(`horizon-status-bar-update`, (event) => this._onUpdateStatusBar(event));

		// Property defaults.
		this.isBusy = false;
		this.isAuthenticating = true;

		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
		this.platformVersion = null;
		this.applicationName = null;
		this.applicationVersion = null;
		this.currentStatus = `success`;
		this.currentMessage = ``;

		this.horizonViewManager = HorizonViewManager.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.currentView = this.horizonViewManager.transitionToView(HORIZON_VIEW_SET.LANDING_PAGES);
	}


	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { type: Boolean },
			isAuthenticating: { type: Boolean },

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
		
		this._casperScript(); 

		this.horizonIncidentManager.initialise();
		// Subscribe to store.
		this._appStoreSub = this._appStore.stateChanged.subscribe(state => this._stateChanged(state));

		const nextView = this.horizonViewManager.getCurrentView();
		if (this.currentView !== nextView) {
			this.currentView = nextView;
		}
	}

	disconnectedCallback() {

		// Unsubscribe from store.
		this._appStoreSub.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	async _userLoginSuccess() {

		// Put your logic here to execute post login success,
		// for example loading application data.

		this.platformVersion = await this._executionContext.platformVersion;
		this.applicationName = await this._executionContext.applicationName;
		this.applicationVersion = await this._executionContext.applicationVersion;
		this.clientIp = this._executionContext.clientIp;

		this.sblUrl = await this._configuration.getSetting(`otherSystemsURL.sbl`);
		this.cdsUrl = await this._configuration.getSetting(`otherSystemsURL.cds`);
		this.cnetUrl = await this._configuration.getSetting(`otherSystemsURL.cnet`);

		// Start the Desktop Agent service to subscribe to incoming call events from the Desktop Agent Application
		this.agentService = DesktopAgentService.getInstance();
		this.agentService.open();

		this._appStore.setState({ }, `USER_LOGGED_IN`);

		// We are authenticated and done loading config
		// trigger the display of the initial landing page.
		this.isAuthenticating = false;
	}

	_userLoginError() {
		// Put your logic here to execute post login error,
		// for example showing a login failure screen / dialog.

		this.isAuthenticating = false;
	}

	_userLoggedOut() {
		// Put your logic here to execute post logout, 
		// for example showing a logout screen / dialog
		// explaining to the user that he /she is now logged out
		// and that the application will now reload.
		this.isAuthenticating = false;
	}

	_onNavigationContextUpdated() {
		const nextView = this.horizonViewManager.getCurrentView();
		if (nextView !== this.currentView) {
			this.currentView = nextView;
		}
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

	_stateChanged() {
		const callerInfo = HorizonStore.getInstance().getCallerInformation();
		
		if (callerInfo && callerInfo.verificationStatus === `verified` && this.currentView === HORIZON_VIEW_SET.UNVERIFIED_PAGES) {
			this.horizonViewManager.transitionToView(HORIZON_VIEW_SET.VERIFIED_PAGES);
			this.currentView = this.horizonViewManager.getCurrentView();
		}
	};

	async _casperScript() {
		const body = document.body || document.getElementsByTagName(`body`)[0];
		const casper = document.getElementById(`CASPerScript`);

		if (!casper) {
			const script = document.createElement(`script`);
			
			script.src = await this._configuration.getSetting(`otherSystemsURL.CASPer`);
			script.setAttribute(`type`, `text/javascript`);
			script.setAttribute(`id`, `CASPerScript`);
			script.setAttribute(`title`, `CASPer Widget`);

			body.appendChild(script);
		}
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

				:host {
					--horizon-screen-width: 1920px;
					--horizon-screen-height: 1080px;
					--horizon-center-panel-width: 1064px;
					--horizon-left-panel-width: 440px;
					--horizon-right-panel-width: 320px;
					--horizon-panel-height: 888px;
					--horizon-toast-top: 68px;
					--horizon-modal-width: 696px;
					--horizon-end-call-button-margin-right: 16px;
					--horizon-end-call-button-margin-top: 8px;
					--horizon-status-bar-icon-group-right-margin: 80px;
				}

				.screen-size {
					width : var(--horizon-screen-width);
					height : var(--horizon-screen-height);
					display: flex;
					flex-direction: column;
				}

				.screen-content {
					width : 100%;
					height: auto;
					background : #f4f4f4; 
				}

				.grid-container {
					display: grid;
					grid-template-columns: var(--horizon-left-panel-width) var(--horizon-center-panel-width) var(--horizon-right-panel-width);
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

				.left {
					width: var(--horizon-left-panel-width);
				}

				.right {
					width: var(--horizon-right-panel-width);
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
					--theme-modal-header-padding-right: 16px;

					/* StatusBar */
					--theme-statusbar-min-height: 72px;

					/* Products Menu */
					--theme-product-tile-heading-margin-top: 11px;
					--theme-product-tile--height: 72px;
					--theme-product-tile-title-height: 27px;
					--theme-product-tile-title-font-size: 18px;
					--theme-product-tile-subtitle-height: 23px;
					--theme-product-tile-subtitle-font-size: 15px;

					/* Banner text should now be black - set it here until the platform does*/
					--theme-alert-banner-info-font-color: #3A3A3A;
					--theme-alert-banner-success-font-color: #3A3A3A;
					--theme-alert-banner-warning-font-color: #3A3A3A;
					--theme-alert-banner-error-font-color: #3A3A3A;
					--theme-alert-banner-unsuccessful-font-color: #3A3A3A;
					--theme-alert-banner-unsuccessful-red-font-color: #3A3A3A;

					--theme-hyperlink-color:  #3A3A3A;
				}
				`
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
			${this._renderLoginFailed()}
			${this._renderAuthenticating()}
	   		${this._renderContent()}
		`;
	}

	_mobileTemplate() {
	}

	_renderLoginFailed() {
		if (!this.isAuthenticating && !this._security.isAuthenticated) {
			return html`Login Failed`;
		}
	}

	_renderAuthenticating() {
		if (this.isAuthenticating) {
			return html``;
		}
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
		if (this._security.isAuthenticated === undefined || !this._security.isAuthenticated) {
			return ``;
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
				
				<horizon-statusbar 
					currentStatus="${this.currentStatus}" 
					currentMessage="${this.currentMessage}"
					sblLink="${this.sblUrl}"
					cdsLink="${this.cdsUrl}"
					cnetLink="${this.cnetUrl}"
					appVersion="${this.applicationVersion}">
				</horizon-statusbar>
			</div>`;
	}

	_renderLoadingIndicator() {
		if (this.isBusy || this.isAuthenticating) {
			return html`<capitec-loading-indicator data-automation-id="app-shell-loading-indicator"></capitec-loading-indicator>`;
		}
	}
}

// Creation of custom element, must be called "app-shell" by convention, as expected by the platform.
window.customElements.define(`app-shell`, AppShell);