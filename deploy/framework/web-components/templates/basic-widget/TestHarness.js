import { ExecutionContext, Logger, Platform, SecurityContext } from 'platform/core';
import { Shell, css, html } from 'platform/elements';

// Import all UI Components. 
import 'platform/components';

/**
 * Physical entry-point of the application, based on a platform-provided base class.
 */
export class TestHarness extends Shell {

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

		// Property defaults.
		this.isBusy = true;
		this.isSuccess = false;
		this.isError = false;
		this.errorMessage = null;
		this.channelServiceUrl = document.location.origin;
		this.platformVersion = null;
		this.applicationName = null;
		this.applicationVersion = null;
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
			applicationVersion: { type: String }
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
		this.roles = this.securityContext.roles !== null && Array.isArray(this.securityContext.roles) ? this.securityContext.roles.join(`, `) : `n/a`;
		this.platformVersion = await this.executionContext.platformVersion;
		this.applicationName = await this.executionContext.applicationName;
		this.applicationVersion = await this.executionContext.applicationVersion;
		this.clientIp = this.executionContext.clientIp;
	}

	_onUserLoginError() {
		// Put your logic here to handle a login error.
	}

	_onUserLoggedOut() {
		// Put your logic here, e.g. to inform the user that he / she
		// is now logged out and that the application will now perform a hard reload.
	}

	_objectReceived(e) {
		console.log(JSON.stringify(e.detail.content));

		e.detail.callback({
			message: `This is the app response`
		});
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
				.widget {
					width: 100%; 
					height: 70vh;
				}

				.title {
					text-align: center;
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
			<capitec-content-box anchor>
				<capitec-group layout="vertical" gap="line" halign="stretch" valign="stretch">
					<capitec-label class="title" type="title" label="Test your widget here"></capitec-label>
			
					<!-- Display the widget at location "./widget.html". This will typically be a link to the widget, e.g. "https://my-widget.platform-dev.int.capinet/widget.html" -->
					<capitec-widget id="widget1" src="./widget.html" class="widget"
						@example-string-from-widget="${(e) => console.log(e.detail.content)}"
						@example-object-from-widget="${this._objectReceived}"></capitec-widget>
				</capitec-group>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`app-shell`, TestHarness);