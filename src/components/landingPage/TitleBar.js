import { Component, css, html } from 'platform/elements';
import { EventAggregator } from 'platform/EventAggregator';

export class TitleBar extends Component {

	// --------------
	// INITIALISATION
	// --------------
	constructor() {
		super();

		this.fullname = ``;
		this.employeeId = ``;
		this.eventAggregator = EventAggregator.getInstance();
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
				}`
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
				<capitec-icon size="meadium" icon="system/search" @click="${() => this._searchCaller()}"></capitec-icon>
				<div class="logged-in-user">
					<capitec-label label="${this.fullname}"></capitec-label>
					<capitec-label label="${this.employeeId}"></capitec-label>
				</div>
				</capitec-group>
			</capitec-title-bar>
		`;
	}

}

window.customElements.define(`horizon-title-bar`, TitleBar);