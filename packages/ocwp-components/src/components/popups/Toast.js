import { Component, css, html } from '../../elements/index.js';

/**
 * Component that contains updates or messages about the status of the system or process. 
 * These are usually considered as feedback from the system based on user input.
 * 
 * ```js
 * import 'platform/components/popups/Toast';
 * ```
 * 
 * ```html
 * <capitec-toast type="info" header="Toast Title" detail="Short Description Text" closable>
 * </capitec-toast>
 * ```
 * @prop {"info"|"success"|"warning"|"error"|String} type - The type of toast to display.
 * @attr {"horizontal"|"vertical"|String} layout - Sets orientation of Toast header, detail and slot content
 */
export class Toast extends Component {

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

		this.type = `info`;
		this.header = ``;
		this.detail = ``;
		this.closable = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * 
	 * @property {String} [header] - The title to display on the toast.
	 * @property {String} [detail] - The detail to display on the toast.
	 * @property {String} [type="info"] - The type of toast to display:
	 * - `info` Best suited for informational purposes.
	 * - `success` Best suited for successful outcomes.
	 * - `warning` Best suited for warning outcomes.
	 * - `error` Best suited for error outcomes.
	 * @property {Boolean} [closable=false] - Whether the toast can be closed/close button visible.
	 */
	static get properties() {

		return {
			header: { type: String },
			detail: { type: String },
			type: { type: String },
			closable: { type: Boolean }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	// n/a    

	// --------------
	// EVENT HANDLERS
	// --------------

	_closeClicked(event) {

		// Notify any subscribers that the close button was clicked.
		this.dispatchEvent(new CustomEvent(`click-close`, {
			detail: {}
		}));

		// Prevent the event from bubbling up.
		event.stopPropagation();
	}

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
	 * Generates the component stylesheet.
	 * 
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,

			/* ---------- SHARED VARIABLES ---------- */
			css`
				:host {
					--theme-toast-info-color: #3A3A3A;
					--theme-toast-success-color: #3A3A3A;
					--theme-toast-warning-color: #3A3A3A;
					--theme-toast-error-color: #3A3A3A;
					--theme-toast-unsuccessful-color: #3A3A3A;

					--theme-toast-info-background-color: #DAF2F4;
					--theme-toast-success-background-color: #EAF3D9;
					--theme-toast-warning-background-color: #F9EBDD;
					--theme-toast-error-background-color: #F7E2E1;
					--theme-toast-unsuccessful-background-color: rgba(73,91,101,0.1);
				}
			`,
			css`
				:host {
					display: block;
					border-radius: 0px;
					min-width: var(--theme-toast-min-width, 300px);
					max-width: var(--theme-toast-max-width, 640px);
					width: var(--theme-toast-width, 100%);
				}

				.container {
					z-index: var(--theme-toast-z-index, 9999);

					display: flex;
					flex-direction: row;
					justify-content: flex-start;
					align-items: center;
					box-sizing: border-box;
					height: auto;
					position: relative;
					box-shadow: var(--theme-toast-box-shadow, 0 6px 10px 0 rgba(0,0,0,0.25));
					border-radius: var(--theme-toast-border-radius, 4px);
					padding: var(--theme-toast-padding, 16px);
					align-items: flex-start;
				}

				.content {
					width: var(--theme-toast-content-width, 100%);
					font-family: var(--theme-font-family,"Hind Vadodara");
					display: flex;
					flex-direction: column;
					justify-content: flex-start;

					margin-left: var(--theme-toast-content-margin-left, 12px);

					color: var(--theme-toast-content-color, #3A3A3A);
					font-size: var(--theme-toast-content-font-size, 14px);
					font-weight: var(--theme-toast-content-font-weight, 400);
					line-height: var(--theme-toast-content-line-height, 20px);
				}

				:host([layout="horizontal"]) .content,
				:host([layout="horizontal"]) slot {
					flex-direction: row;
				}

				:host([layout="vertical"]) .content,
				:host([layout="vertical"]) slot {
					flex-direction: column;
				}

				.content .title {
					font-size: var(--theme-toast-title-font-size, 14px);
					font-weight: var(--theme-toast-title-font-weight, 600);
					line-height: var(--theme-toast-title-line-height, 20px);
				}

				:host([layout="horizontal"]) .content .title {
					margin-right: var(--theme-toast-horizontal-title-margin-right, 2px);
				}

				.content .detail {
					font-size: var(--theme-toast-detail-font-size, 14px);
					font-weight: var(--theme-toast-detail-font-weight, 400);
					line-height: var(--theme-toast-detail-line-height, 20px);					
				}
				
				:host([layout="horizontal"]) {
					--theme-toast-detail-line-height: var(--theme-toast-title-line-height);
				}

				.container.info {
					background-color: var(--theme-toast-info-background-color);
				}

				.content.info .title {
					color: var(--theme-toast-info-color);
				}

				.content.info .detail {
					color: var(--theme-toast-info-color);
				}

				.container.success {
					background-color: var(--theme-toast-success-background-color);
				}

				.content.success .title {
					color: var(--theme-toast-success-color);
				}

				.content.success .detail {
					color: var(--theme-toast-success-color);
				}

				.container.warning {
					background-color: var(--theme-toast-warning-background-color);
				}

				.content.warning .title {
					color: var(--theme-toast-warning-color);
				}

				.content.warning .detail {
					color: var(--theme-toast-warning-color);
				}

				.container.error,
				.container.unsuccessful-red {
					background-color: var(--theme-toast-error-background-color);
				}

				.content.error .title,
				.content.unsuccessful-red .title {
					color: var(--theme-toast-error-color);
				}

				.content.error .detail,
				.content.unsuccessful-red .detail {
					color: var(--theme-toast-error-color);
				}

				.container.unsuccessful {
					background-color: var(--theme-toast-unsuccessful-background-color);
				}

				.content.unsuccessful .title {
					color: var(--theme-toast-unsuccessful-color);
				}

				.content.unsuccessful-red .detail {
					color: var(--theme-toast-unsuccessful-color);
				}

				:host([closable]) .close {
					margin-left: var(--theme-toast-close-margin-left, 8px);
				}

				.close {
					--theme-icon-size-default: var(--theme-toast-close-size, 13px);
					cursor: pointer;
					padding: var(--theme-toast-close-padding, 4px);
				}

				.icon {
					margin: var(--theme-toast-icon-margin, 0px 0px 0px 0px);
				}

				::slotted(*) {
					--theme-hyperlink-font-weight: 500;
					--theme-hyperlink-font-size: 14px;
					--theme-hyperlink-text-decorator: underline;
				}
								
				:host([layout="horizontal"]) ::slotted(capitec-hyperlink) {
					margin-left: 2px;
					margin-right: 2px;
				}

				.content.info > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-info-color);
				}

				.content.success > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-success-color);
				}

				.content.warning > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-warning-color);
				}

				.content.error > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-error-color);
				}

				.content.unsuccessful > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-unsuccessful-color);
				}

				.content.unsuccessful-red > ::slotted(*) {
					--theme-hyperlink-color: var(--theme-toast-unsuccessful-font-color);
				}
			`
		];
	}

	/**
	 * Generates the component template for mobile mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_mobileTemplate() {

		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {

		return html`
			<div class="container ${this.type}">
				<div class="icon" >
					<capitec-icon icon="status/${this.type !== `unsuccessful-red` ? `${this.type}-trans` : `${this.type}`}"></capitec-icon>
				</div>
				<div class="content ${this.type}">
					<label class="title">${this.header}</label>
					<label class="detail">${this.detail}</label>
					<slot></slot>
				</div>
				${this.closable ? html`<capitec-icon @click="${(e) => this._closeClicked(e)}" class="close" icon="system/close"></capitec-icon>` : ``}
			</div>
		`;
	}

	/**
	 * Generates the component template for kiosk mode.
	 * 
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {

		return this._webTemplate();
	}
}

window.customElements.define(`capitec-toast`, Toast);

/**
 * When the close button is clicked.
 *
 * @example
 * <capitec-toast ... @click-close="${this._handler}"></capitec-toast>
 *
 * @event Toast#click
 * @type {Object}
 * @property {Object} detail Event detail.
 */