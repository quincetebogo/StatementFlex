import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

export class USSDProfileDetails extends Component {
	constructor() {
		super();

		this.showSideSheet = false;
		this.isBusy = false;

		this.displaySuccessToast = false;
		this.displayUnsuccessfulToast = false;
		this.showCancelReasons = false;
		this.showNotificationBanner = false;
		this.showValidationBanner = false;
		
		this.cancelReason = ``;
		this.bannerTitle = ``;
		this.bannerSubtitle = ``;
		this.successToastDetails = ``;
		this.unsuccessfulToastDetails = ``;
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
	
	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [ussd] - Ussd profile details
	 * @property {String} [ussdStatus] - Ussd profile status
	 * @property {Boolean} [displaySuccessToast] - To hide or show the successful Toast
	 * @property {Boolean} [displayUnsuccessfulToast] - To hide or show the unsuccessful Toast
	 * @property {String} [showCancelReasons] - To toggle cancel reasons side sheet component
	 * @property {Boolean} [showNotificationBanner] - To hide or show the notification banner on some action 
	 * @property {Boolean} [showValidationBanner] - To hide or show the cancel reason validation banner on error 
	 * 
	 * @property {cancelUSSDCallback} cancelUSSD Callback function to cancel USSD
	 * @property {unblockSIMCallback} unblockSIM Callback function to Unblock SIM
	 * @property {getUssdLandingDetailsCallback} getUssdLandingDetails Callback gets USSD landing details
	 * 
	 */
	static get properties() {
		return {
			ussd: { type: Object },
			showSideSheet: { type: Boolean },
			cellphoneNumber: { type: String },

			cancelUSSD: { type: Object },
			unblockSIM: { type: Object },
			activateFullMenuUSSD: { type: Object },
			getUssdLandingDetails: { type: Object },
			
			// private properties
			ussdStatus: { state: true },
			displaySuccessToast: { state: true },
			displayUnsuccessfulToast: { state: true },
			showCancelReasons: { state: true },
			showNotificationBanner: { state: true },
			showValidationBanner: { state: true },
			isBusy: { state: true }
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
		if (returnValue) {
			this.ussd.isSimBlocked = false;

			this._displayAndCloseSuccessToast(`SIM for number ${this.ussd.userRegNo} was unblocked successfully.`);
		} else {
			this._displayAndCloseUnsuccessfulToast(`SIM for number ${this.ussd.userRegNo} was not unblocked. Please try again.`);
		}
	}

	async _onCancelUSSD() {
		// action of actually cancelling the ussd service
		if (this.cancelReason) {
			const returnValue = await this.cancelUSSD(this.cancelReason);
			if (returnValue) {
				this.ussdStatus = `Inactive`;

				this._displayAndCloseSuccessToast(`USSD was cancelled. You will need to visit  branch to reactivate USSD`);
				
				this.showNotificationBanner = false;
				this.showCancelReasons = !this.showCancelReasons;
				
				this.showNotificationBanner = true;
			} else {
				this._displayAndCloseUnsuccessfulToast(`USSD was not cancelled. Please try again.`);
			}
		} else {
			this.bannerTitle = `Notice`;
			this.bannerSubtitle = `Please choose a reason to cancel USSD.`;
			this.showValidationBanner = true;
		} 
	}

	async _activateFullMenu() {
		const activateFullMenuUSSDSuccessful = await this.activateFullMenuUSSD();

		if (activateFullMenuUSSDSuccessful) {
			this._displayAndCloseSuccessToast(`The full menu is active.`);
		} else {
			this._displayAndCloseUnsuccessfulToast(`Full USSD menu was not activated. Please try again.`);
		}
	}

	_onCancelReasonSelected(event) {
		if (event.detail.new) {
			this.cancelReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------
	_checkUssdStatus(status) {
		
		if (isNullorEmpty(status)) {
			this.showNotificationBanner = true;
			this.bannerTitle = `Notify client`;
			this.bannerSubtitle = `Services are currently unavailable`;
		} else if (status === `Active` && !this.ussd.isSimBlocked) {
			this.showNotificationBanner = false;
		} else if (this.ussd.isSimBlocked) {
			this.showNotificationBanner = true;
			this.bannerTitle = `SIM Blocked`;
			this.bannerSubtitle = `SIM blocked due to SIM swop detected.`;
		} else if (status === `Inactive` && !this.ussd.isSimBlocked) {
			this.showNotificationBanner = true;
			this.bannerTitle = `Service has been cancelled.`;
			this.bannerSubtitle = `Visit a branch to reactivate USSD.`;
		} else {
			// do nothing
		}
	}

	// display success toast for 3 seconds
	_displayAndCloseSuccessToast(detail) {
		this.displaySuccessToast = true;
		this.successToastDetails = detail;

		const elementToast = this.shadowRoot.getElementById(`ussd-success-toast`);
		elementToast.style.animation = `slideDown 0.6s`; 

		window.setTimeout(() => {
			elementToast.style.animation = `slideUp 0.6s`;
			window.setTimeout(() => this.displaySuccessToast = false, 600);
		}, 3000);
	}

	_displayAndCloseUnsuccessfulToast(detail) {
		this.displayUnsuccessfulToast = true;
		this.unsuccessfulToastDetails = detail;

		const elementToast = this.shadowRoot.getElementById(`ussd-unsuccessful-toast`);
		elementToast.style.animation = `slideDown 0.6s`; 

		window.setTimeout(() => {
			elementToast.style.animation = `slideUp 0.6s`;
			window.setTimeout(() => this.displayUnsuccessfulToast = false, 600);
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
		return localTime.replace(localTime.slice(-6, -2), ` `);
	}

	_getUssdStatus() {

		const ussdStatus = this.ussdStatus === `Inactive` ? `Cancelled` : this.ussdStatus;
		const SIMStatus = this.ussd.isSimBlocked ? `Blocked: SIM Swop` : ``;
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
			capitec-alert-banner {
				margin: 8px 8px 0px 8px;
				--theme-alert-banner-height: 64px;
				--theme-alert-banner-icon-margin-left: 16px;
				--theme-alert-banner-icon-margin-right: 16px;
			}
			capitec-alert-banner > p {
				margin: 0px;
				padding-right: 32px;

			}
			.validate-reasons {
				--theme-alert-banner-height: 64px;
			}
			capitec-toast {
				animation-timing-function: cubic-bezier(0.2, 0.8, 0.5, 1);
				animation-fill-mode: forwards;

				--theme-toast-max-width: 315px;
				--theme-toast-height: 126px;
				--theme-icon-size-default: 24px;
				--theme-toast-success-color: #3a3a3a;
				--theme-toast-detail-line-height: 22px;
				--theme-toast-title-line-height: 22px;
				padding: 12px 0px 0px 16px;
				position: absolute;
				z-index: 100;
			}
			capitec-radio-group{
				--theme-buttonbar-item-gap: 14px;
			}
			.content-box > capitec-button[label="Cancel"] {
				margin-top: 16px;
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
		if (this.ussd === undefined) {
			return html`
				${this._renderUSSDUnavailable()}
			`;
		}

		if (this.ussd === null) {
			return html`${this._renderUSSDNotRegistered()}`;
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
				data-automation-id="ussd-profile-details-service-not-registered-sheet"
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
								value="${this._formatDate(this.ussd.dateRegistered)}, ${this._formatTime(this.ussd.dateRegistered)}">
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
								value="${this._formatDate(this.ussd.dateLastUpdated)}, ${this._formatTime(this.ussd.dateLastUpdated)}">
							</horizon-label>

							<horizon-label 
								data-automation-id="ussd-profile-details-cancelling-reason"
								class="cancelling"
								label="Reason for cancelling"
								value="${this.cancelReason}"
								style="display:${!isNullorEmpty(this.cancelReason) && this.ussdStatus === `Inactive` ? `block` : `none`}">
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
				?hidden="${!this.ussd.features.includes(`REDUCED_MENU`) || this.ussd.isSimBlocked || this.ussdStatus === `Inactive`}"
				@click="${() => this._activateFullMenu()}">
			</capitec-button>

			<capitec-button 
				data-automation-id="ussd-profile-details-unblock-sim-button"
				label="Unblock SIM" 
				?hidden="${!this.ussd.isSimBlocked}"
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
		// if sim blocked unsuccessful red banner
		this._checkUssdStatus(this.ussdStatus);
		
		return this.showNotificationBanner 
			? html`
				<capitec-alert-banner 
					data-automation-id="ussd-profile-details-status-banner"
					type="unsuccessful-red" 
					layout="vertical">
						<b>${this.bannerTitle}</b><br>
						<p>${this.bannerSubtitle}</p>
				</capitec-alert-banner>`
			: html``;
	}

	_renderValidationBanner() {
		return this.showValidationBanner 
		? html`
			<capitec-alert-banner 
				data-automation-id="ussd-profile-details-validation-banner"
				class="validate-reasons"
				type="unsuccessful-red"
				label=""
				layout="vertical">
					<b>Notice</b> <br>
					<p>Please choose a reason to cancel USSD.</p>
			</capitec-alert-banner>`
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
				detail="${this.successToastDetails} &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp ${this._formatDate(this.ussd.dateLastUpdated)}, ${this._formatTime(this.ussd.dateLastUpdated)}"
				?hidden="${!this.displaySuccessToast}"
				@click="${() => this.displaySuccessToast = false}"
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
				detail="${this.unsuccessfulToastDetails}"
				?hidden="${!this.displayUnsuccessfulToast}"
				@click="${() => this.displayUnsuccessfulToast = false}"
				closable>
			</capitec-toast>
		`;
	}
	
	_renderLoadingIndicator() {
		return this.isBusy
			? html`<capitec-loading-indicator></capitec-loading-indicator>`
			: html``;
	}
}

window.customElements.define(`capitec-pc-ussd-profile-details`, USSDProfileDetails);