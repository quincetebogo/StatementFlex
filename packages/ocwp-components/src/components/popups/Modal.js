import { Component, css, html } from '../../elements/index.js';
import '../core/Icon.js';

/**
 * Window that sits on top of the main window, but disables interaction with the main window while 
 * keeping it visible with the modal as a child window on top of it. Interaction with the modal must be completed
 * before interaction with the parent application can resume.
 *
 * ```js 
 * import 'platform/components/popups/Modal'; 
 * ```
 * 
 * ```html
 * <capitec-modal type="alert" result="success" header="Some Header" header-align="center">
 *   <div slot="body">
 *     You have successfully booked your stay at The Capitec Resort from 6 June to 11 June 2019.
 *   </div>
 *   <capitec-button slot="footer" type="clear" label="Done" @click="${this.onDoneClick}"></capitec-button>
 * </capitec-modal>
 * ```
 * @prop {"alert"|"form"|"text"|"free"|"result"|"onboard"|"select"|String} type Type of modal.
 * @prop {"success"|"unsuccessful"|"info"|"warn"|"error"|String} result Represents result types (see type above).
 * @prop {"left"|"center"|"right"|String} headerAlign Header text alignment.
 */
export class Modal extends Component {

	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {

		super();

		this.type = `alert`;
		this.result = `success`;
		this.header = ``;
		this.headerAlign = null;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all public properties defined by the component.
	 * 
	 * @property {String} [type="alert"] Type of modal:
	 *  - `alert` Basic usage to display info or prompt the user.
	 *  - `form` Best suited to capture data.
	 *  - `text` Best suited to display scrollable text.
	 *  - `free` Unconstrained layout that enables growing content.
	 *  - `result` Specific for operation outcomes / results (see result property).
	 *  - `onboard` Similar to alert type excludes the header.
	 *  - `select` Similar to alert type excludes the header and footer.
	 * @property {String} [result="success"] Represents result types (see type above):
	 *  - `success` Positive sentiments, e.g. "Success" or "Approved".
	 *  - `unsuccessful` Negative sentiments, e.g. "Unsuccessful" or "Declined".
	 *  - `info` Information to the user, e.g. "Information".
	 *  - `warn` Warning that occurred, e.g. "Warning".
	 *  - `error` Error that occurred, e.g. "Error".
	 * @property {String} header Title text to be displayed in header area.
	 * @property {String} [headerAlign] Header text alignment:
	 *  - `left` Align header to the left.
	 *  - `center` Align header to the center.
	 *  - `right` Align header to the right.
	 */
	static get properties() {

		return {
			type: { type: String },
			result: { type: String },
			header: { type: String },
			headerAlign: {
				type: String,
				attribute: `header-align`
			}
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		this.addEventListener(`keydown`, this._onKeydownEvent);
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.removeEventListener(`keydown`, this._onKeydownEvent);
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	_onKeydownEvent(e) {

		// tab key
		if (e.keyCode === 9) {

			if (e.shiftKey) {

				if (e.srcElement === this.firstInput) {

					// Stop at first input element.
					e.preventDefault();
				}
			} else if (e.srcElement === this.lastInput) {

				// Stop at last input element.
				e.preventDefault();
			}
		}
	}

	_onUserClickOutside(e) {
		const containerElement = this.shadowRoot.querySelector(`div.container`);
		if (e && e.path && !e.path.includes(containerElement)) {
			this.dispatchEvent(new CustomEvent(`clicked-out-modal`, {
				detail: true
			}));
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------	

	async updated() {

		// Select all known input components.
		const inputs = this.querySelectorAll(`capitec-text-field, capitec-select, capitec-check, capitec-text-box, capitec-rich-text-box, capitec-button, capitec-hyperlink, capitec-radio, capitec-toggle`);

		if (inputs && inputs.length > 0) {

			// Select the first one.
			this.firstInput = inputs[0];

			// Wait for the rendering to complete as per https://lit-element.polymer-project.org/guide/lifecycle#updatecomplete.
			await this.updateComplete;

			// Attempt to focus first element.
			this.firstInput.focus();
			this.lastInput = inputs[inputs.length - 1];
		}
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	// n/a

	// ---------
	// RENDERING
	// ---------

	static get styles() {

		return [
			super.styles,
			css`
		
				.modal {
					display: flex;
					position: fixed;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					z-index: var(--theme-modal-container-z-index, 1102);
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					background-color: var(--theme-modal-screen-background-color, rgba(0,0,0,0.6));
					cursor: default;
				}

				.select-modal {
					justify-content: flex-end;
				}

				.container {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;
					padding: var(--theme-modal-container-padding, 0px);
					background-color: var(--theme-modal-container-background-color, #FFFFFF);
					box-shadow: var(--theme-modal-container-box-shadow);
				}

				.container.select {
					width: 100%;
					height: 50%;
				}

				.container.select > .body {
					padding: 0px;
				}

				@media screen and (min-width: 767px) { /* Cannot use var in media query */

					.container {
						border-radius: var(--theme-modal-border-radius, 4px);
					}
				}

				.container.alert { 
					width: var(--theme-modal-alert-xs-s-width); 
					border-radius: var(--theme-modal-border-radius, 4px);
				}

				.container.alert > .header {
					border-radius: var(--theme-modal-border-radius, 4px);
				}

				@media screen and (min-width: 767px) { /* Cannot use var in media query */

					.container.alert {
						width: var(--theme-modal-alert-m-l-xl-width);
					}
				}

				.container.onboard {
					width: var(--theme-modal-onboard-xs-s-width); 
					border-radius: var(--theme-modal-border-radius, 4px);
				}	

				@media screen and (min-width: 767px) {

					.container.onboard {
						width: var(--theme-modal-onboard-m-l-xl-width);
					}
				}		
				
				.container.form, 
				.container.text { 
					width: var(--theme-modal-form-xs-s-width); 
					max-height: 100vh;
				}

				.container.form > .body,
				.container.text > .body {
					height: 100vh;
				}

				.container.free > .body,
				.container.text > .body {
					overflow-y: auto;
				}

				@media screen and (min-width: 767px) { /* Cannot use var in media query */

					.container.form, 
					.container.text {
						width: var(--theme-modal-form-m-l-xl-width);
						height: auto;
						max-height: var(--theme-modal-free-max-height); 
					}

					.container.form > .body,
					.container.text > .body {
						height: auto;
					}
				}

				.container.result { 
					width: var(--theme-modal-result-xs-s-width); 
					height: 100vh;
					border-radius: 0;
				}

				.container.result > .body {
					height: 100vh;
				}

				@media screen and (min-width: 767px) { /* Cannot use var in media query */

					.container.result {
						width: var(--theme-modal-result-m-l-xl-width);
						border-radius: var(--theme-modal-border-radius, 4px);
						height: auto;
					}

					.container.result > .body {
						height: auto;
					}
				}

				.container.free { 
					max-width: var(--theme-modal-free-max-width); 
					max-height: var(--theme-modal-free-max-height); 
					border-radius: var(--theme-modal-border-radius, 4px);
				}

				.container.free > .header {
					border-radius: var(--theme-modal-border-radius, 4px);
				}
				
				.header {
					display: inline-flex;
					align-items: center;
					color: var(--theme-modal-header-color,#4E6066);
					background-color: var(--theme-modal-header-background-color, #F7F7F7);
					font-family: var(--theme-font-family);
					font-size: var(--theme-modal-header-font-size, 20px);
					font-weight: var(--theme-modal-header-font-weight, 500);
					line-height: var(--theme-modal-header-line-height, 24px);
					/*text-align: var(--theme-modal-header-text-align, left);*/
					padding-left: var(--theme-modal-header-padding-left, 24px);
					padding-top: var(--theme-modal-header-padding-top, 24px);
					padding-right: var(--theme-modal-header-padding-right, 24px);
					padding-bottom: var(--theme-modal-header-padding-bottom, 24px);
					
					z-index: var(--theme-modal-container-header-z-index, 1103);
					position: relative;
				}

				@media screen and (min-width: 767px) {
					
					.header {
						border-radius: var(--theme-modal-header-border-radius, 4px 4px 0px 0px);
					}
				}

				.header.success {
					color: var(--theme-status-success-font-color, #FFFFFF);
					background: var(--theme-status-success-background, green);
				}

				.header.error {
					color: var(--theme-status-error-font-color, #FFFFFF);
					background: var(--theme-status-error-background, red);
				}

				.header.warn {
					color: var(--theme-status-warn-font-color, #FFFFFF);
					background: var(--theme-status-warn-background, orange);
				}

				.header.info {
					color: var(--theme-status-info-font-color, #FFFFFF);
					background: var(--theme-status-info-background, blue);
				}

				.header.fail, /* Deprecated "fail", backwards compatible */
				.header.unsuccessful {
					color: var(--theme-status-unsuccessful-font-color, #FFFFFF);
					background: var(--theme-status-unsuccessful-background, grey);
				}

				.header.left {
					display: inline-block;
					text-align: left;
				}

				.header.center {
					display: inline-block;
					text-align: center;
				}

				.header.right {
					display: inline-block;
					text-align: right;
				}

				.header .icon {
					align-self: center;
					margin-right: 16px;
				}
				
				.body {
					margin-top:0px;
					color: var(--theme-modal-body-color, #4E6066);
					padding: var(--theme-modal-body-padding, 24px 24px 40px 24px);
					font-size: var(--theme-modal-body-font-size, 14px);
					border-radius: var(--theme-modal-body-border-radius, 4px 4px 0px 0px);
					box-shadow: var(--theme-modal-body-box-shadow);
					background-color: var(--theme-modal-body-background-color, #FFFFFF);
					z-index: var(--theme-modal-container-body-z-index, 1105);
					line-height: 24px;
					font-size: 16px;
				}

				.body.free {
					padding: 0 0 1px 0; /* Prevent scrollbar */
				}

				.body::-webkit-scrollbar {
					width: calc(var(--theme-scrollbar-thumb-width, 10px) + var(--theme-scrollbar-track-padding-left, 2px) + var(--theme-scrollbar-track-padding-right, 2px));
				}
				
				.body::-webkit-scrollbar-track {
					border-radius: var(--theme-scrollbar-track-border-radius, 10px);
					background-color: var(--theme-scrollbar-track-background-color, transparent);
				}

				.body::-webkit-scrollbar-thumb {
					border-radius: var(--theme-scrollbar-thumb-border-radius, 10px);
					background-color: var(--theme-scrollbar-thumb-background-color, #d9d9d9);
					
					border-top: var(--theme-scrollbar-track-padding-top, 2px) solid transparent;
					border-bottom: var(--theme-scrollbar-track-padding-bottom, 2px) solid transparent;
					border-left: var(--theme-scrollbar-track-padding-left, 2px) solid transparent;
					border-right: var(--theme-scrollbar-track-padding-right, 2px) solid transparent;
					
					background-clip: padding-box;
				}
				
				.footer {
					align-self: flex-end;
					text-align: var(--theme-modal-footer-text-align, right);
					padding: var(--theme-modal-footer-padding, 12px 12px 12px 0px);
					z-index: var(--theme-modal-container-footer-z-index, 1104);
				}

				slot[name=footer]::slotted(capitec-button) {
					margin: var(--theme-modal-slotted-button-margin, 0px 0px 0px 16px);
				}

				slot[name="body"]::slotted(capitec-calendar) {
					display: flex;
					flex-direction: row;
				}

				slot[name="header"] {					
					display: flex;
					right: var(--theme-modal-slot-header-right);
					position: absolute;
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
			<div class="modal ${this.type === `select` ? `select-modal` : ``}" role="dialog" aria-modal="true"
				@click="${(e) => this._onUserClickOutside(e)}" @touch="${(e) => this._onUserClickOutside(e)}">
				<div class="container ${this.type}">
					${this._renderHeader()}
					<div class="body ${this.type === `free` ? `free` : ``}">
						<slot name="body"></slot>
					</div>
					${this._renderFooter()}
				</div>
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

	_renderHeader() {
		if (this.type === `onboard` || this.type === `select`) {
			return html``;
		}
		return html`
			<div class="header ${this.type === `result` ? this.result : ``} ${this.headerAlign || ``}">
				${this.type === `result` && this.result === `success` ? html`<capitec-icon class="icon" size="default"
					icon="status/success-white"></capitec-icon>` : ``}
				${this.type === `result` && (this.result === `unsuccessful` || this.result === `fail`) ? html`<capitec-icon
					class="icon" size="default" icon="status/unsuccessful-white"></capitec-icon>` : ``}
				${this.type === `result` && this.result === `info` ? html`<capitec-icon class="icon" size="default"
					icon="status/info-white"></capitec-icon>` : ``}
				${this.type === `result` && this.result === `warn` ? html`<capitec-icon class="icon" size="default"
					icon="status/warning-white"></capitec-icon>` : ``}
				${this.type === `result` && this.result === `error` ? html`<capitec-icon class="icon" size="default"
					icon="status/error-white"></capitec-icon>` : ``}
				${this.header}
			
				<slot name="header"></slot>
			</div>
		`;
	}

	_renderFooter() {
		if (this.type === `select`) {
			return html``;
		}

		return html`
			<div class="footer">
				<slot name="footer"></slot>
			</div>`;
	}
}

window.customElements.define(`capitec-modal`, Modal);

/**
* When the user clicks outside the modal
*
* @example
* <capitec-modal ... @clicked-out-modal="${this._handler}"></capitec-modal>
*
* @event Modal#clicked-out-modal
* @type {void}
*/