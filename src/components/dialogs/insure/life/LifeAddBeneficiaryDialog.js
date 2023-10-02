import { Component, css, html } from 'platform/elements';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { formatCurrency } from 'app/productControls/utilities/Currency';
import { getAgeFromDob } from 'app/utils/insureUtils';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

const STEPS = {
	BENEFICIARY_DETAILS: 1,
	GUARDIAN_DETAILS: 2,
	MONEY_ALLOCATION: 3
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

		this.actioningChild = true;

		this.currentStep = STEPS.BENEFICIARY_DETAILS;
		this.pocketBeneficiaries = {};
		this.newBeneficiary = {};
		this.newBeneficiaryErrors = {};
		this.guardianDetails = {};
		this.selectedPocket = {};

	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {

			currentStep: { type: Number, state: true },
			newBeneficiary: { type: Object, state: true },
			guardianDetails: { type: Object, state: true },
			selectedPocket: { type: Object, state: true }
			
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
		this.newBeneficiary = {
				"firstName": ``,
				"lastName": ``,
				"rolePlayer": ``,
				"onceOffPayoutBenefitAmount": 0,
				"educationBenefitAmount": 0,
				"monthlyPayoutBenefitAmount": 0,
				"bankDetails": {
					"accountName": ``,
					"branchCode": ``,
					"accountNumber": ``,
					"bank": ``,
					"accountType": ``,
					"collectionDay": 0
				},
				"relationship": ``,
				"gender": ``,
				"dateOfBirth": ``
		};

		console.log(`this.newBeneficiary :>> `, this.newBeneficiary);
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
		let errors = false;
		if (this.currentStep === STEPS.BENEFICIARY_DETAILS) {
			if (isNullorEmpty(this.newBeneficiary.firstName)) {
				this.newBeneficiaryErrors.firstName = `Required Field`;
				this.requestUpdate();
				errors = true;
			}
			if (isNullorEmpty(this.newBeneficiary.lastName)) {
				this.newBeneficiaryErrors.lastName = `Required Field`;
				this.requestUpdate();
				errors = true;
			}
			if (isNullorEmpty(this.newBeneficiary.dateOfBirth)) {
				this.newBeneficiaryErrors.dateOfBirth = `Required Field`;
				this.requestUpdate();
				errors = true;
			}
			if (getAgeFromDob(this.newBeneficiary.dateOfBirth) > 18) {
				console.log(`getAgeFromDob(this.newBeneficiary.dateOfBirth) :>> `, getAgeFromDob(this.newBeneficiary.dateOfBirth));
				this.newBeneficiaryErrors.dateOfBirth = `Beneficiary must be under 18`;
				errors = true;
			}

			if (errors === true) {
				return;
			}

			this.newBeneficiaryErrors.firstName = ``;
			this.newBeneficiaryErrors.lastName = ``;
			this.newBeneficiaryErrors.dateOfBirth = ``;
			
			this.currentStep = STEPS.GUARDIAN_DETAILS;
		} else {
			this.currentStep = STEPS.MONEY_ALLOCATION;
		}
			
	}

	/**
	 * back event from dialog footer button, moves to previous step
	 * @returns {void}
	 * 
	 */
	_backClick() {
		if (this.currentStep === STEPS.MONEY_ALLOCATION) {
			this.currentStep = STEPS.GUARDIAN_DETAILS;
		} else {
			this.currentStep = STEPS.BENEFICIARY_DETAILS;
		}
	}

	/**
	 * Add event from dialog footer button, does validations on fields and adds new beneficiary
	 * @returns {void}
	 */
	_addClick() {
		// do another round of validations before adding
	}

	/**
	 * Event fired when a beneficiary FIRST NAME value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.firstName = e.detail.new;
			if (isNullorEmpty(this.newBeneficiary.firstName)) {
				this.newBeneficiaryErrors.firstName = `Required Field`;
			} else {
				this.newBeneficiaryErrors.firstName = ``;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary SURNAME value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneSurnameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.lastName = e.detail.new;
			if (isNullorEmpty(this.newBeneficiary.lastName)) {
				this.newBeneficiaryErrors.lastName = `Required Field`;
			} else {
				this.newBeneficiaryErrors.lastName = ``;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary ID value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneIDChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, no id field for bene
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneDobChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.dateOfBirth = e.detail.new.date;
			const wrongTimeZone = this.newBeneficiary.dateOfBirth.includes(`+02:00`);
			if (wrongTimeZone === true) {
				let dob = this.newBeneficiary.dateOfBirth;
				const timezone = `+02:00`;
				dob = dob.replace(timezone, ``);
				this.newBeneficiary.dateOfBirth = dob;
			}
			
			if (isNullorEmpty(this.newBeneficiary.dateOfBirth)) {
				this.newBeneficiaryErrors.dateOfBirth = `Required Field`;
			} else {
				this.newBeneficiaryErrors.dateOfBirth = ``;
			}
			if (getAgeFromDob(this.newBeneficiary.dateOfBirth) > 18) {
				console.log(`getAgeFromDob(this.newBeneficiary.dateOfBirth) :>> `, getAgeFromDob(this.newBeneficiary.dateOfBirth));
				this.newBeneficiaryErrors.dateOfBirth = `Beneficiary must be under 18`;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary CELL NUMBER value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneCellphoneNumChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, no cell field for bene
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary EMAIL value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_beneEmailChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, no email field for bene
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian FIRST NAME value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian SURNAME value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianSurnameChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian ID value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianIdChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian DoB value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianDobChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian CELL NUMBER value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianCellNumberChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a guardian EMAIL value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_guardianEmailChange(e) {
		if (e.detail.old !== e.detail.new) {
			// find out about this, where does guardian go?
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
		if (this.selectedPocket.pocketType = LIFE_POCKET_TYPES.EDUCATION) {
			return beneficiary.educationBenefitAmount;
		}
		if (this.selectedPocket.pocketType = LIFE_POCKET_TYPES.MONTHLY) {
			return beneficiary.monthlyPayoutBenefitAmount;
		}
		if (this.selectedPocket.pocketType = LIFE_POCKET_TYPES.ONCEOFF) {
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

		return formatCurrency(remainingBalance);
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
			<capitec-modal type="alert" header="Add Beneficiary" style="--theme-modal-header-color: black; --theme-modal-form-m-l-xl-width: auto; z-index: 4000;">
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
				.steps="${[{ title: `Child details(under 18)` }, { title: `Guardian details` }, { title: `Money Allocation` }]}"
				active-step-number="${this.currentStep}">
			</capitec-stepper>

			<div style="${this.currentStep === STEPS.BENEFICIARY_DETAILS ? `display: block` : `display: none`}">
				${this._renderBeneDetails()}
			</div>
			<div style="${this.currentStep === STEPS.GUARDIAN_DETAILS ? `display: block` : `display: none`}">
				${this._renderGuardianDetails()}
			</div>
			<div style="${this.currentStep === STEPS.MONEY_ALLOCATION ? `display: block` : `display: none`}">
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
			<!-- <div class="grouping" >
				<capitec-select label="Choose Relationship" display-field="text" id-field="code" style="width: 100%" >
				</capitec-select>
			</div> -->
		
			<div class="grouping" >
				<capitec-text-field label="First Name" style="width: 50%" 
					error="${this.newBeneficiaryErrors?.firstName === undefined ? `` : this.newBeneficiaryErrors.firstName}"
					@value-changed="${(e) => this._beneNameChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" 
					error="${this.newBeneficiaryErrors?.lastName === undefined ? `` : this.newBeneficiaryErrors.lastName}"
					@value-changed="${(e) => this._beneSurnameChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping" >
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					@value-changed="${(e) => this._beneIDChange(e)}">
				</capitec-text-field>
			
				<capitec-date-time-picker style="width: 50%" label="Date of Birth" type="single" mode="date" inputType="calendar"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					error="${this.newBeneficiaryErrors?.dateOfBirth === undefined ? `` : this.newBeneficiaryErrors.dateOfBirth}"
					@value-changed="${(e) => this._beneDobChange(e)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping" >
				<capitec-text-field label="Cellphone number (optional)" style="width: 50%" maxlength="10" type="numeric"
					@value-changed="${(e) => this._beneCellphoneNumChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field label="Email address (optional)" style="width: 50%"
					@value-changed="${(e) => this._beneEmailChange(e)}" >
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
					@value-changed="${(e) => this._guardianNameChange(e)}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" 
					@value-changed="${(e) => this._guardianSurnameChange(e)}">
				</capitec-text-field>
			</div>

			<div class="grouping" >
				<capitec-text-field label="ID Number" style="width: 50%" maxlength="13" type="numeric"
					@value-changed="${(e) => this._guardianIdChange(e)}">
				</capitec-text-field>
			
				<capitec-date-time-picker style="width: 50%" label="Date of Birth" type="single" mode="date" inputType="calendar"
					outputType="string" maxdate="${this.today}" minDate="1901-01-01"
					@value-changed="${(e) => this._guardianDobChange(e)}">
				</capitec-date-time-picker>
			</div>

			<div class="grouping" >
				<capitec-text-field label="Cellphone number" style="width: 50%" maxlength="10" type="numeric"
					@value-changed="${(e) => this._guardianCellNumberChange(e)}">
				</capitec-text-field>

				<capitec-text-field label="Email address (optional)" style="width: 50%"
					@value-changed="${(e) => this._guardianEmailChange(e)}">
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
					<capitec-icon icon="/insure_education_pocket" size="large"></capitec-icon>
					<capitec-label label="Education Fund" type="subtitle" class="education-label"></capitec-label>
				</div>

				<div style="display: flex; gap: 40px;">
					<horizon-label
						label="Allocated amount"
						value="${formatCurrency(this.selectedPocket.coverage)}">
					</horizon-label>

					<horizon-label
						label="Remaining balance"
						value="${this._calculateRemainingBalance()}">
					</horizon-label>
				</div>
			</div>

			<div class="beneficiary-card"> <!-- TODO:class name needs change-->
				<div style="display: flex; gap:20px;">
					<capitec-toggle label="Split the amount" @value-changed="${(e) => this._splitAmount()}"></capitec-toggle>
				</div>
			</div>

			${this.pocketBeneficiaries?.map((beneficiary, index) => html`
				<div class="beneficiary-card">
					<div style="display: flex; gap:20px;">
						<capitec-avatar value="${beneficiary.firstName.charAt(0) + beneficiary.lastName.charAt(0)}" size="large" color="#AAAAAA"></capitec-avatar>
						<horizon-label
							label="${beneficiary.relationship}"
							value="${beneficiary.firstName} ${beneficiary.lastName}">
						</horizon-label>
					</div>
					<div style="display: flex; gap: 20px;">
						<capitec-text-field type="currency" value="${this._getBenePocketAllocation(beneficiary)}">
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
				${this.currentStep === STEPS.BENEFICIARY_DETAILS ? html`
					<capitec-button class="capitec-button-small" slot="footer" type="secondary" label="Cancel" @click="${() => this._cancelClick()}">
					</capitec-button>
				` 
				: html`
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