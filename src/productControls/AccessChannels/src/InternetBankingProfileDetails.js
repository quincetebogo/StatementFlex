import { ACCESS_CHANNEL_STATUS, parseHTMLtoDOM } from './Constants';
import { Component, css, html } from 'platform/elements';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonLabel';
import 'app/webComponents/src/SideSheet';
import 'platform/components';

const SUSPEND_REASONS = {
	STOLEN: `Stolen`,
	LOST: `Lost`,
	FAULTY: `Faulty`,
	SERVICE_CANCELLATION: `ServiceCanceled`
};

const RENDER_STEPPER_MODE = {
	NONE: 0,
	CLIENT_TOKENS: 1,
	SUSPEND_REASONS: 2
};

const RENDER_MODE = {
	NONE: 0,
	SINGLE_TOKEN: 1,
	MULTIPLE_TOKEN: 2
};


/**
 * Internet Banking profile Details component is used to show client's information and Suspend/Reset Security Tokens.
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

export class InternetBankingProfileDetails extends Component {

	// -----------------
	// INITIALISATION
	// -----------------

	constructor() {
		super();

		// input properties
		this.showSideSheet = false;
		this.isVerifiedClient = false;

		// internal props
		this.selectedTokens = [];
		this.showSuspendPanel = false;
		this.showResetTokenPanel = false;
		this.isTokenSuspended = false;

		this.selectedReason = ``;
		this.showNoReasonSelectedNotification = false;

		this.renderMode = RENDER_MODE.NONE;
		this.renderStepperMode = RENDER_STEPPER_MODE.NONE;
		this.isIndeterminate = false;

		this.clientTokens = [];
		this.isSuspendReasonSelected = false;
		this.isTokenSelected = false;
		this.singleToken = ``;
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @callback suspendInternetBankingSecurityToken
	 * @returns {suspendInternetBankingSecurityTokenCallback} - Success or failure response from Suspend Internet Banking Security Token channel service call
	 */

	/**
	 * @callback resetInternetBankingSecurityToken
	 * @returns {resetInternetBankingSecurityTokenCallback} - Success or failure response from Reset Internet Banking Security Token channel service call

	 * 
	 * @property {Boolean} [showSideSheet] - To toggle Side sheet component
	 * @property {Object} [internetBankingDetails] - Internet Banking profile details
	 * @property {Boolean} [showSuspendReasons] - To toggle suspend reasons side sheet component
	 * @property {String} [selectedReason] - Holds value of the selected suspend reason
	 * @property {Array} [selectedTokens] - Holds a list of tokens selected to suspend
	 * @property {Boolean} [showValidationBanner] - To hide or show the suspend reason validation banner on error 
	 * 
	 * @property {suspendInternetBankingSecurityTokenCallback} suspendInternetBankingSecurityToken Callback function to suspend Internet Banking Security Token
	 * @property {resetInternetBankingSecurityTokenCallback} resetInternetBankingSecurityToken Callback function to Reset Internet Banking Security Token
	 * @property {getClientTokensCallback} getClientTokens Callback function to get Internet Banking Security Tokens
	 * 
	 */

	static get properties() {
		return {
			// input properties
			internetBankingDetails: { type: Object },
			showSideSheet: { type: Boolean },
			verifiedNumber: { type: String },
			clientTokens: { type: Object },
			singleToken: { type: String },
			isVerifiedClient: { type: Boolean },

			// callback functions
			suspendInternetBankingSecurityToken: { type: Object, attribute: false },
			resetInternetBankingSecurityToken: { type: Object, attribute: false },
			getClientTokens: { type: Object, attribute: false },

			// internal prop
			selectedReason: { type: String },
			selectedTokens: { type: Object },
			renderMode: { type: Boolean, attribute: false },
			renderStepperMode: { type: Boolean, attribute: false },
			isInternetBankingActive: { type: Boolean, attribute: false },
			isTokenSuspended: { type: Boolean, attribute: false },

			isIndeterminate: { type: Boolean, attribute: false },
			showNoReasonSelectedNotification: { type: Boolean, attribute: false },
			showResetTokenPanel: { type: Boolean, attribute: false }
		};
	}

	get resetSuccessToast() {
		const formatedUpdatedDate = `${this._getFormattedDateTime(this.internetBankingDetails.dateLastUpdated)}`;

		return `<capitec-label label="Security token was reset."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="You can now log in again."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${formatedUpdatedDate}" type="subtitle"></capitec-label>`;
	}

	get resetUnSuccessToast() {
		return `<capitec-label label="Security token clock did not reset."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
	}

	get suspendSuccessToast() {
		const formatedUpdatedDate = `${this._getFormattedDateTime(this.internetBankingDetails.dateLastUpdated)}`;

		return `<capitec-label label="Internet security token was suspended."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="To access internet banking you will need to register on the App."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="${formatedUpdatedDate}" type="subtitle"></capitec-label>`;
	}

	get suspendUnsuccessToast() {
		return `<capitec-label label="Internet security token was not suspended."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label label="Try again"></capitec-label>`;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	async connectedCallback() {
		super.connectedCallback();

		this.tokenList = await this.getClientTokens(this.internetBankingDetails.userRegNo);

		if (this.tokenList.tokens !== null) {
			this.tokenList.tokens.forEach(item => {
				if (item.tokenType !== `Soft Token`) {
					const clientToken = {
						token: item.tokenSerialNo,
						selected: false
					};
					this.clientTokens.push(clientToken);
				}
			});
		}

		this.isMultipleDevices = this.clientTokens.length > 1;
		
		if (!this.isMultipleDevices && this.clientTokens.length > 0) {
			this.singleToken = this.clientTokens[0].token;
		}

		this.isInternetBankingActive = this.internetBankingDetails.status === `Active`;
		this.isTokenSuspended = !this.isInternetBankingActive;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeInternetBankingPanel() {
		this.dispatchEvent(new CustomEvent(`close-side-sheet`, { detail: { tileClicked: `internetBanking` } }));
	}

	_resetTokenValues() {
		this.isIndeterminate = false;
		this.selectedTokens = [];
		this.selectAll = false;
		this.clientTokens.forEach(item => {
			if (item.selected) {
				item.selected = false;
			}
		});
	}

	async _onResetSecurityTokenClockClick() {
		if (this.isMultipleDevices) {
			this.showResetTokenPanel = true;

			this._resetTokenValues();

			this.renderMode = RENDER_MODE.MULTIPLE_TOKEN;
			this.renderStepperMode = RENDER_STEPPER_MODE.CLIENT_TOKENS;

			this.dispatchEvent(new CustomEvent(`toggle-token-reset-panel`, { detail: { showResetTokenPanel: this.showResetTokenPanel } }));
		} else {
			this.selectedTokens.push(this.singleToken);
			const resetTokenResult = await this.resetInternetBankingSecurityToken(this.selectedTokens);
			if (resetTokenResult) {
				this._displayTokenResetSuccessToast();
			} else {
				this._displayTokenResetUnsuccessfulToast();
			}

			this.selectedTokens = [];
			this.renderMode = RENDER_MODE.NONE;
			this.renderStepperMode = RENDER_STEPPER_MODE.NONE;
		}
	}
	
	async _onMultipleTokensResetBtnClick() {
		if (this.selectedTokens.length > 0) {
			const resetTokenResult = await this.resetInternetBankingSecurityToken(this.selectedTokens);
			if (resetTokenResult) {
				if (this.isMultipleDevices) {
					this.showResetTokenPanel = !this.showResetTokenPanel;
					this._displayTokenResetSuccessToast();
				}
			} else {
				this._displayTokenResetUnsuccessfulToast();
			}
		}
	}

	async _onSuspendSecurityTokenClick() {
		if (this.selectedReason) {
			const selectedToken = this.isMultipleDevices ? this.selectedTokens : [this.clientTokens[0].token];
			const suspendResult = await this.suspendInternetBankingSecurityToken(this.selectedReason, selectedToken);
			if (suspendResult) {
				this.showSuspendPanel = !this.showSuspendPanel;
				this.isTokenSuspended = true;
				this.isInternetBankingActive = false;
				this.internetBankingDetails.statusReason = this.selectedReason;
				this.internetBankingDetails.dateLastUpdated = new Date().toISOString();
				this._displayTokenSuspendSuccessToast();
            } else {
				this.showSuspendPanel = !this.showSuspendPanel;
				this._displayTokenSuspendUnsuccessToast();
                // unsuccessfull screen

			}
		} else {
			this.showNoReasonSelectedNotification = true;
		}
	}

	_onCloseResetPanelClick() {
		this.showResetTokenPanel = false;
		this._resetTokenValues();

		this.dispatchEvent(new CustomEvent(`toggle-token-reset-panel`, { detail: { showResetTokenPanel: this.showResetTokenPanel } }));
	}

	_onOpenSuspendPanelClick() {
		this.showSuspendPanel = true;

		if (this.isMultipleDevices) {
			this.renderMode = RENDER_MODE.MULTIPLE_TOKEN;
			this.renderStepperMode = RENDER_STEPPER_MODE.CLIENT_TOKENS;

			this.isTokenSelected = false;
			this._resetTokenValues();
		} else {
			this.renderMode = RENDER_MODE.SINGLE_TOKEN;
			this.renderStepperMode = RENDER_STEPPER_MODE.SUSPEND_REASONS;
		}

		this.dispatchEvent(new CustomEvent(`toggle-token-suspend-panel`, { detail: { showSuspendPanel: this.showSuspendPanel } }));
	}

	_onCloseSuspendPanelClick() {
		this.showSuspendPanel = false;
		this.renderMode = RENDER_MODE.NONE;
		this.renderStepperMode = RENDER_STEPPER_MODE.NONE;

		this.showNoReasonSelectedNotification = false;
		this.selectedReason = ``;
		this.isTokenSuspended = false;
		this.selectedTokens = [];

		this.dispatchEvent(new CustomEvent(`toggle-token-suspend-panel`, { detail: { showSuspendPanel: this.showSuspendPanel } }));
	}

	_onSelectedReasonChanged(reason) {
		this.showNoReasonSelectedNotification = false;
		this.selectedReason = reason;
		this.isSuspendReasonSelected = true;
	}

	_onSelectAllChange(event) {
		const tokenChecks = this.shadowRoot.querySelectorAll(`.token`);
		if (event.detail.new) {
			if (tokenChecks.length > 0) {
				tokenChecks.forEach(token => {
					if (!token.checked) {
						token.dispatchEvent(new CustomEvent(`click`, {}));
					}
				});
			}
			this.selectAll = true;
			this.isIndeterminate = false;
		} else {
			this.selectAll = false;
			if (tokenChecks.length > 0) {
				tokenChecks.forEach(token => {
					if (token.checked) {
						token.dispatchEvent(new CustomEvent(`click`, {}));
					}
				});
			}
		}
	}

	_onValueChange(event, item) {
		if (event.detail.new) {
			if (!this.selectedTokens.includes(event.currentTarget.label)) {
				this.selectedTokens.push(event.currentTarget.label);
			}
			item.selected = true;
			this.isTokenSelected = true;
			this.isIndeterminate = true;
		} else {
			item.selected = false;
			this.selectedTokens = this.selectedTokens.filter(token => token !== event.currentTarget.label);
			if (this.selectedTokens.length === 0) {
				this.isTokenSelected = false;
				this.isIndeterminate = false;
			}
		}
	}

	_onNextBtnClick() {
		if (this.selectedTokens.length > 0) {
			this.renderStepperMode = RENDER_STEPPER_MODE.SUSPEND_REASONS;
			this.dispatchEvent(new CustomEvent(`toggle-token-suspend-reasons`, { detail: { selectedTokens: this.selectedTokens } }));
		} else {
			this.renderStepperMode = RENDER_STEPPER_MODE.CLIENT_TOKENS;
		}
	}

	_onBackBtnClick() {
		this.renderStepperMode = RENDER_STEPPER_MODE.CLIENT_TOKENS;
		this.dispatchEvent(new CustomEvent(`toggle-token-suspend-reasons`, { detail: { selectedTokens: null } }));
		if (this.selectedTokens.length === 0) {
			this.isTokenSelected = false;
			this.isIndeterminate = false;
		}
	}

	_closeToast(e) {
		const elementToast = this.shadowRoot.getElementById(e.target.id);
		elementToast.style.display = `none`;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_displayTokenResetSuccessToast() {
		this._setToastDetail(`reset-successToast`, this.resetSuccessToast);
	}

	_displayTokenResetUnsuccessfulToast() {
		this._setToastDetail(`reset-unsuccessToast`, this.resetUnSuccessToast);
	}

	_displayTokenSuspendSuccessToast() {
		this._setToastDetail(`suspend-successToast`, this.suspendSuccessToast);
	}

	_displayTokenSuspendUnsuccessToast() {
		this._setToastDetail(`suspend-unsuccessToast`, this.suspendUnsuccessToast);
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

	_setToastDetail(toastID, toastDetail) {
		const elementToast = this.shadowRoot.getElementById(toastID);
		const detailLabel = elementToast.shadowRoot.querySelector(`label.detail`);

		elementToast.style.display = `block`;
		detailLabel.style.width = `210px`;
		detailLabel.innerHTML = parseHTMLtoDOM(toastDetail);

		window.setTimeout(() => elementToast.style.display = `none`, 3000);
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

				.side-panel-sheet-header {
					height: 64px;
					width: 344px;
					padding: 0px 24px;
					border-bottom: 1px solid #E1E1E1;
				}

				.side-panel-sheet-label {
					height: 20px;
					line-height: 20px;
					--theme-label-strong-font-size: 18px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
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

				.side-panel-close-icon {
					--theme-icon-size-medium: 24px;
					cursor: pointer;
				}

				/* Content box */
				.content-box{
					--theme-container-padding-left: 24px;
					--theme-container-padding-right: 24px;
					--theme-container-padding-top: 7px;
					height: auto;
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
					margin-top: 20px;
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
				
					padding: 0px 0px 0px 24px;
				
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

				.side-panel-stepper-group > capitec-label[type="strong"] {
					line-height: 20px;

					--theme-label-strong-font-size: 15px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #3A3A3A;
				}

				.step-count-label {
					height: 12px;
					width: 65px;
					line-height: 12px;
					--theme-label-default-font-size: 12px;
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
					width: 100%;
					height: auto;
				}
				
				capitec-check-group > capitec-check {
					height: 20px;
					--theme-label-font-color: #3A3A3A;
					--theme-label-font-family: "Hind Vadodara";
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					margin: 16px 0px;
				}

				/* Multiple Devices - Suspend Reasons */

				horizon-alert-banner {
					margin: 8px 8px 0px 8px;
									   
					--theme-alert-banner-icon-margin-left: 16px;
					--theme-alert-banner-icon-margin-right: 16px;
				}

				horizon-alert-banner > capitec-hyperlink {
					margin-top: 5px;
					position: absolute;
					right: 16px;
					bottom: 17px;

					--theme-font-weight: 600;
					--theme-hyperlink-color: #3A3A3A;
					--theme-hyperlink-font-size: 14px;
					text-decoration: underline;
				}
				
				horizon-alert-banner > p {
					margin: 0px;
					padding-right: 33px;
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
				.client-notify-banner > p {
					width: 204px;
					padding-right: 0px;
				}

				.reason-to-suspend-label {
					margin: 4px 0px 12px 0px;
					--theme-label-strong-font-size: 16px;
					height: 24px;
					width: 216px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
				}

				.reset-security-token-label {
					margin: 8px 0px 0px 0px;
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
					--theme-label-font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					margin: 10px 0px;
				}

				capitec-toast {
					--theme-toast-min-width: 312px;
					--theme-toast-max-width: 312px;
					--theme-toast-height: 106px;
					--theme-icon-size-default: 24px;
					--theme-toast-success-color: #3a3a3a;
					--theme-toast-detail-line-height: 20px;
					--theme-label-subtitle-font-size: 14px;
					--theme-label-subtitle-font-weight: 600;

					left: var(--theme-container-padding-left, 16px);
					position: absolute;
					z-index: 100;
					display: none;
				}
				capitec-toast[id="reset-successToast"] {
					--theme-toast-height: 146px;
				}
				capitec-toast[id="suspend-successToast"] {
					--theme-toast-height: 186px;
				}

				.token-reset-toast-success {
					--theme-toast-height: 116px;
					--theme-toast-min-width: 312px;
				}

				.token-reset-toast-unsuccess {
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}

				.token-suspend-toast-unsuccess {
					--theme-toast-height: 124px;
					--theme-toast-min-width: 312px;
					--theme-toast-icon-left: 16px;
					--theme-toast-icon-top: 12px;
				}
				
				.token-suspend-toast-success {
					--theme-toast-height: 136px;
					--theme-toast-icon-top: 12px;
				}

				.token-suspend-banner {
					--theme-alert-banner-height: 144px;
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
			`
		];
	}

	_mobileTemplate() {
		return _webTemplate();
	}

	_webTemplate() {
		return html`
			${this._renderInternetBankingPanel()}
			${this._renderSuspendPanel()}
			${this._renderMultipleDevicesResetTokenPanel()}
		`;
	}

	_renderInternetBankingPanel() {
		return html`
			<capitec-side-sheet
				data-automation-id="internet-banking-main-side-sheet"
				.expanded=${this.showSideSheet}
				alignment="right">
				<capitec-group
					class="side-panel-sheet-header"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-icon class="side-panel-header-icon" size="medium" icon="system/access"></capitec-icon>
					<capitec-label class="side-panel-sheet-label" type="Strong" label="Internet Banking"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="medium" icon="system/close-action" @click="${() => this._closeInternetBankingPanel()}"></capitec-icon>
				</capitec-group>

				${this._renderInternetBankingDetails()}
				
			</capitec-side-sheet>
		`;
	}

	_renderInternetBankingDetails() {

		if (isNullorEmpty(this.internetBankingDetails) || this.internetBankingDetails.status === ACCESS_CHANNEL_STATUS.UNAVAILABLE) {
			return this._renderServiceUnavailable();
		}

		if (this.internetBankingDetails.status === ACCESS_CHANNEL_STATUS.NOTREGISTERED) {
			return this._renderInternetBankingNotRegistered();
		}

		return html`
			${this._renderTokenResetSuccessToast()}
			${this._renderTokenResetUnsuccessfulToast()}
			${this._renderTokenSuspendSuccessToast()}
			${this._renderTokenSuspendUnsuccessToast()}
			${this._renderTokenSuspendedNotification()}

			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<horizon-label
					data-automation-id="internet-banking-username"
					label="Username"
					value="${this.internetBankingDetails.username}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-token-number"
					label="Token serial number"
					value="${this.singleToken}"
					?hidden="${isNullorEmpty(this.singleToken) || !this.isVerifiedClient || this.isMultipleDevices}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-date-registered"
					label="Date registered"
					value="${this._getFormattedDateTime(this.internetBankingDetails.dateRegistered)}"
					?hidden="${!this.isVerifiedClient}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-cellphone-number"
					label="Cellphone number (verified)"
					value="${this.verifiedNumber}"
					?hidden="${!this.isVerifiedClient || this.isMultipleDevices}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-last-used-date"
					label="Last interaction date"
					value="${this._formatDate(this.internetBankingDetails.dateLastUsed)}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-status"
					label="Status"
					value="${this.isInternetBankingActive ? `Active` : `Suspended`}">
				</horizon-label>

				<horizon-label
					data-automation-id="internet-banking-suspending-reason"
					label="Reason for suspending"
					value="${this.internetBankingDetails.statusReason}"
					?hidden="${this.isInternetBankingActive}">
				</horizon-label>

				<!-- Main Panel -->
				<capitec-button
					data-automation-id="internet-banking-reset-token-button"
					label="Reset Security Token Clock"
					?hidden=${!this.isVerifiedClient || this.isTokenSuspended || !Boolean(this.clientTokens?.length)}
					@click="${() => this._onResetSecurityTokenClockClick()}">
				</capitec-button>
				<capitec-button
					data-automation-id="internet-banking-suspend-token-button"
					label="Suspend Security Token"
					?hidden=${this.isTokenSuspended || !Boolean(this.clientTokens?.length)}
					@click="${() => this._onOpenSuspendPanelClick()}">
				</capitec-button>
			</capitec-content-box>
		`;
	}

	_renderInternetBankingNotRegistered() {
		return html`
			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="center"
				valign="top"
				gap="none">
				<img src="/images/insure/connection-error.svg" class="connection-error-svg"/>
				<capitec-label class="side-panel-header-label" type="Strong" label="Client not registered"></capitec-label>
				<p style="text-align: center">You need to visit a branch to register for Internet banking.</p>
			</capitec-content-box>
		`;
	}

	_renderSuspendPanel() {
		return this.renderMode === RENDER_MODE.SINGLE_TOKEN ? html`
			<capitec-side-sheet
				data-automation-id="internet-banking-single-token-panel"
				class="side-panel-sheet"
				.expanded=${this.showSuspendPanel}
				alignment="right">

				${this._renderSuspendPanelHeader()}
				${this._renderSuspendReasons()}

			</capitec-side-sheet>
		` : html`
			<capitec-side-sheet
				data-automation-id="internet-banking-multiple-token-panel"
				class="side-panel-sheet"
				.expanded=${this.showSuspendPanel}
				alignment="right">

				${this._renderSuspendPanelHeader()}
				${this._renderMulitpleDevicesStepper()}
				${this._renderSuspendReasons()}

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none">
					${this._renderClientTokens()}
				</capitec-content-box>
			</capitec-side-sheet>
		`;
	}

	_renderSuspendPanelHeader() {
		return html`
			<capitec-group
				class="side-panel-header-suspend ${this.showNoReasonSelectedNotification ? `side-panel-header-suspend-error` : ``}"
				layout="horizontal"
				halign="left"
				valign="center"
				gap="none">
				<capitec-icon class="${this.renderMode === RENDER_MODE.SINGLE_TOKEN ? `side-panel-header-icon` : `side-panel-header-suspend-icon`}" size="medium" icon=${this.showNoReasonSelectedNotification ? `status/error-trans` : `status/warning-trans`}></capitec-icon>
				<capitec-label class="side-panel-header-label" type="Strong" label="Suspend Security Token"></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-icon class="side-panel-close-icon" size="medium" icon="${this.renderMode === RENDER_MODE.SINGLE_TOKEN ? `system/close-action` : `system/close`}" @click="${() => this._onCloseSuspendPanelClick()}"></capitec-icon>
			</capitec-group>
		`;
	}

	_renderMulitpleDevicesStepper() {
		return this.renderStepperMode === RENDER_STEPPER_MODE.CLIENT_TOKENS ? html`
			<capitec-content-box
				class="side-panel-stepper"
				halign="left"
				valign="center"
				gap="none">
				<capitec-badge class="${this.isTokenSelected ? `step-success` : `step-todo`}" number="1" iconSize="medium" color="#FFFFFF" icon="${this.isTokenSelected ? `status/success-trans` : ``}"></capitec-badge>
				<capitec-group class="side-panel-stepper-group">
					<capitec-label class="step-count-label" type="default" label="Step 1 of 2"></capitec-label>
					<capitec-label class="step-label label-strong" type="strong" label="Choose security token to be suspended"></capitec-label>
				</capitec-group>
			</capitec-content-box>
		` : html`
			<capitec-content-box
				class="side-panel-stepper"
				halign="left"
				valign="center"
				gap="none">
				<capitec-badge class="${this.isSuspendReasonSelected ? `step-success` : `step-todo`}" number="2" iconSize="medium" color="#FFFFFF" icon="${this.isSuspendReasonSelected ? `status/success-trans` : ``}"></capitec-badge>
				<capitec-group class="side-panel-stepper-group">
					<capitec-label class="step-count-label" type="default" label="Step 2 of 2"></capitec-label>
					<capitec-label class="step-label label-strong" type="strong" label="Choose a reason to suspend"></capitec-label>
				</capitec-group>
			</capitec-content-box>
		`;
	}

	_renderSuspendReasons() {
		return this.renderStepperMode === RENDER_STEPPER_MODE.SUSPEND_REASONS ? html`
			${this._renderClientNotification()}

			<capitec-content-box
				class="content-box"
				layout="vertical"
				halign="left"
				valign="top"
				gap="none">
				<capitec-label
					class="reason-to-suspend-label"
					type="subtitle"
					data-automation-id=""
					label="Reasons to suspend"
					value="">
				</capitec-label>

				<capitec-radio-group
					label="Radio group label">
						<capitec-radio
							id="stolen"
							class="radio-button-label"
							data-automation-id="internet-banking-suspend-reason-stolen"
							label="Stolen"
							?checked=${this.selectedReason === SUSPEND_REASONS.STOLEN}
							@value-changed="${() => this._onSelectedReasonChanged(SUSPEND_REASONS.STOLEN)}">
						</capitec-radio>

						<capitec-radio
							id="lost"
							class="radio-button-label"
							data-automation-id="internet-banking-suspend-reason-lost"
							label="Lost"
							?checked=${this.selectedReason === SUSPEND_REASONS.LOST}
							@value-changed="${() => this._onSelectedReasonChanged(SUSPEND_REASONS.LOST)}">
						</capitec-radio>

						<capitec-radio
							id="faulty"
							class="radio-button-label"
							data-automation-id="internet-banking-suspend-reason-faulty"
							label="Faulty"
							?checked=${this.selectedReason === SUSPEND_REASONS.FAULTY}
							@value-changed="${() => this._onSelectedReasonChanged(SUSPEND_REASONS.FAULTY)}">
						</capitec-radio>

						<capitec-radio
							id="serviceCancellation"
							class="radio-button-label"
							data-automation-id="internet-banking-suspend-reason-service-cancellation"
							label="Service cancellation"
							?checked=${this.selectedReason === SUSPEND_REASONS.SERVICE_CANCELLATION}
							@value-changed="${() => this._onSelectedReasonChanged(SUSPEND_REASONS.SERVICE_CANCELLATION)}">
						</capitec-radio>
					</capitec-radio-group>

					<!-- Suspend Reasons Panel -->
					<capitec-button
						data-automation-id="internet-banking-suspend-token-button"
						type="primary"
						label="Suspend Security Token"
						@click="${() => this._onSuspendSecurityTokenClick()}">
					</capitec-button>
					<capitec-button
						data-automation-id="internet-banking-back-button"
						label="Back"
						@click="${() => this._onBackBtnClick()}"
						?hidden=${this.isMultipleDevices === false}>
					</capitec-button>
					<capitec-button
						data-automation-id="internet-banking-cancel-button"
						label="Cancel"
						@click="${() => this._onCloseSuspendPanelClick()}"
						?hidden=${this.isMultipleDevices === true}>
					</capitec-button>
				</capitec-content-box>
		` : html``;
	}

	_renderClientTokens() {
		return this.renderStepperMode === RENDER_STEPPER_MODE.CLIENT_TOKENS ? html`
			
				<capitec-check-group 
					class="check-group"
					data-automation-id="internet-banking-token-group">
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
					data-automation-id="internet-banking-next-button"
					type="primary"
					label="Next"
					@click="${() => this._onNextBtnClick()}"
					?hidden=${this.showResetTokenPanel}>
				</capitec-button>
				<capitec-button
					data-automation-id="internet-banking-cancel-button"
					label="Cancel"
					@click="${() => this._onCloseSuspendPanelClick()}"
					?hidden=${this.showResetTokenPanel}>
				</capitec-button>

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

	_renderMultipleDevicesResetTokenPanel() {
		return this.renderMode === RENDER_MODE.MULTIPLE_TOKEN ? html`
			<capitec-side-sheet
				class="side-panel-sheet"
				.expanded=${this.showResetTokenPanel}
				alignment="right">
				<capitec-group
					class="side-panel-header-reset-token"
					layout="horizontal"
					halign="left"
					valign="center"
					gap="none">
					<capitec-label class="side-panel-header-label" type="Strong" label="Reset Security Token Clock"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-icon class="side-panel-close-icon" size="medium" icon="system/close-action" @click="${() => this._onCloseResetPanelClick()}"></capitec-icon>
				</capitec-group>

				<capitec-content-box
					class="content-box"
					layout="vertical"
					halign="left"
					valign="top"
					gap="none">
					<capitec-label
						class="reset-security-token-label"
						type="subtitle"
						data-automation-id=""
						label="Choose security token to reset"
						value="">
					</capitec-label>

					${this._renderClientTokens()}

					<!-- Multiple Client Tokens -->
					<capitec-button
						data-automation-id="internet-banking-reset-token-button"
						type="primary"
						label="Reset Security Token Clock"
						@click="${() => this._onMultipleTokensResetBtnClick()}">
					</capitec-button>
					<capitec-button
						data-automation-id="internet-banking-cancel-button"
						label="Cancel"
						@click="${() => this._onCloseResetPanelClick()}">
					</capitec-button>
				</capitec-content-box>

			</capitec-side-sheet>
		` : html``;
	}

	_renderServiceUnavailable() {
		return html`
			<horizon-alert-banner
				data-automation-id="app-profile-details-unavailable-banner"
				class="unavailable-alert-banner"
				type="unsuccessful-red"
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

	_renderTokenResetSuccessToast() {
		const formatedUpdatedDate = `${this._getFormattedDateTime(this.internetBankingDetails.dateLastUpdated)}`;

		return html`
			<capitec-toast 
				data-automation-id="internet-banking-reset-token-success-toast"
				id="reset-successToast"
				class="token-reset-toast-success"
				type="success" 
				header="Successful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
					<capitec-label label="Successful!" type="strong"></capitec-label>
					<capitec-label label="Security token was reset."></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="You can now log in again."></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="${formatedUpdatedDate}" type="strong"></capitec-label>
			</capitec-toast>`;
	}

	_renderTokenResetUnsuccessfulToast() {
		return html`
			<capitec-toast
				data-automation-id="internet-banking-reset-token-ussuccess-toast"
				id="reset-unsuccessToast"
				class="token-reset-toast-unsuccess"
				type="error"
				header="Unsuccessful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
				<capitec-label label="Unsuccessful!" type="strong"></capitec-label>
				<capitec-label label="Internet security token was not reset."></capitec-label>
				<capitec-spacer></capitec-spacer>
				<capitec-hyperlink
					@click="${() => this._onResetSecurityTokenClockClick()}"
					label="Try again"
					inline
				></capitec-hyperlink>
			</capitec-toast>`;
	}

	_renderTokenSuspendSuccessToast() {
		const formatedUpdatedDate = `${this._getFormattedDateTime(this.internetBankingDetails.dateLastUpdated)}`;

		return html`
			<capitec-toast 
				data-automation-id="internet-banking-suspend-token-success-toast"
				id="suspend-successToast"
				class="token-suspend-toast-success"
				type="success" 
				header="Successful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
					<capitec-label label="Successful!" type="strong"></capitec-label>
					<capitec-label label="Internet security token was suspended."></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="To access internet banking you will need to register on the App."></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="${formatedUpdatedDate}" type="strong"></capitec-label>
			</capitec-toast>`;
	}

	_renderTokenSuspendUnsuccessToast() {
		return html`
			<capitec-toast
				data-automation-id="internet-banking-suspend-token-unsuccess-toast"
				id="suspend-unsuccessToast"
				class="token-suspend-toast-unsuccess"
				type="error"
				header="Unsuccessful!"
				detail=""
				@click="${(e) => this._closeToast(e)}"
				closable>
			</capitec-toast>`;
	}

	_renderTokenSuspendedNotification() {
		return this.isTokenSuspended ? html`
			<horizon-alert-banner
				type="error"
				class="token-suspend-banner"
				label=""
				layout="vertical">
				<p><b>Internet security token suspended.</b><br>To access internet banking you will need to register on the App.</p>
				<capitec-spacer></capitec-spacer>
				<p>Please visit a branch to request a new security token.</p>
			</horizon-alert-banner>
		` : html``;
	}

	_renderClientNotification() {
		return this.showNoReasonSelectedNotification ? html`
			<horizon-alert-banner
				type="unsuccessful-red"
				label=""
				layout="vertical">
				<p></b><b>Notice:</b></p>
				<p>Please choose a reason to suspend.</p>
			</horizon-alert-banner>
		` : html`
			<horizon-alert-banner
				type="warning"
				class="client-notify-banner"
				label=""
				layout="vertical">
				<p><b>Notify client:</b><br>A fee will be charged to activate a new security token.</p>

				<capitec-hyperlink
					href="https://www.capitecbank.co.za/global-one/transact/fees/"
					target="_blank"
					label="View fees"
					inline>
				</capitec-hyperlink>
			</horizon-alert-banner>
		`;
	}
}

customElements.define(`capitec-pc-internet-banking-profile-details`, InternetBankingProfileDetails);