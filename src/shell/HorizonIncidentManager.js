import { CAUSE_CODE_BY_ROLE, CLOSE_REASONS, HORIZON_NEED_STATUS, REASON_RESOLUTIONS } from 'app/constants/IncidentManager';
import { Component, View } from 'platform/elements';
import { Configuration, Logger, SecurityContext } from 'platform/core';
import { HorizonStore } from 'app/store/HorizonStore';
import { HorizonTelemetry } from 'app/services/HorizonTelemetryService';
import { HttpStatusError } from 'platform/core/errors/HttpStatusError';
import { IncidentDetails } from 'app/models/IncidentDetails';
import { IncidentManagementService } from 'app/services/IncidentManagementService';
import { RoleManager } from 'app/shell/RoleManager';
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
		this.checkIncidentStatus = true;

		this._toggleBusyFunc = null;

		this._configuration = Configuration.getInstance();
		this.logger = Logger.getInstance();
		this.securityContext = SecurityContext.getInstance();
		this.telemetry = HorizonTelemetry.getInstance();
		this.incidentService = new IncidentManagementService(null, () => true);

		// Incident Details Object that will be persisted in state
		this.incidentDetails = {};

		// Incident State
		this.horizonStore = HorizonStore.getInstance();
		this.stateChangeSub = this.horizonStore.stateChanged.subscribe(state => this._stateChanged(state));
		this.state = null;
	}

	_stateChanged(state) {
		if (state?.incidentDetails) {
			this.incidentDetails = state.incidentDetails;
			return;
		} 

		this.incidentDetails = {};
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Sets up a new primary incident and persists it to state. Horizon can continue without an incident
	 * There is therefore an incidentCreated flag to signal if an incident was not created.
	 * 
	 * @param {object} incident A new primary incident
	 * @param {string} initialNeed The initial need
	 * @param {Boolean} incidentCreated Flag to indicate if an incident was actually created
	 * 
	 * @returns {object} The primary incident object
	 */
	setNewPrimaryIncident(incident, initialNeed, incidentCreated) {
		this.incidentDetails = new IncidentDetails(
			incident, // current Incident
			incident, // current Incident
			initialNeed, // current Need
			``,
			`Not Started`,
			``,
			false,
			incidentCreated, // Flag to indicate if an incident was actually created
			``
		);
	
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		return this.primaryIncident;
	}

	/**
	 * Gets a value indicating whether an incident has been created yet. All incidents may be closed
	 * but we may still be in a session where we can create further sub-incidents off the primary incident
	 * This flag indicates if this is the case
	 * @returns {boolean} A value indicating if an incident has been created yet
	 */
	get isAnIncidentCreated() {
		return this.incidentDetails.incCreated && this.incidentDetails.incCreated;
	}

	/**
	 * Gets the Primary Incident (i.e. the initial incident created to which all other incidents are linked)
	 * 
	 * @returns {object} An object containing the primary incident
	 */
	get primaryIncident() {
		if (!this.incidentDetails?.primaryIncident) {
			return null;
		}

		return { 
			...this.incidentDetails.primaryIncident,
			toString: function toString () { 
				return this.incidentReference;
			}
		};
	}
	
	/**
	 * Gets the current incident. This could be a sub-incident of the primary incident
	 * 
	 * @returns {object} An object containing the current incident
	 */
	 get currentIncident() {
			if (!this.incidentDetails?.currentIncident) {
				return null;
			}

			return {
				...this.incidentDetails.currentIncident,
				toString: function toString () { 
					return this.incidentReference;
			}
		};
	};
	
	/**
	 * Updates the state of the current incident
	 * 
	 * @param {Object} currentIncident An object containing incidentId & incidentReference of the current incident.
	 */
	set currentIncident(currentIncident) {
		this.incidentDetails.currentIncident = currentIncident;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	/**
	 * 
	 * @returns {string} A value indicating the state (progress) of the current incident
	 */
	get incidentState() {
		if (!this.incidentDetails?.incidentState) {
			return null;
		}

		return this.incidentDetails.incidentState;
	}

	/**
	 * Updates the state of the current incident
	 * 
	 * @param {'InProgress'|'Completed'|'Assigned'|'Failed'|'Not Started'|'Closed'} incidentState A value indicating the state of the current incident.
	 */
	set incidentState(incidentState) {
		this.incidentDetails.incidentState = incidentState;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
	}

	/**
	 * Gets a string indicating the need (area) being addressed by the current incident
	 * @returns {string} The need associated with the current incident
	 */
	getCurrentNeed() {
		if (!this.incidentDetails?.currentNeed) {
			return null;
		}

		return this.incidentDetails.currentNeed;
	}

	/**
	 *  Sets the need being addressed by the current incident
	 * 
	 * @param {string} currentNeed The need being addressed by the current incident
	 * @returns {undefined}
	 */
	setCurrentNeed(currentNeed) {
		this.incidentDetails.currentNeed = currentNeed;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
		return currentNeed;
	}

	/**
	 * Returns feedback...
	 * 
	 * @returns {string} Feedback on the current incident
	 */
	getFeedback() {
		if (isNullorEmpty(this.incidentDetails?.feedback)) {
			return null;
		}

		return this.incidentDetails.feedback;
	}

	setFeedback(feedback) {
		this.incidentDetails.feedback = feedback;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
		return feedback;
	}

	/**
	 * Gets the text on the description field of the incident
	 * 
	 * @returns {string} The description field of the incident
	 */
	getDescription () {
		if (!this.incidentDetails?.description) {
			return null;
		}

		return this.incidentDetails.description;
	}

	/**
	 * Updates the text on the description field of the incident
	 * 
	 * @param {string} description Text to store on the description field of the incident
	 * @returns {string} The description field of the incident
	 */
	setDescription (description) {
		this.incidentDetails.description = description;
		this.horizonStore.setIncidentDetails(this.incidentDetails);
		return description;
	}

	/**
	 * Indicates if the incident has been re-assigned
	 * @returns {bool} True if the incident has been re=assigned.
	 */
	get isReassigned() {
		if (!this.incidentDetails?.isReassigned) {
			return null;
		}

		return this.incidentDetails.isReassigned;
	}

	set isReassigned(isReassigned) {
		this.incidentDetails.isReassigned = isReassigned;
		this.horizonStore.setIsIncidentReassigned(isReassigned);
		return this.incidentDetails.isReassigned;
	}

	/**
	 * Gets full incident management state object.
	 * 
	 * @returns {object} The inicident management state object
	 * 
	 * @deprecated Rather than pass the full incident state object around, retrieve and update only the information required.
	 */
	getIncidentDetails() {
		return {
			...this.incidentDetails,
			primaryIncident: {
				...this.incidentDetails.primaryIncident,
				toString: function toString () { 
					return this.incidentReference;
				}
			},
			currentIncident: {
				...this.incidentDetails.currentIncident,
				toString: function toString () { 
					return this.incidentReference;
				}
			}
		};
	}


	initialise() {
		Component.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		View.prototype.HORIZON_NEED_STATUS = HORIZON_NEED_STATUS;
		
		Component.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		Component.prototype.createAndClassifySubIncident = (toggleBusyFlag, incidentCategorization = null, classify = true) => this.createAndClassifySubIncident(toggleBusyFlag, incidentCategorization, classify);
		Component.prototype.closeIncident = (options, toggleBusyFlag, errorHandler) => this.closeIncident(options, toggleBusyFlag, errorHandler);
		Component.prototype.classifyIncident = (toggleBusyFlag, incidentCategorization, errorHandler) => this.classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler);

		View.prototype._inicidentManager_ = (clientNeed, toggleBusyFlag) => this._handleMultipleNeed(clientNeed, toggleBusyFlag);
		View.prototype.createAndClassifySubIncident = (toggleBusyFlag, incidentCategorization = null, classify = true) => this.createAndClassifySubIncident(toggleBusyFlag, incidentCategorization, classify);
		View.prototype.closeIncident = (options, toggleBusyFlag, errorHandler) => this.closeIncident(options, toggleBusyFlag, errorHandler);
		View.prototype.classifyIncident = (toggleBusyFlag, incidentCategorization, errorHandler) => this.classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler);
	}

	async _handleMultipleNeed (clientNeed, toggleBusyFlag) {
		const horizonIncidentManager = HorizonIncidentManager.getInstance();

		const currentNeed = horizonIncidentManager.getCurrentNeed();
		const incidentState = horizonIncidentManager.incidentState;

		/**
		 * Checkpoint 1:
		 * When we reload the same need. i.e., example: assume opening proof of account modal,
		 * cancelling it and re-opening the modal
		 * 
		 * New case: possible to open search other needs more than once.
		 */

		const finalStates = [HORIZON_NEED_STATUS.CLOSED, HORIZON_NEED_STATUS.COMPLETED, HORIZON_NEED_STATUS.ASSIGNED, HORIZON_NEED_STATUS.FAILED];
		if (clientNeed === currentNeed && !finalStates.includes(incidentState)) {
			horizonIncidentManager.incidentState = HORIZON_NEED_STATUS.INPROGRESS;
			return true;
		}

		/**
		 * Checkpoint 2:
		 * When need is In-Progress and toggling between needs should not create new incident
		 * Example: Landing on favourites screen, choosing proof of account instead of statments
		 * In such case, we update the state with correct need
		 */
		if (clientNeed !== currentNeed && 
			(incidentState === HORIZON_NEED_STATUS.INPROGRESS ||
				incidentState === HORIZON_NEED_STATUS.NOT_STARTED)) {
				
				horizonIncidentManager.setCurrentNeed(clientNeed);
				horizonIncidentManager.incidentState = HORIZON_NEED_STATUS.INPROGRESS;
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
		 if (clientNeed !== currentNeed &&
			(incidentState === HORIZON_NEED_STATUS.COMPLETED ||
			incidentState === HORIZON_NEED_STATUS.ASSIGNED ||
			incidentState === HORIZON_NEED_STATUS.FAILED)) {

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
		if (incidentState === HORIZON_NEED_STATUS.CLOSED) {

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
	 * @returns {Promise<void>} A promise to create and classify a sub-incident
	 */
	 async createAndClassifySubIncident(toggleBusyFlag, incidentCategorization = null, classify = true) {
		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		/**
		 * Stopping creation of subsequent incident when
		 * 1. This is being triggered for primary incident
		 * 2. State has an unclosed incident i.e., incident ref number not equals null
		 */
		if (!this._validIncident(this.primaryIncident)) {
			// We don't have a primary incident
			return;
		};

		// assume for now we have a current incident that might not be closed or closable
		this.checkIncidentStatus = true;

		if (!this._validIncident(this.currentIncident)) {
			const callerInfo = this.horizonStore.getCallerInformation();
			const callDetails = this.horizonStore.getIncomingCallDetails();
			const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
			const createIncidentRequest = {
				incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
				VDN: incomingCallDetails.VDN,
				voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
				primaryNeedIncident: this.primaryIncident
			};
			const returnValue = await this.incidentService.createIncident(createIncidentRequest);
			if (!returnValue.succeeded || !returnValue.result) {
				const ex = returnValue.exception;
				if (ex && ex instanceof HttpStatusError) {
					this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${incomingCallDetails.incomingTelephoneNumber}, VDN: ${incomingCallDetails.VDN}, VoiceRef: ${incomingCallDetails.voiceReferenceNumber}, Primary Incident: ${primaryIncident.toString()}, correlationId: ${ex.correlationId}`);
				}
				this.logger.log(`warning`, `Failed to create incident. The call will be handled without incident data being tracked.`, `HorizonIncidentManager._createSubIncident`, returnValue.correlationId);
				incidentDetails.incCreated = returnValue.succeeded;
				this.horizonStore.setIncidentDetails(incidentDetails);
				return;
			}

			// We have created a new incident, no need to check its state
			this.checkIncidentStatus = false;
			this.currentIncident = returnValue.result?.incident;
			await this.telemetry.logEvent(SubsequentNeedEvents.SUBSEQUENT_INCIDENT, {
				"parent-incident-reference": this.primaryIncident.toString(),
				"child-incident-reference": this.currentIncident.toString(),
				"child-incident-rec-id": this.currentIncident.incidentId
			}, true);
			if (callerInfo.is3rdParty || !callerInfo.isNonClient) {
				await this._updateSubsequentNeedClientDetails(callDetails, callerInfo);
			} else {
				await this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo);
		} 
		}

			// We don't have a valid current incident

		if (classify) {
			const incidentDetails = this.getIncidentDetails();
			let canClassify = !this.checkIncidentStatus;
			this.incidentService._toggleBusyFlag = toggleBusyFlag;
			if (this.checkIncidentStatus) {
				const incidentInfo = await this._incidentStatus(this.currentIncident);
				canClassify = isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue);
			}
			const needAction = STRACK_MAPPING[this.getCurrentNeed()];
			if (canClassify && (!isNullorEmpty(needAction) || !isNullorEmpty(incidentCategorization))) {
				const returnValue = await this.incidentService.classifyIncident(this.currentIncident, needAction, incidentCategorization, errorHandler);
				if (!returnValue.succeeded) {
					this.logger.log(`warning`, `Failed to classify incident. Agent may have to manually categorize at STrack. RecID: ${this.currentIncident.incidentId}, CurrentNeed: ${this.getCurrentNeed()}`, `classifyIncident`, returnValue.correlationId);
					return;
				}
			}
			this.checkIncidentStatus = true;
			this.incidentService._toggleBusyFlag = toggleBusyFlag;
			incidentCategorization = incidentCategorization || {};
			let endCallReason = {};
			const incidentInfo = await this._incidentStatus(this.currentIncident);
			if (this._isReassigned(incidentInfo)) {
				this.logger.log(`warning`, `Incident manager: ${this.currentIncident.toString()} is reassigned, skipping close incident`, `closeIncident`, null);
				return true;
			}
			if (isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue)) {
				this.checkIncidentStatus = false;
			}
			const reason = isNullorEmpty(endCallReason.key) ? CLOSE_REASONS[this.incidentDetails.incidentState] : endCallReason.key;
			const resolution = this._getResolution(incidentInfo.resolution, this.incidentDetails, null, incidentCategorization);
			const causeCode = this._getCauseCode(incidentInfo.causeCode, endCallReason.value || REASON_RESOLUTIONS[RoleManager.getInstance().orgUnit][reason], incidentCategorization);
			const returnValue = await this.incidentService.closeIncident(
				this.currentIncident,
				reason,
				resolution,
				causeCode,
				this.incidentDetails.description,
				errorHandler
			);
			if (returnValue.succeeded) {
				this._updateIncidentState(null);
				return;
			}
			this.logger.log(`warning`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
		}
	}


	_validIncident (incident) {
		return Boolean(incident) && Object.keys(incident).length !== 0;
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
		
		if (!this._validIncident(this.currentIncident)) {
			this.logger.log(`error`, `There is no incident to close`, `closeIncident`);
			return true;
		}

		const incidentInfo = await this._incidentStatus(this.currentIncident);

		if (this._isReassigned(incidentInfo)) {
			this.logger.log(`warning`, `Incident manager: ${this.currentIncident.toString()} is reassigned, skipping close incident`, `closeIncident`, null);
			return true;
		}
	
		if (isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue)) {
			this.checkIncidentStatus = false;
			// Incident is not classified. Trying to classify before closing
			await this.classifyIncident(toggleBusyFlag, manualClassification, errorHandler);
		}

		 const reason = isNullorEmpty(endCallReason.key) ? CLOSE_REASONS[this.incidentDetails.incidentState] : endCallReason.key;
		 const resolution = this._getResolution(incidentInfo.resolution, this.incidentDetails, endCallReason, manualClassification);
		 const causeCode = this._getCauseCode(incidentInfo.causeCode, endCallReason.value || REASON_RESOLUTIONS[RoleManager.getInstance().orgUnit][reason], manualClassification);

		const returnValue = await this.incidentService.closeIncident(
			this.currentIncident, 
			reason,
			resolution,
			causeCode, 
			this.incidentDetails.description,
			errorHandler
		);

		if (!returnValue.succeeded) {
			this.logger.log(`warning`, `Failed to close incident. Agent may have to manually close incident.`, `_closePrimaryIncident`, returnValue.correlationId);
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
	 * @returns {Promise<void>} A promise to classify an incident
	 */
	 async classifyIncident(toggleBusyFlag, incidentCategorization, errorHandler = null) {
		const incidentDetails = this.getIncidentDetails();

		if (!this._validIncident(this.currentIncident)) {
			this.logger.log(`warning`, `Incident manager: No active incident to classify. Current need: ${incidentDetails.currentNeed} previous need: ${incidentDetails.previousNeed}`, `classifyIncident`, null);
			return;
		}

		let canClassify = !this.checkIncidentStatus;

		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		if (!this._validIncident(this.currentIncident)) {
			// If incident details is empty, do nothing and return.
			return;
		}

		if (this.checkIncidentStatus) {
			const incidentInfo = await this._incidentStatus(this.currentIncident);
			canClassify = isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue);
		}

		const needAction = STRACK_MAPPING[this.getCurrentNeed()];

		if (canClassify && (!isNullorEmpty(needAction) || !isNullorEmpty(incidentCategorization))) {
			const returnValue = await this.incidentService.classifyIncident(this.currentIncident, needAction, incidentCategorization, errorHandler);
	
			if (!returnValue.succeeded) {
				this.logger.log(`warning`, `Failed to classify incident. Agent may have to manually categorize at STrack. RecID: ${this.currentIncident.incidentId}, CurrentNeed: ${this.getCurrentNeed()}`, `classifyIncident`, returnValue.correlationId);
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
		const reason = CLOSE_REASONS[incidentDetails.incidentState];
		let resolution = ``;

		if (endCallReason.getResolution) {
			resolution = endCallReason.getResolution(manualClassification.issue);
		}
		resolution = resolution || endCallReason.value || REASON_RESOLUTIONS[RoleManager.getInstance().orgUnit][reason];

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

		const causeCodeByReasons = CAUSE_CODE_BY_ROLE[RoleManager.getInstance().orgUnit];
		const getFromValObj = (reason) => causeCodeByReasons[reason][manualClassification.issue] || ``;

		if (causeCodeByReasons[endCallReason]) {
			causeCodeByReason = typeof causeCodeByReasons[endCallReason] === `object`
								? getFromValObj(endCallReason)
								: causeCodeByReasons[endCallReason];
		}
		return causeCode || causeCodeByReason || `NormalEnquiry`;
	}

	_updateIncidentState(clientNeed) {
		const incidentDetails = this.getIncidentDetails();
		
		const curIncidentDetails = new IncidentDetails(
			null,
			this.primaryIncident,
			clientNeed,
			incidentDetails.currentNeed,
			`InProgress`,
			``,
			false,
			incidentDetails.incCreated,
			``// resetting description once incident is closed
		);

		this.horizonStore.setIncidentDetails(curIncidentDetails);
	}

	async _incidentStatus(incident) {
		const returnValue = await this.incidentService.incidentStatus(incident);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);
			return {};
	}
		
	async _createSubIncident() {
		const callerInfo = this.horizonStore.getCallerInformation();
		const callDetails = this.horizonStore.getIncomingCallDetails();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();
		
		const createIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryNeedIncident: this.primaryIncident
		};

		const returnValue = await this.incidentService.createIncident(createIncidentRequest);
		
		if (!returnValue.succeeded || !returnValue.result) {
			const ex = returnValue.exception;

			if (ex && ex instanceof HttpStatusError) {
				this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${incomingCallDetails.incomingTelephoneNumber}, VDN: ${incomingCallDetails.VDN}, VoiceRef: ${incomingCallDetails.voiceReferenceNumber}, Primary Incident: ${primaryIncident.toString()}, correlationId: ${ex.correlationId}`);
			} 
			
			this.logger.log(`warning`, `Failed to create incident. The call will be handled without incident data being tracked.`, `HorizonIncidentManager._createSubIncident`, returnValue.correlationId);

			// updating inc creation status to state
			incidentDetails.incCreated = returnValue.succeeded;
			this.horizonStore.setIncidentDetails(incidentDetails);
			
			return null;
		}
		
		this.checkIncidentStatus = false;

		this.currentIncident = returnValue.result?.incident;
		
		await this.telemetry.logEvent(SubsequentNeedEvents.SUBSEQUENT_INCIDENT, {
			"parent-incident-reference": this.primaryIncident.toString(),
			"child-incident-reference": this.currentIncident.toString(),
			"child-incident-rec-id": this.currentIncident.incidentId
		}, true);
		
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
		if (!this._validIncident(this.currentIncident)) {
			this.logger.log(`error`, `There is no incident available against which to record the client details`, `_updateSubsequentNeedClientDetails`);
			return;
		}

		const returnValue = await this.incidentService.updateIncidentClientDetails(callerInfo.cifNumber, this.currentIncident);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedClientDetails`, returnValue.correlationId);
		} 

		if (callerInfo.is3rdParty) {
			this._updateSubsequentNeedNonClientDetails(callDetails, callerInfo);
		}

		if (callerInfo.isBranchConsultant) {
			await this._updateIncidentBranchDetails(this.currentIncident, callerInfo.branchCode, callerInfo.branchCallerID);
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
		if (!this._validIncident(this.currentIncident)) {
			this.logger.log(`error`, `There is no incident available against which to record the client details`, `_updateSubsequentNeedNonClientDetails`);
			return;
		}

		const nonClientDetails = {
			firstName: callerInfo.nonClientFirstName,
			surname: callerInfo.nonClientSurName,
			cellPhone: callerInfo.nonClientCellPhone
		};

		const returnValue = await this.incidentService.updateIncidentNonClientDetails(this.currentIncident, nonClientDetails);

		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update client details on incident due to a system error`, `_updateSubsequentNeedNonClientDetails`, returnValue.correlationId);
		}
	}

	async _updateIncidentBranchDetails(incident, branchCode, branchCallerID) {
		
		const returnValue = await this.incidentService.UpdateIncidentBranchDetailsRequest(incident, branchCode, branchCallerID);
		
		if (!returnValue.succeeded) {
			this.logger.log(`error`, `Unable to update branch caller details on incident due to a system error`, `_updateIncidentBranchDetails`, returnValue.correlationId);
			return false;
		}
		return true;
	}

	_isValidPrimaryIncRecID(recID) {
		return Boolean(recID) && recID !== `0`;
	}

	async createPrimaryInc(errorHandler) {
		const callerInfo = this.horizonStore.getCallerInformation();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();

		const request = {
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			clientCIF: callerInfo.cifNumber,
			VDN: incomingCallDetails.VDN,
			nonClientFullName: `${callerInfo.nonClientFirstName} ${callerInfo.nonClientSurName}`,
			nonClientIDNumber: ``,
			nonClientCellPhone: callerInfo.nonClientCellPhone,
			nonClientWorkPhone: ``,
			nonClientEmail: ``
		};

		const returnValue = await this.incidentService.createIncident(request, (ex) => errorHandler(ex), 1);
		const incident = returnValue.result?.incident;

		if (!returnValue.succeeded || !incident) {
			const ex = returnValue.exception;

			if (ex && ex instanceof HttpStatusError) {
				this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${incomingCallDetails.incomingTelephoneNumber}, VDN: ${incomingCallDetails.VDN}, VoiceRef: ${newCallInfo.voiceReferenceNumber}, correlationId: ${ex.correlationId}`);
			} 

		 	this.logger.log(`error`, `Failed to create incident on new call`, `_createIncident`, returnValue.correlationId);
		} else if (callerInfo.isBranchConsultant) {
			await this._updateIncidentBranchDetails(this.currentIncident, callerInfo.branchCode, callerInfo.branchCallerID);
		}

		return incident;
	}
}