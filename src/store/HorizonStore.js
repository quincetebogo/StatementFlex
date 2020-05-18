export class HorizonStore {

	// --------------
	// INITIALISATION
	// --------------

	static getInstance() {
		return this.instance || (this.instance = new HorizonStore());
	}

	constructor() {
		this.state = null;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// Before navigating to another view, save any state information the next view may require 
	// by calling this method (replace with Redux or something later)
	saveState(stateToSave) {
		this.state = stateToSave;
	}

	// Recover state information saved by the previous view.
	// Recovering clears the saved state. If the new view wishes to 
	// save state it must do so explicity.
	recoverState() {
		// let tmpState = this.state;
		// this.state = null;
		return this.state;
	}

	clearState() {
		this.state = null;
	}
}