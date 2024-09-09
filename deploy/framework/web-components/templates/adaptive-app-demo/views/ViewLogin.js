import { ExecutionContext, SecurityContext } from 'platform/core';
import { View, css, html } from 'platform/elements';
import { AppStore } from 'app/stores/AppStore';

class ViewLogin extends View {

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

		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {

		super.connectedCallback();
	}

	disconnectedCallback() {

	}

	// --------------
	// EVENT HANDLERS
	// --------------

	login() {

		// Simulate a data call.
		this._appStore.getDummyData();
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

	static get styles() {
		return [
			super.styles,
			css``
		];
	}

	_mobileTemplate() {

		return html`
			<capitec-content-box layout="vertical" gap="none" anchor noPadding>
				<capitec-title-bar type="save">
					<capitec-spacer></capitec-spacer>
					<capitec-group layout="vertical" halign="center">
						<capitec-label label="hello" type="title" style="--theme-label-title-font-size: 50px;"></capitec-label>
						<capitec-label label="${this._securityContext.firstName || ``}" type="subtitle"></capitec-label>
					</capitec-group>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>

				<capitec-content-box layout="vertical" grow="both">
					<capitec-group style="margin-top: 10px;">
						<capitec-select mode="basic" .items="${[{ id: 0, label: `Personal` }, { id: 1, label: `Business` }]}" label="Account" display-field="label"></capitec-select>
						<capitec-text-field label="Username"></capitec-text-field>
						<capitec-text-field label="Password" type="password"></capitec-text-field>
						<capitec-button type="primary" label="Sign In" @click="${() => this.login()}"></capitec-button>
					</capitec-group>
					
					<capitec-group style="margin-top: 10px; margin-bottom: auto;" layout="grid" gap="clear" rows="uniform" columns="uniform">
						<capitec-button row="1" column="1" label="Pay beneficiary" icon="system/client-insights-action" icon-placement="top"></capitec-button>
						<capitec-button row="1" column="2" label="Transfer money" icon="system/transfer-action" icon-placement="top"></capitec-button>
						<capitec-button row="2" column="1" label="Buy electricity" icon="system/prepaid-electricity-action" icon-placement="top"></capitec-button>
						<capitec-button row="2" column="2" label="Scan to pay" icon="system/scan-to-pay-action" icon-placement="top"></capitec-button>
					</capitec-group>
					
					<capitec-image style="margin-top: 40px;" size="medium" style="cursor: pointer" src="platform/icons/capitec-logo.svg" alt=""></capitec-image>
					<capitec-label style="margin-top: 10px; text-align: center;" label="Capitec Bank is an authorised financial services provider (FSP 46669) and registered credit provider (NCRCP13).\nCapitec Bank Limited Reg No: 1980/003695/06"></capitec-label>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_kioskTemplate() {

		return html`
			<capitec-content-box layout="vertical" gap="none" anchor noPadding>
				<capitec-title-bar type="save">
					<capitec-spacer></capitec-spacer>
					<capitec-group layout="vertical" halign="center">
						<capitec-label label="hello" type="title" style="--theme-label-title-font-size: 50px;"></capitec-label>
						<capitec-label label="${this._securityContext.firstName || ``}" type="subtitle"></capitec-label>
					</capitec-group>
					<capitec-spacer></capitec-spacer>
				</capitec-title-bar>

				<capitec-content-box layout="vertical" grow="both">
					<capitec-group style="margin-top: 10px;">
						<capitec-select mode="basic" .items="${[{ id: 0, label: `Personal` }, { id: 1, label: `Business` }]}" label="Account" display-field="label"></capitec-select>
						<capitec-text-field label="Username"></capitec-text-field>
						<capitec-text-field label="Password" type="password"></capitec-text-field>
						<capitec-button type="primary" label="Sign In" @click="${() => this.login()}"></capitec-button>
					</capitec-group>
					
					<capitec-group style="margin-top: 10px; margin-bottom: auto;" layout="grid" gap="clear" rows="uniform" columns="uniform">
						<capitec-button row="1" column="1" label="Pay beneficiary" icon="system/client-insights-action" icon-placement="top"></capitec-button>
						<capitec-button row="1" column="2" label="Transfer money" icon="system/transfer-action" icon-placement="top"></capitec-button>
						<capitec-button row="2" column="1" label="Buy electricity" icon="system/prepaid-electricity-action" icon-placement="top"></capitec-button>
						<capitec-button row="2" column="2" label="Scan to pay" icon="system/scan-to-pay-action" icon-placement="top"></capitec-button>
					</capitec-group>
					
					<capitec-image style="margin-top: 40px;" size="medium" style="cursor: pointer" src="platform/icons/capitec-logo.svg" alt=""></capitec-image>
					<capitec-label style="margin-top: 10px; text-align: center;" label="Capitec Bank is an authorised financial services provider (FSP 46669) and registered credit provider (NCRCP13).\nCapitec Bank Limited Reg No: 1980/003695/06"></capitec-label>
				</capitec-content-box>
			</capitec-content-box>
		`;
	}

	_webTemplate() {
		return html`
			<capitec-content-box layout="vertical">
				<capitec-group layout="horizontal" halign="stretch" valign="stretch">
					<capitec-card label="Sign-in" layout="vertical" halign="center">
						<capitec-group layout="vertical" halign="stretch">
							<capitec-select mode="basic" .items="${[{ id: 0, label: `Personal` }, { id: 1, label: `Business` }]}" label="Account" display-field="label"></capitec-select>
							<capitec-text-field label="Username"></capitec-text-field>
							<capitec-text-field label="Password" type="password"></capitec-text-field>
						</capitec-group>
						<capitec-button type="primary" label="Sign In" @click="${() => this.login()}"></capitec-button>
					</capitec-card>
	
					<capitec-card label="Favourites" layout="grid" gap="clear" rows="uniform" columns="uniform">
						<capitec-button row="1" column="1" label="Pay beneficiary" icon="system/client-insights-action" icon-placement="left"></capitec-button>
						<capitec-button row="1" column="2" label="Transfer money" icon="system/transfer-action" icon-placement="left"></capitec-button>
						<capitec-button row="2" column="1" label="Buy electricity" icon="system/prepaid-electricity-action" icon-placement="left"></capitec-button>
						<capitec-button row="2" column="2" label="Scan to pay" icon="system/scan-to-pay-action" icon-placement="left"></capitec-button>
					</capitec-card>
				</capitec-group>

				<capitec-label style="margin-top: auto; margin-bottom: 10px; text-align: center;" label="Capitec Bank is an authorised financial services provider (FSP 46669) and registered credit provider (NCRCP13).\nCapitec Bank Limited Reg No: 1980/003695/06"></capitec-label>
			</capitec-content-box>
		`;
	}
}

window.customElements.define(`view-login`, ViewLogin);