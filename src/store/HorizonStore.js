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

	}

	// --------------
	// PUBLIC METHODS
	// --------------

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