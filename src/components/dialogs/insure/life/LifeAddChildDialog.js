import { Component, css, html } from 'platform/elements';
import { GENDER_OPTIONS, LIFE_BENEFICIARY_RELATIONSHIP_TYPES, LIFE_CHILD_RELATIONSHIP_TYPES, LIFE_POCKET_TYPES, TITLE_OPTIONS } from 'app/constants/InsureCommon';
import { formatCurrencyInsureCoverAmount, getAgeFromDob, getDobFromIDNumber } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be under 18`,
	GUARDIAN_UNDER_18: `Guardian must be over 18`,
	INVALID_ID: `ID Number is invalid`,
	INVALID_CELL_NUMBER: `Cellphone Number is invalid`
};

const STEPS = {
	CHILD_DETAILS: 1,
	NEW_OR_EXISTING_GUARDIAN: 2,
	GUARDIAN_DETAILS: 3,
	MONEY_ALLOCATION: 4
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
class LifeAddChildDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = 1;
		this.policy = {};
		this.selectedPocket = {};

		this.newGuardianType = NEW_BENEFICIARY_TYPES.UNSET;

		this.pocketBeneficiaries = [];
		this.newChild = {};
		this.newChildErrors = {};
		this.newGuardian = {};
		this.newGuardianErrors = {};

		this.beneficiaryDetailsErrorMessage = ``;
		this.newOrExistingErrorMessage = ``;

		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;
		this.beneficiaryRelationships = LIFE_BENEFICIARY_RELATIONSHIP_TYPES;
		this.childBeneficiaryRelationships = LIFE_CHILD_RELATIONSHIP_TYPES;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			selectedPocket: { type: Object, state: true },
			eligibleGuardiansForQuickAdd: { type: Array, state: true },
			newOrExistingErrorMessage: { type: String, state: true },
			beneficiaryDetailsErrorMessage: { type: String, state: true },

			currentStep: { type: Number, state: true },
			newChild: { type: Object, state: true },
			newChildErrors: { type: Object, state: true },
			newGuardian: { type: Object, state: true },
			pocketBeneficiaries: { type: Array, state: true },
			totalPocketCover: { type: Number, state: true },
			selectedPocketType: { type: String, state: true }
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

	disconnectedCallback() {
		super.disconnectedCallback();
	}

	//  #endregion LIFECYCLE OVERRIDES


	// #region PRIVATE METHODS

	initialise() {
		this.eligibleGuardiansForQuickAdd = this.policy.guardians ?? [];

		// Add all existing children or new one to list
		if (this.policy.beneficiaries.length > 0) {
			for (const bene of this.policy.beneficiaries) {
				if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && bene.metaData.educationBenefitAdded === true) {
					this.newChild.monthlyPayoutBenefitAmount = 0;
					this.newChild.metaData.monthlyBenefitAdded = true;
					this.pocketBeneficiaries.push(bene);
				}
			}
		} else {
			this.newChild.educationBenefitAmount = 0;
			this.newChild.metaData.educationBenefitAdded = true;
			this.pocketBeneficiaries.push(bene);
		}
		this._calculateCoverBreakdown();
	}

	/**
	 * Determine the initial cover breakdown for the selected pocket
	 * @returns {void}
	 */
	_calculateCoverBreakdown() {
		let totalAllocated = 0;
		for (const bene of this.pocketBeneficiaries) {
			if (bene.metaData.monthlyBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
				totalAllocated += bene.educationBenefitAmount === `` ? 0 : parseFloat(bene.educationBenefitAmount);
			}
		}

		// New Beneficiary?
		if (this.newChild !== null) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
				totalAllocated += this.newChild.educationBenefitAmount === `` ? 0 : parseFloat(this.newChild.educationBenefitAmount);
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
		if (this.eligibleGuardiansForQuickAdd.length > 0) {
			steps = [{ title: `Child Details` }, { title: `New or existing Guardian` }, { title: `Guardian Details` }, { title: `Allocate cover` }];
		} else {
			steps = [{ title: `Child Details` }, { title: `Guardian Details` }, { title: `Allocate cover` }];
		}
		console.log(steps);
		return steps;
	}

	/**
	 * Continue with new Guardian
	 * 
	 * @returns {void}
	 */
	_continueWithNewGuardian() {
		this.newGuardianType = NEW_BENEFICIARY_TYPES.NEW;
		this.newGuardian = {};
		this.newOrExistingErrorMessage = ``;
	}

	/**
	 * Continue with existing Guardian
	 * 
	 * @param {Object} guardian guardian being modified
	 * @returns {void} 
	 */
	_continueWithExistingGuardian(guardian) {
		this.newGuardianType = NEW_BENEFICIARY_TYPES.EXISTING;
		this.newOrExistingErrorMessage = ``;
		this.newGuardian = guardian;
	}

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
	 * @returns {void}
	 */
	_nextClick() {
		let isValid = false;

		if (this.currentStep === STEPS.CHILD_DETAILS) {
			isValid = this._validateChildStep();
			console.log(`Child validations is: ${isValid}`);
		} else if (this.currentStep === STEPS.NEW_OR_EXISTING_GUARDIAN) {
			if (this.newGuardianType === NEW_BENEFICIARY_TYPES.UNSET) {
				this.newOrExistingErrorMessage = `Please select an existing guardian or add a new one`;
			} else {
				this.newOrExistingErrorMessage = ``;
				isValid = true;
			}
		} else if (this.currentStep === STEPS.GUARDIAN_DETAILS) {
			isValid = this._validateGuardianStep();
			console.log(`Guardian validations is: ${isValid}`);
		}

		if (isValid) {
			this.currentStep++;
		}
	}

	/**
	 *  Validate child details step
	 * @returns {void}
	 */
	_validateChildStep() {
		let stepValid = true;

		if (isNullorEmpty(this.newChild?.title)) {
			this.newChildErrors.title = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newChild?.titlesss`);
		} else {
			this.newChildErrors.title = ``;
		}

		if (isNullorEmpty(this.newChild?.gender)) {
			this.newChildErrors.gender = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newChild?.gender`);
		} else {
			this.newChildErrors.gender = ``;
		}

		if (isNullorEmpty(this.newChild?.firstName)) {
			this.newChildErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newChild?.firstName`);
		} else {
			this.newChildErrors.firstName = ``;
		}

		if (isNullorEmpty(this.newChild?.lastName)) {
			this.newChildErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newChild?.lastName`);
		} else {
			this.newChildErrors.lastName = ``;
		}

		if (!isNullorEmpty(this.newChild?.contactNumber)) {
			if (this.newChild?.contactNumber.length < 10) {
				this.newChildErrors.contactNumber = VALIDATION_ERRORS.INVALID_CELL_NUMBER;
				stepValid = false;
			} else {
				this.newChildErrors.contactNumber = ``;
			}
		} else {
			this.newChildErrors.contactNumber = ``;
		}

		if (isNullorEmpty(this.newChild?.relationship)) {
			this.newChildErrors.relationship = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newChildErrors.relationship = ``;
		}

		if (this.newChild.dateOfBirth === undefined || this.newChild.dateOfBirth === ``) {
			this.newChildErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newChild?.dateOfBirth`);
		} else {
			this.newChildErrors.dateOfBirth = ``;
		}

		if (!isNullorEmpty(this.newChild.idNumber)) {
			if (this.newChild.idNumber.length !== 13) {
				this.newChildErrors.idNumber = VALIDATION_ERRORS.INVALID_ID;
				stepValid = false;
			} else {
				this.newChildErrors.idNumber = ``;
			}
		}

		if (stepValid === false) {
			this.beneficiaryDetailsErrorMessage = `Some fields contain invalid values`;
		} else {
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
		return stepValid;
	}

	/**
	 *  Validate guardian step
	 * @returns {void}
	 */
	_validateGuardianStep() {
		let stepValid = true;

		if (isNullorEmpty(this.newGuardian?.title)) {
			this.newGuardianErrors.title = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newGuardian?.title`);
		} else {
			this.newGuardianErrors.title = ``;
		}

		if (isNullorEmpty(this.newGuardian?.gender)) {
			this.newGuardianErrors.gender = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newGuardian?.gender`);
		} else {
			this.newGuardianErrors.gender = ``;
		}

		if (isNullorEmpty(this.newGuardian?.firstName)) {
			this.newGuardianErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newGuardian?.firstName`);
		} else {
			this.newGuardianErrors.firstName = ``;
		}

		if (isNullorEmpty(this.newGuardian?.lastName)) {
			this.newGuardianErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
			console.log(`Issue with newGuardian?.lastName`);
		} else {
			this.newGuardianErrors.lastName = ``;
		}

		if (!isNullorEmpty(this.newGuardian?.contactNumber)) {
			if (this.newGuardian?.contactNumber.length < 10) {
				this.newGuardianErrors.contactNumber = VALIDATION_ERRORS.INVALID_CELL_NUMBER;
				console.log(`Issue with newGuardian?.contactNumber`);
				stepValid = false;
			} else {
				this.newGuardianErrors.contactNumber = ``;
			}
		} else {
			this.newGuardianErrors.contactNumber = ``;
		}

		if (isNullorEmpty(this.newGuardian?.relationship)) {
			this.newGuardianErrors.relationship = VALIDATION_ERRORS.REQUIRED_FIELD;
			console.log(`Issue with newGuardian?.relationship`);
			stepValid = false;
		} else {
			this.newGuardianErrors.relationship = ``;
		}

		if (this.newGuardian.dateOfBirth === undefined || this.newGuardian.dateOfBirth === ``) {
			this.newGuardianErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			console.log(`Issue with newGuardian?.dateOfBirth`);
			stepValid = false;
		} else {
			this.newGuardianErrors.dateOfBirth = ``;
		}

		if (!isNullorEmpty(this.newGuardian.idNumber)) {
			if (this.newGuardian.idNumber.length !== 13) {
				this.newGuardianErrors.idNumber = VALIDATION_ERRORS.INVALID_ID;
				console.log(`Issue with newGuardian?.idNumber`);
				stepValid = false;
			} else {
				this.newGuardianErrors.idNumber = ``;
			}
		}

		if (stepValid === false) {
			this.beneficiaryDetailsErrorMessage = `Some fields contain invalid values`;
		} else {
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
		return stepValid;
	}

	/**
	 * back event from dialog footer button, moves to previous step
	 * @returns {void}
	 * 
	 */
	_backClick() {
		this.currentStep--;
		// if (this.currentStep === STEPS.MONEY_ALLOCATION) {
		// 	if (this.isChild) {
		// 		this.currentStep = STEPS.GUARDIAN_DETAILS;
		// 	} else {
		// 		this.pocketBeneficiaries.splice(this.pocketBeneficiaries.length - 1, 1);
		// 		this.currentStep = STEPS.BENEFICIARY_DETAILS;
		// 	}

		// } else {
		// 	this.pocketBeneficiaries.splice(this.pocketBeneficiaries.length - 1, 1);
		// 	this.currentStep = STEPS.BENEFICIARY_DETAILS;
		// }
	}

	/**
	 * Add event from dialog footer button, does validations on fields and adds new beneficiary
	 * @returns {void}
	 */
	_addClick() {
		// do another round of validations before adding
	}

	/**
	 * Event fired when a beneficiary OR guardian TITLE value changes
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_titleChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.title = e.detail.new.code;
				if (this.newChild.title === `Mr` || this.newChild.title === `Sir`) {
					this.newChild.gender = `Male`;
					this.newChildErrors.gender = ``;
				} else if (this.newChild.title === `Mrs` || this.newChild.title === `Ms` || this.newChild.title === `Miss` || this.newChild.title === `Lady`) {
					this.newChild.gender = `Female`;
					this.newChildErrors.gender = ``;
				}
				if (!isNullorEmpty(this.newChild.title)) {
					this.newChildErrors.title = ``;
				}
			} else {
				this.newGuardian.title = e.detail.new.code;
				if (this.newGuardian.title === `Mr` || this.newGuardian.title === `Sir`) {
					this.newGuardian.gender = `Male`;
					this.newGuardianErrors.gender = ``;
				} else if (this.newGuardian.title === `Mrs` || this.newGuardian.title === `Ms` || this.newGuardian.title === `Miss` || this.newGuardian.title === `Lady`) {
					this.newGuardian.gender = `Female`;
					this.newGuardianErrors.gender = ``;
				}
				if (!isNullorEmpty(this.newGuardian.title)) {
					this.newGuardianErrors.title = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary GENDER value changes
	   * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_genderChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.gender = e.detail.new.code;
				if (!isNullorEmpty(this.newChild.gender)) {
					this.newChildErrors.gender = ``;
				}
			} else {
				this.newGuardian.gender = e.detail.new.code;
				if (!isNullorEmpty(this.newGuardian.gender)) {
					this.newGuardianErrors.gender = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary FIRST NAME value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_firstNameChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.firstName = e.detail.new;
				if (isNullorEmpty(this.newChild.firstName)) {
					this.newChildErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newChildErrors.firstName = ``;
				}
			} else {
				this.newGuardian.firstName = e.detail.new;
				if (isNullorEmpty(this.newGuardian.firstName)) {
					this.newGuardianErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newGuardianErrors.firstName = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary SURNAME value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_surnameChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.lastName = e.detail.new;
				if (isNullorEmpty(this.newChild.lastName)) {
					this.newChildErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newChildErrors.lastName = ``;
				}
			} else {
				this.newGuardian.lastName = e.detail.new;
				if (isNullorEmpty(this.newGuardian.lastName)) {
					this.newGuardianErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newGuardianErrors.lastName = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary RELATIONSHIP value changes
	   * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_relationshipChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.relationship = e.detail.new.code;
				if (!isNullorEmpty(this.newChild.relationship)) {
					this.newChildErrors.relationship = ``;
				}
			} else {
				this.newGuardian.relationship = e.detail.new.code;
				if (!isNullorEmpty(this.newGuardian.relationship)) {
					this.newGuardianErrors.relationship = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary ID value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_idChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.idNumber = e.detail.new;
				if (this.newChild.idNumber.length === 13) {
					this.newChild.dateOfBirth = getDobFromIDNumber(this.newChild.idNumber);
					this.newChildErrors.dateOfBirth = ``;
					this.newChildErrors.idNumber = ``;
				}
			} else {
				this.newGuardian.idNumber = e.detail.new;
				if (this.newGuardian.idNumber.length === 13) {
					this.newGuardian.dateOfBirth = getDobFromIDNumber(this.newGuardian.idNumber);
					this.newGuardianErrors.dateOfBirth = ``;
					this.newGuardianErrors.idNumber = ``;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_dobChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.dateOfBirth = e.detail.new.date;
				const wrongTimeZone = this.newChild.dateOfBirth.includes(`+02:00`);
				if (wrongTimeZone === true) {
					let dob = this.newChild.dateOfBirth;
					const timezone = `+02:00`;
					dob = dob.replace(timezone, ``);
					this.newChild.dateOfBirth = dob;
				}
				if (isNullorEmpty(this.newChild.dateOfBirth)) {
					this.newChildErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newChildErrors.dateOfBirth = ``;
				}
				if (getAgeFromDob(this.newChild.dateOfBirth) > 18) {
					this.newChildErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
				}
			} else {
				this.newGuardian.dateOfBirth = e.detail.new.date;
				const wrongTimeZone = this.newGuardian.dateOfBirth.includes(`+02:00`);
				if (wrongTimeZone === true) {
					let dob = this.newGuardian.dateOfBirth;
					const timezone = `+02:00`;
					dob = dob.replace(timezone, ``);
					this.newGuardian.dateOfBirth = dob;
				}
				if (isNullorEmpty(this.newGuardian.dateOfBirth)) {
					this.newGuardianErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
				} else {
					this.newGuardianErrors.dateOfBirth = ``;
				}
				if (getAgeFromDob(this.newGuardian.dateOfBirth) < 18) {
					this.newGuardianErrors.dateOfBirth = VALIDATION_ERRORS.GUARDIAN_UNDER_18;
				}
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary CELL NUMBER value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_cellphoneNumChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newChild.contactNumber = e.detail.new;
				if (!isNullorEmpty(this.newChild.contactNumber)) {
					this.newChildErrors.contactNumber = ``;
				}
			} else {
				this.newGuardian.contactNumber = e.detail.new;
				if (!isNullorEmpty(this.newGuardian.contactNumber)) {
					this.newGuardianErrors.contactNumber = ``;
				}
			}
		}
	}

	/**
	 * Event fired when a beneficiary EMAIL value changes
	 * 
	 * @param {event} e e
	 * @param {beneficiary} beneficiary determines whether beneficiary or guardian
	 * @returns {void}
	 */
	_emailChange(e, beneficiary) {
		if (e.detail.old !== e.detail.new) {
			if (beneficiary) {
				this.newGuardian.contactEmail = e.detail.new;
				if (!isNullorEmpty(this.newGuardian.contactEmail)) {
					this.newGuardianErrors.contactEmail = ``;
				}
			} else {
				this.newGuardian.contactEmail = e.detail.new;
				if (!isNullorEmpty(this.newGuardian.contactEmail)) {
					this.newGuardianErrors.contactEmail = ``;
				}
			}
		}
	}

	_allocatedAmountChange(e, index) {

		if (e.detail.old !== e.detail.new) {
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
				this.pocketBeneficiaries[index].educationBenefitAmount = e.detail.new;
			}
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
				this.pocketBeneficiaries[index].monthlyPayoutBenefitAmount = e.detail.new;
			}
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				this.pocketBeneficiaries[index].onceOffPayoutBenefitAmount = e.detail.new;
			}
		}
		this.requestUpdate();
	}

	/**
	 * gets the allocated amount for the current pocket
	 * 
	 * @param {object} beneficiary beneficiary object
	 * @returns {Number} number 
	 */
	_getBenePocketAllocation(beneficiary) {
		if (this.selectedPocket.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return beneficiary.educationBenefitAmount;
		}
		if (this.selectedPocket.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return beneficiary.monthlyPayoutBenefitAmount;
		}
		if (this.selectedPocket.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return beneficiary.onceOffPayoutBenefitAmount;
		}
	}

	/**
	 * calculates the remaining balance of the coverge amount after allocation
	 * 
	 * @returns {Number} number 
	 */
	_calculateRemainingBalance() {
		let remainingBalance = this.selectedPocket.coverage;

		if (this.pocketBeneficiaries.length > 0) {
			this.pocketBeneficiaries.forEach(bene => {
				remainingBalance -= this._getBenePocketAllocation(bene);
			});
		}
		this.requestUpdate();
		return formatCurrencyInsureCoverAmount(formatCurrency(remainingBalance));
	}

	_determinePocketLabel() {
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `Children's Needs`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `Monthly Income`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `Lump Sum`;
		}
	}

	_determinePocketIcon() {
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `/insure_education_pocket`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `/insure_monthly_pocket`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `/insure_onceoff_pocket`;
		}
	}

	_determinePocketClass() {
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return `education-label`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
			return `monthly-label`;
		}
		if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
			return `onceoff-label`;
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
					--theme-modal-free-m-l-xl-width: 842px;
					--theme-modal-alert-m-l-xl-width: 950px;
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
				
				.beneficiary-card{
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					border-radius:  5px;
					margin: 15px;
				}

				.education-label{
					align-self: center;
					--theme-label-font-color: #AA1580;
				}

				.monthly-label{
					align-self: center;
					--theme-label-font-color: #852CB3;
				}

				.onceoff-label{
					align-self: center;
					--theme-label-font-color: #009E96;
				}
				
				.pocket-card{ 
					background-color: #F4F4F4;
					display: flex;
					flex-direction: row;
					justify-content: space-between;
					box-shadow: 0px 1px 3px 0px #00000026;
					padding: 14px 24px;
					margin: 15px;
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
			<capitec-modal type="alert" header="Add Child" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
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

			<div style="${this.currentStep === STEPS.NEW_OR_EXISTING_GUARDIAN ? `display: block` : `display: none`}">
				${this._renderNewOrExistingQuickAdd()}
			</div>
			<div style="${this.currentStep === STEPS.CHILD_DETAILS ? `display: block` : `display: none`}">
				${this._renderChildDetails()}
			</div>
			<div style="${this.currentStep === STEPS.GUARDIAN_DETAILS ? `display: block` : `display: none`}">
				${this._renderGuardianDetails()}
			</div>
			<div style="${this.currentStep === STEPS.MONEY_ALLOCATION ? `display: block` : `display: none`}">
				${this._renderMoneyAllocation()}
			</div>`;
	}

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
					label="Add Guardian"
					subtitle="Add a new guardian for this child"
					?selected="${this.newGuardianType === NEW_BENEFICIARY_TYPES.NEW}"
					@click="${() => this._continueWithNewGuardian()}">
				</horizon-product-tile>

				<div style="text-align: center;">
					<capitec-label 
						label="Or choose existing"
						type="strong">
					</capitec-label>
				</div>

				${this.eligibleGuardiansForQuickAdd.map((guardian) => html`
					<horizon-product-tile
						type="radio-button"
						label="${`${guardian.firstName} ${guardian.lastName}`}"
						subtitle="${guardian.relationship}"
						?selected="${this.newGuardianType === NEW_BENEFICIARY_TYPES.EXISTING}"
						@click="${() => this._continueWithExistingGuardian(guardian)}">
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
	_renderChildDetails() {
		return html`
			${this.beneficiaryDetailsErrorMessage !== ``
				? html`
				<div style="padding: 20px 16px 0px 16px;">
					<horizon-alert-banner
						type="error"
						header="Step incomplete"
						layout="vertical"
						.label="${this.beneficiaryDetailsErrorMessage}">
					</horizon-alert-banner>
				</div>`
				: html``
			}
			<div class="grouping">
				<capitec-select 
					label="Title" 
					display-field="text" 
					id-field="code" style="width: 50%" 
					value="${this.newChild?.title}"
					error="${this.newChildErrors?.title === undefined ? `` : this.newChildErrors.title}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._titleChange(e, true)}">
				</capitec-select>

				<capitec-select 
					label="Gender"  
					display-field="text" 
					id-field="code"  style="width: 50%" 
					value="${this.newChild?.gender}" 
					error="${this.newChildErrors?.gender === undefined ? `` : this.newChildErrors.gender}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._genderChange(e, true)}">
				</capitec-select>
			</div>
			
			<div class="grouping">
				<capitec-text-field 
					label="First Name" 
					style="width: 50%" 
					error="${this.newChildErrors?.firstName === undefined ? `` : this.newChildErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e, true)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Surname"
					style="width: 50%" 
					error="${this.newChildErrors?.lastName === undefined ? `` : this.newChildErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e, true)}">
				</capitec-text-field>
			</div>

			<div class="grouping" >
				<capitec-text-field 
					label="ID Number" 
					style="width: 50%" 
					maxlength="13" 
					type="numeric"
					@value-changed="${(e) => this._idChange(e, true)}">
				</capitec-text-field>
			
				<capitec-date-time-picker 
					style="width: 50%;" 
					label="Date of Birth" 
					type="single" 
					mode="date" 
					inputType="calendar"
					date="${this.newChild?.dateOfBirth}"
					value="${formatDate(this.newChild?.dateOfBirth)}"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					error="${this.newChildErrors?.dateOfBirth === undefined ? `` : this.newChildErrors.dateOfBirth}"
					@value-changed="${(e) => this._dobChange(e, true)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping" >
				<capitec-text-field 
					label="Cellphone number (optional)" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					@value-changed="${(e) => this._cellphoneNumChange(e, true)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Email address (optional)" 
					style="width: 50%"
					@value-changed="${(e) => this._emailChange(e, true)}" >
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-select 
					label="Relationship" 
					display-field="text" 
					id-field="code"
					style="width: 50%" value="${this.newChild?.relationship}" 
					error="${this.newChildErrors?.relationship === undefined ? `` : this.newChildErrors?.relationship}"
					.items="${this.childBeneficiaryRelationships}" 
					@value-changed = "${(e) => this._relationshipChange(e, true)}">
				</capitec-select>
			</div>
		`;
	}

	/**
	 * Render Guardian details step
	 * 
	 * @returns {html} html content
	 */
	_renderGuardianDetails() {
		return html`
			<div class="grouping">
				<capitec-select 
					label="Title" 
					display-field="text" 
					id-field="code" style="width: 50%" 
					value="${this.newGuardian?.title}"
					error="${this.newGuardianErrors?.title === undefined ? `` : this.newGuardianErrors.title}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._titleChange(e, false)}">
				</capitec-select>
				<capitec-select 
					label="Gender"  
					display-field="text" 
					id-field="code"  style="width: 50%" 
					value="${this.newGuardian?.gender}" 
					error="${this.newGuardianErrors?.gender === undefined ? `` : this.newGuardianErrors.gender}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._genderChange(e, false)}">
				</capitec-select>
			</div>

			<div class="grouping">
				<capitec-text-field 
					label="First Name" 
					style="width: 50%"
					value="${this.newGuardian.firstName}"
					error="${this.newGuardianErrors?.firstName === undefined ? `` : this.newGuardianErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e, false)}">
				</capitec-text-field>
				<capitec-text-field 
					label="Surname" 
					style="width: 50%" 
					value="${this.newGuardian.lastName}"
					error="${this.newGuardianErrors?.lastName === undefined ? `` : this.newGuardianErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e, false)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-text-field 
					label="ID Number" 
					style="width: 50%" 
					maxlength="13" 
					type="numeric"
					value="${this.newGuardian.idNumber}"
					error="${this.newGuardianErrors?.idNumber === undefined ? `` : this.newGuardianErrors.idNumber}"
					@value-changed="${(e) => this._idChange(e, false)}">
				</capitec-text-field>
			
				<capitec-date-time-picker 
					style="width: 50%" 
					label="Date of Birth" 
					type="single" 
					mode="date" 
					inputType="calendar"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					value="${this.newGuardian.dateOfBirth}"
					error="${this.newGuardianErrors?.dateOfBirth === undefined ? `` : this.newGuardianErrors.dateOfBirth}"
					@value-changed="${(e) => this._dobChange(e, false)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping">
				<capitec-text-field 
					label="Cellphone number" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					value="${this.newGuardian.contactNumber}"
					error="${this.newGuardianErrors?.contactNumber === undefined ? `` : this.newGuardianErrors.contactNumber}"
					@value-changed="${(e) => this._cellphoneNumChange(e, false)}">
				</capitec-text-field>
				<capitec-text-field 
					label="Email address (optional)"
					style="width: 50%"
					value="${this.newGuardian.contactEmail}"
					error="${this.newGuardianErrors?.contactEmail === undefined ? `` : this.newGuardianErrors.contactEmail}"
					@value-changed="${(e) => this._emailChange(e, false)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-select 
					label="Relationship" 
					display-field="text" 
					id-field="code"
					style="width: 50%" value="${this.newGuardian?.relationship}" 
					.items="${this.beneficiaryRelationships}" 
					error="${this.newGuardianErrors?.relationship === undefined ? `` : this.newGuardianErrors?.relationship}"
					@value-changed = "${(e) => this._relationshipChange(e, false)}">
				</capitec-select>
			</div>`;
	}

	/**
	 * Render MOney Allocation step
	 * 
	 * @returns {html} html content
	 */
	_renderMoneyAllocation() {
		return html`
			<div class="pocket-card"> 
				<div style="display: flex; gap:20px;">
					<capitec-icon .icon="${this._determinePocketIcon()}" size="large"></capitec-icon>
					<capitec-label .label="${this._determinePocketLabel()}" type="subtitle" class="${this._determinePocketClass()}"></capitec-label>
				</div>

				<div style="display: flex; gap: 40px;">
					<horizon-label
						label="Cover amount"
						value="${formatCurrencyInsureCoverAmount(formatCurrency(this.selectedPocket.coverage))}">
					</horizon-label>

					<horizon-label
						label="Remaining balance"
						value="${this._calculateRemainingBalance()}">
					</horizon-label>
				</div>
			</div>

			${this.pocketBeneficiaries?.map((beneficiary, index) => html`
				<div class="beneficiary-card">
					<div style="display: flex; gap:20px;">
						<capitec-avatar value="${beneficiary.firstName.charAt(0) + beneficiary.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
						<capitec-label
							label="${beneficiary.firstName} ${beneficiary.lastName}">
						</capitec-label>
					</div>
					<div style="display: flex; gap: 20px;">
						<capitec-text-field type="currency" value="${this._getBenePocketAllocation(beneficiary)}"
							@value-change="${(e) => this._allocatedAmountChange(e, index)}">
						</capitec-text-field>
					</div>
				</div>
			`)}
		`;
	}

	/**
	 * Render modal footer section
	 * 
	 * @returns {html} The html content of the component.
	 */
	_renderDialogFooter() {
		return html`
				${this.currentStep === STEPS.CHILD_DETAILS ? html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
					</capitec-button>
				` : html`
						<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Back" @click="${() => this._backClick()}">
						</capitec-button>
				`}
				
				${this.currentStep !== STEPS.MONEY_ALLOCATION ? html`
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextClick()}">
					</capitec-button>
				` : html`
					<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Add" @click="${() => this._addClick()}">
					</capitec-button>
				`}
		`;
	}

	// #endregion RENDERING
}

window.customElements.define(`horizon-insure-life-add-child-dialog`, LifeAddChildDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-add-beneficiary-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-add-beneficiary-dialog>
 *
 * @event LifeAddBeneficiaryDialog#close-modal
 * @type {Object} - N/A
 */