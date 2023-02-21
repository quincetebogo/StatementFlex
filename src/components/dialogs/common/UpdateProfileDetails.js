import { Component, css, html } from 'platform/elements';

const MENU_ITEMS = {
	PREFERENCE: `Preference`
};

export class UpdateProfileDetails extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.header = ``;
		this.selectedMenuItem = MENU_ITEMS.PREFERENCE;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			header: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onCancelClick() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_saveChanges() {}

	_onValueChanged() {}

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

			capitec-modal {
				height: auto;
				width: 694px;
				--theme-modal-header-padding-top: 20px;
				--theme-modal-header-padding-bottom: 20px;
				--theme-modal-header-padding-right: 16px;
				--theme-modal-header-padding-left: 16px;
				--theme-modal-footer-padding: 0px 16px 16px 0px;
				--theme-modal-header-background-color: #F7F7F7;
				--theme-modal-header-color: #3E4547;
			}

			div[slot="body"] {
				width: 856px;
				height: auto;
			}

			.body-box {
				height: auto;
				margin: 0px 0px 0px 0px;
				--theme-container-padding-top : 13px;
				--theme-container-padding-bottom: 0px;
			}

			capitec-menu {
				height: 610px;
				--theme-menu-item-separator-padding-right: 0px;
				--theme-menu-item-separator-padding-left: 0px;
				--theme-menu-item-separator-padding-top: 0px;
				--theme-menu-item-separator-padding-bottom: 0px;
				--theme-menu-item-selected-indicator-height: 64px;
				--theme-menu-item-font-size: 18px;
				--theme-menu-item-selected-indicator-width: 2px;
				--theme-menu-item-selected-indicator-border-radius: 0px;
			}

			#id-cancel-button {
				height: 48px;
				width: 94px;
				margin-right: 19px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 23px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 23px;
				--theme-button-clear-border-width: 0px;
				--theme-button-line-height: 20px;
			}

			#id-save-button {
				height: 48px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 24px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 24px;
				--theme-button-primary-border-width: 0px;
				--theme-button-line-height: 20px;
			}`
		];
	}

	_mobileTemplate() {
	}

	_webTemplate() {
		return html`
			<capitec-modal type="free" header-align="left" header="${this.header}">
				<div slot="body">
					<capitec-content-box class="body-box" noPadding>
					<capitec-menu hideFooter>
						<capitec-menu-item label=${MENU_ITEMS.PREFERENCE} ?selected=${this.selectedMenuItem === MENU_ITEMS.PREFERENCE}></capitec-menu-item>
						<capitec-menu-separator></capitec-menu-separator>
					</capitec-menu>
					${this._renderMenuDetails()}
					</capitec-content-box>
				</div>
				<div slot="footer">
					${this._renderFooter()}
				</div>
			</capitec-modal>
		`;
	}

	_renderMenuDetails() {
		return html`
		<capitec-group layout="horizontal"
						gap="none"
						halign="top"
						valign="left"
						class="">
						${this._renderPreferenceDetails()}
		</capitec-group>`;
	}

	_renderPreferenceDetails() {
		return this.selectedMenuItem === MENU_ITEMS.PREFERENCE
		? html`
			<capitec-select
				id=""
				data-automation-id=""
				label="Preferred language"
				display-field="value"
				.items=${this.endCallReasons}
				@value-changed="${(e) => this._valueChanged(e)}"
				tabindex=3
				value="${this.endCallReason.value || ``}"
				select-mode="single">
			</capitec-select>
		`
		: html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					id="id-cancel-button"
					type="clear"
					label="Cancel"
					@click="${() => this._onCancelClick()}">
				</capitec-button>

				<capitec-button
					id="id-save-button"
					type="primary"
					label="Save Changes"
					@click="${() => this._saveChanges()}">
				</capitec-button>
			</capitec-group>
		`;
	}
}

window.customElements.define(`horizon-update-profile-details`, UpdateProfileDetails);