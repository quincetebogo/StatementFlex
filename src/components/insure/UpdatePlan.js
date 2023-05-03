import { ACCOUNT_TYPES, BANK_OPTIONS, DEBIT_ORDER_DAY_OPTIONS, GENDER_OPTIONS, INSURE_DISCLOSURE_TYPE, ROLE_PLAYER_RELATIONSHIP, TITLE_OPTIONS } from 'app/constants/InsureCommon';
import { Component, css, html } from 'platform/elements';
import { formatDate, formatStringAsPascalCase, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { formatDateToInsure, getAgeFromDob, getAgeFromIDNumber, policyAllowsEditing, refreshRelationshipCoverDetails } from 'app/utils/insureUtils';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { INSURE_CSS } from 'app/css/InsureCommonStyles';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { UpdatePlanEvents } from 'app/constants/telemetry/events/Insure';
import { formatCurrency } from 'app/productControls/utilities/Currency';

// Dialogs
import 'app/components/dialogs/insure/AddLifeDialog';
import 'app/components/dialogs/insure/FCPAgreementDialog';
import 'app/components/dialogs/insure/YROAAgreementDialog';
import 'app/components/dialogs/insure/YBPAgreementDialog';

import 'app/components/dialogs/insure/RemoveBeneficiaryDialog';
import 'app/components/dialogs/insure/RemoveLifeAssuredDialog';
import 'app/components/dialogs/insure/AddBeneficiaryDialog';
import 'app/components/dialogs/insure/UpdatePlanAgreementDialog';
import 'app/components/dialogs/insure/ReinstatePolicyAgreementDialog';
import 'app/components/dialogs/insure/InsureConfirmationDialog';
import 'app/components/dialogs/insure/UpdateValidationDialog';
import 'app/components/dialogs/insure/IneligibleLivesDialog';
import 'app/components/dialogs/insure/LAAgreementDialog';
import 'app/components/dialogs/insure/YWNBPAgreementDialog';
import 'app/components/dialogs/insure/YPAgreementDialog';

// Other
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonExpander';
import 'app/components/common/ServiceCallErrorScreen';

const REGEX_CELLPHONE = {
	PATTERN: /^[0-9]{10}$/,
	ERR_MESSAGE: `Incorrect cellphone number`
};

const REGEX_EMAIL = {
	PATTERN: /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/,
	ERR_MESSAGE: `Incorrect email address`
};

/**
 * Update Plan allows for the Policy to be updated. The premium and cover amount, beneficiaries and the debit order details may be updated.
 * Lives can be added via AddLifeDialog
 * beneficiaries can be added via AddBeneficiaryDialog
 * 
 * Events Raised 
 * -------------
 * navigate-back
 * 
 *  
 * @export
 * @class UpdatePlan
 * @extends {Component}
 */
class UpdatePlan extends Component {

	// #region INITIALISATION

	constructor() {
		super();

		this.showAddRelationshipDialog = false;
		this.showAddBeneficiariesDialog = false;

		this.today = Date();

		this.selectedTabIndex = 0;
		this.lifeAssuredToRemove = null;
		this.lifeAssuredToRemoveDescription = null;
		this.beneficiaryToRemoveDescription = ``;

		this.showYBPAgreementDialog = false;
		this.showFCPAgreementDialog = false;
		this.showYROAAgreementDialog = false;
		this.showRemoveLifeAssuredDialog = false;
		this.showRemoveBeneficiaryDialog = false;
		this.showUpdatePlanAgreementDialog = false;
		this.showReinstatePolicyAgreementDialog = false;
		this.showReinstatePaymentAgreementDocument = false;
		this.showValidationConfirmDialog = false;
		this.disableBranchCode = true;
		this.showUpdateValidationDialog = false;
		this.showIneligibleLivesDialog = false;

		this.showLAAgreementDialog = false;
		this.agreementLAAccepted = ``;
		this.showYWNBPAgreementDialog = false;
		this.agreementYWNBPAccepted = ``;
		this.showYPAgreementDialog = false;
		this.agreementYPAccepted = ``;
		

		this.agreementFCPAccepted = ``;
		this.agreementYBPAccepted = ``;
		this.agreementYROAAccepted = ``;
		this.accountNumErrorMsg = ``;
		this.branchCodeErrorMsg = ``;

		this.policyDetails = {};
		this.prepareUpdateResponse = {};
		this.createPolicyResponse = {};
		this.onUpdateValidationMessage = {};
		this.disclosureValidationMessage = {};

		// Lookups
		this.accountTypeOptions = ACCOUNT_TYPES;
		this.bankOptions = BANK_OPTIONS;
		this.debitOrderDayOptions = DEBIT_ORDER_DAY_OPTIONS;
		this.genderOptions = GENDER_OPTIONS;
		this.titleOptions = TITLE_OPTIONS;

		this._telemetry = HorizonTelemetry.getInstance();
		this.telemetryEvents = {};

		this.roleplayerLength = 0;

	}

	// #endregion INITIALISATION

	// #region PROPERTIES

	/**
	 * @property {Number} selectedTabIndex stores the index of the current tab being used
	 * @property {Boolean} showYBPAgreementDialog determines whether to show the YBP agreement dialog
	 * @property {Boolean} showFCPAgreementDialog determines whether to show the FCP agreement dialog
	 * @property {Boolean} showYROAAgreementDialog determines whether to show the YROA agreement dialog
	 * @property {Boolean} showValidationConfirmDialog determines whether to show the disclosure validation dialog
	 * @property {String} agreementFCPAccepted determines whether the FCP agreement has been accepted
	 * @property {String} agreementYBPAccepted determines whether the YBP agreement has been accepted
	 * @property {String} agreementYROAAccepted determines whether the YROA agreement has been accepted
	 * @property {Boolean} showAddRelationshipDialog determines whether to show the add relationship agreement dialog
	 * @property {Boolean} showAddBeneficiariesDialog determines whether to show the add beneficiariesdialog
	 * @property {Boolean} showRemoveLifeAssuredDialog determines whether to show the EACL agreement dialog
	 * @property {Boolean} showRemoveBeneficiaryDialog determines whether to show the EACL agreement dialog
	 * @property {Boolean} showUpdatePlanAgreementDialog determines whether to show the Update Plan agreement dialog
	 * @property {Boolean} showUpdatePlanPaymentAgreementDocument determines whether to show the Update Plan Payment agreement document
	 * @property {Boolean} showConfirmPlanUpdateDialog Show flag for Conformation dialog, to confirm Update Plan agreement
	 * @property {Object} policyDetails Current Policy Summary Object
	 * @property {Number} collectionDay Premium collection day
	 * @property {String} currentTotalPremium current total premium to show
	 * @property {Object} updatePlanPrepare Callback function to Prepare Update *
	 * @property {Object} updatePlanQuote Callback function to Quote Calc *
	 * @property {Object} tempDocContent temporary document content
	 * @property {Boolean} canReinstate determines whether to show the Reinstate button on the title bar
	 * @property {Boolean} showReinstatePolicyAgreementDialog determines whether to show the Reinstate Policy agreement dialog
	 * @property {Boolean} showReinstatePaymentAgreementDocument determines whether to show the Reinstate Payment agreement document
	 * @property {Object} createPolicyResponse - response Payload of Create Policy
	 * @property {Object} issuePlanAgreementDocument - Issue Plan Agreement Document
	 * @property {Object} reinstatePaymentAgreementDocument - reinstate Payment Agreement Document
	 * @property {number} maxAllowedCover - maximum allowed cover
	 * @property {string} accountNumErrorMsg - error message for account number
	 * @property {string} branchCodeErrorMsg - error message for branch code
	 * @property {Object} disclosureValidationMessage - message for disclosure validation
	 * @property {boolean} showUpdateValidationDialog - determines whether to show update validation dialog
	 * @property {boolean} disableBranchCode - determine whether to disable branch code
	 * @property {Object} onUpdateValidationMessage - message for update validations
	 * @readonly
	 * @static
	 */
	static get properties() {
		return {
			selectedTabIndex: { type: Number, state: true },
			showYBPAgreementDialog: { type: Boolean, state: true },
			showFCPAgreementDialog: { type: Boolean, state: true },
			showYROAAgreementDialog: { type: Boolean, state: true },
			showLAAgreementDialog: { type: Boolean, state: true },
			showYWNBPAgreementDialog: { type: Boolean, state: true },
			showYPAgreementDialog: { type: Boolean, state: true },
			showValidationConfirmDialog: { type: Boolean, state: true },

			agreementYPAccepted: { type: String, state: true },
			agreementYWNBPAccepted: { type: String, state: true },
			agreementLAAccepted: { type: String, state: true },
			agreementFCPAccepted: { type: String, state: true },
			agreementYBPAccepted: { type: String, state: true },
			agreementYROAAccepted: { type: String, state: true },
			showAddRelationshipDialog: { type: Boolean, state: true },
			showAddBeneficiariesDialog: { type: Boolean, state: true },
			showRemoveLifeAssuredDialog: { type: Boolean, state: true },
			showRemoveBeneficiaryDialog: { type: Boolean, state: true },
			showUpdatePlanAgreementDialog: { type: Boolean, state: true },
			showUpdatePlanPaymentAgreementDocument: { type: Boolean, state: true },
			showConfirmPlanUpdateDialog: { type: Boolean, state: true },
			policyDetails: { type: Object, state: true },
			collectionDay: { type: Number, state: true },
			roleplayerLength: { type: Number, state: true },

			currentTotalPremium: { string: `` },

			updatePlanPrepare: { type: Object, state: true },
			updatePlanQuote: { type: Object, state: true },
			tempDocContent: { type: String, state: true },

			canReinstate: { type: Boolean },
			showReinstatePolicyAgreementDialog: { type: Boolean, state: true },
			showReinstatePaymentAgreementDocument: { type: Boolean, state: true },
			createPolicyResponse: { type: Boolean, state: true },

			issuePlanAgreementDocument: { type: Object, state: true },
			reinstatePaymentAgreementDocument: { type: Object, state: true },

			maxAllowedCover: { type: Number, state: true },
			accountNumErrorMsg: { type: String, state: true },
			branchCodeErrorMsg: { type: String, state: true },
			disclosureValidationMessage: { type: Object, state: true },
			showUpdateValidationDialog: { type: Boolean, state: true },
			disableBranchCode: { type: Boolean, state: true },
			onUpdateValidationMessage: { type: Object, state: true },
			showIneligibleLivesDialog: { type: Object, state: true }
		};
	}

	// #endregion PROPERTIES


	// #region LIFECYCLE OVERRIDES

	/**
	 * Setup the component once added to the DOM.
	 * @returns {void}
	 */
	async connectedCallback() {
		super.connectedCallback();

		this.telemetryEvents = UpdatePlanEvents;
		await this._telemetry.startSpan(this.telemetryEvents.UPDATE_PLAN, {});

		this._initialise();
	}

	async disconnectedCallback() {
		super.disconnectedCallback();
		await this._telemetry.endSpan(this.telemetryEvents.UPDATE_PLAN, {});
	}

	// #endregion LIFECYCLE OVERRIDES

	// #region EVENT HANDLERS

	/**
	 * Event from Add life dialog for Update Plan
	 * 
	 * @param {Event} e e
	 * @return {void} 
	 */
	_addLife(e) {
		this.policyDetails.roleplayers.push({
			title: ``,
			gender: ``,
			firstName: ``,
			surname: ``,
			middleName: ``,
			idNumber: ``,
			contactDetails: {
				cellphone: ``,
				email: ``
			},
			relationship: e.detail.relationship,
			coverAmount: e.detail.coverDetails.defaultCover,
			lifeAssured: true,
			beneficiary: false,
			premium: 0,
			gender: `Male`,
			age: 0,
			rowID: this.policyDetails.roleplayers.length,
			coverDetails: e.detail.coverDetails
		});
		this.showAddRelationshipDialog = false;
	}

	// adding/removing beneficiaries

	/**
	 * Click event from the beneficiary dialog to add new beficiary and close 
	 * @param {event} e e
	 * @return {void} 
	 */
	_addBeneficiaryClick(e) {
		if (e.detail.beneficiary.lifeAssured === true) {
			this.policyDetails.roleplayers.find(ele => {
				if (ele.rowID === e.detail.beneficiary.rowID) {
					ele.beneficiary = true;
				}
				return ele.beneficiary;
			});
		} else {
			this.policyDetails.roleplayers.push(e.detail.beneficiary);
		}
		this._closeAddBeneficiariesDialog();
	}

	/**
	 * Click event from remove button on beneficiary list
	 * @return {void} 
	 */
	_removeBeneficiary() {
		for (let index = 0; index < this.policyDetails.roleplayers.length; index++) {
			if (this.policyDetails.roleplayers[index].rowID === this.beneficiaryToRemoveRowID) {
				this.policyDetails.roleplayers[index].beneficiary = false;
				this.policyDetails.roleplayers[index].benefitPayout = 0;
				// remove roleplayer from roleplayers if not a life assured
				if (this.policyDetails.roleplayers[index].lifeAssured === false) {
					this.policyDetails.roleplayers.splice(index, 1);
				}
			}
		}
		this._closeRemoveBeneficiaryDialog();
		this.requestUpdate();

	}

	/**
	 * Open Remove Beneficiary dialog
	 * @return {void}
	 * @param {Array} beneficiary beneficiary
	 * 
	 */
	_openRemoveBeneficiaryDialog(beneficiary) {
		this.showRemoveBeneficiaryDialog = true;

		this.beneficiaryToRemoveRowID = beneficiary.rowID;

		if (!beneficiary.firstName) {
			this.beneficiaryToRemoveDescription = formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[beneficiary.relationship?.toUpperCase()]);
		} else {
			this.beneficiaryToRemoveDescription = `${beneficiary.firstName} ${beneficiary?.surname}`;
		}

	}

	/**
	 * Close Remove Beneficiary dialog
	 * @return {void}
	 */
	_closeRemoveBeneficiaryDialog() {
		this.showRemoveBeneficiaryDialog = false;
	}

	/**
	 * Click event from remove button on life list
	 * @return {void}
	 */
	_removeLifeAssured() {

		this.policyDetails.roleplayers.splice(this.lifeAssuredToRemove, 1);
		// Reshuffle
		for (let index = 0; index < this.policyDetails.roleplayers.length; index++) {
			this.policyDetails.roleplayers[index].rowID = index;
		}
		this._closeRemoveLifeAssuredDialog();
		this.requestUpdate();
	}

	/**
	 * Open Remove Life Assured dialog
	 * @param {object} roleplayer roleplayer
	 * @param {number} index index
	 * @return {void} 
	 */
	_openRemoveLifeAssuredDialog(roleplayer, index) {
		this.showRemoveLifeAssuredDialog = true;
		if (!roleplayer.firstName) {
			this.lifeAssuredToRemoveDescription = roleplayer.relationship;
		} else {
			this.lifeAssuredToRemoveDescription = `${roleplayer.firstName} ${roleplayer.surname}`;

		}

		this.lifeAssuredToRemove = index;
	}

	/**
	 * Close Remove Life Assured dialog
	 * @return {void} 
	 */
	_closeRemoveLifeAssuredDialog() {
		this.showRemoveLifeAssuredDialog = false;
	}

	// CHANGE HANDLERS

	/**
	 * Event fired when a life assured COVER AMOUNT value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void}
	 */
	_lifeCoverAmountValueChanged(event, rowID) {
		let age = ``;
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].coverAmount = event.detail.new;

					if (rolePlayer.dateOfBirth !== undefined) {
						age = getAgeFromDob(rolePlayer.dateOfBirth);
					}

					// Cover Details
					this.policyDetails.roleplayers[index].coverDetails = refreshRelationshipCoverDetails(
						this.policyDetails.roleplayers[index].relationship,
						this.productParams,
						this.policyDetails.roleplayers[index].coverAmount,
						index === 0 ? this.maxAllowedCover : 0,
						age,
						this.policyDetails.roleplayers[index].coverDetails?.isExtendedFamily,
						false
					);

					if (isNullorEmpty(rolePlayer.idNumber)) {
						rolePlayer.coverDetails.disableDoB = false;
					} else {
						const birthYear = rolePlayer.idNumber.substring(0, 2);
						const fullCurrentYear = new Date().getFullYear();
						const currentYear = fullCurrentYear.toString().substring(2);

						if (parseInt(birthYear, 10) >= 0 && parseInt(birthYear, 10) <= parseInt(currentYear, 10)) {
							rolePlayer.coverDetails.disableDoB = false;
						} else {
							rolePlayer.coverDetails.disableDoB = true;
						}
					}
				}
			});
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured TITLE value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeTitleValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].title = event.detail.new.code;

					if (rolePlayer.beneficiary === true) {
						if (!isNullorEmpty(rolePlayer.title)) {
							rolePlayer.coverDetails.titleErrorMessage = ``;
						}
					} else if (rolePlayer.lifeAssured === true) {
						if (!isNullorEmpty(rolePlayer.title)) {
							rolePlayer.coverDetails.titleErrorMessageLA = ``;
						}
					}
				}
			});
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured GENDER value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeGenderValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].gender = event.detail.new.code;

					if (rolePlayer.lifeAssured === true) {
						if (!isNullorEmpty(rolePlayer.gender)) {
							rolePlayer.coverDetails.genderErrorMessageLA = ``;
						}
					}
				}
			});
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured FIRSTNAME value changes
	 * @param {event} event event
	 * @param {string} rowID rowID`
	 * @return {void} 
	 */
	_lifeNameValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].firstName = event.detail.new;

					if (isNullorEmpty(event.detail.new)) {
						rolePlayer.coverDetails.firstNameErrorMessage = `First name is a required field`;
					} else {
						rolePlayer.coverDetails.firstNameErrorMessage = ``;
					}

				}
			});
		}
		this.requestUpdate();
	}


	/**
	 * Event fired when a life assured SURNAME value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeSurnameValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].surname = event.detail.new;

					if (isNullorEmpty(event.detail.new)) {
						rolePlayer.coverDetails.surnameErrorMessage = `Surname is a required field`;
					} else {
						rolePlayer.coverDetails.surnameErrorMessage = ``;
					}

				}
			});
		}
		this.requestUpdate();
	}

	/**
	 * Event fired when a life assured MIDDLENAME value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeMiddleNameValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].middleName = event.detail.new;
				}
			});
		}
	}

	/**
	 * Event fired when a life assured ID NUMBER value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeIDValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].idNumber = event.detail.new;

					if (this.policyDetails.roleplayers[index].idNumber.length === 13) {
						const birthYear = rolePlayer.idNumber.substring(0, 2);
						const fullCurrentYear = new Date().getFullYear();
						const currentYear = fullCurrentYear.toString().substring(2);


						// validations
						if (rolePlayer.beneficiary === true) {
							if (!isNullorEmpty(rolePlayer.idNumber)) {
								rolePlayer.coverDetails.idNumberErrorMessage = ``;
							}
						} else if (rolePlayer.lifeAssured === true) {
							if (!isNullorEmpty(rolePlayer.idNumber)) {
								rolePlayer.coverDetails.idErrorMessageLA = ``;
							}
						}
						if (rolePlayer.lifeAssured === true) {
							// Cover Details
							this.policyDetails.roleplayers[index].coverDetails = refreshRelationshipCoverDetails(
								this.policyDetails.roleplayers[index].relationship,
								this.productParams,
								this.policyDetails.roleplayers[index].coverAmount,
								index === 0 ? this.maxAllowedCover : 0,
								getAgeFromIDNumber(this.policyDetails.roleplayers[index].idNumber),
								this.policyDetails.roleplayers[index].coverDetails?.isExtendedFamily,
								false
							);
						}

						if (parseInt(birthYear, 10) >= 0 && parseInt(birthYear, 10) <= parseInt(currentYear, 10)) {
							rolePlayer.coverDetails.disableDoB = false;
						} else {
							rolePlayer.coverDetails.disableDoB = true;
						}

						if (rolePlayer.beneficiary === true) {
							const age = getAgeFromIDNumber(this.policyDetails.roleplayers[index].idNumber);
							rolePlayer.coverDetails.idNumberErrorMessage = ``;
							if (age < 18) {
								rolePlayer.coverDetails.idNumberErrorMessage = `Beneficiary must be 18 years or older`;
							}
						}

						const dateOfBirth = this._setDOB(this.policyDetails.roleplayers[index].idNumber);
						if (!isNullorEmpty(dateOfBirth)) {
							this.policyDetails.roleplayers[index].dateOfBirth = dateOfBirth;
							this.policyDetails.roleplayers[index].coverDetails.ageMessage = ``;
						}


						if (!isNullorEmpty(this.policyDetails.roleplayers[index].coverDetails?.ageMessage)) {
							rolePlayer.coverDetails.disableDoB = false;
						}

					} else {
						rolePlayer.coverDetails.idNumberErrorMessage = `ID Number not valid`;
					}

				}
			});
		}
		this.requestUpdate();

	}


	/**
	 * Event fired when a life assured CELLPHONE NUMBER value changes
	 * @param {event} event event
	 * @param {string} rowID event
	 * @return {void} 
	 */
	_lifeCellphoneValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {

					if (isNullorEmpty(this.policyDetails.roleplayers[index]?.contactDetails)) {
						this.policyDetails.roleplayers[index].contactDetails = {};
					}

					this.policyDetails.roleplayers[index].contactDetails.cellphone = event.detail.new;

					if (!isNullorEmpty(event.detail.new) && !RegExp(REGEX_CELLPHONE.PATTERN, `g`).test(event.detail.new)) {
						this.policyDetails.roleplayers[index].coverDetails.cellphoneNumberErrorMessage = `Incorrect cellphone number`;
					} else {
						this.policyDetails.roleplayers[index].coverDetails.cellphoneNumberErrorMessage = ``;
					}
				}
			});
			this.requestUpdate();
		}
	}

	/**
	 * Event fired when a life assured CELLPHONE NUMBER value changes
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_lifeEmailValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {

					if (isNullorEmpty(this.policyDetails.roleplayers[index]?.contactDetails)) {
						this.policyDetails.roleplayers[index].contactDetails = {};
					}

					this.policyDetails.roleplayers[index].contactDetails.email = event.detail.new;

					if (!isNullorEmpty(event.detail.new) && !RegExp(REGEX_EMAIL.PATTERN, `g`).test(event.detail.new)) {
						this.policyDetails.roleplayers[index].coverDetails.emailAddressErrorMessage = REGEX_EMAIL.ERR_MESSAGE;
					} else {
						this.policyDetails.roleplayers[index].coverDetails.emailAddressErrorMessage = ``;
					}
				}
			});
			this.requestUpdate();
		}
	}

	/**
	 * Beneficiary Change events
	 * @param {event} event event
	 * @param {string} rowID rowID
	 * @return {void} 
	 */
	_beneficiaryPayoutValueChanged(event, rowID) {
		if (event.detail.old !== event.detail.new) {
			let totalPayout = 0;

			this.policyDetails.roleplayers.forEach(ele => {
				if (ele.rowID === rowID) {
					ele.benefitPayout = event.detail.new;
				}
				if (ele.beneficiary === true) {
					totalPayout += parseFloat(ele.benefitPayout);
				}
			});

			if (this.policyDetails.roleplayers[0].coverAmount !== totalPayout) {
				this.policyDetails.roleplayers.forEach(ele => {
					if (ele.beneficiary === true) {
						ele.coverDetails.benefitPayoutErrorMessage = `Beneficiary payout amount(s) does not match total`;
					}
					if (isNullorEmpty(ele.benefitPayout)) {
						ele.coverDetails.benefitPayoutErrorMessage = `Payout amount is a required field`;
					}
				});

			} else {
				this.policyDetails.roleplayers.forEach(ele => {
					if (ele.beneficiary === true) {
						ele.coverDetails.benefitPayoutErrorMessage = ``;
					}
				});
			}

			this.requestUpdate();
		}


	}

	/** Debit order details events */

	/** change format of the bank returned to match the format of banks in the list
	 * @returns {String} null
	 */
	_getBank() {
		let bank = this.bankOptions.find(banks => banks.code === this.policyDetails.deductionDetails?.bankDetails?.bank.toUpperCase().trim());
		if (isNullorEmpty(bank?.text)) {
			bank = this.bankOptions.find(banks => banks.branchCode === this.policyDetails.deductionDetails?.bankDetails?.branchCode.toUpperCase().trim());
		}
		return bank?.text;
	}

	/**
	 * Event fired when the debit order bank value changes
	 * 
	 * @param {event} e e
	 * @returns {void} 
	 */
	_selectedBankChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.policyDetails.deductionDetails.bankDetails.bank = e.detail.new.code;
			this.policyDetails.deductionDetails.bankDetails.branchCode = e.detail.new.branchCode;

			if (this.policyDetails.deductionDetails.bankDetails.branchCode === `0`) {
				this.disableBranchCode = false;
			} else {
				this.disableBranchCode = true;
			}

			this.policyDetails.deductionDetails.bankDetails.accountNumber = ``;
			this.accountNumErrorMsg = `Account number is a required field`;
		}

		this.requestUpdate();
	}

	/**
	 * Event fired when the debit order day value changes
	 * 
	 * @param {event} e e
	 *  @returns {void} 
	 */
	_debitOrderDayChange(e) {

		if (e.detail.old !== e.detail.new) {
			this.policyDetails.deductionDetails.collectionDay = e.detail.new.code;
		}

	}

	/**
	 * Event fired when the debit order branch code value changes
	 * 
	 * @param {event} e e
	 *  @returns {void} 
	 */
	_branchCodeChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.policyDetails.deductionDetails.bankDetails.branchCode = e.detail.new;
		}
		if (isNullorEmpty(e.detail.new)) {
			this.branchCodeErrorMsg = `Branch code is a required field`;
		} else {
			this.branchCodeErrorMsg = ``;
		}

	}

	/**
	 * Event fired when the debit order account number value changes
	 * 
	 * @param {event} e e
	 *  @returns {void} 
	 */
	_accountNumberChange(e) {
		if (e.detail.old !== e.detail.new) {
			this.policyDetails.deductionDetails.bankDetails.accountNumber = e.detail.new;
		}
		if (isNullorEmpty(e.detail.new)) {
			this.accountNumErrorMsg = `Account number is a required field`;
		} else {
			this.accountNumErrorMsg = ``;
		}
	}

	/**
	* Calculate Button event / Calculate by life assured
	* @returns {void} 
	*/
	async _calculatePremium() {
		this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_CALCULATE, {
			"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
			"next-screen": null
		});

		const onUpdateValidations = this.validateUpdatePlanCalculate();
		if (onUpdateValidations.validated === true) {
			delete this.policyDetails.totalPremium;
			const calcQuoteResponse = await this.updatePlanQuote(this.policyDetails);

			this.currentTotalPremium = calcQuoteResponse.totalPremium;
			this.policyDetails.roleplayers = calcQuoteResponse.lifesAssured;
			this.policyDetails.quoteNumber = calcQuoteResponse.quoteNumber;
		} else {
			this.onUpdateValidationMessage = this._generateOnUpdateValidationMessage(onUpdateValidations);
			this.showUpdateValidationDialog = true;
		}
		this.requestUpdate();
	}

	/**
	 * Validate required fields on update plan
	 * @returns {Boolean} canSubmit
	 */
	validateUpdatePlanCalculate() {

		const onUpdateValidations = {};
		onUpdateValidations.lives = [];
		onUpdateValidations.validated = true;
		onUpdateValidations.bankingDetailsValid = true;
		onUpdateValidations.lifeAssured = true;

		this.policyDetails.roleplayers.forEach(ele => {
			ele.coverDetails.canSubmit = true;
			

			if (ele.lifeAssured === true) {

				// Name and surname
				if (ele.firstName === `` || ele.surname === ``) {
					ele.coverDetails.canSubmit = false;
				}

				// Title
				if (isNullorEmpty(ele.title)) {
					ele.coverDetails.canSubmit = false;
					ele.coverDetails.titleErrorMessageLA = `Title is a required field`;
				}

				// Cover amount
				if (ele.coverAmount === `` || ele.coverAmount === `0`) {
					ele.coverDetails.canSubmit = false;
				}

				// ID and Date of Birth
				if (isNullorEmpty(ele.idNumber) && isNullorEmpty(ele.dateOfBirth)) {
					ele.coverDetails.canSubmit = false;
					ele.coverDetails.idErrorMessageLA = `ID number is a required field`;
				}

				// Gender
				if (isNullorEmpty(ele.gender)) {
					ele.coverDetails.canSubmit = false;
					ele.coverDetails.genderErrorMessageLA = `Gender is a required field`;
				}

			}

			// build list for validation dialog
			if (ele.coverDetails.canSubmit === false) {
				onUpdateValidations.lives.push({
					name: ele.firstName,
					surname: ele.surname
				});
				onUpdateValidations.validated = false;
			}

		});
		return onUpdateValidations;
	}

	/**
	 * Tab change to switch between calculate and email plan button
	 * @param {event} e e
	 * @return {void} 
	 */
	_tabChange(e) {
		this.selectedTabIndex = e.detail.selectedIndex;
	}

	/**
	 * Cancel the disclosure pop ups
	 * @param {int} disclosureType - type of disclosure 
	 *  @returns {void} 
	*/
	_cancelDisclosureDialog(disclosureType) {
		switch (disclosureType) {
			case INSURE_DISCLOSURE_TYPE.FCP_NOTIFICATION: {
				this.agreementFCPAccepted = `no`;
				this.showFCPAgreementDialog = false;
				break;
			}
			case INSURE_DISCLOSURE_TYPE.YBP_NOTIFICATION: {
				this.agreementYBPAccepted = `no`;
				this.showYBPAgreementDialog = false;
				break;
			}
			case INSURE_DISCLOSURE_TYPE.YROA_NOTIFICATION: {
				this.agreementYROAAccepted = `no`;
				this.showYROAAgreementDialog = false;
				break;
			}
			case INSURE_DISCLOSURE_TYPE.LA_NOTIFICATION: {
				this.agreementLAAccepted = `no`;
				this.showLAAgreementDialog = false;
				break;
			}
			case INSURE_DISCLOSURE_TYPE.YWNBP_NOTIFICATION: {
				this.agreementYWNBPAccepted = `no`;
				this.showYWNBPAgreementDialog = false;
				break;
			}
			case INSURE_DISCLOSURE_TYPE.YP_NOTIFICATION: {
				this.agreementYPAccepted = `no`;
				this.showYPAgreementDialog = false;
				break;
			}
			default:
				break;
		}

		this.requestUpdate();
	}

	/**
	 * Accept the FCP (Funeral Cover Plan) Agreement
	 * @return {void} 
	 */
	_acceptFCPAgreement() {
		this.agreementFCPAccepted = `yes`;
		this.showFCPAgreementDialog = false;
	}

	/**
	 * Accept the LA (Lives Assured) Agreement
	 * @return {void} 
	 */
	_acceptLAAgreement() {
		this.agreementLAAccepted = `yes`;
		this.showLAAgreementDialog = false;
	}

	/**
	 * Accept the YWNBP (You will not be paid) Agreement
	 * @return {void} 
	 */
	_acceptYWNBPAgreement() {
		this.agreementYWNBPAccepted = `yes`;
		this.showYWNBPAgreementDialog = false;
	}

	/**
	 * Accept the YP (You Pay) Agreement
	 * @return {void} 
	 */
	_acceptYPAgreement() {
		this.agreementYPAccepted = `yes`;
		this.showYPAgreementDialog = false;
	}

	/**
	 * Close YBP (You/your Beneficiary are paid) agreement dialog
	 * @return {void} 
	 */
	_acceptYBPAgreement() {
		this.agreementYBPAccepted = `yes`;
		this.showYBPAgreementDialog = false;
	}

	/**
	 * Close YROA (Your responsibility & our Accountability) agreement dialog
	 * @return {void} 
	 */
	_acceptYROAAgreement() {
		this.agreementYROAAccepted = `yes`;
		this.showYROAAgreementDialog = false;
	}

	/**
	 * Navigate back to client policies
	 * @return {void} 
	 */
	_backToSummaryPage() {
		this.dispatchEvent(new CustomEvent(`navigate-back`, {
			detail: {
			}
		}));
	}

	/**
	 * Open Add Life dialog returning select relationship
	 * @return {void} 
	 */
	_openAddLifeDialog() {
		this.showAddRelationshipDialog = true;
	}

	/**
	 * Close the Add Life dialog
	 * @return {void} 
	 */
	_closeAddLifeDialog() {
		this.showAddRelationshipDialog = false;
	}

	/**
	 * open add beneficiaries dialog 
	 * @return {void} 
	 */
	_openAddBeneficiariesDialog() {
		this.showAddBeneficiariesDialog = true;
		this.roleplayerLength = this.policyDetails.roleplayers.length;
	}

	/**
	 * Close the Add beneficiaries dialog
	 * @return {void} 
	 */
	_closeAddBeneficiariesDialog() {
		this.showAddBeneficiariesDialog = false;
	}

	/**
	 * Close the Add Life dialog
	 * @return {void} 
	 */
	_closeUpdatePlanAgreementDialog() {
		this.showUpdatePlanAgreementDialog = false;
	}

	/**
	 * Update Plan button click event
	 * Invoke API endpoints
	 * @return {void} 
	 */
	async _updatePlanClick() {

		this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_UPDATE, {
			"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
			"next-screen": null
		});


		if (!(this.agreementFCPAccepted === `yes` && 
			this.agreementYBPAccepted === `yes` && this.agreementYROAAccepted === `yes` && this.agreementLAAccepted === `yes` &&
			this.agreementYWNBPAccepted === `yes` && this.agreementYPAccepted === `yes`)) {
			this.showValidationConfirmDialog = true;
			this.disclosureValidationMessage = this._generateDisclosureValidationMessage();
			return;
		}

		const onUpdateValidations = this._validateOnUpdate();

		if (onUpdateValidations.validated === false || onUpdateValidations.bankingDetailsValid === false) {
			this.onUpdateValidationMessage = this._generateOnUpdateValidationMessage(onUpdateValidations);
			this.showUpdateValidationDialog = true;
			return;
		}

		await this._calculatePremium();
		this.prepareUpdateResponse = await this.updatePlanPrepare(this.policyDetails);
		if (this.prepareUpdateResponse === undefined) {
			return;
		}
		this.showUpdatePlanAgreementDialog = true;
		this.planAgreementContent = this.prepareUpdateResponse.planAgreement.documentContent.value;
	}

	/**
	 * event for update plan accept
	 * @returns {void}
	 */
	_acceptUpdatedPlan() {
		this.dispatchEvent(new CustomEvent(`updatePlanAccept`, { detail: { prepareUpdate: this.prepareUpdateResponse } }));
	}

	/**
 * Show Policy Schedule and Mandate documents
 * @return {void} 
 */
	async _reinstatePolicyPopup() {

		if (!(this.agreementFCPAccepted === `yes` && 
			this.agreementYBPAccepted === `yes` && this.agreementYROAAccepted === `yes` && this.agreementLAAccepted === `yes` &&
			this.agreementYWNBPAccepted === `yes` && this.agreementYPAccepted === `yes`)) {
			this.showValidationConfirmDialog = true;
			this.disclosureValidationMessage = this._generateDisclosureValidationMessage();
			return;
		}

		this.createPolicyResponse = await this.initiateReinstatePolicy(this.policyDetails);

		this.issuePlanAgreementContent = this.createPolicyResponse.issuePlanAgreement.documentContent.value;
		this.newContractReference = this.createPolicyResponse.policyResponse.contractReference;

		this.showReinstatePolicyAgreementDialog = true;

	}

	_openAgreement(type) {

		if (type === `YROA`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_YROA, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showYROAAgreementDialog = true;
		}

		if (type === `FCP`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_FCP, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showFCPAgreementDialog = true;
		}

		if (type === `YBP`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_YBP, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showYBPAgreementDialog = true;
		}

		if (type === `LA`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_LA, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showLAAgreementDialog = true;
		}

		if (type === `YWNBP`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_YWNBP, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showYWNBPAgreementDialog = true;
		}

		if (type === `YP`) {
			this._telemetry.logEvent(this.telemetryEvents.UPDATE_PLAN_DISCLOSURE_YP, {
				"screen": TelemetryScreen.INSURE_UPDATE_PLAN,
				"next-screen": null
			});
			this.showYPAgreementDialog = true;
		}

	}

	// #endregion EVENT HANDLERS

	// #region PRIVATE FUNCTIONS

	/**
	 * change format of the collection day value returned to match the format of the collection day list
	 * 
	 *  @returns {String} day text
	 */
	_getCollectionDay() {
		if (!this.collectionDay) {
			return ``;
		}
		const day = this.debitOrderDayOptions.find(days => days.code.toString() === this.collectionDay.toString());
		return day?.text;

	}

	/**
	 * Initialize component
	 * 
	 * Set maxAllowed cover to include the current policy being looked at
	 * @return {void} 
	 */
	_initialise() {
		this.maxAllowedCover += this.policyDetails.roleplayers[0].coverAmount;
		this.currentTotalPremium = this.policyDetails.totalPremium;

		// Set Initial Cover Details for each player
		for (let index = 0; index < this.policyDetails.roleplayers.length; index++) {
			const relationship = this.policyDetails.roleplayers[index].relationship;
			let isExtendedFamily = true;
			if (relationship === `MainLife` || relationship === `Parent` || relationship === `Spouse` || relationship === `Child`) {
				isExtendedFamily = false;
			}

			this.policyDetails.roleplayers[index].coverDetails = refreshRelationshipCoverDetails(
				relationship,
				this.productParams,
				this.policyDetails.roleplayers[index].coverAmount,
				index === 0 ? this.maxAllowedCover : 0,
				getAgeFromDob(this.policyDetails.roleplayers[index].dateOfBirth),
				isExtendedFamily,
				false
			);
		}
		this.collectionDay = this.policyDetails.deductionDetails.collectionDay;
		this.canReinstate = this.policyDetails.canReinstate;
		this.policyDetails.roleplayers.forEach((rolePlayer) => {

			if (isNullorEmpty(rolePlayer.idNumber)) {
				rolePlayer.coverDetails.disableDoB = false;
			} else {
				const birthYear = rolePlayer.idNumber.substring(0, 2);
				const fullCurrentYear = new Date().getFullYear();
				const currentYear = fullCurrentYear.toString().substring(2);

				if (parseInt(birthYear, 10) >= 0 && parseInt(birthYear, 10) <= parseInt(currentYear, 10)) {
					rolePlayer.coverDetails.disableDoB = false;
				} else {
					rolePlayer.coverDetails.disableDoB = true;
				}
			}
		});
		this._openIneligibleLivesDialog();

	}

	/**
	 * determines whether to show the Ineligible Lives Dialog
	 * @returns {void}
	 */
	_openIneligibleLivesDialog() {
		if (this.canReinstate === true && this.policyDetails.ineligibleRoleplayers.length > 0) {
			this.showIneligibleLivesDialog = true;
		}

	}

	/**
	 * Calculate / Refresh current total beneficiaries including main life
	 * @returns {Number} totalBeneficiaries 
	 */
	_totalBeneficiaries() {
		return this.policyDetails.roleplayers.reduce((accumulator, ele) => {
			if (ele.beneficiary === true || ele.relationship === `MainLife`) {
				return accumulator + 1;
			}
			return accumulator;

		}, 0);
	}

	/**
	 * validate fields on beneficiary tab and banking details tab when update button is clicked
	 * @returns {Boolean} boolean
	 */
	_validateOnUpdate() {
		const onUpdateValidations = {};
		onUpdateValidations.lives = [];
		onUpdateValidations.validated = true;
		onUpdateValidations.bankingDetailsValid = true;
		onUpdateValidations.lifeAssured = false;
		let payoutsMatch = false;

		let totalPayout = 0;

		this.policyDetails.roleplayers.forEach(ben => {
			if (ben.beneficiary === true) {
				totalPayout += parseFloat(ben.benefitPayout);
			}
		});

		if (this.policyDetails.roleplayers[0].coverAmount === totalPayout) {
			payoutsMatch = true;
		}

		this.policyDetails.roleplayers.forEach(ele => {
			ele.coverDetails.canUpdate = true;
			if (ele.beneficiary === true) {

				// Benefit payout Check
				if (ele.benefitPayout === ``) {
					ele.coverDetails.canUpdate = false;
					ele.coverDetails.benefitPayoutErrorMessage = `Payout amount is a required field`;
				}

				// Contact details
				if (isNullorEmpty(ele.contactDetails?.cellphone) && isNullorEmpty(ele.contactDetails?.email)) {
					ele.coverDetails.canUpdate = false;
					ele.coverDetails.cellphoneNumberErrorMessage = `Please enter a cellphone number`;
				}

				// First name
				if (isNullorEmpty(ele.firstName)) {
					ele.coverDetails.firstNameErrorMessage = `First name is a required field`;
					ele.coverDetails.canUpdate = false;
				}

				// Surname
				if (isNullorEmpty(ele.surname)) {
					ele.coverDetails.surnameErrorMessage = `Surname is a required field`;
					ele.coverDetails.canUpdate = false;
				}

				// Minor check
				const age = getAgeFromDob(ele.dateOfBirth);
				if (age < 18) {
					ele.coverDetails.canUpdate = false;
					ele.coverDetails.ageMessage = `Beneficiary must be 18 years or older`;
				}

				// ID and DoB
				if (isNullorEmpty(ele.idNumber) && isNullorEmpty(ele.dateOfBirth)) {
					ele.coverDetails.canUpdate = false;
					ele.coverDetails.idNumberErrorMessage = `ID number is a required field`;
				}

				// Title
				if (isNullorEmpty(ele.title)) {
					ele.coverDetails.canUpdate = false;
					ele.coverDetails.titleErrorMessage = `Title is a required field`;
				}

			}

			// Payouts match
			if (ele.beneficiary === true && payoutsMatch === false) {
				ele.coverDetails.canUpdate = false;
				ele.coverDetails.benefitPayoutErrorMessage = `Beneficiary payout amount(s) does not match total`;
			}

			// Banking Details
			if (isNullorEmpty(this.policyDetails.deductionDetails?.bankDetails?.accountNumber)) {
				onUpdateValidations.bankingDetailsValid = false;
				this.accountNumErrorMsg = `Account number is a required field`;
			}

			// Build list for validation dialog
			if (ele.coverDetails.canUpdate === false) {
				onUpdateValidations.lives.push({
					name: ele.firstName,
					surname: ele.surname
				});
				onUpdateValidations.validated = false;
			}

		});
		return onUpdateValidations;
	}

	/**
	 *  generate the validation message to be displayed for the on update validations
	 * @param {object} onUpdateValidations onUpdateValidations
	 * @returns {html} html
	 */
	_generateOnUpdateValidationMessage(onUpdateValidations) {

		let allNamesPresent = true;
		let selectedTab = ``;

		onUpdateValidations.lives.forEach(lives => {
			if (lives.name === `` || lives.surname === ``) {
				allNamesPresent = false;
			}
		});

		// validations from which tab
		if (onUpdateValidations.lifeAssured === true) {
			selectedTab = `Premium & Cover Amount`;
		} else {
			selectedTab = `Beneficiaries`;
		}

		// First and last names for lives are available to use
		if (allNamesPresent === true && onUpdateValidations.lives.length > 0) {
			return html`
				<p>One or more required fields are missing on the <b>${selectedTab} tab</b> from:</p> 

				<ul>
					${onUpdateValidations.lives.map(lives => html`
					<li>${lives.name} ${lives.surname}</li>
					`)}
				</ul>

				${onUpdateValidations.bankingDetailsValid === false
					? html`
				<p>One or more required fields are missing from the <b>Debit Order Details tab</b></p>
				`
					: html``}
			`;
		}

		// first and/or last names missing and banking details not valid
		if (onUpdateValidations.lives.length > 0) {
			return html`
			${onUpdateValidations.bankingDetailsValid === false
					? html`
			<p>One or more required fields are missing from the <b>${selectedTab} tab</b> and <b>Debit Order Details tab</b></p>
			`
					: html`
			<p>One or more required fields are missing from the <b>${selectedTab} tab</b></p>
			`}
		`;
		}

		// Only banking details invalid
		return html`
		<p>One or more required fields are missing from the <b>Debit Order Details tab</b></p>
		`;


	}


	/**
	 * Invoke this function when Agree button is clicked on Reinstate Policy Popup
	 * @return {void} 
	 */
	_acceptReinstatePolicy() {
		this.dispatchEvent(new CustomEvent(`accept-policy`, { detail: { policyResponse: this.createPolicyResponse, newContractRef: this.newContractReference } }));
	}

	/**
	 * Get date of birth from ID number
	 * 
	 * @param {String} idNumber idNumber
	 * @returns {String} string
	 */
	_setDOB(idNumber) {
		const birthdate = new Date(idNumber.substring(0, 2), idNumber.substring(2, 4) - 1, idNumber.substring(4, 6));

		if (birthdate.getFullYear() <= new Date().getFullYear() - 100) {
			birthdate.setFullYear(birthdate.getFullYear() + 100);
		}

		const month = birthdate.getMonth() + 1;
		const day = birthdate.getDate();
		const birthDateString = `${birthdate.getFullYear()}-${month <= 9 ? `0${month}` : month}-${day <= 9 ? `0${day}` : day}T00:00:00+00:00`;

		return birthDateString;
	}

	/**
	 * Check Policy rules to see if field may be edited or not
	 * 
	 * @param {String} field field
	 * @param {String} relationship relationship
	 * @returns {boolean} boolean
	 */
	_policyRuleAllowsChange(field, relationship) {
		return policyAllowsEditing(this.policyDetails.policyRule, this.productParams, field, relationship);
	}

	/**
	 * check if roleplayer is a Life Assured as well to deterimine if DoB can be edited
	 * 
	 * @param {object} roleplayer roleplayer
	 * @returns {boolean} boolean
	 */
	_checkBeneficiaryDobRule(roleplayer) {

		if (roleplayer.lifeAssured === false) {
			return true;
		}
		return this._policyRuleAllowsChange(`editDateOfBirth`, roleplayer.relationship);


	}

	/**
	 * on change event for life DoB
	 * @param {*} e e
	 * @param {string} rowID rowID
	 * @returns {void}
	 */
	_lifeDobValueChange(e, rowID) {
		if (e.detail.old !== e.detail.new) {
			this.policyDetails.roleplayers.forEach((rolePlayer, index) => {
				if (rolePlayer.rowID === rowID) {
					this.policyDetails.roleplayers[index].dateOfBirth = e.detail.new.date;
					const wrongTimeZone = this.policyDetails.roleplayers[index].dateOfBirth.includes(`+02:00`);
					if (wrongTimeZone === true) {
						let dob = this.policyDetails.roleplayers[index].dateOfBirth;
						const timezone = `+02:00`;
						dob = dob.replace(timezone, ``);
						this.policyDetails.roleplayers[index].dateOfBirth = dob;
					}

					if (rolePlayer.beneficiary === true) {
						rolePlayer.coverDetails.idNumberErrorMessage = ``;
					} else if (rolePlayer.lifeAssured === true) {
						rolePlayer.coverDetails.idErrorMessageLA = ``;
					}

					if (rolePlayer.lifeAssured === true) {
						this.policyDetails.roleplayers[index].coverDetails = refreshRelationshipCoverDetails(
							this.policyDetails.roleplayers[index].relationship,
							this.productParams,
							this.policyDetails.roleplayers[index].coverAmount,
							index === 0 ? this.maxAllowedCover : 0,
							getAgeFromDob(this.policyDetails.roleplayers[index].dateOfBirth),
							// this.policyDetails.roleplayers[index].age,
							this.policyDetails.roleplayers[index].coverDetails?.isExtendedFamily,
							false
						);
					}

					if (rolePlayer.beneficiary === true) {
						const age = getAgeFromDob(this.policyDetails.roleplayers[index].dateOfBirth);
						if (age < 18) {
							rolePlayer.coverDetails.ageMessage = `Beneficiary must be 18 years or older`;
						} else {
							rolePlayer.coverDetails.ageMessage = ``;
						}
					}

					rolePlayer.idNumber = ``;
				}
			});
		}
		this.requestUpdate();
	}

	/**
	 * determines the alert banner type
	 * @param {string} agreementAccepted agreementAccepted
	 * @returns {string} string
	 */
	_getAlertBannerType(agreementAccepted) {
		let type = `info`;

		if (agreementAccepted === `yes`) {
			type = `success`;
		} else if (agreementAccepted === `no`) {
			type = `unsuccessful-red`;
		}
		return type;
	}

	/**
	 * Construct Validation message if all disclosures are not accepted
	 *  
	 * @returns {html} html content of disclosure validations 
	*/
	_generateDisclosureValidationMessage() {
		return html`<strong>Please accept the following disclosure (s):</strong>
		<ul>
			${this.agreementFCPAccepted !== `yes` ? html`<li>Funeral Cover Plan agreement</li>` : ``}
			${this.agreementYBPAccepted !== `yes` ? html`<li>Beneficiary Paid agreement</li>` : ``}
			${this.agreementYROAAccepted !== `yes` ? html`<li>Responsibility & Accountability agreement</li>` : ``}
			${this.agreementLAAccepted !== `yes` ? html`<li>Lives Assured agreement</li>` : ``}
			${this.agreementYWNBPAccepted !== `yes` ? html`<li>You will not be paid agreement</li>` : ``}
			${this.agreementYPAccepted !== `yes` ? html`<li>You Pay agreement</li>` : ``}
		</ul>`;
	}

	/**
	 * renders the proper DoB field to display
	 * @param {array} roleplayer roleplayer
	 * @returns {html} dob html 
	 */
	_dateOfBirthRenderer(roleplayer) {
		if (this.canReinstate === true || !this._policyRuleAllowsChange(`editDateOfBirth`, roleplayer.relationship)) {
			return html`
				<capitec-text-field label="Date of birth" style="width: 50%" disabled
				value="${formatDateToInsure(roleplayer?.dateOfBirth)}" error="${roleplayer?.coverDetails?.ageMessage}">
				</capitec-text-field>`;
		} else if (isNullorEmpty(roleplayer?.idNumber) || roleplayer?.idNumber.length !== 13 || roleplayer?.coverDetails?.disableDoB === false) {
			return html`
				<capitec-date-time-picker style="width: 50%" label="Date of Birth" type="single" mode="date" inputType="calendar"
					date="${roleplayer?.dateOfBirth}" outputType="string" maxdate="${this.today}" minDate="1901-01-01" 
					@value-change="${(e) => this._lifeDobValueChange(e, roleplayer.rowID)}" error="${roleplayer?.coverDetails?.ageMessage}">
				</capitec-date-time-picker>`;
		}

		return html`
			<capitec-text-field label="Date of birth" style="width: 50%" disabled
				value="${formatDateToInsure(roleplayer?.dateOfBirth)}" error="${roleplayer?.coverDetails?.ageMessage}">
			</capitec-text-field>
		`;


	}

	// #endregion PRIVATE Functions

	// #region RENDERING

	/**
	 * Generates the view stylesheet.
	 *
	 * @readonly
	 * @static
	 * @returns {css} CSS for the view.
	 */
	static get styles() {
		return [
			super.styles,
			css`

			${INSURE_CSS}

			capitec-label[type="Strong"] {
				line-height: 20px;
				--theme-label-strong-font-size: 18px;
				--theme-label-strong-font-weight: 600;
				--theme-label-font-color: #3A3A3A;
			}

			.insure-title-bar{
				margin-bottom: 0px; 
				border-top-left-radius: 5px; 
				border-top-right-radius: 5px;
			}

			.insure-calc-columns{
				display: flex;
				justify-content: stretch;
			}
			.insure-calc-column-left{
				margin: 10px;
				flex: 2 1 520px;
				min-height: calc(100vh - 300px);
			}
			.insure-calc-column-right{
				margin: 10px;
				flex: 1 1 10em;
				align-items: stretch;
				background-color: #f5f5f5;
				border-radius: 5px;
				padding: 10px;
				max-height: 1045px;
				height: fit-content;
			}
			
			.calc-summary-card{
				height: 100%;
				display: flex;
				flex-direction: column;
				justify-content: space-between;
			}
			.calc-premium-total{
				font-size: 32px;
				font-weight: 600;
				color: #3A3A3A;
			}

			.calc-life-list{
				display: flex; 
				justify-content: space-between;
			}

			.calc-card {
				border: 1px solid #e1e1e1;
				border-radius: 5px;
				margin-top: 15px;
			}

			.calc-card-header{
				display: flex;
				justify-content: space-between;

				border-bottom: 1px solid #e1e1e1;
				border-top-right-radius: 5px;
				border-top-left-radius: 5px;
				margin-bottom:10px;
				padding: 15px 15px 15px 15px;
				font-weight: bold;
			}

			.calc-card-row{
				display: flex; 
				justify-content: space-between; 
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			.calc-card-row-test{
				width: 713px;
				padding: 10px 15px 15px 15px; 
			}

			.beneficiary-radio-row{
				display: flex; 
				justify-content: space-between; 
				padding: 10px 15px 15px 15px; 
				gap: 10px;
			}

			.left-card{
				display: flex;
				flex-direction: column;
			}

			.action-image{
				cursor: pointer;
			}

			.stronger{
				font-weight: bolder;
			}

			.link{
				color: #00a9f1;
				cursor: pointer;
			}

			.notif-container{
				background: #daf2f4;
				padding: 15px;
				display: flex;
				justify-content: start;
			}

			.notif-container > .content {
				padding-left: 10px;
			}

			.notif-container > .content .title {
				font-weight: bold;
			}

			.account-details-bar {
				display: flex;
				position: relative;
			}

			.account-details-bar > capitec-expander {
				position: absolute;
				border: 1px solid #e1e1e1;
				border-radius: 5px;
				--theme-container-padding-right: 0px;
				--theme-container-padding-left: 0px;
				--theme-container-padding-top: 0px;
				--theme-container-padding-bottom: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-height: 211px;
				--theme-expander-indicator-width: 11.5px;
				--theme-expander-indicator-height: 6.5px;
				--theme-expander-border: 0px;
				box-shadow:0 3px 6px 0.25px rgba(0,0,0,0.08);
			}

			capitec-group {
				/*width: 93%;*/
				z-index: 10;
				padding-top: 12px;
				padding-bottom: 12px;
				/*border-right: 1px solid #dfdfdf;*/
			}


			.expander-options{
				display: flex; 
				width: 100%;
				justify-content: space-between; 
				padding: 20px 15px 15px 15px; 
				gap: 10px;
			}

			/* Expander header and content styles */
			horizon-expander {
				margin-bottom: 16px;
				--theme-expander-height: auto;
				--theme-layout-gap-spacing: 0px;
				--theme-expander-header-height: 64px;
				--theme-expander-header-padding: 0 6px 0 0;
				--theme-expander-indicator-width: 16px;
			}
			horizon-expander[expanded] {
				box-shadow: 0 6px 10px 0.25px rgb(0 0 0 / 7%);
				display: block;
				--theme-overflow-menu-width: 200px !important;
			}
			.expander-header > capitec-icon {
				--theme-icon-size-default: 20px;
				--theme-layout-gap-spacing: 0px;
				margin-left: 10px;
			}
			.expander-header > capitec-button {
				width: 128px;
			}
			.expander-content {
				border-left: 1px solid #E1E1E1;
				border-bottom: 1px solid #E1E1E1;
				border-right: 1px solid #E1E1E1;
				border-radius: 0px 0px 4px 4px
			}
			.expander-content > capitec-title-bar {
				border-top: 0px;
			}
			.expander-header > horizon-label[label="Status"] {
				--horizon-label-value-color: #70AF00;
				width: 200px;
				text-overflow: ellipsis;
			}
			horizon-label {
				width: 285px;
				padding-left: 16px;
				--theme-layout-gap-spacing: 0px;
				--horizon-label-text-height: 20px;
				--horizon-label-text-color: #3A3A3A;
				--horizon-label-text-line-height: 20px;
				
				--horizon-label-value-height: 20px;
				--horizon-label-value-color: #3A3A3A;
				--horizon-label-value-font-size: 16px;
				--horizon-label-value-line-height: 20px;
			}
			
			.fixed-label-main {
				width: 65%;
				--horizon-label-max-overflow-width: 170px;
			}

			.fixed-label-secondary{
				width: 65%;
				--horizon-label-max-overflow-width: 170px;
			}


			.vertical-line {
				height: 40px;
				width: 1px;
				background-color: #E1E1E1;
			}

			.clickable{
				cursor: pointer;
				--theme-toast-width: 100%;
			}

			capitec-alert-banner{
				--theme-toast-z-index: 1000
			}
			`
		];
	}

	/**
	 * 
	 * @returns {html} html content
	 */
	_webTemplate() {
		return html`
			${this._renderContent()}
			${this._renderDialogs()}
		`;
	}

	/**
	 * Generates the component template for web mode.
	 * @returns {html} The html content of the component.
	 */
	_renderDialogs() {
		return html`
		${this._renderLifeAssuredDialog()}
		${this._renderAddBeneficiariesDialog()}
		${this._renderYBPAgreementDialog()}
		${this._renderFCPAgreementDialog()}
		${this._renderYROAAgreementDialog()}
		${this._renderYWNBPAgreementDialog()}
		${this._renderYPAgreementDialog()}
		${this._renderLAAgreementDialog()}
		${this._renderRemoveLifeAssuredDialog()}
		${this._renderRemoveBeneficiaryDialog()}
		${this._renderUpdatePlanAgreementDialog()}
		${this._renderReinstatePolicyAgreementDialog()}
		${this._renderValidationConfirmDialog()}
		${this._renderUpdateValidationDialog()}
		${this._renderIneligibleLivesDialog()}`;
	}

	/**
	 * Render the content HTML  for the component
	 * @return {html} html
	 */
	_renderContent() {
		return html`
		<capitec-title-bar type="insure" class="insure-title-bar">
			<img class="action-image" src="/images/insure/left-arrow.svg" @click="${() => this._backToSummaryPage()}" />
			<capitec-label label="${this.canReinstate ? `Re-Issue` : `Update Plan #${this.policyDetails.contractReference}`}" type="title"></capitec-label>
			<capitec-spacer></capitec-spacer>
			${this.canReinstate
				? html`<capitec-button label="Re-Issue" type="white" class="capitec-button-medium"
					@click="${() => this._reinstatePolicyPopup()}"></capitec-button>`
				: html`
					${this.selectedTabIndex === 0 ? html`
					<capitec-button label="Calculate" type="white" class="capitec-button-medium"
						@click="${() => this._calculatePremium()}">
					</capitec-button>
					` : html``}
					<capitec-button label="Update Plan" type="white" class="capitec-button-medium"
						@click="${() => this._updatePlanClick()}">
					</capitec-button>
			`}
		</capitec-title-bar>
		
		<!-- .disabled="${this.agreementYROAAccepted === false}" -->
		
		<capitec-card style="min-height: 100vh;">
			<capitec-tab-group @tab-select="${(e) => this._tabChange(e)}">
				${this._renderPremiumTab()}
				${this._renderBeneficiariesTab()}
				${this._renderDebitOrderTab()}
			</capitec-tab-group>
		</capitec-card>
		`;
	}

	/**
	 * render the premium Tab of Update plan
	 * @returns {html} html
	 * 
	 */
	_renderPremiumTab() {
		return html`
		<capitec-tab label="Premium & Cover Amount">
			<div class="insure-calc-columns">
				${this._renderLeftPremiumColumn()}
				${this._renderPremiumCalculator()}
			</div>
		</capitec-tab>
		`;
	}

	/**
	 *  render the left column of the premium tab of Update plan
	 * @returns {html} html
	 */
	_renderLeftPremiumColumn() {
		return html`
			<div class="insure-calc-column-left">
				<div class="left-card">
					${this._renderFCPNotification()}
					<capitec-spacer></capitec-spacer>
					${this._renderLANotification()}
					<capitec-spacer></capitec-spacer>
			
					<!-- Main Life -->
					<div class="calc-card-row">
						<capitec-label label="Main Life" type="strong">
						</capitec-label>
					</div>
			
					<horizon-expander expandButtonAlignment="right">
						<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
							valign="center">
							<horizon-label class="fixed-label-main" data-automation-id="insure-policy-contract-reference"
								label="Main Life" textOverflow="ellipsis"
								value="${this.policyDetails?.roleplayers[0]?.firstName} ${this.policyDetails?.roleplayers[0]?.surname}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label data-automation-id="insure-policy-start-date"
								label="Cover Amount (Min R${this.maxAllowedCover < 5000 ? this.maxAllowedCover : this.policyDetails?.roleplayers[0]?.coverDetails?.minCoverAmount} - Max - R${this.maxAllowedCover})"
								value="${this.policyDetails?.roleplayers[0]?.coverAmount === `` ? `R0.00` : formatCurrency(this.policyDetails?.roleplayers[0]?.coverAmount)}">
							</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								${this._renderMainLifeOptions(this.policyDetails?.roleplayers[0])}
							</capitec-group>
						</div>
					</horizon-expander>
			
					<!-- Add lives Assured Button  -->
					<div class="calc-card-row" style="margin-top: 5px;">
						${this.policyDetails?.roleplayers?.filter(x => x.relationship !== `MainLife` && x.lifeAssured === true)?.length > 0
				? html`
							<capitec-label label="Lives Assured" type="strong" class="stronger">
							</capitec-label>`
				: ``}
						${this.canReinstate ? ``
				: html`<capitec-label label="Add Life Assured" type="subtitle" class="stronger link"
								@click="${() => this._openAddLifeDialog()}">
							</capitec-label>
						`}
					</div>
			
					<!-- Lifes Assured list -->
					${this.policyDetails.roleplayers.map((roleplayer, index) => html` ${roleplayer.relationship !== `MainLife` &&
					roleplayer.lifeAssured === true
					? html`
					${this.canReinstate ? ``
							: html`<capitec-label label="Remove" @click="${() => this._openRemoveLifeAssuredDialog(roleplayer, index)}" type="subtitle"
							class="stronger link" style="position: relative; width: fit-content; left: 613px; top: 43px;">
						</capitec-label>`
						}
			
					<horizon-expander expandButtonAlignment="right">
						<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear" halign="left"
							valign="center">
							<horizon-label class="fixed-label-secondary" 
								label="${roleplayer.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[roleplayer.relationship?.toUpperCase()])}" 
								textOverflow="ellipsis" 
								value="${roleplayer.firstName} ${roleplayer.surname}">
							</horizon-label>
							<div class="vertical-line"></div>
							<horizon-label 
								label="Cover Amount (Min R${roleplayer?.coverDetails?.minCoverAmount} - Max R${roleplayer?.coverDetails?.maxCoverAmount})"
								value="${roleplayer.coverAmount === `` ? `R0.00` : formatCurrency(roleplayer.coverAmount)}">
							</horizon-label>
						</capitec-group>
						<div slot="content">
							<capitec-group class="expander-content" layout="vertical" gap="none" halign="left" valign="center">
								${this._renderLifeAssuredOptions(roleplayer)}
							</capitec-group>
						</div>
					</horizon-expander>
					` : html``}`)}
				</div>
			</div>`;
	}

	/**
	 * Render premium calculator column
	 * @returns {html} html
	 */
	_renderPremiumCalculator() {
		return html`
		<div class="insure-calc-column-right">
			<div class="calc-summary-card">
				<div>
				<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
					<capitec-spacer></capitec-spacer>
					<capitec-label label="Total premium amount"></capitec-label>
					<capitec-label label="${isNullorEmpty(this.currentTotalPremium) ? formatCurrency(0) : formatCurrency(this.currentTotalPremium)}" class="calc-premium-total">
					</capitec-label>
					<!-- top -->
					<capitec-label label="Summary of estimated monthly premium:" class="stronger"></capitec-label>
					<hr>
		
					<!-- life list -->
					${this.policyDetails.roleplayers.filter(ele => ele.lifeAssured === true).map(lifeAssured => html`
						<div class="calc-life-list">
							<capitec-label label="${lifeAssured.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[lifeAssured.relationship?.toUpperCase()])}">
							</capitec-label>
							<capitec-label label="${isNullorEmpty(lifeAssured.premium) ? formatCurrency(0) : formatCurrency(lifeAssured.premium)}"></capitec-label>
						</div>
					<hr>`)}
				</div>
			</div>
		</div>
		`;
	}

	/**
	 * render the beneficiaries tab of Update plan
	 * @returns {html} html content
	 */
	_renderBeneficiariesTab() {
		return html`
			<capitec-tab label="Beneficiaries">
				<div class="insure-calc-columns">
					<div class="insure-calc-column-left">
						<div class="left-card">
			
							<!-- Notifications -->
							${this._renderYBPNotification()}
							<capitec-spacer></capitec-spacer>
							${this._renderYWNBPNotification()}
							<capitec-spacer></capitec-spacer>
							
			
							<!--Beneficiaries -->
							<div class="calc-card-row" style="margin-top: 15px;">
								${this.policyDetails?.roleplayers?.filter(x => x.beneficiary === true)?.length > 0
				? html`
									<capitec-label label="Beneficiaries" type="strong" class="stronger">
									</capitec-label>`
				: ``}
								${this.canReinstate ? ``
				: this._renderAddBeneficiaryButton()
			}
							</div>

							<!-- Beneficiaries -->
							${this.policyDetails.roleplayers.map((beneficiary) => html` ${beneficiary.beneficiary === true
				? html`
									${this.canReinstate ? ``
						: html`<capitec-label label="Remove" @click="${() => this._openRemoveBeneficiaryDialog(beneficiary)}"
										type="subtitle" class="stronger link"
										style="position: relative; width: fit-content; left: 613px; top: 43px;">
										</capitec-label>`
					}
									<horizon-expander expandButtonAlignment="right">
										<capitec-group class="expander-header" slot="custom-header" layout="horizontal" gap="clear"
											halign="left" valign="center">
											<horizon-label class="fixed-label-secondary" 
												label="${beneficiary.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[beneficiary.relationship?.toUpperCase()])}"
												textOverflow="ellipsis" value="${beneficiary.firstName} ${beneficiary.surname}">
											</horizon-label>
											<div class="vertical-line"></div>
											<horizon-label label="Payout Amount (Max ${this.policyDetails.roleplayers[0].coverAmount !== `` ? formatCurrency(this.policyDetails.roleplayers[0].coverAmount, 2) : formatCurrency(0)})"
												value="${beneficiary?.benefitPayout === `` ? `R0.00` : formatCurrency(beneficiary?.benefitPayout)}">
											</horizon-label>
										</capitec-group>
										<div slot="content">
											<capitec-group class="expander-content" layout="vertical" gap="none" halign="left"
												valign="center">
												${this._renderBeneficiaryOptions(beneficiary)}
											</capitec-group>
										</div>
									</horizon-expander>` : html``}`)}
						</div>
					</div>
					${this._renderCoverCalculator()}
				</div>
			</capitec-tab>
		`;
	}

	/**
	 * render the Add beneficiary button if not over max limit
	 * @returns {html} html content
	 */
	_renderAddBeneficiaryButton() {
		if (this._totalBeneficiaries() < 3) {
			return html`
				<capitec-label label="Add Beneficiary" type="subtitle" class="stronger link"
					@click="${() => this._openAddBeneficiariesDialog()}"
					disabled="${this.policyDetails.roleplayers.filter(ele => ele.beneficiary === true).length >= 2}">
				</capitec-label>
			`;
		}
		return html``;

	}

	/**
	 * render the Debit order tab of the Update plan
	 * @returns {html} html content
	 */
	_renderDebitOrderTab() {
		return html`
		<capitec-tab label="Debit Order Details">
		
			<div class="insure-calc-columns">
		
				<div class="insure-calc-column-left">
					<div class="left-card">
						<!-- notifications -->
						${this._renderYROANotification()}
						<capitec-spacer></capitec-spacer>
						${this._renderYPNotification()}
						<capitec-spacer></capitec-spacer>
		
						<!-- Collection account card -->
						<div class="calc-card">
							<div class="calc-card-header">
								<capitec-label type="subtitle" class="stronger" label="Collection Account"
									style="padding: 10px;">
								</capitec-label>
							</div>
		
							<div class="calc-card-row">
								<capitec-select label="Bank" .items="${this.bankOptions}" display-field="text" id-field="code"
									style="width: 50%" value="${this._getBank()}" 
									?disabled = "${Boolean(this.canReinstate)}"
									@value-changed = "${(e) => this._selectedBankChange(e)}">
								</capitec-select>
								<capitec-text-field label="Account Number" type="numeric" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.accountNumber}"
									error = "${this.accountNumErrorMsg}"
									?disabled = "${Boolean(this.canReinstate)}"
									@value-changed = "${(e) => this._accountNumberChange(e)}">
								</capitec-text-field>
							</div>
		
							<div class="calc-card-row">
								<capitec-select label="Account Type" .items="${this.accountTypeOptions}" display-field="text"
									id-field="code" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.accountType}"
									?disabled = "${Boolean(this.canReinstate)}">
								</capitec-select>
								<capitec-text-field label="Branch Code" type="numeric" style="width: 50%"
									value="${this.policyDetails.deductionDetails?.bankDetails?.branchCode}"
									error = "${this.branchCodeErrorMsg}"
									?disabled = "${this.disableBranchCode}"
									@value-changed = "${(e) => this._branchCodeChange(e)}">
								</capitec-text-field>
							</div>
		
							<div class="calc-card-row-test">
								<capitec-select label="Debit order day" 
									display-field="text" id-field="text" 
									style="width: 50%" 
									?disabled="${this.canReinstate}"
									.items="${this.debitOrderDayOptions}"
									.value="${this._getCollectionDay()}" 
									@value-changed = "${(e) => this._debitOrderDayChange(e)}">
								</capitec-select>
							</div>
						</div>
					</div>
				</div>
		
				${this._renderPremiumCalculator()}
		
		
			</div>
		</capitec-tab>
		`;
	}

	/**
	 * Render Cover calculator
	 * @returns {html} html content
	 */
	_renderCoverCalculator() {
		return html`
			<div class="insure-calc-column-right">
				<div class="calc-summary-card">
					<div>
						<!-- top -->
						<capitec-label label="Funeral Plan" type="Strong"></capitec-label>
						</capitec-label>
						<capitec-spacer></capitec-spacer>
						<capitec-label label="Total benefit payout"></capitec-label>
						<capitec-label label="${formatCurrency(this.policyDetails.roleplayers[0].coverAmount)}" class="calc-premium-total">
						</capitec-label>
						<capitec-label label="Summary of payout beneficiary amount:" class="stronger"></capitec-label>
						<hr>
			
						<!-- Beneficiaries list -->
						${this.policyDetails.roleplayers.filter(ele => ele.beneficiary === true).map(beneficiary => html`
						<div class="calc-life-list">
							<capitec-label label="${beneficiary.relationship?.toUpperCase() === `COUSINSCHILD` ? `First Cousin's Child` : formatStringAsPascalCase(ROLE_PLAYER_RELATIONSHIP[beneficiary.relationship?.toUpperCase()])}"></capitec-label>
							<capitec-label label="${beneficiary.benefitPayout === `` ? `R0.00` : formatCurrency(beneficiary.benefitPayout)}"></capitec-label>
						</div>
						<hr>`)}
					</div>
				</div>
			</div>
		`;
	}

	/** NOTIFICATIONS */

	/**
		 * Render notification component for 'Your responsibility & our accountability'
		 * 
		 * @returns {html} The html content of the component.
		 */
	_renderYROANotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`YROA`)}"
			type="${this._getAlertBannerType(this.agreementYROAAccepted)}" header="Disclosure:"
			label="I agree to Your Responsibility & Our Accountability agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render notification component for 'Funeral Cover Plan'
	 * @returns {html} html content
	 */
	_renderFCPNotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`FCP`)}"
			type="${this._getAlertBannerType(this.agreementFCPAccepted)}" header="Disclosure:"
			label="I agree to Funeral cover plan agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render notification component for 'Lives Assured'
	 * @returns {html} html content
	 */
	_renderLANotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`LA`)}"
			type="${this._getAlertBannerType(this.agreementLAAccepted)}" header="Disclosure:"
			label="I agree to Lives Assured agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render notification component for 'You/your beneficiary are paid'
	 * @returns {html} html content
	 */
	_renderYBPNotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`YBP`)}"
			type="${this._getAlertBannerType(this.agreementYBPAccepted)}" header="Disclosure:"
			label="I agree to You/your beneficiary are paid agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render notification component for 'You will not be paid'
	 * @returns {html} html content
	 */
	_renderYWNBPNotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`YWNBP`)}"
			type="${this._getAlertBannerType(this.agreementYWNBPAccepted)}" header="Disclosure:"
			label="I agree to You will not be paid agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render notification component for 'You will not be paid'
	 * @returns {html} html content
	 */
	_renderYPNotification() {
		return html`
		<capitec-alert-banner class="clickable" @click="${() => this._openAgreement(`YP`)}"
			type="${this._getAlertBannerType(this.agreementYPAccepted)}" header="Disclosure:"
			label="I agree to You Pay agreement disclosure">
		</capitec-alert-banner>`;
	}

	/**
	 * Render Main Life options
	 * @param {object} roleplayer roleplayer
	 * @returns {html} The html content of the Main Life Expander options
	 */
	_renderMainLifeOptions(roleplayer) {
		return html`
			<div class="expander-options">
				<capitec-select label="Title" .items="${this.titleOptions}" display-field="text" id-field="code" style="width: 50%"
					disabled value="${roleplayer?.title}">
				</capitec-select>
			
				<capitec-text-field label="Name" style="width: 50%" disabled value="${roleplayer?.firstName}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Surname" style="width: 50%" disabled value="${roleplayer?.surname}">
				</capitec-text-field>
			
				<capitec-text-field label="Email Address" style="width: 50%" disabled value="${roleplayer?.contactDetails?.email}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-select label="Gender" .items="${this.genderOptions}" display-field="text" id-field="code"
					style="width: 50%" disabled value="${roleplayer?.gender}">
				</capitec-select>
			
				<capitec-text-field label="ID" style="width: 50%" disabled value="${roleplayer?.idNumber}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Date of birth" style="width: 50%" disabled
					value="${formatDateToInsure(roleplayer?.dateOfBirth)}">
				</capitec-text-field>
			
				<capitec-text-field 
					label="Cover amount" style="width: 50%" type="currency" 
					value="${roleplayer?.coverAmount}"
					?disabled = "${Boolean(this.canReinstate) || !this._policyRuleAllowsChange(`editLifeAssuredValues`, roleplayer.relationship)}"
					hint="R${this.maxAllowedCover < 5000 ? this.maxAllowedCover : roleplayer?.coverDetails?.minCoverAmount} - R${this.maxAllowedCover}"
					error="${roleplayer?.coverDetails?.coverMessage}"
					@value-changed="${(e) => this._lifeCoverAmountValueChanged(e, roleplayer.rowID)}">
				</capitec-text-field>
			</div>
		`;
	}

	/**
	 * Render Life Assured options - List of lives roleplayers that have "lifeAssured"=true
	 * @param {*} roleplayer roleplayer
	 * @returns {html} The html content of the Life Assured expander options
	 */
	_renderLifeAssuredOptions(roleplayer) {
		return html`
			<div class="expander-options">
				<capitec-select label="Title" display-field="text" id-field="code" style="width: 50%" value="${roleplayer?.title}" 
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editTitle`, roleplayer.relationship)}"
					error="${roleplayer?.coverDetails?.titleErrorMessageLA === undefined ? `` : roleplayer?.coverDetails.titleErrorMessageLA}"
					.items="${this.titleOptions}" 
					@value-changed="${(e) => this._lifeTitleValueChanged(e, roleplayer.rowID)}">
				</capitec-select>

				<capitec-select label="Gender"  display-field="text" id-field="code" style="width: 50%" 
					value="${roleplayer?.gender}" ?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editGender`, roleplayer.relationship)}"
					error="${roleplayer?.coverDetails?.genderErrorMessageLA === undefined ? `` : roleplayer?.coverDetails.genderErrorMessageLA}"
					.items="${this.genderOptions}"
					@value-changed="${(e) => this._lifeGenderValueChanged(e, roleplayer.rowID)}">
				</capitec-select>
			</div>
			</div>
			<div class="expander-options">
				<capitec-text-field type="text" label="Name" style="width: 50%" value="${roleplayer?.firstName}"
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editFirstName`, roleplayer.relationship)}"
					@value-changed="${(e) => this._lifeNameValueChanged(e, roleplayer.rowID)}"
					error="${roleplayer?.coverDetails?.firstNameErrorMessage === undefined ? `` : roleplayer?.coverDetails.firstNameErrorMessage}">
				</capitec-text-field>
			
				<capitec-text-field label="Surname" style="width: 50%" value="${roleplayer?.surname}"
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editSurname`, roleplayer.relationship)}"
					@value-changed="${(e) => this._lifeSurnameValueChanged(e, roleplayer.rowID)}"
					error="${roleplayer?.coverDetails?.surnameErrorMessage === undefined ? `` : roleplayer?.coverDetails.surnameErrorMessage}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Middle Names" style="width: 50%" 
					value="${isNullorEmpty(roleplayer?.middleName) ? `` : roleplayer?.middleName}"
					?disabled="${this.canReinstate}"
					@value-changed="${(e) => this._lifeMiddleNameValueChanged(e, roleplayer.rowID)}">
				</capitec-text-field>
			
				<capitec-text-field label="Cover amount" style="width: 50%" type="currency" 
					value="${roleplayer?.coverAmount <= 0 ? `` : roleplayer?.coverAmount}" 
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editLifeAssuredValues`, roleplayer.relationship)}" 
					@value-changed="${(e) => this._lifeCoverAmountValueChanged(e, roleplayer.rowID)}"
					hint="R${roleplayer?.coverDetails?.minCoverAmount} - R${roleplayer?.coverDetails?.maxCoverAmount}"
					error="${roleplayer?.coverDetails?.coverMessage}"
					>
				</capitec-text-field>
			</div>
			<div class="expander-options">

				${this._dateOfBirthRenderer(roleplayer)}
				
				<capitec-text-field label="ID" type="numeric" maxlength="13" style="width: 50%" 
					value="${isNullorEmpty(roleplayer?.idNumber) ? `` : roleplayer?.idNumber}" 
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editIDNumber`, roleplayer.relationship) || this.policyDetails.policyRule !== `Standard`}"
					error="${roleplayer?.coverDetails?.idErrorMessageLA === undefined ? `` : roleplayer?.coverDetails.idErrorMessageLA}"
					@value-changed="${(e) => this._lifeIDValueChanged(e, roleplayer.rowID)}">
				</capitec-text-field>
			</div>
			<div class="expander-options">
				<capitec-text-field label="Cellphone number" style="width: 50%" maxlength = "10" type="numeric"
					value="${isNullorEmpty(roleplayer?.contactDetails?.cellphone) ? `` : roleplayer?.contactDetails?.cellphone}" 
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editContactDetails`, roleplayer.relationship)}"
					error="${roleplayer?.coverDetails?.cellphoneNumberErrorMessage === undefined ? `` : roleplayer?.coverDetails?.cellphoneNumberErrorMessage}"
					@value-changed="${(e) => this._lifeCellphoneValueChanged(e, roleplayer.rowID)}">
				</capitec-text-field>
			
				<capitec-text-field label="Email Address" style="width: 50%" 
					value="${isNullorEmpty(roleplayer?.contactDetails?.email) ? `` : roleplayer?.contactDetails?.email}" 
					?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editContactDetails`, roleplayer.relationship)}"
					error="${roleplayer?.coverDetails?.emailAddressErrorMessage === undefined ? `` : roleplayer?.coverDetails?.emailAddressErrorMessage}"
					@value-changed="${(e) => this._lifeEmailValueChanged(e, roleplayer.rowID)}">
				</capitec-text-field>
			</div>
		`;
	}

	/**
	 * Render Beneficiary options
	 * @param {*} roleplayer role player
	 * @returns {html} The html content of the Beneficiary expander options
	 */
	_renderBeneficiaryOptions(roleplayer) {
		return html`
		<div class="expander-options">
			<capitec-select label="Title" display-field="text" id-field="code" style="width: 50%" value=${roleplayer.title} 
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editTitle`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.titleErrorMessage === undefined ? `` : roleplayer?.coverDetails.titleErrorMessage}"
				.items="${this.titleOptions}"
				@value-changed= "${(e) => this._lifeTitleValueChanged(e, roleplayer.rowID)}">
			</capitec-select>
			
			<capitec-select label="Gender" display-field="text" id-field="code" style="width: 50%" value=${roleplayer.gender}
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editGender`, roleplayer.relationship)}"
				.items="${this.genderOptions}"
				@value-changed="${(e) => this._lifeGenderValueChanged(e, roleplayer.rowID)}">
			</capitec-select>
		</div>
		<div class="expander-options">
			<capitec-text-field label="Name" style="width: 50%" value=${roleplayer.firstName}
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editFirstName`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.firstNameErrorMessage === undefined ? `` : roleplayer?.coverDetails.firstNameErrorMessage}"
				@value-changed= "${(e) => this._lifeNameValueChanged(e, roleplayer.rowID)}">
			</capitec-text-field>
			<capitec-text-field label="Surname" style="width: 50%" value=${roleplayer.surname}
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editSurname`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.surnameErrorMessage === undefined ? `` : roleplayer?.coverDetails.surnameErrorMessage}"
				@value-changed= "${(e) => this._lifeSurnameValueChanged(e, roleplayer.rowID)}">
			</capitec-text-field>
	
		</div>
		<div class="expander-options">
			${this.canReinstate === true || !this._checkBeneficiaryDobRule(roleplayer)
				? html`
					<capitec-text-field label="Date of birth" style="width: 50%" disabled
						value="${formatDate(roleplayer?.dateOfBirth)}">
					</capitec-text-field>`
				: html`
					
					<capitec-date-time-picker label="Date of Birth" type="single" mode="date" inputType="calendar"
						date="${roleplayer.dateOfBirth}" outputType="string" maxdate="${this.today}"  minDate="1901-01-01"
						value=${formatDate(roleplayer.dateOfBirth)} style="width: 50%"
						error="${roleplayer?.coverDetails?.ageMessage}"
						?disabled="${this.canReinstate}" 
						@value-changed="${(e) => this._lifeDobValueChange(e, roleplayer.rowID)}">
					</capitec-date-time-picker>`
			}
			
			<capitec-text-field label="ID" style="width: 50%" 
				value="${isNullorEmpty(roleplayer?.idNumber) ? `` : roleplayer?.idNumber}" type="numeric" maxlength="13"
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editIDNumber`, roleplayer.relationship) || this.policyDetails.policyRule !== `Standard`}"
				error="${roleplayer?.coverDetails?.idNumberErrorMessage === undefined ? `` : roleplayer?.coverDetails?.idNumberErrorMessage}"
				@value-changed = "${(e) => this._lifeIDValueChanged(e, roleplayer.rowID)}" >
			</capitec-text-field>
		</div>

		<div class="expander-options">
			
			<capitec-text-field type="currency" label="Payout amount" style="width: 50%" 
				value=${roleplayer?.benefitPayout <= 0 ? `` : roleplayer?.benefitPayout} ?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editBeneficiaryValues`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.benefitPayoutErrorMessage === `` ? `` : roleplayer?.coverDetails?.benefitPayoutErrorMessage}"
				@value-changed="${(e) => this._beneficiaryPayoutValueChanged(e, roleplayer.rowID)}">
			</capitec-text-field>
		
			<capitec-text-field label="Email Address" style="width: 50%" 
				value=${isNullorEmpty(roleplayer.contactDetails?.email) ? `` : roleplayer.contactDetails?.email} 
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editContactDetails`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.emailAddressErrorMessage === undefined ? `` : roleplayer?.coverDetails?.emailAddressErrorMessage}"
				@value-changed= "${(e) => this._lifeEmailValueChanged(e, roleplayer.rowID)}">
			</capitec-text-field>

		</div>
		<div class="expander-options">

			<capitec-text-field label="Cellphone number" style="width: 50%" type="numeric" maxlength="10"
				value=${isNullorEmpty(roleplayer.contactDetails?.cellphone) ? `` : roleplayer.contactDetails?.cellphone} 
				?disabled="${this.canReinstate || !this._policyRuleAllowsChange(`editContactDetails`, roleplayer.relationship)}"
				error="${roleplayer?.coverDetails?.cellphoneNumberErrorMessage === undefined ? `` : roleplayer?.coverDetails?.cellphoneNumberErrorMessage}"
				@value-changed= "${(e) => this._lifeCellphoneValueChanged(e, roleplayer.rowID)}">
			</capitec-text-field>
			
		</div>`;
	}

	/** DIALOGS */

	/**
	 * Render Dialog to add Life assured to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderLifeAssuredDialog() {
		return this.showAddRelationshipDialog === false ? ``
			: html`
			<horizon-insure-add-life-dialog 
				.currentLifesAssured="${this.policyDetails.roleplayers}" 
				.productParams="${this.productParams}"
				@add-new-life="${(e) => this._addLife(e)}" 
				@close-modal="${(e) => this._closeAddLifeDialog(e)}">
			</horizon-insure-add-life-dialog>`;
	}

	/**
	 * Render Dialog to remove Life assured from Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderRemoveLifeAssuredDialog() {
		return this.showRemoveLifeAssuredDialog === false ? ``
			: html`
		<horizon-insure-remove-life-assured-dialog 
			.lifeToRemoveDescription="${this.lifeAssuredToRemoveDescription}"
			@agree-click="${() => this._removeLifeAssured()}"
			@close-modal="${() => this._closeRemoveLifeAssuredDialog()}">
		</horizon-insure-remove-life-assured-dialog>
		`;
	}

	/**
	 * Render Dialog to remove a beneficiary from update plan
	 * 
	 * @returns {html} html of the document
	 */
	_renderRemoveBeneficiaryDialog() {
		return this.showRemoveBeneficiaryDialog === false ? ``
			: html`
		<horizon-insure-remove-beneficiary-dialog 
			.beneficiaryToRemoveDescription="${this.beneficiaryToRemoveDescription}"
			@agree-click="${() => this._removeBeneficiary()}"
			@close-modal="${(e) => this._closeRemoveBeneficiaryDialog(e)}" >
		</horizon-insure-remove-beneficiary-dialog>
		`;
	}

	/**
	 * Render Dialog to add beneficiaries to Update Plan
	 * @return {html} Html of the dialog
	 */
	_renderAddBeneficiariesDialog() {
		return this.showAddBeneficiariesDialog === false ? html``
			: html`
		<horizon-insure-add-beneficiary-dialog
			.roleplayerLength="${this.roleplayerLength}"
			.rolePlayers="${this.policyDetails.roleplayers}"
			.lifesAssured="${this.policyDetails.roleplayers.filter(ele => ele.lifeAssured === true && ele.beneficiary === false && ele.relationship !== `MainLife`)}"
			@add-click="${(e) => this._addBeneficiaryClick(e)}" 
			@close-modal="${() => this._closeAddBeneficiariesDialog()}">
		</horizon-insure-add-beneficiary-dialog>
		`;
	}

	/**
	 * render Dialog for YBP Agreement
	 * @returns {html} html content
	 */
	_renderYBPAgreementDialog() {
		return this.showYBPAgreementDialog === false ? `` : html`
		<horizon-insure-ybp-agreement-dialog 
			@agreementAccepted="${() => this._acceptYBPAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.YBP_NOTIFICATION)}">
		</horizon-insure-ybp-agreement-dialog>`;
	}


	/**
	 * render Dialog for FCP Agreement
	 * @returns {html} html content
	 */
	_renderFCPAgreementDialog() {
		return this.showFCPAgreementDialog === false ? `` : html`
		<horizon-insure-fcp-agreement-dialog 
			@agreementAccepted="${() => this._acceptFCPAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.FCP_NOTIFICATION)}">
		</horizon-insure-fcp-agreement-dialog>`;
	}

	/**
	 * render Dialog for LA Agreement
	 * @returns {html} html content
	 */
	_renderLAAgreementDialog() {
		return this.showLAAgreementDialog === false ? `` : html`
		<horizon-insure-la-agreement-dialog 
			@agreementAccepted="${() => this._acceptLAAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.LA_NOTIFICATION)}">
		</horizon-insure-la-agreement-dialog>`;
	}

	/**
	 * render Dialog for YWNBP Agreement
	 * @returns {html} html content
	 */
	_renderYWNBPAgreementDialog() {
		return this.showYWNBPAgreementDialog === false ? `` : html`
		<horizon-insure-ywnbp-agreement-dialog 
			@agreementAccepted="${() => this._acceptYWNBPAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.YWNBP_NOTIFICATION)}">
		</horizon-insure-ywnbp-agreement-dialog>`;
	}

	/**
	 * render Dialog for YWNBP Agreement
	 * @returns {html} html content
	 */
	_renderYPAgreementDialog() {
		return this.showYPAgreementDialog === false ? `` : html`
		<horizon-insure-yp-agreement-dialog 
			@agreementAccepted="${() => this._acceptYPAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.YP_NOTIFICATION)}">
		</horizon-insure-yp-agreement-dialog>`;
	}

	/**
	* Render Dialog for YROA Agreement
	* @returns {html} html content
	*/
	_renderYROAAgreementDialog() {
		return this.showYROAAgreementDialog === false ? `` : html`
		<horizon-insure-yroa-agreement-dialog 
			@agreementAccepted="${() => this._acceptYROAAgreement()}"
			@close-modal="${() => this._cancelDisclosureDialog(INSURE_DISCLOSURE_TYPE.YROA_NOTIFICATION)}">
		</horizon-insure-yroa-agreement-dialog>`;
	}

	/** 
	 * render dialog for update plan agreement
	 * @return {html} html
	 */
	_renderUpdatePlanAgreementDialog() {
		return this.showUpdatePlanAgreementDialog === false ? `` : html`
		<horizon-insure-update-plan-agreement-dialog 
			.planAgreementContent="${this.planAgreementContent}" 
			.contractReference="${this.policyDetails.contractReference}"
			@update-plan-agree-click="${() => this._acceptUpdatedPlan()}" 
			@close-modal="${() => this._closeUpdatePlanAgreementDialog()}">
		</horizon-insure-update-plan-agreement-dialog>`;
	}

	/** 
	 * render dialog for reinstate policy agreement
	 * @return {html} html
	 */
	_renderReinstatePolicyAgreementDialog() {
		return this.showReinstatePolicyAgreementDialog === false ? `` : html`
		<horizon-insure-reinstate-policy-agreement-dialog 
			.issuePlanAgreementContent="${this.issuePlanAgreementContent}" 
			.contractReference = "${this.newContractReference}"
			@reinstate-close-modal = "${() => this.showReinstatePolicyAgreementDialog = false}"
			@reinstate-agree-click = "${() => this._acceptReinstatePolicy()}" >
		</horizon-insure-reinstate-policy-agreement-dialog>`;
	}

	/**
	* Render Dialog for Validation confirmation
	* @returns {html} html content
	*/
	_renderValidationConfirmDialog() {
		return this.showValidationConfirmDialog === false ? `` : html`
		<horizon-insure-confirmation-dialog 
			@confirmation-click="${() => this.showValidationConfirmDialog = false}"
			.confirmationMessage = "${this.disclosureValidationMessage}">
		</horizon-insure-confirmation-dialog>`;
	}

	/**
	* Render Dialog for Validation confirmation
	* @returns {html} html content
	*/
	_renderUpdateValidationDialog() {
		return this.showUpdateValidationDialog === false ? `` : html`
			<horizon-insure-update-validation-dialog 
				.validationMessage = "${this.onUpdateValidationMessage}"
				@confirmation-click="${() => this.showUpdateValidationDialog = false}">
			</horizon-insure-update-validation-dialog>
		
		`;
	}

	/**
	 * Render Dialog for Ineligible lives dialog 
	 * @returns {html} html content
	 */
	_renderIneligibleLivesDialog() {
		return this.showIneligibleLivesDialog === false ? `` : html`
			<horizon-insure-ineligible-lives-dialog 
				.ineligibleRoleplayers = "${this.policyDetails.ineligibleRoleplayers}"
				@confirmation-click="${() => this.showIneligibleLivesDialog = false}"
				@cancel-click = "${() => this._backToSummaryPage()}" >
			</horizon-insure-ineligible-lives-dialog>
		
		`;
	}

	// #endregion
}

window.customElements.define(`horizon-insure-update-plan`, UpdatePlan);

/**
 * When back arrow button is clicked
 *
 * @example
 * <horizon-insure-update-plan ... @navigate-back="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#navigate-back
 * @type {Object} - N/A
 */

/**
 * Initiate Update Plan API calls
 *
 * @example
 * <horizon-insure-update-plan ... @update-plan-create="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#update-plan-create
 * @type {Object} - N/A
 */

/**
 * raise Accept Plan event when Agree button is clicked on Reinstate Popup
 *
 * @example
 * <horizon-insure-update-plan ... @accept-policy="${this._handler}"></horizon-insure-update-plan>
 *
 * @event UpdatePlan#accept-policy
 * @type {Object} - N/A
 */