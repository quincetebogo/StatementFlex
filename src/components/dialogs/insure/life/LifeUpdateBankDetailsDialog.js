import { ACCOUNT_TYPES, BANK_OPTIONS, DEBIT_ORDER_DAY_OPTIONS, EMAIL_ADDRESS_ERROR_MESSAGES } from 'app/constants/InsureCommon';
import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const STEPS = {
	PAYMENT_DETAILS: 1,
	AGREEMENT: 2
};

/**
 * @export
 * @class LifeUpdateBankDetailsDialog
 * @extends {Component}
 */
class LifeUpdateBankDetailsDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = STEPS.PAYMENT_DETAILS;
		this.collectionDayOptions = DEBIT_ORDER_DAY_OPTIONS;
		this.bankNameOptions = BANK_OPTIONS;
		this.accountTypeOptions = ACCOUNT_TYPES;

		this.branchCodeDisabled = true;
		this.disableAccountNumber = true;
		this.accountNumberErrorMsg = ``;
		this.showAgreementDocumentDialog = false;
		this.defaultSavingsAccountNumber = ``;
	}s

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 * @property {Object} policy Policy being updated
	 * @property {Number} currentStep Index of current step on stepper
	 * @property {Number} collectionDay Collection day formatted value
	 * @property {Boolean} branchCodeDisabled Flag to control when to disable branch code
	 * @property {String} accountNumberErrorMsg Error message for invalid or blank account numbers
	 * @property {Boolean} showAgreementDocumentDialog Flag to control when to show agreement dialog
	 * @property {String} emailAddress Email address to send agreement too
	 * @property {String} confirmedEmailAddress Confirmed email address to send agreement too
	 * @property {String} emailAlertBannerMessage Error message for email addresses
	 * @property {Function} getLifeUpdateBankingDetailsDocument callback function to get agreement
	 * @property {Object} lifeUpdateBankingDetailsAgreement contains agreement content
	 * @property {String} defaultSavingsAccountNumber default account number if available
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			currentStep: { type: Number, state: true },
			collectionDay: { type: Number, state: true },
			branchCodeDisabled: { type: Boolean, state: true },
			accountNumberErrorMsg: { type: String, state: true },
			showAgreementDocumentDialog: { type: Boolean, state: true },
			emailAddress: { type: String, state: true },
			confirmedEmailAddress: { type: String, state: true },
			emailAlertBannerMessage: { type: String, state: true },
			getLifeUpdateBankingDetailsDocument: { type: Object, state: true },
			lifeUpdateBankingDetailsAgreement: { type: Object, state: true },
			defaultSavingsAccountNumber: { type: String, state: true },
			getDefaultSavingsAccountNumber: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();
		this.collectionDay = this.policy.bankDetails.collectionDay;
		this.updatedPolicy = JSON.parse(JSON.stringify(this.policy));

		await this.getDefaultSavingsAccountNumber();
	}

	/**
	 * Disconnected from DOM callback
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	/** Change format of the bank returned to match the format of banks in the list
	 * @returns {String} Bank name
	 */
	_getBankName() {
		let bank = this.bankNameOptions.find(banks => banks.code === this.updatedPolicy?.bankDetails?.bank.toUpperCase().trim());
		if (isNullorEmpty(bank?.text)) {
			bank = this.bankNameOptions.find(banks => banks.branchCode === this.updatedPolicy?.bankDetails?.branchCode.toUpperCase().trim());
		}
		return bank?.text;
	}

	/**
	 * Change format of the collection day value returned to match the format of the collection day list
	 *  @returns {String} day formatted text
	 */
	_getCollectionDay() {
		if (!this.collectionDay) {
			return ``;
		}
		const day = this.collectionDayOptions.find(days => days.code.toString() === this.collectionDay.toString());
		return day?.text;
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Bank name change handler
	 * @param {Object} e event
	 * @returns {void}  
	 */
	_bankNameChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.bank = e.detail.new.code;
			this.updatedPolicy.bankDetails.branchCode = e.detail.new.branchCode;

			if (this.updatedPolicy.bankDetails.branchCode === `0`) {
				this.branchCodeDisabled = false;
			} else {
				this.branchCodeDisabled = true;
			}

			if (this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC BANK`) {
				if (this.defaultSavingsAccountNumber === ``) {
					this.updatedPolicy.bankDetails.accountNumber = ``;
					this.accountNumberErrorMsg = `Account number is a required field`;
					this.disableAccountNumber = false;
				} else {
					this.updatedPolicy.bankDetails.accountNumber = this.defaultSavingsAccountNumber;
					this.accountNumberErrorMsg = ``;
					this.disableAccountNumber = true;
				}
			} else {
				this.updatedPolicy.bankDetails.accountNumber = ``;
				this.accountNumberErrorMsg = `Account number is a required field`;
				this.disableAccountNumber = false;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Collection day change handler
	 * @param {Object} e event
	 * @returns {void}  
	 */
	_collectionDayChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.collectionDay = e.detail.new.code;
		}
	}

	/**
	 * Account Number change handler
	 * @param {Object} e event
	 * @returns {void}  
	 */
	_accountNumChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.accountNumber = e.detail.new;
			this.accountNumberErrorMsg = ``;
		}
	
	}

	/**
	 * Account Type change handler
	 * @param {Object} e event
	 * @returns {void}  
	 */
	_accountTypeChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.accountType = e.detail.new.code;
		}
	
	}

	/**
	 * Branch code change handler
	 * @param {Object} e event
	 * @returns {void}  
	 */
	_branchCodeChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.branchCode = e.detail.new;
		}
	}

	/**
	 * Clear alert banner message 
	 * 
	 * @returns {void}
	 */
	_clearAlerts() {
		this.emailAlertBannerMessage = ``;
	}

	/**
	 * Update banking details service call
	 * @returns {void}  
	 */
	async _updatePaymentDetails() {
		const result = await this.getLifeUpdateBankingDetailsDocument(this.updatedPolicy);
		if (!result) {
			return;
		}
		this.currentStep = STEPS.AGREEMENT;
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
	 * Send email event
	 * @returns {void}  
	 */
	_sendEmail() {
		const validEmail = this._validateEmailAddress();
		if (!validEmail) {
			return;
		}

		this.dispatchEvent(new CustomEvent(`agree`, { detail: {
			policy: this.updatedPolicy,
			email: this.email
		} }));
	}

	/**
	 * Back event from dialog footer button, closes dialog
	 * @returns {void} 
	 */
	_backClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	// #endregion EVENT HANDLERS

	// #region RENDERING

	/**
	 * Generates the component stylesheet.
	 *
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

				.alert{
					--theme-toast-width: 100%;
					margin-bottom: 20px;
				}

				.alert-banner{
					margin-top: 20px;
					width: 100%;
				}

				.banking-form-input{
					width: 100%; 
					margin-bottom: 20px;
				}

				.banking-form-body{
					padding: 40px 20px 0px 20px; 
					min-height: 400px;
				}

				.agreement-form-body{
					padding: 5px 5px 0px;
					min-height: 400px;
				}

				.title-label{
					margin-top: 20px;
					margin-bottom: 10px;
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
			<capitec-modal type="free" header="${this.updatedPolicy?.contractReference} - Update Payment Details">
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
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			<capitec-stepper
				layout="horizontal"
				.steps="${[{ title: `Payment details` }, { title: `Agreement` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			<div style="${this.currentStep === STEPS.PAYMENT_DETAILS ? `display: block` : `display: none`}">
					${this._renderPaymentDetailsPage()}
			</div>
				
			<div style="${this.currentStep === STEPS.AGREEMENT ? `display: block` : `display: none`}">
					${this._renderAgreementPage()}
			</div>
		`;
	}

	/**
	 * Render modal footer section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
		${this.currentStep === STEPS.PAYMENT_DETAILS ? html`
			<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel" @click="${() => this._backClick()}">
			</capitec-button>

			<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._updatePaymentDetails()}">
			</capitec-button>
		` : html``}
				
		${this.currentStep === STEPS.AGREEMENT ? html`

			<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Back" @click="${() => this.currentStep = STEPS.PAYMENT_DETAILS}">
			</capitec-button>

			<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Update" @click="${() => this._sendEmail()}">
			</capitec-button>
		` : html``}
		`;
	}

	_renderPaymentDetailsPage() {
		return html`
		<div class="banking-form-body" >
			<div>
				<capitec-select
					label="Collection Day" 
					display-field="text" 
					id-field="text"
					class="banking-form-input"
					.items="${this.collectionDayOptions}"
					.value="${this._getCollectionDay()}"
					@value-changed = "${(e) => this._collectionDayChanged(e)}">
				</capitec-select>
			</div>
			<div>
				<capitec-select 
					label="Bank" 
					display-field="text" 
					id-field="code"
					class="banking-form-input"
					.items="${this.bankNameOptions}"
					value="${this._getBankName()}"
					@value-changed = "${(e) => this._bankNameChanged(e)}">
				</capitec-select>
				<capitec-text-field 
					label="Account Number" 
					type="numeric" 
					class="banking-form-input"
					value="${this.updatedPolicy?.bankDetails?.accountNumber}"
					error = "${this.accountNumberErrorMsg}"
					.disabled = "${this.disableAccountNumber}"
					@value-changed = "${(e) => this._accountNumChanged(e)}">
				</capitec-text-field>
			</div>

			<div>
				<capitec-select 
					label="Account Type" 
					display-field="text"
					id-field="code" 
					class="banking-form-input"
					.items="${this.accountTypeOptions}"
					value="${this.updatedPolicy?.bankDetails?.accountType}"
					@value-changed = "${(e) => this._accountTypeChanged(e)}">
				</capitec-select>
				<capitec-text-field 
					label="Branch Code" 
					type="numeric" 
					class="banking-form-input"
					value="${this.updatedPolicy?.bankDetails?.branchCode}"
					?disabled = "${this.branchCodeDisabled}"
					@value-changed = "${(e) => this._branchCodeChanged(e)}">
				</capitec-text-field>
			</div>
		</div>
		`;
	}

	_renderAgreementPage() {
		return html`
		<div class="agreement-form-body">
			<capitec-content-box>
				<horizon-product-tile class="view-document" type="default" label="Agreement" subtitle="Life Cover" icon="" @click="${() => this.showAgreementDocumentDialog = true}">
					<capitec-label slot="detail" type="strong" label="View Document">
					</capitec-label>
				</horizon-product-tile>

				${this._renderEmailAlertBanner()}
				<horizon-email-input
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
	 * Render email alert banner
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
		return this.showAgreementDocumentDialog === false ? html``
			: html`
			<horizon-insure-agreement-dialog
				.agreementContent="${this.lifeUpdateBankingDetailsAgreement.documentContent?.base64EncodedString}"
				@back-click="${() => this.showAgreementDocumentDialog = false}">
			</horizon-insure-agreement-dialog>
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-update-bank-details-dialog`, LifeUpdateBankDetailsDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-update-bank-details-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-update-bank-details-dialog>
 *
 * @event LifeUpdateBankDetailsDialog#close-modal
 * @type {Object} - N/A
 */