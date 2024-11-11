import { Component, css, html } from '../../elements/index.js';
import { fromEvent, interval } from 'rxjs';
import { debounce } from 'rxjs/operators/index.js';

export const LAYOUTTYPE = {
	HORIZONTAL: `horizontal`,
	VERTICAL: `vertical`
};

/**
 * A layout container that groups expanders, allowing for automatic expanding and collapsing of sibling expander controls.
 *
 * ```js
 * import 'platform/components/indicators/Stepper';
 * ```
 *
 * ```html
 * <capitec-stepper
 *	layout="horizontal"
 *	.steps="${[{title: `Step 1`}, {title: `Step 2`, isError: true}, {title: `Step 3`}, {title: `Step 4`}]}"
 *	active-step-number="3">
 * </capitec-stepper>
 * ```
 *
 * @prop {"horizontal"|"vertical"|String} layout - The layout type of the stepper component in which it will be rendered
 */
export class Stepper extends Component {

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();

		const resizeEvent = fromEvent(window, `resize`);
		const result = resizeEvent.pipe(debounce(() => interval(100)));
		this.subscription = result.subscribe(display => {
			this._isExtraSmall = display.target.innerWidth <= 767;
		});

		// Set the default property values.
		this.layout = LAYOUTTYPE.HORIZONTAL;
		this.wasVertical = this.layout === LAYOUTTYPE.VERTICAL;
		this.steps = [];
		this.activeStepNumber = 1;
		this._isExtraSmall = window.innerWidth <= 767;
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {LayoutAttribute} [layout="horizontal"] The layout type of the stepper container, either:
	 *    - `horizontal` Renders the stepper in a horizontal layout.
	 *    - `vertical` Renders the stepper in a vertical layout.
	 * @property {Array<Object>} [steps=[]] The object containing the array of steps to display
	 * @property {Number} [activeStepNumber="1"] The active step that the stepper is currently on. NB: The default and first step index is 1.
	 */
	static get properties() {
		return {
			layout: { type: String },
			steps: { type: Array },
			activeStepNumber: { type: Number, attribute: `active-step-number` },
			_isExtraSmall: { type: Boolean, attribute: false }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	disconnectedCallback() {
		this.subscription.unsubscribe();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * 
	 * 
	 * @param {Number} givenStepNumber - The step number that was clicked on 
	 * 
	 * @ignore
	 * @returns {void}
	 */
	_click(givenStepNumber) {
		this.dispatchEvent(new CustomEvent(`step-click`, {
			detail: {
				stepNumber: givenStepNumber
			}
		}));
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	// n/a

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_setLayout() {
		const layoutType = this.layout;
		if (this._isExtraSmall) {
			if (layoutType === LAYOUTTYPE.VERTICAL) {
				this.wasVertical = true;
			}
			this.setAttribute(`layout`, LAYOUTTYPE.HORIZONTAL);
		} else if (this.wasVertical) {
			this.setAttribute(`layout`, LAYOUTTYPE.VERTICAL);
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
				:host([layout="horizontal"]){
					flex-direction: row;
				}

				:host([layout="vertical"]){
					flex-direction: column;
				}

				:host > .step-container {
					height: var(--theme-stepper-step-container-height, 56px);
					align-items: center;
					position: relative;
					background-color: var(--theme-stepper-background-color, #FFFFFF);
					border-right: var(--theme-stepper-container-border, 1px solid #E3E3E3);
					border-bottom: var(--theme-stepper-container-border, 1px solid #E3E3E3);
					cursor: pointer;
				}

				:host([layout="horizontal"]) > .step-container {
					flex-direction: column;
					align-items: flex-start;
					border-top: var(--theme-stepper-container-border, 1px solid #E3E3E3);
				}

				:host([layout="vertical"]) > .step-container {
					flex-direction: row;
					border-left: var(--theme-stepper-container-border, 1px solid #E3E3E3);
				}

				:host([layout="horizontal"]) > .step-container:first-child {
					border-left: var(--theme-stepper-container-border, 1px solid #E3E3E3);
				}

				:host([layout="vertical"]) > .step-container:first-child {
					border-top: var(--theme-stepper-container-border, 1px solid #E3E3E3);
				}

				:host([layout="horizontal"]) .inner-step-container:not(.active-step) {
					padding-bottom: var(--theme-stepper-active-step-bar-width, 2px);
				}

				.step-container > .inner-step-container {
					flex: 1 auto;
					height: var(--theme-stepper-inner-step-container-height, 100%);
					align-items: center;
					width: var(--theme-stepper-inner-step-container-width, 100%);
				}

				.inner-step-container > .step-content-container {
					padding-left: var(--theme-stepper-step-content-container-padding-left, 24px);
					padding-right: var(--theme-stepper-step-content-container-padding-right, 12px);
				}

				:host([layout="horizontal"]) .step-container > .active-step-bar {
					border-radius: var(--theme-stepper-horizontal-indicator-border-radius, 60px 60px 0px 0px);
					height: var(--theme-stepper-active-step-bar-horizontal-height, 2px);
					width: var(--theme-stepper-active-step-bar-horizontal-width, 98%);
					align-self: center;
				}

				.active-step-bar {
					background-color: var(--theme-stepper-active-step-indicator-color, #009DE0);
				}

				:host([layout="vertical"]) .step-container > .active-step-bar {
					border-radius: var(--theme-stepper-vertical-indicator-border-radius, 60px 0px 0px 60px);
					height: var(--theme-stepper-active-step-bar-horizontal-width, 98%);
					width:  var(--theme-stepper-active-step-bar-horizontal-height, 2px);
				}

				.step-content-container > .step-title {
					padding-left: var(--theme-stepper-step-title-padding-left, 16px);
					text-overflow: ellipsis;
					white-space: nowrap;
					overflow: hidden;
					max-width: var(--theme-stepper-step-title-max-width, 80%);
					font-size: var(--theme-stepper-step-title-font-size, 15px);
					font-weight: var(--theme-stepper-step-title-font-weight, 600);
					color: var(--theme-stepper-step-title-font-color, #545D60);
					line-height: var(--theme-stepper-step-title-line-height, 24px);
				}

				.step-title.step-title-disabled {
					font-weight: var(--theme-font-weight, 400);
				}

				.step-content-container .step-number {
					background-color: var(--theme-stepper-step-number-background-color, #DAF2F4);
					border-radius: var(--theme-stepper-step-number-border-radius, 50%);
					width: var(--theme-stepper-step-number-width, 24px);
					height: var(--theme-stepper-step-number-height, 24px);
					border: var(--theme-stepper-step-number-border, 2px solid #05829B);
					color: var(--theme-stepper-step-number-font-color, #05829B);
					font-size: var(--theme-stepper-step-number-font-size, 14px);
					font-weight: var(--theme-stepper-step-number-font-weight, 600);
					line-height: var(--theme-stepper-step-number-line-height, 14px);
					flex: 1 auto;
					justify-content: center;
					align-items: center;
				}

				.step-number.step-number-disabled {
					background-color: var(--theme-stepper-background-color, #FFFFFF);
					color: var(--theme-stepper-step-number-disabled-color, #969B9D);
					border: var(--theme-stepper-step-number-disabled-border, 1px solid grey)
				}

				.step-content-container > .error-title {
					color: var(--theme-stepper-error-step-color, #C83B37);
				}

				.step-content-container .step-icon {
					width: var(--theme-stepper-step-icon-width, 100%);
					height: var(--theme-stepper-step-icon-height, 100%);
					justify-content: center;
					align-items: center;
				}

				.flex {
					display: flex;
				}

				.grow {
					flex: 1 auto;
				}

				.shrink {
					flex: 0;
				}

				.step-container > .disabled {
					background-color: var(--theme-stepper-disabled-step-color, #F7F7F7);
					opacity: var(--theme-stepper-disabled-step-container-opacity, 0.6);
					height: var(--theme-stepper-step-disabled-height, 100%);
					width: var(--theme-stepper-step-disabled-width, 100%);
					position: absolute;
				}

				@media only screen and (max-width: 767px) {
					.step-content-container > .step-title {
						text-overflow: ellipsis;
						white-space: nowrap;
						overflow: hidden;
						max-width: var(--theme-stepper-step-title-extra-small-max-width, 80%);
					}

					.inner-step-container > .step-content-container {
						padding-left: var(--theme-stepper-step-content-container-extra-small-padding-left, 11px);
						padding-right: var(--theme-stepper-step-content-container-extra-small-padding-right, 11px);
					}

					:host([layout="horizontal"]) :not(.active-step) > .step-content-container > .step-title {
						display: none;
					}
				}
			`
		];
	}

	/**
	 * Generates the step icon for a step in the component.
	 *
	 * @param {Number} stepNumber The step number that is to be rendered.
	 * @param {Boolean} isError A check to determine whether or not the step that is being rendered is an error.
	 * 
	 * @ignore
	 * @returns {html} The html content of the step icon.
	 */
	_renderStepIcon(stepNumber, isError) {
		if (stepNumber < this.activeStepNumber) {
			let icon = `status/success-trans`;
			if (isError) {
				icon = `status/error-trans`;
			}
			return html`<capitec-icon size="default" icon="${icon}" class="step-icon">`;
		}

		return html`
			<div class="step-number flex ${stepNumber > this.activeStepNumber ? `step-number-disabled` : ``}">
				${stepNumber}
			</div>`;

	}

	/**
	 * Generates the overlay div that renders a step as being disabled.
	 *
	 * @ignore
	 * @returns {html} The html content of the disabled overlay.
	 */
	_renderDisabledContainer() {
		return html`
		<div class="disabled">
			&nbsp;
		</div>`;
	}

	/**
	 * Generates each step of the stepper component.
	 *
	 * @param {LayoutAttribute} layoutType The layout type of the stepper container
	 * 
	 * @ignore
	 * @returns {html} The html content of each step of the stepper component.
	 */
	_renderStepperContent() {
		if (Array.isArray(this.steps)) {
			return this.steps.map((step, index) => {
				const isCurrentStep = this.activeStepNumber === index + 1;

				return html`
					<div class="flex grow step-container ${this._isExtraSmall && !isCurrentStep ? `shrink` : ``}"
						@click="${() => this._click(index + 1)}">
						<div class="inner-step-container flex ${isCurrentStep ? `active-step` : ``}">
							<div class="step-content-container grow flex">
								<div>
									${this._renderStepIcon(index + 1, step.isError)}
								</div>
								<div
									class="step-title ${this.activeStepNumber < index + 1 ? `step-title-disabled` : ``} ${this.activeStepNumber > index + 1 && step.isError ? `error-title` : ``}">
									${step.title}
								</div>
							</div>
						</div>
						${isCurrentStep ? html`<div class=active-step-bar></div>` : html``}
						${this.activeStepNumber < index + 1 ? this._renderDisabledContainer() : null} </div>
				`;
			});
		}
		return html``;
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
	 * Generates the component template for kiosk mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_kioskTemplate() {
		return this._webTemplate();
	}

	/**
	 * Generates the component template for web mode.
	 *
	 * @returns {html} The html content of the component.
	 */
	_webTemplate() {
		this._setLayout();
		return html`
			${this._renderStepperContent()}
		`;
	}
}

window.customElements.define(`capitec-stepper`, Stepper);

/**
 * When a step in the stepper is clicked.
 *
 * @example
 * <capitec-stepper ... @step-click="${this._handler}"></capitec-stepper>
 *
 * @event Stepper#step-click
 * @type {Object}
 * @property {Object} detail Contains what step was clicked.
 * @property {Boolean} detail.stepNumber - The number of the step that was clicked
 */