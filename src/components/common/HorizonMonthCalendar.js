import { Component, classMap, css, html, styleMap } from 'platform/elements';
import { DateTime, Interval } from 'luxon';
import { InputLayouts } from 'platform/components/input-layouts';
import { debounceTime } from 'rxjs/operators';
import { fromEvent } from 'rxjs';

import 'platform/components/inputs/Calendar';
import 'platform/components/buttons/Button';
import 'platform/components/inputs/Select';


// ----------
// TYPE DEFINITIONS
// ----------

/**
 * An input control that allows a user to select a month.
 *
 * Dates supplied must be a string in ISO 8601 format.
 * The output date type will be a month in String format and year in number format.
 *
 * ```js
 * import 'app/components/common/HorizonMonthCalendar';
 * ```
 *
 * ```html
 * <horizon-month-calendar
 *   label='Select Date Range'
 *   error='This is a required field'
 *   minDate='1919-01-01T00:00:00.00000+02:00'
 *   maxDate='2099-31-31T24:00:00.00000+02:00'
 *  >
 * </horizon-month-calendar>
 * ```
 *
 */

export class HorizonMonthCalendar extends Component {
	// --------------
	// INITIALISATION
	// --------------

	constructor() {
		super();

		// Component properties
		this.error = null;
		this.label = null;
		this.today = DateTime.now();
		this.minDate = DateTime.local(2001, 1);
		this.maxDate = this.today;
		this.months = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
		this.year = this.today.year;

		this._showExpander = false;
		this._isFocussed = false;
		this._windowWidth = window.innerWidth;

		this.addEventListener(`focus`, this._onFocus);

		this.$$resize = fromEvent(window, `resize`)
			.pipe(debounceTime(800))
			.subscribe((event) => {
				this._windowWidth = event.target.innerWidth;
			});
			this.buttonType = [];
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 * @property {String} [error] - Error text to display.
	 * @property {String} [label] - Label text to display.
	 *
	 * @property {String} [minDate="1900-01-01T00:00:00"] - Provide a min Date in ISO format - User can't select before this point in time.
	 * @property {String} [maxDate="2099-01-01T23:59:00"] - Provide a max Date in ISO format - User can't select after this point in time.
	 *
	 * @property {Boolean} [focussed=false] - Indicator if the component should be focussed.
	 */
	static get properties() {
		const dateConverter = (value) => {
			const date = value && value !== `null` ? new Date(value) : null;

			if (date) {
				const dateTime = DateTime.fromJSDate(date);

				return dateTime.isValid ? dateTime : null;
			}

			return null;
		};

		return {
			error: { type: String },
			label: { type: String },
			minDate: { type: String, converter: dateConverter },
			maxDate: { type: String, converter: dateConverter },
			year: { type: Number },
			buttonType: { type: Array },

			_isFocussed: { type: Boolean },
			_windowWidth: { type: Number },
			_showExpander: { type: Boolean }

		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	disconnectedCallback() {
		this.$$resize.unsubscribe();
		super.disconnectedCallback();
	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * When the select component gains focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocus(e) {
		this._isFocussed = true;
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	_toggleExpander() {
		this._showExpander = !this._showExpander;
		this._isFocussed = this._showExpander;
	}

	_getLabel() {
		if (this.label) {
			return this.label;
		}

		return `Choose another date`;
	}

	_dateSelected(index) {
		if (this.buttonType[index] === `white`) {
			return;
		}
		this._toggleExpander();
		this.dispatchEvent(new CustomEvent(`value-changed`, {
			detail: {
				month: index + 1,
				year: this.year
			}
		}));
		
		this.requestUpdate();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_nextYear() {
		if (this.year < this.today.year) {
			this.year++;
		}
	}

	_previourYear() {
		this.year--;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			css`
				${InputLayouts}

				:host {
					min-width: var(--theme-date-time-picker-host-min-width, 180px);
					max-width: var(--theme-date-time-picker-host-max-width, 460px);
				}

				:host([error]) {
					--theme-date-time-picker-container-focussed-calendar-icon-border-left: 2px solid #C83C37;
				}

				.select {
					cursor: pointer;
					flex: 1;
				}

				.calendar.hidden {
					display: none;
				}

				.container {
					background-color: var(--theme-date-time-picker-container-background-color, transparent);
				}

				.container > .calendar-icon {
					display: flex;
					top: var(--theme-date-time-picker-container-calendar-icon-top, 0px);
					right: var(--theme-date-time-picker-container-calendar-icon-right, 0px);
					margin: var(--theme-date-time-picker-container-calendar-icon-margin, 1px);
					padding: var(--theme-date-time-picker-container-calendar-icon-padding, 0px 16px);
					height: var(--theme-date-time-picker-container-calendar-icon-height, 24px);
				}

				.container.focussed > .calendar-icon {
					border-left: var(--theme-date-time-picker-container-focussed-calendar-icon-border-left, 2px solid #009de0);
				}

				.container > .field {
					font-size: var(--theme-date-time-picker-container-field-font-size, 16px);
					color: var(--theme-system-font-color, #4e6066);
					z-index: var(--theme-date-time-picker-container-z-index, 1101);
					cursor: pointer;
				}

				.container.focussed > .label {
					transform: translateY(var(--theme-input-label-transform-y));
					font-size: var(--theme-date-time-picker-focussed-label-font-size, 0.75em);
					padding: var(--theme-date-time-picker-focussed-label-padding, 0px 2px);
				}

				.container.focussed > .field {
					border-radius: var(--theme-date-time-picker-focussed-border-radius, 4px);
					color: var(--theme-date-time-picker-focussed-field-color, #b3b5b5);
					font-size: var(--theme-date-time-picker-focussed-font-size, 16px);
				}

				.container.valueSelected > .field {
					color: var(--theme-date-time-picker-value-selected-field-color, #4e6066);
					font-size: var(--theme-date-time-picker-focussed-font-size, 16px);
				}

				.container.valueSelected > .label {
					transform: translateY(var(--theme-input-label-transform-y));
					font-size: var(--theme-date-time-picker-focussed-label-font-size, 0.75em);
					padding: var(--theme-date-time-picker-focussed-label-padding, 0px 2px);
				}

				.valueSelected > .label {
					color: var(--theme-system-font-color, #4e6066);
				}

				.focussed > .label.focussed {
					color: var(--theme-button-default-font-color, #009de0);
				}

				.basicPicker {
					min-width: var(--theme-date-time-picker-basic-picker-min-width, 320px);
					height: var(--theme-date-time-picker-basic-picker-height, 48px);
					cursor: pointer;
				}

				.floatingContainer {
					position: relative;
				}

				.monthButton{
					width: 80px;
					height: 48px;
					margin-right:8px;
					margin-top: 5px;
					--theme-button-font-family: "Hind Vadodara";
					--theme-button-font-size: 16px;
					--theme-button-font-weight: 600;
					--theme-button-line-height: 20px;
					--theme-button-default-font-color: #009DE0;
					--theme-button-clear-font-color: #3A3A3A;
				}

				.rotateChevronRight{
					transform: rotate(270deg);
				}

				.rotateChevronLeft{
					transform: rotate(90deg);
				}

				capitec-label[type="strong"]{
					color: #3A3A3A;
					font-family: "Hind Vadodara";
					font-size: 16px;
					font-weight: 600;
					letter-spacing: 0;
					line-height: 20px;
					margin-left: 90px;
					margin-right: 90px;
				}
				.leftArrow{
					margin-left:32px;
				}

				.rightArrow{
					margin-right:32px;
				}

				.calendarContainer{
					height: 316px;
					width: 320px;
					box-shadow: 0 6px 10px 0.25px rgba(0,0,0,0.07);
					border-radius: 4px;
					border: 1px solid #E1E1E1;
				}

				.yearContainer{
					border: 1px solid #E1E1E1;
					padding-top:16px;
					padding-bottom:16px;
				}
				.monthContainer{
					padding-left: 24px;
					padding-top: 16px;
				}

				capitec-button[type="white"]{
					--theme-button-white-font-color: #DEDEDE;
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
		return this._renderSingleCalendar();
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
	 * @returns {html} renders a calendar
	 */
	_renderCalendar() {
		return html`
			<div class="calendarContainer">
				<capitec-group>
					<div class="yearContainer">
						<capitec-group layout="horizontal">
							<div class="leftArrow" @click=${() => this._previourYear()}>
								<img
									class="rotateChevronLeft"
									src="./platform/icons/system/chevron-down-action.svg"/>
							</div>
							<capitec-label type="strong" label="${this.year}"></capitec-label>
							<div class="rightArrow" @click=${() => this._nextYear()}>
								<img
									class="rotateChevronRight"
									src="./platform/icons/system/chevron-down-action.svg"/>
							</div>
						</capitec-group>
					</div>

					<div class="monthContainer">
						${this.months.map((item, index) => this._renderButtons(item, index))}
					</div>
				</capitec-group>
			</div>
		`;
	}

	_renderButtons(name, index) {

		if (this.minDate.year > this.year) {
			return html`
				<capitec-button class="monthButton" type="${this.buttonType[index] = `white`}" label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>
			`;
		}

		if (this.minDate.year === this.year && this.minDate.month > this.months.indexOf(name)) {
			return html`
				<capitec-button class="monthButton" type="${this.buttonType[index] = `white`}" label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>
			`;
		}

		if (this.maxDate.year < this.year) {
			return html`
				<capitec-button class="monthButton" type="${this.buttonType[index] = `white`}" label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>
			`;
		}

		if (this.maxDate.year === this.year && this.maxDate.month <= this.months.indexOf(name)) {
			return html`
				<capitec-button class="monthButton" type="${this.buttonType[index] = `white`}" label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>
			`;
		}

		if (this.year === this.today.year && this.today.monthShort === name) {
			return this.maxDate >= this.today 
			? html`
				<capitec-button class="monthButton"  label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>`
			: html``;
		}

		return html`
			<capitec-button class="monthButton" type="${this.buttonType[index] = `clear`}" label="${name}" @click="${e => this._dateSelected(index)}"></capitec-button>
		`;
	}

	/**
	 * @param  {Boolean} isSelected icon in active state
	 * @param  {Function} onClickHandler function to call on click
	 * @returns {html} renders the calendar icon
	 */
	_renderCalendarIcon(isSelected, onClickHandler) {
		const iconStyles = {
			backgroundColor: isSelected && !this.error ? `#0083bb1a` : `transparent`
		};

		return html`
			<div class="icon calendar-icon ${this.error ? `error` : ``}" style=${styleMap(iconStyles)} @click=${onClickHandler}>
				<img style="height:24px;" src="./platform/icons/system/calendar${this.error ? `-error` : `-action`}.svg"/>
			</div>`;
	}

	_renderError() {
		return this.error ? html`<div class="error">${this.error}</div>` : ``;
	}

	_renderDateDisplay() {
		let selectedValue = ``;


			if (!this._showExpander) {
				selectedValue = this._getLabel();
			} else {
				selectedValue = `${this.today.monthShort} ${this.today.year}`;
			}
		

		const labelStyles = {
			focussed: this._isFocussed,
			error: this.error
		};
		const labelValue = this._showExpander ? this._getLabel() : null;

		return html`
			<label class="label ${classMap(labelStyles)}" for="inputField" >
				${labelValue}
			</label>
			<input
				id="inputField"
				class="field"
				type="text"
				readonly
				value="${selectedValue}"
				tabindex="${this.disabled ? `-1` : undefined}"
				@click=${() => this._toggleExpander()}
			/>
			${this._renderCalendarIcon(this._showExpander && this._isFocussed, this._toggleExpander)}
		`;
	}

	_renderSingleCalendar() {
		const containerStyles = {
			basicPicker: true,
			focussed: this._isFocussed,
			error: this.error
		};

		return html`
			<div class="select container ${classMap(containerStyles)}">
				${this._renderDateDisplay()}
				${this._showExpander ? html`
						<div class="container floatingContainer">
							${this._renderCalendar()}
						</div>
					` : html``}
				${this._renderError()}
			</div>
		`;
	}
}

window.customElements.define(`horizon-month-calendar`, HorizonMonthCalendar);

/**
 * When the selected value changes.
 *
 * @example
 * <horizon-month-calendar ... @value-changed="${this._handler}"></horizon-month-calendar>
 *
 * @event DateTimePicker#value-changed
 * @type {Object}
 * @property {Object} detail Contains month (String, short name) and year.
 * @property {Object} detail.month - Selected month.
 * @property {Object} detail.year - Selected year.
 */