import { Shell, css, html } from 'platform/elements';
import { ExecutionContext } from 'platform/ExecutionContext';
import { Logger } from 'platform/Logger';
import { Platform } from 'platform/Platform';
import { SecurityContext } from 'platform/SecurityContext';
import { Router } from 'platform/Router';
import { NavigationContext } from 'platform/NavigationContext';
import { EventAggregator } from 'platform/EventAggregator';

// Import all UI Components. 
import 'platform/components';
import 'platform/components/navigation/AppRouter';

//import utils to tranform user role
import './utils/TransformAgentRole';

//Import Horizon Routes
import horizonRoutes from './HorizonRoutes';
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

		// Adding routes to URL Routing Table
		horizonRoutes.map(route => this.router.addRoute(route));


		// Listening for SSE events from the Desktop Agent
		this.eventSource = new EventSource("http://localhost:8888/subscribe"); //TODO: make configurable
		this.eventSource.addEventListener("new-call", (event) => {
			console.log("Received 'new-call' event: ", event);
		})

		//Event Aggregator
		EventAggregator
			.getInstance()
			.subscribe(`platform-navigation-context-updated`, () => this.onNavigationContextUpdated());

		EventAggregator
			.getInstance()
			.subscribe(`horizon-top-bar-data`, (event) => this.onTopBarUpdated(event));

		// Property defaults.
		this.isBusy = true;
		this.isSuccess = false;
		this.isError = false;
		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
		this.platformVersion = null;
		this.applicationName = null;
		this.applicationVersion = null;
		this.landingPageView = true;
		this.callWaitingView = false;
		this.fullname = ``;
		this.employeeId = ``;
		this.cardStop = [];
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
			landingPageView: { type: String },
			fullname: { type: String },
			employeeId: { type: String },
			cardStop: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	async _onUserLoginSuccess() {

		// Put your logic here to handle allow the

		this.isBusy = false;
		this.roles = this.securityContext.roles != null && Array.isArray(this.securityContext.roles) ? this.securityContext.roles.join(`, `) : 'n/a';
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

	navigate(path) {
		this.router.navigateByPath(`/${path}`);
	}

	onNavigationContextUpdated() {
		console.log(`Current screen is [${NavigationContext.getInstance().current.route.name}]`);
	};

	onTopBarUpdated(event) {
		this.fullName = event.agentFullName;
		this.employeeId = event.employeeId;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

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
				.content{
					width:1913px;
					height:936.5px;
				}
				.branding-logo-white{
					height: 32px;
					width: 193px;
				}

				.title-bar{
					height: 100%;
					width: 1913px;
					background-color: #ffffff;
					// background: linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%), linear-gradient(135deg, #126D9B 0%, #0985C5 54.69%, #298EA7 100%);
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2);
					grid-template-columns: 1fr;
					grid-row-gap: 8px;
				}
			
				.status-bar{
					height: 60px;
					width: 1913px;
				}

				capitec-content-box{
					background: none;
					width:1913px;
					height:760px;
				}
				.userrole{
					color: #003652;
				}

			`
		];
	}

	/**
	 * Core rendering method as expected by the platform for a Shell instance.
	 *
	 * @returns {html} HTML content for the component.
	 */
	renderShell() {
		return html`
            ${this.renderLoadingIndicator()}
            ${this.renderContent()}
            ${this.renderSuccessModel()}
            ${this.renderErrorModal()}
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

	renderContent() {

		if (this.isBusy) {
			return html``;
		}

		return html`
         
                <capitec-group class="content" layout="grid" gap="none" columns="auto" rows="auto">

					<capitec-title-bar class="title-bar" type="clear" row="1">
						<capitec-icon class="branding-logo-white" size="medium" icon="capitec-logo"></capitec-icon>
						<capitec-spacer></capitec-spacer>
						<div class="userrole">
							<capitec-label label="${this.fullName}"></capitec-label>
							<capitec-label label="${this.employeeId}"></capitec-label>
						</div>
					</capitec-title-bar>

                    <capitec-content-box nopadding row="2">
						<capitec-app-router></capitec-app-router>
                    </capitec-content-box>
	
					<capitec-status-bar class="status-bar" status="success" label="" row="3"></capitec-status-bar>

                </capitec-group>
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