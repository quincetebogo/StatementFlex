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

		this.showSuspendReasons = false;
		this.selectedSuspendReason = ``;
		this.displayToast = false;
		this.showValidationBanner = false;
	}

	// --------------
	// PROPERTIES
	// --------------
	
	/**
	 * @callback suspendApp
	 * @returns {suspendAppCallback} - Success or failure response from suspend App channel service call
	 */

	/**
	 * @callback unSuspendApp
	 * @returns {unSuspendAppCallback} - Success or failure response from Unsuspend App channel service call

	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [appDetails] - App profile details
	 * @property {Boolean} [showSuspendReasons] - To toggle suspend reasons side sheet component
	 * @property {String} [selectedSuspendReason] - Holds value of the selected suspend reason
	 * @property {Boolean} [displayToast] - To hide or show the successful Toast
	 * @property {Boolean} [showValidationBanner] - To hide or show the suspend reason validation banner on error 
	 * 
	 * @property {suspendAppCallback} suspendApp Callback function to suspend App
	 * @property {unSuspendAppCallback} unSuspendApp Callback function to Unsuspend App
	 * 
	 */

	static get properties() {
		return {
			showSideSheet: { type: Boolean },
			appDetails: { type: Object },

			suspendApp: { type: Object, attribute: false },
			unSuspendApp: { type: Object, attribute: false },

			showSuspendReasons: { state: true },
			selectedSuspendReason: { state: true },
			displayToast: { type: Boolean },
			showValidationBanner: { state: true }
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

	_toggleAppSlidingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, { detail: { tileClicked: `App` } }));
	}

	_toggleSuspendReasonsSlide() {
		this.showValidationBanner = false;
		this.showSuspendReasons = !this.showSuspendReasons;
	
		if (this.showSuspendReasons) {
			this.selectedSuspendReason = ``;
		}
	}

	async _onSuspendAppClick() {

		if (!this.selectedSuspendReason) {
			this.showValidationBanner = true;
		}

		const returnValue = await this.suspendApp();
	
		if (returnValue) {
			this.appDetails.status = `Suspended`;
			this._displayAndCloseToast();
			this._toggleSuspendReasonsSlide();
		}
	}

	async _onUnsuspendAppClick() {
	
		const returnValue = await this.unSuspendApp();
		
		if (returnValue) {
			this.appDetails.status = `Active`;
			this._displayAndCloseToast();
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

	_displayAndCloseToast() {
		this.displayToast = true;

		const elementToast = this.shadowRoot.getElementById(`app-success-toast`);
		elementToast.style.animation = `slideDown 0.6s`; 

		window.setTimeout(() => {
				elementToast.style.animation = `slideUp 0.6s`;
				window.setTimeout(() => this.displayToast = false, 600);
			}, 3000);
	}

	_formatDate(dateToFormat) {
		const stringToDate = new Date(dateToFormat);
		const tempdate = stringToDate.toGMTString().substr(5, 11);
		return tempdate;
	}

	_formatTime(timeToFormat) {
		const formatedDate = new Date(timeToFormat);
		const localTime = formatedDate.toLocaleTimeString();
		return localTime.replace(localTime.slice(-6, -2), ``);
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
					--theme-icon-size-small: 13.5px;
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
				capitec-alert-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 84px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}
				capitec-alert-banner > p {
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
					padding: 12px 0px 0px 16px;
					position: absolute;
					z-index: 100;
				}
				@keyframes slideDown {
					0% {
						transform: translateY(-50%);
					},
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
				.unavilable-alert-banner{
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
						<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleAppSlidingPanel()}"></capitec-icon>
					</capitec-group>

					${this._renderAppDetails()}
					
			</capitec-side-sheet>`;
	}

	_renderAppDetails() {
		return isNullorEmpty(this.appDetails) 
		? html`
			${this._renderServiceUnavailable()}`
		: html`
			${this._renderSuccessToast()}
			${this._renderNotificationBanner()}
			
			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<horizon-label
					data-automation-id=""
					label="Username"
					value="${this.appDetails.userName}">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Date registered"
					value="${this._formatDate(this.appDetails.dateRegistered)}, ${this._formatTime(this.appDetails.dateRegistered)}">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Cellphone number (verified)"
					value="${this.appDetails.userRegNo}">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Last interaction date"
					value="${this._formatDate(this.appDetails.dateLastUsed)}">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Status"
					value="${this.appDetails.status}">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Last updated"
					value="${this._formatDate(this.appDetails.dateLastUpdated)}, ${this._formatTime(this.appDetails.dateLastUpdated)}"
					style="display:${isNullorEmpty(this.appDetails.dateLastUpdated) ? `none` : `block`}">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Reason for suspending"
					value="${this.selectedSuspendReason || this.appDetails.statusReason}"
					style="display:${this.appDetails.status === `Active` ? `none` : `block`}">
				</horizon-label>

				<capitec-button
					type="primary"
					?hidden=${this.appDetails.status !== `Active`}
					label="Suspend"
					@click="${() => this._toggleSuspendReasonsSlide()}">
				</capitec-button>
				<capitec-button 
					?hidden=${this.appDetails.status === `Active`}
					type="primary" 
					label="Unsuspend" 
					@click="${() => this._onUnsuspendAppClick()}">
				</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderServiceUnavailable() {
		return html`
			<capitec-alert-banner 
				class="unavilable-alert-banner"
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

	_renderSuspendAppReason() {
		return this.showSuspendReasons 
		? html`
			<capitec-side-sheet
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
						<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleSuspendReasonsSlide()}"></capitec-icon>
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
							<capitec-radio label="Lost" @value-changed="${(event) => this._onReasonSelected(event)}"></capitec-radio>
							<capitec-radio label="Stolen" @value-changed="${(event) => this._onReasonSelected(event)}"></capitec-radio>
							<capitec-radio label="Cancelled remote banking" @value-changed="${(event) => this._onReasonSelected(event)}"></capitec-radio>
							<capitec-radio label="Faulty" @value-changed="${(event) => this._onReasonSelected(event)}"></capitec-radio>
						</capitec-radio-group>

						<capitec-button type="primary" label="Suspend" @click="${() => this._onSuspendAppClick()}"></capitec-button>
						<capitec-button label="Cancel" @click="${() => this._toggleSuspendReasonsSlide()}"></capitec-button>

					</capitec-content-box>
			</capitec-side-sheet>`
		: html``;
	}

	_renderNotificationBanner() {
		return this.appDetails.status === `Active` 
		? html``
		: html`
			<capitec-alert-banner 
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>App suspended</b> <br>
				<p>You will not be able to access your app any longer.</p>
			</capitec-alert-banner>
		`;
	}

	_renderValidationBanner() {
		return this.appDetails.status === `Active` && this.showValidationBanner 
		? html`
			<capitec-alert-banner 
				class="validate-reasons"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notice</b> <br>
				<p>Please choose a reason to suspend</p>
			</capitec-alert-banner>`
		: html``;
	}

	_renderSuccessToast() {

		/* TO DO: "Header" and "Detail" properties can be removed when update platform to the latest version 
		as content inside slot will be effective.*/

		return html`
		<capitec-toast 
			id="app-success-toast"
			type="success" 
			header="Successful!"
			detail="App was ${this.appDetails.status === `Active` ? `unsuspended` : `suspended`}&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp 
					&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp 
					&nbsp &nbsp &nbsp ${this._formatDate(this.appDetails.dateLastUpdated)}, ${this._formatTime(this.appDetails.dateLastUpdated)}"
			?hidden="${!this.displayToast}"
			@click="${() => this.displayToast = false}"
			closable>
				<capitec-label label="Successful!" type="strong"></capitec-label>
				<capitec-label label="App was ${this.appDetails.status === `Active` ? `unsuspended` : `suspended`}"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${this._formatDate(this.appDetails.dateLastUpdated)}, ${this._formatTime(this.appDetails.dateLastUpdated)}" type="strong"></capitec-label>
		</capitec-toast>`;
	}
}

customElements.define(`capitec-pc-app-profile-details`, AppProfileDetails);