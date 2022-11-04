/**
 * The primary Insure state store
 * 
 * @module store/HorizonInsureStore
 */

 import { Store } from 'platform/core';

 /**
  * The Horizon Insure State Store is configured to use session storage.
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
	  * Retrieve information CFP Disclosure from state
	  * @returns {Object} An object containing information abut the CFP Disclosure
	  */
	 getCFPStatus() {
		 if (this.state && this.state.cfpPopped) {
			 return this.state.cfpPopped;
		 }
 
		 return null;
	 }
 
	 /**
	  * set information about the CFP Disclosure to state
	  * 
	  * @param {Object}  cfpPopped Information on the CFP Disclosure
	  * @returns {undefined} 
	  */
	 setCFPStatus(cfpPopped) {
		 this.setState({ cfpPopped: cfpPopped });
	 }
 
 }