import { ACCOUNT_TYPES, BANK_OPTIONS, DEBIT_ORDER_DAY_OPTIONS, EMAIL_ADDRESS_ERROR_MESSAGES, LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { Component, css, html } from 'platform/elements';
import { LIFE_COVER_ERROR_MESSAGES, pocketBadgeColorClass, pocketBadgeLabel, validateEmailAddressCombo } from 'app/utils/insureUtils';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LifeAddBeneficiaryDialog } from './LifeAddBeneficiaryDialog';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { v4 } from 'uuid';


const DIALOG_TITLES = {
	ALLOCATE: `Allocate Money`,
	BENEFICIARIES: `Manage Beneficiaries`,
	PAYMENT_DETAILS: `Payment Details`,
	AGREEMENT: `Agreement`
};

const ERROR_MESSAGES = {
	ACCOUNT_NUMBER_REQUIRED: `Account number is a required field`,
	BRANCH_CODE_REQUIRED: `Branch code is a required field`
};

/**
 * @export
 * @class LifeAllocateCoverDialog
 * @extends {Component}
 */
class LifeAllocateCoverDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();
		this.isNewOffer = false;

		// Allocate values
		this.educationCoverValue = 0;
		this.onceOffCoverValue = 0;
		this.monthlyCoverValue = 0;
		this.monthlyTotalCoverValue = 0;

		// Allocate errors
		this.educationCoverError = ``;
		this.onceOffCoverError = ``;
		this.monthlyCoverError = ``;
		this.monthlyTotalCoverError = ``;

		// Beneficiaries
		this.showAddBeneficiaryDialog = false;
		this.showEditBeneficiaryDialog = false;
		this.showDeleteBeneficiaryDialog = false;

		// Payment details
		this.collectionDayOptions = DEBIT_ORDER_DAY_OPTIONS;
		this.bankNameOptions = BANK_OPTIONS;
		this.accountTypeOptions = ACCOUNT_TYPES;
		this.branchCodeDisabled = true;
		this.accountNumberDisabled = false;
		this.accountNumberErrorMsg = ``;
		this.branchCodeErrorMsg = ``;

		this.agreementEmail = ``;
		this.agreementEmailConfirm = ``;
		this.showAgreementDocumentDialog = false;

		// General controls
		this.dialogTitle = DIALOG_TITLES.ALLOCATE;
		this.currentDialogStep = 0;
	}

	static get properties() {
		return {
			currentPolicy: { type: Object, state: true },
			updatedPolicy: { type: Object, state: true },
			isNewOffer: { type: Boolean, state: true },
			newOffer: { type: Object, state: true },

			dialogTitle: { type: String, state: true },
			currentDialogStep: { type: Number, state: true },

			educationCoverValue: { type: Number, state: true },
			onceOffCoverValue: { type: Number, state: true },
			monthlyCoverValue: { type: Number, state: true },
			monthlyTotalCoverValue: { type: Number, state: true },
			educationCoverError: { type: String, state: true },
			onceOffCoverError: { type: String, state: true },
			monthlyCoverError: { type: String, state: true },
			monthlyTotalCoverError: { type: String, state: true },

			showAddBeneficiaryDialog: { type: Boolean, state: true },
			showEditBeneficiaryDialog: { type: Boolean, state: true },
			showDeleteBeneficiaryDialog: { type: Boolean, state: true },
			selectedBeneficiary: { type: Object, state: true },
			selectedPocketType: { type: String, state: true },
			addingChildBeneficiary: { type: Boolean, state: true },

			collectionDay: { type: Number, state: true },
			branchCodeDisabled: { type: Boolean, state: true },
			accountNumberErrorMsg: { type: String, state: true },
			accountNumberDisabled: { type: Boolean, state: true },
			branchCodeErrorMsg: { type: String, state: true },

			agreementDocumentContent: { type: String, state: true },
			agreementEmail: { type: String, state: true },
			agreementEmailConfirm: { type: String, state: true },
			emailAlertBannerMessage: { type: String, state: true },
			showAgreementDocumentDialog: { type: Boolean, state: true }
		};
	}

	// #endregion INITIALIZE

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
	 * Clean up the component once removed from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	/**
	 * Initialise the component.
	 * @returns {void}
	 */
	_initialise() {
		this.updatedPolicy = { ...this.currentPolicy };

		// Setup metadata
		for (const bene of this.updatedPolicy.beneficiaries) {
			bene.metaData = {
				educationBenefitAdded: false,
				monthlyBenefitAdded: false,
				onceOffBenefitAdded: false,
				uniqueId: v4()
			};
			if (bene.educationBenefitAmount > 0) {
				bene.metaData.educationBenefitAdded = true;
			}
			if (bene.monthlyPayoutBenefitAmount > 0) {
				bene.metaData.monthlyBenefitAdded = true;
			}
			if (bene.onceOffPayoutBenefitAmount > 0) {
				bene.metaData.onceOffBenefitAdded = true;
			}
		}

		// Payment details
		this.collectionDay = this.updatedPolicy.bankDetails.collectionDay;
		if (this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC` || this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC BANK`) {
			this.accountNumberDisabled = true;
		}

		console.log(this.updatedPolicy);
	}

	//  #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/**
	 * Set correct dialog title for step
	 * @param {Number} step current step
	 * @returns {void}
	 */
	_setDialogTitle(step) {
		if (step === 0) {
			this.dialogTitle = DIALOG_TITLES.ALLOCATE;
		} else if (step === 1) {
			this.dialogTitle = DIALOG_TITLES.BENEFICIARIES;
		} else if (step === 2) {
			this.dialogTitle = DIALOG_TITLES.PAYMENT_DETAILS;
		} else {
			this.dialogTitle = DIALOG_TITLES.AGREEMENT;
		}
	}

	// #region ALLOCATE

	_monthlyCoverChange(event, type) {
		if (type === `TOTAL`) {
			this.monthlyTotalCoverValue = event.detail.new;
			if (this.monthlyTotalCoverValue < 50000) {
				this.monthlyTotalCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM;
			} else {
				this.monthlyTotalCoverError = ``;
				this.monthlyCoverError = ``;
				this.monthlyCoverValue = this.monthlyTotalCoverValue / 24;
			}
		} else {
			this.monthlyCoverValue = event.detail.new;
			if (this.monthlyCoverValue < 2000) {
				this.monthlyCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM;
			} else {
				this.monthlyTotalCoverError = ``;
				this.monthlyCoverError = ``;
				this.monthlyTotalCoverValue = this.monthlyCoverValue * 24;
			}
		}
	}

	// Education cover input change
	_educationCoverChange(e) {
		if (e.detail.new !== e.detail.old) {
			const educationPocket = this.updatedPolicy.pockets.find(p => p.pocketType === LIFE_POCKET_TYPES.EDUCATION);
			educationPocket.coverage = e.detail.new;
			if (educationPocket.coverage < 50000) {
				this.educationCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM;
			} else {
				this.educationCoverError = ``;
			}
		}
	}

	// #endregion ALLOCATE


	// #region BENEFICIARIES

	_pocketHasCoverAllocated(pocketType) {
		const pocket = this.updatedPolicy.pockets.find(p => p.pocketType === pocketType);
		if (pocket.coverage > 0) {
			return true;
		}
		return false;
	}

	/**
	 * Determine message based on pocket type
	 * @param {string} pocketType - pocket type
	 * @returns {string} message
	 */
	_getBeneficiaryInfoMessage(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Choose who gets a monthly payout (up to 2):`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Choose whose education to pay for (up to 10):`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Choose who gets a once off payout (up to 2):`;
		}
	}

	_openAddBeneficiaryDialog(pocketType, isChild) {
		this.selectedPocketType = pocketType;
		this.addingChildBeneficiary = isChild;
		this.showAddBeneficiaryDialog = true;
	}

	_openEditBeneficiaryDialog(pocketType, beneficiary) {
		this.selectedBeneficiary = beneficiary;
		this.selectedPocketType = pocketType;
		this.showEditBeneficiaryDialog = true;
	}

	_openDeleteBeneficiaryDialog(pocketType, beneficiary) {
		this.selectedBeneficiary = beneficiary;
		this.selectedPocketType = pocketType;
		this.showDeleteBeneficiaryDialog = true;
	}

	_addBeneficiary(event) {

	}

	_editBeneficiary() {

	}

	_deleteBeneficiary() {
		for (const bene of this.updatedPolicy.beneficiaries) {
			if (bene.metaData.uniqueId === this.selectedBeneficiary.metaData.uniqueId) {
				if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
					bene.metaData.monthlyBenefitAdded = false;
					bene.monthlyPayoutBenefitAmount = 0;
				}
				if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
					bene.metaData.onceOffBenefitAdded = false;
					bene.onceOffPayoutBenefitAmount = 0;
				}
				if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
					bene.metaData.educationBenefitAdded = false;
					bene.educationBenefitAmount = 0;
				}
			}
		}
		this.showDeleteBeneficiaryDialog = false;
	}

	_allowAddBeneficiary(pocketType) {
		let totalBeneficiariesInPocket = 0;
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			for (const bene of this.updatedPolicy.beneficiaries) {
				if (bene.metaData.monthlyBenefitAdded === true) {
					totalBeneficiariesInPocket++;
				}
			}
			if (totalBeneficiariesInPocket >= 2) {
				return false;
			}
			return true;
		}
		if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			for (const bene of this.updatedPolicy.beneficiaries) {
				if (bene.metaData.onceOffBenefitAdded === true) {
					totalBeneficiariesInPocket++;
				}
			}
			if (totalBeneficiariesInPocket >= 2) {
				return false;
			}
			return true;
		}
		if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			for (const bene of this.updatedPolicy.beneficiaries) {
				if (bene.metaData.educationBenefitAdded === true) {
					totalBeneficiariesInPocket++;
				}
			}
			if (totalBeneficiariesInPocket >= 10) {
				return false;
			}
			return true;
		}
	}

	// #endregion BENEFICIARIES

	// #region PAYMENT DETAILS

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
				this.updatedPolicy.bankDetails.branchCode = ``;
				this.branchCodeErrorMsg = ERROR_MESSAGES.BRANCH_CODE_REQUIRED;
			} else {
				this.branchCodeDisabled = true;
				this.branchCodeErrorMsg = ``;
			}

			if (this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC` || this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC BANK`) {
				// TODO Set primary account number
				this.accountNumberDisabled = true;
				this.accountNumberErrorMsg = ``;
			} else {
				this.updatedPolicy.bankDetails.accountNumber = ``;
				this.accountNumberDisabled = false;
				this.accountNumberErrorMsg = ERROR_MESSAGES.ACCOUNT_NUMBER_REQUIRED;
			}
		}
		this.requestUpdate();
	}

	_accountNumberChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.accountNumber = e.detail.new;

			if (isNullorEmpty(this.updatedPolicy.bankDetails.accountNumber)) {
				this.accountNumberErrorMsg = ERROR_MESSAGES.ACCOUNT_NUMBER_REQUIRED;
			} else {
				this.accountNumberErrorMsg = ``;
			}
		}
		this.requestUpdate();
	}

	_accountTypeChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.accountType = e.detail.new.code;
		}
	}

	_branchCodeChanged(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatedPolicy.bankDetails.branchCode = e.detail.new;

			if (isNullorEmpty(this.updatedPolicy.bankDetails.branchCode)) {
				this.branchCodeErrorMsg = ERROR_MESSAGES.BRANCH_CODE_REQUIRED;
			} else {
				this.branchCodeErrorMsg = ``;
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

	// #endregion PAYMENT DETAILS

	// #region AGREEMENT

	_agreementEmailValueChanged(e) {
		this.agreementEmail = e.detail.email;
		this.agreementEmailConfirm = e.detail.confirmEmail;

		if (e.detail.invalidFormat) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.INVALID_EMAIL;
		} else if (e.detail.mismatched) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_MISMATCH;
		}
	}

	/**
	 * Clear alert banner message 
	 * @returns {void}
	 */
	_clearAgreementEmailAlerts() {
		this.emailAlertBannerMessage = ``;
	}

	// #endregion AGREEMENT

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * Next event from dialog footer button, validate step, call services and move to next step
	 * @returns {void}
	 */
	_nextStep() {

		let stepValid = true;

		// Allocate
		if (this.currentDialogStep === 0) {
			console.log(`Validating Step: Allocate`);
			stepValid = true;
		}

		// Beneficiaries
		if (this.currentDialogStep === 1) {
			console.log(`Validating Step: Beneficiaries`);
			stepValid = true;
		}

		// Payment details
		if (this.currentDialogStep === 2) {
			console.log(`Validating Step: Payment Details`);
			if (isNullorEmpty(this.updatedPolicy.bankDetails.accountNumber)) {
				this.accountNumberErrorMsg = ERROR_MESSAGES.ACCOUNT_NUMBER_REQUIRED;
				stepValid = false;
			}

			if (isNullorEmpty(this.updatedPolicy.bankDetails.branchCode)) {
				if (this.updatedPolicy.bankDetails.branchCode === ``) {
					this.branchCodeErrorMsg = ERROR_MESSAGES.BRANCH_CODE_REQUIRED;
				}
				stepValid = false;
			}

			// TODO Execute Agreement Call
			this.agreementDocumentContent = null;
		}

		// All good move on
		if (stepValid === true) {
			this.currentDialogStep++;
			this._setDialogTitle(this.currentDialogStep);
		}
	}

	/**
	 * Back event from dialog footer button, moves a step back
	 * @returns {void}
	 */
	_backStep() {
		this.currentDialogStep--;
		this._setDialogTitle(this.currentDialogStep);
	}

	/**
	 * Update policy and send email
	 * @returns {void}
	 */
	async _doneStep() {
		if (isNullorEmpty(this.agreementEmail)) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED;
			return;
		} else if (this.agreementEmail !== this.agreementEmailConfirm) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_MISMATCH;
			return;
		}
		const isEmailEmail = validateEmailAddressCombo(this.agreementEmail, this.agreementEmailConfirm);
		if (isEmailEmail === false) {
			this.emailAlertBannerMessage = EMAIL_ADDRESS_ERROR_MESSAGES.INVALID_EMAIL;
			return;
		}

		const updatePolicyRequest = {
			emailDetails: {
				emailAddress: this.agreementEmail,
				contractReference: this.updatedPolicy.contractReference
			}
		};
		await this.executeLifeUpdatePolicy(updatePolicyRequest);
	}

	/**
	 * Close event from dialog footer button, closes dialog
	 * @returns {void} 
	 */
	_closeClick() {
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
					--theme-modal-body-padding: 0;
				}

				:host > .tab-bar > .tab{

				}

				/** Allocate Step */

				#offer-details{
					min-height: 100px; 
					width: 100%;
					display: flex; 
					justify-content: space-evenly; 
					align-items: center;
					padding-top: 30px;
				}

				.offer-details-cell{
					text-align: center;
				}

				.offer-details-value{
					font-weight: bold;
					font-size: 20px;
				}

				#pocket-details{
					background-color: #FAF9FF;
					width: 100%;
					padding: 15px 15px 5px 15px;
					margin-top: 20px;
					border-radius: 16px;
					border: 1px solid #E1E1E1;
					display: flex;
					flex-direction: column;
				}

				.pocket-details-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					background-color: #FFF;
					padding: 14px 24px;
					border-radius:  5px;
					margin-bottom:15px;
				}

				.pocket-details-badge{
					display: flex;
					align-items: center;
				}

				.pocket-details-input{
					width: 200px;
				}

				.pocket-details-label{
					margin-right: 15px;
				}

				.pocket-type-label{
					padding-left:15px;
				}

				/** Beneficiary Step */

				#beneficiary-info-bar{
					background-color: rgb(244 244 244);
					border: 1px solid rgb(235 235 235);
					padding: 2px 12px;
					font-weight: 600;
					font-size: 14px;
					width: 100%;
				}

				.beneficiary-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					border-radius:  5px;
					margin-bottom:15px;
				}

				.beneficiary-list{
					width: 100%;
					min-height: 400px;
				}

				.no-cover-container{
					width: 100%;
					min-height: 440px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.add-beneficiary-button{
					width: 100%;
				}

				/** Payment Details Step */

				.banking-form-body{
					padding: 40px 20px 0px 20px; 
					min-height: 400px;
				}

				.banking-form-input{
					width: 100%; 
					margin-bottom: 20px;
				}

				/** Agreement */

				.agreement-form-body{
					padding: 5px 5px 0px;
					min-height: 400px;
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
			${this._renderMainDialog()}
			${this._renderAdditionalDialogs()}
		`;
	}

	/**
	 * Main dialog
	 * @returns {html} The html content of the component.
	 */
	_renderMainDialog() {
		return html`
			<capitec-modal type="form" header="${this.dialogTitle}" style="--theme-modal-header-color: black; ${this.currentDialogStep < 2 ? `--theme-modal-form-m-l-xl-width: 800px;` : `--theme-modal-form-m-l-xl-width: 500px;`} z-index: 4000;">
				<div slot="body" style="${this.currentDialogStep < 2 ? `width: 800px;` : `width: 500px;`} padding:0px;">
					${this._renderDialogBody()}
				</div>
				<div slot="footer">
					${this._renderDialogFooter()}
				</div>
			</capitec-modal>`;
	}

	/**
	 * Additional dialogs used in flow
	 * @returns {html} The html content of the component.
	 */
	_renderAdditionalDialogs() {
		return html`
			${this._renderAddBeneficiaryDialog()}
			${this._renderEditBeneficiaryDialog()}
			${this._renderDeleteBeneficiaryDialog()}
			${this._renderAgreementDialog()}
		`;
	}

	/**
	 * Render dialog body section
	 * @returns {html} The html content of the component.
	 */
	_renderDialogBody() {
		return html`
			${this.currentDialogStep === 0 ? html`${this._renderStepAllocatePockets()}` : html``}
			${this.currentDialogStep === 1 ? html`${this._renderStepBeneficiaries()}` : html``}
			${this.currentDialogStep === 2 ? html`${this._renderStepPaymentDetails()}` : html``}
			${this.currentDialogStep === 3 ? html`${this._renderStepAgreement()}` : html``}
		`;
	}

	/**
	 * Step 0 - Allocate cover to pockets
	 * @returns {html} content of step
	 */
	_renderStepAllocatePockets() {
		return html`
			<div id="offer-details">
				${this.isNewOffer === true ? html`
					<div class="offer-details-cell">
						<div>New offer cover amount</div>
						<div class="offer-details-value">${formatCurrency(100)}</div>
					</div>
				` : html``}
				<div class="offer-details-cell">
					<div>Current cover amount</div>
					<div class="offer-details-value">${formatCurrency(this.currentPolicy?.totalPolicySumAssured)}</div>
				</div>
				<div class="offer-details-cell">
					<div>Remaining</div>
					<div class="offer-details-value">${formatCurrency(0)}</div>
				</div>
			</div>
			<div style="padding: 20px;">
				<div id="pocket-details">
					<div class="pocket-details-card">
						<div class="pocket-details-badge">
							<capitec-icon icon="/insure_monthly_pocket" size="large"></capitec-icon>
							<capitec-label type="strong"
								class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.MONTHLY)}"
								.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.MONTHLY)}">
							</capitec-label>
						</div>
						<div style="display: flex;">
							<capitec-text-field 
								type="currency" 
								class="pocket-details-input pocket-details-label" 
								label="Cover amount"
								value="${this.monthlyTotalCoverValue}"
								@value-changed="${(e) => this._monthlyCoverChange(e, `TOTAL`)}"
								error="${this.monthlyTotalCoverError}">
							</capitec-text-field>
							<capitec-text-field 
								type="currency" 
								class="pocket-details-input" 
								label="They get" 
								value="${this.monthlyCoverValue}"
								@value-changed="${(e) => this._monthlyCoverChange(e, `PERMONTH`)}"
								error="${this.monthlyCoverError}">
							</capitec-text-field>
						</div>
					</div>
					<div class="pocket-details-card">
						<div class="pocket-details-badge">
							<capitec-icon icon="/insure_once_off_pocket" size="large"></capitec-icon>
							<capitec-label type="strong"
								class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.ONCEOFF)}"
								.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.ONCEOFF)}">
							</capitec-label>
						</div>
						<div style="display: flex;">
							<capitec-text-field 
								type="currency" 
								class="pocket-details-input" 
								label="They get" 
								value="${this.onceOffCoverValue}"
								@value-changed="${(e) => this._onceOffCoverChange(e)}"
								error="${this.onceOffCoverError}">
							</capitec-text-field>
						</div>
					</div>
					<div class="pocket-details-card">
						<div class="pocket-details-badge">
							<capitec-icon icon="/insure_education_pocket" size="large"></capitec-icon>
							<capitec-label 
								type="strong"
								class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.EDUCATION)}"
								.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.EDUCATION)}">
							</capitec-label>
						</div>
						<div style="display: flex;">
							<capitec-text-field 
								type="currency" 
								class="pocket-details-input" 
								label="They get" 
								value="${this.educationCoverValue}"
								@value-changed="${(e) => this._educationCoverChange(e)}"
								error="${this.educationCoverError}">
							</capitec-text-field>
						</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * Step 1 - Manage beneficiaries and cover allocation
	 * @returns {html} content of step
	 */
	_renderStepBeneficiaries() {
		return html`
			<capitec-tab-group style="--theme-tab-min-width: 265px;">

				<!-- Monthly -->
				<capitec-tab label="Monthly Payout" layout="vertical" halign="left">

					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.MONTHLY) === true ? html`
						<div id="beneficiary-info-bar">
							${this._getBeneficiaryInfoMessage(LIFE_POCKET_TYPES.MONTHLY)}
						</div>

						<div class="beneficiary-list">
							${this.updatedPolicy.beneficiaries.map(bene => html`
								${bene.metaData.monthlyBenefitAdded === true ? html`
								<div class="beneficiary-card">
									<div style="display: flex; gap:20px;">
										<capitec-avatar value="${bene.firstName.charAt(0) + bene.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
										<horizon-label
											label="${bene.relationship}"
											value="${`${bene.firstName} ${bene.lastName}`}">
										</horizon-label>
									</div>
									<div style="display: flex; gap: 20px;">
										<horizon-label
											label="Term"
											value="24 months">
										</horizon-label>
										<horizon-label
											label="Cover amount"
											value="${formatCurrency(bene.monthlyPayoutBenefitAmount)}">
										</horizon-label>
										<capitec-overflow-menu label="More">
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY, bene)}" label="Edit Beneficiary"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY, bene)}" label="Delete Beneficiary"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>` : html``}`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.MONTHLY) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY)}"  class="add-beneficiary-button" icon="system/add-action" label="Add another beneficiary"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to pocket"
									value="Go back to allocate cover to this pocket first in order to add a beneficiary">
								</horizon-label>
							</div>
						</div>
					`}
				</capitec-tab>
				
				<!-- Once Off -->
				<capitec-tab label="Once Off Payout" layout="vertical" halign="left">
					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.ONCEOFF) === true ? html`
						<div id="beneficiary-info-bar">
							${this._getBeneficiaryInfoMessage(LIFE_POCKET_TYPES.ONCEOFF)}
						</div>
					
						<div class="beneficiary-list">
							${this.updatedPolicy.beneficiaries.map(bene => html`
								${bene.metaData.onceOffBenefitAdded === true ? html`
								<div class="beneficiary-card">
									<div style="display: flex; gap:20px;">
										<capitec-avatar value="${bene.firstName.charAt(0) + bene.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
										<horizon-label
											label="${bene.relationship}"
											value="${`${bene.firstName} ${bene.lastName}`}">
										</horizon-label>
									</div>
									<div style="display: flex; gap: 20px;">
										<horizon-label
											label="Cover amount"
											value="${formatCurrency(bene.onceOffPayoutBenefitAmount)}">
										</horizon-label>
										<capitec-overflow-menu label="More">
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF, bene)}" label="Edit Beneficiary"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF, bene)}" label="Delete Beneficiary"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>
								` : html``}
							`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.ONCEOFF) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF)}"  class="add-beneficiary-button" icon="system/add-action" label="Add another beneficiary"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to pocket"
									value="Go back to allocate cover to this pocket first in order to add a beneficiary">
								</horizon-label>
							</div>
						</div>
					`}
				</capitec-tab>
				
				<!-- Education -->
				<capitec-tab label="Education Fund" layout="vertical" halign="left">
					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.EDUCATION) === true ? html`
						<div id="beneficiary-info-bar">
							${this._getBeneficiaryInfoMessage(LIFE_POCKET_TYPES.EDUCATION)}
						</div>
						<div class="beneficiary-list">
							${this.updatedPolicy.beneficiaries.map(bene => html`
								${bene.metaData.educationBenefitAdded === true ? html`
								<div class="beneficiary-card">
									<div style="display: flex; gap:20px;">
										<capitec-avatar value="${bene.firstName.charAt(0) + bene.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
										<horizon-label
											label="${bene.relationship}"
											value="${`${bene.firstName} ${bene.lastName}`}">
										</horizon-label>
									</div>
									<div style="display: flex; gap: 20px;">
										<horizon-label
											label="Cover amount"
											value="${formatCurrency(bene.educationBenefitAmount)}">
										</horizon-label>
										<capitec-overflow-menu label="More">
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION, bene)}" label="Edit Beneficiary"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION, bene)}" label="Delete Beneficiary"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>
								` : html``}
							`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.EDUCATION) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION)}"  class="add-beneficiary-button" icon="system/add-action" label="Add another beneficiary"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to pocket"
									value="Go back to allocate cover to this pocket first in order to add a beneficiary">
								</horizon-label>
							</div>
						</div>
					`}
				</capitec-tab>
			</capitec-tab-group>
		`;
	}

	/**
	 * Step 2 - Update payment details
	 * @returns {html} content of step
	 */
	_renderStepPaymentDetails() {
		return html`
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
						value="${this.updatedPolicy?.bankDetails?.accountNumber}"
						error = "${this.accountNumberErrorMsg}"
						?disabled=${this.accountNumberDisabled}
						@value-changed = "${(e) => this._accountNumberChanged(e)}">
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
						error="${this.branchCodeErrorMsg}"
						@value-changed = "${(e) => this._branchCodeChanged(e)}">
					</capitec-text-field>
				</div>
			</div>
		`;
	}

	/**
	 * Step 3 - Agreement
	 * @returns {html} content of step
	 */
	_renderStepAgreement() {
		return html`
		<div class="agreement-form-body">
			<capitec-content-box>
				<horizon-product-tile class="view-document" type="default" label="Agreement" subtitle="Life Cover" icon="" @click="${() => this.showAgreementDocumentDialog = true}">
					<capitec-label slot="detail" type="strong" label="View Document">
					</capitec-label>
				</horizon-product-tile>

				<horizon-email-input
					labelOne="Enter email address"
					labelTwo="Confirm email"
					email="${this.agreementEmail}"
					confirmEmail="${this.agreementEmailConfirm}"
					?showRequiredError="${this.emailAlertBannerMessage === EMAIL_ADDRESS_ERROR_MESSAGES.EMAIL_REQUIRED}"
					@value-changed="${(e) => this._agreementEmailValueChanged(e)}"
					.callBack="${() => this._clearAgreementEmailAlerts()}">
				</horizon-email-input>
			</capitec-content-box>
		</div>
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
			${this.currentDialogStep === 0
				? html`<capitec-button class="capitec-button-small" slot="footer" type="secondary" @click="${() => this._closeClick()}" label="Cancel"></capitec-button>`
				: html`<capitec-button class="capitec-button-small" slot="footer" type="secondary" @click="${() => this._backStep()}" label="Back" ></capitec-button>`}

			${this.currentDialogStep === 3
				? html`<capitec-button class="capitec-button-medium" slot="footer" type="primary" @click="${() => this._doneStep()}" label="Update Policy" ></capitec-button>`
				: html`<capitec-button class="capitec-button-small" slot="footer" type="primary" @click="${() => this._nextStep()}" label="Next" ></capitec-button>`}
		`;
	}

	// #region ADDITIONAL DIALOGS

	/**
	 * Add beneficiary dialog
	 * @returns {html} The html content of the component.
	 */
	_renderAddBeneficiaryDialog() {
		return this.showAddBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-add-beneficiary-dialog 
					.isChild = "${this.addingChildBeneficiary}"
					.selectedPocket = "${this.selectedPocketType}"
					.policy = "${this.updatedPolicy}"
					@close-dialog="${() => this.showAddBeneficiaryDialog = false}"
					@add-beneficiary="${(e) => this._addBeneficiary(e)}">
				</horizon-insure-life-add-beneficiary-dialog>
		`;
	}

	/**
	 * Edit beneficiary dialog 
	 * @returns {html} The html content of the component.
	 */
	_renderEditBeneficiaryDialog() {
		return this.showEditBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-update-beneficiary-dialog 
					@close-dialog="${() => this.showEditBeneficiaryDialog = false}">
				</horizon-insure-life-update-beneficiary-dialog>
			`;
	}

	/**
	 * Delete beneficiary dialog
	 * @returns {html} The html content of the component.
	 */
	_renderDeleteBeneficiaryDialog() {
		return this.showDeleteBeneficiaryDialog === false ? ``
			: html`
				<horizon-insure-life-delete-beneficiary-dialog 
					.selectedBeneficiary="${this.selectedBeneficiary}" 
					.selectedPocketType="${this.selectedPocketType}" 
					@delete-beneficiary="${() => this._deleteBeneficiary()}"
					@close-dialog="${() => this.showDeleteBeneficiaryDialog = false}">
				</horizon-insure-life-delete-beneficiary-dialog>
		`;
	}

	/**
	 * Agreement dialog
	 * @returns {html} The html content of the component.
	 */
	_renderAgreementDialog() {
		return this.showAgreementDocumentDialog === false ? html``
			: html`
			<horizon-insure-agreement-dialog
				.agreementContent="${this.agreementDocumentContent}"
				@back-click="${() => this.showAgreementDocumentDialog = false}">
			</horizon-insure-agreement-dialog>
		`;
	}

	// #endregion ADDITIONAL DIALOGS

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-allocate-cover-dialog`, LifeAllocateCoverDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-allocate-cover-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-allocate-cover-dialog>
 *
 * @event LifeAllocateCoverDialog#close-modal
 * @type {Object} - N/A
 */