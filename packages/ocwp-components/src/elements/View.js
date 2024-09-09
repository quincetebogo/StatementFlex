import { Component, css } from './index.js';

/**
 * Base class for all platform views.
 */
export class View extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();
	}

	// ----------
	// PROPERTIES
	// ----------

	// n/a

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a	

	// --------------
	// EVENT HANDLERS
	// --------------

	// n/a

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the view stylesheet.
	 * 
	 * @returns {css} The css content of the view.
	 */
	static get styles() {

		return css`
			* {
				box-sizing: border-box;
			}
		
			:host {
				display: flex;
				flex-direction: column;
				
				box-sizing: border-box;
		
				padding: 0px;
				margin: 0px;
			}
		
			:host([hidden]) {
				display: none;
			}
		`;
	}
}