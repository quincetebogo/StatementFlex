import { Component, css, html } from 'platform/elements';
import { EMAIL_ADDRESS_ERROR_MESSAGES, LIFE_ARREARS_STATUSES } from 'app/constants/InsureCommon';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { validateEmailAddressCombo } from 'app/utils/insureUtils';
import 'app/components/dialogs/insure/AgreementDialog';
import 'app/components/dialogs/insure/life/LifePayArrearsConfirmationDialog';
import 'app/components/insure/InsureAccountSelect';

// Dialog steps
const STEPS = {
	ARREARS_DETAILS: 1,
	AGREEMENT: 2
};

// Error message options for arrears form
const ARREARS_ERROR_MESSAGES = {
	NO_ACCOUNT_SELECTED: `Select an account to pay from`,
	NO_ARREARS_SELECTED: `Select arrears amount to pay`,
	INSUFFICIENT_FUNDS: `Insufficient funds: Payment cannot exceed available balance`
};

/**
 * Life pay arrears dialog
 * 
 * Events Raised 
 * -------------
 * close-dialog
 *  
 * @export
 * @class LifePayArrearsDialog
 * @extends {Component}
 */
class LifePayArrearsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.accountSelected = false;

		this.agreementDetails = {};
		this.showAgreementDialog = false;

		this.currentStep = STEPS.ARREARS_DETAILS;
		this.email = ``;
		this.confirmEmail = ``;
		this.emailAlertBannerMessage = ``;
		this.arrearsAlertBannerMessage = ``;
		this.showConfirmationDialog = false;

		this.totalPolicyArrears = 0;
		this.totalSelectedArrears = 0;
		this.selectedArrears = [];

		this.payableAccounts = [];
		this.selectedAccount = {};

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	static get properties() {
		return {
			policy: { type: Object, state: true },
			insufficientFunds: { type: Boolean, state: true },
			payableAccounts: { type: Array, state: true },
			accountSelected: { type: Boolean, state: true },
			selectedAccountNumber: { type: String, state: true },
			selectedAccountType: { type: String, state: true },
			selectedArrears: { type: Array, state: true },

			executeLifePayArrearsGenerateAgreementDocument: { type: Object, state: true },
			executeLifePayArrears: { type: Object, state: true },
			executeLifeArrearsSendEmail: { type: Object, state: true },

			agreementDetails: { type: Object, state: true },
			generatePayArrearsDocument: { type: Object, state: true },
			showAgreementDialog: { type: Boolean, state: true },

			currentStep: { type: Number, state: true },
			email: { type: String, state: true },
			confirmEmail: { type: String, state: true },
			emailAlertBannerMessage: { type: String, state: true },
			arrearsAlertBannerMessage: { type: String, state: true },
			showConfirmationDialog: { type: Boolean, state: true },
			lifePolicyArrears: { type: Object, state: true },
			selectedAccount: { type: Object, state: true }

		};
	}

	//  #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this._initialise();
	}

	/**
	 * Callback when component disconnected from DOM
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES

	//  #region PRIVATE METHODS

	_initialise() {

		if (this.lifePolicyArrears.arrears) {
			this.lifePolicyArrears.arrears.forEach(arrears => {
				if (arrears?.arrearsPaymentStatus !== LIFE_ARREARS_STATUSES.PAID) {
				this.totalPolicyArrears += parseFloat(arrears.arrearsPaymentDueAmount, 10);
				}
			});
		}
		this.payableAccounts = this.lifePolicyArrears.payableAccounts;
		// this.selectedAccountType = `Savings`;
		// this.accountSelected = true;

		// Suffecient funds?


		// Relook how will we get this data?
		// this.payableAccounts = [
		// 	{
		// 		"accountName": `SAVINGS ACCOUNT`,
		// 		"branchCode": `470010`,
		// 		"accountNumber": `2009939669`,
		// 		"bank": `Capitec Bank`,
		// 		"accountType": `Savings`,
		// 		"availableBalance": 120,
		// 		"currentBalance": 250
		// 	},
		// 	{
		// 		"accountName": `SAVINGS PLAN`,
		// 		"branchCode": `470010`,
		// 		"accountNumber": `2009939660`,
		// 		"bank": `Capitec Bank`,
		// 		"accountType": `Savings`,
		// 		"availableBalance": 200,
		// 		"currentBalance": 250
		// 	}
		// ];
	}

	/**
	 * Change event when checkbox is clicked
	 * @param {*} arrear current arrears object
	 * @param {*} index checkbox index
	 * @param {*} e event
	 * @returns {void}
	 */
	_arrearsCheckedChange(arrear, index, e) {
		this.totalSelectedArrears = parseFloat(this.totalSelectedArrears);
		if (e.detail.new === true) {
			this.totalSelectedArrears += parseFloat(arrear.arrearsPaymentDueAmount);
			this.selectedArrears.push({
				dueDate: arrear.arrearsPaymentDueDate,
				amount: arrear.arrearsPaymentDueAmount,
				objectId: arrear.arrearsId
			});
		} else {
			this.insufficientFunds = false;
			this.accountSelected = true;
			this.totalSelectedArrears -= parseFloat(arrear.arrearsPaymentDueAmount);

			const existingArrearsIndex = this.selectedArrears.findIndex((arrearObject) => arrearObject.objectId === arrear.arrearsId);
			this.selectedArrears.splice(existingArrearsIndex, 1);
		}
		if (this.selectedArrears.length === 0) {
			this.totalSelectedArrears = 0;
		} else {
			this.totalSelectedArrears = parseFloat(this.totalSelectedArrears.toFixed(2));
		}
		this.requestUpdate();
	}

	/**
	 * Back event from dialog footer button, takes you back to previous step
	 * 
	 * @returns {void}
	 */
	_backToArrearsStep() {
		this.currentStep = STEPS.ARREARS_DETAILS;
	}

	/**
	 * Change event for email address
	 * @param {event} e e
	 * @returns {void}
	 */
	_emailValueChanged(e) {
		this.email = e.detail.email;
		this.confirmEmail = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_MISMATCH;
		}
	}

	/**
	 * Validation checks for email address
	 * @returns {boolean} boolean for whether the alert banner message is empty or not
	 */
	_validateEmailAddress() {
		if (isNullorEmpty(this.email) || isNullorEmpty(this.confirmEmail)) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED;
		}
		return isNullorEmpty(this.emailAlertBannerMessage);
	}

	/**
	 * Clear alert banner message 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.emailAlertBannerMessage = ``;
		this.arrearsAlertBannerMessage = ``;
	}

	/**
	 * Event from account select box containing the selected account
	 * @param {*} e event
	 * @returns {void}
	 */
	_accountSelected(e) {
		this.accountSelected = e.detail.optionSelected;
		this.insufficientFunds = false;
		this.arrearsAlertBannerMessage = ``;

		this.selectedAccountNumber = e.detail.accountNumber;
		this.selectedAccountType = e.detail.accountType;
	}

	/**
	 * Check if all validation has passed, then process arrears request
	 * @returns {void}
	 */
	_settleArrearsValidate() {
		console.log(`in _settleArrearsValidate()`);
		console.log(`this.totalSelectedArrears :>> `, this.totalSelectedArrears);
		if (this.totalSelectedArrears === 0) {
			this.arrearsAlertBannerMessage = ARREARS_ERROR_MESSAGES.NO_ARREARS_SELECTED;
			return;
		}

		const index = this.payableAccounts.map(object => object.accountNumber).indexOf(this.selectedAccountNumber);
			if (this.payableAccounts[index]?.availableBalance < this.totalSelectedArrears) {
				this.accountSelected = false;
				this.insufficientFunds = true;
				this.arrearsAlertBannerMessage = ARREARS_ERROR_MESSAGES.INSUFFICIENT_FUNDS;
				return;
			} else if (this.accountSelected === false) {
				this.arrearsAlertBannerMessage = ARREARS_ERROR_MESSAGES.NO_ACCOUNT_SELECTED;
				return;
			}
		this.selectedAccount = this.payableAccounts[index];

		this.arrearsAlertBannerMessage = ``;
		this.showConfirmationDialog = true;
	}

	//  #endregion PRIVATE METHODS

	//  #region EVENT HANDLERS

	/**
	 * Cancel event from dialog footer button, closes dialog & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	/**
	 * Event from pay confirmation dialog
	 * @param {event} event Contains 'processPayment' boolean for further processing
	 * @returns {void}
	 */
	async _payDetailsConfirmation(event) {
		this.showConfirmationDialog = false;
		if (event.detail.processPayment === false) {
			return;
		}

		const agreementResult = await this.executeLifePayArrearsGenerateAgreementDocument(this.policy.contractReference, this.selectedAccountNumber, this.selectedArrears, false);
		if (isNullorEmpty(agreementResult)) {
			return;
		}
		this.agreementDetails = agreementResult.result;
		this.currentStep = STEPS.AGREEMENT;
	}

	/**
	 * Process payment and navigate to result page
	 * @returns {void}
	 */
	async _processPayment() {
		const isEmailInputValid = validateEmailAddressCombo(this.email, this.confirmEmail);
		if (isEmailInputValid === false) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.INVALID_EMAIL;
			return;
		}

		const payResult = await this.executeLifePayArrears(this.policy.contractReference, this.selectedAccount, this.selectedArrears);
		if (isNullorEmpty(payResult)) {
			return;
		}
		const agreementResult = await this.executeLifePayArrearsGenerateAgreementDocument(this.policy.contractReference, this.selectedAccountNumber, this.selectedArrears, true);
		if (isNullorEmpty(agreementResult)) {
			return;
		}
		await this.executeLifeArrearsSendEmail(this.policy.contractReference, formatCurrency(this.totalSelectedArrears), this.email, agreementResult);
	}

	//  #endregion EVENT HANDLERS

	//  #region RENDERING

	/**
	 * Generates the component stylesheet.
	 * @readonly
	 * @static
	 * @returns {css} CSS for the component.
	 */
	static get styles() {
		return [
			super.styles,
			css`
				${INSURE_CSS}
				capitec-modal {
					--theme-modal-header-background-color: #f7f7f7;
					--theme-modal-header-color: black; 
					--theme-modal-free-m-l-xl-width: 642px;
					--theme-modal-alert-m-l-xl-width: 840px;
					--theme-modal-body-padding: 0;
					z-index: 99;
				}

				horizon-product-tile {
					--theme-product-tile--height: 64px;
					--theme-product-tile-title-height: 20px;
					--theme-product-tile-title-font-size: 16px;
					--theme-product-tile-subtitle-height: 20px;
					--theme-product-tile-subtitle-font-size: 16px;
					--theme-product-tile-heading-margin-left: 16px;
					--theme-layout-gap-spacing: 8px;
					--theme-product-tile-title-font-weight: 600;
					--theme-radio-disabled-border-color: #E1E1E1;
					--theme-radio-disabled-background-color: #F7F7F7;
				}

				.pay-arrears-dialog{
					--theme-modal-alert-m-l-xl-width: 520px;
				}

				.arrears-form-body{
					padding: 0px; 
					margin: 0px 15px 0px 15px;
					min-height: 400px;
				}

				#arrears-info-banner{
					margin-bottom: 10px;
				}

				.account-selectbox{
					margin-bottom: 15px;
					margin-top: 5px;
				}

				.arrears-checkbox-group{
					margin-top: 10px;
					display: block;
				}

				.checkbox{
					border: 1px solid #e1e1e1;
					border-radius: 5px;
					padding: 10px;
					margin-bottom: 10px;
				}

				#arrears-title-label{
					margin-bottom: 10px;
					margin-top: 0px;
				}

				.view-document {
					--theme-product-tile-heading-margin-left: 16px;
					--theme-product-tile-detail-top: 20px;
					--theme-product-tile-detail-right: 16px;
				}

				.view-document > capitec-label[type="strong"] {
					line-height: 20px;
					cursor: pointer;

					--theme-label-font-color: #009DE0;
					--theme-label-strong-font-size: 16px;
					--theme-label-strong-font-weight: 600;
				}

				.alert{
					--theme-toast-width: 100%;
					margin-bottom: 20px;
				}

				.alert-banner{
					margin-top: 0px;
					width: 100%;
				}
				
				.emailAddressInput{
					margin: 10px 0px;
				}
				
				.account-label {
					position: relative; 
					right: 95px;
					
				}
				.select-header > capitec-content-box{
					border: 1px solid #e1e1e1;
					border-radius: 3px;
					height: 75px;
					display: flex;
					justify-content: space-between;
				}

				.select-header :hover{
					border-color: #009DE0;

				}

				.select-header :focus-within {
					border: 3px solid #009DE0;

				}
				`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
				${this._renderAgreementDialog()}
				${this._renderConfirmationDialog()}
				<capitec-modal type="free" header="${this.policy?.contractReference} - Life Cover Arrears">
					<div slot="body" style="width: 520px;">
						${this._renderDialogBody()}
					</div>
					<div slot="footer">
						${this._renderDialogFooter()}
					</div>
				</capitec-modal>
		`;
	}

	/**
	 * Render modal body section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<capitec-stepper
				layout="horizontal"
				.steps="${[{ title: `Details` }, { title: `Agreement` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			<div style="${this.currentStep === STEPS.ARREARS_DETAILS ? `display: block` : `display: none`}">
				<capitec-content-box gap="10px;">
					<horizon-alert-banner
						id="arrears-info-banner"
						type="info"
						header="Notify client:"
						label="The total arrears amount for this policy is ${formatCurrency(this.totalPolicyArrears)}"
						layout="vertical">
					</horizon-alert-banner>

					${this.arrearsAlertBannerMessage === `` ? html`` : html`
					<horizon-alert-banner
						type="error"
						header="Notify client:"
						label="${this.arrearsAlertBannerMessage}"
						layout="vertical">
					</horizon-alert-banner>`}
				</capitec-content-box>
				<div class="arrears-form-body">
					<capitec-label type="title" label="Settle from account" id="arrears-title-label"></capitec-label>
					<!-- Single account - temporary until service can provide payable accounts -->
					<!-- <div class="account-selectbox">
						<div class="select-header">
							<capitec-content-box layout="horizontal" valign="center" noScroll  halign="left"  style="width: 490px">
								<div> 
									<capitec-icon size="default" icon="product/transact"></capitec-icon>
								</div>
								<div style="display: flex; flex-direction: column;">
									<capitec-label class="account-label" type="subtitle" label="SAVINGS ACCOUNT" style="font-weight: bold;" ></capitec-label>
									<capitec-label class="account-label" type="subtitle" label="Available balance" ></capitec-label>
								</div>
								<div> 
									<capitec-label type="subtitle" label="${formatCurrency(this.defaultSavingsAccountAvailableBalance)}" style="position: relative; font-weight: bold;"></capitec-label>
								</div>
							</capitec-content-box>
						</div>
					</div> -->

					<insure-account-select 
						@option-selected="${(e) => this._accountSelected(e)}" data-automation-id="horizon-insure-pay-premium-dialog-accounts"
						.accountDetails = "${this.payableAccounts}" .insufficient = "${this.insufficientFunds}" .label= "${`Please select`}" .selectBoxWidth= "${`490px`}">
					</insure-account-select>

					<capitec-label type="subtitle" label="Choose arrears amount to pay"></capitec-label>
					<capitec-check-group class="arrears-checkbox-group">
						${this.lifePolicyArrears?.arrears?.map((arrear, index) => html`
							${arrear.arrearsPaymentStatus !== LIFE_ARREARS_STATUSES.PAID ? html`
								<capitec-check class="checkbox" label="${formatDate(arrear.arrearsPaymentDueDate, `MM yyyy`)} | ${formatCurrency(arrear.arrearsPaymentDueAmount)}"
									@value-change="${(e) => this._arrearsCheckedChange(arrear, index, e)}">
								</capitec-check>
							` : html``}
							
						`)}
					</capitec-check-group>
				</div>
			</div>
			
			<div style="${this.currentStep === STEPS.AGREEMENT ? `display: block` : `display: none`}">
				<capitec-content-box>
					<horizon-product-tile class="view-document" type="default" label="Arrears Payment Instruction" subtitle="Life Cover" icon="" @click="${() => this.showAgreementDialog = true}">
						<capitec-label slot="detail" type="strong" label="View Document">
						</capitec-label>
					</horizon-product-tile>

					${this._renderEmailAlertBanner()}

					<horizon-email-input
						class="emailAddressInput"
						labelOne="Enter email address"
						labelTwo="Confirm email"
						email="${this.email}"
						confirmEmail="${this.confirmEmail}"
						?showRequiredError="${this.emailAlertBannerMessage === EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED}"
						@value-changed="${(e) => this._emailValueChanged(e)}"
						.callBack="${() => this._clearAlerts()}">
					</horizon-email-input>
				</capitec-content-box>
			</div>
			`;
	}

	/**
	 * Render modal footer section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			${this.currentStep === STEPS.AGREEMENT ? html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Back"
						@click="${() => this._backToArrearsStep()}">
					</capitec-button>
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Pay"
						@click="${() => this._processPayment()}">
					</capitec-button>
				`
				: html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel"
						@click="${() => this._cancelClick()}">
					</capitec-button>
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next"
						@click="${() => this._settleArrearsValidate()}">
					</capitec-button>
			`}
		`;
	}

	/**
	 * Render the alert banner
	 * @returns {html} html content 
	 */
	_renderEmailAlertBanner() {
		return this.emailAlertBannerMessage
			? html`
			<horizon-alert-banner
				type="error"
				header="Notify client:"
				label="${this.emailAlertBannerMessage}"
				layout="vertical">
			</horizon-alert-banner>`
			: html``;
	}

	/**
	 * Render the agreement dialog
	 * @returns {html} html content 
	 */
	_renderAgreementDialog() {
		return this.showAgreementDialog === false
			? html``
			: html`
				<horizon-insure-agreement-dialog
				.agreementContent="${this.agreementDetails?.documentContent?.base64EncodedString}"
				@back-click="${() => this.showAgreementDialog = false}">
				</horizon-insure-agreement-dialog>
			`;
	}

	/**
	 * Render the confirmation / are you sure / dialog
	 * @returns {html} html content 
	 */
	_renderConfirmationDialog() {
		return this.showConfirmationDialog === false
			? html``
			: html`
			<horizon-insure-life-pay-arrears-confirmation-dialog
				.contractReference="${this.policy?.contractReference}"
				.amountToPay="${this.totalSelectedArrears}"
				.accountToPayFrom="${this.selectedAccountNumber}"
				@close-dialog="${(e) => this._payDetailsConfirmation(e)}">
			</horizon-insure-life-pay-arrears-confirmation-dialog>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-pay-arrears-dialog`, LifePayArrearsDialog);

/**
 * Send close dialog event to the consuming component when 'cancel' is clicked
 *
 * @example
 * <horizon-insure-life-pay-arrears-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-pay-arrears-dialog
 *
 * @event LifePayArrearsDialog#close-dialog
 * @type {Object} - N/A
 */