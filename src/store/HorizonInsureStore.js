/**
 * The primary application state store
 * 
 * @module store/HorizonInsureStore
 */

 import { Store } from 'platform/core';

 /**
  * HorizonStore customizes the plateform state storage capability for the Horizon applicaton.
  * The Horizon State Store is configured to use session storage.
  *
  * @extends {Store}
  */
 export class HorizonInsureStore extends Store {
 
	 // --------------
	 // INITIALISATION
	 // --------------
 
	 static getInstance() {
		 return this.instance || (this.instance = new HorizonInsureStore());
	 }
 
	 constructor() {
		 super({
			 name: `horizon-insure-store`,
			 persistence: `sessionStorage`,
			 logStateChanges: true
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
	 getCFPStatus() {
		 if (this.state && this.state.cfpPopped) {
			 return this.state.cfpPopped;
		 }
 
		 return null;
	 }
 
	 /**
	  * Persist informatino about the incoming/present call to state
	  * 
	  * @param {Object}  cfpPopped Information on the incoming/present call
	  * @returns {undefined} 
	  */
	 setCFPStatus(cfpPopped) {
		 this.setState({ cfpPopped: cfpPopped });
	 }
 
 }