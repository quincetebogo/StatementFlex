/* eslint-disable func-names */
/* eslint-disable symbol-description */

import { LitElement, css, html } from 'lit';

/**
 * Base class for all platform elements.
 */
export class Element extends LitElement {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * Initialises the component.
	 *
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

	static createProperty(name, options) {

		// Ensure property values are correctly reflected back to attributes in the DOM for simple types, but never for complex types.
		switch (options.type) {
			case String:
			case Number:
			case Boolean:
				if (options.reflect === undefined || options.reflect === null) {
					options.reflect = true;
				}
				break;
			default:
				options.reflect = false;
				break;
		}

		// If no explicit converter has been provided, manually set the converter to gracefully deal with errors when converting from/to attributes
		if (!options.converter) {
			options.converter = {
				toAttribute(value, type) {
					try {

						switch (type) {
							case Boolean:
								return value ? `` : null;
							case Object:
							case Array:
								// if the value is `null` or `undefined` pass this through to allow removing/no change behavior.
								return value === null ? value : JSON.stringify(value);
							default:
								return value;
						}
					} catch (err) {
						return value;
					}
				},
				fromAttribute(value, type) {
					try {
						switch (type) {
							case Boolean:
								return value !== null;
							case Number:
								return value === null ? null : Number(value);
							case Object:
							case Array:
								return JSON.parse(value);
							default:
								return value;
						}
					} catch (err) {
						// Value cannot be used as defined type, default to using value as is.
						return value;
					}
				}
			};
		}

		super.createProperty(name, options);
	}

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
	 * Generates the element stylesheet.
	 * 
	 * @ignore 
	 * @returns {css} The css content of the element.
	 */
	static get styles() {

		if (!window.breakpoints) {
			window.breakpoints = {
				"xs": 600,
				"sm": 960,
				"md": 1264,
				"lg": 1904
			};
		}

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
					user-select: var(--theme-text-select);
				}

				:host([hidden]) {
					display: none;
				}
		`;
	}

	/**
	 * Generates the element template.
	 * 
	 * @ignore
	 * @returns {html} The html content of the element.
	 */
	render() {

		return html``;
	}
}