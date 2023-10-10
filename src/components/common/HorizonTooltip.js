import { css, html } from 'platform/elements';
import { Tooltip } from 'platform/components';

export class HorizonTooltip extends Tooltip {

	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();
		this.message = ``;
		this.messagePosition = ``;
		this.tooltipPosition = ``;
		this.width = ``;
		this.top = ``;
		this.bottom = ``;
		this.left = ``;
		this.right = ``;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
 	* 
 	* @property {String} [message] - The tooltip message to display.
 	* @property {String} [messagePosition] - The position of the tooltip message [top, left, bottom, right].
 	* @property {String} [tooltipPosition] - The position of the tooltip [absolute, relative, fixed, etc css position style].
 	* @property {String} [width] - The width of the tooltip message[pixels, min-content, max-content, etc css width style].
 	* @property {String} [top] - Specifies how far an absolutely positioned box's top margin edge is offset below the top edge of the box's containing block.
 	* @property {String} [bottom] - Specifies how far an absolutely positioned box's bottom margin edge is offset above the bottom edge of the box's containing block.
	* @property {String} [left] - Specifies how far an absolutely positioned box's left margin edge is offset to the right of the left edge of the box's containing block.
 	* @property {String} [right] - Specifies how far an absolutely positioned box's right margin edge is offset to the left of the right edge of the box's containing block.
 */

	static get properties() {
		return {
			message: { type: String },
			messagePosition: { type: String },
			tooltipPosition: { type: String },
			width: { type: String },
			top: { type: String },
			bottom: { type: String },
			left: { type: String },
			right: { type: String }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// --------------
	// EVENT HANDLERS
	// --------------

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

	static get styles() {
		return [super.styles];
	};

	render() {
		return html`
			<capitec-tooltip
				message=${this.message}
				position="${this.messagePosition}"
				width="${this.width}"
				style="white-space: pre-line; position: ${this.tooltipPosition ? this.tooltipPosition : `relative`}; ${this.top ? `top: ${this.top}` : ``}; ${this.left ? `left: ${this.left}` : ``}; ${this.bottom ? `bottom: ${this.bottom}` : ``}; ${this.right ? `right: ${this.right}` : ``};">
				<capitec-badge color="transparent" icon="status/info" iconSize="small"></capitec-badge>
			</capitec-tooltip>
		`;
	}
}

window.customElements.define(`horizon-tooltip`, HorizonTooltip);