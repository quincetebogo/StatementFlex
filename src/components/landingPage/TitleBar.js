import { Component, css, html } from 'platform/elements';
import { Configuration } from 'platform/core';
import { EventAggregator } from 'platform/EventAggregator';
import { RoleManager } from 'app/shell/RoleManager';

/**
 * The Title Bar is displayed at the top of the initial Horizon Landing Page (Call Waiting Page)
 * This component displays the logged in user and provides a button that triggers the
 * searching for a client rather than waiting for a call to pop successfully.
 */
export class TitleBar extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.fullname = ``;
		this.employeeId = ``;
		this.searchClientEnabled = false;

		this._configuration = Configuration.getInstance();
		this.eventAggregator = EventAggregator.getInstance();
		this.roleManager = RoleManager.getInstance();

		this.titleBarSub = this.eventAggregator.subscribe(`horizon-update-title-bar`, (event) => this._onUpdateTitle(event));
	}

	// ----------
	// PROPERTIES
	// ----------
	static get properties() {
		return {
			// to extract client details from the service
			fullname: { type: String },
			employeeId: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._initialise();
	}

	disconnectedCallback() {
		this.titleBarSub.dispose();

		super.disconnectedCallback();
	}


	// --------------
	// EVENT HANDLERS
	// --------------

	_onUpdateTitle(event) {
		this.fullname = event.agentFullName;
		this.employeeId = event.employeeId;
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_searchCaller() {
		this.eventAggregator.publish(`search-caller`, {});
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	async _initialise() {
		this.searchClientEnabled = await this._configuration.getSetting(`searchClientOptionEnabled`) || this.roleManager.isSearchClientEnabled;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
				.title-bar{
					width: 100%;
					height: 72px;
					background-color: #ffffff;
					box-shadow: 0 1px 3px 0 rgba(0,0,0,0.2);
					grid-template-columns: 1fr;
					grid-row-gap: 8px;
				}
				.branding-logo-white{
					height: 32px;
					width: 193px;
				}
				.logged-in-user{
					color: #003652;
				}
				capitec-icon[icon="system/search"] {
					cursor: pointer;
				}
			`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-title-bar class="title-bar" type="clear" row=1>
				<capitec-icon class="branding-logo-white" size="medium" icon="capitec-logo"></capitec-icon>
				<capitec-spacer></capitec-spacer>
				<capitec-group layout="horizontal" gap="line" halign="right" valign="center">
				<capitec-icon 
					size="meadium" 
					icon="system/search"
					@click="${() => this._searchCaller()}"
					data-automation-id="title-bar-search"
					?hidden="${!this.searchClientEnabled}">
				</capitec-icon>
				<div class="logged-in-user">
					<capitec-label 
						label="${this.fullname}"
						data-automation-id="title-bar-user-name">
					</capitec-label>
					<capitec-label 
						label="${this.employeeId}"
						data-automation-id="title-bar-employee-id">
					</capitec-label>
				</div>
				</capitec-group>
			</capitec-title-bar>
		`;
	}

}

window.customElements.define(`horizon-title-bar`, TitleBar);