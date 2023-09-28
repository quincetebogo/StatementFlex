import { CALL_TRANSFERED_CLASSIFICATION, END_CALL_REASON, END_CALL_REASON_BY_ROLE, RECOGNIZE_NEED_CONTEXTS, RECOGNIZE_NEED_REASONS, ROLES_WITH_END_CALL_CONTEXT } from 'app/constants/EndCallReasons';
import { Component, css, html, live } from 'platform/elements';
import { Configuration, Logger, SecurityContext } from 'platform/core';
import { checkForValidSACellNumber, isNullorEmpty } from 'app/utils/channelServiceUtilities';
import { AcceptCallEvents } from 'app/constants/telemetry/events/AcceptCall';
import { CALLERINFOBAR_CSS } from 'app/css/CallerInfoBar';
import { CallHandleService } from 'app/services/CallHandleService';
import { EndCallEvents } from 'app/constants/telemetry/events/EndCall';
import { HorizonIncidentManager } from 'app/shell/HorizonIncidentManager';
import { HorizonRouter } from 'app/shell/HorizonRouter';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { RoleManager } from 'app/shell/RoleManager';
import { STRACK_MAPPING } from 'app/constants/StrackMapping';
import { TelemetryScreen } from 'app/constants/telemetry/TelemetryScreens';
import { searchOtherNeedMixin } from 'app/views/common/SearchOtherNeedMixin';

import 'platform/components/popups/Modal';
import 'app/components/common/HorizonLabel';
import 'app/components/common/HorizonSelect';
import 'app/components/common/RadioButtonGroup';
import 'app/components/common/CallerDialog';
import 'app/components/common/HorizonTextBox';

const HEADER_LABEL = `End Call Session`;
const ERROR_MESSAGE = `You must complete all fields to end call`;

/**
 * The end call dialog allows the client care agent to select a reason/cause code when ending the call.
 * The dialog then navigates back to the initial landing page in order to wait for the next call
 * 
 * Events Raised 
 * -------------
 * cancel
 *
 * @export
 * @class EndCallSession
 * @extends {Component}
 */
export class EndCallSession extends Component {


	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		this.incomingCallDetails = {};
		this.endCallReasons = [];
		this.isBusy = false;
		this.isReassigned = false;
		this.alertBannerMessage = ``;
		this.numberOfCharacters = 0;
		this.allowedCharacters = 10000;
		this.endCallDescription = ``;
		this.validNumberOfChars = true;

		// Private Variables
		this.category = ``;
		this.need = ``;
		this.issue = ``;
		this.understandNeed = false;
		this.categories = [];
		this.needs = [];
		this.issues = [];
		this.incidentInfo = {};
		this.errors = {
			endCallReason: ``,
			category: ``,
			subCategory: ``,
			issue: ``
		};
		this.callerInformation = {};
		this.whatsappInfoMessage = false; 

		this._configuration = Configuration.getInstance();
		this._telemetry = HorizonTelemetry.instance;
		this.horizonRouter = HorizonRouter.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.horizonIncidentManager = HorizonIncidentManager.getInstance();
		this.logger = Logger.getInstance();
		this.securityContext = SecurityContext.getInstance();
		this.roleManager = RoleManager.getInstance();

		this.callHandleService = new CallHandleService(() => this._toggleBusyFlag(), (ex) => this._endCallErrorHandler(ex));
		this.incidentManagementService = new IncidentManagementService(() => this._toggleBusyFlag(), (ex) => this._endCallErrorHandler(ex));

		Object.assign(EndCallSession.prototype, searchOtherNeedMixin);
	}

	// --------------
	// PROPERTIES
	// --------------

	/**
	 * @property {Object} incomingCallDetails Incoming call information
	 * @property {String} endCallContext Determines the options presented. Value is ConfirmClient, VerifyClient or LandingPage
	 * @property {Boolean} isReassigned Flag to indicate of the incident has been assigned or not (Unused by v1.0 of the channel service)
	 * @readonly
	 * @static
	 * @memberof EndCallSession
	 */
	static get properties() {
		return {
			incomingCallDetails: { type: Object },
			endCallContext: { type: String },
			isReassigned: { type: Boolean },
			callerInformation: { type: Object },

			isBusy: { attribute: false },
			endCallReasons: { attribute: false },
			alertBannerMessage: { attribute: false },
			category: { attribute: false },
			need: { attribute: false },
			issue: { attribute: false },
			understandNeed: { attribute: false },
			numberOfCharacters: { attribute: false },
			allowedCharacters: { attribute: false },
			endCallDescription: { attribute: false },
			validNumberOfChars: { type: Boolean, attribute: false },
			whatsappInfoMessage: { attribute: false }
		};
	}

	get currentIncidentRef() {
		return this.horizonIncidentManager.currentIncident ? this.horizonIncidentManager.currentIncident.toString() : ``;
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------
	async connectedCallback() {
		super.connectedCallback();
		ineum(`page`, `End Call Dialog`);
		this._telemetry.startSpan(EndCallEvents.END_CALL, {
			"screen": TelemetryScreen.END_CALL
		});

		// Making end call reasons context sensitive 
		this.callerInformation = this.horizonStore.getCallerInformation() || this.callerInformation;
		this.endCallReasons = this._getEndCallReasons();
		
		this._setDefaultValues();
		this.incidentInfo = await this._incidentStatus() || {};
		this._loading();
	}

	disconnectedCallback() {
		super.disconnectedCallback();

		/*
		  We can't put this here because frequently we have navigated back to the call-waiting landing page
		  before the disconnectedCallback fires. The call-waitng landing page clears all state.
		  An error then occurs because the telemetry data in state has been wiped.

		  Also, if we are cancelling a call, the disconnected callback will fire and this will be incorrect.
		*/
		// HorizonTelemetry.instance.screenUnloadEndCall({ screen: TelemetryScreen.END_CALL });
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_cancelClick() {
		this._telemetry.logEvent(EndCallEvents.END_CALL_CANCEL, {
			"screen": TelemetryScreen.END_CALL,
			"next-screen": null
		});
		this._telemetry.endSpan(EndCallEvents.END_CALL, { "screen": TelemetryScreen.END_CALL });

		this.dispatchEvent(new CustomEvent(`cancel`, {}));
	}

	_endCallClick() {
		const isValid = this._validateMandatoryFields();

		if (isValid) {
			this._telemetry.logEvent(EndCallEvents.END_CALL_CONFIRM, {
				"screen": TelemetryScreen.END_CALL,
				"reason": this.endCallReason.value,
				"next-screen": TelemetryScreen.WAIT_FOR_CALL
			});

			// Ignoring the abandon or not started need action
			if (!this.currentIncidentRef || this.currentIncidentRef === `0`) {
				this._returnToCallWaitingPage();
			} else if (this.incomingCallDetails.ivrOptionCode === `StopCard`) {
				this._stopCardEndCall();
			} else {
				this._classifyAndClose();
			}
			
			// This is to set the description for the incident which is optional
			if (!isNullorEmpty(this.endCallDescription)) {
				
				const getDesc = this.horizonIncidentManager.getDescription();
				let description = ``;
				
				if (getDesc) {
					description = `${getDesc}\n${this.endCallDescription}`;
				} else {
					description = `${this.endCallDescription}`;
				}

				this.horizonIncidentManager.setDescription(description);
			}
		}
	}

	_valueChanged(e) {
		if (e.detail.new) {
			this.alertBannerMessage = ``;
			this.errors[e.currentTarget.id] = ``;

			this.endCallReason = this.endCallReasons.find(reason => reason.key === e.detail.new.key);
			this.whatsappInfoMessage = this._isCifNumberValid(this.callerInformation) && this.endCallReason.key === END_CALL_REASON.NEED_INCOMPLETE && this.endCallReason.value !== `Need incomplete - Transaction Failed`;
			this.understandNeed = RECOGNIZE_NEED_REASONS.includes(this.endCallReason.key);

			this._prepopulateNeed();
		}
	}

	_countNumberOfCharacters(event) {
		if (event.detail.new !== null) {
			this.numberOfCharacters = event.detail.new.length;
			this.endCallDescription = event.detail.new;

			const chars = event.detail.new.length;

			this.validNumberOfChars = this._validateCharacters(chars);
		}
	}

	_validateCharacters(chars) {

		if (!isNullorEmpty(chars) && chars > this.allowedCharacters) {

			this.alertBannerMessage = `You can only have ${this.allowedCharacters} characters in the description.`;
 			return false; 
		}

		this.alertBannerMessage = ``;
		return true;
	}

	async _categoryChanged(e) {
		if (e.detail.new !== null) {
			this.category = e.detail.new;
			this.need = ``;
			this.issue = ``;
			this.alertBannerMessage = ``;
			this.errors[e.currentTarget.id] = ``;
			
			await this.getSubCategories({ detail: { category: this.category } });
		}
	}

	async _subCategoryChanged(e) {
		if (e.detail.new !== null) {
			this.need = e.detail.new;
			this.issue = ``;
			this.alertBannerMessage = ``;
			this.errors[e.currentTarget.id] = ``;

			await this.getIssues({ detail: { category: this.category, need: this.need } });
		}
	}

	_issueChanged(e) {
		this.issue = e.currentTarget.value.issue;
		this.alertBannerMessage = ``;
		this.errors[e.currentTarget.id] = ``;
	}

	async _prepopulateNeed() {
		const screenDetails = this.horizonStore.getScreenDetails() || {};
		const incidentState = this.horizonIncidentManager.incidentState;
		const currentNeed = this.horizonIncidentManager.getCurrentNeed();

		// Determining if its already classified
		 const isClassified = !isNullorEmpty(this.incidentInfo.category) && !isNullorEmpty(this.incidentInfo.subCategory) && !isNullorEmpty(this.incidentInfo.issue);
		// Determining at least we know categorization to classify
		const hasValues = !isNullorEmpty(screenDetails.category) && !isNullorEmpty(screenDetails.subCategory) && !isNullorEmpty(screenDetails.issue);
		// Checks if the curr incident is active
		const isIncClosed = incidentState === super.HORIZON_NEED_STATUS.CLOSED || !this.currentIncidentRef || this.currentIncidentRef === `0`;
		// should classify as per need?
		// And enforcing this to false when the end call context includes in Recognize need by context
		const classifyAsPerNeed = incidentState === super.HORIZON_NEED_STATUS.INPROGRESS &&
								  STRACK_MAPPING[currentNeed] &&
								  !RECOGNIZE_NEED_CONTEXTS.includes(this.endCallContext);

		// If classification is not empty, no need to populate need
		/**
		 * If call transferred reason is selected, still popup 3 stepper dropdown
		 * to understand if its for 'Frand transfer'
		 */
		this.understandNeed = (this.understandNeed && !hasValues && !isClassified && !isIncClosed && !classifyAsPerNeed) ||
							  this.endCallReason.key === END_CALL_REASON.CALL_TRANSFERED;
		this._setClassification(screenDetails);

		if ((!this.understandNeed || this.categories.length !== 0) && this.endCallReason.key !== END_CALL_REASON.CALL_TRANSFERED) {
			return;
		}

		// If end call reason is call transferred, prepopulate category
		if (this.endCallReason.key === END_CALL_REASON.CALL_TRANSFERED) {
			this.category = CALL_TRANSFERED_CLASSIFICATION.category;
			this.need = CALL_TRANSFERED_CLASSIFICATION.subcategory;
			this.issue = ``;
		}

		await this.getCategories();

		if (!isNullorEmpty(this.category)) {
			await this.getSubCategories({ detail: { category: this.category } });
		}

		if (!isNullorEmpty(this.need)) {
			await this.getIssues({ detail: { category: this.category, need: this.need } });
		}
	}

	_setClassification(screenDetails) {
		this.category = screenDetails.category || ``;
		this.need = screenDetails.subCategory || ``;
		this.issue = screenDetails.issue || ``;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_loading() {
		this.dispatchEvent(new CustomEvent(`on-loading`, {}));
	}

	_setDefaultValues() {
		const incidentState = this.horizonIncidentManager.incidentState;
		const feedback = this.horizonIncidentManager.getFeedback();

		if (incidentState !== super.HORIZON_NEED_STATUS.CLOSED) {
			this.endCallReason = {};
			return;
		}

		this.endCallReason = this.endCallReasons.find(reason => reason.key === feedback);
	}

	async _returnToCallWaitingPage() {
		await this._endSession();
		
		await this._telemetry.endSpan(EndCallEvents.END_CALL, { "screen": TelemetryScreen.END_CALL });
		await this._telemetry._endUnClosedChildSpans();
		this._telemetry.endSpan(AcceptCallEvents.INCOMING_CALL);

		const state = { callStatus: `CALL-ENDED` };
		this.horizonStore.setState(state);
		this.horizonRouter.navigateToWaitingForCall();
	}

	_toggleBusyFlag() {
		this.isBusy = !this.isBusy;
	}

	_endCallErrorHandler(exception) {
		// We must be able to end a call and return to the call waiting landing page
		// Errors on this screen will be logged by the caller and a return the the call waiting landing page will be effected

		return true;
	}

	/**
	 * Specical case: When a client need is stop card and client identity is not confirmed
	 * Assume call is dropped then incident should not be closed.
	 * 
	 * @returns {Boolean} True / False
	 */
	_preventCloseOfIncident() {
		const incidentState = this.horizonIncidentManager.incidentState;

		if (this.isReassigned) {
			this.logger.log(`warn`, `Incident ${this.incidentRefNumber} assigned or handed off. The call will be ended without closing the incident.`);
			// Don't close the incident if it has been reassigned or handed off
			return true; 
		} else if (incidentState === super.HORIZON_NEED_STATUS.CLOSED) {
			this.logger.log(`info`, `Incident ${this.incidentRefNumber} already marked as closed. No further close action required.`);
			// Incident might be closed for search other need, no need to close again
			return true;
		}
		if (this.endCallReason.key === END_CALL_REASON.FOLLOW_UP) {
			this.logger.log(`warn`, `Incident ${this.incidentRefNumber} requires follow up. The call will be ended without closing the incident.`);
			// Don't close the incident if it requires follow up
			return true;
		}

		return false;
	}

	_validateMandatoryFields() {
		const endCallContent = this.shadowRoot.getElementById(`end-call-content-box`);
		const fields = endCallContent.children;
		const inputFields = Array.from(fields).filter(field => field.localName === `capitec-select` && !field.hidden);

		const emptyFields = inputFields.filter(field => isNullorEmpty(field.value) || field.value === {});

		if (emptyFields.length > 0) {
			this.alertBannerMessage = ERROR_MESSAGE;
			emptyFields.forEach(field => {
				this.errors[field.id] = `Required field`;
			});
			return false;
		}

		return true;
	}

	async _updateClientNonclientDetails(strackIncidentInfo, currentIncident) {

		/*
		 * Update client details to STrack when the caller is a capitec client or 3rd party/beneficiary client.
		 * Update details only when STrack incident has no client information
		 * Scenario 1: When an agent ends call from confirm caller dialog
		 * Scenario 2: when an agent ends call from Add caller details dialog
		*/
		if (!this.callerInformation.isNonClient &&
			Boolean(this.callerInformation.cifNumber) &&
			isNullorEmpty(strackIncidentInfo.clientDetails.cif) &&
			isNullorEmpty(strackIncidentInfo.clientDetails.southAfricanIDNumber)) {

			const returnValue = await this.incidentManagementService.updateIncidentClientDetails(this.callerInformation.cifNumber, currentIncident);
		
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedClientDetails`, returnValue.correlationId);
			}
		}

		/*
		 * Update non-client details to STrack when the caller is a non-client or 3rd party/beneficiary client.
		 * Update details only when STrack incident has no non-client information
		 * Scenario 1: When an agent ends call from search caller dialog while capturing non-client details
		 * Scenario 2: when an agent ends call from Add caller details dialog
		*/
		if ((this.callerInformation.isNonClient || this.callerInformation.is3rdParty) && 
			isNullorEmpty(strackIncidentInfo.nonClientDetails.fullName) &&
			Boolean(this.callerInformation.nonClientFirstName) &&
			Boolean(this.callerInformation.nonClientSurName)) {
				
			const nonClientDetails = {
				firstName: this.callerInformation.nonClientFirstName,
				surname: this.callerInformation.nonClientSurName,
				cellPhone: this.callerInformation.nonClientCellPhone
			};
			const returnValue = await this.incidentManagementService.updateIncidentNonClientDetails(currentIncident, nonClientDetails);
	
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedNonClientDetails`, returnValue.correlationId);
			}
		}

		if (this.callerInformation.isBranchConsultant &&
			Boolean(this.callerInformation.branchCallerID) &&
			isNullorEmpty(strackIncidentInfo.branchID)) {
				const returnValue = await this.incidentManagementService.UpdateIncidentBranchDetailsRequest(currentIncident, this.callerInformation.branchCode, this.callerInformation.branchCallerID);
	
				if (!returnValue.succeeded) {
					this.logger.log(`error`, `Unable to update branch caller details on incident due to a system error`, `_updateSubsequentNeedNonClientDetails`, returnValue.correlationId);
				}
			}
	}

	async _classifyAndClose() {
		const currentNeed = this.horizonIncidentManager.getCurrentNeed();
		const needAction = STRACK_MAPPING[currentNeed] || STRACK_MAPPING[this.endCallReason.mapping];
		const strackIncidentInfo = await this._incidentStatus() || {};

		await this._updateClientNonclientDetails(strackIncidentInfo, this.horizonIncidentManager.currentIncident);

		// Flag to check, if the incident is already updated outside of Horizon
		const continueUpdate = isNullorEmpty(strackIncidentInfo.category) && isNullorEmpty(strackIncidentInfo.subCategory) && isNullorEmpty(strackIncidentInfo.issue);
		const classification = this._getClassification();
		const incident = this.horizonIncidentManager.currentIncident;

		if (!isNullorEmpty(needAction) && continueUpdate) {
			const returnValue = await this.incidentManagementService.classifyIncident(incident, needAction, classification);

			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to classify incident. Agent may have to manually categorize at STrack.`, `_classifyAndClose`, returnValue.correlationId);
			}
		} 
		
		if (!continueUpdate) {
			this.logger.log(`info`, `Incident:${incident.toString()} has been already categorized at STrack.`, `_classifyAndClose`);
		}

		if (this._preventCloseOfIncident()) {
			// Updating state as call ended and redirecting it to call waiting page
			this._returnToCallWaitingPage();
			return;
		}
		await this._closeIncident(classification);
	}

	async _closeIncident(manualClassification) {
		
		const options = {
			clientNeed: null,
			endCallReason: this.endCallReason,
			manualClassification: manualClassification
		};

		await super.closeIncident(options, () => this._toggleBusyFlag());

		// Return the the call waiting landing page even if an error occured
		this._returnToCallWaitingPage();
	}

	async _incidentStatus() {
		const currentIncident = this.horizonIncidentManager.currentIncident;

		if (!currentIncident) {
			this.logger.log(`info`, `No active incident to get status`, `_incidentStatus`, null);
			return null;
		}

		const returnValue = await this.incidentManagementService.incidentStatus(currentIncident);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}

	async _stopCardEndCall() {
		const screenDetails = this.horizonStore.getScreenDetails();

		if (Object.prototype.hasOwnProperty.call(screenDetails, `cardStopAttemptMade`)) {
			this.cardStopAttemptMade = screenDetails.cardStopAttemptMade;
		} else {
			this.cardStopAttemptMade = false;
		}

		if (Object.prototype.hasOwnProperty.call(screenDetails, `stoppedCardsFailed`)) {
			this.stoppedCardsFailed = screenDetails.stoppedCardsFailed;
		} else {
			this.stoppedCardsFailed = false;
		}

		/**
		 * Temp solution to know, if incident is assigned at strack directly
		 * and to fit in current stop card flow logic
		 */
		const incidentInfo = await this._incidentStatus();
		
		if (incidentInfo) {
			this.isReassigned = this.isReassigned || (incidentInfo.owner.toLocaleLowerCase() !== this.securityContext.username);
			this.horizonIncidentManager.isReassigned = this.isReassigned;
		}

		if (this._selectedAssignOnSuccessfulyStoppedCards()) {
			// Don't allow the user to select Incident Assigned/Handed Off if this has not been done
			// Should actually filter out of the options
			this.alertBannerMessage = `INCORRECT OPTION: INCIDENT NOT ASSIGNED`;
			this.logger.log(`warn`, `Stop Card Incident not assigned, blocking selection of incident assigned reason`);
		} else if (this._selectedNeedFulfilledAfterAssigningStoppedCards()) {
			this.alertBannerMessage = `INCORRECT OPTION: INCIDENT WAS ASSIGNED`;
			this.logger.log(`warn`, `Stop Card Incident assigned, blocking selection of need fulfilled`);
		} else if (this._selectedNeedFulfilledOnFailureToStopCards()) {
			this.alertBannerMessage = `INCORRECT OPTION: CARDS WERE NOT STOPPED`;
			this.logger.log(`warn`, `Stop Card Incident was not assigned, blocking selection of need fulfilled`);
		} else if (this.endCallReason) {
			if (this._preventCloseOfIncident()) {
				// Updating state as call ended and redirecting it to call waiting page
				this._returnToCallWaitingPage();
				return;
			}

			await this._classifyAndClose();
		} else {
			this.alertBannerMessage = ERROR_MESSAGE;
		}
	}

	_selectedAssignOnSuccessfulyStoppedCards() {
		// If this is a stop card incident and
		//    an attempt to stop cards was made and
		//    assigned was selected as an end call reason
		//   and The incident has not been flagged as assigned
		// then we must disallow selecting assigned as an end call reason
		return this.cardStopAttemptMade && this.endCallReason && this.endCallReason.key === END_CALL_REASON.NEED_ASSIGNED && !this.isReassigned && this.incomingCallDetails.ivrOptionCode === `StopCard`;
	}

	_selectedNeedFulfilledOnFailureToStopCards() {
		return this.cardStopAttemptMade && this.stoppedCardsFailed && this.endCallReason && this.endCallReason.key === END_CALL_REASON.NEED_FULFILLED && this.incomingCallDetails.ivrOptionCode === `StopCard`;
	}
	
	_selectedNeedFulfilledAfterAssigningStoppedCards() {
		return this.cardStopAttemptMade && this.endCallReason && this.endCallReason.key === END_CALL_REASON.NEED_FULFILLED && this.isReassigned && this.incomingCallDetails.ivrOptionCode === `StopCard`;
	}

	_getClassification() {
		const screenDetails = this.horizonStore.getScreenDetails();

		if (!isNullorEmpty(screenDetails.category) && !isNullorEmpty(screenDetails.subCategory) && !isNullorEmpty(screenDetails.issue)) {
			return {
				category: `${screenDetails.category}`,
				need: `${screenDetails.subCategory}`,
				issue: `${screenDetails.issue}`
			};
		} 
		
		if (!isNullorEmpty(this.category) && !isNullorEmpty(this.need) && !isNullorEmpty(this.issue)) {
			return {
				category: `${this.category}`,
				need: `${this.need}`,
				issue: `${this.issue}`
			};
		}

		return null;
	}

	async _endSession() {
		// Bypassing sending Whatsapp message when end-call reason selected is {key: NEED_INCOMEPLETE, value: `Need incomplete - Transaction Failed`}
		// Sending static value '4' as end-call reason key, which is mapped to `TransactionFailed` on cs-code

		const endReason = this.endCallReason.value === `Need incomplete - Transaction Failed` ? 4 : this.endCallReason.key;

		if (this._isCifNumberValid(this.callerInformation)) {
			const req = {
				endReason: endReason,
				title: this.callerInformation.title,
				firstName: this.callerInformation.firstName,
				lastName: this.callerInformation.lastName,
				cif: this.callerInformation.cifNumber,
				clientNeed: this.incomingCallDetails.ivrOptionCode,
				cellphone: this.incomingCallDetails.incomingTelephoneNumber,
				verifiedNumber: this.callerInformation.verifiedTelephoneNumber === this.incomingCallDetails.incomingTelephoneNumber

			};
			// We don't mind if this service call fails. This is just to send automated messaging to client
			await this.callHandleService.endCall(req);
		}
	}

	_isCifNumberValid(callerInformation) {
		return Object.prototype.hasOwnProperty.call(callerInformation, `cifNumber`) && callerInformation.cifNumber;
	}

	_getEndCallReasons() {
		const orgUnit = RoleManager.getInstance().orgUnit;
		const reasonsByRole = END_CALL_REASON_BY_ROLE[orgUnit];

		if (ROLES_WITH_END_CALL_CONTEXT.includes(orgUnit)) {
			return reasonsByRole[this.endCallContext][this.callerInformation.verificationStatus] || reasonsByRole[this.endCallContext];
		}

		return reasonsByRole;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
			${CALLERINFOBAR_CSS}

			capitec-modal {
				height: 550px;
				--theme-modal-header-padding-top: 32px;
				--theme-modal-header-padding-bottom: 32px;
				--theme-modal-header-padding-right: 31px;
				--theme-modal-header-padding-left: 31px;
				--theme-modal-footer-padding: 6px 18px 10px 0px;
			}

			div[slot="header"] {
				width: 690px;
				position: absolute;
				display: flex;
				align-items: center;
				left: -670px;
				top: -15px;
			}

			div[slot="header"] > span {
				height: 24px;
				width: auto;
				color: #FFFFFF;
				font-family: "Hind Vadodara";
				font-size: 18px;
				font-weight: 600;
				letter-spacing: 0;
				line-height: 24px;
				padding-left: 17px;
				margin-right: 545px;
			}

			div[slot="body"] {
				width: 690px;
				height: 503px;
				border-radius: 5px;
			}

			.body-box {
				--theme-container-padding-bottom: 0px;
			}

			capitec-label[type="subtitle"] {
				line-height: 24px;

				--theme-label-subtitle-font-size: 18px;
				--theme-label-subtitle-font-weight: 600;
				--theme-layout-gap-spacing: 16px;
			  }

			capitec-select, capitec-text-box {
				width: 100%;

				--theme-layout-gap-spacing: 18px;
			}
			capitec-select[data-automation-id="end-call-session-select-reason"] {
				--theme-layout-gap-spacing: 24px;
			}

			#id-cancel-button {
				height: 48px;
				width: 95px;
				margin-right: 17px;
				margin-bottom: 8px;
				--theme-button-line-height: 20px;
				--theme-button-clear-border-width: 0px;
				--theme-button-padding-top: 13px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 12px;
				--theme-button-padding-left: 12px;
			}

			#id-continue-button {
				height: 48px;
				width: 112px;
				margin-bottom: 8px;
				--theme-button-line-height: 20px;
				--theme-button-primary-border-width: 0px;
				--theme-button-padding-top: 14px;
				--theme-button-padding-right: 12px;
				--theme-button-padding-bottom: 14px;
				--theme-button-padding-left: 12px;
			}

			.descriptionGroup, horizon-text-box {
				width: 100%;
			}

			.descriptionCharValidation {
				color: #ff0000;
				--theme-label-subtitle-font-weight: 600;
			}
			
			horizon-alert-banner {
				width: 100%;

				--theme-icon-size-default: 26px;
				--theme-toast-icon-margin: 0px 7px 0px 15px;
			}
			capitec-alert-banner{ 
				--theme-toast-width: 658px;
				--theme-toast-padding: 12px;
				--theme-toast-box-shadow: 0px;
				--theme-toast-detail-line-height: 24px;
				--theme-toast-title-line-height: 24px;
				z-index: 1000;
			}`
		];
	}

	_webTemplate() {
		return html`
			<horizon-caller-dialog
				data-automation-id="end-call-session-dialog"

				headerLabel="${HEADER_LABEL}" 
				?displayButton="${false}"
				incidentRefNumber="${this.currentIncidentRef}"
				?incidentCreated=${this.horizonIncidentManager.isAnIncidentCreated}
				.incomingCallDetails="${this.incomingCallDetails}"
				?isNeedSelectable="${false}">
				
					<div slot="body">
						<capitec-content-box
							id="end-call-content-box"
							class="body-box"
							layout="vertical"
							halign="left"
							valign="top"
							gap="clear">
								${this._renderAlertBanner()}
								${this._renderEndcallDescription()}
								${this._renderChooseEndCallReason()}
								${this._renderUnderstandNeed()}
								${this._renderLoadingIndicator()}
						</capitec-content-box>
					</div>
					<div slot="footer">
						${this._renderFooter()}
					</div>
			</horizon-caller-dialog>
		`;
	}

	_renderChooseEndCallReason() {
		return html`
			<capitec-label
				type="subtitle"
				label="Choose reason">
			</capitec-label>
			
			<capitec-select
				id="endCallReason"
				data-automation-id="end-call-session-select-reason"
				label="Choose reason"
				id-field="key"
				display-field="value"
				.items=${this.endCallReasons}
				@value-changed="${(e) => this._valueChanged(e)}"
				tabindex=3
				value="${this.endCallReason.value || ``}"
				select-mode="single"
				error="${this.errors.endCallReason}">
			</capitec-select>

			${this._renderWhatsappInfoBanner()}
		`;
	}

	_renderWhatsappInfoBanner() {
		const x = `0789789789`;
		return this.whatsappInfoMessage && checkForValidSACellNumber(x)
		? html`
			<capitec-alert-banner 
				type="info"
				header="Note: "
				label=" This will send a WhatsApp to the client apologising for the call disconnecting.">
			</capitec-alert-banner>`
		: html``;
	}

	_renderEndcallDescription() {
		return html`
			<capitec-group class="descriptionGroup" layout="horizontal" gap="clear" halign="left" valign="center">
				<capitec-label
					type="subtitle"
					class=${!this.validNumberOfChars ? `descriptionCharValidation` : ``}
					label="Add Description (optional)">
				</capitec-label>
				<capitec-spacer></capitec-spacer>
				
				<capitec-label
					type="default"
					class=${!this.validNumberOfChars ? `descriptionCharValidation` : ``}
					label="${this.numberOfCharacters}/10000">
				</capitec-label>
			</capitec-group>

			<horizon-text-box
				id="endCallDescriptionId"
				label="Is there additional information you would like to capture?"
				?hideForLabel=${true}
				maxLength="${!this.validNumberOfChars ? this.allowedCharacters : this.allowedCharacters + 1}"
				@key-input="${(e) => this._countNumberOfCharacters(e)}"
				@value-change="${(e) => this._countNumberOfCharacters(e)}">
			</horizon-text-box>
		`;
	}

	_renderUnderstandNeed() {
		return this.understandNeed
			? html`
				<capitec-label
					type="subtitle"
					label="What was the need">
				</capitec-label>

				<capitec-select
					id="category"
					data-automation-id="end-call-session-category"
					label="Search client need"
					.items="${this.categories}"
					display-field="category"
					id-field="category"
					value="${live(this.category)}"
					?hidden="${false}"
					@value-changed="${(e) => this._categoryChanged(e)}"
					labelAsPlaceholder
					searchable
					error="${this.errors.category}">
				</capitec-select>

				<capitec-select
					id="subCategory"
					data-automation-id="end-call-session-need"
					label="Choose specific need"
					.items="${this.needs}"
					display-field="need"
					id-field="need"
					value="${live(this.need)}"
					?hidden="${isNullorEmpty(this.category)}"
					@value-changed="${(e) => this._subCategoryChanged(e)}"
					labelAsPlaceholder
					searchable
					error="${this.errors.subCategory}">
				</capitec-select>
				
				<capitec-select
					id="issue"
					data-automation-id="end-call-session-issue"
					label="Choose issue type"
					.items="${this.issues}"
					display-field="issue"
					id-field="issue"
					value="${live(this.issue)}"
					?hidden="${isNullorEmpty(this.need)}"
					@value-changed="${(e) => this._issueChanged(e)}"
					labelAsPlaceholder
					searchable
					error="${this.errors.issue}">
				</capitec-select>`
			: html``;
	}

	_renderFooter() {
		return html`
			<capitec-group layout="horizontal">
				<capitec-button
					data-automation-id="end-call-session-cancel"
					id="id-cancel-button"
					label="Cancel"
					@click="${() => this._cancelClick()}">
				</capitec-button>
			
				<capitec-button
					data-automation-id="end-call-session-end-call"
					id="id-continue-button"
					type="primary"
					?disabled="${!this.validNumberOfChars}"
					label="End Call"
					@click="${() => this._endCallClick()}">
				</capitec-button>
			</capitec-group>
		`;
	}

	_renderAlertBanner() {
		if (this.alertBannerMessage) {
			return html`
				<horizon-alert-banner 
					data-automation-id="end-call-session-banner"
					type="error"
					label="${this.alertBannerMessage}">
				</horizon-alert-banner>`;
		}
	}

	_renderLoadingIndicator() {
		if (!this.isBusy) {
			return html``;
		}

		return html`<capitec-loading-indicator data-automation-id="end-call-session-loading-indicator"></capitec-loading-indicator>`;
	}
}

window.customElements.define(`horizon-end-call-session`, EndCallSession);