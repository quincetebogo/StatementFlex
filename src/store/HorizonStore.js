/**
 * The primary application state store
 * 
 * @module store/HorizonStore
 */

import { Store } from 'platform/core';

/**
 * HorizonStore customizes the plateform state storage capability for the Horizon applicaton.
 * The Horizon State Store is configured to use session storage.
 *
 * @extends {Store}
 */
export class HorizonStore extends Store {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonStore());
	}

	constructor() {
		super({
			name: `horizon-store`,
			persistence: `sessionStorage`,
			logStateChanges: false
		});

		// Internal subsciption ensures that this class always has the latest state
		this._appStoreSub = this.stateChanged.subscribe(state => this._restoreState(state));
	}

	// Ensures that this class always has the latest copy of state
	_restoreState(state) {
		this.state = state;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Retrieve information about the incoming/present call from state
	 * @returns {Object} An object containing information abut the incoming call
	 */
	getIncomingCallDetails() {
		if (this.state && this.state.incomingCallDetails) {
			return this.state.incomingCallDetails;
		}

		return null;
	}

	/**
	 * Persist informatino about the incoming/present call to state
	 * 
	 * @param {Object}  incomingCallDetails Information on the incoming/present call
	 * @returns {undefined} 
	 */
	setIncomingCallDetails(incomingCallDetails) {
		this.setState({ incomingCallDetails: incomingCallDetails });
	}

	/**
	 * Retrieve information about the incident details from state
	 * @returns {Object} An object containing information abut the incident
	 */
	getIncidentDetails() {
		if (this.state && this.state.incidentDetails) {
			return this.state.incidentDetails;
		}

		return null;
	}

	/**
	 * Persist information about the iincident details to state
	 * 
	 * @param {Object}  incidentDetails Information about the incidents details
	 * @returns {undefined} 
	 */
	setIncidentDetails(incidentDetails) {
		this.setState({ incidentDetails: incidentDetails });
	}

	getIsIncidentReassigned() {
		if (this.state && Object.hasOwnProperty.call(this.state, `isReassigned`)) {
			return this.state.isReassigned;
		}
		
		return false;
	}

	setIsIncidentReassigned(isReassigned) {
		this.setState({ isReassigned: isReassigned });
	}

	/**
	* Retrieve information about the caller information from state
	*
	* @returns {Object} Caller information
	*/
	getCallerInformation() {
		if (this.state && this.state.callerInformation) {
			return this.state.callerInformation;
		}

		return null;
	}

	/**
	* Persist information about the caller information to state
	*
	* @param {Object}  callerInformation Caller information
	* @returns {undefined}
	*/
	setCallerInformation(callerInformation) {
		this.setState({ callerInformation: callerInformation });
	}

	/**
	* Retrieve screen details from state
	*
	* @returns {Object} Screen details
	*/
	getScreenDetails() {
		if (this.state && this.state.screenDetails) {
			return this.state.screenDetails;
		}
		return null;
	}

	/**
	* Persist information about the screen details to state
	*
	* @param {Object} screenDetails Screen details
	* @returns {undefined}
	*/
	setScreenDetails(screenDetails) {
		this.setState({ screenDetails: screenDetails });
	}

	/**
	 * Recover the application state from the store
	 *
	 * @returns {Object} A deep cloned copy of the current state in the store
	 */
	recoverState() {
		const state = this.getState(true);
		if (state) {
			return state;
		}

		return null;
	}

	/**
	 *  Saves the application state to the state store
	 *
	 * @param {Object} stateToSave The state object to be persisted to the application state store
	 * @returns {undefined}
	 */
	saveState(stateToSave) {
		this.setState(stateToSave, `SAVE-STATE`);
	}
}