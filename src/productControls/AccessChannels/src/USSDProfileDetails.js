import { ACCESS_CHANNEL_STATUS, parseHTMLtoDOM } from './Constants';
import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

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
			isBusy: { state: true }
		};
	}

	get unblockSIMSuccessToast() {
		return `<capitec-label label="SIM for number ${this.ussd.userRegNo} was unblocked successfully."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${this._getFormattedDateTime(this.ussd.dateLastUpdated)}" type="subtitle"></capitec-label>`;
	}

	get unblockSIMUnSuccessToast() {
		return `<capitec-label label="SIM for number ${this.ussd.userRegNo} was not unblocked."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
	}

	get cancelUSSDSuccessToast() {
		return `<capitec-label label="USSD was cancelled."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="You will need to visit branch to reactivate USSD."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${this._getFormattedDateTime(this.ussd.dateLastUpdated)}" type="subtitle"></capitec-label>`;
	}

	get cancelUSSDUnSuccessToast() {
		return `<capitec-label label="USSD was not cancelled."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
	}

	get activateFullMenuSuccessToast() {
		return `<capitec-label label="The full menu is active."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${this._getFormattedDateTime(this.ussd.dateLastUpdated)}" type="subtitle"></capitec-label>`;
	}

	get activateFullMenuUnSuccessToast() {
		return `<capitec-label label="Full USSD menu was not activated."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
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
		if (returnValue) {
			this.ussd.isSimBlocked = false;

			this._displayAndCloseSuccessToast(this.unblockSIMSuccessToast, `unblock-sim`);
		} else {
			this._displayAndCloseUnsuccessfulToast(this.unblockSIMUnSuccessToast);
		}
	}

	async _onCancelUSSD() {
		// action of actually cancelling the ussd service
		if (this.cancelReason) {
			const returnValue = await this.cancelUSSD(this.cancelReason);
			if (returnValue) {
				this.ussdStatus = `Inactive`;

				this._displayAndCloseSuccessToast(this.cancelUSSDSuccessToast, `cancel-ussd`);
				this.showNotificationBanner = true;
			} else {
				this._displayAndCloseUnsuccessfulToast(this.cancelUSSDUnSuccessToast);
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

		if (activateFullMenuUSSDSuccessful) {
			this._displayAndCloseSuccessToast(this.activateFullMenuSuccessToast, `full-menu`);
		} else {
			this._displayAndCloseUnsuccessfulToast(this.activateFullMenuUnSuccessToast);
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

	// display success toast for 3 seconds
	_displayAndCloseSuccessToast(detail, action) {

		const elementToast = this.shadowRoot.getElementById(`ussd-success-toast`);
		elementToast.style.display = `block`;
		elementToast.style.animation = `slideDown 0.6s`;
		elementToast.setAttribute(`for`, action);

		const detailLabel = elementToast.shadowRoot.querySelector(`label.detail`);
		detailLabel.style.width = `210px`;
		detailLabel.innerHTML = parseHTMLtoDOM(detail);

		window.setTimeout(() => {
			elementToast.style.animation = `slideUp 0.6s`;
			window.setTimeout(() => elementToast.style.display = `none`, 600);
		}, 3000);
	}

	_displayAndCloseUnsuccessfulToast(detail) {

		const elementToast = this.shadowRoot.getElementById(`ussd-unsuccessful-toast`);
		elementToast.style.display = `block`;
		elementToast.style.animation = `slideDown 0.6s`; 

		const detailLabel = elementToast.shadowRoot.querySelector(`label.detail`);
		detailLabel.style.width = `210px`;
		detailLabel.innerHTML = parseHTMLtoDOM(detail);

		window.setTimeout(() => {
			elementToast.style.animation = `slideUp 0.6s`;
			window.setTimeout(() => elementToast.style.display = `none`, 600);
		}, 3000);
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
			.content-box > capitec-button {
				width: 296px;
				margin-top: 24px;
				--theme-button-font-weight: 600;
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
			capitec-toast {
				animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
				animation-fill-mode: forwards;

				--theme-toast-min-width: 312px;
				--theme-toast-max-width: 312px;
				--theme-toast-height: 106px;
				--theme-icon-size-default: 24px;
				--theme-toast-success-color: #3a3a3a;
				--theme-toast-detail-line-height: 20px;
				--theme-toast-title-line-height: 22px;
				--theme-label-subtitle-font-size: 14px;
				--theme-label-subtitle-font-weight: 600;

				padding: 12px 0px 0px 16px;
				position: absolute;
				z-index: 100;
				display: none;
			}
			capitec-toast[for="unblock-sim"] {
				--theme-toast-height: 126px;
			}
			capitec-toast[for="cancel-ussd"] {
				--theme-toast-height: 166px;
			}
			capitec-radio-group{
				--theme-buttonbar-item-gap: 14px;
			}
			.icon-warning {
				--theme-icon-size-medium: 23px;
				margin-right: 8.25px;
			}
			.cancel-reasons {
				--theme-side-sheet-top: 104px;
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
		`;
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
								size="small" 
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
								size="small" 
								icon="system/close-action" 
								@click="${() => this._toggleAppSlidingPanel()}">
							</capitec-icon>
					</capitec-group>

					${this._renderSuccessToast()}
					${this._renderUnsuccessfulToast()}
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
								size="small" 
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
								size="small" 
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

	_renderSuccessToast() {
		
		/* TO DO: "Header" and "Detail" properties can be removed when update platform to the latest version 
			as content inside slot will be effective.*/
		
		return html`
			<capitec-toast 
				data-automation-id="ussd-profile-details-success-toast"
				id="ussd-success-toast"
				type="success" 
				header="Successful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
			</capitec-toast>
		`;
	}

	_renderUnsuccessfulToast() {
		
		/* TO DO: "Header" and "Detail" properties can be removed when update platform to the latest version 
			as content inside slot will be effective.*/
		
		return html`
			<capitec-toast 
				data-automation-id="ussd-profile-details-unsuccessful-toast"
				id="ussd-unsuccessful-toast"
				type="error" 
				header="Unsuccessful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
			</capitec-toast>
		`;
	}
	
	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator data-automation-id="ussd-profile-details-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`capitec-pc-ussd-profile-details`, USSDProfileDetails);