import { Component, css, html } from 'platform/elements';
import { AccessChannelsEvents } from 'app/constants/telemetry/events/AccessChannels';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
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
		this.displayToast = false;

		this._telemetry = HorizonTelemetry.instance;
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
			displayToast: { type: Boolean },
			notificationsDetails: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();

		this._telemetry.startSpan(AccessChannelsEvents.ACCESS_CHANNELS_NOTIFICATIONS, {
			"screen": TelemetryScreen.ACCESS_CHANNELS,
			"next-screen": TelemetryScreen.ACCESS_CHANNELS_NOTIFICATIONS
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeNotificationsPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, {}));
	}

	_onCloseUpdatePanelClick() {
		this.showUpdateMessageTypePanel = false;
		this.showUpdateMessageTimePanel = false;
	}

	onOpenMessageTypePanelClick() {
		this.showUpdateMessageTypePanel = true;
	}

	onOpenMessageTimePanelClick() {
		this.showUpdateMessageTimePanel = true;
	}

	_onTypeValueChanged(event) {
		this.isTypeValueChanged = true;
	}

	_onTimeValueChanged(event) {
		this.isTimeValueChanged = true;
	}

	onUpdateMessageTypeClick() {
		this.showUpdateMessageTypePanel = false;
		this._displayNotificationsUpdateSuccessToast();
	}

	onUpdateMessageTimeClick() {
		this.showUpdateMessageTimePanel = false;
		this._displayNotificationsUpdateSuccessToast();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_displayNotificationsUpdateSuccessToast() {
		this.displayToast = true;
		window.setTimeout(() => this.displayToast = false, 3000);
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
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
				.content-box{
					--theme-container-padding-left: 24px;
					--theme-container-padding-right: 24px;
					--theme-container-padding-top: 7px;
					height: auto;
				}

				.content-box > horizon-label {
					padding: 8px 0px 8px 0px;
					--horizon-label-value-font-size: 16px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-line-height: 20px;
					--horizon-label-value-height: 20px;
					--horizon-label-value-line-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-text-color: #3A3A3A;
				}
				
				.content-box > horizon-label[value="Active"] {
					--horizon-label-value-color: #72B004;
				}
				
				.content-box > horizon-label[value="Suspended"] {
					--horizon-label-value-color: #A5132A;
				}

				.content-box > capitec-button {
					width: 296px;
					margin-top: 24px;
					--theme-button-font-weight: 600;
				}

				/* Multiple Devices - Suspend security token */
				.side-panel-header-reset-token {
					height: 56px;
					width: 342px;
    				padding: 0px 24px;
					border-radius: 4px 0 0 0;
					background-color: #F5F5F5;
				}

				.side-panel-header-suspend {
					height: 56px;
    				padding: 0px 24px;
					border-start-start-radius: 4px;
					background-color: rgba(212, 120, 28, 0.15);
					border-bottom: 1px solid #E1E1E1;
				}
				
				.side-panel-header-suspend-error {
					background-color: #F7E2E1;
				}

				.side-panel-header-suspend-icon {
					--theme-icon-size-medium: 25px;
					margin-right: 8px;
				}

				.side-panel-stepper {
					height: 56px;
					width: 344px;
					border-bottom: 1px solid #E1E1E1;
				
					padding: 0px 24px;
				
					display: inline-flex;
					flex-direction: row;
					background-color: transparent;

					justify-content: left;
				}

				.side-panel-stepper-group > capitec-label {
					font-family: "Hind Vadodara";
					letter-spacing: 0;
					--theme-layout-gap-spacing: 0px;
					--theme-label-font-color: #3A3A3A;
				}

				.step-count-label {
					height: 12px;
					width: 65px;
					line-height: 12px;
					--theme-label-strong-font-size: 12px;
				}

				.step-label {
					height: 20px;
					width: 262px;
					line-height: 20px;
					padding-top: 5px;
					--theme-label-strong-font-size: 15px;
					--theme-label-strong-font-weight: 600;
				}
				
				.side-panel-stepper > capitec-group {
					padding: 11px 0px 11px 11px;
					height: 34px;
				}

				capitec-badge {
					--theme-badge-number-color: #009DE0;
					--theme-badge-line-height: 20px;
					--theme-badge-font-weight: 600;
					box-sizing: border-box;
					border-radius: 50%;
					background-color: transparent;
					/*margin: 16.25px 0px;*/
					margin: 16.25px 0px 0px 0px;
				}
				
				.side-panel-stepper > p {
					width: 262px;
				}
				
				.step-todo {
					border: 2px solid #009DE0;
				}
				
				.step-success {
					border: 2px solid #70AF00;
				}
				
				.label-strong {
					font-size: 15px;
					font-weight: 600;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
				}

				capitec-check-group {
					width: 100%;
					height: 168px;
				}
				
				capitec-check-group > capitec-check {
					height: 24px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin: 8px 0px;
				}

				/* Multiple Devices - Suspend Reasons */

				capitec-alert-banner {
					margin: 8px 8px 0px 8px;
									   
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}

				capitec-alert-banner > capitec-hyperlink {
					--theme-hyperlink-font-size: 14px;
				
				}
				
				capitec-alert-banner > p {
					margin: 0px;
					padding-right: 33px;
					height: 40px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 20px;
				}

				.client-notify-banner {
					--theme-alert-banner-height: 105px;
					--theme-alert-banner-width: 328px;
				}
				
				.reason-to-suspend-label {
					margin: 8px 0px 14px 0px;
					--theme-label-strong-font-size: 16px;
					height: 24px;
					width: 216px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				capitec-radio-group {
					--theme-buttonbar-item-gap: 14px;
				}
				
				capitec-radio-group > capitec-radio {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
				}

				capitec-toast {
					--theme-toast-max-width: 315px;
					--theme-toast-height: 106px;
					--theme-icon-size-default: 24px;
					--theme-toast-success-color: #3a3a3a;
					--theme-toast-detail-line-height: 20px;
					padding: 12px 0px 0px 16px;
					position: absolute;
					z-index: 100;
				}

				.token-reset-toast-success {
					--theme-toast-height: 146px;
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}
				
				.token-suspend-toast-success {
					--theme-toast-height: 186px;
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}

				.token-suspend-banner {
					--theme-alert-banner-height: 144px;
				}

				/* Service unavailable stylings */
				.service-unavilable-group{
					text-align: center;
					align-items: center;
					padding: 14px 36px;
				}
				.unavailable-header{
					margin: 16px 0px 5px 0px;
					--theme-label-default-font-size: 18px;
					--theme-label-default-font-weight: 600;
				}
				.unavilable-find-branch{
					margin: 19px 0px;
					--theme-label-default-font-size: 15px;
					--theme-label-default-font-weight: 600;
				}
				.unavailable-alert-banner{
					--theme-alert-banner-height: 64px;
				}

				/* Notifications Side Sheet */
				capitec-group {
					width: 100%;
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
					height: 168px;
				}
				.message-group {
					display: flex;
					justify-content: space-between;
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
				class="content-box"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none"
			>
				<capitec-group
					class="message-group"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<horizon-label
						data-automation-id=""
						label="Preferred message type"
						value="${this.notificationsDetails.messageType}"
					></horizon-label>
					
					<capitec-button 
						type="clear" 
						icon="system/more-action" 
						icon-size="small"
						@click="${() => this.onOpenMessageTypePanelClick()}"
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
						label="Choose message time"
						value="${this.notificationsDetails.messageTime}"
					></horizon-label>
					
					<capitec-button 
						type="clear" 
						icon="system/more-action" 
						icon-size="small"
						@click="${() => this.onOpenMessageTimePanelClick()}"
					></capitec-button>
				</capitec-group>
				<capitec-group
					class="message-group"
					layout="vertical"
					halign="left"
					valign="center"
					gap="none">
					<capitec-title-bar type="default" label="Transactions"></capitec-title-bar>

					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						
						<horizon-label
							data-automation-id=""
							label="Money out"
							value="R100"
						></horizon-label>
						<capitec-spacer></capitec-spacer>
						<capitec-check disabled checked></capitec-check>
					</capitec-group>
					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						
						<horizon-label
							data-automation-id=""
							label="Money in"
							value="R100"
						></horizon-label>
						<capitec-spacer></capitec-spacer>
						<capitec-check disabled checked></capitec-check>
					</capitec-group>
					
				</capitec-group>
				<capitec-group
					class="message-group"
					layout="vertical"
					halign="left"
					valign="center"
					gap="none">
					<capitec-title-bar type="default" label="Security"></capitec-title-bar>
					
					<capitec-group
						class="message-group"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						<horizon-label
							data-automation-id=""
							value="SMS Security"
						></horizon-label>
						<capitec-spacer></capitec-spacer>
						<capitec-check disabled checked></capitec-check>
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
					class="side-panel-header-suspend"
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
							label="SMS Update" checked
							@value-change="${(e) => this._onTypeValueChanged(e)}"
						></capitec-radio>
						<capitec-group class="radio-button-container" layout="horizontal" gap="clear" halign="left" valign="center">
							<capitec-radio
										id=""
										class="radio-button-label"
										label="In-app message"
										@value-change="${(e) => this._onTypeValueChanged(e)}">
							</capitec-radio>
							<capitec-tag label="Free" color="#F5F5F5" label-color="#3A3A3A" type="custom"></capitec-tag>
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
					class="side-panel-header-suspend"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none"><capitec-label class="side-panel-header-label" type="Strong" label="Choose message time"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onCloseUpdatePanelClick()}"></capitec-icon>
				</capitec-group>

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					<capitec-radio-group>
						<capitec-group class="radio-button-container" layout="horizontal" gap="clear" halign="left" valign="center">
							<capitec-radio
										id=""
										class="radio-button-label"
										label="Anytime"
										@value-change="${(e) => this._onTimeValueChanged(e)}">
							</capitec-radio>
							<capitec-tag label="Best option" color="#F5F5F5" label-color="#3A3A3A" type="custom"></capitec-tag>
						</capitec-group>
						
						<capitec-radio 
							label="5am - 10pm"
							@value-change="${(e) => this._onTimeValueChanged(e)}">
						</capitec-radio>
						<capitec-radio 
							label="7am - 6pm"
							@value-change="${(e) => this._onTimeValueChanged(e)}">
						</capitec-radio>
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

	_renderNotificationsUpdateSuccessToast() {
		return this.displayToast ? html`
			<capitec-toast
				class="token-reset-toast-success"
				type="success"
				header="Successful!"
				detail="Preferred message type updated."
				?hidden="${!this.displayToast}"
				@click="${() => this.displayToast = false}"
				?closable=${false}
			></capitec-toast>
		` : html``;
	}

	_renderClientNotification() {
		return this.showNoReasonSelectedNotification ? html`` : html`
			<capitec-alert-banner
				type="warning"
				class="client-notify-banner"
				label=""
				layout="vertical">
				<p><b>Notify client:</b><br>You will be charged a fee per SMS update.</p>
				<br>
				<capitec-hyperlink
					href="https://www.capitecbank.co.za/global-one/transact/fees/"
					target="_blank"
					label="View fees"
					inline
				></capitec-hyperlink>
			</capitec-alert-banner>
		`;
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