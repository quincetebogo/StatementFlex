import { Component, css, html } from 'platform/elements';
import { GENDER_OPTIONS, LIFE_BENEFICIARY_RELATIONSHIP_TYPES, LIFE_CHILD_RELATIONSHIP_TYPES, LIFE_POCKET_TYPES, TITLE_OPTIONS } from 'app/constants/InsureCommon';
import { formatCurrencyInsureCoverAmount, getAgeFromDob, getDobFromIDNumber, pocketBadgeColorClass, pocketBadgeIcon, pocketBadgeLabel } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be over 18`,
	ALLOCATION_OVER: `Beneficiary allocation exceeds pocket cover`,
	ALLOCATION_UNDER: `Beneficiary allocation is less than pocket cover`,
	BENEFICIARY_MINIMUM: `Minimum R1 000 per beneficiary`,
	INVALID_ID: `ID Number is invalid`,
	INVALID_CELL_NUMBER: `Cellphone Number is invalid`,
	BENEFICIARY_MINIMUM: `Minimum R1 000 per beneficiary`
};

const STEPS = {
	CHILD_DETAILS: 1,
	NEW_OR_EXISTING_GUARDIAN: 2,
	GUARDIAN_DETAILS: 3,
	MONEY_ALLOCATION: 4
};

/**
 * @export
 * @class LifeUpdateChildDialog
 * @extends {Component}
 */
class LifeUpdateChildDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = 1;
		this.selectedPocketType = ``;
		this.policy = {};

		this.updatingChild = {};
		this.originalChild = {};
		this.childErrors = {};
		this.pocketBeneficiaries = [];

		this.beneficiaryDetailsErrorMessage = ``;
		this.allocateMoneyErrorMessage = ``;

		this.totalPocketCover = 0;
		this.pocketRemainingCover = 0;

		this.beneficiaryRelationships = LIFE_BENEFICIARY_RELATIONSHIP_TYPES;
		this.childBeneficiaryRelationships = LIFE_CHILD_RELATIONSHIP_TYPES;
		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			currentStep: { type: Number, state: true },
			totalPocketCover: { type: Number, state: true },
			eligibleGuardiansForQuickAdd: { type: Array, state: true },
			updatingChild: { type: Object, state: true },
			updatingGuardian: { type: Object, state: true },
			pocketRemainingCover: { type: Number, state: true },
			policy: { type: Object, state: true },
			selectedPocketType: { type: String, state: true },
			allocateMoneyErrorMessage: { type: String, state: true }
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

		// Find guardian of current editing child / remove from quick add
		this.updatingGuardian = this.eligibleGuardiansForQuickAdd.find(guardian => guardian.id === this.updatingChild.guardianId);
		if (this.updatingGuardian) {
			const index = this.eligibleGuardiansForQuickAdd.indexOf(this.updatingGuardian);
			this.eligibleGuardiansForQuickAdd.splice(index, 1);
		}

		this.originalChild = JSON.parse(JSON.stringify(this.updatingChild));

		console.log(`this.originalChild`);
		console.log(this.originalChild);
		for (const bene of this.policy.beneficiaries) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && bene.metaData.educationBenefitAdded === true) {
				this.pocketBeneficiaries.push(bene);
			}
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
			if (bene.metaData.educationBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
				totalAllocated += bene.educationBenefitAmount === `` ? 0 : parseFloat(bene.educationBenefitAmount);
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
		return steps;
	}

	/**
	 * Event fired when a beneficiary TITLE value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_titleChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatingChild.title = e.detail.new.code;
			if (this.updatingChild.title === `Mr` || this.updatingChild.title === `Sir`) {
				this.updatingChild.gender = `Male`;
				this.childErrors.gender = ``;
			} else if (this.updatingChild.title === `Mrs` || this.updatingChild.title === `Ms` || this.updatingChild.title === `Miss` || this.updatingChild.title === `Lady`) {
				this.updatingChild.gender = `Female`;
				this.childErrors.gender = ``;
			}
		}
		if (!isNullorEmpty(this.updatingChild.title)) {
			this.childErrors.title = ``;
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
			this.updatingChild.gender = e.detail.new.code;
		}
		if (!isNullorEmpty(this.updatingChild.gender)) {
			this.childErrors.gender = ``;
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
			this.updatingChild.firstName = e.detail.new;
			if (!isNullorEmpty(this.updatingChild.firstName)) {
				this.childErrors.firstName = ``;
			}
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
			this.updatingChild.lastName = e.detail.new;
			if (!isNullorEmpty(this.updatingChild.lastName)) {
				this.childErrors.lastName = ``;
			}
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
			this.updatingChild.relationship = e.detail.new.code;
		}
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_dobChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatingChild.dateOfBirth = e.detail.new.date;
			const wrongTimeZone = this.updatingChild.dateOfBirth.includes(`+02:00`);
			if (wrongTimeZone === true) {
				let dob = this.updatingChild.dateOfBirth;
				const timezone = `+02:00`;
				dob = dob.replace(timezone, ``);
				this.updatingChild.dateOfBirth = dob;
			} else {
				this.updatingChild.dateOfBirth = e.detail.new.date;
			}

			this._validateBeneficiaryDetails();
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
			this.updatingChild.contactNumber = e.detail.new;
			if (this.updatingChild.contactNumber.length === 10) {
				this.childErrors.contactNumber = ``;
			}
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
			this.updatingChild.idNumber = e.detail.new;
		}

		if (this.updatingChild.idNumber.length === 13) {
			this.updatingChild.dateOfBirth = getDobFromIDNumber(this.updatingChild.idNumber);
			this.childErrors.idNumber = ``;
		}
		this.requestUpdate();
	}

	// #endregion PRIVATE METHODS

	// #region EVENT HANDLERS

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
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION && (bene.educationBenefitAmount !== 0 && bene.educationBenefitAmount < 1000)) {
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
		if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
			return bene.educationBenefitAmount;
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
			const value = e.detail.new;
			if (this.selectedPocketType === LIFE_POCKET_TYPES.EDUCATION) {
				bene.educationBenefitAmount = value;
			}
			this._calculateCoverBreakdown();
		}
		this.requestUpdate();
	}

	/**
	 * Validate all fields on the beneficiary details step
	 * @returns {boolean} true if all fields are valid
	 */
	_validateBeneficiaryDetails() {
		let stepValid = true;

		if (isNullorEmpty(this.updatingChild?.firstName)) {
			this.childErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.childErrors.firstName = ``;
		}

		if (isNullorEmpty(this.updatingChild?.lastName)) {
			this.childErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.childErrors.lastName = ``;
		}

		if (isNullorEmpty(this.updatingChild?.contactNumber)) {
			this.childErrors.contactNumber = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else if (this.updatingChild?.contactNumber.length !== 10) {
			this.childErrors.contactNumber = VALIDATION_ERRORS.INVALID_CELL_NUMBER;
			stepValid = false;
		} else {
			this.childErrors.contactNumber = ``;
		}

		if (this.updatingChild.dateOfBirth === undefined || this.updatingChild.dateOfBirth === ``) {
			this.childErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else if (getAgeFromDob(this.updatingChild?.dateOfBirth) < 18) {
			this.childErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
			stepValid = false;
		} else {
			this.childErrors.dateOfBirth = ``;
		}

		if (!isNullorEmpty(this.updatingChild?.idNumber)) {
			if (this.updatingChild?.idNumber.length !== 13) {
				this.childErrors.idNumber = VALIDATION_ERRORS.INVALID_ID;
				stepValid = false;
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
	 * Next event from dialog footer button, moves to next step and validates fields from the current step
	 * 
	 * @returns {void}
	 */
	_nextClick() {
		let stepValid = true;
		stepValid = this._validateBeneficiaryDetails();

		if (stepValid === true) {
			this.currentStep++;
			this.childErrors = {};
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
	}

	/**
	 * cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		console.log(`cancel click`);
		this.updatingChild = this.originalChild;
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { child: this.updatingChild } }));
	}

	/**
	 * Update event from dialog footer button, closes modal, emits updated beneficiary details
	 * @returns {void} 
	 */
	_updateClick() {
		const allocationValid = this._validateAllocateCover();
		if (allocationValid === true) {
			this.dispatchEvent(new CustomEvent(`update-child`, {
				detail: {
					child: this.updatingChild
				}
			}));
		}
	}

	/**
	 * Decrease current step and reset errors
	 * 
	 * @returns {void}
	 */
	_backClick() {
		this.currentStep--;
		this.beneficiaryDetailsErrorMessage = ``;
		this.allocateMoneyErrorMessage = ``;
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
			<capitec-modal type="form" header="Nominated person" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
				<div slot="body" style="width: 678px">
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

			<div style="${this.currentStep === STEPS.CHILD_DETAILS ? `display: block` : `display: none`}">
				${this._renderChildDetails()}
			</div>

			<div style="${this.currentStep === STEPS.NEW_OR_EXISTING_GUARDIAN ? `display: block` : `display: none`}">
				${this._renderNewOrExistingQuickAdd()}
			</div>

			<div style="${this.currentStep === STEPS.GUARDIAN_DETAILS ? `display: block` : `display: none`}">
				${this._renderGuardianDetails()}
			</div>

			<div style="${this.currentStep === STEPS.MONEY_ALLOCATION ? `display: block` : `display: none`}">
				${this._renderMoneyAllocation()}
			</div>
		`;
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
						.label="${this.beneficiaryDetailsErrorMessage}"
						layout="vertical">
					</horizon-alert-banner>
				</div>`
				: html``
			}
			
			<div class="grouping">
				<capitec-select label="Title" display-field="text" id-field="code" style="width: 50%" value="${this.updatingChild?.title}" 
					error="${this.updatingChild?.title === undefined ? `` : this.childErrors.title}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._titleChange(e)}">
				</capitec-select>

				<capitec-select label="Gender"  display-field="text" id-field="code"  style="width: 50%" 
					value="${this.updatingChild?.gender}" 
					error="${this.updatingChild?.gender === undefined ? `` : this.childErrors.gender}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._genderChange(e)}">
				</capitec-select>
			</div>

			<div class="grouping">
				<capitec-text-field 
					label="First Name" 
					style="width: 50%"
					value="${this.updatingChild?.firstName}"
					error="${this.childErrors?.firstName === undefined ? `` : this.childErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Surname" 
					style="width: 50%"
					value="${this.updatingChild?.lastName}"
					error="${this.childErrors?.lastName === undefined ? `` : this.childErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-select label="Relationship" .items="${this.childBeneficiaryRelationships}" display-field="text" id-field="code"
					style="width: 50%" value="${this.updatingChild?.relationship}" 
					@value-changed = "${(e) => this._relationshipChange(e)}">
				</capitec-select>

				<capitec-text-field 
					label="Cellphone number" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					value="${this.updatingChild?.contactNumber}"
					error="${this.childErrors?.contactNumber === undefined ? `` : this.childErrors.contactNumber}"
					@value-changed="${(e) => this._cellphoneNumChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					error="${this.childErrors?.idNumber === undefined ? `` : this.childErrors.idNumber}"
					@value-changed="${(e) => this._idChange(e, true)}">
				</capitec-text-field>

				<capitec-date-time-picker 
					style="width: 50%;" 
					label="Date of Birth" 
					type="single" 
					mode="date" 
					inputType="calendar"
					date="${this.updatingChild?.dateOfBirth}"
					value="${formatDate(this.updatingChild?.dateOfBirth)}"
					outputType="string" 
					maxdate="${this.today}" 
					minDate="1901-01-01"
					error="${this.childErrors?.dateOfBirth}"
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
						value="${formatCurrencyInsureCoverAmount(formatCurrency(this.pocketRemainingCover))}">
					</horizon-label>
				</div>
			</div>

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
								@value-changed="${(e) => this._beneficiaryCoverAmountChange(e, bene)}"
								error="${bene?.metaData?.coverErrorMsg}">
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
			${this.currentStep === STEPS.CHILD_DETAILS
				? html`
				<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
				</capitec-button>
				<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Next" @click="${() => this._nextClick()}" ></capitec-button>
				`
				: html`
				<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Back" @click="${() => this._backClick()}">
				</capitec-button>

				<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Update" @click="${() => this._updateClick()}"></capitec-button>
			`}
		`;
	}

	// #endregion RENDERING


}

window.customElements.define(`horizon-insure-life-update-child-dialog`, LifeUpdateChildDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-update-child-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-update-child-dialog>
 *
 * @event LifeUpdateChildDialog#close-modal
 * @type {Object} - N/A
 */