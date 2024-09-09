import { ExecutionContext, SecurityContext } from 'platform/core';
import { View, css, html, until } from 'platform/elements';
import { AppStore } from 'app/stores/AppStore';

/**
 * Sample view that illustrates:
 * 
 * 1. Security Context info retrieval.
 * 2. Execution Context info retrieval.
 * 3. App Store subscription for dummy data retrieval.
 * 4. Basic event handlers.
 */
class ViewSettings extends View {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {

		super();

		// Variables
		this._securityContext = SecurityContext.getInstance();
		this._executionContext = ExecutionContext.getInstance();
		this._appStore = AppStore.getInstance();

		// Properties (defaults)
		this.dummyData = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			dummyData: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		super.connectedCallback();

		// Subscribe to store.
		this._appStoreDummyDataSub = this._appStore.getStateChangedProperties.subscribe(obj => {

			// Only include state changes for "dummyData" property.
			if (!obj || !obj.stateChanges || !obj.stateChanges.dummyData) {
				return;
			}

			this.dummyData = obj.stateChanges.dummyData;
		});
	}

	disconnectedCallback() {

		// Unsubscribe from store.
		this._appStoreDummyDataSub.unsubscribe();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_openCatalogue() {
		window.open(`https://web-component-catalogue.platform-dev.int.capinet`, `_blank`);
	}

	_openConfluenceDocs() {
		window.open(`https://confluence.int.capinet:8443/display/CPT/Omni-channel+Web+Platform`, `_blank`);
	}

	_openLitElementDocs() {
		window.open(`https://lit.dev/`, `_blank`);
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
	 * Generates the component template for desktop mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			<capitec-content-box>
				<capitec-card>
					<capitec-title-bar type="primary" label="Runtime Info"></capitec-title-bar>
					<capitec-content-box gap="none">
						<capitec-label type="subtitle" label="Security Context"></capitec-label>
			
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Full Name"></capitec-label>
							<capitec-label label="${this._securityContext.fullName}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Username"></capitec-label>
							<capitec-label label="${this._securityContext.username}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Email"></capitec-label>
							<capitec-label label="${this._securityContext.email}" type="strong"></capitec-label>
						</capitec-group>
						<capitec-group layout="horizontal" halign="left" class="example">
							<capitec-label label="Role(s)"></capitec-label>
							<capitec-label
								label="${Array.isArray(this._securityContext.roles) ? this._securityContext.roles.join(`, `) : `n/a`}"
								type="strong"></capitec-label>
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
						<capitec-button type="primary" label="Get Dummy Data" @click="${() => this._appStore.getDummyData()}">
						</capitec-button>
						<capitec-button type="secondary" label="Open Component Catalogue" @click="${(e) => this._openCatalogue()}">
						</capitec-button>
						<capitec-button type="secondary" label="Open Confluence Docs" @click="${(e) => this._openConfluenceDocs()}">
						</capitec-button>
						<capitec-button type="secondary" label="Open LitElement Docs" @click="${(e) => this._openLitElementDocs()}">
						</capitec-button>
					</capitec-button-bar>
				</capitec-card>
				${this._renderDummyData()}
			</capitec-content-box>
		`;
	}


	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return this._webTemplate();
	}

	_renderDummyData() {

		if (!this.dummyData) {
			return html``;
		}

		return html`<capitec-code language="js" title="Dummy Data" .content="${JSON.stringify(this.dummyData)}"></capitec-code>`;
	}
}

window.customElements.define(`view-settings`, ViewSettings);