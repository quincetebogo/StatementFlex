import { Component, css, html } from 'platform/elements';
import { PREFERRED_MSG_TIME } from 'app/productControls/AccessChannels/src/Constants';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

/**
 * Notifications Details component is used to show client's notifications details
 * This component is envoked from Access Channels component
 * 
 * Events Raised 
 * -------------
 * close-side-sheet
 *  
 * @export
 * @class NotificationsDetails
 * @extends {Component}
 */

export class NotificationsDetails extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		this.showSideSheet = false;
		this.showUpdateMessageTypePanel = false;
		this.showUpdateMessageTimePanel = false;
		this.isTypeValueChanged = false;
		this.isTimeValueChanged = false;
		this.showHelperText = false;
		this.inAppMessage = false;
		this.displaySuccessToast = false;
		this.messageTypeSelected = ``;
		this.messageTimeSelected = ``;
		this.notificationsDetails = {};
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @callback updateMessageType
	 * @returns {updateMessageTypeCallback} - Success or failure response from updating notifications message type.
	 */

	/**
	 * @callback updateMessageTime
	 * @returns {updateMessageTimeCallback} - Success or failure response from updating notifications message time.
	*/

	/**
	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [notificationsDetails] - notifications details
	 * 
	 * @property {updateMessageTypeCallback} updateMessageType Callback function to update notifications message type
	 * @property {updateMessageTimeCallback} updateMessageTime Callback function to update notifications message time
	 */
	  static get properties() {
		return {
			showSideSheet: { type: Boolean },
			showUpdateMessageTypePanel: { type: Boolean },
			showUpdateMessageTimePanel: { type: Boolean },
			isTypeValueChanged: { type: Boolean },
			isTimeValueChanged: { type: Boolean },
			showHelperText: { type: Boolean },
			inAppMessage: { type: Boolean },
			displaySuccessToast: { type: Boolean },
			notificationsDetails: { type: Object },
			messageTypeSelected: { type: String },
			messageTimeSelected: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeNotificationsPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, { detail: { tileClicked: `notification` } }));
	}

	_onCloseUpdatePanelClick() {
		this.showUpdateMessageTypePanel = false;
		this.showUpdateMessageTimePanel = false;
	}

	onOpenMessageTypePanelClick() {
		this.showUpdateMessageTypePanel = true;
		this.dispatchEvent(new CustomEvent(`toggle-notifications-settings-update`, { detail: { updateType: `Message Type` } }));
	}

	onOpenMessageTimePanelClick() {
		this.showUpdateMessageTimePanel = true;
		this.dispatchEvent(new CustomEvent(`toggle-notifications-settings-update`, { detail: { updateType: `Message Time` } }));
	}

	_onTypeValueChanged(event) {
		if (event.detail.new) {
			this.notificationsDetails.notificationType = this.messageTypeSelected = event.currentTarget.label;
			this.isTypeValueChanged = true;

			if (this.notificationsDetails.notificationType === `In-app message`) {
				this.inAppMessage = true;
			} else {
				this.inAppMessage = false;
			}
		}
	}

	_onTimeValueChanged(event) {
		if (event.detail.new) {
			this.notificationsDetails.notificationTime = this.messageTimeSelected = event.currentTarget.label;
			this.isTimeValueChanged = true;
			this.showHelperText = true;
		}
	}

	async onUpdateMessageTypeClick() {
		this.showUpdateMessageTypePanel = false;
		this.isTypeValueChanged = false;

		const updateMessageTypeResult = await this.updateMessageType(this.messageTypeSelected);
		if (updateMessageTypeResult) {
			const toastDetail = `Preferred message type updated.`;
			this._displayNotificationsUpdateSuccessToast(toastDetail);
		}
	}

	async onUpdateMessageTimeClick() {
		this.showUpdateMessageTimePanel = false;
		this.isTimeValueChanged = false;

		const updateMessageTimeResult = await this.updateMessageTime(this.messageTimeSelected);
		if (updateMessageTimeResult) {
			const toastDetail = `Message time updated to ${this.messageTimeSelected}`;
			this._displayNotificationsUpdateSuccessToast(toastDetail);
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_displayNotificationsUpdateSuccessToast(toastDetail) {
		this.displaySuccessToast = true;
		this.successToastDetail = toastDetail;
		window.setTimeout(() => this.displaySuccessToast = false, 3000);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				/* Notifications Side Sheet */
				capitec-side-sheet {
					--theme-side-sheet-width: 344px;
					--theme-side-sheet-height: 890px;
					--theme-side-sheet-top: 96px;
				}
				.side-panel-sheet-header {
					height: 64px;
					width: 344px;
					padding: 0px 24px;
					border-bottom: 1px solid #E1E1E1;
				}
				.side-panel-header-icon {
					--theme-icon-size-medium: 25px;
					margin-right: 20px;
				}
				.side-panel-header-label {
					height: 20px;
					line-height: 20px;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.side-panel-header-close-icon {
					--theme-icon-size-small: 13.5px;
					cursor: pointer;
				}

				/* Content box */
				.content-box {
					--theme-container-padding-left: 24px;
					--theme-container-padding-right: 24px;
					--theme-container-padding-top: 7px;
					height: auto;
				}
				.content-box > capitec-button {
					width: 296px;
					margin-top: 24px;
					--theme-button-font-weight: 600;
				}
				.content-box-main-panel {
					--theme-container-padding-right: 0px;
				}

				capitec-group {
					width: 100%;
					padding: 2px 0px;
				}
				capitec-group > capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 16px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					width: 100%;
					box-shadow: none!important;
				}
				capitec-radio-group {
					width: 100%;
					height: auto;

					--theme-layout-gap-spacing: 20px;
				}
				capitec-radio-group > capitec-group > capitec-radio {
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
				}
				capitec-radio-group {
					--theme-buttonbar-item-gap: 20px;
				}
				
				capitec-radio-group > capitec-radio {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
				}
				.message-group {
					display: flex;
					justify-content: space-between;
				}
				.side-panel-header {
					height: 56px;
					width: 342px;
    				padding: 0px 24px;
					border-radius: 4px 0 0 0;
					background-color: #F5F5F5;
				}

				capitec-alert-banner {
					margin: 8px 8px 0px 8px;

					--theme-alert-banner-width: 328px;
					--theme-layout-gap-spacing: 16px;
									   
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}
				capitec-alert-banner > capitec-hyperlink {
					margin-top: 5px;
					position: absolute;
					right: 16px;
					bottom: 17px;

					--theme-font-weight: 600;
					--theme-hyperlink-color: #3A3A3A;
					--theme-hyperlink-font-size: 14px;
					text-decoration: underline;
				}
				capitec-alert-banner > p {
					margin: 0px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 20px;
				}
				.client-notify-banner {
					--theme-alert-banner-height: 90px;
				}

				.client-notify-message-type-banner {
					--theme-alert-banner-height: 90px;
				}

				.client-notify-message-type-banner > p {
					height: auto;
					width: 204px
				}

				capitec-toast {
					--theme-toast-max-width: 315px;
					--theme-toast-height: 106px;
					--theme-icon-size-default: 24px;
					--theme-toast-success-color: #3A3A3A;
					--theme-toast-detail-line-height: 20px;
					padding: 12px 0px 0px 16px;
					position: absolute;
					z-index: 100;
				}
				.message-update-toast-success {
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}

				capitec-menu-separator {
					width: 305px;
					color: #E1E1E1;
					padding: 5px 0px 5px 0px;
				}
				capitec-title-bar {
					--theme-titlebar-min-height: 32px;
					--theme-titlebar-padding: 0px 0px 0px 22px;
					--theme-type-default-background: rgb(244, 244, 244);
					--theme-label-title-font-size: 14px;
					--theme-label-title-font-weight: 600;
					width: 100%;
					box-shadow: none!important;
				}

				horizon-label {
					--horizon-label-text-height: 16px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-font-size: 14px;
					--horizon-label-text-line-height: 16px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-margin-top: 4px;
				}

				.security-label {
					--theme-layout-gap-spacing: 4px;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 500;
					--theme-label-font-color: #3A3A3A;

					height: 24px;
					width: auto;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					line-height: 24px;
				}

				capitec-check {
					margin: 0px;
					border-bottom: none;

					--theme-check-width: 20px;
					--theme-check-height: 20px;
				}

				capitec-button {
					height: 48px;
					border-radius: 5px;
					--theme-button-height: 20px;
					--theme-button-width: 41px;
					--theme-button-color: #FFFFFF;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-letter-spacing: 2px;
					--theme-button-line-height: 20px;
					--theme-button-text-align: center;
					--theme-button-padding-top: 10px;
					--theme-button-padding-right: 22px;
					--theme-button-padding-bottom: 10px;
					--theme-button-padding-left: 22px;
				}

				capitec-label[type="subtitle"] {
					line-height: 16px;
	
					--theme-label-subtitle-font-size: 12px;
					--theme-layout-gap-spacing: 16px;
					--theme-label-subtitle-font-weight: normal;
					--theme-label-font-color: #6aa334;
				}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderNotificationsPanel()}
			${this._renderUpdateMessageTypePanel()}
			${this._renderUpdateMessageTimePanel()}
		`;
	}

	_renderNotificationsPanel() {
		return html`
			<capitec-side-sheet
				data-automation-id="notifications-details-main-side-sheet"
				.expanded=${this.showSideSheet}
				alignment="right"
			>
				<capitec-group
					class="side-panel-sheet-header"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-icon" size="medium" icon="system/notify"></capitec-icon>
					<capitec-label class="side-panel-header-label" type="Strong" label="Notifications"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-header-close-icon" size="small" icon="system/close-action" @click="${() => this._closeNotificationsPanel()}"></capitec-icon>
				</capitec-group>

				${this._renderNotificationsDetails()}
				
			</capitec-side-sheet>
		`;
	}

	_renderNotificationsDetails() {
		return isNullorEmpty(this.notificationsDetails) 
		? html`
			${this._renderServiceUnavailable()}
		` 
		: html`
			${this._renderNotificationsUpdateSuccessToast()}
			${this._renderClientNotification()}
			<capitec-content-box
				class="content-box content-box-main-panel"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<capitec-group
					class="message-group"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<horizon-label
						data-automation-id=""
						label="Preferred message type"
						value="${this.notificationsDetails.notificationType}"
					></horizon-label>
					<!--disabled untill service call is implemented
						icon="system/more-action" 
						@click="${() => this.onOpenMessageTypePanelClick()}"
						-->
					<capitec-button 
						type="clear" 
						icon="system/more" 
						icon-size="small"
					></capitec-button>
				</capitec-group>
				<capitec-menu-separator></capitec-menu-separator>
				<capitec-group
					class="message-group"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<horizon-label
						data-automation-id=""
						label="Preferred message time"
						value="${PREFERRED_MSG_TIME[this.notificationsDetails.notificationTime]}"
					></horizon-label>
					<!--disabled untill service call is implemented
						icon="system/more-action" 
						@click="${() => this.onOpenMessageTimePanelClick()}"-->
					<capitec-button 
						type="clear" 
						icon="system/more" 
						icon-size="small"
					></capitec-button>

				</capitec-group>
				${this._renderHelperText()}
			</capitec-content-box>
			<capitec-title-bar type="default" label="Transactions"></capitec-title-bar>
			<capitec-content-box
				class="content-box content-box-main-panel"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<capitec-group
					class="message-group"
					layout="vertical"
					halign="left"
					valign="center"
					gap="none">
					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						
						<horizon-label
							data-automation-id=""
							label="Money out"
							value="${formatCurrency(this.notificationsDetails.moneyOutAmount)}"
						></horizon-label>
						<capitec-spacer></capitec-spacer>
						<!--Disabled until service call is added
						?disabled = ${this.notificationsDetails.moneyOutEnabled}-->
						<capitec-check
						?disabled = ${true}
						checked></capitec-check>
					</capitec-group>
					<capitec-menu-separator></capitec-menu-separator>
					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						<horizon-label
							data-automation-id=""
							label="Money in"
							value="${formatCurrency(this.notificationsDetails.moneyInAmount)}"
						></horizon-label>
						<capitec-spacer></capitec-spacer>
						<!--Disabled until service call is added
						?disabled = ${this.notificationsDetails.moneyInEnabled}-->
						<capitec-check
						?disabled = ${true}
						checked></capitec-check>
					</capitec-group>
					
				</capitec-group>
			</capitec-content-box>
			<capitec-title-bar type="default" label="Security"></capitec-title-bar>
			<capitec-content-box
				class="content-box content-box-main-panel"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<capitec-group
					class="message-group"
					layout="vertical"
					halign="left"
					valign="center"
					gap="none">
					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						<capitec-label
							data-automation-id=""
							class="security-label"
							type="strong"
							row="1" column="1" colspan="2"
							label="SMS security">
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<!--Disabled until service call is added
							?disabled = ${!this.notificationsDetails.smsSecurity}-->
						<capitec-check 
						?disabled = ${true}
						checked></capitec-check>
					</capitec-group>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderUpdateMessageTypePanel() {
		return this.showUpdateMessageTypePanel ? html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showUpdateMessageTypePanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none"><capitec-label class="side-panel-header-label" type="Strong" label="Choose preferred message type"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onCloseUpdatePanelClick()}"></capitec-icon>
				</capitec-group>

				${this._renderClientNotification()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					<capitec-radio-group>
						<capitec-radio 
							label="SMS Update"
							?checked="${this.notificationsDetails.notificationType === `SMS Update`}"
							@value-change="${(e) => this._onTypeValueChanged(e)}"
						></capitec-radio>
						<capitec-group 
							class="radio-button-container message-group" 
							layout="horizontal" 
							gap="clear" 
							halign="left" 
							valign="center">
							<capitec-radio
								label="In-app message"
								?checked="${this.notificationsDetails.notificationType === `In-app message`}"
								@value-change="${(e) => this._onTypeValueChanged(e)}">
							</capitec-radio>
							<capitec-tag label="FREE" color="#F5F5F5" label-color="#3A3A3A" type="custom"></capitec-tag>
						</capitec-group>
					</capitec-radio-group>

					<capitec-button
						type="primary"
						label="Update"
						?hidden=${!this.isTypeValueChanged}
						@click="${() => this.onUpdateMessageTypeClick()}"
					></capitec-button>
				</capitec-content-box>

			</capitec-side-sheet>
		` : html``;
	}

	_renderUpdateMessageTimePanel() {
		return this.showUpdateMessageTimePanel ? html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showUpdateMessageTimePanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-label class="side-panel-header-label" type="Strong" label="Choose message time"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onCloseUpdatePanelClick()}"></capitec-icon>
				</capitec-group>

				${this._renderMessageTimeUpdateClientNotification()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					<capitec-radio-group>
						<capitec-group 
							class="radio-button-container message-group" 
							layout="horizontal" 
							gap="clear" 
							halign="left" 
							valign="center">
							<capitec-radio
								label="Anytime"
								?checked="${this.notificationsDetails.notificationTime === `Anytime`}"
								@value-change="${(e) => this._onTimeValueChanged(e)}">
							</capitec-radio>
							<capitec-tag label="Best option" color="#F5F5F5" label-color="#3A3A3A" type="custom"></capitec-tag>
						</capitec-group>
						<capitec-group 
							class="radio-button-container message-group" 
							layout="vertical" 
							gap="clear" 
							halign="left" 
							valign="center">
							<capitec-radio 
								label="5am - 10pm"
								?checked="${this.notificationsDetails.notificationTime === `5am - 10pm`}"
								@value-change="${(e) => this._onTimeValueChanged(e)}">
							</capitec-radio>
							<capitec-radio 
								label="7am - 6pm"
								?checked="${this.notificationsDetails.notificationTime === `7am - 6pm`}"
								@value-change="${(e) => this._onTimeValueChanged(e)}">
							</capitec-radio>
						</capitec-group>
					</capitec-radio-group>

					<capitec-button
						type="primary"
						label="Update"
						?hidden=${!this.isTimeValueChanged}
						@click="${() => this.onUpdateMessageTimeClick()}"
					></capitec-button>
				</capitec-content-box>

			</capitec-side-sheet>
		` : html``;
	}

	_renderHelperText() {
		return this.showHelperText ? html`
			<capitec-label
				class="helper-text"
				label="You will only receive notifications between ${this.messageTimeSelected}"
				type="subtitle">
			</capitec-label>
		`
		: html``;
	}

	_renderNotificationsUpdateSuccessToast() {
		return this.displaySuccessToast ? html`
			<capitec-toast
				class="message-update-toast-success"
				type="success"
				header="Successful!"
				detail="${this.successToastDetail}"
				?hidden="${!this.displaySuccessToast}"
				@click="${() => this.displaySuccessToast = false}"
				?closable=${false}
			></capitec-toast>
		` : html``;
	}

	_renderClientNotification() {
		return this.inAppMessage ? html`` : html`
			<capitec-alert-banner
				type="warning"
				class="client-notify-message-type-banner"
				label=""
				layout="vertical">
				<p><b>Notify client:</b><br>You will be charged a fee per SMS update.</p>
				
				<capitec-hyperlink
					href="https://www.capitecbank.co.za/global-one/transact/fees/"
					target="_blank"
					label="View fees"
					inline
				></capitec-hyperlink>
			</capitec-alert-banner>
		`;
	}

	_renderMessageTimeUpdateClientNotification() {
		return this.isTimeValueChanged ? html`
			<capitec-alert-banner
				type="warning"
				class="client-notify-banner"
				label=""
				layout="vertical">
				<p><b>Notify client:</b><br>You will only receive notifications between ${this.messageTimeSelected}</p>
			</capitec-alert-banner>
		` : html``;
	}

	_renderServiceUnavailable() {
		return html`
			<capitec-alert-banner
				data-automation-id="notifications-details-unavailable-banner"
				class="unavailable-alert-banner"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notify Client</b> <br>
				<p>Services are currently unavailable</p>
			</capitec-alert-banner>
			
			<capitec-group class="service-unavilable-group" layout="vertical" halign="center" valign="center" gap="none">
				
				<capitec-image src="platform/illustrations/no-connection.svg"></capitec-image>

				<capitec-label 
						class="unavailable-header"
						label="Services are unavailable">
				</capitec-label>

				<capitec-label 
						label="We are experiencing technical difficulties.">
				</capitec-label>

				<capitec-label 
					label="We are sorry for the inconvenience and aim to have it resolved soon.">
				</capitec-label>

				<capitec-label 
						class="unavilable-find-branch"
						label="For any urgent matters visit a branch.">
				</capitec-label>
			</capitec-group>
		`;
	}
}

window.customElements.define(`capitec-pc-notifications-details`, NotificationsDetails);