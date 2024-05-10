import { Component, css, html } from 'platform/elements';
import { GENDER_OPTIONS, LIFE_POCKET_TYPES, TITLE_OPTIONS } from 'app/constants/InsureCommon';
import { formatCurrencyInsureCoverAmount, getAgeFromDob } from 'app/utils/insureUtils';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be under 18`,
	INVALID_ID: `ID Number is invalid`,
	INVALID_CELL_NUMBER: `Cellphone Number is invalid`
};

const STEPS = {
	//NEW_OR_EXISTING_BENEFICIARY: 1,
	CHILD_DETAILS: 1,
	GUARDIAN_DETAILS: 2,
	MONEY_ALLOCATION: 3
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

		this.isChild = false;
		this.currentStep = 1;
		this.policy = {};
		this.selectedPocket = {};

		this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.UNSET;

		this.newPocketBeneficiaries = [];
		this.newChild = {};
		this.newChildErrors = {};
		this.guardianDetails = {};

		this.beneficiaryDetailsErrorMessage = ``;
		this.newOrExistingErrorMessage = ``;

		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			policy: { type: Object, state: true },
			isChild: { type: Boolean, state: true },
			selectedPocket: { type: Object, state: true },
			eligibleBeneficiariesForQuickAdd: { type: Array, state: true },
			newOrExistingErrorMessage: { type: String, state: true },
			beneficiaryDetailsErrorMessage: { type: String, state: true },

			currentStep: { type: Number, state: true },
			newChild: { type: Object, state: true },
			newChildErrors: { type: Object, state: true },
			guardianDetails: { type: Object, state: true },
			newPocketBeneficiaries: { type: Array, state: true },
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
		// this.eligibleBeneficiariesForQuickAdd = this._determineQuickAddBeneficiaries();
		// if (this.eligibleBeneficiariesForQuickAdd.length === 0) {
		// 	this.newBeneficiaryType = NEW_BENEFICIARY_TYPES.NEW;
		// }

		// if (this.policy.beneficiaries.length > 0) {
		// 	for (const bene of this.policy.beneficiaries) {
		// 		if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && bene.metaData.monthlyBenefitAdded === true) {
		// 			this.newChild.monthlyPayoutBenefitAmount = 0;
		// 			this.newChild.metaData.monthlyBenefitAdded = true;
		// 			this.pocketBeneficiaries.push(bene);
		// 		}
		// 		if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && bene.metaData.onceOffBenefitAdded === true) {
		// 			this.newChild.onceOffPayoutBenefitAmount = 0;
		// 			this.newChild.metaData.onceOffBenefitAdded = true;
		// 			this.pocketBeneficiaries.push(bene);
		// 		}
		// 	}
		// } else {
		// 	if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
		// 		this.newChild.monthlyPayoutBenefitAmount = 0;
		// 		this.newChild.metaData.monthlyBenefitAdded = true;
		// 		this.pocketBeneficiaries.push(bene);
		// 	}
		// 	if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
		// 		this.newChild.onceOffPayoutBenefitAmount = 0;
		// 		this.newChild.metaData.onceOffBenefitAdded = true;
		// 		this.pocketBeneficiaries.push(bene);
		// 	}
		// }
		// this._calculateCoverBreakdown();
	}


	/**
	 * Check if any other beneficiaries are available for quick add
	 * @returns {Array} array of beneficiaries
	 */
	_determineQuickAddBeneficiaries() {
		const eligible = [];
		if (this.selectedPocket === LIFE_POCKET_TYPES.MONTHLY) {
			for (const bene of this.policy.beneficiaries) {
				if (bene.metaData.monthlyBenefitAdded === false && bene.metaData.onceOffBenefitAdded) {
					eligible.push(bene);
				}
			}
		}
		if (this.selectedPocket === LIFE_POCKET_TYPES.ONCEOFF) {
			for (const bene of this.policy.beneficiaries) {
				if (bene.metaData.onceOffBenefitAdded === false && bene.metaData.monthlyBenefitAdded) {
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
		if (this.newChild !== null) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				totalAllocated += this.newChild.monthlyPayoutBenefitAmount === `` ? 0 : parseFloat(this.newChild.monthlyPayoutBenefitAmount);
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				totalAllocated += this.newChild.onceOffPayoutBenefitAmount === `` ? 0 : parseFloat(this.newChild.onceOffPayoutBenefitAmount);
			}
		}
		this.pocketRemainingCover = this.totalPocketCover - totalAllocated;
	}

	/**
	 * What steps are available for this add flow
	 * @returns {Array} array of steps
	 */
	_determineSteps() {
		let steps = [{ title: `Child Details` }, { title: `Guardian Details` }, { title: `Allocate cover` }];
		// if (this.eligibleBeneficiariesForQuickAdd.length > 0) {
		// 	steps = [{ title: `New or existing` }, { title: `Personal details` }, { title: `Allocate cover` }];
		// } else {
		// 	steps = [{ title: `Personal details` }, { title: `Allocate cover` }];
		// }
		return steps;
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
		} else if (this.currentStep === STEPS.GUARDIAN_DETAILS) {
			isValid = this._guardianValidations();
			console.log(`Guardian validations is: ${isValid}`);
		}

		if (isValid) {
			this.currentStep++;
			return;
		}

		return;

		// if (this.currentStep === STEPS.BENEFICIARY_DETAILS) {
		// 	if (isNullorEmpty(this.newChild?.firstName)) {
		// 		this.newChildErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
		// 		errors = true;
		// 	}
		// 	if (isNullorEmpty(this.newChild?.lastName)) {
		// 		this.newChildErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
		// 		errors = true;
		// 	}
		// 	if (isNullorEmpty(this.newChild?.dateOfBirth)) {
		// 		this.newChildErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
		// 		errors = true;
		// 	}
		// 	if (getAgeFromDob(this.newChild?.dateOfBirth) > 18) {
		// 		this.newChildErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
		// 		errors = true;
		// 	}

		// 	if (errors === true) {
		// 		this.requestUpdate();
		// 		return;
		// 	}

		// 	this.newChildErrors.firstName = ``;
		// 	this.newChildErrors.lastName = ``;
		// 	this.newChildErrors.dateOfBirth = ``;
		// 	if (this.isChild) {
		// 		this.currentStep = STEPS.GUARDIAN_DETAILS;
		// 	} else {
		// 		this.currentStep = STEPS.MONEY_ALLOCATION;
		// 	}

		// 	this.newPocketBeneficiaries.push(this.newChild);

		// } else {
		// 	this.currentStep = STEPS.MONEY_ALLOCATION;
		// }

		this.requestUpdate();
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
		} else {
			this.newChildErrors.title = ``;
		}

		if (isNullorEmpty(this.newChild?.gender)) {
			this.newChildErrors.gender = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newChildErrors.gender = ``;
		}

		if (isNullorEmpty(this.newChild?.firstName)) {
			this.newChildErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.newChildErrors.firstName = ``;
		}

		if (isNullorEmpty(this.newChild?.lastName)) {
			this.newChildErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
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
		} else {
			this.newChildErrors.dateOfBirth = ``;
		}


		if (!isNullorEmpty(this.newChild.idNumber)) {
			if (this.newChild.idNumber.length !== 13) {
				this.newBeneficiaryErrors.idNumber = VALIDATION_ERRORS.INVALID_ID;
				stepValid = false;
			} else {
				this.newBeneficiaryErrors.idNumber = ``;
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
		// 		this.newPocketBeneficiaries.splice(this.newPocketBeneficiaries.length - 1, 1);
		// 		this.currentStep = STEPS.BENEFICIARY_DETAILS;
		// 	}

		// } else {
		// 	this.newPocketBeneficiaries.splice(this.newPocketBeneficiaries.length - 1, 1);
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
	 * Event fired when a beneficiary TITLE value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_titleChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newChild.title = e.detail.new.code;
			if (this.newChild.title === `Mr` || this.newChild.title === `Sir`) {
				this.newChild.gender = `Male`;
				this.newChildErrors.gender = ``;
			} else if (this.newBeneficiary.title === `Mrs` || this.newChild.title === `Ms` || this.newChild.title === `Miss` || this.newChild.title === `Lady`) {
				this.newChild.gender = `Female`;
				this.newChildErrors.gender = ``;
			}
		}
		if (!isNullorEmpty(this.newChild.title)) {
			this.newChildErrors.title = ``;
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
			this.newChild.gender = e.detail.new.code;
		}
		if (!isNullorEmpty(this.newChild.gender)) {
			this.newChildErrors.gender = ``;
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
				// guardian deets
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
				// guardian deets
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
					this.newChildErrors.idNumber = ``;
					this.requestUpdate();
				}
			} else {
				// guardian deets 
			}
		}
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
				// guardian deets
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
				// find out about this, no cell field for bene
			} else {
				// guardian deets
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
				// find out about this, no email field for bene
			} else {
				// guardian deets
			}
		}
	}

	_allocatedAmountChange(e, index) {

		if (e.detail.old !== e.detail.new) {
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.EDUCATION) {
				this.newPocketBeneficiaries[index].educationBenefitAmount = e.detail.new;
			}
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.MONTHLY) {
				this.newPocketBeneficiaries[index].monthlyPayoutBenefitAmount = e.detail.new;
			}
			if (this.selectedPocket?.pocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				this.newPocketBeneficiaries[index].onceOffPayoutBenefitAmount = e.detail.new;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired to equally split the coverage amount between beneficiaries in the pocket
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_splitAmount(e) {
		if (e.detail.checked === true) {
			// coming soon to an add beneficiary dialog near you
		}
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

		if (this.newPocketBeneficiaries.length > 0) {
			this.newPocketBeneficiaries.forEach(bene => {
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

			${this.eligibleBeneficiariesForQuickAdd > 0 ? html`
			
			` : html`
			
			`}

			<div style="${this.currentStep === STEPS.NEW_OR_EXISTING_BENEFICIARY ? `display: block` : `display: none`}">
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
		// return html`
		// 	${this.newOrExistingErrorMessage !== ``
		// 		? html`
		// 		<div style="padding: 20px 16px 0px 16px;">
		// 			<horizon-alert-banner
		// 				type="error"
		// 				header="Step incomplete"
		// 				label="${this.newOrExistingErrorMessage}"
		// 				layout="vertical">
		// 			</horizon-alert-banner>
		// 		</div>`
		// 		: html``
		// 	}

		// 	<capitec-content-box style="min-height:200px; padding-left: 15px;">

		// 		<horizon-product-tile
		// 			type="radio-button"
		// 			label="Add New Person"
		// 			subtitle="Not in any pocket"
		// 			?selected="${this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.NEW}"
		// 			@click="${() => this._continueWithNewBeneficiary()}">
		// 		</horizon-product-tile>

		// 		<div style="text-align: center;">
		// 			<capitec-label 
		// 				label="Or choose existing"
		// 				type="strong">
		// 			</capitec-label>
		// 		</div>

		// 		${this.eligibleBeneficiariesForQuickAdd.map((bene) => html`
		// 			<horizon-product-tile
		// 				type="radio-button"
		// 				label="${`${bene.firstName} ${bene.lastName}`}"
		// 				subtitle="${bene.relationship}"
		// 				?selected="${this.newBeneficiaryType === NEW_BENEFICIARY_TYPES.EXISTING}"
		// 				@click="${() => this._continueWithExistingBeneficiary(bene)}">
		// 			</horizon-product-tile>
		// 		`)}
		// 	</capitec-content-box>
		// `;
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
						.label="${this.beneficiaryDetailsErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}
			<div class="grouping">
				<capitec-select label="Title" display-field="text" id-field="code" style="width: 50%" value="${this.newChild?.title}" 
					value="${this.newChild?.title}"
					error="${this.newChildErrors?.title === undefined ? `` : this.newChildErrors.title}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._titleChange(e, true)}">
				</capitec-select>

				<capitec-select label="Gender"  display-field="text" id-field="code"  style="width: 50%" 
					value="${this.newChild?.gender}" 
					error="${this.newChildErrors?.gender === undefined ? `` : this.newChildErrors.gender}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._genderChange(e, true)}">
				</capitec-select>
			</div>
			
			<div class="grouping" >
				<capitec-text-field label="First Name" style="width: 50%" 
					error="${this.newChildErrors?.firstName === undefined ? `` : this.newChildErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e, true)}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" 
					error="${this.newChildErrors?.lastName === undefined ? `` : this.newChildErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e, true)}">
				</capitec-text-field>
			</div>

			<div class="grouping" >
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					@value-changed="${(e) => this._idChange(e, true)}">
				</capitec-text-field>
			
				<capitec-date-time-picker style="width: 50%;" label="Date of Birth" type="single" mode="date" inputType="calendar"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					error="${this.newChildErrors?.dateOfBirth === undefined ? `` : this.newChildErrors.dateOfBirth}"
					@value-changed="${(e) => this._dobChange(e, true)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping" >
				<capitec-text-field label="Cellphone number (optional)" style="width: 50%" maxlength="10" type="numeric"
					@value-changed="${(e) => this._cellphoneNumChange(e, true)}">
				</capitec-text-field>
			
				<capitec-text-field label="Email address (optional)" style="width: 50%"
					@value-changed="${(e) => this._emailChange(e, true)}" >
				</capitec-text-field>
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
		<div class="grouping" >
				<capitec-text-field label="First Name" style="width: 50%" 
					@value-changed="${(e) => this._firstNameChange(e, false)}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" 
					@value-changed="${(e) => this._surnameChange(e, false)}">
				</capitec-text-field>
			</div>

			<div class="grouping" >
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					@value-changed="${(e) => this._idChange(e, false)}">
				</capitec-text-field>
			
				<capitec-date-time-picker style="width: 50%" label="Date of Birth" type="single" mode="date" inputType="calendar"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					@value-changed="${(e) => this._dobChange(e, false)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping" >
				<capitec-text-field label="Cellphone number" style="width: 50%" maxlength="10" type="numeric"
					@value-changed="${(e) => this._cellNumberChange(e, false)}">
				</capitec-text-field>

				<capitec-text-field label="Email address (optional)" style="width: 50%"
					@value-changed="${(e) => this._emailChange(e, false)}">
				</capitec-text-field>
				
			</div>
		`;
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

			<div class="beneficiary-card"> 
				<div style="display: flex; gap:20px;">
					<capitec-toggle label="Split the amount" @value-changed="${(e) => this._splitAmount()}"></capitec-toggle>
				</div>
			</div>

			${this.newPocketBeneficiaries?.map((beneficiary, index) => html`
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