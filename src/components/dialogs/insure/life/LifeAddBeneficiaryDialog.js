import { Component, css, html } from 'platform/elements';
import { GENDER_OPTIONS, LIFE_BENEFICIARY_RELATIONSHIP_TYPES, LIFE_POCKET_TYPES, TITLE_OPTIONS } from 'app/constants/InsureCommon';
import { formatCurrencyInsureCoverAmount, getAgeFromDob, getDobFromIDNumber, pocketBadgeColorClass, pocketBadgeIcon, pocketBadgeLabel } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { v4 } from 'uuid';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be over 18`,
	ALLOCATION_OVER: `Beneficiary allocation exceeds pocket cover`,
	ALLOCATION_UNDER: `Beneficiary allocation is less than pocket cover`,
	INVALID_ID: `ID Number is invalid`,
	INVALID_CELL_NUMBER: `Cellphone Number is invalid`
};

const NEW_BENEFICIARY_TYPES = {
	NEW: `NEW`,
	EXISTING: `EXISTING`,
	UNSET: `UNSET`
};

/**
 * @export
 * @class LifeAddBeneficiaryDialog
 * @extends {Component}
 */
class LifeAddBeneficiaryDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = 1;
		this.selectedPocketType = ``;
		this.policy = {};
		this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.UNSET;

		this.newBeneficiary = {
			metaData: {
				monthlyBenefitAdded: false,
				onceOffBenefitAdded: false,
				uniqueId: v4()
			}
		};

		this.newBeneficiaryErrors = {};
		this.pocketBeneficiaries = [];
		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;

		this.newOrExistingErrorMessage = ``;
		this.beneficiaryDetailsErrorMessage = ``;
		this.allocateMoneyErrorMessage = ``;

		this.totalPocketCover = 0;
		this.pocketRemainingCover = 0;

		this.beneficiaryRelationships = LIFE_BENEFICIARY_RELATIONSHIP_TYPES;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			currentStep: { type: Number, state: true },
			policy: { type: Object, state: true },
			selectedPocketType: { type: String, state: true },
			eligibleBeneficiariesForQuickAdd: { type: Array, state: true },
			newBeneficiaryType: { type: String, state: true },
			pocketBeneficiaries: { type: Array, state: true },

			newOrExistingErrorMessage: { type: String, state: true },
			beneficiaryDetailsErrorMessage: { type: String, state: true },
			allocateMoneyErrorMessage: { type: String, state: true },

			newBeneficiary: { type: Object, state: true },
			newBeneficiaryErrors: { type: Object, state: true },

			totalPocketCover: { type: Number, state: true },
			pocketRemainingCover: { type: Number, state: true }
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
		this.initialise();
	}

	/**
	 * Remove the component from the DOM.
	 * @returns {void}
	 */
	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	initialise() {
		this.eligibleBeneficiariesForQuickAdd = this._calculateQuickAddBeneficiaries();
		if (this.eligibleBeneficiariesForQuickAdd.length === 0) {
			this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.NEW;
		} else {
		}

		if (this.policy.beneficiaries.length > 0) {
			for (const bene of this.policy.beneficiaries) {
				if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && bene.metaData.monthlyBenefitAdded === true) {
					this.newBeneficiary.monthlyPayoutBenefitAmount = 0;
					this.newBeneficiary.metaData.monthlyBenefitAdded = true;
					this.pocketBeneficiaries.push(bene);
				}
				if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && bene.metaData.onceOffBenefitAdded === true) {
					this.newBeneficiary.onceOffPayoutBenefitAmount = 0;
					this.newBeneficiary.metaData.onceOffBenefitAdded = true;
					this.pocketBeneficiaries.push(bene);
				}
			}
		} else {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				this.newBeneficiary.monthlyPayoutBenefitAmount = 0;
				this.newBeneficiary.metaData.monthlyBenefitAdded = true;
				this.pocketBeneficiaries.push(bene);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				this.newBeneficiary.onceOffPayoutBenefitAmount = 0;
				this.newBeneficiary.metaData.onceOffBenefitAdded = true;
				this.pocketBeneficiaries.push(bene);
			}
		}
		this._calculateCoverBreakdown();
	}

	/**
	 * Check if any other beneficiaries are available for quick add
	 * @returns {Array} array of beneficiaries
	 */
	_calculateQuickAddBeneficiaries() {
		const eligible = [];
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
			for (const bene of this.policy.beneficiaries) {
				if (bene.metaData.onceOffBenefitAdded === true) {
					eligible.push(bene);
				}
			}
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			for (const bene of this.policy.beneficiaries) {
				if (bene.metaData.monthlyBenefitAdded === true) {
					eligible.push(bene);
				}
			}
		}
		return eligible;
	}

	/**
	 * Determine the initial cover breakdown for the selected pocket
	 * @returns {void}
	 */
	_calculateCoverBreakdown() {
		let totalAllocated = 0;
		for (const bene of this.pocketBeneficiaries) {
			if (bene.metaData.monthlyBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				totalAllocated += bene.monthlyPayoutBenefitAmount === `` ? 0 : parseFloat(bene.monthlyPayoutBenefitAmount);
			}
			if (bene.metaData.onceOffBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				totalAllocated += bene.onceOffPayoutBenefitAmount === `` ? 0 : parseFloat(bene.onceOffPayoutBenefitAmount);
			}
		}

		// New Beneficiary?
		if (this.newBeneficiary !== null) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				totalAllocated += this.newBeneficiary.monthlyPayoutBenefitAmount === `` ? 0 : parseFloat(this.newBeneficiary.monthlyPayoutBenefitAmount);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				totalAllocated += this.newBeneficiary.onceOffPayoutBenefitAmount === `` ? 0 : parseFloat(this.newBeneficiary.onceOffPayoutBenefitAmount);
			}
		}
		this.pocketRemainingCover = this.totalPocketCover - totalAllocated;
	}

	/**
	 * What steps are available for this add flow
	 * @returns {Array} array of steps
	 */
	_determineSteps() {
		let steps = [];
		if (this.eligibleBeneficiariesForQuickAdd.length > 0) {
			steps = [{ title: `New or existing` }, { title: `Personal details` }, { title: `Allocate cover` }];
		} else {
			steps = [{ title: `Personal details` }, { title: `Allocate cover` }];
		}
		return steps;
	}

	// #region New Or Existing

	/**
	 * Continue with new beneficiary
	 * 
	 * @returns {void}
	 */
	_continueWithNewBeneficiary() {
		this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.NEW;
		this.newBeneficiary = {
			metaData: {
				monthlyBenefitAdded: false,
				onceOffBenefitAdded: false,
				uniqueId: v4()
			}
		};
		this.newOrExistingErrorMessage = ``;
	}

	/**
	 * Continue with existing beneficiary
	 * 
	 * @param {Object} beneficiary beneficiary being modified
	 * @returns {void} 
	 */
	_continueWithExistingBeneficiary(beneficiary) {
		this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.EXISTING;
		this.newOrExistingErrorMessage = ``;
		this.newBeneficiary = beneficiary;
	}

	// #endregion New Or Existing

	// #region Beneficiary Details

	/**
	 * Event fired when a beneficiary TITLE value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_titleChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.title = e.detail.new.code;
			if (this.newBeneficiary.title === `Mr` || this.newBeneficiary.title === `Sir`) {
				this.newBeneficiary.gender = `Male`;
				this.newBeneficiaryErrors.gender = ``;
			} else if (this.newBeneficiary.title === `Mrs` || this.newBeneficiary.title === `Ms` || this.newBeneficiary.title === `Miss` || this.newBeneficiary.title === `Lady`) {
				this.newBeneficiary.gender = `Female`;
				this.newBeneficiaryErrors.gender = ``;
			}
		}
		if (!isNullorEmpty(this.newBeneficiary.title)) {
			this.newBeneficiaryErrors.title = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary GENDER value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_genderChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.gender = e.detail.new.code;
		}
		if (!isNullorEmpty(this.newBeneficiary.gender)) {
			this.newBeneficiaryErrors.gender = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary FIRST NAME value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_firstNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.firstName = e.detail.new;
		}
		if (!isNullorEmpty(this.newBeneficiary.firstName)) {
			this.newBeneficiaryErrors.firstName = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary SURNAME value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_surnameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.lastName = e.detail.new;
		}
		if (!isNullorEmpty(this.newBeneficiary.lastName)) {
			this.newBeneficiaryErrors.lastName = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary RELATIONSHIP value changes
	 * @param {*} e e
	 * @returns {void}
	 */
	_relationshipChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.relationship = e.detail.new.code;
		}
		if (!isNullorEmpty(this.newBeneficiary.relationship)) {
			this.newBeneficiaryErrors.relationship = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_dobChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.dateOfBirth = e.detail.new.date;
			const wrongTimeZone = this.newBeneficiary.dateOfBirth.includes(`+02:00`);
			if (wrongTimeZone === true) {
				let dob = this.newBeneficiary.dateOfBirth;
				const timezone = `+02:00`;
				dob = dob.replace(timezone, ``);
				this.newBeneficiary.dateOfBirth = dob;
			} else {
				this.newBeneficiary.dateOfBirth = e.detail.new.date;
			}

			this._validateBeneficiaryDetails();
		}
		if (!isNullorEmpty(this.newBeneficiary.dateOfBirth)) {
			this.newBeneficiaryErrors.dateOfBirth = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary CELL NUMBER value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_cellphoneNumChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.contactNumber = e.detail.new;
		}
		if (!isNullorEmpty(this.newBeneficiary.contactNumber)) {
			this.newBeneficiaryErrors.contactNumber = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary ID NUMBER value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_idChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.idNumber = e.detail.new;
		}
		if (this.newBeneficiary.idNumber.length === 13) {
			this.newBeneficiary.dateOfBirth = getDobFromIDNumber(this.newBeneficiary.idNumber);
			this.newBeneficiaryErrors.idNumber = ``;
			this.requestUpdate();
		}
	}

	/**
	 * Validate all fields on the beneficiary details step
	 * @returns {boolean} true if all fields are valid
	 */
	_validateBeneficiaryDetails() {
		let stepValid = true;

		if (isNullorEmpty(this.newBeneficiary?.title)) {
			this.newBeneficiaryErrors.title = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.title = ``;
		}

		if (isNullorEmpty(this.newBeneficiary?.gender)) {
			this.newBeneficiaryErrors.gender = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.gender = ``;
		}

		if (isNullorEmpty(this.newBeneficiary?.firstName)) {
			this.newBeneficiaryErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.firstName = ``;
		}

		if (isNullorEmpty(this.newBeneficiary?.lastName)) {
			this.newBeneficiaryErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.lastName = ``;
		}

		if (isNullorEmpty(this.newBeneficiary?.contactNumber)) {
			this.newBeneficiaryErrors.contactNumber = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else if (this.newBeneficiary?.contactNumber.length < 10) {
			this.newBeneficiaryErrors.contactNumber = VALIDATION_ERRORS.INVALID_CELL_NUMBER;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.contactNumber = ``;
		}

		if (isNullorEmpty(this.newBeneficiary?.relationship)) {
			this.newBeneficiaryErrors.relationship = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.relationship = ``;
		}

		if (this.newBeneficiary.dateOfBirth === undefined || this.newBeneficiary.dateOfBirth === ``) {
			this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else if (getAgeFromDob(this.newBeneficiary?.dateOfBirth) < 18) {
			this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
			stepValid = false;
		} else {
			this.newBeneficiaryErrors.dateOfBirth = ``;
		}

		if (!isNullorEmpty(this.newBeneficiary.idNumber)) {
			if (this.newBeneficiary.idNumber.length !== 13) {
				this.newBeneficiaryErrors.idNumber = VALIDATION_ERRORS.INVALID_ID;
				stepValid = false;
			}
		}

		if (stepValid === false) {
			this.beneficiaryDetailsErrorMessage = `Some fields contain invalid values`;
		} else {
			this.beneficiaryDetailsErrorMessage = ``;
		}

		return stepValid;
	}

	// #endregion Beneficiary Details

	// #region Allocation

	/**
	 * Validate allocate cover step
	 * @returns {boolean} true if allocation is valid
	 */
	_validateAllocateCover() {
		this.allocateMoneyErrorMessage = ``;

		if (this.pocketRemainingCover < 0) {
			this.allocateMoneyErrorMessage = VALIDATION_ERRORS.ALLOCATION_OVER;
			return false;
		}

		let beneficiariesValid = true;
		this.pocketBeneficiaries.forEach(bene => {
			bene.metaData.coverErrorMsg = ``;
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && bene.monthlyPayoutBenefitAmount < 1000) {
				bene.metaData.coverErrorMsg = VALIDATION_ERRORS.BENEFICIARY_MINIMUM;
				beneficiariesValid = false;
			}

			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && bene.onceOffPayoutBenefitAmount < 1000) {
				bene.metaData.coverErrorMsg = VALIDATION_ERRORS.BENEFICIARY_MINIMUM;
				beneficiariesValid = false;
			}
		});

		if (beneficiariesValid === false) {
			this.requestUpdate();
			return false;
		}

		return true;
	}

	/**
	 * Get the cover amount for a beneficiary
	 * 
	 * @param {Object} bene beneficiary being checked 
	 * @returns {number} cover amount for beneficiary
	 */
	_beneficiaryCoverValue(bene) {
		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return bene.monthlyPayoutBenefitAmount;
		}
		if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return bene.onceOffPayoutBenefitAmount;
		}
	}

	/**
	 * Event fired when a beneficiary cover amount value changes
	 * 
	 * @param {event} e event  
	 * @param {*} bene beneficiary being checked
	 * @returns {void}
	 */
	_beneficiaryCoverAmountChange(e, bene) {
		if (e.detail.old !== e.detail.new) {
			let value = e.detail.new;
			if (isNaN(value) || value === ``) {
				value = 0;
			}

			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				if (bene === null) {
					this.newBeneficiary.monthlyPayoutBenefitAmount = value;
					this.newBeneficiary.metaData.monthlyBenefitAdded = true;
				} else {
					bene.monthlyPayoutBenefitAmount = value;
					bene.metaData.monthlyBenefitAdded = true;
				}
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				if (bene === null) {
					this.newBeneficiary.onceOffPayoutBenefitAmount = value;
					this.newBeneficiary.metaData.onceOffBenefitAdded = true;
				} else {
					bene.onceOffPayoutBenefitAmount = value;
					bene.metaData.onceOffBenefitAdded = true;
				}
			}
			this._calculateCoverBreakdown();
		}
		this.requestUpdate();
	}

	// #endregion Allocation

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

	/**
	 * cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`, {}));
	}

	/**
	 * Next event from dialog footer button, moves to next step and validates fields from the current step
	 * 
	 * @returns {void}
	 */
	_nextClick() {
		let stepValid = true;
		if (this.eligibleBeneficiariesForQuickAdd.length > 0) {
			if (this.currentStep === 1) {
				if (this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.UNSET) {
					this.newOrExistingErrorMessage = `Please select an existing adult or add a new one`;
					stepValid = false;
				}
			}

			if (this.currentStep === 2) {
				stepValid = this._validateBeneficiaryDetails();
				if (stepValid && this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.EXISTING) {
					this.pocketBeneficiaries.push(this.newBeneficiary);
				}
			}
		} else {
			stepValid = this._validateBeneficiaryDetails();
		}

		if (stepValid === true) {
			this.currentStep++;

			this.newBeneficiaryErrors = {};
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
	}

	/**
	 * Decrease current step and reset errors
	 * 
	 * @returns {void}
	 */
	_backClick() {
		this.currentStep--;

		if (this.currentStep === 1 && this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.EXISTING) {
			this.pocketBeneficiaries.pop();
			this._calculateCoverBreakdown();
		}

		// this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.UNSET;
		this.beneficiaryDetailsErrorMessage = ``;
		this.allocateMoneyErrorMessage = ``;
	}

	/**
	 * Add event from dialog footer button, does validations on fields and adds new beneficiary
	 * 
	 * @returns {void}
	 */
	_addClick() {
		const allocationValid = this._validateAllocateCover();
		if (allocationValid === true) {
			this.dispatchEvent(new CustomEvent(`add-beneficiary`, {
				detail: {
					beneficiary: this.newBeneficiary,
					beneficiaryType: this.newBeneficiaryType
				}
			}));
		}
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

				.grouping{
					display: flex; 
					width: 100%;
					justify-content: space-between; 
					padding: 20px 15px 15px 15px; 
					gap: 10px;
				}
				
				.beneficiary-list{
					max-height: 500px;
					overflow-y: scroll;
				}

				.beneficiary-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					border-radius:  5px;
					margin: 15px;
				}

				.pocket-type-label{
					padding-left:15px;
				}

				.pocket-details-badge{
					display: flex;
					align-items: center;
				}
				
				.pocket-card{ 
					background-color: #F4F4F4;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					align-items: center;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					margin: 15px;
				}

				.add-existing-beneficiary-radio{
					border: 1px solid #e1e1e1; 
					border-radius: 5px; 
					padding: 10px; 
					width: 100%;
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
			<capitec-modal type="alert" header="Add Person" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body" >
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
				.steps="${this._determineSteps()}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			${this.eligibleBeneficiariesForQuickAdd.length > 0
				? html`
					<div style="${this.currentStep === 1 ? `display: block` : `display: none`}">
						${this._renderNewOrExistingQuickAdd()}
					</div>

					<div style="${this.currentStep === 2 ? `display: block` : `display: none`}">
						${this._renderBeneDetails()}
					</div>

					<div style="${this.currentStep === 3 ? `display: block` : `display: none`}">
						${this._renderMoneyAllocation()}
					</div>`
				: html`
					<div style="${this.currentStep === 1 ? `display: block` : `display: none`}">
						${this._renderBeneDetails()}
					</div>

					<div style="${this.currentStep === 2 ? `display: block` : `display: none`}">
						${this._renderMoneyAllocation()}
					</div>
				`
			}`;
	}

	/**
	 * Render new or existing step
	 * 
	 * @returns {html} html content
	 */
	_renderNewOrExistingQuickAdd() {
		return html`
			${this.newOrExistingErrorMessage !== ``
				? html`
				<div style="padding: 20px 16px 0px 16px;">
					<horizon-alert-banner
						type="error"
						header="Step incomplete"
						label="${this.newOrExistingErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}

			<capitec-content-box style="min-height:200px; padding-left: 15px;">

				<horizon-product-tile
					type="radio-button"
					label="Add New Person"
					subtitle="Not in any pocket"
					?selected="${this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.NEW}"
					@click="${() => this._continueWithNewBeneficiary()}">
				</horizon-product-tile>

				<div style="text-align: center;">
					<capitec-label 
						label="Or choose existing"
						type="strong">
					</capitec-label>
				</div>

				${this.eligibleBeneficiariesForQuickAdd.map((bene) => html`
					<horizon-product-tile
						type="radio-button"
						label="${`${bene.firstName} ${bene.lastName}`}"
						subtitle="${bene.relationship}"
						?selected="${this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.EXISTING}"
						@click="${() => this._continueWithExistingBeneficiary(bene)}">
					</horizon-product-tile>
				`)}
			</capitec-content-box>
		`;
	}

	/**
	 * Render beneficiary details step
	 * 
	 * @returns {html} html content
	 */
	_renderBeneDetails() {
		return html`
			${this.beneficiaryDetailsErrorMessage !== ``
				? html`
				<div style="padding: 20px 16px 0px 16px;">
					<horizon-alert-banner
						type="error"
						header="Step incomplete"
						.label="${this.beneficiaryDetailsErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}
			<div class="grouping">
				<capitec-select label="Title" display-field="text" id-field="code" style="width: 50%" value="${this.newBeneficiary?.title}" 
					error="${this.newBeneficiaryErrors?.title === undefined ? `` : this.newBeneficiaryErrors.title}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._titleChange(e)}">
				</capitec-select>

				<capitec-select label="Gender"  display-field="text" id-field="code"  style="width: 50%" 
					value="${this.newBeneficiary?.gender}" 
					error="${this.newBeneficiaryErrors?.gender === undefined ? `` : this.newBeneficiaryErrors.gender}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._genderChange(e)}">
				</capitec-select>
			</div>

			<div class="grouping">
				<capitec-text-field 
					label="First Name" 
					style="width: 50%"
					value="${this.newBeneficiary?.firstName}"
					error="${this.newBeneficiaryErrors?.firstName === undefined ? `` : this.newBeneficiaryErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Surname" 
					style="width: 50%"
					value="${this.newBeneficiary?.lastName}"
					error="${this.newBeneficiaryErrors?.lastName === undefined ? `` : this.newBeneficiaryErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-select label="Relationship" .items="${this.beneficiaryRelationships}" display-field="text" id-field="code"
					style="width: 50%" value="${this.newBeneficiary?.relationship}" 
					error="${this.newBeneficiaryErrors?.relationship === undefined ? `` : this.newBeneficiaryErrors.relationship}"
					@value-changed = "${(e) => this._relationshipChange(e)}">
				</capitec-select>

				<capitec-text-field 
					label="Cellphone number" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					value="${this.newBeneficiary?.contactNumber}"
					error="${this.newBeneficiaryErrors?.contactNumber === undefined ? `` : this.newBeneficiaryErrors.contactNumber}"
					@value-changed="${(e) => this._cellphoneNumChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					error="${this.newBeneficiaryErrors?.idNumber === undefined ? `` : this.newBeneficiaryErrors.idNumber}"
					@value-changed="${(e) => this._idChange(e, true)}">
				</capitec-text-field>

				<capitec-date-time-picker 
					style="width: 50%;" 
					label="Date of Birth" 
					type="single" 
					mode="date" 
					inputType="calendar"
					date="${this.newBeneficiary?.dateOfBirth}"
					value="${formatDate(this.newBeneficiary?.dateOfBirth)}"
					outputType="string" 
					maxdate="${this.today}" 
					minDate="1901-01-01"
					error="${this.newBeneficiaryErrors?.dateOfBirth}"
					@value-changed="${(e) => this._dobChange(e)}">
				</capitec-date-time-picker>
			</div>
		`;
	}

	/**
	 * Render Money Allocation step
	 * 
	 * @returns {html} html content
	 */
	_renderMoneyAllocation() {
		return html`
			${this.allocateMoneyErrorMessage !== ``
				? html`
				<div style="padding: 20px 16px 0px 16px;">
					<horizon-alert-banner
						type="error"
						header="Step incomplete"
						.label="${this.allocateMoneyErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}

			<div class="pocket-card"> 
				<div class="pocket-details-badge">
					<capitec-icon style="padding-right: 10px;" .icon="${pocketBadgeIcon(this.selectedPocketType)}" size="large"></capitec-icon>
					<capitec-label type="strong"
						class="pocket-type-label ${pocketBadgeColorClass(this.selectedPocketType)}"
						.label="${pocketBadgeLabel(this.selectedPocketType)}">
					</capitec-label>
				</div>

				<div style="display: flex; gap: 40px;">
					<horizon-label
						label="Cover amount"
						value="${formatCurrencyInsureCoverAmount(formatCurrency(this.totalPocketCover))}">
					</horizon-label>

					<horizon-label
						label="Remaining balance"
						value="${formatCurrencyInsureCoverAmount(formatCurrency(isNaN(this.pocketRemainingCover) ? 0 : this.pocketRemainingCover))}">
					</horizon-label>
				</div>
			</div>

			<!-- Current in flight beneficiary -->
			${this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.NEW ? html`
				<div class="beneficiary-card" style="${this.pocketBeneficiaries.length > 0 ? `margin-right: 30px;` : ``}">
					<div style="display: flex; gap:20px;">
						<capitec-avatar value="${this.newBeneficiary?.firstName?.charAt(0) + this.newBeneficiary?.lastName?.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
						<horizon-label
							label="${this.newBeneficiary?.firstName}"
							value="${this.newBeneficiary?.lastName}">
						</horizon-label>
					</div>
					<div style="display: flex; gap: 20px;">
						<capitec-text-field 
							type="currency" 
							class="pocket-details-input pocket-details-label" 
							label=""
							value="${this._beneficiaryCoverValue(this.newBeneficiary)}"
							@value-changed="${(e) => this._beneficiaryCoverAmountChange(e, null)}">
						</capitec-text-field>
					</div>
				</div>
			` : html``}

			<div class="beneficiary-list">
				${this.pocketBeneficiaries.map((bene) => html`
					<div class="beneficiary-card">
						<div style="display: flex; gap:20px;">
							<capitec-avatar value="${bene.firstName?.charAt(0) + bene.lastName?.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
							<horizon-label
								label="${bene.firstName}"
								value="${bene.lastName}">
							</horizon-label>
						</div>
						<div style="display: flex; gap: 20px;">
							<capitec-text-field 
								type="currency" 
								class="pocket-details-input pocket-details-label" 
								label=""
								value="${this._beneficiaryCoverValue(bene)}"
								@value-changed="${(e) => this._beneficiaryCoverAmountChange(e, bene)}">
							</capitec-text-field>
						</div>
					</div>
				`)}
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
				${this.currentStep === 1
				? html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
					</capitec-button>`
				: html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Back" @click="${() => this._backClick()}">
					</capitec-button>
				`}

				${this.eligibleBeneficiariesForQuickAdd.length > 0
				? html`
					${this.currentStep === 3 ? html`
						<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Done" @click="${() => this._addClick()}"></capitec-button>
					` : html`
						<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextClick()}" ></capitec-button>
					`}
				`
				: html`
					${this.currentStep === 2 ? html`
							<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Add" @click="${() => this._addClick()}"></capitec-button>
						` : html`
							<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextClick()}" ></capitec-button>
						`}
				`}
			`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-add-beneficiary-dialog`, LifeAddBeneficiaryDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-add-beneficiary-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-add-beneficiary-dialog>
 *
 * @event LifeAddBeneficiaryDialog#close-modal
 * @type {Object} - N/A
 */