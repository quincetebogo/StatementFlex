/**
 * Base class for all platform elements.
 */
export class Element extends LitElement {
	static createProperty(name: any, options: any): void;
	/**
	 * Generates the element stylesheet.
	 *
	 * @ignore
	 * @returns {css} The css content of the element.
	 */
	static get styles(): import("lit-element").CSSResultOrNative | import("lit-element").CSSResultArray;
}
import { LitElement } from "lit";
