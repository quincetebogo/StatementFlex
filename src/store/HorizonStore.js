import { Store } from 'platform/core';

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

	// Recover state information saved by the previous view.
	recoverState() {
		const state = this.getState();
		if (state) {
			return state;
		}
	}

	// Before navigating to another view, save any state information the next view may require by calling this method.
	saveState(stateToSave) {
		this.setState(stateToSave, `SAVE-STATE`);
	}

	// Clears the state information that is being saved.
	eraseState() {
		this.clearState();
	}

}