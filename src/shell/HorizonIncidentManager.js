import { Component } from 'platform/elements';
import { HorizonStore } from 'app/store/HorizonStore';
import { IncidentManagementService } from 'app/services/IncidentManagementService';

/**
 * 
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
		this._errorHandler = null;

		this.horizonStore = HorizonStore.getInstance();
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	initialise() {

		Component.prototype.HORIZON_NEED_STATUS = {
			INPROGRESS: `InProgress`,
			COMPLETED: `Completed`,
			ASSIGNED: `Assigned`
		};
		
		Component.prototype._inicidentManager_ = async function (clientNeed, toggleBusyFlag, errorHandler) {

			const _horizonStore = HorizonStore.getInstance();
			const state = _horizonStore.recoverState();
			const incomingCallDetails = state && state.incomingCallDetails;
			const incidentDetails = state && state.incidentDetails;

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
				state.incidentDetails.currentNeed = clientNeed;
				_horizonStore.saveState(state);
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
				horizonIncidentManager.primaryNeedIncidentRecId = !incidentDetails.previousNeed
					? incidentDetails.incidentRecId
					: horizonIncidentManager.primaryNeedIncidentRecId;

				horizonIncidentManager._toggleBusyFunc = toggleBusyFlag;
				horizonIncidentManager._errorHandler = errorHandler;

				await horizonIncidentManager._closeIncident(clientNeed);
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
				horizonIncidentManager.primaryNeedIncidentRecId = !incidentDetails.previousNeed
					? incidentDetails.incidentRecId
					: horizonIncidentManager.primaryNeedIncidentRecId;

				horizonIncidentManager._toggleBusyFunc = toggleBusyFlag;
				horizonIncidentManager._errorHandler = errorHandler;

				await horizonIncidentManager._createSubsequentIncident(clientNeed);
			}
		};
	}

	// --------------
	// PRIVATE METHODS
	// --------------

	/**
	 * Closing current need
	 * Since we know the need is fullfilled, closing incident with default values
	 * Reason - Need Fullfilled & Cause code - Normal Enquiry
	 * 
	 * @param {string} clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 * @returns {void}
	 */
	async _closeIncident(clientNeed) {

		this.incidentService = new IncidentManagementService(this._toggleBusyFunc, this._errorHandler);

		const closeIncidentRequest = {
			incidentRecId: this.incidentRecID,
			reason: `NeedFulfilled`,
			resolution: `NeedFulfilled`,
			causeCode: `NormalEnquiry`
		};

		const returnValue = await this.incidentService.closeIncident(closeIncidentRequest);

		if (returnValue.succeeded) {
			await this._createSubsequentIncident(clientNeed);
		}
	}

	/**
	 * Creating a subsequent incident for other than primary need
	 * 
	 * @param {string} clientNeed - Client's need [Stop card/ Proof of account/ Statements etc..]
	 * @returns {void}
	 */
	async _createSubsequentIncident(clientNeed) {
		const state = this.horizonStore.recoverState();
		const incomingCallDetails = state && state.incomingCallDetails;

		const createSubsequentIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryIncidentRecID: this.primaryNeedIncidentRecId
		};

		const returnValue = await this.incidentService.createIncident(createSubsequentIncidentRequest);

		if (returnValue.succeeded) {
			this._updateIncidentState(clientNeed, returnValue.result);
			return true;
		}
	}

	_updateIncidentState(clientNeed, newIncident) {

		const state = this.horizonStore.recoverState();
		const callerInfo = state && state.callerInformation;
		const callDetails = state && state.incomingCallDetails;
		
		state.incidentDetails.incidentReferenceNumber = newIncident.incidentNumber;
		state.incidentDetails.incidentRecId = newIncident.incidentRecId;

		state.incidentDetails.primaryIncidentRecID = this.primaryNeedIncidentRecId;
		state.incidentDetails.previousNeed = state.incidentDetails.currentNeed;
		state.incidentDetails.currentNeed = clientNeed;
		state.incidentDetails.needStatus = `InProgress`;

		this.horizonStore.saveState(state);

		if (callerInfo.is3rdParty || callerInfo.isNonClient) {
			this._updateNonClientDetails(callDetails, callerInfo, newIncident);
		} else {
			this._updateClientDetails(callerInfo, newIncident);
		}
	}

	/**
	 * Updating client details to newly created subsequent incident
	 * 
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @param {object} newIncident - Newly created subsequent incident details
	 * @returns {void}
	 */
	async _updateClientDetails(callerInfo, newIncident) {
		const returnValue = await this.incidentService.updateIncidentClientDetails(callerInfo.cifNumber, newIncident.incidentRecId);

		if (returnValue.succeeded) {
			return true;
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
	async _updateNonClientDetails(callDetails, callerInfo, newIncident) {
		const nonClientDetails = {
			ivrOptionCode: callDetails.ivrOptionCode,
			incomingTelephoneNumber: callDetails.incomingTelephoneNumber,
			firstName: callerInfo.nonClientFirstName,
			surname: callerInfo.nonClientSurName,
			cellPhone: callerInfo.nonClientCellPhone
		};
		const returnValue = await this.incidentService.updateIncidentNonClientDetails(newIncident.incidentRecId, nonClientDetails);

		if (returnValue.succeeded) {
			return true;
		}
	}
}