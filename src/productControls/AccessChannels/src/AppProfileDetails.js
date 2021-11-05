import { Component, css, html } from 'platform/elements';

import 'platform/components';
import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import { isNullorEmpty } from '../../../utils/channelServiceUtilities';

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
	 * 
	 */

	static get properties() {
		return {
			showSideSheet: { type: Boolean },
			appDetails: { type: Object},

			suspendAppAndOnlineBanking: { type: Object },
			unSuspendAppAndOnlineBanking: { type: Object },

			showSuspendReasons: { state: true },
			selectedSuspendReason: { state: true },
			displayToast: { type: Boolean },
			showValidationBanner: { state: true}
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
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, {}));
	}

	_toggleSuspendReasonsSlide() {
		this.showSuspendReasons = !this.showSuspendReasons;
		this.showSuspendReasons ? this.selectedSuspendReason = `` : '';
	}

	async _onSuspendAppClick() {

		if(this.selectedSuspendReason) {
			const returnValue = await this.suspendApp();
		
			if(returnValue) {
				this.appDetails.isActive = false;
				this._displayAndCloseToast();
				this._toggleSuspendReasonsSlide();
			}
		} else {
			this.showValidationBanner = true;
		}
	}

	async _onUnsuspendAppClick() {
		const returnValue = await this.unSuspendApp();
		
		if(returnValue) {
			this.appDetails.isActive = true;
			this._displayAndCloseToast();
		}
	}

	_onReasonSelected(event) {
		if(event.detail.new) {
			this.selectedSuspendReason = event.currentTarget.label;
			this.showValidationBanner = false;
		}
	}
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_displayAndCloseToast() {
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
					--theme-toast-max-width: 315px;
					--theme-toast-height: 106px;
					--theme-icon-size-default: 24px;
					--theme-toast-success-color: #3a3a3a;
					--theme-toast-detail-line-height: 20px;
					padding: 12px 0px 0px 16px;
					position: absolute;
					z-index: 100;
				}

				/* Suspend App reasons styles */
				.suspend-reasons {
					--theme-side-sheet-top: 104px;
				}
				.header-group-suspend{
					height: 56px;
    				padding: 0px 24px;
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
		: html `
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
					value="1281243122">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Date registered"
					value="12 May 2019, 12:45pm">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Cellphone number (verified)"
					value="082 555 9090">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Last interaction date"
					value="22 Jun 2021">
				</horizon-label>

				<horizon-label
					data-automation-id=""
					label="Status"
					value="${ this.appDetails.isActive ? `Active` : `Suspended`}">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Last updated"
					value="12 Jun 2019, 12:45pm"
					style="display:${this.appDetails.isActive ? `none` : `block`}">
				</horizon-label>

				<horizon-label 
					data-automation-id=""
					label="Reason for suspending"
					value="${this.selectedSuspendReason || `Lost`}"
					style="display:${this.appDetails.isActive ? `none` : `block`}">
				</horizon-label>

				<capitec-button
					type="primary"
					?hidden=${!this.appDetails.isActive}
					label="Suspend"
					@click="${() => this._toggleSuspendReasonsSlide()}">
				</capitec-button>
				<capitec-button 
					?hidden=${this.appDetails.isActive}
					type="primary" 
					label="Unsuspend" 
					@click="${() => this._onUnsuspendAppClick()}">
				</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderServiceUnavailable(){
		return html`

			<capitec-alert-banner 
				class="unavilable-alert-banner"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notify Client</b> <br>
				<p>Service are currently unavailable</p>
			</capitec-alert-banner>
			
			<capitec-group class="service-unavilable-group" layout="vertical" halign="center" valign="center" gap="none">
				
				<capitec-image src="platform/illustrations/no-connection.svg"></capitec-image>

				<capitec-label 
						class="unavailable-header"
						label="Services is unavailable">
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
		return this.showSuspendReasons ?
		 html`
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
		return this.appDetails.isActive ? 
		html`` : 
		html`
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
		return this.appDetails.isActive && this.showValidationBanner ? 
		html`
			<capitec-alert-banner 
				class="validate-reasons"
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notice</b> <br>
				<p>Please choose a reason to suspend</p>
			</capitec-alert-banner>
		` : html``;
	}

	_renderSuccessToast() {
		return html `
		<capitec-toast 
			type="success" 
			header="Successful!"
			detail="App was ${this.appDetails.isActive ? `unsuspended` : `suspended`}&nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp 12 Jun 2019, 12:45pm"
			?hidden="${!this.displayToast}"
			@click="${() => this.displayToast = false}"
			closable>
			<p>12 Jun 2019, 12:45pm</p>
		</capitec-toast>`
	}
}

customElements.define(`capitec-pc-app-profile-details`, AppProfileDetails);