import { css, html } from 'platform/elements';
import { ViewBase } from 'app/views/common/ViewBase.js';

import 'app/components/dialogs/common/UpdateProfileDetails';

const DETAILS_TAB = {
	0: `Client Details`
};

const CLIENT_DETAILS = {
	PREFERRED_LANGUAGE: `Preferred Language`,
	NOTIFICATION_TYPE: `Notification Type`
};

/**
 * View to render widget 404 not found
 * 
 * @export 
 * @class WidgetNotFound
 * @extends {View}
 */
export class ViewProfileDetails extends ViewBase {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.showUpdatePreferenceModal = false;
		this.clientDetails = {};
		this.selectedTab = DETAILS_TAB[0];
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this.clientDetails = {
			[CLIENT_DETAILS.PREFERRED_LANGUAGE]: `English`,
			[CLIENT_DETAILS.NOTIFICATION_TYPE]: `SMS`
		};
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			showUpdatePreferenceModal: { attribute: false }
		};
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_updateProfileDetails() {
		this.showUpdatePreferenceModal = true;
	}
	
	_getSelectedTab(e) {
		this.selectedTab = DETAILS_TAB[e.detail.selectedIndex];
	}

	async _updateClientPreferences(e) {
		// CS call to update client preferences
		const returnValue = await this._updatePreferences();
		this.showUpdatePreferenceModal = false;

		this.clientDetails[CLIENT_DETAILS.PREFERRED_LANGUAGE] = e.detail.preferredlanguage;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// N/A

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				.card {
					width: 100%;
					height: 888px;
				}

				/* Title Bar styles */
				capitec-title-bar {
					--theme-titlebar-padding: 12px 16px;
					margin-bottom: 0px;
					border-bottom-width: 0px;
					--theme-titlebar-item-gap: 0px;
				}
				capitec-title-bar > capitec-label {
					--theme-label-title-font-size: 22px;
					--theme-label-title-font-weight: 600;
					margin-left: 16px;
				}
				capitec-title-bar > capitec-icon {
					--theme-icon-size-medium: 24px;
				}

				/* Main view styles */
				capitec-tab-group {
					--theme-tab-hover-background-color: transparent;
					--theme-tab-indicator-border-radius: 0px;
					--theme-tab-border-bottom: 0px;
					--theme-tab-font-weight: 500;
					--theme-container-padding-left: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-container-padding-top: 0px;
					--theme-tab-bar-height: 64px;
					--theme-tab-label-padding-left-right: 16px;
				}
				.other-options {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 15px;
					--theme-label-title-font-weight: 600;
					--theme-type-default-font-color: #3A3A3A;
					--theme-label-title-font-size: 14px;
					--theme-titlebar-shadow: 0px;

					border-top: 1px solid #E1E1E1;
					border-bottom: 1px solid #E1E1E1;
				}
				horizon-label {
					height: 64px;
					width: 33%;
					padding: 12px 0px 0px 16px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 12px;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-color: #3A3A3A;
				}
				capitec-button-bar {
					--theme-buttonbar-padding: 6px 16px 6px 24px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-button {
					height: 48px;
					margin-left: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {

		return html`
			${this._renderViewProfileDetails()}
			${this._renderUpdateProfileDetailsModal()}
		`;
	}

	_renderViewProfileDetails() {
		return html`
		<capitec-card 
			data-automation-id="view-profile-details-screen"
			class="card">
				<capitec-title-bar 
					data-automation-id="view-profile-details-title"
					type="default">
						<capitec-icon
							size="medium"
							icon="system/profile-action">
						</capitec-icon>
						<capitec-label label="View Profile" type="Title"></capitec-label>
				</capitec-title-bar>
				${this._renderDetailsTab()}
				${this._renderFooter()}
		</capitec-card>`;
	}

	_renderDetailsTab() {
		return html`
			<capitec-tab-group class="tabs" @tab-select="${(e) => this._getSelectedTab(e)}">
				${this._renderClientDetails()}
			</capitec-tab-group>`;
	}

	_renderClientDetails() {
		return html`
			<capitec-tab
					data-automation-id="view-profile-client-details-tab"
					label="Client Details">
						<capitec-title-bar
							type="default"
							label="Preferences"
							class="other-options">
						</capitec-title-bar>
						<capitec-group
							layout="horizontal"
							gap="none"
							halign="left"
							valign="top"
							wrap>
								${this._renderFields(this.clientDetails)}
						</capitec-group>
			</capitec-tab>
		`;
	}

	_renderFields(fields) {
		return Object.entries(fields).map(item => {
			const [label, value] = item;

			return html`
				<horizon-label
					label="${label}"
					value="${value}"
					data-automation-id="view-profile-details-${label.split(` `).join(`-`)}">
				</horizon-label>`;
		});
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>
				<capitec-button 
					data-automation-id="view-profile-details-update-button"
					type="primary"
					label="Update"
					@click="${() => this._updateProfileDetails()}">
				</capitec-button>
			</capitec-button-bar>`;
	}

	_renderUpdateProfileDetailsModal() {
		return this.showUpdatePreferenceModal
		? html`
			<horizon-update-profile-details
				header="${this.selectedTab}"
				.clientDetails="${this.clientDetails}"
				@cancel="${() => this.showUpdatePreferenceModal = false}"
				@update-preference="${(e) => this._updateClientPreferences(e)}">
			</horizon-update-profile-details>`
		: html``;
	}

}

customElements.define(`horizon-view-profile-details`, ViewProfileDetails);