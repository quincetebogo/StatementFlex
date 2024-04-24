import { ACCOUNT_TYPES, BANK_OPTIONS, DEBIT_ORDER_DAY_OPTIONS, EMAIL_ADDRESS_ERROR_MESSAGES, LIFE_POCKET_TYPES, LIFE_UPDATE_MODE } from 'app/constants/InsureCommon';
import { Component, css, html } from 'platform/elements';
import { LIFE_COVER_ERROR_MESSAGES, formatCurrencyInsureCoverAmount, pocketBadgeColorClass, pocketBadgeIcon, pocketBadgeLabel, validateEmailAddressCombo } from 'app/utils/insureUtils';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { v4 } from 'uuid';


const DIALOG_TITLES = {
	ALLOCATE: `Allocate Money`,
	BENEFICIARIES: `Nominate people to receive a payout`,
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
		this.updateMode = ``;
		this.isNewOffer = false;
		this.newOffer = {};
		this.newOfferAnswers = [];

		this.calculatedPremium = 0;
		this.riskRate = 0;
		this.channelFee = 0;
		this.totalLoadingApplied = 0;

		// Allocate values
		this.educationCoverValue = 0;
		this.onceOffCoverValue = 0;
		this.monthlyCoverValue = 0;
		this.monthlyTotalCoverValue = 0;
		this.remainingCoverToAllocate = 0;
		this.totalCoverAllocatedAllPockets = 0;

		// Allocate errors
		this.educationCoverError = ``;
		this.onceOffCoverError = ``;
		this.monthlyCoverError = ``;
		this.monthlyTotalCoverError = ``;
		this.allocatedCoverErrorMessage = ``;
		this.invalidPocketNames = [];

		// Beneficiaries
		this.showAddBeneficiaryDialog = false;
		this.showEditBeneficiaryDialog = false;
		this.showDeleteBeneficiaryDialog = false;
		this.showBeneficiariesAllocateErrorDialog = false;

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
			newOfferAnswers: { type: Array, state: true },
			updateMode: { type: String, state: true },
			calculatedPremium: { type: Number, state: true },

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
			allocatedCoverErrorMessage: { type: String, state: true },
			invalidPocketNames: { type: Array, state: true },
			remainingCoverToAllocate: { type: Number, state: true },
			totalCoverAllocatedAllPockets: { type: Number, state: true },

			showAddBeneficiaryDialog: { type: Boolean, state: true },
			showEditBeneficiaryDialog: { type: Boolean, state: true },
			showDeleteBeneficiaryDialog: { type: Boolean, state: true },
			showBeneficiariesAllocateErrorDialog: { type: Boolean, state: true },
			selectedBeneficiary: { type: Object, state: true },
			selectedPocketType: { type: String, state: true },

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
		if (!isNullorEmpty(this.newOffer)) {
			this.isNewOffer = true;
		}

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

		// Set Allocate values
		if (this.updateMode === LIFE_UPDATE_MODE.ALLOCATE) {
			// MANAGE POLICY
		} else if (this.updateMode === LIFE_UPDATE_MODE.REISSUE) {
			this.calculatedPremium = 0;
			this.remainingCoverToAllocate = this.newOffer.maximumAllowedCover;

			this.riskRate = this.newOffer.riskRate;
			this.channelFee = this.newOffer.channelFee;
			this.totalLoadingApplied = this.newOffer.totalLoadingApplied;

			this.monthlyTotalCoverValue = 0;
			this.onceOffCoverValue = 0;
			this.educationCoverValue = 0;

			// Remove cover amounts from beneficiaries
			this.updatedPolicy.beneficiaries.forEach(bene => {
				bene.onceOffPayoutBenefitAmount = 0;
				bene.educationBenefitAmount = 0;
				bene.monthlyPayoutBenefitAmount = 0;
			});
		}

		// Payment details
		this.collectionDay = this.updatedPolicy.bankDetails.collectionDay;
		if (this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC` || this.updatedPolicy.bankDetails.bank.toUpperCase() === `CAPITEC BANK`) {
			this.accountNumberDisabled = true;
		}
	}

	//  #endregion LIFECYCLE OVERRIDES

	// #region PRIVATE METHODS

	/**
	 * Set correct dialog title for current step
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

	/**
	 * Determine remaining cover at allocate step
	 * @returns {Number} remaining cover amount
	 */
	_recalculateRemainingCover() {
		let monthly = this.monthlyTotalCoverValue;
		let onceOff = this.onceOffCoverValue;
		let education = this.educationCoverValue;

		if (isNullorEmpty(this.monthlyTotalCoverValue)) {
			monthly = 0;
		}
		if (isNaN(monthly)) {
			monthly = 0;
		}
		if (isNaN(onceOff)) {
			onceOff = 0;
		}
		if (isNaN(education)) {
			education = 0;
		}

		let remaining = 0;
		if (this.updateMode === LIFE_UPDATE_MODE.REISSUE) {
			remaining = parseFloat(this.newOffer.maximumAllowedCover) - parseFloat(monthly) - parseFloat(onceOff) - parseFloat(education);
		} else {
			remaining = parseFloat(this.updatedPolicy?.totalPolicySumAssured) - parseFloat(monthly) - parseFloat(onceOff) - parseFloat(education);
		}

		if (isNaN(remaining)) {
			return 0;
		}

		// Total Allocated
		this.totalCoverAllocatedAllPockets = parseFloat(monthly) + parseFloat(onceOff) + parseFloat(education);

		return remaining % 0 ? 0 : remaining;
	}

	/**
	 * Change event for both monthly cover inputs
	 * @param {event} event change event
	 * @param {string} type Monthly or Total
	 * @returns {void}
	 */
	_monthlyCoverChange(event, type) {
		if (type === `TOTAL`) {
			this.monthlyTotalCoverValue = event.detail.new;
			this.monthlyCoverValue = parseFloat(this.monthlyTotalCoverValue / 24).toFixed(0);
		} else {
			this.monthlyCoverValue = event.detail.new;
			this.monthlyTotalCoverValue = parseFloat(this.monthlyCoverValue * 24).toFixed(0);
		}

		this.remainingCoverToAllocate = this._recalculateRemainingCover();
		this._recalculatePremium();
		this._validateAllocatePocketsStep();
	}

	/**
	 * Change event for education cover input
	 * @param {event} e change event
	 * @returns {void}
	 */
	_educationCoverChange(e) {
		if (e.detail.new !== e.detail.old) {
			this.educationCoverValue = parseFloat(e.detail.new);

			this.remainingCoverToAllocate = this._recalculateRemainingCover();
			this._recalculatePremium();
			this._validateAllocatePocketsStep();
		}
	}

	/**
	 * Change event for once off cover input
	 * @param {event} e change event 
	 * @returns {void}
	 */
	_onceOffCoverChange(e) {
		if (e.detail.new !== e.detail.old) {
			this.onceOffCoverValue = parseFloat(e.detail.new);

			this.remainingCoverToAllocate = this._recalculateRemainingCover();
			this._recalculatePremium();
			this._validateAllocatePocketsStep();
		}
	}

	/**
	 * Cover value for monthly pocket
	 * @returns {Number} cover amount
	 */
	_monthlyCoverValue() {
		if (this.monthlyTotalCoverValue > 0) {
			return parseFloat(this.monthlyTotalCoverValue).toFixed(0);
		}
		return 0;
	}

	/**
	 * Cover value for once off pocket
	 * @returns {Number} cover amount
	 */
	_onceOffCoverValue() {
		if (this.onceOffCoverValue > 0) {
			return parseFloat(this.onceOffCoverValue).toFixed(0);
		}
		return 0;
	}

	/**
	 * Cover value for education pocket
	 * @returns {Number} cover amount
	 */
	_educationCoverValue() {
		if (this.educationCoverValue > 0) {
			return parseFloat(this.educationCoverValue).toFixed(0);
		}
		return 0;
	}

	/**
	 * Recalculate premium based on cover values
	 * @returns {void}
	 */
	_recalculatePremium() {
		if (isNullorEmpty(this.onceOffCoverValue) || isNaN(this.onceOffCoverValue)) {
			this.onceOffCoverValue = 0;
		}
		if (isNullorEmpty(this.educationCoverValue) || isNaN(this.educationCoverValue)) {
			this.educationCoverValue = 0;
		}
		if (isNullorEmpty(this.monthlyCoverValue) || isNaN(this.monthlyCoverValue)) {
			this.monthlyCoverValue = 0;
		}

		if (this.onceOffCoverValue === 0 && this.educationCoverValue === 0 && this.monthlyCoverValue === 0) {
			this.calculatedPremium = 0;
			return;
		}

		const lumpSumPremiumBase = this.onceOffCoverValue / 1000 * this.riskRate;
		const lumpSumPremiumloading = lumpSumPremiumBase * this.totalLoadingApplied;
		const lumpsumTotal = lumpSumPremiumBase + lumpSumPremiumloading;

		const educationPremiumBase = this.educationCoverValue / 1000 * this.riskRate;
		const educationPremiumloading = educationPremiumBase * this.totalLoadingApplied;
		const educationTotal = educationPremiumBase + educationPremiumloading;

		const monthlyPayoutPremiumBase = this.monthlyCoverValue * 24 / 1000 * this.riskRate;
		const monthlyPayoutPremiumloading = monthlyPayoutPremiumBase * this.totalLoadingApplied;
		const monthlyPayoutTotal = monthlyPayoutPremiumBase + monthlyPayoutPremiumloading;

		this.calculatedPremium = monthlyPayoutTotal + lumpsumTotal + educationTotal + this.channelFee;
	}

	/**
	 * Validate Allocate step
	 * 1. Nothing Allocated check
	 * 2. Totals exceed max allowed cover
	 * 3. Check any errors on individual pockets
	 * @returns {Boolean} isValid
	 */
	_validateAllocatePocketsStep() {
		let isValid = true;
		this.allocatedCoverErrorMessage = ``;

		// Nothing Allocated
		if ((isNullorEmpty(this.monthlyTotalCoverValue) || this.monthlyTotalCoverValue === 0) &&
			(isNullorEmpty(this.onceOffCoverValue) || this.onceOffCoverValue === 0) &&
			(isNullorEmpty(this.educationCoverValue) || this.educationCoverValue === 0)) {
			this.allocatedCoverErrorMessage = LIFE_COVER_ERROR_MESSAGES.MINIMUM_COVER_NOT_REACHED;
			isValid = false;
		}

		// Less than policy minimum
		if (parseFloat(this.monthlyTotalCoverValue) + parseFloat(this.onceOffCoverValue) + parseFloat(this.educationCoverValue) < 100000) {
			this.allocatedCoverErrorMessage = LIFE_COVER_ERROR_MESSAGES.MINIMUM_COVER_NOT_REACHED;
			isValid = false;
		}

		// Totals exceed max allowed cover
		const totalCoverage = parseFloat(this.monthlyTotalCoverValue) + parseFloat(this.onceOffCoverValue) + parseFloat(this.educationCoverValue);
		if (this.updateMode === LIFE_UPDATE_MODE.REISSUE) {
			if (totalCoverage > this.newOffer.maximumAllowedCover) {
				this.allocatedCoverErrorMessage = LIFE_COVER_ERROR_MESSAGES.COVER_MAXIMUM;
				isValid = false;
			}
		} else {
			if (totalCoverage > this.currentPolicy?.totalPolicySumAssured) {
				this.allocatedCoverErrorMessage = LIFE_COVER_ERROR_MESSAGES.COVER_MAXIMUM;
				isValid = false;
			}
		}

		// Check any errors on individual pockets
		// Monthly
		if (parseFloat(this.monthlyTotalCoverValue) < 1000 && (this.monthlyTotalCoverValue !== 0 && !isNullorEmpty(this.monthlyTotalCoverValue))) {
			this.monthlyTotalCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM;
			isValid = false;
		} else {
			this.monthlyTotalCoverError = ``;
		}

		// Education
		if (parseFloat(this.educationCoverValue) < 50000 && this.educationCoverValue !== 0) {
			this.educationCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM_EDUCATION;
			isValid = false;
		} else {
			this.educationCoverError = ``;
		}

		// Once off
		if (parseFloat(this.onceOffCoverValue) < 1000 && this.onceOffCoverValue !== 0) {
			this.onceOffCoverError = LIFE_COVER_ERROR_MESSAGES.POCKET_MINIMUM;
			isValid = false;
		} else {
			this.onceOffCoverError = ``;
		}

		return isValid;
	}

	// #endregion ALLOCATE


	// #region BENEFICIARIES

	/**
	 * @param {String} pocketType pocket type
	 * @returns {Number} total cover allocated
	 */
	_totalCoverAllocated(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return this.monthlyTotalCoverValue;
		}
		if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return this.educationCoverValue;
		}
		if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return this.onceOffCoverValue;
		}
	}

	/**
	 * Boolean check if pocket has cover allocated
	 * @param {String} pocketType pocket type
	 * @returns {Number} total cover allocated
	 */
	_pocketHasCoverAllocated(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			if (this.monthlyTotalCoverValue > 0) {
				return true;
			}
			return false;
		}
		if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			if (this.educationCoverValue > 0) {
				return true;
			}
			return false;
		}
		if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			if (this.onceOffCoverValue > 0) {
				return true;
			}
			return false;
		}
	}

	/**
	 * Per pocket, determine if all cover has been allocated
	 * @param {String} pocketType pocket type
	 * @returns {Number} remaining pocket balance
	 */
	_remainingPocketBalance(pocketType) {
		let allocated = 0;
		for (const bene of this.updatedPolicy.beneficiaries) {
			if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
				if (bene.metaData.monthlyBenefitAdded === true) {
					allocated += parseFloat(bene.monthlyPayoutBenefitAmount);
				}
			}
			if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
				if (bene.metaData.educationBenefitAdded === true) {
					allocated += parseFloat(bene.educationBenefitAmount);
				}
			}
			if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				if (bene.metaData.onceOffBenefitAdded === true) {
					allocated += parseFloat(bene.onceOffPayoutBenefitAmount);
				}
			}
		}

		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return parseFloat(this.monthlyTotalCoverValue) - parseFloat(allocated);
		}
		if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return parseFloat(this.educationCoverValue) - parseFloat(allocated);
		}
		if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return parseFloat(this.onceOffCoverValue) - parseFloat(allocated);
		}
	}

	/**
	 * Determine message based on pocket type
	 * @param {string} pocketType - pocket type
	 * @returns {string} message
	 */
	_getBeneficiaryInfoMessage(pocketType) {
		if (pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Choose who gets a onthly Income (up to 6):`;
		} else if (pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Choose whose education to pay for (up to 10):`;
		} else if (pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Choose who gets a Lump Sum (up to 6):`;
		}
	}

	/**
	 * Add new Once Off or Monthly beneficiary
	 * @param {String} pocketType pocket type
	 * @returns {void}
	 */
	_openAddBeneficiaryDialog(pocketType) {
		this.selectedPocketType = pocketType;
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
		const beneficiary = event.detail.beneficiary;
		const beneficiaryType = event.detail.beneficiaryType;

		if (beneficiaryType === `NEW`) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				beneficiary.metaData.monthlyBenefitAdded = true;
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				beneficiary.metaData.onceOffBenefitAdded = true;
			}
			this.updatedPolicy.beneficiaries.push(beneficiary);
		}
		this.showAddBeneficiaryDialog = false;
	}

	_updateBeneficiary() {
		this.showEditBeneficiaryDialog = false;
	}

	_cancelUpdateBeneficiary(e) {
		this.updatedPolicy.beneficiaries.forEach(bene => {
			if (bene.metaData.uniqueId === e.detail.beneficiary.metaData.uniqueId) {
				bene.firstName = e.detail.beneficiary.firstName;
				bene.lastName = e.detail.beneficiary.lastName;
				bene.dateOfBirth = e.detail.beneficiary.dateOfBirth;
				bene.contactNumber = e.detail.beneficiary.contactNumber;
				bene.monthlyPayoutBenefitAmount = e.detail.beneficiary.monthlyPayoutBenefitAmount;
				bene.onceOffPayoutBenefitAmount = e.detail.beneficiary.onceOffPayoutBenefitAmount;
				bene.educationBenefitAmount = e.detail.beneficiary.educationBenefitAmount;
			}
		});
		this.selectedBeneficiary = null;
		this.showEditBeneficiaryDialog = false;
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
			if (totalBeneficiariesInPocket >= 6) {
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
			if (totalBeneficiariesInPocket >= 6) {
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

	/**
	 * Validate allocate beneficiaries to pockets step
	 * @returns {Boolean} isValid
	 */
	_validateAllocateBeneficiariesStep() {
		let isValid = true;
		let monthlyValid = true;
		let onceOffValid = true;
		let educationValid = true;

		let onceOffTotalAllocated = 0;
		let monthlyTotalAllocated = 0;
		let educationTotalAllocated = 0;

		const invalidPocketNames = [];

		for (const bene of this.updatedPolicy.beneficiaries) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				onceOffTotalAllocated += parseFloat(bene.onceOffPayoutBenefitAmount);
			}

			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				monthlyTotalAllocated += parseFloat(bene.monthlyPayoutBenefitAmount);
			}

			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				educationTotalAllocated += parseFloat(bene.educationBenefitAmount);
			}
		}

		if (onceOffTotalAllocated !== this.onceOffCoverValue) {
			onceOffValid = false;
			invalidPocketNames.push(`Lump Sum`);
		}

		if (monthlyTotalAllocated !== this.monthlyTotalCoverValue) {
			monthlyValid = false;
			invalidPocketNames.push(`Monthly Income`);
		}

		if (educationTotalAllocated !== this.educationCoverValue) {
			educationValid = false;
			invalidPocketNames.push(`Children's Needs`);
		}

		isValid = onceOffValid && monthlyValid && educationValid;
		return [isValid, invalidPocketNames];
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
	async _nextStep() {
		let stepValid = true;

		// Allocate
		if (this.currentDialogStep === 0) {
			stepValid = this._validateAllocatePocketsStep();
			if (stepValid === false) {
				return;
			}

			const policyPockets = [];
			if (this.monthlyCoverValue > 0) {
				policyPockets.push({
					"coverAmount": this.monthlyCoverValue,
					"pocketType": `MonthlyPayout`
				});
			}
			if (this.onceOffCoverValue > 0) {
				policyPockets.push({
					"coverAmount": this.onceOffCoverValue,
					"pocketType": `LumpSum`
				});
			}
			if (this.educationCoverValue > 0) {
				policyPockets.push({
					"coverAmount": this.educationCoverValue,
					"pocketType": `Education`
				});
			}

			this.updatedPolicy.pockets = policyPockets;
		}

		// Beneficiaries
		if (this.currentDialogStep === 1) {
			this.invalidPocketNames = [];
			const allocatedStepResults = this._validateAllocateBeneficiariesStep();
			stepValid = allocatedStepResults[0];

			if (stepValid === false) {
				this.invalidPocketNames = allocatedStepResults[1];
				this.showBeneficiariesAllocateErrorDialog = true;
				return;
			}
		}

		// Payment details
		if (this.currentDialogStep === 2) {
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

			const reIssueRequest = {
				"policyIssueDate": new Date(),
				"previousPolicyNumber": this.updatedPolicy.contractReference,
				"deductionDetails": {
					"collectionDay": 0,
					"bankDetails": {
						// "accountName": this.updatedPolicy.bankDetails,
						"branchCode": this.updatedPolicy.bankDetails.branchCode,
						"accountNumber": this.updatedPolicy.bankDetails.accountNumber,
						"bank": this.updatedPolicy.bankDetails.bank,
						"accountType": this.updatedPolicy.bankDetails.accountType
					}
				},
				"totalLoadingApplied": this.newOffer.totalLoadingApplied,
				"underwriting": this.newOffer.underwriting,
				"channel": `Horizon`,
				"riskRate": 0,
				"channelFee": this.newOffer.channelFee,
				"maxCoverApplicable": this.newOffer.maximumAllowedCover,
				"beneficiaries": this.updatedPolicy.beneficiaries,
				"pockets": this.updatedPolicy.pockets,
				"answers": this.newOfferAnswers
			};
			const reIssueResult = await this.executeLifeReIssue(reIssueRequest);

			console.log(`reIssueResult: `, reIssueResult);


			// TODO Execute Agreement Call
			const agreementRequest = {
				"saveDocument": false,
				"policyNumber": this.updatedPolicy.contractReference,
				"signatureDate": new Date()
			};

			const agreementResult = await this.executeLifeGenerateIssueAgreement(agreementRequest);
			console.log(`agreementResult: `, agreementResult);
			this.agreementDocumentContent = agreementResult.documentContent.base64EncodedString;
		}

		// All good move on
		if (stepValid === true) {
			this.currentDialogStep++;
			this._setDialogTitle(this.currentDialogStep);
			this.allocatedCoverErrorMessage = ``;
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

				capitec-tab-group > .tab-bar > .tab{
					justify-content: center!important;
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
					align-items: start;
				}

				.pocket-details-card-col{
					display: flex;
					flex-direction: column;
					justify-content: space-between;
					align-items: flex-end
				}

				.hint {
					color: #969B9D;
					
					font-size: 12px;
					font-weight: 300;
				}

				.pocket-details-badge{
					display: flex;
					align-items: center;
				}

				.pocket-details-input{
					width: 230px;
				}

				.pocket-details-label{
					margin-right: 15px;
				}

				.pocket-type-label{
					padding-left:15px;
				}

				/** Beneficiary Step */

				.per-pocket-error-banner{
					width: 100%
				}

				.pocket-details-badge{
					display: flex;
					align-items: center;
				}
				
				.pocket-breakdown-card{ 
					background-color: #F4F4F4;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					width: 100%;
				}

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
					min-height: 350px;
					max-height: 500px;
					overflow-y: scroll;
				}

				.no-cover-container{
					width: 100%;
					min-height: 440px;
					display: flex;
					justify-content: center;
					align-items: center;
					padding: 0px 20px;
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
			${this._renderBeneficiariesAllocateErrorDialog()}
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
			${this.allocatedCoverErrorMessage !== ``
				? html`
				<div style="padding: 20px 16px 0px 16px;">
					<horizon-alert-banner
						type="error"
						header="Step invalid"
						.label="${this.allocatedCoverErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}

			<div id="offer-details">
				<div class="offer-details-cell">
					<div>Monthly Premium</div>
					<div class="offer-details-value">${formatCurrency(this.calculatedPremium)}</div>
				</div>

				${this.isNewOffer === true ? html`
					<div class="offer-details-cell">
						<div>Offered Cover amount</div>
						<div class="offer-details-value">${formatCurrency(this.newOffer?.maximumAllowedCover)}</div>
					</div>
				` : html`
					<div class="offer-details-cell">
						<div>Current Cover amount</div>
						<div class="offer-details-value">${formatCurrency(this.currentPolicy?.totalPolicySumAssured)}</div>
					</div>
				`}
				<div class="offer-details-cell">
					<div>Allocated</div>
					<div class="offer-details-value">${formatCurrency(this.totalCoverAllocatedAllPockets)}</div>
				</div>
				<div class="offer-details-cell">
					<div>Remaining</div>
					<div class="offer-details-value">${formatCurrency(this.remainingCoverToAllocate)}</div>
				</div>
			</div>

			<div style="padding: 0px 20px 20px 20px;">
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
								disabled
								value="${this._monthlyCoverValue()}"
								@value-changed="${(e) => this._monthlyCoverChange(e, `TOTAL`)}"
								error="${this.monthlyTotalCoverError}">
							</capitec-text-field>
								<div class="pocket-details-card-col">
									<capitec-text-field 
										type="currency" 
										class="pocket-details-input" 
										label="They get" 
										value="${this.monthlyCoverValue}"
										@value-changed="${(e) => this._monthlyCoverChange(e, `PERMONTH`)}"
										error="${this.monthlyCoverError}">
									</capitec-text-field>
									
									<div class="hint" style="width:100%; padding-left: 17px">
									Per month for 24 months.
									</div>
									<div class="hint" style="width:100%; padding-left: 17px; margin-bottom: 10px; line-height: 2px;">
									Minimum R1 000 per beneficiary
									</div>
								</div>
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
								value="${this._onceOffCoverValue()}"
								@value-changed="${(e) => this._onceOffCoverChange(e)}"
								error="${this.onceOffCoverError}"
								hint="Minimum R1 000 per beneficiary">
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
								value="${this._educationCoverValue()}"
								@value-changed="${(e) => this._educationCoverChange(e)}"
								error="${this.educationCoverError}"
								hint="Minimum R50 000 per beneficiary">
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
				<capitec-tab label="Monthly Income" layout="vertical" halign="left">
					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.MONTHLY) === true ? html`

						<!-- Per Pocket Errors -->
						${this._remainingPocketBalance(LIFE_POCKET_TYPES.MONTHLY) !== 0 ? html`
							<horizon-alert-banner
								type="error"
								class="per-pocket-error-banner"
								header="Allocation mismatch:"
								label="The full cover amount for this benefit payout option must be allocated to nominated people"
								layout="vertical">
							</horizon-alert-banner>
						` : html``}

						<!-- Pocket Breakdown -->
						<div class="pocket-breakdown-card"> 
							<div class="pocket-details-badge">
								<capitec-icon style="padding-right: 10px;" .icon="${pocketBadgeIcon(LIFE_POCKET_TYPES.MONTHLY)}" size="large"></capitec-icon>
								<capitec-label type="strong"
									class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.MONTHLY)}"
									.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.MONTHLY)}">
								</capitec-label>
							</div>

							<div style="display: flex; gap: 50px;">
								<horizon-label
									label="Remaining balance"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this._remainingPocketBalance(LIFE_POCKET_TYPES.MONTHLY)))}">
								</horizon-label>
								<horizon-label
									label="Cover amount"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this.monthlyTotalCoverValue))}">
								</horizon-label>
								<div style="width: 38px;"></div>
							</div>
						</div>

						<!-- Total allowed beneficiaries message -->
						<div id="beneficiary-info-bar">
							${this._getBeneficiaryInfoMessage(LIFE_POCKET_TYPES.MONTHLY)}
						</div>

						<!-- Beneficiary List -->
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
									<div style="display: flex; gap: 42px;">
										<horizon-label
											label="Term"
											value="24 months"
											style="margin-right: 40px;">
										</horizon-label>
										<horizon-label
											label="Cover amount"
											value="${formatCurrencyInsureCoverAmount(formatCurrency(bene.monthlyPayoutBenefitAmount))}">
										</horizon-label>
										<capitec-overflow-menu label="More">
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY, bene)}" label="Update Person"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY, bene)}" label="Delete Person"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>` : html``}`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.MONTHLY) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.MONTHLY)}"  class="add-beneficiary-button" icon="system/add-action" label="Add someone"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to this benefit payout option"
									value="Go back to allocate cover to this benefit payout option and then nominate someone to receive a payout">
								</horizon-label>
							</div>
						</div>
					`}
				</capitec-tab>
				
				<!-- Once Off -->
				<capitec-tab label="Lump Sum" layout="vertical" halign="left">
					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.ONCEOFF) === true ? html`

						<!-- Per Pocket Errors -->
						${this._remainingPocketBalance(LIFE_POCKET_TYPES.ONCEOFF) !== 0 ? html`
							<horizon-alert-banner
								type="error"
								class="per-pocket-error-banner"
								header="Allocation mismatch:"
								label="The full cover amount for this benefit payout option must be allocated to nominated people"
								layout="vertical">
							</horizon-alert-banner>
						` : html``}

						<!-- Pocket Breakdown -->
						<div class="pocket-breakdown-card"> 
							<div class="pocket-details-badge">
								<capitec-icon style="padding-right: 10px;" .icon="${pocketBadgeIcon(LIFE_POCKET_TYPES.ONCEOFF)}" size="large"></capitec-icon>
								<capitec-label type="strong"
									class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.ONCEOFF)}"
									.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.ONCEOFF)}">
								</capitec-label>
							</div>

							<div style="display: flex; gap: 50px;">
								<horizon-label
									label="Remaining balance"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this._remainingPocketBalance(LIFE_POCKET_TYPES.ONCEOFF)))}">
								</horizon-label>
								<horizon-label
									label="Cover amount"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this.onceOffCoverValue))}">
								</horizon-label>
								<div style="width: 38px;"></div>
							</div>
						</div>

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
									<div style="display: flex; gap: 42px;">
										<horizon-label
											label="Cover amount"
											value="${formatCurrencyInsureCoverAmount(formatCurrency(bene.onceOffPayoutBenefitAmount))}">
										</horizon-label>
										<capitec-overflow-menu label="More">
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF, bene)}" label="Update Person"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF, bene)}" label="Delete Person"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>
								` : html``}
							`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.ONCEOFF) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.ONCEOFF)}"  class="add-beneficiary-button" icon="system/add-action" label="Add someone"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to this benefit payout option"
									value="Go back to allocate cover to this benefit payout option and then nominate someone to receive a payout">
								</horizon-label>
							</div>
						</div>
					`}
				</capitec-tab>
				
				<!-- Education -->
				<capitec-tab label="Children's Needs" layout="vertical" halign="left">
					${this._pocketHasCoverAllocated(LIFE_POCKET_TYPES.EDUCATION) === true ? html`

						<!-- Per Pocket Errors -->
						${this._remainingPocketBalance(LIFE_POCKET_TYPES.EDUCATION) !== 0 ? html`
							<horizon-alert-banner
								type="error"
								class="per-pocket-error-banner"
								header="Allocation mismatch:"
								label="The full cover amount for this benefit payout option must be allocated to nominated people"
								layout="vertical">
							</horizon-alert-banner>
						` : html``}

						<!-- Pocket Breakdown -->
						<div class="pocket-breakdown-card"> 
							<div class="pocket-details-badge">
								<capitec-icon style="padding-right: 10px;" .icon="${pocketBadgeIcon(LIFE_POCKET_TYPES.EDUCATION)}" size="large"></capitec-icon>
								<capitec-label type="strong"
									class="pocket-type-label ${pocketBadgeColorClass(LIFE_POCKET_TYPES.EDUCATION)}"
									.label="${pocketBadgeLabel(LIFE_POCKET_TYPES.EDUCATION)}">
								</capitec-label>
							</div>

							<div style="display: flex; gap: 40px;">
								<horizon-label
									label="Cover amount"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this.educationCoverValue))}">
								</horizon-label>

								<horizon-label
									label="Remaining balance"
									value="${formatCurrencyInsureCoverAmount(formatCurrency(this._remainingPocketBalance(LIFE_POCKET_TYPES.EDUCATION)))}">
								</horizon-label>
							</div>
						</div>

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
											<capitec-overflow-menu-item @click="${() => this._openEditBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION, bene)}" label="Update Child"></capitec-overflow-menu-item>
											<capitec-overflow-menu-item @click="${() => this._openDeleteBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION, bene)}" label="Delete Child"></capitec-overflow-menu-item>
										</capitec-overflow-menu>
									</div>
								</div>
								` : html``}
							`)}
							${this._allowAddBeneficiary(LIFE_POCKET_TYPES.EDUCATION) === true ? html`<capitec-button @click="${() => this._openAddBeneficiaryDialog(LIFE_POCKET_TYPES.EDUCATION)}"  class="add-beneficiary-button" icon="system/add-action" label="Add child"></capitec-button>` : html``}
						</div>
					` : html`
						<div class="no-cover-container">
							<div>
								<capitec-image src="platform/illustrations/beneficiaries.svg" style="width: 300px; margin-left: auto; margin-right: auto;"></capitec-image>
								<horizon-label 
									label="No cover allocated to this benefit payout option"
									value="Go back to allocate cover to this benefit payout option and then nominate someone to receive a payout">
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
				? html`<capitec-button class="capitec-button-medium" slot="footer" type="primary" @click="${() => this._doneStep()}" label="Done" ></capitec-button>`
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
					.selectedPocketType = "${this.selectedPocketType}"
					.policy = "${this.updatedPolicy}"
					.totalPocketCover = ${this._totalCoverAllocated(this.selectedPocketType)}
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
					.updatingBeneficiary="${this.selectedBeneficiary}"
					.selectedPocketType = "${this.selectedPocketType}"
					.policy = "${this.updatedPolicy}"
					.totalPocketCover = ${this._totalCoverAllocated(this.selectedPocketType)}
					@close-dialog="${(e) => this._cancelUpdateBeneficiary(e)}"
					@update-beneficiary="${(e) => this._updateBeneficiary(e)}">
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

	_renderBeneficiariesAllocateErrorDialog() {
		return this.showBeneficiariesAllocateErrorDialog === false ? ``
			: html`
				<horizon-insure-life-beneficiaries-allocate-error-dialog
					.invalidPockets=${this.invalidPocketNames}
					@close-dialog="${() => this.showBeneficiariesAllocateErrorDialog = false}">
				</horizon-insure-life-beneficiaries-allocate-error-dialog>
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