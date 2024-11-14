import { ExecutionContext, Logger, Platform, SecurityContext } from 'platform/core';
import { Widget, css, html, until } from 'platform/elements';

// Import all UI Components. 
import 'platform/components';

/**
 * Physical entry-point of the application, based on a platform-provided base class.
 */
export class AppWidget extends Widget {

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
		this._securityContext = SecurityContext.getInstance();
		this._executionContext = ExecutionContext.getInstance();
		this._logger = Logger.getInstance();

		// Property defaults.
		this.isBusy = true;
		this.isSuccess = false;
		this.isError = false;
		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
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
			roles: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	_onUserLoginSuccess() {

		// Put your logic here to handle allow the

		this.isBusy = false;
		this.roles = this._securityContext.roles !== null && Array.isArray(this._securityContext.roles) ? this._securityContext.roles.join(`, `) : `n/a`;
	}

	_onUserLoginError() {
		// Put your logic here to handle a login error.
	}

	_onUserLoggedOut() {
		// Put your logic here, e.g. to inform the user that he / she
		// is now logged out and that the application will now perform a hard reload.
	}

	async _logViaChannelService() {

		try {
			this.isBusy = true;
			await this._logger.info(`Hello from [${until(this._executionContext.applicationName)}]`, `AppShell._logViaChannelService`);
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
				.example {
					display: grid; 
					grid-template-columns: 200px 1fr;
					border-bottom: 1px solid #EEEEEE;
					padding: 12px 0px 12px 0px;
				}
				
				.example:first-child {
					padding: 0px 0px 12px 0px;
				}
				
				.example:last-child {
					border-bottom: none;
					padding: 12px 0px 0px 0px;
				}
			`
		];
	}

	_webTemplate() {
		return html`
			${this.renderLoadingIndicator()}
			${this.renderContent()}
			${this.renderSuccessModel()}
			${this.renderErrorModal()}
		`;
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_mobileTemplate() {
		return this._webTemplate();
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
			<capitec-content-box>
				<capitec-card>
					<capitec-title-bar type="primary" label="Welcome from within the Widget"></capitec-title-bar>

					<capitec-action-bar>
						<capitec-label
							label="Illustrates using platform UI Components, Security- and Execution Context info. Replace all properties, events and rendering templates with your application's content.">
						</capitec-label>
					</capitec-action-bar>

					<capitec-content-box>
						<capitec-label type="subtitle" label="Security Context"></capitec-label>

						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Full Name:"></capitec-label>
							<capitec-label label="${this._securityContext.fullName}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Username:"></capitec-label>
							<capitec-label label="${this._securityContext.username}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Email:"></capitec-label>
							<capitec-label label="${this._securityContext.email}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Role(s):"></capitec-label>
							<capitec-label label="${this.roles}" type="strong"></capitec-label>
						</capitec-group>

						<capitec-spacer></capitec-spacer>

						<capitec-label type="subtitle" label="Execution Context"></capitec-label>

						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Parent App Platform Version:"></capitec-label>
							<capitec-label label="${this.parentContext.platformVersion}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Parent App Name:"></capitec-label>
							<capitec-label label="${this.parentContext.appName}" type="strong"></capitec-label>
						</capitec-group>

						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Platform Version"></capitec-label>
							<capitec-label label="${until(this._executionContext.platformVersion)}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="App Name"></capitec-label>
							<capitec-label label="${until(this._executionContext.applicationName)}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="App Version"></capitec-label>
							<capitec-label label="${until(this._executionContext.applicationVersion)}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Client IP:"></capitec-label>
							<capitec-label label="${this._executionContext.clientIp}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Browser:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).browser}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Rendering Engine:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).engine}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="OS Platform:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).osPlatform}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="CPU Architecture:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).cpuArchitecture}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Device Vendor:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).deviceVendor}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Device Model:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).deviceModel}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Device Type:"></capitec-label>
							<capitec-label label="${(this._executionContext || {}).deviceType}" type="strong"></capitec-label>
						</capitec-group>
					</capitec-content-box>

					<capitec-button-bar>
						<capitec-button type="primary" label="Log via Channel Service" @click="${(e) => this._logViaChannelService(e)}"></capitec-button>
						<capitec-button type="primary" label="Send string to application" @click="${(e) => this.messageApplication(`example-string-from-widget`, `Hello from widget`)}"></capitec-button>
						<capitec-button type="primary" label="Send object to application" @click="${(e) => this.messageApplication(`example-object-from-widget`, { message: `Object from widget` }, (detail) => console.log(`App responded with: ${JSON.stringify(detail)}`))}"></capitec-button>
					</capitec-button-bar>
				</capitec-card>
			</capitec-content-box>
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

// Creation of custom element, must be called "app-widget" by convention, as expected by the platform.
window.customElements.define(`app-widget`, AppWidget);