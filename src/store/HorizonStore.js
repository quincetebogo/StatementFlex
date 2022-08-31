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
	* @deprecated - Use a method specific to your screen (getTaxCertificateDetails etc.)  This makes it easier to track what is going on in state and code
	*/
	getScreenDetails() {
		if (this.state && this.state.screenDetails) {
			return this.state.screenDetails;
		}

		return {};
	}

	/**
	* Persist information about the screen details to state
	*
	* @param {Object} screenDetails Screen details
	* @returns {Object} The state after setting the screen details
	* @deprecated - Use a method specific to your screen (setTaxCertificateDetails etc.) This makes it easier to track what is going on in state and code
	*/
	setScreenDetails(screenDetails) {
		return this.setState({ screenDetails: screenDetails });
	}

	/**
	* Clear the screen details object
	*
	* @param {Object} screenDetails Screen details
	* @returns {Object} The state after clearing the screen details object
	* @deprecated - Use a method specific to your screen (setTaxCertificateDetails etc.) This makes it easier to track what is going on in state and code
	*/
	clearScreenDetails() {
		return this.setState({ screenDetails: {} });
	}

	/**
	 * Save a route and some optional data to state. The HorizonRouter navigateToReturnPage() will use this
	 * state object in order to return to a previous a page. 
	 * 
	 * @param { Object } route The route the HorizonRouter.navigateToReturnPage() will usie
	 * @param { Object } optionalData  An optional object that may be retrieved by the page navigated to by HorizopnRouter.navigateToReturnPage()
	 * @returns  { undefined}
	 */
	setReturnScreen(route, optionalData) {
		return this.setState({ returnToScreen: { route: route, optionalData: optionalData } });
	}

	/**
	 * Retrieved the saved route 
	 * 
	 * @returns { undefined } An object containing the route and optional information to use when returning to a calling screen
	 */
	getReturnToScreen() {
		if (this.state && this.state.returnToScreen) {
			return this.state.returnToScreen;
		}

		return null;
	}

	/**
	 * Clear the saved routed (so that it can't be accidentally used)
	 * Do this once the saved return route is no longer needed
	 * 
	 * @returns { undefined } An object containing the route and optional information to use when returning to a calling screen
	 */
	 clearReturnScreen() {
		return this.setState({ returnToScreen: null });
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

	setProductButtonState(newLandingPageInfo) {

		if (!newLandingPageInfo) {
			return;
		}
		
		const updatedLandingPageInfo = {
			savingsAccountProductDescription: newLandingPageInfo.savingsAccountProductDescription ? newLandingPageInfo.savingsAccountProductDescription : this.state.landingPageInfo?.savingsAccountProductDescription,
			liveBetterBankingProductDescription: newLandingPageInfo.liveBetterBankingProductDescription ? newLandingPageInfo.liveBetterBankingProductDescription : this.state.landingPageInfo?.liveBetterBankingProductDescription,
			savingsPlanProductDescription: newLandingPageInfo.savingsPlanProductDescription ? newLandingPageInfo.savingsPlanProductDescription : this.state.landingPageInfo?.savingsPlanProductDescription,
			insureProductDescription: newLandingPageInfo.insureProductDescription ? newLandingPageInfo.insureProductDescription : this.state.landingPageInfo?.insureProductDescription,
			creditProductDescription: newLandingPageInfo.creditProductDescription ? newLandingPageInfo.creditProductDescription : this.state.landingPageInfo?.creditProductDescription,
			savingsAccountProductAmount: newLandingPageInfo.savingsAccountProductAmount ? newLandingPageInfo.savingsAccountProductAmount : this.state.landingPageInfo?.savingsAccountProductAmount,
			liveBetterBankingProductAmount: newLandingPageInfo.liveBetterBankingProductAmount ? newLandingPageInfo.liveBetterBankingProductAmount : this.state.landingPageInfo?.liveBetterBankingProductAmount,
			savingsPlanProductAmount: newLandingPageInfo.savingsPlanProductAmount ? newLandingPageInfo.savingsPlanProductAmount : this.state.landingPageInfo?.savingsPlanProductAmount,
			insureProductAmount: newLandingPageInfo.insureProductAmount ? newLandingPageInfo.insureProductAmount : this.state.landingPageInfo?.insureProductAmount,
			creditProductAmount: newLandingPageInfo.creditProductAmount ? newLandingPageInfo.creditProductAmount : this.state.landingPageInfo?.creditProductAmount
		};
		
		const subtitle = {
			savingsAccount: updatedLandingPageInfo.savingsAccountProductDescription,
			liveBetterSavings: updatedLandingPageInfo.liveBetterBankingProductDescription,
			savingsPlan: updatedLandingPageInfo.savingsPlanProductDescription,
			insure: updatedLandingPageInfo.insureProductDescription,
			credit: updatedLandingPageInfo.creditProductDescription
		};

		const detail = {
			savingsAccount: updatedLandingPageInfo.savingsAccountProductAmount,
			liveBetterSavings: updatedLandingPageInfo.liveBetterBankingProductAmount,
			savingsPlan: updatedLandingPageInfo.savingsPlanProductAmount,
			insure: updatedLandingPageInfo.insureProductAmount,
			credit: updatedLandingPageInfo.creditProductAmount
		};

		const updatedLeftBarButtonConfig = {
			hasFavourites: true,
			subtitle: subtitle ? subtitle : ``,
			detail: detail ? detail : ``
		};

		this.setState({ leftBarButtonConfig: updatedLeftBarButtonConfig, landingPageInfo: updatedLandingPageInfo });
	}
}