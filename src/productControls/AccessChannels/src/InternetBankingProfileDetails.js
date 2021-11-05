import { Component, css, html } from 'platform/elements';

import 'platform/components';

const SUSPEND_REASONS = {
	STOLEN: "Stolen",
	LOST: "Lost",
	FAULTY: "Faulty",
	SERVICE_CANCELLATION: "Service cancellation"
}

export class InternetBankingProfileDetails  extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		// input properties
		this.reasonForSuspending = "Lost";
		this.userName = "1281243122";
		this.tokenSerialNumber = "90876375849";
		this.cellphone = "082 555 9090";
		this.dateRegistered = new Date().toISOString();
		this.lastInteractionDate = new Date().toISOString();
		this.lastUpdated = new Date().toISOString();

		// internal props
		this.isInternetBankingActive = true;
		this.displayToast = false;
		this.displaySuspendToast = false;
		this.toastType = "error";
		this.showSuspendPanel = false;
		this.isTokenSuspended = false;

		this.selectedReason = ``;
		this.showNoReasonSelectedNotification = false;
		this.showClientNotification = true;
	}

	// --------------
	// PROPERTIES
	// --------------

	static get properties() {
		return {
			// input properties
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
			selectedReason: { type: String },

			// internal props
			isInternetBankingActive: { state: true },
			showSideSheet: { state: true },
			displayToast: { state: true },
			displaySuspendToast: { state: true },
			showSuspendPanel: { state: true },
			isTokenSuspended: { state: true },
			showNoReasonSelectedNotification: { state: true },
			showClientNotification: { state: true }
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
			this._displayTokenResetSuccessToast();
		}
	}

	async _onSuspendSecurityTokenClick() {
		if(this.selectedReason) {
			var suspendResult = await this.suspendInternetBankingSecurityToken();
			if(suspendResult) {

				this.showSuspendPanel = !this.showSuspendPanel;
				this.isTokenSuspended = true;
				this.isInternetBankingActive = false;
				this._displayTokenSuspendSuccessToast();
				//this._renderSuspendedNotification();
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

	_displayTokenResetSuccessToast() {
		this.displayToast = true;
		this._renderTokenResetSuccessToast();
		window.setTimeout(() => this.displayToast = false, 3000);
	}

	_displayTokenSuspendSuccessToast() {
		this.displaySuspendToast = true;
		this._renderTokenSuspendSuccessToast();
		window.setTimeout(() => this.displaySuspendToast = false, 3000);
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

				.side-panel-header {
					height: 64px;
					width: 344px;
					padding: 0px 24px;
					border-bottom: 1px solid #E1E1E1;
				}

				.side-panel-header-icon {
					--theme-icon-size-medium: 25px;
   					margin-right: 20px;
				}

				.side-panel-header-label {
					height: 20px;
					line-height: 20px;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}

				.side-panel-header-close-icon {
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
					--horizon-label-value-color: #72B004;
				}

				.content-box > horizon-label[value="Suspended"] {
					--horizon-label-value-color: #A5132A;
				}

				.content-box > capitec-button {
					width: 296px;
					margin-top: 24px;
					--theme-button-font-weight: 600;
				}

				/* Suspend Side Panel */
				.side-panel-header-suspend {
					background-color: rgba(212, 120, 28, 0.15);
				}

				.side-panel-header-suspend-error {
					background-color: #F7E2E1;
				}

				.reason-to-suspend-label {
					margin: 8px 0px 14px 0px;
					--theme-label-strong-font-size: 16px;
					height: 24px;
  					width: 140px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				capitec-radio-group {
					--theme-buttonbar-item-gap: 14px;
				}

				capitec-radio-group > capitec-radio {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 15px;
					--theme-label-font-weight: 500;
					letter-spacing: 0;
					line-height: 20px;
				}

				/* Notifications */
				.token-reset-toast-success {
					--theme-toast-height: 106px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}

				.token-suspend-toast-success {
					--theme-toast-height: 186px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
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

				capitec-alert-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 84px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}

				capitec-alert-banner > capitec-hyperlink {
					--theme-hyperlink-font-size: 14px;

				}

				capitec-alert-banner > p {
					margin: 0px;
    				padding-right: 33px;
					height: 40px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 14px;
					letter-spacing: 0;
					line-height: 20px;
				}

				.client-notify-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 105px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}

				.token-suspend-banner {
					margin: 8px 8px 0px 8px;
					--theme-alert-banner-height: 144px;
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
					
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
					class="side-panel-header"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-icon" size="medium" icon="system/access"></capitec-icon>
					<capitec-label class="side-panel-header-label" type="Strong" label="Internet Banking"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-header-close-icon" size="small" icon="system/close-action" @click="${() => this._toggleInternetBankingPanel()}"></capitec-icon>
				</capitec-group>

				${this._renderTokenResetSuccessToast()}
				${this._renderTokenSuspendSuccessToast()}
				${this._renderTokenSuspendedNotification()}
				${this._renderSuspendPanel()}

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
						?hidden=${this.isTokenSuspended}
						@click="${() => this._onResetSecurityTokenClockClick()}"
					></capitec-button>
					<capitec-button
						label="Suspend Security Token"
						?hidden=${this.isTokenSuspended}
						@click="${() => this._onToggleSuspendPanelClick()}"
					></capitec-button>

				</capitec-content-box>

			</capitec-side-sheet>
		`;
	}

	_renderSuspendPanel() {
		return html`
			<capitec-side-sheet
				.expanded=${this.showSuspendPanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header side-panel-header-suspend ${this.showNoReasonSelectedNotification ? `side-panel-header-suspend-error` : ``}"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-icon" size="medium" icon=${this.showNoReasonSelectedNotification ? `status/error-trans` : `status/warning-trans`}></capitec-icon>
					<capitec-label class="side-panel-header-label" type="Strong" label="Suspend Security Token"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onToggleSuspendPanelClick()}"></capitec-icon>
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
						class="reason-to-suspend-label"
						type="subtitle"
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

	_renderTokenResetSuccessToast() {
		return html`
			<capitec-toast
				class="token-reset-toast-success"
				type="success"
				header="Successful!"
				detail="Security token was reset. You can now log in again. ${this.lastUpdated}"
				?hidden="${!this.displayToast}"
				@click="${() => this.displayToast = false}"
				?closable=false
			></capitec-toast>
		`;
	}

	_renderTokenSuspendSuccessToast() {
		return html`
			<capitec-toast
				class="token-suspend-toast-success"
				type="success"
				header="Successful!"
				detail="Internet security token was suspended. To access internet banking you will need to register on the App. ${this.lastUpdated}"
				?hidden="${!this.displaySuspendToast}"
				@click="${() => this.displaySuspendToast = false}"
				?closable=false
			></capitec-toast>
		`;
	}

	_renderClientNotification() {
		return this.showClientNotification ? html`
			<capitec-alert-banner
				type="warning"
				class="client-notify-banner"
				label=""
				layout="vertical">
				<p><b>Notify client:</b><br>A fee will be charged to activate a new security token.</p>
				<br>
				<capitec-hyperlink
					href="https://www.capitecbank.co.za/global-one/transact/fees/"
					target="_blank"
					label="View fees"
					inline
				></capitec-hyperlink>
			</capitec-alert-banner>
		` : html``;
	}

	_renderTokenSuspendedNotification() {
		return this.isTokenSuspended ? html`
			<capitec-alert-banner
				type="error"
				class="token-suspend-banner"
				label=""
				layout="vertical">
				<p><b>Internet security token suspended.</b><br>To access internet banking you will need to register on the App.</p>
				<capitec-spacer></capitec-spacer>
				<capitec-spacer></capitec-spacer>
				<p>Please visit a branch to request a new securtiy token.</p>
			</capitec-alert-banner>
		` : html``;
	}

	_renderNoReasonSelectedNotification() {
		return this.showNoReasonSelectedNotification ? html`
			<capitec-alert-banner
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<b>Notice:</b> <br/>
				<p>Please choose a reason to suspend.</p>
			</capitec-alert-banner>
		` : html``;
	}
}

customElements.define('capitec-pc-internet-banking-profile-details', InternetBankingProfileDetails);