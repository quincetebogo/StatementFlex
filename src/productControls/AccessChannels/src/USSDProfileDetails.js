import { Component, css, html } from 'platform/elements';

import 'app/webComponents/src/SideSheet';
import 'app/components/common/HorizonLabel';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';


export class USSDProfileDetails extends Component {
	constructor() {
		super();

		this.isBusy = false;
		this.displaySuccessToast = false;
		this.showCancelReasons = false;
		this.cancelReason = ``;
		this.showValidationBanner = false;

		this.bannerType = ``;
		this.bannerTitle = ``;
		this.bannerSubtitle = ``;
		this.bannerDetails = ``;
		this.ussdStatus = `SIM Blocked`;

		this._checkUssdStatus(this.ussdStatus);

	}
	
	// ----------
	// PROPERTIES
	// ----------

	static get properties() {
		return {
			isBusy: { state: true },
			displaySuccessToast: { type: Boolean },
			isUssdActive: { type: Boolean },
			
			showSideSheet: { type: Object },
			cancelUSSD: { type: Object },
			activateFullMenuUSSD: { type: Object },
			unblockSIM: { type: Object },
			
			status: { state: true },
			showCancelReasons: { state: true },
			showValidationBanner: { state: true },

			bannerType: { type: String },
			bannerTitle: { type: String },
			bannerSubtitle: { type: String },
			bannerDetails: { type: String }
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

		// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleAppSlidingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, {}));
	}

	_checkSimBlocked() {
		// TO DO: service call to check if clients sim is blocked.

		 if (this.ussdStatus === `SIM Blocked`) {
			// Display unblock sim button
			return true;
		}
	}

	_onUnblockSIM() {
		// code to unblock SIM
		this._displayAndCloseToast(`SIM for number ${this.cellNumber} was unblocked successfully.`)
	}

	_checkUssdStatus(status) {
		if (status === "Cancelled") {
			this.showValidationBanner = true;
			this.bannerType = `unsuccessful-red`;
			this.bannerTitle = `Service has been cancelled.`;
			this.bannerSubtitle = `Visit a branch to reactivate USSD.`
		} else if (status === "Active") {
			this.showValidationBanner = false;
		} else if (status === "SIM Blocked") {
			this.showValidationBanner = true;
			this.bannerType = `unsuccessful-red`;
			this.bannerTitle = `SIM Blocked`;
			this.bannerSubtitle = `SIM blocked due to SIM swop detected.`
		}
	}

	_toggleCancelUSSD() {
		// toggle show and hide of cancel ussd reasons
		this.showValidationBanner = false;
		this.showCancelReasons = !this.showCancelReasons;
		this.showCancelReasons ? this.cancelReason = ``:'';
	}

	async _onCancelUSSD() {
		// action of actually cancelling the service
		
		if (this.cancelReason) {
			const returnValue = await this.cancelUSSD();
			if (returnValue) {
				this.ussdActive = false;

				this._displayAndCloseToast(`USSD was cancelled.`);
				this._toggleCancelUSSD();
			}
		} else {
			this.showValidationBanner = true;
			this.bannerType = `unsuccessful-red`;
			this.bannerTitle = `Notice`;
			this.bannerSubtitle = `Please choose a reason to cancel USSD.`;
		} 
	}

	_activateFullMenu() {
		this.ussdStatus = `Active`;
		this._displayAndCloseToast('The full menu is active.')
	}

	_onCancelReasonSelected(event) {
		if(event.detail.new) {
			this.cancelReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}

	// display success toast for 3 seconds
	_displayAndCloseToast(subtitle) {
		this.displaySuccessToast = true;
		this.bannerDetails = subtitle;
		window.setTimeout(() => this.displaySuccessToast = false, 3000)
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
			.content-box > horizon-label[value="SIM Blocked"] {
				--horizon-label-value-color: #a5132a;
			}
			.header-label[label="Cancel USSD"] {
				--theme-label-strong-font-size: 16px;
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
				--theme-toast-max-width: 315px;
				--theme-toast-height: 106px;
				--theme-icon-size-default: 24px;
				--theme-toast-success-color: #3a3a3a;
				--theme-toast-detail-line-height: 20px;
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
			}
			.header-group-cancel{
				height: 56px;
				padding: 0px 24px;
				background-color: rgba(212, 120, 28, 0.15);
			}
			`
		];
	}
	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUSSDProfileDetails()}
			${this._renderCancelUSSD()}`;
	}

	_renderUSSDProfileDetails() {
		// check if sim is blocked the show the error
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
			<capitec-label class="header-label" type="Strong" label="USSD"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleAppSlidingPanel()}"></capitec-icon>
		</capitec-group>

		${this._renderToast()}
		${this._renderAlertBanner()}

		<capitec-content-box
			class="content-box"
			layout="vertical"
			halign="left"
			valign="top"
			gap="none">
		<horizon-label 
			data-automation-id=""
			class="dateRegistered"
			label="Date registered"
			value="${this.dateRegistered}">
		</horizon-label>

		<horizon-label 
			data-automation-id=""
			class="cellNumber"
			label="Cellphone number (verified)"
			value="${this.cellNumber}">
		</horizon-label>

		<horizon-label 
			data-automation-id=""
			class="lastInteraction"
			label="Last interaction date"
			value="${this.lastInteraction}">
		</horizon-label>

		<horizon-label 
			data-automation-id=""
			class="ussdStatus"
			label="Status"
			value="${this.ussdStatus}">
		</horizon-label>

		<horizon-label 
			data-automation-id=""
			class="lastUpdated"
			label="Last updated"
			value="${this.lastUpdated}"
			style="display:${this.ussdStatus === `Active` ? `none` : `block`}"
			>
		</horizon-label>

		<horizon-label 
			data-automation-id=""
			class="cancelling"
			label="Reason for cancelling"
			value="${this.cancelReason || `Lost`}"
			style="display:${(this.ussdStatus === `SIM Blocked` || this.ussdStatus === `Active`) ? `none` : `block`}"
			>
		</horizon-label>

		${this._renderButtons()}
		</capitec-content-box>
		</capitec-side-sheet>
		`;
	}

	_renderButtons() {
		return html `
			<capitec-button 
				label="Activate Full USSD Menu" 
				?hidden="${this.ussdStatus === `Cancelled` || this.ussdStatus === `SIM Blocked` || this.ussdStatus === `Active`}"
				@click="${() => this._activateFullMenu()}">
			</capitec-button>

			<capitec-button 
				label="Unblock SIM" 
				?hidden="${!this._checkSimBlocked()}"
				@click="${() => this._onUnblockSIM()}">
			</capitec-button>

			<capitec-button 
				label="Cancel USSD" 
				?hidden="${this.ussdStatus === `Cancelled`}"
				@click="${() => this._toggleCancelUSSD()}">
			</capitec-button>

		<!-- <capitec-button 
				label="Cancel" 
				?hidden="${this.hide}"
				@click="${() => this._toggleAppSlidingPanel()}">
			</capitec-button> -->
		`;
	}

	_renderCancelUSSD() {
		return html`
		<capitec-side-sheet
			class="cancel-reasons"
			.expanded="${this.showCancelReasons}"
			alignment="right">
		<capitec-group
			class="header-group-cancel"
			layout="horizontal"
			halign="left"
			valign="center"
			gap="none">
			<capitec-icon class="icon-warning" size="medium" icon="status/warning-trans"></capitec-icon>
			<capitec-label class="header-label" type="Strong" label="Cancel USSD"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleCancelUSSD()}"></capitec-icon>
		</capitec-group>

		${this._renderAlertBanner()}

		<capitec-content-box
			class="content-box"
			layout="vertical"
			halign="left"
			valign="top"
			gap="none">
		<capitec-label class="header-label" type="title" label="Reasons to cancel"></capitec-label>

		<capitec-radio-group>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Do not use service enough"
			?checked="${this.cancelReason === "Do not use service enough"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Changing to remote/internet banking"
			?checked="${this.cancelReason === "Changing to remote/internet banking"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Mobile banking too expensive"
			?checked="${this.cancelReason === "Mobile banking too expensive"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Mobile banking too complicated"
			?checked="${this.cancelReason === "Mobile banking too complicated"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Need more functions"
			?checked="${this.cancelReason === "Need more functions"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Lack of support"
			?checked="${this.cancelReason === "Lack of support"}">
		</capitec-radio>
			<capitec-radio 
			@value-change="${(event) => this._onCancelReasonSelected(event)}" 
			label="Closing account"
			?checked="${this.cancelReason === "Closing account"}">
		</capitec-radio>
		</capitec-radio-group>

		<capitec-button 
			type="primary"
			label="Cancel USSD"
			@click="${() => this._onCancelUSSD()}">
		</capitec-button>

		<capitec-button 
			label="Cancel" 
			@click="${() => this._toggleCancelUSSD()}">
		</capitec-button>

		</capitec-content-box>
		</capitec-side-sheet>
		`
	}

	_renderAlertBanner() {
		// if sim blocked unsuccessful red banner
		return !this.showValidationBanner ?
		html ``:
		html `
		<capitec-alert-banner type="${this.bannerType}" layout="vertical">
		<b>${this.bannerTitle}</b><br>
		<p>${this.bannerSubtitle}</p>
		</capitec-alert-banner>
		`;
	}

	_renderToast() {
		// successful toast to only show for 3 seconds
		// banner details will change for every transaction
		return html `
		<capitec-toast 
			type="success" 
			header="Successful" 
			detail="${this.bannerDetails}"
			?hidden="${!this.displaySuccessToast}"
			@click="${() => this.displaySuccessToast = false}"
			closable>
		</capitec-toast>
		`;
	}
}



window.customElements.define(`capitec-pc-ussd-profile-details`, USSDProfileDetails);