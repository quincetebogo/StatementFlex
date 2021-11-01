import { Component, css, html } from 'platform/elements';

import 'app/webComponents/src/SideSheet';
import 'app/components/common/HorizonLabel';

export class USSDProfileDetails extends Component {
	constructor() {
		super();

		this.isBusy = false;
		this.displaySuccessToast = false;
		this.showCancelReasons = false;
		this.cancelReason = ``;
		this.showValidationBanner = false;


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

		// ---------------
	// PRIVATE METHODS
	// ---------------

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_toggleAppSlidingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, {}));
	}

	_checkSimBlocked() {
		// TO DO: service call to check if clients sim is blocked.

		/* if (ussdActive && simBlocked) {
			// Display unblock sim button
			return true;
		}*/
	}

	_onUnblockSIM() {
		// code to unblock SIM
	}

	_toggleCancelUSSD() {
		// toggle show and hide of cancel ussd reasons
		this.showCancelReasons = !this.showCancelReasons;
		this.showCancelReasons ? this.cancelReason = ``:'';
	}

	async _onCancelUSSD() {
		// action of actually cancelling the service
		const returnValue = await this.cancelUSSD();

		if (returnValue) {
			this.ussdActive = false;
			this._displayAndCloseToast();
		}
	}

	_onCancelReasonSelected(event) {
		if(event.detail.new) {
			this.cancelReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}

	// display success toast for 3 seconds
	_displayAndCloseToast() {
		this.displaySuccessToast = true;
		window.setTimeout(() => this.displaySuccessToast = false, 3000)
	}

	_cancel() {
		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	// ---------
	// RENDERING
	// ---------

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderUSSDProfileDetails()}
			${this._renderCancelUSSD()}
			${this._renderLoadingIndicator()}`;
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
			class="dateRegistered"
			label="Date registered"
			value="${this.dateRegistered}">
		</horizon-label>

		<horizon-label 
			class="cellNumber"
			label="Cellphone number (verified)"
			value="${this.cellNumber}">
		</horizon-label>

		<horizon-label 
			class="lastInteraction"
			label="Last interaction date"
			value="${this.lastInteraction}">
		</horizon-label>

		<horizon-label 
			class="ussdStatus"
			label="Status"
			value="${this.ussdStatus}">
		</horizon-label>

		<horizon-label 
			class="lastUpdated"
			label="Last updated"
			value="${this.lastUpdated}"
			>
		</horizon-label>

		<horizon-label 
			class="cancelling"
			label="Reason for cancelling"
			?hidden="${this.simBlocked}"
			value="${this.cancelling}"
			>
		</horizon-label>

		</capitec-content-box>
		</capitec-side-sheet>
		`;
	}

	_renderButtons() {
		
	}

	_renderCancelUSSD() {
		return html`
		<capitec-side-sheet
			class="suspend-reasons"
			.expanded="${this.showSuspendReasons}"
			alignment="right">
		<capitec-group
			class="header-group-suspend"
			layout="horizontal"
			halign="left"
			valign="center"
			gap="none">
			<capitec-icon class="icon-warning" size="medium" icon="status/warning-trans"></capitec-icon>
			<capitec-label class="header-label" type="Strong" label="Suspend App"></capitec-label>
			<capitec-spacer></capitec-spacer>
			<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleSuspendReasonsSlide()}"></capitec-icon>
		</capitec-group>

		${this._renderAlertBanner()}

		<capitec-content-box
			class="content-box"
			layout="vertical"
			halign="left"
			valign="top"
			gap="none">
		<capitec-label type="title" label="Reasons to cancel"></capitec-label>

		<capitec-radio-group>
			<capitec-radio label="Do not use service enough"></capitec-radio>
			<capitec-radio label="Changing to remote/internet banking"></capitec-radio>
			<capitec-radio label="Mobile banking too expensive"></capitec-radio>
			<capitec-radio label="Mobile banking too complicated"></capitec-radio>
			<capitec-radio label="Need more functions"></capitec-radio>
			<capitec-radio label="Lack of support"></capitec-radio>
			<capitec-radio label="Closing account"></capitec-radio>
		</capitec-radio-group>

		<div class="buttons">
			<capitec-button 
				label="Cancel USSD" 
				?hidden="${this.ussdActive}"
				@click="${() => this._cancelUSSD()}">
			</capitec-button>

			<capitec-button 
				label="Cancel" 
				?hidden="${this.hide}"
				@click="${() => this._cancel()}"></capitec-button>
		</div>
		</capitec-content-box>
		</capitec-side-sheet>
		`
	}

	_renderAlertBanner() {
		// if sim blocked unsuccessful red banner
		// 
		return html `
		<capitec-alert-banner type="${this.bannerType}" class="mainBanner" header="${this.bannerTitle}" label="${this.bannerSubtitle}" layout="vertical">
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