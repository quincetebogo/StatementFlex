import { Component, css, html } from 'platform/elements';
import { deformatCurrency, formatCurrency } from 'app/productControls/utilities/Currency';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';

import 'app/components/common/HorizonSelectIcon';
import 'app/components/common/HorizonProductTile'; 

/**
 * Screen for Full or Partial Unlocking Fixed Term Savings Plans when the clients requests.
 *
 * Events Raised
 * -------------
 * back
 * get-agreement
 * view-agreement
 * unlock
 * verify-now
 * 
 * choose-options-telemetry
 * unlock-amount-telemetry
 * select-transfer-telemetry
 * cancel-transfer-telemetry
 * choose-account-telemetry
 * 
 * @export
 * @class UnlockFTSP
 * @extends {Component}
 */

const UNLOCK_OPTIONS = {
	FULL: `Full unlock`,
	PARTIAL: `Partial unlock`
};

 export class UnlockFTSP extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.unlockOptions = null;
		this.selectedFromAccount = null;
		this.selectedToAccount = null;
		this.selectedAccUnlockOptions = null;

		this.unlockType = null;
		this.partialUnlockAmount = null;
		this.displayUnlockAmount = null;
		this.hasAmountChanged = true;
		this.agreementAccepted = false;
		this.showConfirmModal = false;
		this.hasDigitalChannels = false;
		this.isHelpDeskAgent = false;
		this.declarationExpanded = false;

		this.unlockFee = null;
		this.quoteRefNumber = ``;
		this.errMessage = ``;
		this.unlockAllowed = false;
		this.unlockOptionsList = [UNLOCK_OPTIONS.FULL];
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._loadUnlockOptionsList();
		this._isUnlockAllowed();

		// Selecting default from account as the one Unlock savings plan flow is triggered.
		// eslint-disable-next-line eqeqeq
		[this.selectedFromAccount] = this.unlockFromAccountsList.filter(item => item.accountNumber == this.selectedUnlockAccNumber);
		
		// Default to account will always be primary savings account
		[this.selectedToAccount] = this.unlockToAccountsList;

	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} selectedUnlockAccNumber FTSP account number from which Unlock is selected 
	 * @property {Object} unlockOptions full/partial unlock details 
	 * @property {Object} unlockFromAccountsList Unlock from accounts details 
	 * @property {Object} unlockToAccountsList Unlock to accounts details 
	 * @property {Object} savingsPlanDetails Savings plans details
	 * @property {String} verificationMethod Indicated the type of verification (SQ/ita)
	 * @property {Boolean} hasDigitalChannels Indicates if the client is registered for digital channels
	 * @property {Boolean} isHelpDeskAgent Indicates if the an agent is with Help desk role
	 * 
	  * @property {getUnlockQuoteCallback} getUnlockQuote Callback function to get unlock quote for the selected account and unlock type
	 * @property {renderAlterBannerCallback} renderAlertBanner Callback function to render alter banner based on verification status & method
	 * @property {shouldDisableCallback} shouldDisable Callback function to determine if particular need to be diabled based on verification status & method
	 *
	 * @readonly
	 * @static
	 * @memberof UnlockFTSP
	 */
	static get properties() {
		return {
			selectedUnlockAccNumber: { type: Object },
			unlockOptions: { type: Object },
			unlockFromAccountsList: { type: Object },
			unlockToAccountsList: { type: Object },
			savingsPlanDetails: { type: Object },
			verificationMethod: { type: String },
			hasDigitalChannels: { type: Boolean },
			isHelpDeskAgent: { type: Boolean },

			getUnlockQuote: { type: Object, attribute: false },
			shouldDisable: { type: Object, attribute: false },
			renderAlertBanner: { type: Object, attribute: false },

			unlockType: { state: true },
			selectedFromAccount: { state: true },
			partialUnlockAmount: { state: true },
			agreementAccepted: { state: true },
			showConfirmModal: { state: true },
			unlockFee: { state: true },
			quoteRefNumber: { state: true },
			declarationExpanded: { state: true },
			displayUnlockAmount: { state: true }
		};
	}

	// ---------------
	// EVENT HANDLERS
	// --------------

	_back() {
		this.dispatchEvent(new CustomEvent(`back`, {}));
	}

	_chooseOption(e) {
		this.unlockType = e.detail.new;
		this._clearSelection();

		this.dispatchEvent(new CustomEvent(`choose-options-telemetry`, { detail: { unlockType: this.unlockType } }));

		this.partialUnlockAmount = this.selectedAccUnlockOptions.partialUnlockAmount;

		if (this.unlockType === UNLOCK_OPTIONS.FULL) {
			this.partialUnlockAmount = deformatCurrency(this.selectedFromAccount.availableBalance);
		}

		this.displayUnlockAmount = this._formatAmount(this.partialUnlockAmount);
		this._getUnlockQuoteDetails();
	}

	_chooseFromAccount(e) {
		this.selectedFromAccount = e.detail.new;
		this.selectedUnlockAccNumber = this.selectedFromAccount.accountNumber;

		this._loadUnlockOptionsList();

		this.unlockType = null;
		this._clearSelection();
		this.partialUnlockAmount = this.selectedAccUnlockOptions.partialUnlockAmount;
		this.displayUnlockAmount = this._formatAmount(this.partialUnlockAmount);
	}

	_unlockAmountChange(e) {
		this._clearSelection();
		this.partialUnlockAmount = this.displayUnlockAmount = e.detail.new;
		this.hasAmountChanged = true;
		this.declarationExpanded = false;
		this.unlockFee = null;

		if (this.partialUnlockAmount > this.selectedAccUnlockOptions.partialUnlockAmount) {
			this.errMessage = `Max unlock amount ${formatCurrency(this.selectedAccUnlockOptions.partialUnlockAmount)}`;
		}
	}

	_focusInUnlockAmount(e) {
		
		this.displayUnlockAmount = this.partialUnlockAmount;
	}

	_focusOutUnlockAmount(e) {
		this.displayUnlockAmount = this._formatAmount(this.partialUnlockAmount);

		if (this.hasAmountChanged && !this.errMessage) {
			this.declarationExpanded = true;
			this.dispatchEvent(new CustomEvent(`unlock-amount-telemetry`, { detail: { unlockAmount: this.partialUnlockAmount } }));
			this._getUnlockQuoteDetails();
		}
		this.hasAmountChanged = false;
	}

	_viewAgreement() {
		if (this.agreementAccepted) {
			this.dispatchEvent(new CustomEvent(`view-agreement`, {}));
		}
	}

	_acceptAgreement(e) {
		this.agreementAccepted = e.detail.new;

		if (this.agreementAccepted) {
			this.declarationExpanded = false;
			this.dispatchEvent(new CustomEvent(`get-agreement`, { detail: { selectedAccount: this.selectedFromAccount, quoteRefNumber: this.quoteRefNumber } }));
		}
	}

	_unlockOrTransferPlan() {
		this.showConfirmModal = true;
		this.dispatchEvent(new CustomEvent(`select-transfer-telemetry`, {}));
	}

	_cancelConfirmUnlock() {
		this.showConfirmModal = !this.showConfirmModal;
		this.dispatchEvent(new CustomEvent(`cancel-transfer-telemetry`, {}));
	}
	
	_confirmUnlock() {
		this.dispatchEvent(new CustomEvent(`unlock`, { detail: 
			{ selectedFromAccount: this.selectedFromAccount, 
				unlockAmount: this.partialUnlockAmount,
				unlockType: this.unlockType,
				quoteRefNumber: this.quoteRefNumber } }));
	}
	
	_verifyClick() {
		this.dispatchEvent(new CustomEvent(`verify-now`, {}));
	}


	// --------------
	// PUBLIC METHODS
	// --------------

	// N/A
	
	// ---------------
	// PRIVATE METHODS
	// ---------------

	_loadUnlockOptionsList() {
		this.unlockOptionsList = [UNLOCK_OPTIONS.FULL];
		
		// eslint-disable-next-line eqeqeq
		[this.selectedAccUnlockOptions] = this.unlockOptions.filter(account => account.accountNumber == this.selectedUnlockAccNumber);

		if (this.selectedAccUnlockOptions.partialUnlock) {
			this.unlockOptionsList.push(UNLOCK_OPTIONS.PARTIAL);
		}
		this.dispatchEvent(new CustomEvent(`choose-account-telemetry`, { detail: { accountNumber: this.selectedUnlockAccNumber } }));
	}

	async _getUnlockQuoteDetails() {
		const result = await this.getUnlockQuote(this.unlockType, this.selectedFromAccount.accountNumber, this.partialUnlockAmount);
		this.unlockFee = result.unlockFee;
		this.quoteRefNumber = result.quoteReferenceNumber;
	}

	_isUnlockAllowed() {
		if (this.isHelpDeskAgent) {
			this.unlockAllowed = true;
		} else {
			this.unlockAllowed = !this.shouldDisable(`unlock-ftsp`);
		}
	}

	_clearSelection() {
		this.agreementAccepted = false;
		this.errMessage = ``;
		this.quoteRefNumber = ``;
	}

	_getMaxUnlockAmount() {
		if (this.unlockType) {
			const amount = this.unlockType === `Full unlock` ? this.selectedFromAccount.availableBalance : this.selectedAccUnlockOptions.partialUnlockAmount;
			return `max(${formatCurrency(amount)})`;
		}
	}

	_formatAmount(amount) {
		if (amount) {
			return `${amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
		}
	}

	// ---------
	// RENDERING
	// ---------
	static get styles() {
		return [
			super.styles,
			css`
			
				.card {
					height: 888px;
				}
				capitec-title-bar {
					--theme-layout-gap-spacing: 0px;
					--theme-layout-gap-line-color: 0px;
					border-radius: 4px 4px 0 0;
				}
				.bg-save {
					background: linear-gradient(90deg, #003354 0%, #00486D 100%);
				}
				capitec-title-bar > capitec-label {
					--theme-label-font-color: #FFFFFF;
				}

				/** Account details bar stylings **/
				.details-bar {
					height: 64px;
					width: 1062px;
					border-bottom: 0px;
					margin-bottom: 0px;
					padding: 11px 24px 11px 8px;
				}
				.details-bar > horizon-label {
					width: 190px;
					height: 100%;
					padding: 0px 0px 0px 16px;
				
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #FFFFFF;
					--horizon-label-value-color: #FFFFFF;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				.left-arrow {
					cursor: pointer;
					margin-right: 16px;
				}
				.outer-box {
					width: 1072px;
					height: 690px;
				}
				.inner-box {
					width: 1058px;
					height: auto;
					min-height: 690px;
				}
				/* Alert banner styles */
				${ALERTBANNER_CSS}

				.verificatoin-status {
					width: 1025px;
					margin: 16px 16px 0px 16px;
				}
				.alert-banner-group {
					line-height: 24px;
				}
				.alert-banner-group > capitec-label[type="default"] {
					--theme-layout-gap-spacing: 4px;
				}
				/** Account selection stylings **/
				.select-group {
					height: 132px;
					--theme-layout-gap-spacing: 16px;
					margin-bottom: 0px;
					padding: 16px 16px 0px 16px;
				}
				.accounts-group {
					width: 501px;
					margin-left: 5px;
				}
				.select-label {
					--theme-label-subtitle-font-size: 16px;
					--theme-label-subtitle-font-weight: 600;
				}
				horizon-select-icon {
					width: 501px;
					--theme-select-options-max-height: 304px;
					--theme-input-icon-margin-left: 16px;
					--theme-icon-size-small: 24px;
					--theme-layout-gap-spacing: 8px;
					--theme-input-padding-top: 8px;
					--theme-input-padding-bottom: 8px;
					--theme-input-padding-right: 48px;

					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 15px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 20px;
					--horizon-label-text-color: #3A3A3A;

					--horizon-label-value-height: 12px;
					--horizon-label-value-font-size: 12px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 12px;
					--horizon-label-value-color:#3A3A3A;

					--theme-label-default-font-weight: 600;
					--theme-label-default-font-size: 15px;
					--theme-label-font-color: #3A3A3A;
					--theme-input-disabled-background-color: #FFFFFF;
				}
				.large-select{
					width: 1025px;
				}

				/** Unlock details stylings **/
				capitec-select {
					--theme-input-font-weight: 600;
				}
				.details-group {
					padding: 16px;
					margin-bottom: 0px;
					background-color: #FCFCFC;
					--theme-layout-gap-spacing: 16px;
				}
				.textfield-group {
					margin-top: 16px;
					--theme-layout-gap-spacing: 21px;
				}
				capitec-text-field {
					width: 501px;
					--theme-input-hint-font-color:#009DE0;
					--theme-input-disabled-background-color: #FFFFFF;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					margin: 0px 16px;
				}

				horizon-label {
					width: 173px;
					padding-left: 16px;
					--theme-layout-gap-spacing: 0px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-color: #3A3A3A;
					--horizon-label-text-line-height: 20px;
					
					--horizon-label-value-height: 20px;
					--horizon-label-value-color: #3A3A3A;
					--horizon-label-value-font-size: 16px;
					--horizon-label-value-line-height: 20px;
				}
				capitec-label {
					--theme-label-font-color: #3A3A3A;
					--theme-label-title-font-size: 24px;
					--theme-label-title-font-weight: 600;
				}
				capitec-expander {
					--theme-expander-width: 1025px;
					--theme-expander-height: 300px;
					--theme-expander-border: 0px;
					--theme-expander-header-font-size: 16px;
					--theme-expander-header-font-weight: 600;
					--theme-container-padding-left: 0px;
					--theme-container-padding-top: 0px;
					--theme-container-padding-right: 0px;
					--theme-container-padding-bottom: 0px;
					--theme-expander-indicator-height: 24px;
					--theme-expander-indicator-width: 24px;
					--theme-expander-header-padding: 10px 16px 14px;

					border: 1px solid #e1e1e1;
					border-radius: 4px;
					box-shadow: 0px 6px 10px 0.25px rgba(0,0,0,0.07);
					margin: 16px;
				}
				capitec-expander[expanded] {
					--theme-expander-background-color: #F5F5F5;
					--theme-expander-header-font-color: #009DE0;
				}
				.expander-cb {
					background-color: #FFFFFF;
					border-top: 1px solid #E1E1E1;
					border-radius: 0px 0px 4px 4px;
					--theme-layout-gap-spacing: 18px;
				}
				.list-items {
					margin: 24px 16px 24px 37px;
					padding-inline-start: 32px;
				}
				horizon-product-tile {
					margin: 0px 18px 8px 18px;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-default-border-right: 1px solid #E1E1E1;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-product-tile-detail-top: 22px;
				}
				.agreement-group {
					height: 64px;
					width: 1025px;
					margin: 0px 0px 16px 16px;
					border: 1px solid #e1e1e1;
					border-radius: 4px;
				}
				.group-disabled {
					background-color: #F5F5F5;
				}
				.agreement-group > capitec-icon {
					margin: 0px 16px;
				}
				.agreement-group > capitec-label {
					margin-right: 32px;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}
				.label-disabled {
					--theme-label-font-color: #7C7C7C;
					--horizon-label-text-color: #7C7C7C;
					--horizon-label-value-color: #7C7C7C;
				}
				.agreement-group > horizon-label {
					padding: 8px;
					--horizon-label-text-height: 20px;
					--horizon-label-text-font-size: 16px;
					--horizon-label-text-font-weight: 600;
					--horizon-label-text-line-height: 20px;

					--horizon-label-value-height: 12px;
					--horizon-label-value-font-size: 12px;
					--horizon-label-value-font-weight: 500;
					--horizon-label-value-line-height: 12px;
				}
				.vertical-line{
					height: 40px;
					width: 1px;
					background-color: #E1E1E1;
				}
				.viewDocumentLink {
					--theme-label-font-color: #009DE0;
				}
				capitec-button-bar {
					--theme-buttonbar-padding: 6px 16px 6px 24px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-button-bar > capitec-button {
					width: 164px;
				}
				capitec-button {
					height: 48px;
					margin-left: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
				capitec-check {
					margin: 8px 0px 22px 40px;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
				}

				/** Confirm Modal Stylings**/

				capitec-modal {
					--theme-modal-free-max-width: 341px;
					--theme-modal-header-background-color: #F9EBDD;
					--theme-modal-body-padding: 16px;
					--theme-modal-header-height: 64px;
					--theme-modal-header-padding-top: 32px;
					--theme-modal-header-padding-bottom: 32px;
					--theme-modal-header-padding-right: 32px;
					--theme-modal-header-padding-left: 32px;
					--theme-modal-footer-padding: 8px 14px 8px 0px;
					--theme-icon-size-medium: 24px;
				}

				div[slot="header"] {
					position: absolute;
					display: flex;
					align-items: center;
					left: -303px;
					top: -12px;
				}
				.confirm-label {
					--theme-label-title-font-size: 18px;
					--theme-label-font-color: #3A3A3A;
				}
				.confirm-box {
					width: 341px;
					height: 198px;
					border-bottom: 1px solid #E1E1E1;
				}
				.confirm-box > p {
					height: auto;
					width: 277px;
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 500;
					letter-spacing: 0;
					line-height: 24px;
					margin: 0px 0px 16px 0px;
				}
				.confirm-cancel {
					margin: 0px;
				}
			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<capitec-card class="card">
				<capitec-group layout="vertical" gap="line" halign="left" valign="top">
					<capitec-title-bar class="bg-save">
						<capitec-icon 
							class="left-arrow"
							size="medium"
							icon="system/arrow-left-white"
							@click="${() => this._back()}">
						</capitec-icon>
						<capitec-label label="${this.selectedFromAccount.accountName}" type="title"></capitec-label>
					</capitec-title-bar>
					
					${this._renderAccountDetailsBar()}
					
					<capitec-content-box class="outer-box" noPadding>
						<capitec-content-box class="inner-box" noPadding>
							${this._renderBanner()}
							${this._renderAccountSelection()}
							${this._renderDetailsSelection()}
							${this._renderAgreementInformation()}
							${this._renderViewAgreementBar()}
							${this._renderConfirmModal()}
						</capitec-content-box>
				</capitec-content-box>
			</capitec-group>
				${this._renderFooter()}
		</capitec-card>
		`;
	}

	_renderAccountDetailsBar() {
		const accountDetails = this.savingsPlanDetails.find(account => account.accountNumber === this.selectedFromAccount.accountNumber);

		return html`
			<capitec-group
				class="details-bar bg-save"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<horizon-label
						data-automation-id="unlock-ftsp-account-number"
						label="Account number"
						textOverflow="ellipsis"
						value="${accountDetails.accountNumber}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-balance"
						label="Balance"
						value="${accountDetails.currentBalance}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-term"
						label="Term (months)"
						value="${accountDetails.term}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-nominal-interest-rate"
						label="Nominated interest rate"
						value="${accountDetails.nominalInterestRate}%">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-effective-interest-rate"
						label="Effective interest rate"
						value="${accountDetails.effectiveInterestRate}%">
					</horizon-label>
			</capitec-group>`;
	}

	_renderBanner() {
		return !this.isHelpDeskAgent && this.verificationMethod === `SQ`
		? html`${this._renderITABanner()}`
		: html`${this._renderMaxLimitBanner()}`;
	}

	_renderITABanner() {
		return this.hasDigitalChannels
		? html`${this._renderHighRiskTransAlertBanner()}`
		: html`${this._renderNoDigitalChannelsBanner()}`;
	}

	_renderMaxLimitBanner() {
		return html`
			<horizon-alert-banner
					class="verificatoin-status"
					data-automation-id="unlock-ftsp-disclosure-message"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label=" To limit risk and protect your money I can only unlock">
							</capitec-label>
							<capitec-label type="strong" label="R50 000.00"></capitec-label>
							<capitec-label type="default"
								label=" from your savings. Please visit a branch to unlock a greater amount.">
							</capitec-label>
						</capitec-group>
			</horizon-alert-banner>`;
	}

	_renderNoDigitalChannelsBanner() {
		return html`
			<horizon-alert-banner
					class="verificatoin-status"
					data-automation-id="unlock-ftsp-disclosure-message"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Notify client:"></capitec-label>
							<capitec-label type="default"
								label="For added security get the remote banking App to perform additional transactions, alternatively, visit your nearest branch.">
							</capitec-label>
						</capitec-group>
			</horizon-alert-banner>`;
	}

	_renderHighRiskTransAlertBanner() {
		return html`
			<horizon-alert-banner
					class="verificatoin-status"
					data-automation-id="unlock-ftsp-disclosure-message"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Inform client:"></capitec-label>
							<capitec-label type="default"
								label=" We need to send you a verification push notification to unlock your Fixed-term Savings Plan. Would you like to proceed?">
							</capitec-label>

							<capitec-spacer></capitec-spacer>

							<capitec-hyperlink
								data-automation-id="high-risk-transactions-verify"
								label="Verify Now"
								@click="${() => this._verifyClick()}">
							</capitec-hyperlink>
						</capitec-group>
			</horizon-alert-banner>`;
	}

	_renderAccountSelection() {
		return html`
			<capitec-group class="select-group" layout="horizontal" halign="left" valign="top" gap="clear">
				<capitec-group class="accounts-group" layout="vertical" halign="left" valign="center" gap="clear">
					<capitec-label
						class="select-label"
						type="subtitle"
						label="From account">
					</capitec-label>

					<horizon-select-icon
						class="${this.unlockType !== `Partial unlock` ? `large-select` : ``}"
						data-automation-id="unlock-ftsp-from-account"
						label="Choose account"
						display-field="availableBalance"
						id-field="accountNumber"
						detail-label="${this.selectedFromAccount.accountNumber}"
						hint="${this.unlockType === `Full unlock` ? `Unlock Fixed-term Savings to a Flexible Plan` : ``}"
						.items="${this.unlockFromAccountsList}"
						.value="${this.selectedFromAccount}"
						.displayRenderer="${(e) => this._renderOptions(e)}"
						@value-changed="${(e) => this._chooseFromAccount(e)}"> 
					</horizon-select-icon>
				</capitec-group>

				${this._renderToAccount()}
			</capitec-group>
		`;
	}
	
	_renderToAccount() {
		return this.unlockType === `Partial unlock`
		? html`
			<capitec-group class="accounts-group" layout="vertical" halign="left" valign="center" gap="clear">
				<capitec-label
					class="select-label"
					type="subtitle"
					label="To account">
				</capitec-label>

				<horizon-select-icon
					data-automation-id="unlock-ftsp-to-account"
					label="Choose account"
					class="disabled-select"
					display-field="availableBalance"
					id-field="accountNumber"
					detail-label="${this.selectedToAccount.accountNumber}"
					.items="${this.unlockToAccountsList}"
					.value="${this.selectedToAccount}"
					.displayRenderer="${(e) => this._renderOptions(e)}"
					@value-changed="${(e) => this._accountValueChanged(e)}"
					?disabled=${true}> 
				</horizon-select-icon>

			</capitec-group>
		`
		: html``;
	}

	_renderOptions(e) {
		return html`
			<capitec-group ?noPadding="${true}" layout="horizontal" style="height: 36px;">
				${this._renderOptionIcon(e)}
				
				<horizon-label
					label="${e.accountName}"
					value="${e.accountNumber}">
				</horizon-label>
				<capitec-spacer></capitec-spacer>
				<capitec-label
					label="${e.availableBalance}">
				</capitec-label>
			</capitec-group>
		`;
	}

	_renderOptionIcon(e) {
		return html`
			<capitec-icon
				size="small"
				icon="${e.icon}">
			</capitec-icon>`;
	}

	_renderDetailsSelection() {
		return html`
			<capitec-group class="details-group" layout="vertical" halign="left" valign="center" gap="clear">
				
				<capitec-label
					class="select-label"
					type="subtitle"
					label="Unlock details">
				</capitec-label>
		
				<capitec-select
					class="large-select"
					data-automation-id="unlock-ftsp-select-options"
					label="Choose unlock options"
					id-field="key"
					display-field="value"
					?labelAsPlaceholder=${true}
					.items=${this.unlockOptionsList}
					@value-changed="${(e) => this._chooseOption(e)}"
					tabindex=3
					value="${this.unlockType}"
					select-mode="single"
					error="">
				</capitec-select>

				<capitec-group class="textfield-group" layout="horizontal" halign="left" valign="top" gap="clear">
					<capitec-text-field
						data-automation-id="unlock-ftsp-partial-amount"
						label="Unlock amount ${this._getMaxUnlockAmount()}"
						type="${this.partialUnlockAmount ? `currency` : ``}"
						error="${this.errMessage}"
						value="${this.displayUnlockAmount}"
						@key-input="${(e) => this._unlockAmountChange(e)}"
						@keyboard-input-focus="${(e) => this._focusInUnlockAmount(e)}"
						@blur="${(e) => this._focusOutUnlockAmount(e)}"
						?disabled=${!this.unlockType || this.unlockType === `Full unlock`}>
					</capitec-text-field>

					<capitec-text-field
						data-automation-id="unlock-ftsp-unlock-fee"
						label="Penalty fee"
						type="${this.unlockFee ? `currency` : ``}"
						value="${this._formatAmount(this.unlockFee)}"
						?disabled=${true}>
					</capitec-text-field>
					
				</capitec-group>

			</capitec-group>
		`;
	}

	_renderAgreementInformation() {
		return Boolean(this.unlockType)
		? html`
			<capitec-expander
				data-automation-id="unlock-ftsp-agreement-content"
				?expanded=${this.declarationExpanded}
				@expand="${() => this.declarationExpanded = true}"
				@collapse="${() => this.declarationExpanded = false}"
				label="Declaration"
				icon="/attorneys_declaration">
				<capitec-content-box class="expander-cb" noPadding>
					<ul class="list-items">
						<li><capitec-label type="default" label="We will charge you a penalty fee for unlocking before the agreed maturity date"></capitec-label></li>
						<li><capitec-label type="default" label="The penalty fee does not reduce the interest you've earned"></capitec-label></li>
						<li><capitec-label type="default" label="You may still be liable to pay income tax to SARS on the interest you've earned"></capitec-label></li>
						<li><capitec-label type="default" label="The unlock criteria may change at any time and will be determined at our sole discretion"></capitec-label></li>
						<li><capitec-label type="default" label="Your interest rate may change after an unlock and withdrawal of money"></capitec-label></li>
						<li><capitec-label type="default" label="The penalty fee will be deducted from your Capitec Fixed-term Savings Account"></capitec-label></li>
					</ul>

					<capitec-check
						data-automation-id="unlock-ftsp-accept-quote"
						label="I agree to the penalty fee and above terms and conditions"
						?checked=${this.agreementAccepted}
						?disabled="${!this.unlockAllowed}"
						@value-change="${(e) => this._acceptAgreement(e)}">
					</capitec-check>
				</capitec-content-box>
			</capitec-expander>`
		: html``;
	}

	_renderViewAgreementBar() {
		return Boolean(this.unlockType)
			? html`
				<capitec-group 
					class="agreement-group ${this.agreementAccepted ? `` : `group-disabled`}"
					layout="horizontal" 
					gap="none" 
					halign="left" 
					valign="center">
						<capitec-icon
							size="medium"
							icon="system/documents${this.agreementAccepted ? `-action` : ``}">
						</capitec-icon>

						<div class="vertical-line"></div>

						<horizon-label
							class="${this.agreementAccepted ? `` : `label-disabled`}"
							label="Agreement"
							value="${this.selectedFromAccount.accountName}">
						</horizon-label>
						
						<capitec-spacer></capitec-spacer>

						<capitec-label
							type="strong"
							label="View Document"
							class="${this.agreementAccepted ? `viewDocumentLink` : `label-disabled`}"
							@click="${() => this._viewAgreement()}">
						</capitec-label>
					</capitec-group>`
			: html``;
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>
				<capitec-button
					data-automation-id="unlock-ftsp-back-button"
					label="Cancel"
					@click="${() => this._back()}">
				</capitec-button>
				<capitec-button 
					data-automation-id="unlock-ftsp-unlock-button"
					type="primary"
					label="${this.unlockType === `Partial unlock` ? `Transfer` : `Unlock`}"
					?disabled="${!this.unlockAllowed || !(this.agreementAccepted && Boolean(this.unlockType)) || Boolean(this.errMessage)}"
					@click="${() => this._unlockOrTransferPlan()}">
				</capitec-button>
			</capitec-button-bar>`;
	}

	_renderConfirmModal() {
		return this.showConfirmModal 
		? html`
			<capitec-modal 
				data-automation-id="unlock-ftsp-confirm-modal"
				type="free" 
				header-align="left">
				<div slot="header">
					<span>
						<capitec-group layout="horizontal">
							<capitec-icon size="medium" icon="status/warning-trans"></capitec-icon>
							<capitec-label class="confirm-label" type="title" label="Confirm"></capitec-label>
						</capitec-group>
					</span>
				</div>
				<div slot="body">
					<capitec-content-box class="confirm-box">
						${this.unlockType === `Full unlock` 
							? html`<p>You are about to change <b>${this.selectedFromAccount.accountName} Fixed-term to a Flexible Savings Plan</b> which will affect your interest rate.</p>`
							: html`<p>You are about to make a <b>${formatCurrency(this.partialUnlockAmount)} Partial unlock</b> from ${this.selectedFromAccount.accountName} Fixed-term Savings Plan to ${this.selectedToAccount.accountName}.</p>`}
						<p>Are you sure you want to continue?</p>
					</capitec-content-box>
				</div>
				<div slot="footer">
					<capitec-group layout="horizontal">
						<capitec-button 
							data-automation-id="unlock-ftsp-confirm-cancel"
							label="Cancel"
							class="confirm-cancel"
							@click="${() => this._cancelConfirmUnlock()}">
						</capitec-button>

						<capitec-button 
							data-automation-id="unlock-ftsp-confirm-unlock"
							type="primary"
							label="${this.unlockType === `Partial unlock` ? `Transfer` : `Unlock`}"
							@click="${() => this._confirmUnlock()}">
						</capitec-button>
					</capitec-group>
				</div>
			</capitec-modal>`
		: html``;
	}

 }
	customElements.define(`capitec-pc-unlock-ftsp`, UnlockFTSP);

	/**
	* When left arrow on the title bar is clicked to go back
	*
	* @example
	* <capitec-pc-unlock-ftsp ... @back="${this._handler}"></capitec-pc-unlock-ftsp>
	*
	* @event UnlockFTSP#back
	* @type {Object} - N/A
	*/

	/**
	* When clicked on View document button
	*
	* @example
	* <capitec-pc-unlock-ftsp ... @view-agreement="${this._handler}"></capitec-pc-unlock-ftsp>
	*
	* @event UnlockFTSP#view-agreement
	* @type {Object} - N/A
	*/

	/**
	* When confirming to unlock FTSP
	*
	* @example
	* <capitec-pc-unlock-ftsp ... @unlock="${this._handler}"></capitec-pc-unlock-ftsp>
	*
	* @event UnlockFTSP#unlock
	* @type {Object} - N/A
	*/