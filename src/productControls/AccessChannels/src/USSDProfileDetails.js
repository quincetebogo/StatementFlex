import { Component, css, html } from 'platform/elements';
import { ACCESS_CHANNEL_STATUS } from './Constants';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

const UNBLOCK_SIM_OUTCOME = {
	'success': {
		type: `success`,
		label: `SIM unblocking was successful.`,
		header: `Successful!`,
		message: `SIM unblocking was successful.`
	},
	'error': {
		type: `error`,
		label: `SIM unblocking has failed.`,
		header: `Unsuccessful!`,
		message: `SIM unblocking has failed.`
	}
};

const CANCEL_USSD_OUTCOME = {
	'success': {
		type: `success`,
		label: `USSD cancellation was successful.`,
		header: `Successful!`,
		message: `USSD cancellation was successful. You will need to visit branch to reactivate USSD.`
	},
	'error': {
		type: `error`,
		label: `USSD cancellation was unsuccessful.`,
		header: `Unsuccessful!`,
		message: `USSD cancellation was unsuccessful. Please try again later.`
	}
};

const ACTIVATE_FULL_MENU_OUTCOME = {
	'success': {
		type: `success`,
		label: `Full USSD menu is now active.`,
		header: `Successful!`,
		message: `Full USSD menu is now active.`
	},
	'error': {
		type: `error`,
		label: `Full USSD menu was not activated.`,
		header: `Unsuccessful!`,
		message: `Full USSD menu was not activated. Please try again later.`
	}
};

export class USSDProfileDetails extends Component {
	constructor() {
		super();

		this.showSideSheet = false;
		this.isVerifiedClient = false;

		this.isBusy = false;
		this.showCancelReasons = false;
		this.showNotificationBanner = false;
		this.showValidationBanner = false;
		this.canPerformHighRiskActions = false;
		
		this.cancelReason = ``;
		this.bannerTitle = ``;
		this.bannerSubtitle = ``;
		this.cellphoneNumber = ``;
		this.showOutcomeSlide = false;
		this.outcomeDetails = {
			action: null,
			type: null,
			label: null,
			header: null,
			message: null,
			image: null
		};

		// Active, Inactive, SIM Blocked Blocked, Service Unavailable - null
		this.ussdStatus = ``;
	}
	
	// ----------
	// PROPERTIES
	// ----------
	
	/**
	 * @callback cancelUSSD
	 * @returns {cancelUSSDCallback} - Success or failure response from cancelling the USSD services.
	 */

	/**
	 * @callback unblockSIM
	 * @returns {unblockSIMCallback} - Success or failure response from Unblocking SIM.
	
	 /**
	 * @callback activateFullMenuUSSD
	 * @returns {activateFullMenuUSSDCallback} - Success or failure response for activating full ussd.
	 * 
	 * @callback getUssdLandingDetails
	 * @returns {getUssdLandingDetailsCallback} - get ussd landing details
	
	 * @callback renderVerificationAlertBanner
	 * @returns {renderVerificationAlertBannerCallback} - Display alter banner based on verification status
	
	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [ussd] - Ussd profile details
	 * @property {String} [ussdStatus] - Ussd profile status
	 * @property {String} [showCancelReasons] - To toggle cancel reasons side sheet component
	 * @property {Boolean} [showNotificationBanner] - To hide or show the notification banner on some action 
	 * @property {Boolean} [showValidationBanner] - To hide or show the cancel reason validation banner on error 
	 * 
	 * @property {cancelUSSDCallback} cancelUSSD Callback function to cancel USSD
	 * @property {unblockSIMCallback} unblockSIM Callback function to Unblock SIM
	 * @property {getUssdLandingDetailsCallback} getUssdLandingDetails Callback gets USSD landing details
	 * @property {renderVerificationAlertBannerCallback} renderVerificationAlertBanner Callback function to render alter banner based on verification status & method
	 * 
	 */
	static get properties() {
		return {
			ussd: { type: Object },
			showSideSheet: { type: Boolean },
			cellphoneNumber: { type: String },
			isVerifiedClient: { type: Boolean },
			canPerformHighRiskActions: { type: Boolean },

			cancelUSSD: { type: Object },
			unblockSIM: { type: Object },
			activateFullMenuUSSD: { type: Object },
			getUssdLandingDetails: { type: Object },
			renderVerificationAlertBanner: { type: Object, attribute: false },
			
			// private properties
			ussdStatus: { state: true },
			showCancelReasons: { state: true },
			showNotificationBanner: { state: true },
			showValidationBanner: { state: true },
			isBusy: { state: true },
			showOutcomeSlide: { state: true }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
 
	connectedCallback() {
		super.connectedCallback();
		
		this.ussdStatus = this.ussd && this.ussd.status;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_toggleAppSlidingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, { detail: { tileClicked: `ussd` } }));
	}
	
	_toggleCancelUSSD() {
		// toggle show or hide of cancel ussd reasons
		this.showNotificationBanner = false;
		this.showCancelReasons = !this.showCancelReasons;
		
		this.dispatchEvent(new CustomEvent(`toggle-ussd-cancel-reasons`, { detail: { showCancelReasons: this.showCancelReasons } }));
		if (this.showCancelReasons) {
			this.cancelReason = ``;
		}
	}

	async _onUnblockSIM() {
		// code to unblock SIM
		const returnValue = await this.unblockSIM();
		this._toggleOutcomePanel();

		if (returnValue) {
			this.ussd.isSimBlocked = false;
			this.outcomeDetails = UNBLOCK_SIM_OUTCOME[`success`];
		} else {
			this.outcomeDetails = UNBLOCK_SIM_OUTCOME[`error`];
		}
	}

	async _onCancelUSSD() {
		// action of actually cancelling the ussd service
		if (this.cancelReason) {
			const returnValue = await this.cancelUSSD(this.cancelReason);
			this._toggleOutcomePanel();

			if (returnValue) {
				this.ussdStatus = `Inactive`;
				this.outcomeDetails = CANCEL_USSD_OUTCOME[`success`];
				this.showNotificationBanner = true;
			} else {
				this.outcomeDetails = CANCEL_USSD_OUTCOME[`error`];
			}
			
			this.showCancelReasons = !this.showCancelReasons;
		} else {
			this.bannerTitle = `Notice`;
			this.bannerSubtitle = `Please choose a reason to cancel USSD.`;
			this.showValidationBanner = true;
		} 
	}

	async _activateFullMenu() {
		const activateFullMenuUSSDSuccessful = await this.activateFullMenuUSSD();
		this._toggleOutcomePanel();

		if (activateFullMenuUSSDSuccessful) {
			this.outcomeDetails = ACTIVATE_FULL_MENU_OUTCOME[`success`];
		} else {
			this.outcomeDetails = ACTIVATE_FULL_MENU_OUTCOME[`error`];
		}
	}

	_onCancelReasonSelected(event) {
		if (event.detail.new) {
			this.cancelReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}

	_closeToast(e) {
		const elementToast = this.shadowRoot.getElementById(e.target.id);
		elementToast.style.display = `none`;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_checkUssdStatus(status) {
		
		if (isNullorEmpty(status) || this.ussd.status === ACCESS_CHANNEL_STATUS.UNAVAILABLE) {
			this.showNotificationBanner = true;
			this.bannerTitle = `Notify client`;
			this.bannerSubtitle = `Services are currently unavailable`;
		} else if (status === `Active` && !this.ussd.isSimBlocked) {
			this.showNotificationBanner = false;
		} else if (this.ussd.isSimBlocked) {
			this.showNotificationBanner = true;
			this.bannerTitle = `SIM Blocked`;
			this.bannerSubtitle = `SIM blocked due to SIM swap detected.`;
		} else if (status === `Inactive` && !this.ussd.isSimBlocked) {
			this.showNotificationBanner = true;
			this.bannerTitle = `Service has been cancelled.`;
			this.bannerSubtitle = `Visit a branch to reactivate USSD.`;
		} else {
			this.showNotificationBanner = false;
		}
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

	_getUssdStatus() {

		const ussdStatus = this.ussdStatus === `Inactive` ? `Cancelled` : this.ussdStatus;
		const SIMStatus = this.ussd.isSimBlocked ? `Blocked: SIM Swap` : ``;
		const menuStatus = this.ussd.features.includes(`REDUCED_MENU`) && this.ussdStatus !== `Inactive` ? ` | Reduced menu` : ``;

		return `${this.ussd.isSimBlocked ? SIMStatus : ussdStatus}${menuStatus}`;
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
			.content-box > horizon-label[value="Cancelled"] {
				--horizon-label-value-color: #a5132a;
			}
			.content-box > horizon-label[value*="Blocked"] {
				--horizon-label-value-color: #a5132a;
			}
			.content-box > horizon-label[value="Active | Reduced menu"] {
				--horizon-label-value-color: #D4781C;
			}
			.header-label[label="Cancel USSD"] {
				--theme-label-strong-font-size: 16px;
			}
			.header-label[label="Services are unavailable"] {
				--theme-label-strong-font-size: 18px;
			}
			.header-label[label="For any urgent matters visit a branch."] {
				--theme-label-strong-font-size: 15px;
				margin-top: 19px;
			}
			.header-label[label="Reasons to cancel"] {
				margin: 16px 0px 14px 0px;
				--theme-label-strong-font-size: 16px;
			}
			.outcome-label {
				margin: 16px 16px 0px;
				text-align: center;
				height: auto;
			}
			 capitec-button {
				width: 296px;
				margin-top: 24px;
				--theme-button-font-weight: 600;
			}
			.service-unavilable-group{
				text-align: center;
				align-items: center;
				padding: 14px 36px;
			}
			.content-box > capitec-button[label="Cancel"] {
				margin-top: 16px;
			}
			.content-box > capitec-button[disabled] {
				--theme-check-disabled-background-color: #FFFFFF;
				--theme-button-default-font-color: #7C7C7C;
			}
			horizon-alert-banner {
				margin: 8px 8px 0px 8px;
				--theme-alert-banner-height: 64px;
				--theme-toast-icon-margin: 7px 16px 0px 16px;
			}
			horizon-alert-banner > p {
				margin: 0px;
				padding-right: 32px;
			}
			.no-digital-channels {
				--theme-label-strong-font-weight: 600;
				--theme-toast-icon-margin: 28px 16px 0px 16px;
			}
			.has-digital-channels {
				--theme-label-strong-font-weight: 600;
				--theme-toast-icon-margin: 28px 16px 0px 16px;
				--theme-hyperlink-font-size: 14px;
			}
			.has-digital-channels > capitec-label {
				width: 234px;
			}
			capitec-hyperlink {
				--theme-hyperlink-font-size: 14px;
				position: absolute;
				right: 16px;
				bottom: 16px;
			}
			.validate-reasons {
				--theme-alert-banner-height: 64px;
			}
			capitec-radio-group{
				--theme-buttonbar-item-gap: 14px;
			}
			.icon-warning {
				--theme-icon-size-medium: 23px;
				margin-right: 8.25px;
			}
			.cancel-reasons {
				--theme-side-sheet-top: 96px;
				--theme-modal-screen-background-color: transparent;
			}
			.header-group-cancel{
				height: 56px;
				padding: 0px 24px;
				border-start-start-radius: 4px;
				background-color: rgba(212, 120, 28, 0.15);
			}
			.header-cancel-error{
				background-color: #F7E2E1;
			}
			.connection-error-svg {
				height: 152px;
				width: 210px;
				margin: 18px 0px 13px 0px;
			}
			.hide-label {
				display: none;
			}
			.outcome-banner {
				margin: 32px 16px;
			}
			.outcome-icon {
				--theme-icon-size-large: 64px;
				margin: 16px 0px 32px;
			}
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		if (isNullorEmpty(this.ussd) || this.ussd.status === ACCESS_CHANNEL_STATUS.UNAVAILABLE) {
			return this._renderUSSDUnavailable();
		}

		if (this.ussd.status === ACCESS_CHANNEL_STATUS.NOTREGISTERED) {
			return this._renderUSSDNotRegistered();
		}

		return html`
			${this._renderLoadingIndicator()}
			${this._renderUSSDProfileDetails()}
			${this._renderCancelUSSD()}
			${this._renderOutcome()}
		`;
	}

	_renderOutcome() {
		return this.showOutcomeSlide 
		? html`
			<capitec-side-sheet
				data-automation-id="ussd-profile-details-outcome-side-sheet"
				class="cancel-reasons"
				.expanded="${this.showOutcomeSlide}"
				alignment="right">

				<horizon-alert-banner
					data-automation-id="ussd-profile-details-outcome-banner"
					class="outcome-banner"
					type="${this.outcomeDetails.type}"
					header="${this.outcomeDetails.header}"
					label="${this.outcomeDetails.label}"
					layout="vertical">
				</horizon-alert-banner>
			
				<capitec-group class="service-unavilable-group" layout="vertical" halign="center" valign="center" gap="none">
				
					<capitec-icon class="outcome-icon" size="large" icon="status/${this.outcomeDetails.type}-trans"></capitec-icon>

					<capitec-label 
							class="header-label outcome-label"
							type="Strong" 
							label="${this.outcomeDetails.message}">
					</capitec-label>

					<capitec-label 
							class="outcome-label ${this.outcomeDetails.type === `error` ? `hide-label` : ``}"
							label="${this._getFormattedDateTime(this.ussd.dateLastUpdated)}">
					</capitec-label>

					<capitec-button 
						data-automation-id="ussd-profile-details-outcome-okay-button"
						label="Okay" 
						@click="${() => this.showOutcomeSlide = false}">
					</capitec-button>
				</capitec-group>
			</capitec-side-sheet>`
		: html``;
	}

	_renderUSSDNotRegistered() {
		return html`
			<capitec-side-sheet
				data-automation-id="ussd-profile-details-not-registered-sheet"
				.expanded="${this.showSideSheet}"
				alignment="right">
					<capitec-group
						class="header-group-app"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
							<capitec-icon 
								class="icon-app" 
								size="medium" 
								icon="system/cellphone">
							</capitec-icon>
							<capitec-label 
								class="header-label" 
								type="Strong" 
								label="USSD">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-icon 
								class="icon-close" 
								size="medium" 
								icon="system/close-action" 
								@click="${() => this._toggleAppSlidingPanel()}">
							</capitec-icon>
					</capitec-group>

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="center"
					valign="top"
					gap="none">
					<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
					<capitec-label class="header-label" type="Strong" label="Client not registered"></capitec-label>
					<p style="text-align: center">You need to vist a branch to register for USSD.</p>
				</capitec-content-box>
			</capitec-side-sheet>
	`;
	}

	_renderUSSDProfileDetails() {
		// check if sim is blocked the show the error
		return html`
			<capitec-side-sheet
				data-automation-id="ussd-profile-details-main-sheet"
				.expanded="${this.showSideSheet}"
				alignment="right">
					<capitec-group
						class="header-group-app"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
							<capitec-icon 
								class="icon-app" 
								size="medium" 
								icon="system/cellphone">
							</capitec-icon>
							<capitec-label 
								class="header-label" 
								type="Strong" 
								label="USSD">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-icon 
								data-automation-id="ussd-profile-details-close-side-sheet"
								class="icon-close" 
								size="medium" 
								icon="system/close-action" 
								@click="${() => this._toggleAppSlidingPanel()}">
							</capitec-icon>
					</capitec-group>

					${this._renderAlertBanner()}

					<capitec-content-box
						class="content-box"
						layout="vertical"
						halign="left"
						valign="top"
						gap="none">
							<horizon-label
								data-automation-id="ussd-profile-details-date-registered"
								class="dateRegistered"
								label="Date registered"
								value="${this._getFormattedDateTime(this.ussd.dateRegistered)}"
								?hidden="${!this.isVerifiedClient}">
							</horizon-label>

							<horizon-label
								data-automation-id="ussd-profile-details-cellphone-number"
								class="cellNumber"
								label="Cellphone number (verified)"
								value="${this.cellphoneNumber}">
							</horizon-label>

							<horizon-label 
								data-automation-id="ussd-profile-details-last-interaction-date"
								class="lastInteraction"
								label="Last interaction date"
								value="${this._formatDate(this.ussd.dateLastUsed)}">
							</horizon-label>

							<horizon-label 
								data-automation-id="ussd-profile-details-status"
								class="ussdStatus"
								label="Status"
								value="${this._getUssdStatus()}">
							</horizon-label>

							<horizon-label 
								data-automation-id="ussd-profile-details-last-updated"
								class="lastUpdated"
								label="Last updated"
								value="${this._getFormattedDateTime(this.ussd.dateLastUpdated)}"
								?hidden="${!this.isVerifiedClient}">
							</horizon-label>

							<horizon-label 
								data-automation-id="ussd-profile-details-cancelling-reason"
								class="cancelling"
								label="Reason for cancelling"
								value="${this.cancelReason}"
								style="display:${!isNullorEmpty(this.cancelReason) && this.ussdStatus === `Inactive` ? `block` : `none`}"
								?hidden="${!this.isVerifiedClient}"></horizon-label>
							</horizon-label>

							${this._renderButtons()}
					</capitec-content-box>
			</capitec-side-sheet>
		`;
	}

	_renderButtons() {
		return html`
			<capitec-button 
				data-automation-id="ussd-profile-details-activate-full-ussd-button"
				label="Activate Full USSD Menu" 
				?hidden="${!this.ussd.features.includes(`REDUCED_MENU`) || this.ussd.isSimBlocked || this.ussdStatus === `Inactive` || !this.isVerifiedClient}"
				?disabled="${!this.canPerformHighRiskActions}"
				@click="${() => this._activateFullMenu()}">
			</capitec-button>

			<capitec-button 
				data-automation-id="ussd-profile-details-unblock-sim-button"
				label="Unblock SIM" 
				?hidden="${!this.ussd.isSimBlocked || !this.isVerifiedClient}"
				?disabled="${!this.canPerformHighRiskActions}"
				@click="${() => this._onUnblockSIM()}">
			</capitec-button>

			<capitec-button 
				data-automation-id="ussd-profile-details-cancel-ussd-button"
				label="Cancel USSD" 
				?hidden="${this.ussdStatus === `Inactive`}"
				@click="${() => this._toggleCancelUSSD()}">
			</capitec-button>
		`;
	}

	_renderCancelUSSD() {
		return html`
			<capitec-side-sheet
				data-automation-id="ussd-profile-details-cancel-reasons-sheet"
				class="cancel-reasons"
				.expanded="${this.showCancelReasons}"
				alignment="right">
					<capitec-group
						class="header-group-cancel  ${this.showValidationBanner ? `header-cancel-error` : ``}"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
							<capitec-icon 
								class="icon-warning" 
								size="medium" 
								icon="${this.showValidationBanner ? `status/error-trans` : `status/warning-trans`}">
							</capitec-icon>
							<capitec-label 
								class="header-label" 
								type="Strong" label="Cancel USSD"></capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-icon 
								data-automation-id="ussd-profile-details-cancel-reasons-side-sheet"
								class="icon-close" 
								size="medium" 
								icon="system/close-action" 
								@click="${() => this._toggleCancelUSSD()}">
							</capitec-icon>
					</capitec-group>

					${this._renderValidationBanner()}

					<capitec-content-box
						class="content-box"
						layout="vertical"
						halign="left"
						valign="top"
						gap="none">
							<capitec-label class="header-label" type="strong" label="Reasons to cancel"></capitec-label>

							<capitec-radio-group>
								<capitec-radio 
									data-automation-id="ussd-profile-details-do-not-use-service-enough"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Do not use service enough"
									?checked="${this.cancelReason === `Do not use service enough`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-changing-to-remote-banking"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Changing to remote/internet banking"
									?checked="${this.cancelReason === `Changing to remote/internet banking`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-mobile-banking-too-expensive"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Mobile banking too expensive"
									?checked="${this.cancelReason === `Mobile banking too expensive`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-mobile-banking-too-complicated"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Mobile banking too complicated"
									?checked="${this.cancelReason === `Mobile banking too complicated`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-need-more-functions"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Need more functions"
									?checked="${this.cancelReason === `Need more functions`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-lack-off-support"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Lack of support"
									?checked="${this.cancelReason === `Lack of support`}">
								</capitec-radio>
								<capitec-radio 
									data-automation-id="ussd-profile-details-closing-account"
									@value-change="${(event) => this._onCancelReasonSelected(event)}" 
									label="Closing account"
									?checked="${this.cancelReason === `Closing account`}">
								</capitec-radio>
							</capitec-radio-group>

							<capitec-button 
								data-automation-id="ussd-profile-details-cancle-ussd-button"
								type="primary"
								label="Cancel USSD"
								@click="${() => this._onCancelUSSD()}">
							</capitec-button>

							<capitec-button 
								data-automation-id="ussd-profile-details-cancel-button"
								label="Cancel" 
								@click="${() => this._toggleCancelUSSD()}">
							</capitec-button>

					</capitec-content-box>
			</capitec-side-sheet>
		`;
	}

	_renderUSSDUnavailable() {
		return html`
			<capitec-side-sheet
				data-automation-id="ussd-profile-details-service-unavailable-sheet"
				class="unavailable"
				.expanded="${this.showSideSheet}"
				alignment="right">
					<capitec-group
						class="header-group-app"
						layout="horizontal"
						halign="left"
						valign="center"
						gap="none">
							<capitec-icon 
								class="icon-app" 
								size="medium" 
								icon="system/cellphone">
							</capitec-icon>
							<capitec-label 
								class="header-label" 
								type="Strong" 
								label="USSD">
							</capitec-label>
							<capitec-spacer></capitec-spacer>
							<capitec-icon 
								class="icon-close" 
								size="medium" 
								icon="system/close-action" 
								@click="${() => this._toggleAppSlidingPanel()}">
							</capitec-icon>
					</capitec-group>

				${this._renderAlertBanner()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="center"
					valign="top"
					gap="none">
					<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
					<capitec-label class="header-label" type="Strong" label="Services are unavailable"></capitec-label>
					<p style="text-align: center">We are experiencing technical difficulties. We are sorry for the inconvenience and aim to have it resolved soon.</p>
					<capitec-label class="header-label" type="Strong" label="For any urgent matters visit a branch."></capitec-label>
				</capitec-content-box>
			</capitec-side-sheet>
	`;
	}

	_renderAlertBanner() {
		return this.isVerifiedClient && !this.canPerformHighRiskActions
			? html`
				${this.renderVerificationAlertBanner()}`
			: html`
				${this._renderStatusAlertBanner()}`;
	}

	_renderStatusAlertBanner() {
		// if sim blocked unsuccessful red banner
		this._checkUssdStatus(this.ussdStatus);
		
		return this.showNotificationBanner 
			? html`
				<horizon-alert-banner 
					data-automation-id="ussd-profile-details-status-banner"
					type="error" 
					layout="vertical">
						<b>${this.bannerTitle}</b>
						<p>${this.bannerSubtitle}</p>
				</horizon-alert-banner>`
			: html``;
	}

	_renderValidationBanner() {
		return this.showValidationBanner 
		? html`
			<horizon-alert-banner 
				data-automation-id="ussd-profile-details-validation-banner"
				class="validate-reasons"
				type="error"
				header="Notice"
				label="Please choose a reason to cancel USSD."
				layout="vertical">
			</horizon-alert-banner>`
		: html``;
	}

	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="ussd-profile-details-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`capitec-pc-ussd-profile-details`, USSDProfileDetails);