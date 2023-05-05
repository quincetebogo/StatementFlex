import { ACCESS_CHANNEL_STATUS } from './Constants';
import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

const SUSPEND_OUTCOME_DETAILS = {
	'success': {
		action: `Suspend App`,
		type: `success`,
		label: `App is suspended`,
		header: `Successful!`,
		message: `Successfully suspended App.`,
		image: null
	},
	'error': {
		action: `Suspend App`,
		type: `error`,
		label: `App was not suspended`,
		header: `Unsuccessful!`,
		message: `Unable to suspend App. Please try again later.`,
		image: null
	}
};

const UNSUSPEND_OUTCOME_DETAILS = {
	'success': {
		action: `Unsuspend App`,
		type: `success`,
		label: `App was unsuspended`,
		header: `Successful!`,
		message: `Successfully unsuspended App.`,
		image: null
	},
	'error': {
		action: `Unsuspend App`,
		type: `error`,
		label: `Unable to unsuspended App`,
		header: `Unsuccessful!`,
		message: `Unable to unsuspend App. Please try again later.`,
		image: null
	}
};
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
		this.showOutcomeSlide = false;
		this.outcomeDetails = {
			action: null,
			type: null,
			label: null,
			header: null,
			message: null,
			image: null
		};
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
			showValidationBanner: { state: true },
			showOutcomeSlide: { state: true }
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
		this._toggleOutcomePanel();

		if (!returnValue) {
			this.outcomeDetails = SUSPEND_OUTCOME_DETAILS[`error`];
			return;
		}
		this.outcomeDetails = SUSPEND_OUTCOME_DETAILS[`success`];
		this.appDetails.status = `Suspended`;
		
		this.showValidationBanner = false;
	}

	async _onUnsuspendAppClick() {
	
		const returnValue = await this.unsuspendApp();
		this._toggleOutcomePanel();

		if (returnValue) {
			this.appDetails.status = `Active`;
			this.outcomeDetails = UNSUSPEND_OUTCOME_DETAILS[`success`];
			return;
		}
		
		this.outcomeDetails = UNSUSPEND_OUTCOME_DETAILS[`error`];
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

	_toggleOutcomePanel() {
		this.showOutcomeSlide = !this.showOutcomeSlide;
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
				capitec-button {
					width: 296px;
					margin-top: 24px;
					--theme-button-font-weight: 600;
				}
				horizon-alert-banner {
					margin: 8px 8px 0px 8px;
					--theme-toast-icon-margin: 0px 18px 0px 16px;
				}
				horizon-alert-banner > p {
					margin: 0px;
    				padding-right: 33px;
				}
				.validate-reasons {
					--theme-alert-banner-height: 64px;
				}

				/* Suspend App reasons styles */
				.suspend-reasons {
					--theme-side-sheet-top: 96px;
					--theme-modal-screen-background-color: transparent;
				}
				.header-group {
					height: 56px;
    				padding: 0px 24px;
					border-start-start-radius: 4px;
				}
				.header-group-suspend{
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
				.hide-label {
					display: none;
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
				.outcome-banner {
					margin: 32px 16px;
				}
				.outcome-icon {
					--theme-icon-size-large: 64px;
					margin-bottom: 32px;
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
			${this._renderSuspendOutcome()}
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
				type="error"
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

	_renderSuspendOutcome() {
		return this.showOutcomeSlide 
		? html`
			<capitec-side-sheet
				data-automation-id="app-profile-details-outcome-side-sheet"
				class="suspend-reasons"
				.expanded="${this.showOutcomeSlide}"
				alignment="right">

				<horizon-alert-banner
					data-automation-id="app-profile-details-outcome-banner"
					class="unavailable-alert-banner outcome-banner"
					type="${this.outcomeDetails.type}"
					header="${this.outcomeDetails.header}"
					label="${this.outcomeDetails.label}"
					layout="vertical">
				</horizon-alert-banner>
			
				<capitec-group class="service-unavilable-group" layout="vertical" halign="center" valign="center" gap="none">
				
					<capitec-icon class="outcome-icon" size="large" icon="status/${this.outcomeDetails.type}-trans"></capitec-icon>

					<capitec-label 
							class="unavailable-header"
							label="${this.outcomeDetails.message}">
					</capitec-label>

					<capitec-label 
						class="${this.outcomeDetails.type === `error` ? `hide-label` : ``}"
						label="${this._getFormattedDateTime(this.appDetails.dateLastUpdated)}" 
						type="strong">
					</capitec-label>

					<capitec-button 
						data-automation-id="app-profile-details-outcome-okay-button"
						label="Okay" 
						@click="${() => this._toggleOutcomePanel()}">
					</capitec-button>
				</capitec-group>
			</capitec-side-sheet>`
		: html``;
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
						class="header-group header-group-suspend ${this.showValidationBanner ? `header-suspend-error` : ``}"
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
				type="error"
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
				type="error"
				label=""
				layout="vertical">
				<b>Notice</b> <br>
				<p>Please choose a reason to suspend</p>
			</horizon-alert-banner>`
		: html``;
	}

}

customElements.define(`capitec-pc-app-profile-details`, AppProfileDetails);