import { Component, css, html } from 'platform/elements';

import 'platform/components';

const SUSPEND_REASONS = {
	STOLEN: "Stolen",
	LOST: "Lost",
	FAULTY: "Faulty",
	SERVICE_CANCELLATION: "Service Cancellation"
}

export class InternetBankingProfileDetails  extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		this.displayToast = false;
		this.toastType = "error";
		this.showSuspendPanel = false;
		this.isTokenSuspended = false;

		this.selectedReason = ``;
		this.showNoReasonSelectedNotification = false;
		this.showClientNotification = true;
		this.reasonForSuspending = "Lost";
		this.userName = "1281243122";
		this.tokenSerialNumber = "90876375849";
		this.cellphone = "082 555 9090";
		this.dateRegistered = new Date().toISOString();
		this.lastInteractionDate = new Date().toISOString();
		this.lastUpdated = new Date().toISOString();

		this.isInternetBankingActive = true;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			isInternetBankingActive: { type: Boolean },
			showSideSheet: { type: Object },
			displayToast: { type: Boolean },

			reasonForSuspending: { type: String },
			userName: { type: String },
			tokenSerialNumber: { type: String },
			dateRegistered: { type: Date },
			cellphone: { type: String },
			lastInteractionDate: { type: Date },
			lastUpdated: { type: Date },

			toastType: { type: String },
			toastHeader: { type: String },
			toastDetail: { type: String },
			showSuspendPanel: { type: Boolean },
			selectedReason: { type: String },
			isTokenSuspended: { type: Boolean },
			showNoReasonSelectedNotification: { type: Boolean },
			showClientNotification: { type: Boolean }
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

	_toggleInternetBankingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, {}));
	}

	_toggleSuspendPanel() {
		this.showSuspendPanel = !this.showSuspendPanel;
		this._renderSuspendPanel();

	}

	_onToggleSuspendPanelClick() {
		this.showSuspendPanel = !this.showSuspendPanel;
		this._renderSuspendPanel();
		this.showClientNotification = true;
		this.showNoReasonSelectedNotification = false;
		this.selectedReason = ``;
		this.isTokenSuspended = false;
	}

	async _onResetSecurityTokenClockClick() {
		var unSuspendResult = await this.unSuspendInternetBankingSecurityToken();
		if(unSuspendResult) {
			this._showAndCloseToast("success");
		}
	}

	async _onSuspendSecurityTokenClick() {
		if(this.selectedReason) {
			var suspendResult = await this.suspendInternetBankingSecurityToken();
			if(suspendResult) {

				this.showSuspendPanel = !this.showSuspendPanel;
				this.isTokenSuspended = true;
				this.isInternetBankingActive = false;
				this._showAndCloseToast("success");
				this._renderSuspendedNotification();
			}
		
		}
		else {
			this.showClientNotification = false;
			this.showNoReasonSelectedNotification = true;
		}
	}

	suspendReasonNotSelected() {
		//this.showNotification = true;
	}

	_onSelectedReasonChanged(event) {
		if(event.detail.new) {
			this.selectedReason = event.currentTarget.label;
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_showAndCloseToast(tType) {
		this.toastType = tType;
		this.toastHeader = "Succesful!";
		this.toastDetail = `Security token was reset. \nYou can now log in again. \n${this.lastUpdated}`;
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
				.content-box > capitec-radio {
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
				.suspend-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 144px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}
				.notify-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 105px;
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
				.header-label[label="Suspend Security Token"] {
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
				.radio-button-label {
					height: 20px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 15px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
				}

				`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderInternetBankingPanel()}
		`;
	}

	_renderInternetBankingPanel() {
		return html`
			<capitec-side-sheet
				.expanded=${this.showSideSheet}
				alignment="right"
			>
				<capitec-group
					class="header-group-app"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="icon-app" size="medium" icon="system/access"></capitec-icon>
					<capitec-label class="header-label" type="Strong" label="Internet Banking"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._toggleInternetBankingPanel()}"></capitec-icon>
				</capitec-group>

				${this._renderToast()}
				${this._renderSuspendPanel()}
				${this._renderSuspendedNotification()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					<horizon-label
						data-automation-id=""
						label="Username"
						value="${this.userName}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Token serial number"
						value="${this.tokenSerialNumber}"
						style="display:${this.isInternetBankingActive ? `block` : `none`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Date registered"
						value="${this.dateRegistered}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Cellphone number (verified)"
						value="${this.cellphone}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Last interaction date"
						value="${this.lastInteractionDate}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Status"
						value="${this.isInternetBankingActive ? `Active` : `Suspended`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Last updated"
						value="${this.lastUpdated}"
						style="display:${this.isInternetBankingActive ? `none` : `block`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Reason for suspending"
						value="${this.reasonForSuspending}"
						style="display:${this.isInternetBankingActive ? `none` : `block`}"
					></horizon-label>

					<capitec-button
						label="Reset Security Token Clock"
						@click="${() => this._onResetSecurityTokenClockClick()}"
					></capitec-button>
					<capitec-button
						label="Suspend Security Token"
						@click="${() => this._onToggleSuspendPanelClick()}"
					></capitec-button>

				</capitec-content-box>

			</capitec-side-sheet>
		`;
	}

	_renderSuspendPanel() {
		return html`
			<capitec-side-sheet
				class="suspend-reasons"
				.expanded=${this.showSuspendPanel}
				alignment="right"
			>
				<capitec-group
					class="header-group-suspend ${this.showNoReasonSelectedNotification ? `header-suspend-error` : ``}"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="icon-warning" size="medium" icon=${this.showNoReasonSelectedNotification ? `status/info-trans` : `status/warning-trans`}></capitec-icon>
					<capitec-label class="header-label" type="Strong" label="Suspend Security Token"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="icon-close" size="small" icon="system/close-action" @click="${() => this._onToggleSuspendPanelClick()}"></capitec-icon>
				</capitec-group>

				${this._renderClientNotification()}
				${this._renderNoReasonSelectedNotification()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					<capitec-label
						class="header-label"
						type="Strong"
						data-automation-id=""
						label="Reasons to suspend"
						value=""
					></capitec-label>

					<capitec-radio-group
						label="Radio group label"
					>
						<capitec-radio
							id="stolen"
							class="radio-button-label"
							data-automation-id="suspend-reason-stolen"
							label=${SUSPEND_REASONS.STOLEN}
							?checked=${this.selectedReason === SUSPEND_REASONS.STOLEN || ``}
							@value-changed="${(e) => this._onSelectedReasonChanged(e)}"
						></capitec-radio>

						<capitec-radio
							id="lost"
							class="radio-button-label"
							data-automation-id="suspend-reason-lost"
							label=${SUSPEND_REASONS.LOST}
							?checked=${this.selectedReason === SUSPEND_REASONS.LOST || ``}
							@value-changed="${(e) => this._onSelectedReasonChanged(e)}"
						></capitec-radio>

						<capitec-radio
							id="faulty"
							class="radio-button-label"
							data-automation-id="suspend-reason-faulty"
							label=${SUSPEND_REASONS.FAULTY}
							?checked=${this.selectedReason === SUSPEND_REASONS.FAULTY || ``}
							@value-changed="${(e) => this._onSelectedReasonChanged(e)}"
						></capitec-radio>

						<capitec-radio
							id="serviceCancellation"
							class="radio-button-label"
							data-automation-id="suspend-reason-service-cancellation"
							label=${SUSPEND_REASONS.SERVICE_CANCELLATION}
							?checked=${this.selectedReason === SUSPEND_REASONS.SERVICE_CANCELLATION || ``}
							@value-changed="${(e) => this._onSelectedReasonChanged(e)}"
						></capitec-radio>
					</capitec-radio-group>

					<capitec-button
						type="primary"
						label="Suspend Security Token"	
						@click="${() => this._onSuspendSecurityTokenClick()}"
					></capitec-button>
					<capitec-button
						label="Cancel"
						@click="${() => this._onToggleSuspendPanelClick()}"
					></capitec-button>

				</capitec-content-box>

			</capitec-side-sheet>
		`;
	}

	_renderToast() {
		return html`
			<capitec-toast
				type="${this.toastType}"
				header="${this.toastHeader}"
				detail="${this.toastDetail}"
				?hidden="${!this.displayToast}"
				@click="${() => this.displayToast = false}"
				closable
			></capitec-toast>
		`;
	}

	_renderClientNotification() {
		return this.showClientNotification ? html`
			<capitec-alert-banner
				type="warning"
				class="notify-banner"
				label=""
				layout="vertical">
				<b>Notify client:</b> <br/>
				<p>A fee will be charged to activate a new security token.</p>
				<capitec-hyperlink
					href="https://www.capitecbank.co.za/global-one/transact/fees/"
					target="_blank"
					label="View fees"
					inline
				></capitec-hyperlink>
			</capitec-alert-banner>
		` : html``;
	}

	_renderSuspendedNotification() {
		return this.isTokenSuspended ? html`
			<capitec-alert-banner
				type="info"
				class="suspend-banner"
				label=""
				layout="vertical">
				<p><b>Internet security token suspended.</b></p>
				<p>To access internet banking you will to register on the App.</p>
				<capitec-spacer></capitec-spacer>
				<p>Please visit a branch to request a new securtiy token.</p>
			</capitec-alert-banner>
		` : html``;
	}

	_renderNoReasonSelectedNotification() {
		return this.showNoReasonSelectedNotification ? html`
			<capitec-alert-banner
				type="info"
				label=""
				layout="vertical">
				<b>Notice:</b> <br/>
				<p>Please choose a reason to suspend.</p>
			</capitec-alert-banner>
		` : html``;
	}
}

customElements.define('capitec-pc-internet-banking-profile-details', InternetBankingProfileDetails);