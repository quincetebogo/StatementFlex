import { Component, css, html } from 'platform/elements';
import { formatCurrency } from 'app/productControls/utilities/Currency';

import 'app/components/common/HorizonSelectIcon';
import 'app/components/common/HorizonProductTile'; 

/**
 * Screen for Unlocking Fixed Term Savings Plans when the clients requests access to their funds they have in these accounts
 *
 * Events Raised
 * -------------
 * 
 * back
 * 
 * @export
 * @class UnlockFTSP
 * @extends {Component}
 */


 export class UnlockFTSP extends Component {
	
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.unlockOptions = null;
		this.selectedFromAccount = null;
		this.selectedToAccount = null;
		this.selectedUnlockOption = null;
		this.partialUnlockAmount = null;
		this.unlockOptionsList = [
			`Full unlock`,
			`Partial unlock`
		];
		this.agreementAccepted = false;
		this.showConfirmModal = false;
		this.unlockFee = 0;
		this.quoteRefNumber = ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	
	connectedCallback() {
		super.connectedCallback();

		[this.selectedFromAccount] = this.unlockFromAccountsList;
		[this.selectedToAccount] = this.unlockToAccountsList;
		this.partialUnlockAmount = this.unlockOptions.partialUnlockAmount;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 *
	 * @property {Object} unlockOptions full/partial unlock details 
	 *
	 * @readonly
	 * @static
	 * @memberof UnlockFTSP
	 */
	static get properties() {
		return {
			unlockOptions: { type: Object },
			unlockFromAccountsList: { type: Object },
			unlockToAccountsList: { type: Object },
			savingsPlanDetails: { type: Object },

			getUnlockQuote: { type: Object },

			selectedUnlockOption: { state: true },
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

	async _chooseOption(e) {
		this.selectedUnlockOption = e.detail.new;
		this.agreementAccepted = false;

		if (this.selectedUnlockOption === `Full unlock`) {
			this.partialUnlockAmount = this.selectedFromAccount.availableBalance;

			const result = await this.getUnlockQuote(`Full`, this.selectedFromAccount.accountNumber, this.partialUnlockAmount);
			this.unlockFee = result.unlockFee;
			this.quoteRefNumber = result.quoteReferenceNumber;
		}
	}

	_chooseFromAccount(e) {
		this.selectedFromAccount = e.detail.new;
	}

	async _unlockAmountChange(e) {
		this.partialUnlockAmount = e.detail.new;
		const result = await this.getUnlockQuote(`Partial`, this.selectedFromAccount.accountNumber, this.partialUnlockAmount);
		this.unlockFee = result.unlockFee;
		this.quoteRefNumber = result.quoteReferenceNumber;
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
					margin: 22px 16px auto 37px;
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
					margin: 0px 0px 26px 37px;
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
					size="small"
					icon="system/arrow-left-action"
					@click="${() => this._back()}">
				</capitec-icon>
				<capitec-label label="Unlock Savings Plans" type="title"></capitec-label>
			</capitec-title-bar>
				
			<capitec-content-box noPadding>
				${this._renderAccountSelection()}
				${this._renderDetailsSelection()}
				${this._renderDisclosure()}
				${this._renderAccountDetailsBar()}
				${this._renderViewAgreementBar()}
				${this._renderAgreementInformation()}
				${this._renderConfirmModal()}
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
						class="${this.selectedUnlockOption !== `Partial unlock` ? `large-select` : ``}"
						data-automation-id="unlock-ftsp-from-account"
						label="Choose account"
						display-field="availableBalance"
						id-field="accountNumber"
						detail-label="Available balance"
						hint="${this.selectedUnlockOption === `Full unlock` ? `Unlock Fixed-term Savings to a Flexible Plan` : ``}"
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
		return this.selectedUnlockOption === `Partial unlock`
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
					value="${this.selectedUnlockOption}"
					select-mode="single"
					error="">
				</capitec-select>

				<capitec-group class="textfield-group" layout="horizontal" halign="left" valign="center" gap="clear">
					<capitec-text-field
						class="unlock-amount"
						data-automation-id="unlock-ftsp-partial-amount"
						label="Enter Unlock amount"
						type="currency"
						hint="Max unlock amount ${formatCurrency(this.partialUnlockAmount)}"
						value="${this.partialUnlockAmount}"
						@key-input="${(e) => this._unlockAmountChange(e)}"
						?disabled=${this.selectedUnlockOption === `Full unlock`}>
					</capitec-text-field>

					<capitec-text-field
						data-automation-id="unlock-ftsp-unlock-fee"
						label="Unlock fee"
						type="currency"
						value="${this.unlockFee}"
						@key-input="${(e) => this._budgetValueChange(e)}"
						?disabled=${this.selectedUnlockOption === `Full unlock`}>
					</capitec-text-field>
					
				</capitec-group>

			</capitec-group>
		`;
	}

	_renderDisclosure() {
		return html`
			<capitec-alert-banner
				data-automation-id="unlock-ftsp-disclosure-message"
				type="warning">
				<p><b>Disclosure:</b> By changing or Full unlocking a Fixed-term to a Flexible Savings Plan will affect your interest rates.</p>
			</capitec-alert-banner>`;
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
						data-automation-id=""
						label="Account name"
						textOverflow="ellipsis"
						value="${accountDetails.planName}">
					</horizon-label>
					<horizon-label
						data-automation-id=""
						label="Account balance"
						value="${accountDetails.availableBalance}">
					</horizon-label>
					<horizon-label
						data-automation-id=""
						label="Account Type"
						value="Multiple deposit">
					</horizon-label>
					<horizon-label
						data-automation-id=""
						label="Account number"
						value="${accountDetails.accountNumber}">
					</horizon-label>
					<horizon-label
						data-automation-id=""
						label="Date fixed"
						value="${accountDetails.dateFixed}%">
					</horizon-label>
					<horizon-label
						data-automation-id=""
						label="Maturity date"
						value="${accountDetails.maturityDate}">
					</horizon-label>
			</capitec-group>`;
	}

	_renderViewAgreementBar() {
		return Boolean(this.selectedUnlockOption)
			? html`
				<horizon-product-tile 
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
				data-automation-id=""
				class=""
				label="I accept this quote"
				@value-change="${(e) => this._acceptAgreement(e)}">
			</capitec-check>
		`;
	}

	_renderFooter() {
		return html`
			<capitec-button-bar>
				<capitec-button
					label="Cancel"
					@click="${() => this._back()}">
				</capitec-button>
				<capitec-button 
					type="primary"
					label="${this.selectedUnlockOption === `Partial unlock` ? `Transfer` : `Unlock`}"
					?disabled="${!(this.agreementAccepted && Boolean(this.selectedUnlockOption))}"
					@click="${() => this._unlockOrTransferPlan()}">
				</capitec-button>
			</capitec-button-bar>`;
	}

	_renderConfirmModal() {
		return this.showConfirmModal 
		? html`
			<capitec-modal type="free" header-align="left">
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
						${this.selectedUnlockOption === `Full unlock` 
							? html`<p>You are about to change <b>${this.selectedFromAccount.accountName} Fixed-term to a Flexible Savings Plan</b> will affect your interest rate.</p>`
							: html`<p>You are about to make a <b>${this.partialUnlockAmount} Partial unlock</b> from ${this.selectedFromAccount.accountName} Fixed-term Savings Plan to ${this.selectedToAccount.accountName}.</p>`}
						<p>Are you sure you want to continue?</p>
					</capitec-content-box>
				</div>
				<div slot="footer">
					<capitec-group layout="horizontal">
						<capitec-button 
							label="Cancel"
							class="confirm-cancel"
							@click="${() => this._cancelConfirmUnlock()}">
						</capitec-button>

						<capitec-button 
							type="primary"
							label="${this.selectedUnlockOption === `Partial unlock` ? `Transfer` : `Unlock`}"
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