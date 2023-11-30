import { Component, css, html } from 'platform/elements';
import { formatCurrencyInsureCoverAmount, getAgeFromDob } from 'app/utils/insureUtils';
import { formatDate, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { LIFE_POCKET_TYPES } from 'app/constants/InsureCommon';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { formatCurrency } from 'app/productControls/utilities/Currency';

const VALIDATION_ERRORS = {
	REQUIRED_FIELD: `Required Field`,
	BENE_OVER_18: `Beneficiary must be over 18`
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
		this.selectedPocket = {};
		this.policy = {};
		this.addingNewBeneficiary = ``;

		this.newBeneficiary = {};
		this.newBeneficiaryErrors = {};

		this.newOrExistingErrorMessage = ``;
		this.beneficiaryDetailsErrorMessage = ``;
	}

	// #endregion INITIALIZE

	// #region PROPERTIES

	/**
	 */
	static get properties() {
		return {
			currentStep: { type: Number, state: true },
			policy: { type: Object, state: true },
			selectedPocket: { type: Object, state: true },
			eligibleBeneficiariesForQuickAdd: { type: Array, state: true },
			addingNewBeneficiary: { type: String, state: true },

			newOrExistingErrorMessage: { type: String, state: true },
			beneficiaryDetailsErrorMessage: { type: String, state: true },

			newBeneficiary: { type: Object, state: true },
			newBeneficiaryErrors: { type: Object, state: true }
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
		this.eligibleBeneficiariesForQuickAdd = this._determineQuickAddBeneficiaries();
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
	 * What steps are available for this add flow
	 * @returns {Array} array of steps
	 */
	_determineSteps() {
		let steps = [];
		if (this.eligibleBeneficiariesForQuickAdd.length > 0) {
			steps = [{ title: `New or existing` }, { title: `Beneficiary details` }, { title: `Allocate cover` }];
		} else {
			steps = [{ title: `Beneficiary details` }, { title: `Allocate cover` }];
		}
		return steps;
	}

	// #region New Or Existing

	_continueWithNewBeneficiary() {
		this.addingNewBeneficiary = `NEW`;
		this.newOrExistingErrorMessage = ``;

		this.newBeneficiary = {

		};
	}

	_continueWithExistingBeneficiary(beneficiary) {
		this.addingNewBeneficiary = `EXISTING`;
		this.newOrExistingErrorMessage = ``;

		this.newBeneficiary = beneficiary;
	}

	// #endregion New Or Existing

	// #region Beneficiary Details

	/**
	 * Event fired when a beneficiary FIRST NAME value changes
	 * 
	 * @param {event} e e
	 * @returns {void}
	 */
	_firstNameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.firstName = e.detail.new;
			if (isNullorEmpty(this.newBeneficiary.firstName)) {
				this.newBeneficiaryErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
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
	_surnameChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.lastName = e.detail.new;
			if (isNullorEmpty(this.newBeneficiary.lastName)) {
				this.newBeneficiaryErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
			} else {
				this.newBeneficiaryErrors.lastName = ``;
			}
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a beneficiary DoB value changes
	 * 
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
			}

			if (isNullorEmpty(this.newBeneficiary.dateOfBirth)) {
				this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
			} else {
				this.newBeneficiaryErrors.dateOfBirth = ``;
			}

			if (getAgeFromDob(this.newBeneficiary.dateOfBirth) < 18) {
				this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
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
	_cellphoneNumChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.newBeneficiary.lastName = e.detail.new;
		}
		this.requestUpdate();
	}

	// #endregion Beneficiary Details

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
		console.log(`Next Step: ${this.currentStep}`);
		let stepValid = true;
		if (this.eligibleBeneficiariesForQuickAdd.length > 0) {
			if (this.currentStep === 1) {
				if (this.addingNewBeneficiary === ``) {
					this.newOrExistingErrorMessage = `Please select an existing beneficiary or add a new one`;
					stepValid = false;
				}
			}

			if (this.currentStep === 2) {
				if (isNullorEmpty(this.newBeneficiary?.firstName)) {
					this.newBeneficiaryErrors.firstName = VALIDATION_ERRORS.REQUIRED_FIELD;
					stepValid = false;
				}
				if (isNullorEmpty(this.newBeneficiary?.lastName)) {
					this.newBeneficiaryErrors.lastName = VALIDATION_ERRORS.REQUIRED_FIELD;
					stepValid = false;
				}
				if (isNullorEmpty(this.newBeneficiary?.dateOfBirth)) {
					this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.REQUIRED_FIELD;
					stepValid = false;
				}
				if (getAgeFromDob(this.newBeneficiary?.dateOfBirth) < 18) {
					this.newBeneficiaryErrors.dateOfBirth = VALIDATION_ERRORS.BENE_OVER_18;
					stepValid = false;
				}

				if (stepValid === false) {
					this.beneficiaryDetailsErrorMessage = `Some fields contain invalid values`;
				}
			}
		}

		if (stepValid === true) {
			this.currentStep++;

			this.newBeneficiaryErrors = {};
			this.addingNewBeneficiary = ``;
			this.beneficiaryDetailsErrorMessage = ``;
		}
		this.requestUpdate();
	}

	/**
	 * back event from dialog footer button, moves to previous step
	 * @returns {void}
	 * 
	 */
	_backClick() {
		this.currentStep--;

		this.addingNewBeneficiary = ``;
		this.beneficiaryDetailsErrorMessage = ``;
	}

	/**
	 * Add event from dialog footer button, does validations on fields and adds new beneficiary
	 * @returns {void}
	 */
	_addClick() {
		this.dispatchEvent(new CustomEvent(`close-dialog`));
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
					label="Add New Beneficiary"
					subtitle="Not in any pocket"
					?selected="${this.addingNewBeneficiary === `NEW`}"
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
						?selected="${this.addingNewBeneficiary === `EXISTING`}"
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
					error="${this.newBeneficiaryErrors?.dateOfBirth === undefined ? `` : this.newBeneficiaryErrors.dateOfBirth}"
					@value-changed="${(e) => this._dobChange(e)}">
				</capitec-date-time-picker>

				<capitec-text-field 
					label="Cellphone number (optional)" 
					style="width: 50%" 
					maxlength="10" 
					type="numeric"
					value="${this.newBeneficiary?.contactNumber}"
					@value-changed="${(e) => this._cellphoneNumChange(e)}">
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
			Money Allocation
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
						<capitec-button class="capitec-button-small" slot="footer" type="primary" label="Add" @click="${() => this._addClick()}"></capitec-button>
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