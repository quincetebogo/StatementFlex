import { Component, css, html } from 'platform/elements';

import 'platform/components';

const SUSPEND_REASONS = {
	STOLEN: "Stolen",
	LOST: "Lost",
	FAULTY: "Faulty",
	SERVICE_CANCELLATION: "Service cancellation"
}

const RENDER_MODE = {
	CLIENT_TOKENS: 1,
	SUSPEND_REASONS: 2
};

/**
 * Internet Banking profile Details component is used to show client's information and Suspend/Unsuspend Security Tokens.
 * This component is envoked from Access Channels component
 * 
 * Events Raised 
 * -------------
 * close-side-sheet
 *  
 * @export
 * @class InternetBankingProfileDetails
 * @extends {Component}
 */
export class InternetBankingProfileDetails  extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		// input properties
		this.selectedTokens = [];

		// internal props
		this.isInternetBankingActive = true;
		this.displayToast = false;
		this.displaySuspendToast = false;
		this.showSuspendPanel = false;
		this.showResetTokenPanel = false;
		this.isTokenSuspended = false;

		this.selectedReason = ``;
		this.showNoReasonSelectedNotification = false;

		this.renderMode = RENDER_MODE.CLIENT_TOKENS;
		this.isMultipleDevices = true;
		this.isIndeterminate = false;

		//this.renderMode = RENDER_MODE.SUSPEND_REASONS;
		//this.isMultipleDevices = false;

		this.clientTokens = [{token: "90876375849", selected: false}, {token: "123476375849", selected: false}, {token: "019836375849", selected: false}, {token: "23776375849", selected: false}];
		this.isSuspendReasonSelected = false;
		this.isTokenSelected = false;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @callback suspendInternetBankingSecurityToken
	 * @returns {_suspendInternetBankingSecurityTokenCallback} - Success or failure response from suspend Internet Banking Security Token channel service call
	 */

	/**
	 * @callback unSuspendInternetBankingSecurityToken
	 * @returns {_unSuspendInternetBankingSecurityToken} - Success or failure response from Unsuspend Internet Banking Security Token channel service call

	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [internetBankingDetails] - Internet Banking profile details
	 * @property {Boolean} [showSuspendReasons] - To toggle suspend reasons side sheet component
	 * @property {String} [selectedReason] - Holds value of the selected suspend reason
	 * @property {Array} [selectedTokens] - Holds a list of tokens selected to suspend
	 * @property {Boolean} [displayToast] - To hide or show the successful Toast
	 * @property {Boolean} [showValidationBanner] - To hide or show the suspend reason validation banner on error 
	 * 
	 * @property {suspendInternetBankingSecurityToken} suspendInternetBankingSecurityToken Callback function to suspend Internet Banking Security Token
	 * @property {unSuspendInternetBankingSecurityToken} unSuspendInternetBankingSecurityToken Callback function to Unsuspend Internet Banking Security Token
	 * 
	 */

	static get properties() {
		return {
			// input properties
			internetBankingDetails: { type: Object },
			selectedReason: { type: String },
			selectedTokens: { type: Object },
			showSideSheet: { type: Boolean },

			suspendInternetBankingSecurityToken: { type: Object, attribute: false },
			unSuspendInternetBankingSecurityToken: { type: Object, attribute: false },

			// internal props
			isInternetBankingActive: { state: true },
			showSideSheet: { state: true },
			displayToast: { state: true },
			displaySuspendToast: { state: true },
			showSuspendPanel: { state: true },
			showResetTokenPanel: { state: true },
			isTokenSuspended: { state: true },
			showNoReasonSelectedNotification: { state: true },

			isMultipleDevices: { state: true},
			renderMode: { type: Boolean, attribute: false },
			isIndeterminate: { state: true},

			clientTokens: { type: Array },
			isTokenSelected: { state: true },
			isSuspendReasonSelected: { state: true }
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

	_onToggleSuspendPanelClick() {
		this.showSuspendPanel = !this.showSuspendPanel;
		this.showNoReasonSelectedNotification = false;
		this.selectedReason = ``;
		this.isTokenSuspended = false;
		if(!this.isMultipleDevices && this.showSuspendPanel) {
			this._renderSuspendPanel();
		}
		else {
			this._renderMultipleDevicesSuspendPanel();
		}

		this.isIndeterminate = false;
		this.isTokenSelected = false;
		this.selectedTokens = [];
		this.renderMode = RENDER_MODE.CLIENT_TOKENS;
		this.selectAll = false;
		this.clientTokens.forEach(item => {
			if(item.selected) {
				item.selected = false;
			}
		});
	}

	_onToggleResetPanelClick() {
		this.showResetTokenPanel = !this.showResetTokenPanel;
		this.selectedTokens = [];
	}

	async _onResetSecurityTokenClockClick() {
		if(this.isMultipleDevices) {
			this.showResetTokenPanel = !this.showResetTokenPanel;
			this._renderMultipleDevicesResetTokenPanel();
		}
		else {
			const unSuspendResult = await this.unSuspendInternetBankingSecurityToken();
			if(unSuspendResult) {
				this._displayTokenResetSuccessToast();
			}
		}
		
	}

	async _onMultipleTokensResetBtnClick() {
		if(this.selectedTokens.length > 0) {
			const unSuspendResult = await this.unSuspendInternetBankingSecurityToken();
			if(unSuspendResult) {
				if(this.isMultipleDevices) {
					this.showResetTokenPanel = !this.showResetTokenPanel;
					this._displayTokenResetSuccessToast();
				}
			}
		}
	}

	async _onSuspendSecurityTokenClick() {
		if(this.selectedReason) {
			const suspendResult = await this.suspendInternetBankingSecurityToken();
			if(suspendResult) {
				this.showSuspendPanel = !this.showSuspendPanel;
				this.isTokenSuspended = true;
				this.isInternetBankingActive = false;
				this._displayTokenSuspendSuccessToast();
			}
		}
		else {
			this.showNoReasonSelectedNotification = true;
		}
	}

	_onNextBtnClick() {
		if(this.selectedTokens.length > 0) {
			this.renderMode = RENDER_MODE.SUSPEND_REASONS;
		}
		else {
			this.renderMode = RENDER_MODE.CLIENT_TOKENS;
		}
	}

	_onBackBtnClick() {
		this.renderMode = RENDER_MODE.CLIENT_TOKENS;
		if(this.selectedTokens.length === 0) {
			this.isTokenSelected = false;
			this.isIndeterminate = false;
		}

		/*
		else {
			const tokenChecks = this.shadowRoot.querySelectorAll(`.token`);
			tokenChecks.forEach(token => {
				if(this.selectedTokens.includes(token.label) && !token.checked) {
					token.dispatchEvent(new CustomEvent(`click`, {}));
				}
			});
		}
		*/
	}

	_onValueChange(event, item) {
		if(event.detail.new) {
			if(!this.selectedTokens.includes(event.currentTarget.label)) {
				this.selectedTokens.push(event.currentTarget.label);
			}
			item.selected = true;
			this.isTokenSelected = true;
			this.isIndeterminate = true;
		}
		else {
			item.selected = false;
			this.selectedTokens = this.selectedTokens.filter(token => token !== event.currentTarget.label);
			if(this.selectedTokens.length === 0) {
				this.isTokenSelected = false;
				this.isIndeterminate = false;
			}
		}
	}

	_onSelectAllChange(event) {
		const tokenChecks = this.shadowRoot.querySelectorAll(`.token`);
		if(event.detail.new) {
			if(tokenChecks.length > 0) {
				tokenChecks.forEach(token => {
					if(!token.checked) {
						token.dispatchEvent(new CustomEvent(`click`, {}));
					}
				});
			}
			this.selectAll = true;
			this.isIndeterminate = false;
		}
		else {
			this.selectAll = false;
			if(tokenChecks.length > 0) {
				tokenChecks.forEach(token => {
					if(token.checked) {
						token.dispatchEvent(new CustomEvent(`click`, {}));
					}
				});
			}
		}
	}

	_onSelectedReasonChanged(event) {
		if(event.detail.new) {
			this.showNoReasonSelectedNotification = false;
			this.selectedReason = event.currentTarget.label;
			this.isSuspendReasonSelected = true;
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

	_formatDate(dateToFormat) {
        const stringToDate = new Date(dateToFormat);
        const tempdate = stringToDate.toGMTString().substr(5, 11);
		return tempdate;
	}

	_formatTime(timeToFormat) {
		const formatedDate = new Date(timeToFormat);
		const localTime = formatedDate.toLocaleTimeString()
		return localTime.replace(localTime.slice(-6,-2), '')
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

				.side-panel-sheet {
					--theme-side-sheet-top: 104px;
					--theme-modal-screen-background-color: transparent;
					border-start-start-radius: 4px;
				}

				.side-panel-sheet-header {
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

				/* Multiple Devices - Suspend security token */
				.side-panel-header-reset-token {
					height: 56px;
					width: 342px;
    				padding: 0px 24px;
					border-radius: 4px 0 0 0;
					background-color: #F5F5F5;
				}

				.side-panel-header-suspend {
					height: 56px;
    				padding: 0px 24px;
					border-start-start-radius: 4px;
					background-color: rgba(212, 120, 28, 0.15);
					border-bottom: 1px solid #E1E1E1;
				}
				
				.side-panel-header-suspend-error {
					background-color: #F7E2E1;
				}

				.side-panel-header-suspend-icon {
					--theme-icon-size-medium: 25px;
					margin-right: 8px;
				}

				.side-panel-stepper {
					height: 56px;
					width: 344px;
					border-bottom: 1px solid #E1E1E1;
				
					padding: 0px 24px;
				
					display: inline-flex;
					flex-direction: row;
					background-color: transparent;

					justify-content: left;
				}


				.side-panel-stepper-group > capitec-label {
					font-family: "Hind Vadodara";
					letter-spacing: 0;
					--theme-layout-gap-spacing: 0px;
					--theme-label-font-color: #3A3A3A;
				}

				.step-count-label {
					height: 12px;
					width: 65px;
					line-height: 12px;
					--theme-label-strong-font-size: 12px;
				}

				.step-label {
					height: 20px;
					width: 262px;
					line-height: 20px;
					padding-top: 5px;
					--theme-label-strong-font-size: 15px;
					--theme-label-strong-font-weight: 600;
				}
				
				.side-panel-stepper > capitec-group {
					padding: 11px 0px 11px 11px;
					height: 34px;
				}

				capitec-badge {
					--theme-badge-number-color: #009DE0;
					--theme-badge-line-height: 20px;
					--theme-badge-font-weight: 600;
					box-sizing: border-box;
					border-radius: 50%;
					background-color: transparent;
					/*margin: 16.25px 0px;*/
					margin: 16.25px 0px 0px 0px;
				}
				
				.side-panel-stepper > p {
					width: 262px;
				}
				
				.step-todo {
					border: 2px solid #009DE0;
				}
				
				.step-success {
					border: 2px solid #70AF00;
				}
				
				.label-strong {
					font-size: 15px;
					font-weight: 600;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
				}

				capitec-check-group {
					width: 366px;
					height: 168px;
				}
				
				capitec-check-group > capitec-check {
					height: 24px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin: 8px 0px;
				}

				/* Multiple Devices - Suspend Reasons */

				capitec-alert-banner {
					margin: 8px 8px 0px 8px;
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
					--theme-alert-banner-height: 105px;
					--theme-alert-banner-width: 328px;
				}

				.reason-to-suspend-label {
					margin: 8px 0px 14px 0px;
					--theme-label-strong-font-size: 16px;
					height: 24px;
					width: 216px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
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

				.token-reset-toast-success {
					--theme-toast-height: 146px;
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}
				
				.token-suspend-toast-success {
					--theme-toast-height: 186px;
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}

				.token-suspend-banner {
					--theme-alert-banner-height: 144px;
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
		const formatedUpdatedDateTime = this._formatDate(this.internetBankingDetails.dateLastUpdated) + `, ` + this._formatTime(this.internetBankingDetails.dateLastUpdated);
		const formatedRegisteredDateTime = this._formatDate(this.internetBankingDetails.dateRegistered) + `, ` + this._formatTime(this.internetBankingDetails.dateRegistered);
		
		return html`
			<capitec-side-sheet
				.expanded=${this.showSideSheet}
				alignment="right"
			>
				<capitec-group
					class="side-panel-sheet-header"
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
				${this._renderMultipleDevicesSuspendPanel()}
				${this._renderMultipleDevicesResetTokenPanel()}

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
						value="${this.internetBankingDetails.userName}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Token serial number"
						value="${this.internetBankingDetails.tokenSerialNumber}"
						style="display:${this.isMultipleDevices === false ? `block` : `none`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Date registered"
						value="${formatedRegisteredDateTime}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Cellphone number (verified)"
						value="082 555 9090"
						style="display:${this.isMultipleDevices ? `block` : `none`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Last interaction date"
						value="${this._formatDate(this.internetBankingDetails.dateRegistered)}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Status"
						value="${this.isInternetBankingActive ? `Active` : `Suspended`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Last updated"
						value="${formatedUpdatedDateTime}"
						style="display:${this.isInternetBankingActive ? `none` : `block`}"
					></horizon-label>

					<horizon-label
						data-automation-id=""
						label="Reason for suspending"
						value="${this.internetBankingDetails.reasonForSuspending}"
						style="display:${this.isInternetBankingActive ? `none` : `block`}"
					></horizon-label>

					<!-- Main Panel -->
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
		return this.isMultipleDevices ? html`` : html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showSuspendPanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header-suspend ${this.showNoReasonSelectedNotification ? `side-panel-header-suspend-error` : ``}"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-icon" size="medium" icon=${this.showNoReasonSelectedNotification ? `status/error-trans` : `status/warning-trans`}></capitec-icon>
					<capitec-label class="side-panel-header-label" type="Strong" label="Suspend Security Token"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onToggleSuspendPanelClick()}"></capitec-icon>
				</capitec-group>

				${this._renderSuspendReasons()}

				</capitec-content-box>

			</capitec-side-sheet>
		`;
	}

	_renderSuspendReasons() {
		return this.renderMode === RENDER_MODE.SUSPEND_REASONS ? html`
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

					<!-- Suspend Reasons Panel -->
					<capitec-button
						type="primary"
						label="Suspend Security Token"	
						@click="${() => this._onSuspendSecurityTokenClick()}"
					></capitec-button>
					<capitec-button
						label="Back"
						@click="${() => this._onBackBtnClick()}"
						?hidden=${this.isMultipleDevices === false}
					></capitec-button>
					<capitec-button
						label="Cancel"
						@click="${() => this._onToggleSuspendPanelClick()}"
						?hidden=${this.isMultipleDevices === true}
					></capitec-button>
				</capitec-content-box>
		` : html``;
	}

	_renderClientTokens() {
		return this.renderMode === RENDER_MODE.CLIENT_TOKENS ? html`

			<capitec-check-group class="check-group">
				<capitec-check 
					label="Select all"
					class="token-select-all"
					?checked = ${this.selectAll}
					?disabled = ${this.disabled}
					?indeterminate = ${this.isIndeterminate}
					@value-changed="${(e) => this._onSelectAllChange(e)}"></capitec-check>

				${this.clientTokens.map(item => this.renderCheck(item))}
			</capitec-check-group>

			<!-- Multiple Client Tokens -->
			<capitec-button
				type="primary"
				label="Next"	
				@click="${() => this._onNextBtnClick()}"
				?hidden=${this.showResetTokenPanel}
			></capitec-button>
			<capitec-button
				label="Cancel"
				@click="${() => this._onToggleSuspendPanelClick()}"
				?hidden=${this.showResetTokenPanel}
			></capitec-button>

		` : html``;
	}

	renderCheck(item) {
		return html`
			<capitec-check 
				label=${item.token}
				class="token"
				?checked = ${item.selected}
				?disabled = ${this.disabled}
				@value-changed="${(e) => this._onValueChange(e, item)}"></capitec-check>
		`;
	}

	_renderMultipleDevicesSuspendPanel() {
		return this.isMultipleDevices ? html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showSuspendPanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header-suspend ${this.showNoReasonSelectedNotification ? `side-panel-header-suspend-error` : ``}"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-suspend-icon" size="medium" icon=${this.showNoReasonSelectedNotification ? `status/error-trans` : `status/warning-trans`}></capitec-icon>
					<capitec-label class="side-panel-header-label" type="Strong" label="Suspend Security Token"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onToggleSuspendPanelClick()}"></capitec-icon>
				</capitec-group>

				${this._renderMulitpleDevicesStepper()}
				${this._renderSuspendReasons()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none"
				>
					${this._renderClientTokens()}
				</capitec-content-box>

			</capitec-side-sheet>
		` : html``;
	}

	_renderMulitpleDevicesStepper() {
		return this.renderMode === RENDER_MODE.CLIENT_TOKENS ? html`
			<capitec-content-box
				class="side-panel-stepper"
				halign="left"
				valign="center"
				gap="none">
				<capitec-badge class="${this.isTokenSelected ? `step-success` : `step-todo`}" number="1" iconSize="medium" color="#FFFFFF" icon="${this.isTokenSelected ? `status/success-trans`:``}"></capitec-badge>
				<capitec-group class="side-panel-stepper-group">
					<capitec-label class="step-count-label" label="Step 1 of 2"></capitec-label>
					<capitec-label class="step-label label-strong" type="strong" label="Choose security token to be suspended"></capitec-label>
				</capitec-group>
			</capitec-content-box>
		` : html`
			<capitec-content-box
				class="side-panel-stepper"
				halign="left"
				valign="center"
				gap="none">
				<capitec-badge class="${this.isSuspendReasonSelected ? `step-success` : `step-todo`}" number="2" iconSize="medium" color="#FFFFFF" icon="${this.isSuspendReasonSelected ? `status/success-trans`:``}"></capitec-badge>
				<capitec-group class="side-panel-stepper-group">
					<capitec-label label="Step 2 of 2"></capitec-label>
					<capitec-label class="label-strong" type="strong" label="Choose a reason to suspend"></capitec-label>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderMultipleDevicesResetTokenPanel() {
		return this.isMultipleDevices ? html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showResetTokenPanel}
				alignment="right"
			>
				<capitec-group
					class="side-panel-header-reset-token"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-label class="side-panel-header-label" type="Strong" label="Reset Security Token Clock"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="small" icon="system/close-action" @click="${() => this._onToggleResetPanelClick()}"></capitec-icon>
				</capitec-group>

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
						label="Choose security token to reset"
						value=""
					></capitec-label>

					${this._renderClientTokens()}

					<!-- Multiple Client Tokens -->
					<capitec-button
						type="primary"
						label="Reset Security Token Clock"	
						@click="${() => this._onMultipleTokensResetBtnClick()}"
					></capitec-button>
					<capitec-button
						label="Cancel"
						@click="${() => this._onToggleResetPanelClick()}"
					></capitec-button>
				</capitec-content-box>

			</capitec-side-sheet>
		` : html``;
	}

	_renderTokenResetSuccessToast() {
		return html`
			<capitec-toast
				class="token-reset-toast-success"
				type="success"
				header="Successful!"
				detail="Security token was reset. &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp You can now log in again. &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp ${this._formatDate(this.internetBankingDetails.dateLastUpdated)}"
				?hidden="${!this.displayToast}"
				@click="${() => this.displayToast = false}"
				?closable=false
			></capitec-toast>
		`;
	}

	_renderTokenSuspendSuccessToast() {
		const formatedUpdatedDate = this._formatDate(this.internetBankingDetails.dateLastUpdated) + `, ` + this._formatTime(this.internetBankingDetails.dateLastUpdated);

		return html`
			<capitec-toast
				class="token-suspend-toast-success"
				type="success"
				header="Successful!"
				detail="Internet security token was suspended. &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp To access internet banking you will need to register on the App. &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp &nbsp ${formatedUpdatedDate}"
				?hidden="${!this.displaySuspendToast}"
				@click="${() => this.displaySuspendToast = false}"
				?closable=false
			></capitec-toast>
		`;
	}

	_renderClientNotification() {
		return this.showNoReasonSelectedNotification ? html`` : html`
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
		`;
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