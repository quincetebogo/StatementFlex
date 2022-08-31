import { Component, css, html, unsafeCSS } from 'platform/elements';

/**
 * The base modal to extend a View that incorporates the stepper into a modal.
 * 
 * ```html
 * <bb-stepper-modal
 *    header="My Header"
 *    current-active-step=0
 * ></bb-stepper-modal>
 * ```
 * 
 * @attribute {Number} current-active-step - the active step of the stepper (0 indexed)
 * @attribute {Object} display-override - a render function that overrides the display of the stepper (usually useful for cancel/success screens)
 * @attribute {Boolean} show-edit-button - a boolean to determine whether or not to display an edit button on the right of the header
 * @attribute {Boolean} hide-stepper - a boolean to determine whether or not to display the stepper
 */
export class WizardStepperModal extends Component {

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
		this.header = ``;
		this.currentActiveStep = 0;
		this.steps = [];
		this.noPadding = false;
		this.hideStepper = false;
		this.stepElement = null;
		this.showScrollIndicator = false;
		this.showEditButton = false;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * @typedef {Object} Step
	 * @property {String} header - Header title of stepper modal
	 * @property {Array<Step>} steps - the steps of the view
	 * @property {Number} [activeStepNumber="1"] The active step that the stepper is currently on. NB: The default and first step index is 1.
	 * 
	 */
	 static get properties() {

		return {
			header: { type: String },
			steps: { type: Array },
			currentActiveStep: { type: Number, attribute: `current-active-step` },
			noPadding: { type: Boolean, attribute: `no-padding` },
			hideStepper: { type: Boolean },
			showEditButton: { type: Boolean, attribute: `show-edit-button` },
			showScrollIndicator: { type: Boolean }
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
		this.removeEventListener(`keydown`, this._onKeydownEvent);
		super.disconnectedCallback();
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

	// --------------
	// PUBLIC METHODS
	// --------------

	async updated() {

		// Select all known input components.
		const inputs = this.querySelectorAll(`capitec-text-field, capitec-select, capitec-check, capitec-text-box, capitec-rich-text-box, capitec-button, capitec-hyperlink, capitec-radio, capitec-toggle, capitec-date-time-picker`);

		if (inputs && inputs.length > 0) {
			this.firstInput = inputs[0];
			await this.updateComplete;

			// Attempt to focus first element.
			this.firstInput.focus();
			this.lastInput = inputs[inputs.length - 1];

		}
		// TODO: fix scroll indicator on wizard stepper modal (screen freezes when scollbar reaches the bottom, suspect there's an infinite loop forming)
		// this._updateScrollIndicator(); 
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_updateScrollIndicator() {
		const stepElement = this.shadowRoot.getElementById(`step`);

		if (stepElement) {
			if (stepElement.scrollHeight > stepElement.offsetHeight) {
				this.showScrollIndicator = stepElement.scrollHeight - stepElement.offsetHeight !== Math.ceil(stepElement.scrollTop);
			} else {
				this.showScrollIndicator = false;
			}
		}
	}

	// ---------
	// RENDERING
	// ---------

	/**
	 * Generates the component stylesheet.
	 * 
	 * @ignore
	 * @returns {css} The css content of the component.
	 */
	static get styles() {

		return [
			super.styles,
			css`
				:host([showScrollIndicator]) .footer {
					border-top: 2px solid #E1E1E1;
				}

				:host([hideStepper]) .stepper-container {
					display: none;
				}

				::slotted([slot="footer"]) {
					padding: var(--theme-modal-footer-padding, 8px 16px);
				}

				.stepper-container {
					height: fit-content;
				}

				.modal {
					display: flex;
					position: fixed;
					align-items: center;
					justify-content: center;
					flex-direction: column;
					z-index: 200;
					left: 0;
					top: 0;
					width: 100%;
					height: 100%;
					background-color: var(--theme-modal-screen-background-color, rgba(0,0,0,0.6));
					cursor: default;
				}

				.container {
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: stretch;
					padding: var(--theme-modal-container-padding, 0px);
					background-color: var(--theme-modal-container-background-color, #FFFFFF);
					box-shadow: var(--theme-modal-container-box-shadow);
					border-radius: var(--theme-modal-border-radius, 4px);
					width: var(--theme-wizard-modal-xl-width, 80%);
					height: var(--theme-wizard-modal-xl-height, 95%);
					max-width: var(--theme-wizard-modal-max-width, 80%);
					max-height: var(--theme-wizard-modal-max-height, 80%);
				}

				.header {
					display: flex;
					align-items: center;
					color: var(--theme-modal-header-color,#4E6066);
					background: var(--theme-modal-header-background, #F7F7F7);
					font-family: var(--theme-font-family);
					font-size: var(--theme-modal-header-font-size, 20px);
					font-weight: var(--theme-modal-header-font-weight, 500);
					padding: var(--theme-wizard-modal-header-padding, 20px 16px);
					border-radius: var(--theme-modal-border-radius, 4px);
					position: relative;
					border-bottom-left-radius: 0px;
					border-bottom-right-radius: 0px;
				}

				.body {
					display: flex;
					flex-direction: column;
					margin-top:0px;
					color: var(--theme-modal-body-color, #4E6066);
					font-size: var(--theme-modal-body-font-size, 14px);
					border-radius: var(--theme-modal-body-border-radius, 4px 4px 0px 0px);
					box-shadow: var(--theme-modal-body-box-shadow);
					background-color: var(--theme-modal-body-background-color, #FFFFFF);
					font-size: 16px;
					overflow: hidden;
					position: relative;
					line-height: 24px;
					flex: 1;
				}

				.footer {
					align-self: flex-end;
					text-align: var(--theme-modal-footer-text-align, right);
					width: var(--theme-stepper-modal-footer-width, 100%);
				}
				
				.default-size {
					font-size: initial;
				}

			`,
			unsafeCSS(`
				@media screen and (max-width: ${window.breakpoints.xl}px) {
					.container {
						width: var(--theme-wizard-modal-xl-width, 100%);
						height: var(--theme-wizard-modal-xl-height, 100%);
					}
				}

				@media screen and (max-width: ${window.breakpoints.lg}px) {
					.container {
						width: var(--theme-wizard-modal-lg-max-width, 100%);
						height: var(--theme-wizard-modal-lg-max-height, 100%);
					}
				}

				@media screen and (max-width: ${window.breakpoints.md}px) {
					.container {
						width: var(--theme-wizard-modal-md-max-width, 90%);
						height: var(--theme-wizard-modal-md-max-height, 90%);
					}
				}

				@media screen and (max-width: ${window.breakpoints.sm}px) {
					.container {
						width: var(--theme-wizard-modal-sm-max-width, 95%);
						height: var(--theme-wizard-modal-sm-max-height, 95%);
					}
				}

				@media screen and (max-width: ${window.breakpoints.xs}px) {
					.container {
						width: var(--theme-wizard-modal-xs-max-width, 100%);
						height: var(--theme-wizard-modal-xs-max-height, 100%);
					}
				}
			`)
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
			<div class="modal" role="dialog" aria-modal="true">
				<div class="container">
					<slot name="header">
						<div class="header"
							data-automation-id="bb-stepper-heading">
							${this.header}
							${this.showEditButton 
								? html`
									<capitec-spacer></capitec-spacer>
									<capitec-hyperlink
										data-automation-id="bb-stepper-edit-click"
										label="Edit"
										@click="${() => this.dispatchEvent(new CustomEvent(`edit-button-click`))}"
										class="default-size">
									</capitec-hyperlink>`
								: html``
							}
						</div>
					</slot>
					<div class="body">
						<slot name="override">
							<div class="stepper-container">
								<capitec-stepper
									data-automation-id="bb-stepper-active-step"
									layout="horizontal"
									.steps=${this.steps}
									active-step-number=${this.currentActiveStep + 1}>
								</capitec-stepper>
							</div>
							<capitec-content-box
								id="step"
								?noPadding="${this.noPadding}"
								@scroll=${() => this._updateScrollIndicator()}>
								<slot name="step"></slot>
							</capitec-content-box>
						</slot>
					</div>
					<div class="footer">
						<slot name="footer"></slot>
					</div>
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
}

window.customElements.define(`bb-stepper-modal`, WizardStepperModal);

/**
 * When the edit button is clicked.
 *
 * @example
 * <bb-stepper-modal ... @confirm-click="${this._handler}"></bb-stepper-modal>
 *
 * @event WizardStepperModal#edit-button-click
 */