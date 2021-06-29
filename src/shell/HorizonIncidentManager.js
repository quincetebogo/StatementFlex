import { Component, View } from 'platform/elements';
import { Configuration, Logger } from 'platform/core';
import { CLOSE_REASONS, HORIZON_NEED_STATUS, REASON_RESOLUTIONS} from 'app/constants/IncidentManager';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
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

		this.incidentService = new IncidentManagementService(null, () => true);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise() {
		Component.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		View.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		
		Component.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		View.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		View.prototype.createAndClassifySubsIncident = (toggleBusyFlag, incidentCategorization = null) => this.createAndClassifySubsIncident(toggleBusyFlag, incidentCategorization);
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
		if (clientNeed === incidentDetails.currentNeed && incidentDetails.needStatus !== HORIZON_NEED_STATUS.CLOSED) {
			// Do nothing
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
				this.incidentService._toggleBusyFlag = toggleBusyFlag;

				await this._closePrimaryIncident(clientNeed);
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
	 * @returns {void}
	 */
	 async createAndClassifySubsIncident(toggleBusyFlag, incidentCategorization) {
		const callerInfo = this.horizonStore.getCallerInformation();
		const callDetails = this.horizonStore.getIncomingCallDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
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
			// Classifying the subsequent incident, cause we know the need now
			await this._classifyIncident(incidentCategorization);

			return;
		}

		const createSubsequentIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryIncidentRecID: incidentDetails.primaryIncidentRecID
		};

		const returnValue = await this.incidentService.createIncident(createSubsequentIncidentRequest);
		const subsequentIncident = returnValue.result;

		if (!returnValue.succeeded || !subsequentIncident) {
			this.logger.log(`error`, `Failed to create incident. The call will be handled without incident data being tracked.`, `_createSubsequentIncident`, returnValue.correlationId);
			return;
		}
		
		this.checkIncidentStatus = false;

		incidentDetails.incidentReferenceNumber = subsequentIncident.incidentNumber;
		incidentDetails.incidentRecId = subsequentIncident.incidentRecId;
		this.horizonStore.setIncidentDetails(incidentDetails);
		
		/**
		 * Updating client or non-client details based on the flow
		 */
		if (callerInfo.is3rdParty || !callerInfo.isNonClient) {
			await this._updateSubsequentNeedClientDetails(callDetails, callerInfo);
		} else {
			await this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo);
		}

		// Classifying the subsequent incident, cause we know the need now
		await this._classifyIncident(incidentCategorization);
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Closing current need
	 * Since we know the need is fullfilled, closing incident with default values
	 * Reason - Need Fullfilled & Cause code - Normal Enquiry
	 * 
	 * @param {string} clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 * @returns {void}
	 */
	 async _closePrimaryIncident(clientNeed) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		const reason = CLOSE_REASONS[incidentDetails.needStatus];
		const resolution = REASON_RESOLUTIONS[reason];

		const closeIncidentRequest = {
			incidentRecId: incidentDetails.incidentRecId,
			reason: reason,
			resolution: resolution,
			causeCode: `NormalEnquiry`
		};

		const returnValue = await this.incidentService.closeIncident(closeIncidentRequest);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
		}
		
		this._updateIncidentState(clientNeed);
	}

	_updateIncidentState(clientNeed) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		
		const curIncidentDetails = {
			incidentReferenceNumber: `0`,
			incidentRecId: `0`,
			primaryIncidentRef: incidentDetails.primaryIncidentRef,
			primaryIncidentRecID: this.primaryNeedIncidentRecId,
			previousNeed: incidentDetails.currentNeed,
			currentNeed: clientNeed,
			needStatus: `InProgress`
		};

		this.horizonStore.setIncidentDetails(curIncidentDetails);
	}

	async _getNeedActions() {
		const ivrActionMapping = await this._configuration.getSetting(`ivrActionMapping`);
		return ivrActionMapping;
	}

	async _incidentStatus(incidentRecId) {
		const returnValue = await this.incidentService.incidentStatus(incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return null;
		}
		return returnValue.result;
	}

	async _classifyIncident(incidentCategorization) {
		const incidentDetails = this.horizonStore.getIncidentDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const ivrActionMapping = await this._getNeedActions();
		const needAction = ivrActionMapping[incidentDetails.currentNeed];
		let canClassify = !this.checkIncidentStatus;

		if (this.checkIncidentStatus) {
			const incidentInfo = await this._incidentStatus(incidentDetails.incidentRecId);
			canClassify = isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue);
		}

		if (canClassify && (!isNullorEmpty(needAction) || !isNullorEmpty(incidentCategorization))) {
			const request = {
				incidentRecId: incidentDetails.incidentRecId,
				ivrOptionCode: incomingCallDetails.ivrOptionCode,
				needAction: needAction,
				incidentCategorization: incidentCategorization
			};
			const returnValue = await this.incidentService.classifyIncident(request);
	
			if (!returnValue.succeeded) {
				this.logger.log(`error`, `Failed to classify incident. Agent may have to manually categorize at STrack.`, `_classifyIncident`, returnValue.correlationId);
				return;
			}
		}
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
	}

	/**
	 * Updating non client details to newly created subsequent incident
	 * 
	 * @param {object} callDetails - incoming call details object retrieved from state
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @returns {void}
	 */
	async _updateSubsequentNeedNonClientDetails(callDetails, callerInfo) {

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
}