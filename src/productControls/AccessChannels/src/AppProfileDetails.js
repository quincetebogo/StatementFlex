import { ACCESS_CHANNEL_STATUS, parseHTMLtoDOM } from './Constants';
import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

/**
 * App profile Details component is used to show client's information and Suspend/Unsuspend app.
 * This component is envoked from Access Channels component
 * 
 * Events Raised 
 * -------------
 * close-side-sheet
 *  
 * @export
 * @class AppProfileDetails
 * @extends {Component}
 */

export class AppProfileDetails extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		this.showSideSheet = false;

		this.showSuspendReasons = false;
		this.selectedSuspendReason = ``;
		this.showValidationBanner = false;
		this.isVerifiedClient = false;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 * @callback suspendApp
	 * @returns {suspendAppCallback} - Success or failure response from suspend App channel service call
	 */

	/**
	 * @callback unsuspendApp
	 * @returns {unSuspendAppCallback} - Success or failure response from Unsuspend App channel service call

	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [appDetails] - App profile details
	 * @property {Boolean} [showSuspendReasons] - To toggle suspend reasons side sheet component
	 * @property {String} [selectedSuspendReason] - Holds value of the selected suspend reason
	 * @property {Boolean} [showValidationBanner] - To hide or show the suspend reason validation banner on error 
	 * 
	 * @property {suspendAppCallback} suspendApp Callback function to suspend App
	 * @property {unSuspendAppCallback} unsuspendApp Callback function to Unsuspend App
	 * 
	 */

	static get properties() {
		return {
			showSideSheet: { type: Boolean },
			appDetails: { type: Object },
			isVerifiedClient: { type: Boolean },
			verifiedNumber: { type: String },

			suspendApp: { type: Object, attribute: false },
			unsuspendApp: { type: Object, attribute: false },

			showSuspendReasons: { state: true },
			selectedSuspendReason: { state: true },
			showValidationBanner: { state: true }
		};
	}

	get successToast() {
		return `<capitec-label label="App was ${this.appDetails.status === `Active` ? `unsuspended` : `suspended`}"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${this._getFormattedDateTime(this.appDetails.dateLastUpdated)}" type="subtitle"></capitec-label>`;
	}

	get unSuccessToast() {
		return `<capitec-label label="App was not suspended"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
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

	_toggleAppSlidingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, { detail: { tileClicked: `app` } }));
	}

	_toggleSuspendReasonsSlide() {
		this.showValidationBanner = false;
		this.showSuspendReasons = !this.showSuspendReasons;
	
		this.dispatchEvent(new CustomEvent(`toggle-app-suspend-reasons`, { detail: { showSuspendReasons: this.showSuspendReasons } }));
		
		if (this.showSuspendReasons) {
			this.selectedSuspendReason = ``;
		}
	}

	async _onSuspendAppClick() {

		if (!this.selectedSuspendReason) {
			this.showValidationBanner = true;
			return;
		}

		const returnValue = await this.suspendApp(this.selectedSuspendReason, this.appDetails.userRegNo);
		this.showSuspendReasons = !this.showSuspendReasons;
	
		if (!returnValue) {
			this._displayAndCloseToast(`app-unsuccess-toast`, this.unSuccessToast);
			return false;
		}

		this.appDetails.status = `Suspended`;
		this._displayAndCloseToast(`app-success-toast`, this.successToast);

		this.showValidationBanner = false;
	}

	async _onUnsuspendAppClick() {
	
		const returnValue = await this.unsuspendApp();
		
		if (returnValue) {
			this.appDetails.status = `Active`;
			this._displayAndCloseToast(`app-success-toast`, this.successToast);
		}
	}

	_onReasonSelected(event) {
		if (event.detail.new) {
			this.selectedSuspendReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_displayAndCloseToast(elementId, toastDetail) {

		const elementToast = this.shadowRoot.getElementById(elementId);
		elementToast.style.display = `block`;
		elementToast.style.animation = `slideDown 0.6s`;

		const detailLabel = elementToast.shadowRoot.querySelector(`label.detail`);
		detailLabel.innerHTML = parseHTMLtoDOM(toastDetail);

		window.setTimeout(() => {
				elementToast.style.animation = `slideUp 0.6s`;
				
				window.setTimeout(() => elementToast.style.display = `none`, 600);
			}, 3000);
	}

	_closeToast(e) {
		const elementToast = this.shadowRoot.getElementById(e.target.id);
		elementToast.style.display = `none`;
	}

	_formatDate(dateToFormat) {
		if (!dateToFormat) {
			return `-`;
		}

		const stringToDate = new Date(dateToFormat);
		const tempdate = stringToDate.toGMTString().substr(5, 11);
		return tempdate;
	}

	_formatTime(timeToFormat) {
		const formatedDate = new Date(timeToFormat);
		const localTime = formatedDate.toLocaleTimeString();
		return localTime.replace(localTime.slice(-6, -2), ` `).toLowerCase();
	}

	_getFormattedDateTime(datetime) {
		return !datetime ? `-` : `${this._formatDate(datetime)}, ${this._formatTime(datetime)}`;
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
				.header-group-app{
					height: 64px;
    				padding: 0px 24px;
					border-bottom: 1px solid #E1E1E1;
				}
				.icon-app{
					--theme-icon-size-medium: 25px;
   					 margin-right: 20px;
				}
				.header-label{
					height: 20px;
					line-height: 20px;
					--theme-label-strong-font-size: 18px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}
				.icon-close{
					--theme-icon-size-medium: 24px;
					cursor: pointer;
				}
				.content-box{
					--theme-container-padding-left: 24px;
					--theme-container-padding-right: 24px;
					--theme-container-padding-top: 7px;
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
					--horizon-label-value-color: #72b004;
				}
				.content-box > horizon-label[value="Suspended"] {
					--horizon-label-value-color: #a5132a;
				}
				.content-box > capitec-button {
					width: 296px;
					margin-top: 24px;
					--theme-button-font-weight: 600;
				}
				horizon-alert-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 84px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}
				horizon-alert-banner > p {
					margin: 0px;
    				padding-right: 33px;
				}
				.validate-reasons {
					--theme-alert-banner-height: 64px;
				}
				capitec-toast {
					animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
					animation-fill-mode: forwards;

					--theme-toast-max-width: 315px;
					--theme-toast-height: 106px;
					--theme-icon-size-default: 24px;
					--theme-toast-success-color: #3A3A3A;
					--theme-toast-detail-line-height: 20px;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;

					padding: 12px 0px 0px 16px;
					position: absolute;
					z-index: 100;
					display: none;
				}
				@keyframes slideDown {
					0% {
						transform: translateY(-50%);
					};
					100% {
						transform: translateY(100%);
					}
				}
				@keyframes slideUp{
					0% {
						transform: translateY(0%);
					}
					100% {
						transform: translateY(-50%);
					}
				}

				/* Suspend App reasons styles */
				.suspend-reasons {
					--theme-side-sheet-top: 104px;
					--theme-modal-screen-background-color: transparent;
				}
				.header-group-suspend{
					height: 56px;
    				padding: 0px 24px;
					border-start-start-radius: 4px;
				;
					background-color: rgba(212, 120, 28, 0.15);
				}
				.header-suspend-error{
					background-color: #F7E2E1;
				}
				.icon-warning {
					--theme-icon-size-medium: 23px;
					margin-right: 8.25px;
				}
				.header-label[label="Suspend App"] {
					--theme-label-strong-font-size: 16px;
				}
				.header-label[label="Reasons to suspend"] {
					margin: 16px 0px 14px 0px;
					--theme-label-strong-font-size: 16px;
				}
				capitec-radio-group{
					--theme-buttonbar-item-gap: 14px;
				}
				.content-box > capitec-button[label="Cancel"] {
					margin-top: 16px;
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
				`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderAppPanel()}
			${this._renderSuspendAppReason()}
		`;
	}

	_renderAppPanel() {
		return html`
			<capitec-side-sheet
				data-automation-id="app-profile-details-main-side-sheet"
				.expanded="${this.showSideSheet}"
				alignment="right">
					<capitec-group
						class="header-group-app"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						<capitec-icon class="icon-app" size="medium" icon="system/cellphone"></capitec-icon>
						<capitec-label class="header-label" type="Strong" label="App"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-icon class="icon-close" size="medium" icon="system/close-action" @click="${() => this._toggleAppSlidingPanel()}"></capitec-icon>
					</capitec-group>

					${this._renderAppDetails()}
					
			</capitec-side-sheet>`;
	}

	_renderAppDetails() {

		if (isNullorEmpty(this.appDetails) || this.appDetails.status === ACCESS_CHANNEL_STATUS.UNAVAILABLE) {
			return this._renderServiceUnavailable();
		}

		if (this.appDetails.status === ACCESS_CHANNEL_STATUS.NOTREGISTERED) {
			return this._renderAppNotRegistered();
		}

		return html`
			${this._renderSuccessToast()}
			${this._renderUnsuccessToast()}
			${this._renderNotificationBanner()}
			
			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<horizon-label
					data-automation-id="app-profile-details-username"
					label="Username"
					value="${this.appDetails.username}">
				</horizon-label>

				<horizon-label
					data-automation-id="app-profile-details-date-registered"
					label="Date registered"
					value="${this._getFormattedDateTime(this.appDetails.dateRegistered)}"
					?hidden="${!this.isVerifiedClient}">
				</horizon-label>

				<horizon-label
					data-automation-id="app-profile-details-cellphone-number"
					label="Cellphone number (verified)"
					value="${this.verifiedNumber}"
					?hidden="${!this.isVerifiedClient}">
				</horizon-label>

				<horizon-label 
					data-automation-id="app-profile-details-last-interaction-date"
					label="Last interaction date"
					value="${this._formatDate(this.appDetails.dateLastUsed)}">
				</horizon-label>

				<horizon-label
					data-automation-id="app-profile-details-status"
					label="Status"
					value="${this.appDetails.status}">
				</horizon-label>

				<horizon-label 
					data-automation-id="app-profile-details-last-updated"
					label="Last updated"
					value="${this._getFormattedDateTime(this.appDetails.dateLastUpdated)}"
					?hidden="${!this.isVerifiedClient || isNullorEmpty(this.appDetails.dateLastUpdated)}">
				</horizon-label>

				<horizon-label
					data-automation-id="app-profile-details-suspending-reason"
					label="Reason for suspending"
					value="${this.selectedSuspendReason || this.appDetails.statusReason}"
					?hidden="${this.appDetails.status === `Active`}">
				</horizon-label>

				<capitec-button
					data-automation-id="app-profile-details-suspend-button"
					type="primary"
					?hidden=${this.appDetails.status !== `Active`}
					label="Suspend"
					@click="${() => this._toggleSuspendReasonsSlide()}">
				</capitec-button>
				<capitec-button
					data-automation-id="app-profile-details-unsuspend-button"
					type="primary" 
					label="Unsuspend"
					?hidden="${true}"
					@click="${() => this._onUnsuspendAppClick()}">
				</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderAppNotRegistered() {
		return html`
			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="center"
				valign="top"
				gap="none">
				<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
				<capitec-label class="header-label" type="Strong" label="Client not registered"></capitec-label>
				<p style="text-align: center">Download the App now to register. You will need a verified cellphone number to use the app. If you do not have a verified number you will need to visit a branch.</p>
			</capitec-content-box>
		`;
	}

	_renderServiceUnavailable() {
		return html`
			<horizon-alert-banner
				data-automation-id="app-profile-details-unavailable-banner"
				class="unavailable-alert-banner"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notify Client</b> <br>
				<p>Services are currently unavailable</p>
			</horizon-alert-banner>
			
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

	_renderSuspendAppReason() {
		return this.showSuspendReasons 
		? html`
			<capitec-side-sheet
				data-automation-id="app-profile-details-suspend-reasons-side-sheet"
				class="suspend-reasons"
				.expanded="${this.showSuspendReasons}"
				alignment="right">
					<capitec-group
						class="header-group-suspend ${this.showValidationBanner ? `header-suspend-error` : ``}"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
						<capitec-icon class="icon-warning" size="medium" icon="${this.showValidationBanner ? `status/error-trans` : `status/warning-trans`}"></capitec-icon>
						<capitec-label class="header-label" type="Strong" label="Suspend App"></capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-icon class="icon-close" size="medium" icon="system/close-action" @click="${() => this._toggleSuspendReasonsSlide()}"></capitec-icon>
					</capitec-group>

					${this._renderValidationBanner()}

					<capitec-content-box
						class="content-box"
						layout="vertical"
						halign="left"
						valign="top"
						gap="none">

						<capitec-label class="header-label" type="Strong" label="Reasons to suspend"></capitec-label>
						
						<capitec-radio-group label="Radio group label">
							<capitec-radio 
								data-automation-id="app-profile-details-reason-lost"
								label="Lost" 
								@value-changed="${(event) => this._onReasonSelected(event)}">
							</capitec-radio>
							<capitec-radio 
								data-automation-id="app-profile-details-reason-stolen"
								label="Stolen" 
								@value-changed="${(event) => this._onReasonSelected(event)}">
							</capitec-radio>
							<capitec-radio 
								data-automation-id="app-profile-details-reason-cancelled-remote-banking"
								label="Cancelled remote banking" 
								@value-changed="${(event) => this._onReasonSelected(event)}">
							</capitec-radio>
							<capitec-radio 
								data-automation-id="app-profile-details-reason-faulty"
								label="Faulty" 
								@value-changed="${(event) => this._onReasonSelected(event)}">
							</capitec-radio>
						</capitec-radio-group>

						<capitec-button 
							data-automation-id="app-profile-details-suspend-app-button"
							type="primary" 
							label="Suspend" 
							@click="${() => this._onSuspendAppClick()}">
						</capitec-button>
						<capitec-button 
							data-automation-id="app-profile-details-cancel-button"
							label="Cancel" 
							@click="${() => this._toggleSuspendReasonsSlide()}">
						</capitec-button>

					</capitec-content-box>
			</capitec-side-sheet>`
		: html``;
	}

	_renderNotificationBanner() {
		return this.appDetails.status === `Active` 
		? html``
		: html`
			<horizon-alert-banner 
				data-automation-id="app-profile-details-suspended-banner"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>App suspended</b> <br>
				<p>You will not be able to access your app any longer.</p>
			</horizon-alert-banner>
		`;
	}

	_renderValidationBanner() {
		return this.appDetails.status === `Active` && this.showValidationBanner 
		? html`
			<horizon-alert-banner 
				data-automation-id="app-profile-details-validation-banner"
				class="validate-reasons"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notice</b> <br>
				<p>Please choose a reason to suspend</p>
			</horizon-alert-banner>`
		: html``;
	}

	_renderSuccessToast() {

		/* TO DO: "Header" and "Detail" properties can be removed when update platform to the latest version 
		as content inside slot will be effective.*/

		return html`
			<capitec-toast 
				data-automation-id="app-profile-details-success-toast"
				id="app-success-toast"
				type="success" 
				header="Successful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
					<capitec-label label="Successful!" type="strong"></capitec-label>
					<capitec-label label="App was ${this.appDetails.status === `Active` ? `unsuspended` : `suspended`}"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="${this._getFormattedDateTime(this.appDetails.dateLastUpdated)}" type="strong"></capitec-label>
			</capitec-toast>`;
	}

	_renderUnsuccessToast() {

		/* TO DO: "Header" and "Detail" properties can be removed when update platform to the latest version 
		as content inside slot will be effective.*/

		return html`
			<capitec-toast 
				data-automation-id="app-profile-details-unsuccess-toast"
				id="app-unsuccess-toast"
				type="error" 
				header="Unsuccessful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
					<capitec-label label="Unsuccessful!" type="strong"></capitec-label>
					<capitec-label label="App was not suspended"></capitec-label>
			</capitec-toast>`;
	}
}

customElements.define(`capitec-pc-app-profile-details`, AppProfileDetails);