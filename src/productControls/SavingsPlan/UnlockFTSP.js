import { Component, css, html } from 'platform/elements';
import { deformatCurrency, formatCurrency } from 'app/productControls/utilities/Currency';
import { ALERTBANNER_CSS } from 'app/css/VerificationStatusAlertBanner';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonSelectIcon';
import 'app/components/common/HorizonProductTile'; 

/**
 * Screen for Full or Partial Unlocking Fixed Term Savings Plans when the clients requests.
 *
 * Events Raised
 * -------------
 * 
 * back
 * view-agreement
 * unlock
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
		this.agreementAccepted = false;
		this.showConfirmModal = false;
		this.unlockFee = 0;
		this.quoteRefNumber = ``;
		this.errMessage = ``;
		this.unlockOptionsList = [UNLOCK_OPTIONS.FULL];
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		this._loadUnlockOptionsList();

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

			getUnlockQuote: { type: Object, attribute: false },
			shouldDisable: { type: Object, attribute: false },
			renderAlertBanner: { type: Object, attribute: false },

			unlockType: { state: true },
			selectedFromAccount: { state: true },
			partialUnlockAmount: { state: true },
			agreementAccepted: { state: true },
			showConfirmModal: { state: true },
			unlockFee: { state: true }
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
		this.agreementAccepted = false;
		this.errMessage = ``;
		this.partialUnlockAmount = this.selectedAccUnlockOptions.partialUnlockAmount;

		if (this.unlockType === UNLOCK_OPTIONS.FULL) {
			this.partialUnlockAmount = deformatCurrency(this.selectedFromAccount.availableBalance);
		}

		this._getUnlockQuoteDetails();
	}

	_chooseFromAccount(e) {
		this.selectedFromAccount = e.detail.new;
		this.selectedUnlockAccNumber = this.selectedFromAccount.accountNumber;

		this._loadUnlockOptionsList();

		this.unlockType = null;
		this.agreementAccepted = false;
		this.errMessage = ``;
		this.partialUnlockAmount = this.selectedAccUnlockOptions.partialUnlockAmount;
	}

	_unlockAmountChange(e) {
		this.errMessage = ``;
		this.partialUnlockAmount = e.detail.new;

		if (this.partialUnlockAmount > this.selectedAccUnlockOptions.partialUnlockAmount) {
			this.errMessage = `Max unlock amount ${formatCurrency(this.selectedAccUnlockOptions.partialUnlockAmount)}`;
			return;
		}
		this._getUnlockQuoteDetails();
	}

	_viewAgreement() {
		this.dispatchEvent(new CustomEvent(`view-agreement`, { detail: { selectedAccount: this.selectedFromAccount, quoteRefNumber: this.quoteRefNumber } }));
	}

	_acceptAgreement(e) {
		this.agreementAccepted = e.detail.new;
	}

	_unlockOrTransferPlan() {
		this.showConfirmModal = true;
	}

	_cancelConfirmUnlock() {
		this.showConfirmModal = !this.showConfirmModal;
	}
	
	_confirmUnlock() {
		this.dispatchEvent(new CustomEvent(`unlock`, { detail: { accountNumber: this.selectedFromAccount.accountNumber, quoteRefNumber: this.quoteRefNumber } }));
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
		
		this.partialUnlockAmount = this.selectedAccUnlockOptions.partialUnlockAmount;
	}

	async _getUnlockQuoteDetails() {
		const result = await this.getUnlockQuote(this.unlockType, this.selectedFromAccount.accountNumber, this.partialUnlockAmount);
		this.unlockFee = result.unlockFee;
		this.quoteRefNumber = result.quoteReferenceNumber;
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
					--theme-titlebar-padding: 16px;
				}
				.left-arrow {
					cursor: pointer;
					margin-right: 16px;
				}
				.outer-box {
					width: 1072px;
				}
				.inner-box {
					width: 1058px;
					height: auto;
					min-height: 754px;
				}
				/* Alert banner styles */
				${ALERTBANNER_CSS}

				.verificatoin-status {
					width: 1025px;
					margin: 16px 16px 0px 16px;
				}

				/** Account selection stylings **/
				.select-group {
					height: 143px;
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
					padding: 22px 16px;
					margin-bottom: 0px;
					background-color: #F9F9F9;
					--theme-layout-gap-spacing: 16px;
				}
				.textfield-group {
					--theme-layout-gap-spacing: 16px;
				}
				capitec-text-field {
					width: 501px;
					--theme-input-hint-font-color:#009DE0;
					--theme-input-disabled-background-color: #FFFFFF;
				}
				.unlock-amount {
					margin: 24px 21px 0px 0px;
				}
				.unlock-fee {
					margin-top: 4px;
				}
				capitec-alert-banner {
					--theme-alert-banner-height: 48px;
					margin: 0px 16px;
				}

				/** Account details bar stylings **/
				.details-bar {
					width: 1025;
					border: 1px solid #E1E1E1;
					border-radius:4px;
					height: 64px;
					margin: 18px 18px 12px;
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
				.list-items {
					margin: 8px 16px auto 37px;
					padding-inline-start: 32px;
				}
				horizon-product-tile {
					margin: 0px 18px 8px 18px;
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-product-tile-detail-top: 22px;
				}
				.viewDocumentLink {
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
					--theme-label-font-color: #009DE0;
				}
				capitec-button-bar {
					--theme-buttonbar-padding: 6px 16px 6px 24px;
					--theme-buttonbar-item-gap: 0px;
				}
				capitec-button {
					height: 48px;
					margin-left: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
				}
				capitec-check {
					margin: 8px 0px 26px 37px;
					--theme-label-font-size: 16px;
					--theme-label-font-weight: 600;
				}

				/** Confirm Modal Stylings**/

				capitec-modal {
					--theme-modal-free-max-width: 341px;
					--theme-modal-header-background-color: #f5f5f5;
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
			<capitec-title-bar>
				<capitec-icon 
					class="left-arrow"
					size="medium"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Unlock Savings Plans" type="title"></capitec-label>
			</capitec-title-bar>
			<capitec-content-box class="outer-box" noPadding>
				
				${this.renderAlertBanner()}
				<capitec-content-box class="inner-box" noPadding>
					${this._renderAccountSelection()}
					${this._renderDetailsSelection()}
					${this._renderDisclosure()}
					${this._renderAccountDetailsBar()}
					${this._renderViewAgreementBar()}
					${this._renderAgreementInformation()}
					${this._renderConfirmModal()}
				</capitec-content-box>
			</capitec-content-box>
			${this._renderFooter()}

			</capitec-card>
		`;
	}

	_renderAccountSelection() {
		return html`
			<capitec-group class="select-group" layout="horizontal" halign="left" valign="top" gap="clear">
				<capitec-group class="accounts-group" layout="vertical" halign="left" valign="center" gap="clear">
					<capitec-label
						class="select-label"
						type="subtitle"
						label="Unlock from account">
					</capitec-label>

					<horizon-select-icon
						class="${this.unlockType !== `Partial unlock` ? `large-select` : ``}"
						data-automation-id="unlock-ftsp-from-account"
						label="Choose account"
						display-field="availableBalance"
						id-field="accountNumber"
						detail-label="Available balance"
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
					label="Unlock to account">
				</capitec-label>

				<horizon-select-icon
					data-automation-id="unlock-ftsp-to-account"
					label="Choose account"
					class="disabled-select"
					display-field="availableBalance"
					id-field="accountNumber"
					detail-label="Available balance"
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
					value="Available balance">
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
					label="Unlock from account">
				</capitec-label>
		
				<capitec-select
					class="large-select"
					data-automation-id="unlock-ftsp-select-options"
					label="Unlock options"
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

				<capitec-group class="textfield-group" layout="horizontal" halign="left" valign="center" gap="clear">
					<capitec-text-field
						class="unlock-amount"
						data-automation-id="unlock-ftsp-partial-amount"
						label="Enter Unlock amount"
						type="currency"
						hint="Max unlock amount ${formatCurrency(this.unlockType === `Full unlock` ? this.selectedFromAccount.availableBalance : this.selectedAccUnlockOptions.partialUnlockAmount)}"
						error="${this.errMessage}"
						value="${this.partialUnlockAmount}"
						@key-input="${(e) => this._unlockAmountChange(e)}"
						?disabled=${!this.unlockType || this.unlockType === `Full unlock`}>
					</capitec-text-field>

					<capitec-text-field
						data-automation-id="unlock-ftsp-unlock-fee"
						label="Unlock fee"
						type="currency"
						value="${this.unlockFee}"
						?disabled=${true}>
					</capitec-text-field>
					
				</capitec-group>

			</capitec-group>
		`;
	}

	_renderDisclosure() {
		return html`
			<horizon-alert-banner
					class="verificatoin-status"
					data-automation-id="unlock-ftsp-disclosure-message"
					type="warning">
						<capitec-group layout="horizontal" class="alert-banner-group">
							<capitec-label type="strong" label="Disclosure:"></capitec-label>
							<capitec-label type="default"
								label="By changing or Full unlocking a Fixed-term to a Flexible Savings Plan will affect your interest rates.">
							</capitec-label>
						</capitec-group>
			</horizon-alert-banner>`;
	}

	_renderAccountDetailsBar() {
		const accountDetails = this.savingsPlanDetails.find(account => account.accountNumber === this.selectedFromAccount.accountNumber);

		return html`
			<capitec-group
				class="details-bar"
				layout="horizontal"
				gap="clear"
				halign="left"
				valign="center">
					<horizon-label
						data-automation-id="unlock-ftsp-account-name"
						label="Account name"
						textOverflow="ellipsis"
						value="${accountDetails.planName}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-balance"
						label="Account balance"
						value="${accountDetails.availableBalance}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-type"
						label="Account type"
						value="Multiple deposit">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-number"
						label="Account number"
						value="${accountDetails.accountNumber}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-date-fixed"
						label="Date fixed"
						value="${accountDetails.dateFixed}">
					</horizon-label>
					<horizon-label
						data-automation-id="unlock-ftsp-account-maturity-date"
						label="Maturity date"
						value="${accountDetails.maturityDate}">
					</horizon-label>
			</capitec-group>`;
	}

	_renderViewAgreementBar() {
		return Boolean(this.unlockType) && !isNullorEmpty(this.quoteRefNumber)
			? html`
				<horizon-product-tile 
					data-automation-id="unlock-ftsp-view-agreement"
					type="default"
					label="Agreement"
					subtitle="${this.selectedFromAccount.accountName}">
						<capitec-label 
							slot="detail"
							type="strong"
							label="View Document"
							class="viewDocumentLink"
							@click="${() => this._viewAgreement()}">
						</capitec-label>
				</horizon-product-tile>`
			: html``;
	}

	_renderAgreementInformation() {
		return html`
			<ul class="list-items">
				<li>The Flexible savings agreement is in addition/supplementary to the Savings Account Agreement, the terms of which are still binding</li>
				<li>Any calculations and potential interest are examples only, and not binding on Capitec</li>
				<li>You may choose to change a Flexible Savings Account into a Fixed-term Savings Account</li>
			</ul>

			<capitec-check
				data-automation-id="unlock-ftsp-accept-quote"
				label="I accept this quote"
				?checked=${this.agreementAccepted}
				@value-change="${(e) => this._acceptAgreement(e)}">
			</capitec-check>
		`;
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
					?disabled="${this.shouldDisable(`unlock-ftsp`) || !(this.agreementAccepted && Boolean(this.unlockType)) || Boolean(this.errMessage)}"
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
							: html`<p>You are about to make a <b>${this.partialUnlockAmount} Partial unlock</b> from ${this.selectedFromAccount.accountName} Fixed-term Savings Plan to ${this.selectedToAccount.accountName}.</p>`}
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