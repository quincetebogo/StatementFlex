import { Component, css, html } from 'platform/elements';
import { EventAggregator, Logger } from 'platform/core';
import { CallHandleService } from 'app/services/CallHandleService';
import { CallerDetails } from 'app/models/CallerDetails';
import { CallerInformation } from 'app/models/CallerInformation';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IDCallerEvents } from 'app/constants/telemetry/events/IdentifyCaller';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { RoleManager } from 'app/shell/RoleManager';
import { SEARCH_OPTIONS } from 'app/constants/SearchOptions';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

import 'app/components/common/HorizonSelect';
import 'app/components/common/CallerDialog';
import 'app/components/dialogs/common/EndCallSession';


const RENDER_MODE = Object.freeze({
	SEARCH_CALLER: 0,
	END_CALL: 1
});

const CLIENT_TYPE = Object.freeze({
	CAPITEC_CLIENT: 0,
	NON_CLIENT: 1,
	BRANCH: 2
});

// ToDO: Below const need to be removed, once channelService fix the issue on contract.
// These error messages has to come from service
const ERROR_MESSAGES = {
	SYSTEM_ERROR: html`<b>System error:</b> Please try again later`,
	STRACK_ERROR: `Take note: A system error has occured. Please go to STrack to search for client.`,
	NONCLIENT_REQUIRED_FIELDS_EMPTY: `Name and surname must be completed`,
	REQUIRED_FIELDS_EMPTY: `All fields are required`,
	INVALID_BRANCH: `Invalid branch code`,
	NOT_FOUND: {
		0: {
			ALERT_BANNER: `ID/Passport number not found. This is not a valid ID/Passport number`,
			FIELD_ERROR: `ID/Passport number not found`
		},
		1: {
			ALERT_BANNER: `Foreign passport number not found. This is not a valid foreign passport number`,
			FIELD_ERROR: `Foreign passport number not found`
		},
		2: {
			ALERT_BANNER: `Account number not found. This is not a valid account number`,
			FIELD_ERROR: `Account number not found`
		},
		3: {
			ALERT_BANNER: `Reference number not found. This is not a valid reference number`,
			FIELD_ERROR: `Reference number not found`
		},
		4: {
			ALERT_BANNER: `Cellphone number not found. This is not a verified Capitec number`,
			FIELD_ERROR: `Cellphone number not found`
		}
	}
};

const NONCLIENT_REGEX_PATTERN = {
	CHARACTER_ERROR: `Invalid Special Character(s)`,
	ALERT_BANNER_CHARACTER_ERROR: `Invalid Special Character(s)`,
	nameValue: {
		PATTERN: /^[A-Za-z\s-]+$/,
		FIELD_ERROR: `Enter a name`,
		ALERT_BANNER: `Name and surname must be completed`
	},
	surNameValue: {
		PATTERN: /^[A-Za-z\s-]+$/,
		FIELD_ERROR: `Enter a surname`,
		ALERT_BANNER: `Name and surname must be completed`
	},
	cellPhoneNumberValue: [
		{
			PATTERN: /^[0-9]{10}$/,
			FIELD_ERROR: `Must be 10 digits`,
			ALERT_BANNER: `Incorrect cellphone number`
		},
		{
			PATTERN: /^0[0-9].*$/,
			FIELD_ERROR: `Incorrect cellphone number`,
			ALERT_BANNER: `Incorrect cellphone number`
		}
	]
};

const BRANCH_REGEX_PATTERN = {
	cpNumber: {
		PATTERN: /^([0-9]{6}$)/,
		FIELD_ERROR: `Must be 6 digits`,
		ALERT_BANNER: `Incorrect CP number, i.e. 345679 6 digits only`
	},
	branchName: {
		PATTERN: /BR[0-9]{3,9}$/,
		FIELD_ERROR: `Consultant might not have a branch`,
		ALERT_BANNER: `Invalid branch code`
	}
};

const REGEX_PATTERNS = {
	0: {
		PATTERN: /^(^[MDAT]([0-9]{8})|[0-9]{13})$/,
		FIELD_ERROR: `An ID Number must be 13 digits long, a passport number must be 9 characters`,
		ALERT_BANNER: `Incorrect ID/Passport number`
	},
	1: {
		PATTERN: /^\S+$/,
		FIELD_ERROR: `Incorrect Passport number`,
		ALERT_BANNER: `Incorrect Passport number`
	},
	2: {
		PATTERN: /^[0-9]{10}$/,
		FIELD_ERROR: `Account number must be 10 characters long`,
		ALERT_BANNER: `Incorrect Account number`
	},
	3: {
		PATTERN: /^[0-9]{8}$/,
		FIELD_ERROR: `Reference number must be 8 characters long`,
		ALERT_BANNER: `Incorrect Reference number`
	},
	4: {
		PATTERN: /^[0-9]{10}$/,
		FIELD_ERROR: `Enter a 10 digit cellphone number`,
		ALERT_BANNER: `Incorrect Capitec cellphone number`
	}
};

const HEADER_LABEL = `Search Caller Details`;

/**
 * Search Dialog for all needs except Stop Card. Stop Card has a specialized search dialog.
 * 
 * Events Raised 
 * -------------
 * non-client-captured
 * client-identified
 * stop-card-need-selected
 *
 * @export
 * @class SearchCaller
 * @extends {Component}
 */
export class SearchCaller extends Component {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		RegExp();

		this.renderMode = RENDER_MODE.SEARCH_CALLER;
		this.isBusy = false;
		this.clientType = -1;
		this.errMessage = {
			searchType: ``,
			searchValue: ``,
			nameValue: ``,
			surNameValue: ``,
			cellPhoneNumberValue: ``,
			cpNumber: ``,
			consultantName: ``,
			branchName: ``,
			inBranch: ``
		};

		this.alertBannerMessage = ``;

		this.headerLabel = HEADER_LABEL;

		this.searchType = { "key": ``, "value": `` };
		this.searchValue = ``;
		this.nameValue = ``;
		this.surNameValue = ``;
		this.cellPhoneNumberValue = ``;

		this.cpNumber = ``;
		this.consultantName = ``;
		this.branchName = ``;
		this.branchCode = ``;
		this.clientInBranch = null;
		this.isClientVerifiedInBranch = null;

		this.logger = Logger.getInstance();

		this.eventAggregator = EventAggregator.getInstance();
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.roleManager = RoleManager.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._handleSearchClientException(ex));
		this.incidentService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._handleAddNonClientException(ex));
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * @property {Object} incomingCallDetails Incoming Caller Information (see models/IncomingCallDetails)
	 * @property {object} incidentDetails Incident details
	 *
	 * @readonly
	 * @static
	 * @memberof SearchCaller
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			incidentDetails: { type: Object },

			isBusy: { attribute: false },
			renderMode: { attribute: false },
			clientType: { attribute: false },
			alertBannerMessage: { attribute: false },
			identificationMethods: { attribute: false },
			cpNumber: { type: String, attribute: false },
			consultantName: { type: String, attribute: false },
			branchName: { type: String, attribute: false },
			branchCode: { type: String, attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.identificationMethods = SEARCH_OPTIONS;
		this.renderMode = RENDER_MODE.SEARCH_CALLER;

		this._telemetry.startSpan(IDCallerEvents.SEARCH_CLIENT, {
			"screen": TelemetryScreen.SEARCH_CLIENT
		});
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		this._telemetry.endSpan(IDCallerEvents.SEARCH_CLIENT, {
			"screen": TelemetryScreen.SEARCH_CLIENT
		});
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_clientTypeChanged(e) {
		if (e.detail.new) {
			if (e.target.id === `capitecClient`) {
				this.clientType = CLIENT_TYPE.CAPITEC_CLIENT;
			} else if (e.target.id === `branch`) {
				this.clientType = CLIENT_TYPE.BRANCH;
			} else {
				this.clientType = CLIENT_TYPE.NON_CLIENT;
			}
		}

		this.headerLabel = this.clientType === CLIENT_TYPE.NON_CLIENT ? `Add Caller Details` : `Search Caller Details`;
		this._clearErrors(e);
	}

	_inBranch(e) {
		if (e.detail.new) {
			this.clientInBranch = e.target.id === `clientPresent`;
		}
		this._clearErrors(e);
	}

	_valueChanged(e) {
		this[e.currentTarget.id] = e.detail.new;
		this._clearErrors(e);
	}

	_onKeyPress(e) {
		this._clearErrors(e);
	}

	async _getConsultant(e) {
		this._clearErrors(e);
		const cpNumber = e.detail.new;
		if (cpNumber.length === 6) {
			const consultantInfo = await this._getConsultantDetails(`cp${cpNumber}`);
			if (consultantInfo.status === `Active`) {
				this.consultantName = `${consultantInfo.firstName} ${consultantInfo.lastName}`;
				this.branchCode = consultantInfo.branchId;
				this.branchName = `${consultantInfo.branchId} - ${consultantInfo.branchName}`;
			}
		} else {
			this.consultantName = ``;
			this.branchName = ``;
		}
		this.cpNumber = cpNumber;
	}

	async _onSearchClient() {

		if (this._validateFields()) {

			this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_SEARCH_CLICK, {
				"screen": TelemetryScreen.SEARCH_CLIENT,
				"next-screen": TelemetryScreen.CONFIRM_CALLER,
				"id-method": this.searchType.value,
				"id-data": this.searchValue
			});

			const searchClient = {
				identificationMethod: this.searchType.key,
				searchValue: this.searchValue
			};

			const returnValue = await this.callHandleService.searchCaller(searchClient);
			const identifiedClient = returnValue.result;

			if (returnValue.succeeded && identifiedClient && identifiedClient.callerInformation) {
				this._raiseOnClientIdentified(identifiedClient);
			} else if (returnValue.succeeded && !(identifiedClient && identifiedClient.callerInformation)) {
				const errMessages = ERROR_MESSAGES.NOT_FOUND[this.searchType.key];
				this.alertBannerMessage = errMessages.ALERT_BANNER;
				this.errMessage.searchValue = errMessages.FIELD_ERROR;
			} else if (this.incidentDetails.incidentReferenceNumber === null) {
				this.alertBannerMessage = ERROR_MESSAGES.STRACK_ERROR;
			} else {
				this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
			}
		}
	}

	async _searchBranch() {
		
		if (this._validateBranchFields() && this._validateFields()) {
			if (this.clientInBranch === null && this.isClientVerifiedInBranch === null) {
				this.errMessage.inBranch = `Please choose an option`;
				this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			} else {
				const searchClient = {
					identificationMethod: this.searchType.key,
					searchValue: this.searchValue
				};

				this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_SEARCH_CLICK, {
					"screen": TelemetryScreen.SEARCH_CLIENT,
					"next-screen": TelemetryScreen.CONFIRM_CALLER,
					"consultant-cp-num": this.cpNumber,
					"branch-name": this.branchName,
					"search-method": this.searchType.value,
					"search-value": this.searchValue,
					"client-present": this.clientInBranch,
					"client-verified": this.isClientVerifiedInBranch
				});

				const returnValue = await this.callHandleService.searchCaller(searchClient);
				const identifiedClient = returnValue.result;

				if (returnValue.succeeded && identifiedClient && identifiedClient.callerInformation) {
					this._raiseOnBranchIdentified(identifiedClient);
				} else if (returnValue.succeeded && !(identifiedClient && identifiedClient.callerInformation)) {
					const errMessages = ERROR_MESSAGES.NOT_FOUND[this.searchType.key];
					this.alertBannerMessage = errMessages.ALERT_BANNER;
					this.errMessage.searchValue = errMessages.FIELD_ERROR;
				} else if (this.incidentDetails.incidentReferenceNumber === null) {
					this.alertBannerMessage = ERROR_MESSAGES.STRACK_ERROR;
				} else {
					this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
				}
			}
		}
	}

	_needChanged(e) {
		this.incomingCallDetails.ivrOptionCode = e.detail.new;
		this.incomingCallDetails.ivrOption.value = e.detail.new;

		this.incidentDetails.currentNeed = this.incomingCallDetails.ivrOptionCode;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		// Stop Card has it's own specialized search dialog. We raise this 
		// event to give the caller the change to switch to that dialog.
		// Switching to the dialog is not handled in this component.
		if (this.incomingCallDetails.ivrOption.value === `StopCard`) {
			this.dispatchEvent(new CustomEvent(`stop-card-need-selected`, {
				detail: {
					incomingCallDetails: this.incomingCallDetails,
					incidentDetails: this.incidentDetails
				}
			}));
		}
	}

	async _onContinue() {

		this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_SEARCH_CLICK, {
			"screen": TelemetryScreen.SEARCH_CLIENT,
			"next-screen": TelemetryScreen.PRODUCT_INFO
		});

		if (this._validateNonClientFields()) {
			const callerDetails = new CallerDetails();

			callerDetails.idNumber = ``;
			callerDetails.incomingTelephoneNumber = this.incomingCallDetails.incomingTelephoneNumber;
			callerDetails.voiceReferenceNumber = this.incomingCallDetails.voiceReferenceNumber;
			callerDetails.ivrOptionCode = this.incomingCallDetails.ivrOptionCode;
			callerDetails.incidentReferenceNumber = this.incidentDetails.incidentReferenceNumber;
			callerDetails.incidentRecId = this.incidentDetails.incidentRecId;
			callerDetails.agentTelephoneNumber = this.incomingCallDetails.agentTelephoneNumber;
			callerDetails.nonClientFullName = `${this.nameValue} ${this.surNameValue}`;
			callerDetails.nonClientCellPhone = `${this.cellPhoneNumberValue}`;
			callerDetails.nonClientIDNumber = ``;
			callerDetails.nonClientRelationship = ``;

			const nonClientDetails = {
				firstName: this.nameValue,
				surname: this.surNameValue,
				cellPhone: this.cellPhoneNumberValue
			};

			const returnValue = await this.incidentService.updateIncidentNonClientDetails(this.incidentDetails.incidentRecId, nonClientDetails);

			if (returnValue.succeeded) {
				this.dispatchEvent(new CustomEvent(`non-client-captured`, {
					detail: {
						incomingCallDetails: this.incomingCallDetails,
						incidentDetails: this.incidentDetails,
						nonClient: {
							firstName: this.nameValue,
							surname: this.surNameValue,
							cellphone: this.cellPhoneNumberValue
						},
						isBranchConsultant: false
					}
				}));
			} else if (this.incomingCallDetails.incidentRecId === null) {
				this.alertBannerMessage = ERROR_MESSAGES.STRACK_ERROR;
			} else {
				this.alertBannerMessage = ERROR_MESSAGES.SYSTEM_ERROR;
				this.logger.log(`error`, `Unable to update non-client details on incident due to a system error`, `_onContinue`, returnValue.correlationId);
			}
		}
	}

	_onEndCall() {
		this._telemetry.logEvent(IDCallerEvents.SEARCH_CLIENT_END_CALL_CLICK, {
			"screen": TelemetryScreen.SEARCH_CLIENT,
			"next-screen": TelemetryScreen.END_CALL
		});

        this._initCallerInformation();

		this.renderMode = RENDER_MODE.END_CALL;
	}

	_inBranchVerification(e) {
		if (e.detail.new) {
			this.isClientVerifiedInBranch = e.target.id === `clientVerifiedInBranch`;
		}
		this._clearErrors(e);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_validateNonClientFields() {
		// Trimming/ removing empty spaces around non client details
		this.nameValue = this.nameValue.trim();
		this.surNameValue = this.surNameValue.trim();

		const isRequiredFieldsEmpty = this._isRequiredNonClientFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBannerMessage = ERROR_MESSAGES.NONCLIENT_REQUIRED_FIELDS_EMPTY;
			return false;
		}

		if (this.nameValue || this.surNameValue) {

			if (!RegExp(NONCLIENT_REGEX_PATTERN.nameValue.PATTERN, `g`).test(this.nameValue)) {
				this.errMessage.nameValue = NONCLIENT_REGEX_PATTERN.CHARACTER_ERROR;
			} else {
				this.errMessage.nameValue = ``;
			};

			if (!RegExp(NONCLIENT_REGEX_PATTERN.surNameValue.PATTERN, `g`).test(this.surNameValue)) {
				this.errMessage.surNameValue = NONCLIENT_REGEX_PATTERN.CHARACTER_ERROR;
			} else {
				this.errMessage.surNameValue = ``;
			}

			if (!isNullorEmpty(this.errMessage.nameValue) || !isNullorEmpty(this.errMessage.surNameValue)) {
				this.alertBannerMessage = NONCLIENT_REGEX_PATTERN.ALERT_BANNER_CHARACTER_ERROR;
				return false;
			}
		}

		if (this.cellPhoneNumberValue) {
			// Handled value length and should start with 0
			for (const item of NONCLIENT_REGEX_PATTERN.cellPhoneNumberValue) {
				if (!RegExp(item.PATTERN, `g`).test(this.cellPhoneNumberValue)) {
					this.errMessage.cellPhoneNumberValue = item.FIELD_ERROR;
					this.alertBannerMessage = item.ALERT_BANNER;
					return false;
				}
			}
		}
		return true;
	}

	_validateBranchFields() {
		const isRequiredFieldsEmpty = this._isRequiredBranchFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			return false;
		}

		if (this.cpNumber && this.branchName) {
			if (!RegExp(BRANCH_REGEX_PATTERN.cpNumber.PATTERN, `g`).test(this.cpNumber)) {
				this.errMessage.cpNumber = BRANCH_REGEX_PATTERN.cpNumber.FIELD_ERROR;
				this.alertBannerMessage = BRANCH_REGEX_PATTERN.cpNumber.ALERT_BANNER;
				return false;
			}
			if (this.branchName === `null-null`) {
				this.errMessage.branchName = `Invalid branch code`;
				this.alertBannerMessage = ERROR_MESSAGES.INVALID_BRANCH;
				return false;
			}
			if (!RegExp(BRANCH_REGEX_PATTERN.branchName.PATTERN, `g`).test(this.branchCode)) {
				this.errMessage.branchName = BRANCH_REGEX_PATTERN.branchName.FIELD_ERROR;
				this.alertBannerMessage = BRANCH_REGEX_PATTERN.branchName.ALERT_BANNER;
				return false;
			}
		}
		return true;
	}

	_validateFields() {

		const isRequiredFieldsEmpty = this._isRequiredFieldsEmpty();
		if (isRequiredFieldsEmpty) {
			this.alertBannerMessage = ERROR_MESSAGES.REQUIRED_FIELDS_EMPTY;
			return false;
		}

		const regexValidation = REGEX_PATTERNS[this.searchType.key];
		const REGEX_PATTERN = regexValidation.PATTERN;

		if (!RegExp(REGEX_PATTERN, `g`).test(this.searchValue)) {
			this.errMessage.searchValue = regexValidation.FIELD_ERROR;
			this.alertBannerMessage = regexValidation.ALERT_BANNER;
			return false;
		}

		return true;
	}

	_isRequiredNonClientFieldsEmpty() {
		this.errMessage.nameValue = isNullorEmpty(this.nameValue) ? NONCLIENT_REGEX_PATTERN.nameValue.FIELD_ERROR : ``;
		this.errMessage.surNameValue = isNullorEmpty(this.surNameValue) ? NONCLIENT_REGEX_PATTERN.surNameValue.FIELD_ERROR : ``;

		return this.errMessage.nameValue || this.errMessage.surNameValue;
	}

	_isRequiredFieldsEmpty() {
		this.errMessage.searchValue = isNullorEmpty(this.searchValue) ? `This is a required field` : ``;
		this.errMessage.searchType = isNullorEmpty(this.searchType.key) ? `Choose an Identification Method` : ``;

		return this.errMessage.searchValue || this.errMessage.searchType;
	}

	_isRequiredBranchFieldsEmpty() {
		this.errMessage.cpNumber = isNullorEmpty(this.cpNumber) ? `This is a required field` : ``;
		this.errMessage.branchName = isNullorEmpty(this.branchName) ? `Invalid branch name` : ``;
		this.errMessage.consultantName = isNullorEmpty(this.consultantName) ? `Consultant not found` : ``;

		return this.errMessage.cpNumber || this.errMessage.branchName || this.errMessage.consultantName;
	}

	_clearErrors(e) {
		this.errMessage[e.currentTarget.id] = ``;
		this.errMessage.nameValue = ``;
		this.errMessage.surNameValue = ``;
		this.errMessage.cpNumber = ``;
		this.errMessage.searchType = ``;
		this.errMessage.searchValue = ``;
		this.errMessage.inBranch = ``;
		this.errMessage.consultantName = ``;
		this.errMessage.branchName = ``;
		this.alertBannerMessage = ``;
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_handleAddNonClientException(exception) {
		// We stay on the search dialog and display an error if their is a CS  call failure
		return true;
	}

	_handleSearchClientException(exception) {
		// We stay on the search dialog and display an error if their is a CS  call failure
		return true;
	}

	_raiseOnClientIdentified(identifiedClient) {
		const confirmedCaller = {
			cifNumber: identifiedClient.callerInformation.cifNumber,
			birthdate: identifiedClient.callerInformation.birthdate,
			languagePreference: identifiedClient.callerInformation.languagePreference,
			livesIn: identifiedClient.callerInformation.livesIn,
			name: identifiedClient.callerInformation.name,
			title: identifiedClient.callerInformation.title,
			southAfricanIDNumber: identifiedClient.callerInformation.southAfricanIDNumber,
			verifiedTelephoneNumber: identifiedClient.callerInformation.verifiedTelephoneNumber,
            isBranchConsultant: false,
            firstName: identifiedClient.callerInformation.firstName,
            middleName1: identifiedClient.callerInformation.middleName1,
            middleName2: identifiedClient.callerInformation.middleName2,
            middleName3: identifiedClient.callerInformation.middleName3,
            lastName: identifiedClient.callerInformation.lastName,
            initials: identifiedClient.callerInformation.initials,
			identifiedBy: this.searchType.identificationType,
			isClientVerifiedInBranch: this.isClientVerifiedInBranch
		};

		this.dispatchEvent(new CustomEvent(`client-identified`, {
			detail: {
				incomingCallDetails: this.incomingCallDetails,
				confirmedCaller: confirmedCaller,
				incidentDetails: this.incidentDetails,
				isBranchConsultant: false
			}
		}));
	};

	async _raiseOnBranchIdentified(identifiedClient) {
		const confirmedCaller = {
			cifNumber: identifiedClient.callerInformation.cifNumber,
			birthdate: identifiedClient.callerInformation.birthdate,
			languagePreference: identifiedClient.callerInformation.languagePreference,
			livesIn: identifiedClient.callerInformation.livesIn,
			name: identifiedClient.callerInformation.name,
			title: identifiedClient.callerInformation.title,
			southAfricanIDNumber: identifiedClient.callerInformation.southAfricanIDNumber,
			verifiedTelephoneNumber: identifiedClient.callerInformation.verifiedTelephoneNumber,
			isBranchConsultant: true,
			identifiedBy: this.searchType.identificationType,
			firstName: identifiedClient.callerInformation.firstName,
			middleName1: identifiedClient.callerInformation.middleName1,
			middleName2: identifiedClient.callerInformation.middleName2,
			middleName3: identifiedClient.callerInformation.middleName3,
			lastName: identifiedClient.callerInformation.lastName,
			isClientPresent: this.clientInBranch,
			isClientVerifiedInBranch: this.isClientVerifiedInBranch
		};

		await this._updateIncidentBranchDetails(this.branchCode);

		this.dispatchEvent(new CustomEvent(`branch-captured`, {
			detail: {
				incomingCallDetails: this.incomingCallDetails,
				confirmedCaller: confirmedCaller,
				incidentDetails: this.incidentDetails,
				isBranchConsultant: true,
				isClientPresent: this.clientInBranch
			}
		}));
	}

	async _updateIncidentBranchDetails(branchCode) {
		// on confirm click, update incident details to be branch incident and not client incident
		const incidentRecID = this.incidentDetails.incidentRecId;
		const returnValue = await this.incidentService.UpdateIncidentBranchDetailsRequest(incidentRecID, branchCode);
		if (!returnValue.succeeded) {
			this.logger.log(`error`, ``, `_updateIncidentBranchDetails`);
			return false;
		}
		return true;
	}

	async _getConsultantDetails(cpNumber) {
		const returnValue = await this.incidentService.GetConsultantInformation(cpNumber);
		if (returnValue.succeeded) {
			// return consultantInfo = {consultantName: returnValue.result.consultantName, branchCode: returnValue.result.branchCode}
			return returnValue.result;
		}
		return null;
	}

    _initCallerInformation() {
        // This is the callerInformation object that will be persisted to state when caller is confirmed.
        this.callerInformation = new CallerInformation(
            ``, // cif
            ``, // birthdate
            ``, // languagePreference
            ``, // livesIn
            ``, // name
            ``, // title
            ``, // SA id
            ``, // verified number
            this.nameValue, // nonclient firstname
            this.surNameValue, // nonclient surname
            `${this.nameValue} ${this.surNameValue}`, // nonclient fullname
            this.cellPhoneNumberValue, // nonclient cellphone
            ``, // nonclient ID number
            ``, // nonclient relationship
            false, // isConfirmed
			this.isClientVerifiedInBranch ? `verified` : `unverified`, // verificationStatus
            false, // verificationToastDisplayed
            false, // isThirdParty
            this.clientType === CLIENT_TYPE.NON_CLIENT, // isNonClient
            false, // hasInsuranceProducts
            false, // hasDigitalChannels
            {
                itaAttempts: 0,
                sqAttempts: 0
            },
            this.clientType === CLIENT_TYPE.BRANCH, // isBranchConsultant
            this.clientInBranch, // isClientPresent
            this.isClientVerifiedInBranch ? `ITA` : ``,
            ``, // firstName
            ``, // middleName1
            ``, // middleName2
            ``, // middleName3
            ``, // lastName
            ``, // initials
            ``, // identifiedBy
			`` // client's registered email ID
        );
    }
	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				div[slot="body"]{
					width: 690px;
				}
				capitec-content-box{
					--theme-container-padding-top: 24px;
					--theme-container-padding-bottom: 0px;
				}
				.client-type-label{
					height: 24px;
					width: 91px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin: 0px 0px 12px 0px;
				}
				capitec-radio-group{
					height: 24px;
					width: 398px;
				}
				capitec-radio{
					height:24px;
				}
				.search-label{
					height: 24px;
					width: 175px;
					color: #3E4547;
					font-family: "Hind Vadodara";
					font-size: 18px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 24px;
					margin-top: 31px;
					margin-bottom: 18px;
				}
				.group-field-row{
					height: 72px;
				}
				.reset-margin-bottom{
					margin-bottom : 0px;
				}
				.id-options{
					text-align: justify;
					line-height: 12px;
				}
				.search-field-row{
					height: 72px;
					margin-top: 8px;
				}
				.branch-field-row{
					height: 72px;
					margin-top: 8px;
				}
				.nonClient-fields-group{
					margin-top: 20px;
				}
				div[slot="footer"] > capitec-group{
					height: 48px;
				}
				div[slot="footer"] > capitec-group > capitec-button{
					margin: 0px;
				}
				capitec-alert-banner{
					--theme-alert-banner-height: 48px;
					--theme-alert-banner-icon-margin-left: 15px;
					--theme-alert-banner-icon-margin-right: 15px;
					margin: 0px 0px 16px 0px;
				}
				#id-label-enter-details {
					margin: 0px 0px 16px 0px;
					--theme-label-title-font-size: 18px;
					--theme-label-title-font-weight: 600;
				}`
		];
	}

	_webTemplate() {
		switch (this.renderMode) {
			case RENDER_MODE.SEARCH_CALLER:
				return html`
					<horizon-caller-dialog
						data-automation-id="search-caller-dialog"
						.incomingCallDetails="${this.incomingCallDetails}"
						.incidentDetails="${this.incidentDetails}"
						.isNeedSelectable=${true}
						headerLabel="${this.headerLabel}"
						@on-end-call="${() => this._onEndCall()}"
						@on-need-changed="${(event) => this._needChanged(event)}">
						<div slot="body">
							<capitec-content-box style="height:${this.clientType === CLIENT_TYPE.BRANCH ? `690px;` : `480px;`}">
								${this._renderAlertBanner()}
								${this._renderClientType()}
								${this._renderCapitecClient()}
								${this._renderNonClientFields()}
								${this._renderBranchFields()}
							</capitec-content-box>
							${this._renderLoadingIndicator()}
						</div>
						<div slot="footer">
							${this._renderFooter()}
						</div>
					</horizon-caller-dialog>`;
			case RENDER_MODE.END_CALL:
				return html`${this._renderEndCallModal()}`;
			default:
		}
	}

	_renderLoadingIndicator() {
		return this.isBusy 
			? html`<capitec-loading-indicator data-automation-id="search-caller-loading-indicator"></capitec-loading-indicator>`
			: html``;
	}

	_renderClientType() {
		return html`
			<capitec-label 
				class="client-type-label" 
				label="Client Type">
			</capitec-label>
			<capitec-radio-group>
				<capitec-group layout="grid" rows="auto" columns="auto" gap="none">
					<capitec-radio 
						id="capitecClient" 
						data-automation-id="search-caller-capitec-client"
						label="Capitec Client" 
						@value-changed="${(e) => this._clientTypeChanged(e)}"
						row="1" column="1">
					</capitec-radio>
					<capitec-radio 
						id="nonCient" 
						data-automation-id="search-caller-non-client"
						label="Non Client" 
						@value-changed="${(e) => this._clientTypeChanged(e)}" row="1"
						column="2">
					</capitec-radio>
					<capitec-radio 
						id="branch" 
						data-automation-id="search-caller-branch"
						label="Branch" 
						@value-changed="${(e) => this._clientTypeChanged(e)}" row="1"
						column="3">
					</capitec-radio>
				</capitec-group>
			</capitec-radio-group>`;
	}

	_renderCapitecClient() {
		if (this.clientType === CLIENT_TYPE.CAPITEC_CLIENT) {
			return html`${this._renderClientFields()}`;
		}
	}

	_renderClientFields() {
			return html`
					<capitec-label 
						class="search-label ${this.alertBannerMessage ? `reset-margin-bottom` : ``}"
						label="Search existing client">
					</capitec-label>
					<capitec-group layout="vertical" gap="none" halign="stretch" valign="top">
						<div class="search-field-row">
							<capitec-select 
								id="searchType" 
								data-automation-id="search-caller-identification-method"
								error="${this.errMessage.searchType}"
								label="Choose identification method"
								class="id-options" 
								.items="${this.identificationMethods !== undefined ? this.identificationMethods : [{ displayText: `ID Number` }]}"
								id-field="key" 
								display-field="value"
								@value-changed="${(e) => this._valueChanged(e)}">
							</capitec-select>
						</div>
						<div class="search-field-row">
							<capitec-text-field 
								id="searchValue" 
								data-automation-id="search-caller-value"
								type="search" 
								keyboardMode="numeric" 
								label="Search" 
								focussed
								value="${this.searchValue}" 
								@value-changed="${(e) => this._valueChanged(e)}"
								@key-input="${(e) => this._onKeyPress(e)}" 
								error="${this.errMessage.searchValue}">
							</capitec-text-field>
						</div>
					</capitec-group>`;
	}

	_renderNonClientFields() {
		if (this.clientType === CLIENT_TYPE.NON_CLIENT) {
			return html`
				<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" class="nonClient-fields-group">
					<capitec-label
						id="id-label-enter-details"
						type="title"
						label="Enter details below:">
					</capitec-label>
					<div class="search-field-row">
						<capitec-text-field
							id="nameValue"
							data-automation-id="search-caller-non-client-first-name"
							label="Name"
							hint="Required Field"
							.value="${this.nameValue}"
							@value-changed="${(e) => this._valueChanged(e)}"
							@key-input="${(e) => this._onKeyPress(e)}"
							error="${this.errMessage.nameValue}">
						</capitec-text-field>
					</div>
					<div class="search-field-row">
						<capitec-text-field
							id="surNameValue"
							data-automation-id="search-caller-non-client-surname"
							label="Surname"
							hint="Required Field"
							.value="${this.surNameValue}"
							@value-changed="${(e) => this._valueChanged(e)}"
							@key-input="${(e) => this._onKeyPress(e)}"
							error="${this.errMessage.surNameValue}">
						</capitec-text-field>
					</div>
					<div class="search-field-row">
						<capitec-text-field
							id="cellPhoneNumberValue"
							data-automation-id="search-caller-non-client-telephone"
							label="Cellphone number (optional)"
							type="numeric"
							.value="${this.cellPhoneNumberValue}"
							@value-changed="${(e) => this._valueChanged(e)}"
							@key-input="${(e) => this._onKeyPress(e)}"
							error="${this.errMessage.cellPhoneNumberValue}">
						</capitec-text-field>
					</div>
				</capitec-group>`;
		}
		return html``;
	}

	_renderBranchFields() {
		if (this.clientType === CLIENT_TYPE.BRANCH) {
			return html`
				<capitec-group layout="vertical" gap="none" halign="stretch" valign="top" class="nonClient-fields-group">
					<div class="branch-field-row">
						<capitec-text-field
							id="cpNumber"
							data-automation-id="search-caller-branch-consultant-cpnumber"
							label="CP Number"
							type="numeric"
							maxlength="6"
							error="${this.errMessage.cpNumber}"
							.value="${this.cpNumber}"
							@key-input="${(e) => this._getConsultant(e)}">
						</capitec-text-field>
					</div>
								<!--Branch name and consultant name to auto populate -->
					<div class="branch-field-row">
						<capitec-text-field
							id="consultantName"
							data-automation-id="search-caller-branch-consultant-name"
							label="Consultant name"
							.value="${this.consultantName}"
							error=${this.errMessage.consultantName}
							disabled>
						</capitec-text-field>
					</div>
					<div class="branch-field-row" style="margin-bottom: -10px;">
						<capitec-text-field
							id="branchName"
							data-automation-id="search-caller-branch-name"
							label="Branch name"
							.value="${this.branchName}"
							error=${this.errMessage.branchName}
							disabled>
						</capitec-text-field>
					</div>
					${this._renderClientFields()}
				</capitec-group>

				${this._renderError()}

			<capitec-radio-group>
				<capitec-group layout="grid" rows="auto" columns="auto" gap="none">
					${this._renderClientBranchInfo()}
				</capitec-group>
			</capitec-radio-group>
					`;
		}
		return html``;
	}

	_renderClientBranchInfo() {
		return this.roleManager.isHelpDeskAgent
		? html`
			<capitec-radio
				id="clientVerifiedInBranch"
				data-automation-id="search-caller-branch-client-verified"
				label="Client verified in branch"
				@value-changed="${(e) => this._inBranchVerification(e)}"
				row="1" column="1">
			</capitec-radio>
			<capitec-radio 
				id="clientNotVerified" 
				data-automation-id="search-caller-branch-client-not-verified"
				label="Client not verified" 
				@value-changed="${(e) => this._inBranchVerification(e)}"
				row="1" column="2">
			</capitec-radio>`
		: html`
			<capitec-radio
				id="clientPresent"
				data-automation-id="search-caller-branch-client-present"
				label="Client present"
				@value-changed="${(e) => this._inBranch(e)}"
				row="1" column="1">
			</capitec-radio>
			<capitec-radio 
				id="clientNotPresent" 
				data-automation-id="search-caller-branch-client-not-present"
				label="Client not present" 
				@value-changed="${(e) => this._inBranch(e)}"
				row="1" column="2">
			</capitec-radio>`;
	}

	_renderError() {
		if (this.errMessage.inBranch) {
			return html`
				<div>
					<capitec-alert-banner 
						data-automation-id="search-caller-in-branch-alert"
						type="unsuccessful-red" 
						label="Please choose an option">
					</capitec-alert-banner>
				</div>
			`;
		}
		return html``;
	}

	_renderAlertBanner() {
		if (!isNullorEmpty(this.alertBannerMessage) && !this.errMessage.inBranch) {
			return html`
				<capitec-alert-banner 
						data-automation-id="search-caller-alert-message"
						type="unsuccessful-red">
					${this.alertBannerMessage}
				</capitec-alert-banner>
			`;
		}
		return html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="center">
				<capitec-button
					data-automation-id="search-caller-search-client"
					type="primary"
					@click="${(e) => this._onSearchClient(e)}"
					label="Search Client"
					?hidden=${this.clientType !== CLIENT_TYPE.CAPITEC_CLIENT}
					tabindex="5">
				</capitec-button>
				<capitec-button
					data-automation-id="search-caller-continue"
					type="primary"
					@click="${(e) => this._onContinue(e)}"
					label="Continue"
					?hidden=${this.clientType !== CLIENT_TYPE.NON_CLIENT}
					tabindex="6">
				</capitec-button>
				<capitec-button
					data-automation-id="search-caller-search-branch"
					type="primary"
					@click="${(e) => this._searchBranch(e)}"
					label="Search client"
					?hidden=${this.clientType !== CLIENT_TYPE.BRANCH}
					tabindex="7">
				</capitec-button>
			</capitec-group>`;
	}

	_renderEndCallModal() {
		return html`
			<horizon-end-call-session 
				.incomingCallDetails="${this.incomingCallDetails}"
				.incidentDetails="${this.incidentDetails}"
                .callerInformation="${this.callerInformation}"
				endCallContext="ConfirmClient"
				@cancel="${() => this.renderMode = RENDER_MODE.SEARCH_CALLER}">
			</horizon-end-call-session>`;
	}
}

window.customElements.define(`horizon-search-caller`, SearchCaller);