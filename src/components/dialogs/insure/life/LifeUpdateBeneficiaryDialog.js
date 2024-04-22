import { Component, css, html } from 'platform/elements';
import { LIFE_BENEFICIARY_RELATIONSHIP_TYPES, LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { formatCurrencyInsureCoverAmount, getAgeFromDob, pocketBadgeColorClass, pocketBadgeIcon, pocketBadgeLabel } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be over 18`,
	ALLOCATION_OVER: `Beneficiary allocation exceeds pocket cover`,
	ALLOCATION_UNDER: `Beneficiary allocation is less than pocket cover`,
	BENEFICIARY_MINIMUM: `Minimum R1 000 per beneficiary`
};

/**
 * @export
 * @class LifeUpdateBeneficiaryDialog
 * @extends {Component}
 */
class LifeUpdateBeneficiaryDialog extends Component {

	// #region INITIALIZE

	constructor() {
		super();

		this.currentStep = 1;
		this.selectedPocketType = ``;
		this.policy = {};

		this.updatingBeneficiary = {};
		this.originalBeneficiary = {};
		this.beneficiaryErrors = {};
		this.pocketBeneficiaries = [];

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
			totalPocketCover: { type: Number, state: true },
			updatingBeneficiary: { type: Object, state: true },
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
		this.originalBeneficiary = JSON.parse(JSON.stringify(this.updatingBeneficiary));
		for (const bene of this.policy.beneficiaries) {
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY && bene.metaData.monthlyBenefitAdded === true) {
				this.pocketBeneficiaries.push(bene);
			}

			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF && bene.metaData.onceOffBenefitAdded === true) {
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
			if (bene.metaData.monthlyBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				totalAllocated += bene.monthlyPayoutBenefitAmount === `` ? 0 : parseFloat(bene.monthlyPayoutBenefitAmount);
			}
			if (bene.metaData.onceOffBenefitAdded && this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				totalAllocated += bene.onceOffPayoutBenefitAmount === `` ? 0 : parseFloat(bene.onceOffPayoutBenefitAmount);
			}
		}
		this.pocketRemainingCover = this.totalPocketCover - totalAllocated;
	}

	/**
	 * Event fired when a beneficiary FIRST NAME value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_firstNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatingBeneficiary.firstName = e.detail.new;
			this._validateBeneficiaryDetails();
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
			this.updatingBeneficiary.lastName = e.detail.new;
			this._validateBeneficiaryDetails();
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
			this.updatingBeneficiary.relationship = e.detail.new.code;
		}
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * @param {event} e e
	 * @returns {void}
	 */
	_dobChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.updatingBeneficiary.dateOfBirth = e.detail.new.date;
			const wrongTimeZone = this.newBeneficiary.dateOfBirth.includes(`+02:00`);
			if (wrongTimeZone === true) {
				let dob = this.updatingBeneficiary.dateOfBirth;
				const timezone = `+02:00`;
				dob = dob.replace(timezone, ``);
				this.updatingBeneficiary.dateOfBirth = dob;
			} else {
				this.updatingBeneficiary.dateOfBirth = e.detail.new.date;
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
			this.updatingBeneficiary.contactNumber = e.detail.new;
			this._validateBeneficiaryDetails();
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
			this.updatingBeneficiary.idNumber = e.detail.new;
			this._validateBeneficiaryDetails();
		}
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
			const value = e.detail.new;
			if (this.selectedPocketType === LIFE_POCKET_TYPES.MONTHLY) {
				bene.monthlyPayoutBenefitAmount = value;
			}
			if (this.selectedPocketType === LIFE_POCKET_TYPES.ONCEOFF) {
				bene.onceOffPayoutBenefitAmount = value;
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

		if (isNullorEmpty(this.updatingBeneficiary?.firstName)) {
			this.beneficiaryErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.beneficiaryErrors.firstName = ``;
		}

		if (isNullorEmpty(this.updatingBeneficiary?.lastName)) {
			this.beneficiaryErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.beneficiaryErrors.lastName = ``;
		}

		if (isNullorEmpty(this.updatingBeneficiary?.contactNumber)) {
			this.beneficiaryErrors.contactNumber = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else {
			this.beneficiaryErrors.contactNumber = ``;
		}

		if (this.updatingBeneficiary.dateOfBirth === undefined || this.updatingBeneficiary.dateOfBirth === ``) {
			this.beneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			stepValid = false;
		} else if (getAgeFromDob(this.updatingBeneficiary?.dateOfBirth) < 18) {
			this.beneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
			stepValid = false;
		} else {
			this.beneficiaryErrors.dateOfBirth = ``;
		}

		if (stepValid === false) {
			this.beneficiaryDetailsErrorMessage = `Some fields contain invalid values`;
		} else {
			this.beneficiaryDetailsErrorMessage = ``;
		}

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
			this.newBeneficiaryErrors = {};
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
	}

	/**
	 * cancel event from dialog footer button, closes modal & reset toggles 
	 * @returns {void} 
	 */
	_cancelClick() {
		this.updatingBeneficiary = this.originalBeneficiary;
		this.dispatchEvent(new CustomEvent(`close-dialog`, { detail: { beneficiary: this.updatingBeneficiary } }));
	}

	/**
	 * Update event from dialog footer button, closes modal, emits updated beneficiary details
	 * @returns {void} 
	 */
	_updateClick() {
		const allocationValid = this._validateAllocateCover();
		if (allocationValid === true) {
			this.dispatchEvent(new CustomEvent(`update-beneficiary`, {
				detail: {
					beneficiary: this.updatingBeneficiary
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
				.steps="${[{ title: `Personal details` }, { title: `Allocate cover` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			<div style="${this.currentStep === 1 ? `display: block` : `display: none`}">
				${this._renderBeneDetails()}
			</div>

			<div style="${this.currentStep === 2 ? `display: block` : `display: none`}">
				${this._renderMoneyAllocation()}
			</div>
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
				<capitec-text-field 
					label="First Name" 
					style="width: 50%"
					value="${this.updatingBeneficiary?.firstName}"
					error="${this.beneficiaryErrors?.firstName === undefined ? `` : this.beneficiaryErrors.firstName}"
					@value-changed="${(e) => this._firstNameChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Surname" 
					style="width: 50%"
					value="${this.updatingBeneficiary?.lastName}"
					error="${this.beneficiaryErrors?.lastName === undefined ? `` : this.beneficiaryErrors.lastName}"
					@value-changed="${(e) => this._surnameChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-select label="Relationship" .items="${this.beneficiaryRelationships}" display-field="text" id-field="code"
					style="width: 50%" value="${this.updatingBeneficiary?.relationship}" 
					@value-changed = "${(e) => this._relationshipChange(e)}">
				</capitec-select>

				<capitec-text-field 
					label="Cellphone number" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					value="${this.updatingBeneficiary?.contactNumber}"
					error="${this.beneficiaryErrors?.contactNumber === undefined ? `` : this.beneficiaryErrors.contactNumber}"
					@value-changed="${(e) => this._cellphoneNumChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping">
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					@value-changed="${(e) => this._idChange(e, true)}">
				</capitec-text-field>

				<capitec-date-time-picker 
					style="width: 50%;" 
					label="Date of Birth" 
					type="single" 
					mode="date" 
					inputType="calendar"
					date="${this.updatingBeneficiary?.dateOfBirth}"
					value="${formatDate(this.updatingBeneficiary?.dateOfBirth)}"
					outputType="string" 
					maxdate="${this.today}" 
					minDate="1901-01-01"
					error="${this.beneficiaryErrors?.dateOfBirth}"
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
			${this.currentStep === 1
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

window.customElements.define(`horizon-insure-life-update-beneficiary-dialog`, LifeUpdateBeneficiaryDialog);

/**
 * Send close dialog event to consuming component when 'Cancel' is clicked
 *
 * @example
 * <horizon-insure-life-update-beneficiary-dialog ... @close-dialog="${this._handler}"></horizon-insure-life-update-beneficiary-dialog>
 *
 * @event LifeUpdateBeneficiaryDialog#close-modal
 * @type {Object} - N/A
 */