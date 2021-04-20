import { Component, View } from 'platform/elements';
import { Configuration, Logger } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';

const HORIZON_NEED_STATUS = {
	INPROGRESS: `InProgress`,
	COMPLETED: `Completed`,
	ASSIGNED: `Assigned`,
	FAILED: `Failed`,
	NOT_STARTED: `Not Started`
};

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
		this.incidentRecID = ``;
		this.primaryNeedIncidentRecId = ``;

		this._toggleBusyFunc = null;

		this._configuration = Configuration.getInstance();
		this.horizonStore = HorizonStore.getInstance();
		this.logger = Logger.getInstance();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise() {
		Component.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;

		View.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		
		View.prototype._inicidentManager_ = async function (clientNeed, toggleBusyFlag) {

			const _horizonStore = HorizonStore.getInstance();
			const incidentDetails = _horizonStore.getIncidentDetails();

			/**
			 * Checkpoint 1:
			 * When we reload the same need. i.e., example: assume opening proof of account modal,
			 * cancelling it and re-opening the modal
			 */
			if (clientNeed === incidentDetails.currentNeed) {
				// Do nothing
				return true;
			}

			/**
			 * Checkpoint 2:
			 * When need is In-Progress and toggling between needs should not create new incident
			 * Example: Landing on favourites screen, choosing proof of account instead of statments
			 * In such case, we update the state with correct need
			 */
			if (clientNeed !== incidentDetails.currentNeed && incidentDetails.needStatus === this.HORIZON_NEED_STATUS.INPROGRESS) {
				incidentDetails.currentNeed = clientNeed;
				_horizonStore.setIncidentDetails(incidentDetails);
				return true;
			}

			/**
			 * Checkpoint 3:
			 * 
			 * When need is fullfilled and switching to other need should close current incident and create new subsequent incident
			 * Example: Landing on favourites screen, choosing proof of account and emailed client.
			 * Then selecting transaction hisotry to enquire a transaction, which is subsequent need
			 * 
			 */
			if (incidentDetails.needStatus === this.HORIZON_NEED_STATUS.COMPLETED && clientNeed !== incidentDetails.currentNeed) {

				const horizonIncidentManager = HorizonIncidentManager.getInstance();

				horizonIncidentManager.incidentRecID = incidentDetails.incidentRecId;
				horizonIncidentManager.primaryNeedIncidentRecId = incidentDetails.primaryNeedIncidentRecId || incidentDetails.incidentRecId;
				horizonIncidentManager._toggleBusyFunc = toggleBusyFlag;

				await horizonIncidentManager._classifyIncident(clientNeed);
			}

			/**
			 * Checkpoint 4:
			 * 
			 * When current is assigned or handed off, such particular incident will not be closed
			 * And if the client has a subsequent need, should continue by creating new incident
			 */
			if (incidentDetails.needStatus === this.HORIZON_NEED_STATUS.ASSIGNED && clientNeed !== incidentDetails.currentNeed) {

				const horizonIncidentManager = HorizonIncidentManager.getInstance();

				horizonIncidentManager.incidentRecID = incidentDetails.incidentRecId;
				horizonIncidentManager.primaryNeedIncidentRecId = incidentDetails.primaryNeedIncidentRecId || incidentDetails.incidentRecId;
				horizonIncidentManager._toggleBusyFunc = toggleBusyFlag;

				await horizonIncidentManager._createSubsequentIncident(clientNeed);
			}
		};
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	async _getNeedActions() {
		const ivrActionMapping = await this._configuration.getSetting(`ivrActionMapping`);
		return ivrActionMapping;
	}

	async _classifyIncident(clientNeed) {
		this.incidentService = new IncidentManagementService(this._toggleBusyFunc, null);

		const incidentDetails = this.horizonStore.getIncidentDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		const ivrActionMapping = await this._getNeedActions();
		
		const request = {
			incidentRecId: this.incidentRecID,
			ivrOptionCode: incomingCallDetails.ivrOptionCode,
			needAction: ivrActionMapping[incidentDetails.currentNeed],
			incidentCategorization: null
		};
		const returnValue = await this.incidentService.classifyIncident(request);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
		}
		await this._closePrimaryIncident(clientNeed);
	}

	/**
	 * Closing current need
	 * Since we know the need is fullfilled, closing incident with default values
	 * Reason - Need Fullfilled & Cause code - Normal Enquiry
	 * 
	 * @param {string} clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 * @returns {void}
	 */
	async _closePrimaryIncident(clientNeed) {
		const closeIncidentRequest = {
			incidentRecId: this.incidentRecID,
			reason: `NeedFulfilled`,
			resolution: `Need Fulfilled`,
			causeCode: `NormalEnquiry`
		};

		const returnValue = await this.incidentService.closeIncident(closeIncidentRequest);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
		}
		await this._createSubsequentIncident(clientNeed);
	}

	/**
	 * Creating a subsequent incident for other than primary need
	 * 
	 * @param {string} clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 * @returns {void}
	 */
	async _createSubsequentIncident(clientNeed) {
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();

		const createSubsequentIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryIncidentRecID: this.primaryNeedIncidentRecId
		};

		const returnValue = await this.incidentService.createIncident(createSubsequentIncidentRequest);
		const subsequentIncident = returnValue.result;

		if (!returnValue.succeeded || !subsequentIncident) {
			this.logger.log(`error`, `Failed to create incident. The call will be handled without incident data being tracked.`, `_createSubsequentIncident`, returnValue.correlationId);
		}
		this._updateIncidentState(clientNeed, subsequentIncident);
	}

	_updateIncidentState(clientNeed, newIncident) {
		const callerInfo = this.horizonStore.getCallerInformation();
		const callDetails = this.horizonStore.getIncomingCallDetails();
		const incidentDetails = this.horizonStore.getIncidentDetails();
		
		const curIncidentDetails = {
			incidentReferenceNumber: newIncident ? newIncident.incidentNumber : `0`,
			incidentRecId: newIncident ? newIncident.incidentRecId : `0`,
			primaryIncidentRecID: this.primaryNeedIncidentRecId,
			previousNeed: incidentDetails.currentNeed,
			currentNeed: clientNeed,
			needStatus: `InProgress`
		};

		this.horizonStore.setIncidentDetails(curIncidentDetails);

		if (callerInfo.is3rdParty || callerInfo.isNonClient) {
			this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo, newIncident);
		} else {
			this._updateSubsequentNeedClientDetails(callerInfo, newIncident);
		}
	}

	/**
	 * Updating client details to newly created subsequent incident
	 * 
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @param {object} newIncident - Newly created subsequent incident details
	 * @returns {void}
	 */
	async _updateSubsequentNeedClientDetails(callerInfo, newIncident) {

		if (newIncident.incidentRecId === `` || newIncident.incidentRecId === `0`) {
			this.logger.log(`error`, `There is no incident available against which to record the client details`, `_updateSubsequentNeedClientDetails`);
			return;
		}
		const returnValue = await this.incidentService.updateIncidentClientDetails(callerInfo.cifNumber, newIncident.incidentRecId);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedClientDetails`, returnValue.correlationId);
		}
	}

	/**
	 * Updating non client details to newly created subsequent incident
	 * 
	 * @param {object} callDetails - incoming call details object retrieved from state
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @param {object} newIncident - Newly created subsequent incident details
	 * @returns {void}
	 */
	async _updateSubsequentNeedNonClientDetails(callDetails, callerInfo, newIncident) {

		if (newIncident.incidentRecId === `` || newIncident.incidentRecId === `0`) {
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
		const returnValue = await this.incidentService.updateIncidentNonClientDetails(newIncident.incidentRecId, nonClientDetails);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedNonClientDetails`, returnValue.correlationId);
		}
	}
}