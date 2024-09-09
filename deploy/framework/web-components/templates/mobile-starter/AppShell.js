import { ExecutionContext, Logger, Platform, SecurityContext } from 'platform/core';
import { Shell, css, html, until } from 'platform/elements';

// Import all UI Components. 
import 'platform/components';

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
		Platform.init({ security: false });

		// Callback for user authentication success.
		Platform.onUserLoginSuccess(() => this._userLoginSuccess());

		// Callback for user authentication error.
		Platform.onUserLoginError(() => this._userLoginError());

		// Callback for user authentication logout.
		Platform.onUserLoggedOut(() => this._userLoggedOut());

		// Platform Non-UI Components.
		this._securityContext = SecurityContext.getInstance();
		this._executionContext = ExecutionContext.getInstance();
		this._logger = Logger.getInstance();

		// Property defaults.
		this.isBusy = false;
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
			securityContext: { type: Object },
			roles: { type: Array },

			deviceInfo: { type: Object },
			batteryInfo: { type: Object },
			cameraData: { type: String },
			browser: { type: Object },
			deviceCodeResult: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a

	// --------------
	// EVENT HANDLERS
	// --------------

	async connectedCallback() {

		await super.connectedCallback();

		this.isBusy = false;
	}

	_userLoginSuccess() {

		// Put your logic here to handle allow the login.

		this.isBusy = false;
		this.roles = this._securityContext.roles !== null && Array.isArray(this._securityContext.roles) ? this._securityContext.roles.join(`, `) : `n/a`;
	}

	_userLoginError() {

		// Put your logic here to execute post login error,
		// for example showing a login failure screen / dialog.
	}

	_userLoggedOut() {

		// Put your logic here to execute post logout, 
		// for example showing a logout screen / dialog
		// explaining to the user that he /she is now logged out
		// and that the application will now reload.
	}

	async _getDeviceInfo() {

		this.deviceInfo = await this._executionContext.getDeviceInfo();
	}

	async _getBatteryInfo() {

		this.batteryInfo = await this._executionContext.getBatteryInfo();
	}

	async _takePhoto() {

		this.cameraData = await this._executionContext.takePhoto();
	}

	async _openBrowser() {

		// Launch the browser window.
		this.browser = await this._executionContext.openBrowser(`https://www.capitecbank.co.za`, `_blank`);

		// Listen for message passing events from the browser.
		this.browser.addEventListener(`message`, event => console.log(`InAppBrowser message`, event));

		// Send a test message to the browser.
		this.browser.postMessage({ data: `test` });

		// Close the browser after 10 seconds.
		setTimeout(() => {
			this.browser.close();
			this.browser = undefined;
		}, 10000);
	}

	_executeDeviceCode() {

		this.deviceCodeResult = { demo: `Plugin not registered, see code example` };

		/*
		this.deviceCodeResult = await this._executionContext.executeDeviceCode(
			`EchoPlugin`,
			`echo`,
			{
				value: `Hello World`
			}
		);
		*/

		// ---------------------------------------------------------
		// CAPACITOR PLUGIN DEMO
		//
		// Place this Java code in your Android project, then you'll
		// be able to call it using the above Javascript code.
		// ---------------------------------------------------------

		/*
		// src/main/java/.../EchoPlugin.java

		package za.co.capitecbank.AppPackageName;

		import com.getcapacitor.JSObject;
		import com.getcapacitor.Plugin;
		import com.getcapacitor.PluginCall;
		import com.getcapacitor.PluginMethod;
		import com.getcapacitor.annotation.CapacitorPlugin;

		@CapacitorPlugin(name = "EchoPlugin")
		public class EchoPlugin extends Plugin {

			@PluginMethod()
			public void echo(PluginCall call) {
				
				String value = call.getString("value");

				JSObject ret = new JSObject();
				ret.put("value", value + " (from device)");
				call.resolve(ret);
			}
		}
		*/

		/*
		// src/main/java/.../MainActivity.java
		
		package za.co.capitecbank.AppPackageName;

		import android.os.Bundle;

		import com.getcapacitor.BridgeActivity;

		public class MainActivity extends BridgeActivity {

			@Override
			public void onCreate(Bundle savedInstanceState) {
				
				super.onCreate(savedInstanceState);
				
				// Register custom plugins.
				registerPlugin(EchoPlugin.class);
			}
		}
		*/
	}

	_openCatalogue() {
		window.open(`https://web-component-catalogue.platform-dev.int.capinet`, `_blank`);
	}

	_openConfluenceDocs() {
		window.open(`https://confluence.int.capinet:8443/display/CPT/Omni-channel+Web+Platform`, `_blank`);
	}

	_openLitElementDocs() {
		window.open(`https://lit.dev/`, `_blank`);
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

	/**
	 * Default, generic rendering method, which is application type agnostic. 
	 * 
	 * If explicit rendering is required for an application type, please refer to the below 
	 * rendering method for each support application type (uncomment as required):
	 *  - "desktop": *_webTemplate()*
	 *  - "kiosk": *_kioskTemplate()*
	 *  - "mobile": *_mobileTemplate()*
	 * 
	 * NOTE: If this method is declared, as well as any of the other rendering methods,
	 * this method will **take precedence**, i.e. the others **will be ignored**. 
	 * Remove this method if any of the other rendering methods are declared.
	 *
	 * @returns {html} Generic rendering template method.
	 */
	renderShell() {

		return html`
			${this._renderLoadingIndicator()}
			${this._renderContent()}
			${this._renderSuccessModel()}
			${this._renderErrorModal()}
		`;
	}

	// NOTE: Remove the below commented out code if *renderShell()* is sufficient to use.

	// /**
	//  * Rendering method for "desktop" application type only.
	//  * 
	//  * NOTE: Please ensure to also specify *_mobileTemplate()* method, 
	//  * if required to support mobile device detection, 
	//  * which is enabled by default.
	//  * 
	//  * @returns {html} "desktop" rendering template method.
	//  */
	// _webTemplate() {
	//      return html``;
	// }

	// /**
	//  * Rendering method for "kiosk" application type only.
	//  * 
	//  * @returns {html} "kiosk" rendering template method.
	//  */
	// _kioskTemplate() {
	//      return html``;
	// }

	// /**
	//  * Rendering method for "mobile" application type only.
	//  * 
	//  * @returns {html} "mobile" rendering template method.
	//  */
	// _mobileTemplate() {
	//      return html``;
	// }

	_renderLoadingIndicator() {

		if (!this.isBusy) {
			return html``;
		}

		return html`
			<capitec-loading-indicator></capitec-loading-indicator>
		`;
	}

	_renderContent() {

		if (this.isBusy) {
			return html``;
		}

		return html`
			<capitec-content-box>
				<capitec-card>
					<capitec-title-bar type="primary" label="Welcome"></capitec-title-bar>
					<capitec-content-box>
						<capitec-label
							label="Illustrates using platform UI Components, Security- and Execution Context info. Replace all properties, events and rendering templates with your application's content.">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label type="subtitle" label="Security Context"></capitec-label>
			
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Full Name:"></capitec-label>
							<capitec-label label="${(this._securityContext || {}).fullName}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Username:"></capitec-label>
							<capitec-label label="${(this._securityContext || {}).username}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Email:"></capitec-label>
							<capitec-label label="${(this._securityContext || {}).email}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Role(s):"></capitec-label>
							<capitec-label label="${this.roles}" type="strong"></capitec-label>
						</capitec-group>
			
						<capitec-spacer></capitec-spacer>
			
						<capitec-label type="subtitle" label="Execution Context"></capitec-label>
			
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
							<capitec-label label="${until(this._executionContext.applicationVersion)}" type="strong">
							</capitec-label>
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
						<capitec-button type="primary" label="Open Component Catalogue" @click="${(e) => this._openCatalogue(e)}">
						</capitec-button>
						<capitec-button type="primary" label="Open Confluence Docs" @click="${(e) => this._openConfluenceDocs(e)}">
						</capitec-button>
						<capitec-button type="primary" label="Open LitElement Docs" @click="${(e) => this._openLitElementDocs(e)}">
						</capitec-button>
						<capitec-button type="primary" label="Log via Channel Service"
							@click="${(e) => this._logViaChannelService(e)}"></capitec-button>
					</capitec-button-bar>
				</capitec-card>
			
				<capitec-card>
					<capitec-title-bar type="credit">
						<capitec-label type="subtitle" label="Device Info"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button type="white" label="Get Device Info" @click="${(e) => this._getDeviceInfo(e)}">
						</capitec-button>
					</capitec-title-bar>
					<capitec-content-box>
						${!this.deviceInfo ? html`` : Object.keys(this.deviceInfo).map(key => html`
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="${key}:"></capitec-label>
							<capitec-label label="${this.deviceInfo[key]}" type="strong"></capitec-label>
						</capitec-group>
						`)}
					</capitec-content-box>
				</capitec-card>
			
				<capitec-card>
					<capitec-title-bar type="credit">
						<capitec-label type="subtitle" label="Battery"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button type="white" label="Get Battery Info" @click="${(e) => this._getBatteryInfo(e)}">
						</capitec-button>
					</capitec-title-bar>
					<capitec-content-box>
						${!this.batteryInfo ? html`` : Object.keys(this.batteryInfo).map(key => html`
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="${key}:"></capitec-label>
							<capitec-label label="${this.batteryInfo[key]}" type="strong"></capitec-label>
						</capitec-group>
						`)}
					</capitec-content-box>
				</capitec-card>
			
				<capitec-card>
					<capitec-title-bar type="credit">
						<capitec-label type="subtitle" label="Camera"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button type="white" label="Take Photo" @click="${(e) => this._takePhoto(e)}"></capitec-button>
					</capitec-title-bar>
					<capitec-content-box>
						${!this.cameraData ? html`` : html`
						<img src="${this.cameraData}"
							style="object-fit: contain; max-width:100%; max-height: 400px; width: auto; height:auto;" />
						`}
					</capitec-content-box>
				</capitec-card>
			
				<capitec-card>
					<capitec-title-bar type="credit">
						<capitec-label type="subtitle" label="In App Browser"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button type="white" label="Open URL" @click="${(e) => this._openBrowser(e)}"></capitec-button>
					</capitec-title-bar>
					<capitec-content-box>
						${!this.browser ? html`` : html`
			
						`}
					</capitec-content-box>
				</capitec-card>
			
				<capitec-card>
					<capitec-title-bar type="credit">
						<capitec-label type="subtitle" label="Execute Device Code"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-button type="white" label="Call" @click="${(e) => this._executeDeviceCode(e)}"></capitec-button>
					</capitec-title-bar>
					<capitec-content-box>
						${!this.deviceCodeResult ? html`` : Object.keys(this.deviceCodeResult).map(key => html`
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="${key}:"></capitec-label>
							${key === `image` ? html`
							<img src="${this.deviceCodeResult[key]}">
							` : html`
							<capitec-label label="${this.deviceCodeResult[key]}" type="strong"></capitec-label>
							`}
						</capitec-group>
						`)}
					</capitec-content-box>
				</capitec-card>
			</capitec-content-box>
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