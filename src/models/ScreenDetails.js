/**
 * Screen details records the information about current screen/ need.
 * This object is stored in state only for the current call and
 * disposed/ overriden when it is not required.
 * 
 * @export
 * @class ScreenDetails
 */
 export class ScreenDetails {

	/**
	 * Creates an instance of ScreenDetails.
	 * 
	 * @param {string} [returnToScreen=``] Name/ title of current screen(Ex: Favourites/ SavingsAccount)
	 * @param {string} [returnToOption=``] Holds option name, basically used to return to specific option in a screen
	 * @memberof ScreenDetails
	 * 
	 * Few properties (cards/ emailID/ accountNumber etc..) are added to this object at runtime
	 * and the same are cleared when toggling between needs or no longer needed
	 */

	constructor(
		returnToScreen = ``,
		returnToOption = ``
	) {
		this.returnToScreen = returnToScreen;
		this.returnToOption = returnToOption;
	}
};