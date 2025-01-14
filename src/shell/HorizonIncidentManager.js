import { CAUSE_CODE_BY_ROLE, CLOSE_REASONS, HORIZON_INCIDENT_STATE, REASON_RESOLUTIONS } from 'app/constants/IncidentManager';
import { Configuration, Logger, SecurityContext } from 'platform/core';
import { AcceptCallEvents } from 'app/constants/telemetry/events/AcceptCall';
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
	 * Creates a new Primary Incident. Called at the start of a phone call
	 * 
	 * @param {function} toggleBusyFlag A function that toggles the busy flag for the display calling this method
	 * @param {object} newCallInfo The call information that must be recofded on the incident 
	 * @returns {Promise<boolean>} A promise for a bollean that indicates if a primary incident was created.
	 */
	async createPrimaryIncident(toggleBusyFlag, newCallInfo) {
		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		const returnValue = await this.incidentService.createIncident(newCallInfo, () => true, 1);
		const incident = returnValue.result?.incident;

		if (!returnValue.succeeded || !incident) {
			const ex = returnValue.exception;

			if (ex && ex instanceof HttpStatusError) {
				this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${newCallInfo.incomingTelephoneNumber}, VDN: ${newCallInfo.VDN}, VoiceRef: ${newCallInfo.voiceReferenceNumber}, correlationId: ${ex.correlationId}`);
			}

			this.logger.log(`error`, `Failed to create incident on new call`, `_createIncident`, returnValue.correlationId);
		}

		if (incident) {
			await this.telemetry.logEvent(AcceptCallEvents.INCIDENT_CREATED, {
				"incident-reference": incident.incidentReference,
				"incident-rec-id": incident.incidentId
			}, true);

			this._setNewPrimaryIncident(incident, newCallInfo.ivrOptionCode, true);
		}

		return incident;
	}

	/**
	 * Gets a value indicating whether the primary incident has been created yet. All incidents may be closed
	 * but we may still be in a session where we can create further sub-incidents off the primary incident
	 * This flag indicates if this is the case. The flag is now essentially just used as an assist when
	 * deciding whether or not we can display the incident reference number
	 * @returns {boolean} A value indicating if an incident has been created yet
	 */
	get isPrimaryIncidentCreated() {
		return this.incidentDetails.primaryIncidentCreated && this.incidentDetails.primaryIncidentCreated;
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
			toString: function toString() {
				return this.interaction;
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
			toString: function toString() {
				return this.interaction;
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
 * @returns {string} A value indicating the final state of the current incident
 */
	get incidentState() {
		if (!this.incidentDetails?.incidentState) {
			return null;
		}

		return this.incidentDetails.incidentState;
	}

	/**
	 * Updates the final state of the current incident
	 * 
	 * @param {'Completed'|'Assigned'|'Failed'|'Closed'} incidentState A value indicating the final state of the current incident.
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

	/**
	 * Sets the feedback notes for the current incident
	 * 
	 * @param {string} feedback - Sets the feedback for the current incident
	 * @returns {undefined}
	 */
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
	getDescription() {
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
	setDescription(description) {
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
				toString: function toString() {
					return this.Interaction;
				}
			},
			currentIncident: {
				...this.incidentDetails.currentIncident,
				toString: function toString() {
					return this.Interaction;
				}
			}
		};
	}

	/**
	 * This routine is used to create a new Incident for systems other than Horizon.
	 * 
	 * @param {function} errorHandler Error handler function to call should creation fail 
	 * @returns {Promise<object>} The newly created incident
	 */
	async createExternalIncident(errorHandler) {
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

	/**
	 * Creates and classifies an incident in a single. Any previous incident is automatically closed.
	 * The incident is classified based in the need stored in session state
	 * 
	 * @param {function} [toggleBusyFlag = null] toggleBusyFlag An optional error handler fucntion to call on a failure
	 * @param {string} [closeType = `Completed`]  The state (Completed|Failed|Assigned) of the current incident
	 * @returns {promise<void>} A promise to create and classify an incident
	 */
	async autoCreateAndClassify(toggleBusyFlag = null, closeType = HORIZON_INCIDENT_STATE.COMPLETED) {
		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		const currentNeed = this.getCurrentNeed();

		if (!this._validIncident(this.primaryIncident)) {
			console.log(`autoCreateAndClassify: There is no valid primary incident. Incident managment cannot proceed!`);
			return false;
		};

		if (isNullorEmpty(currentNeed)) {
			console.log(`autoCreateAndClassify: no current need set`);
			return false;
		}

		console.log(`autoCreateAndClassify: Classifying need: ${currentNeed}`);

		await this._closeAndCreate();
		await this._classifyIncidentByNeed(closeType);
	}

	/**
	 * Creates and classifies an incident in a single. Any previous incident is automatically closed.
	 * The classification information must be explicitly passed
	 * 
	 * @param {function} [toggleBusyFlag = null] toggleBusyFlag An optional error handler fucntion to call on a failure
	 * @param {object} incidentCategorization  Object holds category, subcategory & issue that needs to be updated for an incident
	 * @param {string} [closeType = `Completed`]  The state (Completed|Failed|Assigned) of the current incident
	 * @returns {promise<void>} A promise to create and classify an incident
	 */
	async manualCreateAndClassify(toggleBusyFlag, incidentCategorization, closeType = HORIZON_INCIDENT_STATE.COMPLETED) {
		this.incidentService._toggleBusyFlag = toggleBusyFlag;

		if (!this._validIncident(this.primaryIncident)) {
			console.log(`manualCreateAndClassify: There is no valid primary incident. Incident managment cannot proceed!`);
			return false;
		};

		if (this._isIncidentClassified(incidentCategorization)) {
			console.log(`manualCreateAndClassify: incidentCategorization data not supplied`);
			return false;
		}

		console.log(`manualCreateAndClassify: Classifying manually ${incidentCategorization}`);

		await this._closeAndCreate(incidentCategorization);
		await this._classifyIncidentManually(incidentCategorization, closeType);
	}

	/**
	 * Classifies/Categorizes the incident based on need action or incident categorization object
	 * 
	 * @param {Function} toggleBusyFlag Toggle busy flag function
	 * @param {Object} incidentCategorization Object holds category, subcategory & issue that needs to be updated for an incident
	 * @param {Function} errorHandler Custom error handling function
	 * @returns {Promise<void>} A promise to classify an incident
	 * @deprecated Call the autoCreateAndClassfiy or manualCreateAndClassify methods where possible.
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
				this.logger.log(`warning`, `Failed to classify incident. ID: ${this.currentIncident.incidentId}, CurrentNeed: ${this.getCurrentNeed()}`, `classifyIncident`, returnValue.correlationId);
				return;
			}

			console.log(`Classified incident: ${this.currentIncident.toString()}`);
		}

		this.checkIncidentStatus = true;
	}

	/**
	 * Sets the state of the current incident to assigned. 
	 * The incident should already have been classified before calling this method.
	 * This method may be used to update the incident state when assigning an incident 
	 * externally from this class (e.g. The stap card channel service has an assign method 
	 * that will assign the Strack incident to a team)
	 * 
	 * @returns {undefined}
	 */
	incidentAssigned() {
		if (this._validIncident(this.currentIncident)) {
			this.incidentDetails.closeType = HORIZON_INCIDENT_STATE.ASSIGNED;
			this.horizonStore.setIncidentDetails(this.incidentDetails);
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
	 * @returns {Promise<boolean>} - true/ false, indicating close incident status
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

		console.log(`Closed incident ${this.currentIncident.toString()}`);

		this._updateIncidentState(clientNeed);

		if (!returnValue.succeeded) {
			this.logger.log(`warning`, `Failed to close incident..`, `closeIncident`, returnValue.correlationId);
			return false;
		}

		return true;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	/**
	 * Sets up a new primary incident and persists it to state. Horizon can continue without an incident
	 * There is therefore an incidentCreated flag to signal if an incident was not created.
	 * 
	 * @param {object} incident A new primary incident
	 * @param {string} initialNeed The initial need
	 * @param {Boolean} incidentCreated Flag to indicate if the primary incident was created
	 * 
	 * @returns {object} The primary incident object
	 */
	_setNewPrimaryIncident(incident, initialNeed, incidentCreated) {
		this.incidentDetails = new IncidentDetails(
			incident, // current Incident
			incident, // current Incident
			initialNeed, // current Need
			``,
			null,
			``,
			false,
			incidentCreated, // Flag to indicate if the primary incident was successfully created
			``,
			false
		);

		this.horizonStore.setIncidentDetails(this.incidentDetails);

		return this.primaryIncident;
	}

	async _closeAndCreate(manualClassification = {}) {
		const callerInfo = this.horizonStore.getCallerInformation();
		const incomingCallDetails = this.horizonStore.getIncomingCallDetails();

		// If still on the primary incident then there is no previous incident to close
		if (this.incidentDetails.primaryIncidentFinished) {
			// Close previous incident
			await this._closePreviousIncident(manualClassification);

			// and start a new one
			if (!await this._createNewIncident(incomingCallDetails)) {
				return false;
			}

			await this.telemetry.logEvent(SubsequentNeedEvents.SUBSEQUENT_INCIDENT, {
				"parent-incident-reference": this.primaryIncident.toString(),
				"child-incident-reference": this.currentIncident.toString(),
				"child-incident-rec-id": this.currentIncident.incidentId
			}, true);
		}

		// Add the client, 3rd party, branch caller and non-client information to the incident
		if (this._callerIsACapitecClient(incomingCallDetails)) {
			await this._updateSubsequentNeedClientDetails(incomingCallDetails, callerInfo);
		} else {
			await this._updateSubsequentNeedNonClientDetails(incomingCallDetails, callerInfo);
		}

		return true;
	}

	async _classifyIncidentByNeed(closeType) {
		const currentNeed = this.getCurrentNeed();
		const needAction = STRACK_MAPPING[currentNeed];

		if (isNullorEmpty(needAction)) {
			console.log(`_classifyIncidentByNeed: cannot map need ${currentNeed} to a need action`);
			return false;
		}

		const returnValue = await this.incidentService.classifyIncident(this.currentIncident, needAction, null, () => true);
		if (!returnValue.succeeded) {
			console.log(`warning`, `Failed to classify incident! ID: ${this.currentIncident.incidentId}, CurrentNeed: ${currentNeed}`, `_classifyIncidentByNeed`, returnValue.correlationId);
			this.logger.log(`warning`, `Failed to classify incident! ID: ${this.currentIncident.incidentId}, CurrentNeed: ${currentNeed}`, `_classifyIncidentByNeed`, returnValue.correlationId);
		}

		console.log(`Classified Interaction (${this.currentIncident.interaction}, ${this.currentIncident.currentInteractionItem})`);

		// By default we create a new incident in the 'Completed' state but it could be failed etc.
		if (!this.incidentDetails.primaryIncidentFinished) {
			this.incidentDetails.primaryIncident.currentInteractionItem = returnValue.result.incident.currentInteractionItem;
		}

		this.incidentDetails.primaryIncidentFinished = true;
		this.incidentDetails.closeType = closeType;
		this.incidentDetails.currentIncident.currentInteractionItem = returnValue.result.incident.currentInteractionItem;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		return returnValue.succeeded;
	}

	async _classifyIncidentManually(incidentCategorization, closeType) {
		const returnValue = await this.incidentService.classifyIncident(this.currentIncident, null, incidentCategorization, () => true);
		if (!returnValue.succeeded) {
			this.logger.log(`warning`, `Failed to manually classify incident! ID: ${this.currentIncident.incidentId}}`, `_classifyIncidentManually`, returnValue.correlationId);
		}

		this.incidentDetails.primaryIncidentFinished = true;
		this.incidentDetails.closeType = closeType;
		this.horizonStore.setIncidentDetails(this.incidentDetails);

		return returnValue.succeeded;
	}

	/**
	 * Closes the current incident befpre startog a new incident. This routine is not
	 * used to close the final incident on ending the call.
	 * 
	 * @param { object } [manualClassification = {}] Manual Classification if not using auto classification
	 * @returns { Promise<boolean> } Returns true if the previous incident was successfully closed
	 */
	async _closePreviousIncident(manualClassification = {}) {
		// retrieve incicdent information that may have been updated in Strack/Interaction DB outside of Horizon
		const incidentInfo = await this._incidentStatus(this.currentIncident);

		const reason = CLOSE_REASONS[this.incidentDetails.closeType];

		const orgUnit = RoleManager.getInstance().orgUnit;
		const resolutions = REASON_RESOLUTIONS[orgUnit];

		const resolution = this._concatenate(incidentInfo.resolution, resolutions[reason]);

		const causeCode = this._getCauseCodeForPreviousIncident(incidentInfo.causeCode, reason, manualClassification);

		const returnValue = await this.incidentService.closeIncident(
			this.currentIncident,
			reason,
			resolution,
			causeCode,
			this.incidentDetails.description,
			() => true
		);

		console.log(`Closed Interaction Item: (${this.currentIncident.interaction}, ${this.currentIncident.currentInteractionItem})`);

		this._updateIncidentState(this.getCurrentNeed());

		if (!returnValue.succeeded) {
			this.logger.log(`warning`, `Failed to close incident.`, `_closePreviousIncident`, returnValue.correlationId);
			return false;
		}

		return true;
	}

	/**
	 * Creates a new incident for the given incoming call details. 
	 * 
	 * @param {object} incomingCallDetails The basic details on an incoming call to add to the new incident
	 * @returns {promise<boolean>} True if a new incident was created
	 */
	async _createNewIncident(incomingCallDetails) {
		const createIncidentRequest = {
			incomingTelephoneNumber: incomingCallDetails.incomingTelephoneNumber,
			VDN: incomingCallDetails.VDN,
			voiceReferenceNumber: incomingCallDetails.voiceReferenceNumber,
			primaryNeedIncident: this.primaryIncident
		};

		const returnValue = await this.incidentService.createIncident(createIncidentRequest, () => true);

		if (!returnValue.succeeded || !returnValue.result) {
			const ex = returnValue.exception;

			if (ex && ex instanceof HttpStatusError) {
				this.logger.log(`error`, `Failed to create incident: HttpStatus: ${ex.status}, CLI: ${incomingCallDetails.incomingTelephoneNumber}, VDN: ${incomingCallDetails.VDN}, VoiceRef: ${incomingCallDetails.voiceReferenceNumber}, Primary Incident: ${this.primaryIncident.toString()}, correlationId: ${ex.correlationId}`);
			}

			this.logger.log(`warning`, `Failed to create incident. The call will be handled without incident data being tracked.`, `_createNewIncident`, returnValue.correlationId);
		}

		this.incidentDetails.currentIncident = returnValue.result?.incident;
		this.horizonStore.setIncidentDetails(this.incidentDetails); // Updates incidentDetails to indicate that we do not have a created incident

		console.log(`Created new Interaction Item (${this.currentIncident?.interaction}, ${this.currentIncident?.currentInteractionItem})`);

		return this.currentIncident !== null;
	}

	/**
	 * Update an incident with the client/3rd-party/branch caller details
	 * 
	 * @param {object} callDetails - incoming call details object retrieved from state
	 * @param {object} callerInfo - Caller information object retrieved from state
	 * @returns {Promise<void>} A promise to update the client details on the incident
	 */
	async _updateSubsequentNeedClientDetails(callDetails, callerInfo) {
		const returnValue = await this.incidentService.updateIncidentClientDetails(callerInfo.cifNumber, this.currentIncident, () => true);

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
	 * @returns {Promise<void>} A promise to update the non-client details on an incident
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

		const returnValue = await this.incidentService.updateIncidentNonClientDetails(this.currentIncident, nonClientDetails, () => true);

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

	/**
	 * Determine the cause code for the previous inicident (i.e. the incident that is being closed)
	 * @param { string } existingCauseCode The cause code as currently recorded in Strack (only set if incident updated externally)
	 * @param { string } reason The close reason ('Completed', 'Failed' etc.) that will be used to look up the cause code
	 * @param { object } manualClassification The manual classiciation information if automatic classification is not being done
	 * @returns { string } The cause code to use on the incident beign closed
	 */
	_getCauseCodeForPreviousIncident(existingCauseCode, reason, manualClassification) {
		let causeCodeByReason = ``;

		const endCallReason = REASON_RESOLUTIONS[RoleManager.getInstance().orgUnit][reason];
		const causeCodeByReasons = CAUSE_CODE_BY_ROLE[RoleManager.getInstance().orgUnit];

		const getFromValObj = (endOfCallReason) => causeCodeByReasons[endOfCallReason][manualClassification.issue] || ``;

		if (causeCodeByReasons[endCallReason]) {
			causeCodeByReason = typeof causeCodeByReasons[endCallReason] === `object`
				? getFromValObj(endCallReason)
				: causeCodeByReasons[endCallReason];
		}

		return existingCauseCode || causeCodeByReason || `NormalEnquiry`;
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

	_isIncidentClassified(incidentInfo) {
		return !this._isObjectNullOrEmpty(incidentInfo) &&
			!(isNullorEmpty(incidentInfo.category) && isNullorEmpty(incidentInfo.subCategory) && isNullorEmpty(incidentInfo.issue));
	}

	_callerIsACapitecClient(incomingCallDetails) {
		return incomingCallDetails.is3rdParty || !incomingCallDetails.isNonClient;
	}

	_validIncident(incident) {
		return !this._isObjectNullOrEmpty(incident);
	}

	_isObjectNullOrEmpty(objectName) {
		return !objectName || (Object.keys(objectName).length === 0 && objectName.constructor === Object);
	};

	_isReassigned(incidentInfo) {
		if (!isNullorEmpty(incidentInfo?.owner)) {
			return incidentInfo.owner.toLocaleLowerCase() !== this.securityContext.username;
		}
	}

	_concatenate(str1, str2) {
		return str1 ? `${str1}\n${str2}` : `${str2}`;
	}

	_updateIncidentState(clientNeed) {
		const incidentDetails = this.getIncidentDetails();

		const curIncidentDetails = new IncidentDetails(
			null,
			this.primaryIncident,
			clientNeed,
			incidentDetails.currentNeed, // becomes the previous need
			null,
			``,
			false,
			incidentDetails.primaryincidentCreated,
			``, // resetting description once incident is closed
			incidentDetails.primaryIncidentFinished
		);

		this.horizonStore.setIncidentDetails(curIncidentDetails);
	}

	/**
	 * Loads the incident information as stored in STrack/the Interaction DB. This is done in case the 
	 * incident has been updated externally to Horizon
	 * 
	 * @param {object} incident The incident that needs to be checked
	 * @returns {Promise<object>} The existing incident information stored in the database
	 */
	async _incidentStatus(incident) {
		const returnValue = await this.incidentService.incidentStatus(incident, () => true);

		if (returnValue.succeeded) {
			return returnValue.result;
		}

		this.logger.log(`error`, `Failed to get incident status.`, `_incidentStatus`, returnValue.correlationId);

		return {};
	}

}