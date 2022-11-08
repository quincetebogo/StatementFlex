import { CAUSE_CODE_BY_REASON, CLOSE_REASONS, HORIZON_NEED_STATUS, REASON_RESOLUTIONS } from 'app/constants/IncidentManager';
import { Component, View } from 'platform/elements';
import { Configuration, Logger, SecurityContext } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { STRACK_MAPPING } from 'app/constants/StrackMapping';
import { SubsequentNeedEvents } from 'app/constants/telemetry/events/SubsequentIncident';
import { isNullorEmpty } from 'app/utils/channelServiceUtilities';

/**
 * This manager class is responsible to handle the current need and subsequent needs.
 * On initialise of this class, a function is injected into View class to serve its purspose.
 * Injected function will be triggered whenever switching between needs, to check whether current need
 * is fullfilled or in-progress and act upon different checkpoint conditions.
 *
 * @export
 * @class HorizonIncidentManager
 */

export class HorizonIncidentManager {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonIncidentManager());
	}

	constructor() {
		this.primaryNeedIncidentRecId = ``;
		this.checkIncidentStatus = true;

		this._toggleBusyFunc = null;

		this._configuration = Configuration.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();
		this.securityContext = SecurityContext.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();

		this.incidentService = new IncidentManagementService(null, () => true);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise() {
		Component.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		View.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		
		Component.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		Component.prototype.createAndClassifySubsIncident = (toggleBusyFlag, incidentCategorization = null, classify = true) => this.createAndClassifySubsIncident(toggleBusyFlag, incidentCategorization, classify);
		Component.prototype.closeIncident = (options, toggleBusyFlag, errorHandler) => this.closeIncident(options, toggleBusyFlag, errorHandler);
		Component.prototype.classifyIncident = (toggleBusyFlag, incidentCategorization, errorHandler) => this.classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler);

		View.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		View.prototype.createAndClassifySubsIncident = (toggleBusyFlag, incidentCategorization = null, classify = true) => this.createAndClassifySubsIncident(toggleBusyFlag, incidentCategorization, classify);
		View.prototype.closeIncident = (options, toggleBusyFlag, errorHandler) => this.closeIncident(options, toggleBusyFlag, errorHandler);
		View.prototype.classifyIncident = (toggleBusyFlag, incidentCategorization, errorHandler) => this.classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler);
	}

	async _handleMultipleNeed (clientNeed, toggleBusyFlag) {

		const incidentDetails = this.horizonStore.getIncidentDetails();

		/**
		 * Checkpoint 1:
		 * When we reload the same need. i.e., example: assume opening proof of account modal,
		 * cancelling it and re-opening the modal
		 * 
		 * New case: possible to open search other needs more than once.
		 */

		if (clientNeed === incidentDetails.currentNeed &&
			![HORIZON_NEED_STATUS.CLOSED, HORIZON_NEED_STATUS.COMPLETED, HORIZON_NEED_STATUS.ASSIGNED, HORIZON_NEED_STATUS.FAILED].includes(incidentDetails.needStatus)) {
			
				incidentDetails.needStatus = HORIZON_NEED_STATUS.INPROGRESS;
				this.horizonStore.setIncidentDetails(incidentDetails);
				return true;
		}

		/**
		 * Checkpoint 2:
		 * When need is In-Progress and toggling between needs should not create new incident
		 * Example: Landing on favourites screen, choosing proof of account instead of statments
		 * In such case, we update the state with correct need
		 */
		if (clientNeed !== incidentDetails.currentNeed && 
			(incidentDetails.needStatus === HORIZON_NEED_STATUS.INPROGRESS ||
			 incidentDetails.needStatus === HORIZON_NEED_STATUS.NOT_STARTED)) {
				
				incidentDetails.currentNeed = clientNeed;
				incidentDetails.needStatus = HORIZON_NEED_STATUS.INPROGRESS;
				this.horizonStore.setIncidentDetails(incidentDetails);
				return true;
		}

		/**
		 * Checkpoint 3:
		 * 
		 * When need is fullfilled and switching to other need should close current incident and create new subsequent incident
		 * Example: Landing on favourites screen, choosing proof of account and emailed client.
		 * Then selecting transaction hisotry to enquire a transaction, which is subsequent need
		 * 
		 * Checkpoint 4:
		 * 
		 * When current is assigned or handed off, such particular incident will not be closed
		 * And if the client has a subsequent need, should continue by creating new incident
		 * 
		 */
		 if (clientNeed !== incidentDetails.currentNeed &&
			(incidentDetails.needStatus === HORIZON_NEED_STATUS.COMPLETED ||
			incidentDetails.needStatus === HORIZON_NEED_STATUS.ASSIGNED ||
			incidentDetails.needStatus === HORIZON_NEED_STATUS.FAILED)) {

				this.primaryNeedIncidentRecId = incidentDetails.primaryIncidentRecID || incidentDetails.incidentRecId;

				await this.closeIncident({ clientNeed: clientNeed }, toggleBusyFlag);
				return true;
		}

		/**
		 * Checkpoint 5:
		 * 
		 * Special case for Search-other-need: Launch Strack will classify the other need and return to Horizon
		 * gets the status of other needs, same will be updated to STrack. We just have to create new incident if 
		 * client have subsequent needs
		 * 
		 */
		if (incidentDetails.needStatus === HORIZON_NEED_STATUS.CLOSED) {

			this.primaryNeedIncidentRecId = incidentDetails.primaryIncidentRecID || incidentDetails.incidentRecId;
			this._updateIncidentState(clientNeed);

			return true;
		}
	}

	/**
	 * Creating a subsequent incident for other than primary need
	 * 
	 * @param {Function} toggleBusyFlag - Toggle busy flag function
	 * @param {object} incidentCategorization - Category, Subcategory & issue details
	 * @param {boolean} classify - Flag (True/ False) to indicate, does incident needs to be classified
	 * @returns {void}
	 */
	 async createAndClassifySubsIncident(toggleBusyFlag, incidentCategorization = null, classify = true) {
		const incidentDetails = this.horizonStore.getIncidentDetails();

		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		/**
		 * Stopping creation of subsequent incident when
		 * 1. This is being trigerred for primary incident
		 * 2. State has an unclosed incident i.e., incident ref number not equals null
		 */
		if (!incidentDetails.primaryIncidentRecID && incidentDetails.incidentReferenceNumber === `0`) {
			return;
		} else if (!incidentDetails.primaryIncidentRecID || incidentDetails.incidentReferenceNumber !== `0`) {
			this.checkIncidentStatus = true;
		} else {
			const subsequentIncident = await this._createSubsIncident();

			if (!subsequentIncident) {
				return;
			}
		}

		if (classify) {
			await this.classifyIncident(toggleBusyFlag, incidentCategorization);
		}
	}

	/**
	 * Closing current need
	 * Since we know the need is fullfilled, closing incident with default values
	 * Reason - Need Fullfilled & Cause code - Normal Enquiry
	 * 
	 * @param {Object} Object
	 *          - clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 *          - endCallReason - End call reason selected/ default to `Normal Enquiry'
	 *          - causeCodeByContext - Cause code to end call session
	 * @param {Function} toggleBusyFlag - Toggle busy flag function
	 * @param {Function} errorHandler - Custom error handling function
	 * @returns {boolean} - true/ false, indicating close incident status
	 */
	 async closeIncident({ clientNeed, endCallReason = {}, manualClassification = {} }, toggleBusyFlag, errorHandler = null) {

		this.incidentService._toggleBusyFlag = toggleBusyFlag;
		manualClassification = manualClassification || {};
		
		const incidentDetails = this.horizonStore.getIncidentDetails();

		if (!incidentDetails.incidentReferenceNumber || incidentDetails.incidentReferenceNumber === `0`) {
			this.logger.log(`warning`, `Incident manager: Trying to close incident when ref no is 0 or empty. Current need: ${incidentDetails.currentNeed} previous need: ${incidentDetails.previousNeed}`, `closeIncident`, null);
			return false;
		}

		const incidentInfo = await this._incidentStatus(incidentDetails.incidentRecId, errorHandler);

		if (this._isReassigned(incidentInfo)) {
			this.logger.log(`warning`, `Incident manager: ${incidentDetails.incidentRecId} is reassigned, skipping close incident`, `closeIncident`, null);
			return true;
		}
	
		if (isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue)) {
			this.checkIncidentStatus = false;
			// Incident is not classified. Trying to classify before closing
			await this.classifyIncident(toggleBusyFlag, undefined, errorHandler);
		}

		 const reason = isNullorEmpty(endCallReason.key) ? CLOSE_REASONS[incidentDetails.needStatus] : endCallReason.key;
		 const resolution = this._getResolution(incidentInfo.resolution, incidentDetails, endCallReason, manualClassification);
		 const causeCode = this._getCauseCode(incidentInfo.causeCode, endCallReason.value || REASON_RESOLUTIONS[reason], manualClassification);

		const closeIncidentRequest = {
			incidentRecId: incidentDetails.incidentRecId,
			reason: reason,
			resolution: this._formatLineBreaks(resolution),
			causeCode: causeCode
		};

		const returnValue = await this.incidentService.closeIncident(closeIncidentRequest);

		if (!returnValue.succeeded) {
			this.logger.log(`warning`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
			if (errorHandler && typeof errorHandler === `function`) {
				errorHandler();
			}
			return false;
		}
		
		this._updateIncidentState(clientNeed);
		return true;
	}

	/**
	 * Classifies/ Categorizes the incident based on need action or incident categorization object
	 * 
	 * @param {Function} toggleBusyFlag - Toggle busy flag function
	 * @param {Object} incidentCategorization - Object holds category, subcategory & issue that needs to be updated for an incident
	 * @param {Function} errorHandler - Custom error handling function
	 * @returns {void}
	 */
	 async classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler = null) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		let canClassify = !this.checkIncidentStatus;

		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		// If incident details is empty, do nothing and return.
		if (!incidentDetails) {
			return;
		}

		if (this.checkIncidentStatus) {
			const incidentInfo = await this._incidentStatus(incidentDetails.incidentRecId, errorHandler);
			canClassify = isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue);
		}

		const needAction = STRACK_MAPPING[incidentDetails.currentNeed];

		if (canClassify && (!isNullorEmpty(needAction) || !isNullorEmpty(incidentCategorization))) {
			const request = {
				incidentRecId: incidentDetails.incidentRecId,
				ivrOptionCode: incomingCallDetails.ivrOptionCode,
				needAction: needAction,
				incidentCategorization: incidentCategorization
			};
			const returnValue = await this.incidentService.classifyIncident(request);
	
			if (!returnValue.succeeded) {
				this.logger.log(`warning`, `Failed to classify incident. Agent may have to manually categorize at STrack.`, `classifyIncident`, returnValue.correlationId);
				if (errorHandler && typeof errorHandler === `function`) {
					errorHandler();
				}
				return;
			}
		}
		this.checkIncidentStatus = true;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_isReassigned(incidentInfo) {
		if (!isNullorEmpty(incidentInfo?.owner)) {
			return incidentInfo.owner.toLocaleLowerCase() !== this.securityContext.username;
		}
	}

	_getResolution(incResolution, incidentDetails, endCallReason, manualClassification) {
		const reason = CLOSE_REASONS[incidentDetails.needStatus];
		let resolution = ``;

		if (endCallReason.getResolution) {
			resolution = endCallReason.getResolution(manualClassification.issue);
		}
		resolution = resolution || endCallReason.value || REASON_RESOLUTIONS[reason];

		return incResolution ? `${incResolution}\n${resolution}` : `${resolution}`;
	}

	/**
	 * Returns relevant cause code based on endcall reason selected
	 * 
	 * @param {String} causeCode - gets value when updated cause-code on STack out side the application 
	 * @param {String} endCallReason - hold value of selected endcall reason
	 * @param {String} manualClassification - 3 stepper modal from end call dialog
	 * @returns { String } - Returns "causeCode" || "causeCodeByReason" || "NormalEnquiry"
	 */
	 _getCauseCode(causeCode, endCallReason, manualClassification) {
		let causeCodeByReason = ``;

		const getFromValObj = (reason) => CAUSE_CODE_BY_REASON[reason][manualClassification.issue] || ``;

		if (CAUSE_CODE_BY_REASON[endCallReason]) {
			causeCodeByReason = typeof CAUSE_CODE_BY_REASON[endCallReason] === `object`
								? getFromValObj(endCallReason)
								: CAUSE_CODE_BY_REASON[endCallReason];
		}
		return causeCode || causeCodeByReason || `NormalEnquiry`;
	}

	_formatLineBreaks(value) {
		return value.replaceAll(`\n`, `%0D%0A`);
	}

	_updateIncidentState(clientNeed) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		
		const curIncidentDetails = {
			incidentReferenceNumber: `0`,
			incidentRecId: `0`,
			primaryIncidentRef: incidentDetails.primaryIncidentRef,
			primaryIncidentRecID: incidentDetails.primaryIncidentRecID || incidentDetails.incidentRecId,
			previousNeed: incidentDetails.currentNeed,
			currentNeed: clientNeed,
			needStatus: `InProgress`
		};

		this.horizonStore.setIncidentDetails(curIncidentDetails);
	}

	async _incidentStatus(incidentRecId, errorHandler) {
		const returnValue = await this.incidentService.incidentStatus(incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			if (errorHandler && typeof errorHandler === `function`) {
				errorHandler();
			}
			return {};
		}
		return returnValue.result;
	}
		
	async _createSubsIncident() {
		const callerInfo = this.horizonStore.getCallerInformation();
		const callDetails = this.horizonStore.getIncomingCallDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const incidentDetails = this.horizonStore.getIncidentDetails();
		
		const createIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryIncidentRecID: incidentDetails.primaryIncidentRecID
		};

		const returnValue = await this.incidentService.createIncident(createIncidentRequest);
		
		if (!returnValue.succeeded || !returnValue.result) {
			this.logger.log(`warning`, `Failed to create incident. The call will be handled without incident data being tracked.`, `HorizonIncidentManager._createSubsIncident`, returnValue.correlationId);
			return null;
		}
		
		this.checkIncidentStatus = false;
		
		await this.telemetry.logEvent(SubsequentNeedEvents.SUBSEQUENT_INCIDENT, {
			"parent-incident-reference": incidentDetails.primaryIncidentRef,
			"child-incident-reference": returnValue.result.incidentNumber,
			"child-incident-rec-id": returnValue.result.incidentRecId
		}, true);

		incidentDetails.incidentReferenceNumber = returnValue.result.incidentNumber;
		incidentDetails.incidentRecId = returnValue.result.incidentRecId;
		this.horizonStore.setIncidentDetails(incidentDetails);
		
		/**
		 * Updating client or non-client details based on the flow
		 */
		 if (callerInfo.is3rdParty || !callerInfo.isNonClient) {
			await this._updateSubsequentNeedClientDetails(callDetails, callerInfo);
		} else {
			await this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo);
		}

		return returnValue.result;
	}

	/**
	 * Updating client details to newly created subsequent incident
	 * 
	 * @param {object} callDetails - incoming call details object retrieved from state
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @returns {void}
	 */
	async _updateSubsequentNeedClientDetails(callDetails, callerInfo) {
		const incidentDetails = this.horizonStore.getIncidentDetails();

		if (incidentDetails.incidentRecId === `` || incidentDetails.incidentRecId === `0`) {
			this.logger.log(`error`, `There is no incident available against which to record the client details`, `_updateSubsequentNeedClientDetails`);
			return;
		}
		const returnValue = await this.incidentService.updateIncidentClientDetails(callerInfo.cifNumber, incidentDetails.incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedClientDetails`, returnValue.correlationId);
		} 

		if (callerInfo.is3rdParty) {
			this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo);
		}

		if (callerInfo.isBranchConsultant) {
			await this._updateIncidentBranchDetails(incidentDetails.incidentRecId, callerInfo.branchCode, callerInfo.branchCallerID);
		}
	}

	/**
	 * Updating non client details to newly created subsequent incident
	 * 
	 * @param {object} callDetails - incoming call details object retrieved from state
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @returns {void}
	 */
	async _updateSubsequentNeedNonClientDetails(callDetails, callerInfo) {
		const incidentDetails = this.horizonStore.getIncidentDetails();

		if (incidentDetails.incidentRecId === `` || incidentDetails.incidentRecId === `0`) {
			this.logger.log(`error`, `There is no incident available against which to record the client details`, `_updateSubsequentNeedNonClientDetails`);
			return;
		}

		const nonClientDetails = {
			ivrOptionCode: callDetails.ivrOptionCode,
			incomingTelephoneNumber: callDetails.incomingTelephoneNumber,
			firstName: callerInfo.nonClientFirstName,
			surname: callerInfo.nonClientSurName,
			cellPhone: callerInfo.nonClientCellPhone
		};
		const returnValue = await this.incidentService.updateIncidentNonClientDetails(incidentDetails.incidentRecId, nonClientDetails);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedNonClientDetails`, returnValue.correlationId);
		}
	}

	async _updateIncidentBranchDetails(incidentRecID, branchCode, branchCallerID) {
		
		const returnValue = await this.incidentService.UpdateIncidentBranchDetailsRequest(incidentRecID, branchCode, branchCallerID);
		
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update branch caller details on incident due to a system error`, `_updateIncidentBranchDetails`, returnValue.correlationId);
			return false;
		}
		return true;
	}
}