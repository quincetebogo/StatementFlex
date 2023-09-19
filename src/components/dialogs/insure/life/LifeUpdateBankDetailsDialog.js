import { ACCOUNT_TYPES, BANK_OPTIONS, DEBIT_ORDER_DAY_OPTIONS } from 'app/constants/InsureCommon';
import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';


const STEPS = {
	PAYMENT_DETAILS: 1,
	AGREEMENT: 2
};

const ERROR_MESSAGES = {
	EMAIL_REQUIRED: `Complete all fields to continue`,
	INVALID_EMAIL: `Enter a valid email address`,
	EMAIL_MISMATCH: `Email address does not match. Please confirm email`
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
		this.accountNumberErrorMsg = ``;
		this.showAgreementDocumentDialog = false;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
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
			emailAlertBannerMessage: { type: String, state: true }
		};
	}

	// #endregion PROPERTIES

	//  #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	connectedCallback() {
		super.connectedCallback();
		this.collectionDay = this.policy.bankDetails.collectionDay;
	}

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	/** change format of the bank returned to match the format of banks in the list
	 * @returns {String} null
	 */
	_getBankName() {
		let bank = this.bankNameOptions.find(banks => banks.code === this.policy?.bankDetails?.bank.toUpperCase().trim());
		if (isNullorEmpty(bank?.text)) {
			bank = this.bankNameOptions.find(banks => banks.branchCode === this.policy?.bankDetails?.branchCode.toUpperCase().trim());
		}
		return bank?.text;
	}

	/**
	 * change format of the collection day value returned to match the format of the collection day list
	 * 
	 *  @returns {String} day text
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

	_bankNameChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.policy.bankDetails.bank = e.detail.new.code;
			this.policy.bankDetails.branchCode = e.detail.new.branchCode;

			if (this.policy.bankDetails.branchCode === `0`) {
				this.branchCodeDisabled = false;
			} else {
				this.branchCodeDisabled = true;
			}

			this.policy.bankDetails.accountNumber = ``;
			this.accountNumberErrorMsg = `Account number is a required field`;
		}
		this.requestUpdate();
	}

	_collectionDayChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.policy.bankDetails.collectionDay = e.detail.new.code;
		}
	}

	_updatePaymentDetails() {
		// CALL Service
		this.currentStep = STEPS.AGREEMENT;
	}

	_sendEmail() {
		// Navigate to success page
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	/**
	 * event to show the agreement dialog
	 * 
	 * @returns {void}
	 */
	_showAgreement() {
		this.showAgreementDocumentDialog = true;
	}

	/**
	 * back event from dialog footer button, closes modal & reset toggles 
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
					min-height: 380px;
				}

				.agreement-form-body{
					padding: 5px 5px 0px;
					min-height: 390px;
				}

				.title-label{
					margin-top: 20px;
					margin-bottom: 10px;
				}`
		];
	}

	/**
	 * Main render point for component
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		return html`
			${this._renderAgreementDialog()}
			<capitec-modal type="free" header="${this.policy?.contractReference} - Update Payment Details">
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
				.steps="${[{ title: `Payment details` }, { title: `Agreement` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			${this.currentStep === STEPS.PAYMENT_DETAILS ? html`
				<div class="banking-form-body">
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
							value="${this.policy?.bankDetails?.accountNumber}"
							error = "${this.accountNumberErrorMsg}">
						</capitec-text-field>
					</div>

					<div>
						<capitec-select 
							label="Account Type" 
							display-field="text"
							id-field="code" 
							class="banking-form-input"
							.items="${this.accountTypeOptions}"
							value="${this.policy?.bankDetails?.accountType}">
						</capitec-select>
						<capitec-text-field 
							label="Branch Code" 
							type="numeric" 
							class="banking-form-input"
							value="${this.policy?.bankDetails?.branchCode}"
							?disabled = "${this.branchCodeDisabled}">
						</capitec-text-field>
					</div>
				</div>
			` : html``}

			${this.currentStep === STEPS.AGREEMENT ? html`
				<div class="agreement-form-body">
					<capitec-content-box>
						<horizon-product-tile class="view-document" type="default" label="Life Cover Agreement" subtitle="Life Policy" icon="" @click="${() => this._showAgreement()}">
							<capitec-label slot="detail" type="strong" label="View Document">
							</capitec-label>
						</horizon-product-tile>

						<capitec-label type="title" label="Email policy agreement" class="title-label"></capitec-label>

						${this._renderAlertBanner()}
						<horizon-email-input
							labelOne="Enter email address"
							labelTwo="Confirm email"
							email="${this.emailAddress}"
							confirmEmail="${this.confirmedEmailAddress}"
							?showRequiredError="${this.emailAlertBannerMessage === ERROR_MESSAGES.EMAIL_REQUIRED}"
							@value-changed="${(e) => this._emailValueChanged(e)}"
							.callBack="${() => this.emailAlertBannerMessage = ``}">
						</horizon-email-input>
					</capitec-content-box>
				</div>
			` : html``}
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
		${this.currentStep === STEPS.PAYMENT_DETAILS ? html`
			<capitec-button class="capitec-button-medium" slot="footer" type="secondary" label="Cancel" @click="${() => this._backClick()}">
			</capitec-button>

			<capitec-button class="capitec-button-medium" slot="footer" type="primary" label="Update" @click="${() => this._updatePaymentDetails()}">
			</capitec-button>
		` : html``}
				
		${this.currentStep === STEPS.AGREEMENT ? html`
			<capitec-button class="capitec-button-medium" slot="footer" type="primary" label="Send" @click="${() => this._sendEmail()}">
			</capitec-button>
		` : html``}
		`;
	}

	/**
	 * render the alert banner
	 * 
	 * @returns {html} html content 
	 */
	_renderAlertBanner() {
		return this.emailAlertBannerMessage
			? html`
			<capitec-alert-banner type="unsuccessful-red" class="alert">
				<capitec-group layout="horizontal">
					<capitec-label
						type="subtitle"
						label="Notify:">
					</capitec-label>
					<capitec-label
						label="${this.emailAlertBannerMessage}">
					</capitec-label>
				</capitec-group>
			</capitec-alert-banner>`
			: html``;
	}

	/**
	 * render the agreement dialog
	 * 
	 * @returns {html} html content 
	 */
	_renderAgreementDialog() {
		return this.showAgreementDocumentDialog === false ? html``
			: html`
			<horizon-insure-agreement-dialog
				.agreementContent="${null}"
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