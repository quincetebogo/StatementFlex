import { Component, css, html } from '../../elements/index.js';
import { DateTime, Info, Interval } from 'luxon';
import { InputLayouts } from '../input-layouts.js';
import './Select.js';

/**
 * An input control that displays a calendar and allows selection of a date.
 *
 * ```js
 * import 'platform/components/inputs/Calendar';
 * ```
 *
 * ```html
 * <capitec-calendar
 *   month="Jan"
 *   year="2019"
 *   date="2019-02-01T13:00:00.00000+02:00"
 *   range
 *   startDate="2019-02-01T13:00:00.00000+02:00"
 *   endDate="2019-02-01T13:00:00.00000+02:00"
 *   minDate="1919-01-01T13:00:00.00000+02:00"
 *   maxDate="2099-01-01T13:00:00.00000+02:00">
 * </capitec-calendar>
 * ```
 */
export class Calendar extends Component {
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();

		// pseudo constants
		this.DAYS = [`Sun`, `Mon`, `Tue`, `Wed`, `Thu`, `Fri`, `Sat`];
		this.SHORT_MONTHS = Info.months(`short`);
		this.LONG_MONTHS = Info.months(`long`);

		// Custom event constants
		this.VALUE_CHANGE = `value-change`;
		this.VALUE_CHANGED = `value-changed`;
		this.MONTH_CHANGE = `month-change`;
		this.MONTH_CHANGED = `month-changed`;
		this.YEAR_CHANGE = `year-change`;
		this.YEAR_CHANGED = `year-changed`;

		// Component properties
		this.month = ``;
		this.year = ``;
		this.date = null;
		this.range = false;
		this.startDate = null;
		this.endDate = null;
		this.minDate = DateTime.local(2000, 1);
		this.maxDate = DateTime.local(DateTime.local().year, 12, 31);
	}

	// ----------
	// PROPERTIES
	// ----------

	/**
	 * Registry of all properties defined by the component.
	 *
	 * @property {String} [month] - The month that should be displayed on the calendar.
	 * @property {String} [year] - The year of the month displayed on the calendar.
	 *
	 * @property {String} [date] - The selected date on the calendar as a string (if single date).
	 *
	 * @property {Boolean} [range] - If present, the calendar will be in "range" mode.
	 *      NOTE: When in range mode, the selected date will not update when clicking another date.
	 *      This needs to be orchestrated by a parent component (for example a date range picker).
	 *
	 * @property {String} [startDate] - Provide a Start Date.
	 * @property {String} [endDate] - Provide an End Date.
	 * @property {String} [minDate] - Provide a min Date - User can't select before this point in time.
	 * @property {String} [maxDate] - Provide a max Date - User can't select after this point in time.
	 *
	 * @property {Array} [_years] - The list of years that can be selected between the min and max dates. (deprecated)
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
		const monthConverter = (value) => isNaN(value) ? value : DateTime.local(2020, parseInt(value, 10) + 1).monthShort;
		const yearConverter = (value) => isNaN(value) ? DateTime.local().year : parseInt(value, 10);

		return {
			month: {
				type: String,
				converter: monthConverter
			},
			year: {
				type: String,
				converter: yearConverter
			},
			date: {
				type: String,
				converter: dateConverter
			},
			range: { type: Boolean },
			startDate: {
				type: String,
				converter: dateConverter
			},
			endDate: {
				type: String,
				converter: dateConverter
			},
			minDate: {
				type: String,
				converter: dateConverter
			},
			maxDate: {
				type: String,
				converter: dateConverter
			},
			_years: { type: Array }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	connectedCallback() {
		super.connectedCallback();
		if (this.startDate > this.endDate) {
			const temp = this.startDate;

			this.startDate = this.endDate;
			this.endDate = temp;
		}

		if (!this.month || !this.year) {
			if (this.range) {
				if (this.startDate) {
					this.month = this.startDate.monthShort;
					this.year = this.startDate.year;
				} else if (this.endDate) {
					this.month = this.endDate.monthShort;
					this.year = this.endDate.year;
				} else {
					this.month = DateTime.local().monthShort;
					this.year = DateTime.local().year;
				}
			} else if (this.date) {
				this.month = this.date.monthShort;
				this.year = this.date.year;
			} else {
				this.month = DateTime.local().monthShort;
				this.year = DateTime.local().year;
			}
		}
	}

	attributeChangedCallback(name, oldVal, newVal) {
		super.attributeChangedCallback(name, oldVal, newVal);

		// needed for backwards compatibility for DateTimePicker
		// lit element doesnt seem to enter the converter for attributes with a . prefix
		if (!(this.minDate instanceof DateTime)) {
			this.minDate = this.convertToDateTime(this.minDate);
		}
		if (!(this.maxDate instanceof DateTime)) {
			this.maxDate = this.convertToDateTime(this.maxDate);
		}

		if (name === `startDate` || name === `endDate`) {
			if (this.startDate > this.endDate) {
				const temp = this.startDate;

				this.startDate = this.endDate;
				this.endDate = temp;
			}
		}

	}

	// --------------
	// EVENT HANDLERS
	// --------------

	/**
	 * @param  {DateTime} date clicked date
	 * @returns {void}
	 */
	_handleDateClicked(date) {
		if (date >= this._getMinDate() && date <= this._getMaxDate()) {
			const currentDate = this.date || DateTime.local(this.year, this._getCurrentMonthIndex());
			const oldValue = this.date ? this.date.toJSDate() : null;

			this._dispatchCustomEvent({ date: oldValue }, { date: date.toJSDate() }, this.VALUE_CHANGE);
			this._dispatchCustomEvent({ date: oldValue }, { date: date.toJSDate() }, this.VALUE_CHANGED);

			if (currentDate.month !== date.month) {
				this.month = this.SHORT_MONTHS[date.month - 1];
			}
			if (currentDate.year !== date.year) {
				this.year = date.year;
			}
			this.date = date;
		}
	}

	/**
	 * @param  {Event} e event fired from changing month
	 * @returns {void}
	 */
	_handleSelectedMonthChanged(e) {
		e.stopPropagation();
		this.month = this.SHORT_MONTHS[e.detail.new.month];

		this._dispatchCustomEvent(e.detail.old, e.detail.new, this.MONTH_CHANGE);
		this._dispatchCustomEvent(e.detail.old, e.detail.new, this.MONTH_CHANGED);
	}

	/**
	 * @param  {Event} e event fired from changing year
	 * @returns {void}
	 */
	_handleSelectedYearChanged(e) {
		e.stopPropagation();
		this.year = e.detail.new.year;
		const newDate = DateTime.local(e.detail.new.year, this._getCurrentMonthIndex());

		if (newDate < this._getMinDate()) {
			this.month = this._getMinDate().monthShort;
		}
		if (newDate > this._getMaxDate()) {
			this.month = this._getMaxDate().monthShort;
		}

		this._dispatchCustomEvent(e.detail.old, e.detail.new, this.YEAR_CHANGE);
		this._dispatchCustomEvent(e.detail.old, e.detail.new, this.YEAR_CHANGED);
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * Attempts to convert the given input into a DateTime object
	 * - returns null if fail
	 *
	 * @param  {any} value value to convert to type DateTime
	 * @returns {DateTime} DateTime object
	 */
	convertToDateTime(value) {
		const date = value && value !== `null` ? new Date(value) : null;

		if (date) {
			const dateTime = DateTime.fromJSDate(date);

			return dateTime.isValid ? dateTime : null;
		}

		return null;
	}

	/**
	 * Returns an array of numbers from the given start till end number,
	 *  - optional step value may be provided
	 *
	 * @param  {number} start the starting index of the range
	 * @param  {number} end the ending index of the range (not included)
	 * @param  {number} step=1 the incremental interval by which to set each number in the range
	 * @returns {Array<number>} range
	 */
	getRange(start, end, step = 1) {
		return Array.from(
			{ length: Math.ceil((end - start) / step) },
			(_, k) => (k * step) + start
		);
	}

	/**
	 * Performs a locale string comparison between two DateTime objects
	 *  - returns true if equal
	 *  - ignores time values
	 *
	 * @param  {DateTime} firstDate first date to compare
	 * @param  {DateTime} secondDate second date to compare
	 * @returns {boolean} returns true if year, month and day are equal for both dates
	 */
	isEqualDates(firstDate, secondDate) {
		return firstDate && secondDate && firstDate.toLocaleString() === secondDate.toLocaleString();
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	_getMinDate() {
		if (!(this.minDate instanceof DateTime)) {
			this.minDate = this.convertToDateTime(this.minDate);
		}
		if (!this.minDate) {
			this.minDate = DateTime.local(2000, 1);
		}

		return this.minDate;
	}

	_getMaxDate() {
		if (!(this.maxDate instanceof DateTime)) {
			this.maxDate = this.convertToDateTime(this.maxDate);
		}
		if (!this.maxDate) {
			this.maxDate = DateTime.local(DateTime.local().year, 11);
		}

		return this.maxDate;
	}

	_dispatchCustomEvent(oldValue, newValue, customEventName) {
		if (oldValue !== newValue) {
			this.dispatchEvent(new CustomEvent(customEventName, {
				detail: {
					old: oldValue,
					new: newValue
				},
				bubbles: true,
				composed: true
			}));
		}
	}

	_getCurrentMonthIndex() {
		const currentMonthIndex = this.SHORT_MONTHS.findIndex((month) => month === this.month);

		return currentMonthIndex === -1 ? DateTime.local().month : currentMonthIndex + 1;
	}

	_getMonthDropdownItems() {
		const monthDropdownItems = [];

		Info.months(`numeric`).forEach(month => {
			const date = DateTime.local(this.year, Number(month));
			const validDatesInterval = Interval.fromDateTimes(this._getMinDate(), this._getMaxDate());
			const daysInMonthInterval = Interval.fromDateTimes(date.startOf(`month`), date.endOf(`month`));
			const hasValidDay = validDatesInterval.intersection(daysInMonthInterval);

			if (hasValidDay) {
				monthDropdownItems.push({
					month: month - 1,
					name: date.monthLong,
					index: month - 1
				});
			}
		});

		return monthDropdownItems;
	}

	_getSelectedMonthItem() {
		const selectedMonthIndex = this._getCurrentMonthIndex();

		return {
			month: selectedMonthIndex - 1,
			name: this.LONG_MONTHS[selectedMonthIndex - 1],
			index: selectedMonthIndex - 1
		};
	}

	_getYearDropdownItems() {
		const startYear = this._getMinDate().year;
		const endYear = this._getMaxDate().year + 1;
		const years = this.getRange(startYear, endYear);
		const yearDropdownItems = years.map((year) => ({
			year: year,
			name: `${year}`,
			index: year
		}));

		return yearDropdownItems;
	}

	_getSelectedYearItem() {
		const selectedYear = this.year;

		return {
			month: selectedYear,
			name: `${selectedYear}`,
			index: selectedYear
		};
	}

	/**
	 * @param  {DateTime} date date to base classes on
	 * @returns {String} classnames
	 */
	_getDateStyle(date) {
		let styles = ``;
		const currentDate = DateTime.local(this.year, this._getCurrentMonthIndex());
		const isNotSelectable = date < this._getMinDate() || date > this._getMaxDate() || date.month !== currentDate.month;

		styles += isNotSelectable ? ` not-selectable` : ` selectable`;

		return styles;
	}

	/**
	 * @param  {DateTime} date date to base classes on
	 * @returns {String} classnames
	 */
	_getRangeStyle(date) {
		let styles = ``;
		const currentDate = DateTime.local(this.year, this._getCurrentMonthIndex());
		const isNotSelectable = date < this._getMinDate() || date > this._getMaxDate() || date.month !== currentDate.month;

		if (date && !isNotSelectable) {
			const isInRange = this.range && date >= this.startDate && date <= this.endDate;
			const isFirstInRange = this.range && this.isEqualDates(date, this.startDate);
			const isLastInRange = this.range && this.isEqualDates(date, this.endDate);

			const isStartOfLine = date.weekday === 7;
			const isEndOfLine = date.weekday === 6;

			const isFirstDayOfMonth = date.day === 1;
			const isLastDayOfMonth = date.day === date.daysInMonth;

			if (this.range && this.startDate && this.endDate) {

				if (isInRange) {

					if (!isNotSelectable && isFirstDayOfMonth && isEndOfLine) {
						styles += ` isolated-range`;
					}

					if (!isNotSelectable && !isFirstInRange && !isLastInRange && !isStartOfLine && !isEndOfLine && !isFirstDayOfMonth && !isLastDayOfMonth) {
						styles += ` range`;
					}

					if ((isStartOfLine || isFirstDayOfMonth) && !isLastInRange && !isEndOfLine) {
						styles += ` start-of-line`;
					}

					if ((isEndOfLine || isLastDayOfMonth) && !isFirstInRange && !isStartOfLine && !isFirstDayOfMonth) {
						styles += ` end-of-line`;
					}
				}

				if (!isStartOfLine && !isEndOfLine) {
					if (isFirstInRange && !isLastInRange && !isLastDayOfMonth && !isEndOfLine) {
						styles += ` start-of-line`;
					}

					if (!isFirstInRange && isLastInRange && !isFirstDayOfMonth) {
						styles += ` end-of-line`;
					}
				}

				if (isFirstInRange) {
					styles += ` first-in-range`;
				}

				if (isLastInRange) {
					styles += ` last-in-range`;
				}
			}
		}

		return styles;
	}

	/**
	 * @param  {DateTime} date date to base classes on
	 * @returns {String} classnames
	 */
	_getDateValueStyle(date) {
		let styles = ``;
		let isSelected = false;
		const today = DateTime.local();
		const isToday = this.isEqualDates(date, today);
		const isInRange = this.range && date >= this.startDate && date <= this.endDate;

		if (this.range) {
			if (this.startDate || this.endDate) {
				isSelected = this.isEqualDates(date, this.startDate) || this.isEqualDates(date, this.endDate);
			}
		} else if (this.date) {
			isSelected = this.isEqualDates(date, this.date);
		}

		styles += isSelected ? ` selected` : ``;

		if (isToday && !isInRange && !isSelected) {
			styles += ` today`;
		}

		return styles;
	}

	// ---------
	// RENDERING
	// ---------

	static get styles() {
		return [
			super.styles,
			InputLayouts,
			css`

				:host {
					min-width: var(--theme-calendar-min-width, 345px);
					max-width: var(--theme-calendar-max-width, 460px);
				}

				.body {
					width: var(--theme-calendar-body-width, min-content);
				}

				.calendar {
					display: flex;
					align-items: center;
					min-width: var(--theme-calendar-calendar-min-width, 345px);
					flex-direction: column;
					border: var(--theme-calendar-calendar-border, 1px solid #e1e1e1);
					border-radius: var(--theme-calendar-calendar-border-radius, 5px);
					background-color: var(--theme-input-background-color, #ffffff);
					z-index: var(--theme-calendar-calendar-z-index, 1100);
				}

				.month {
					display: flex;
					flex-direction: row;
					justify-content: space-evenly;
				}

				.days {
					display: grid;
					justify-content: center;
					align-items: center;
					grid-template-columns: var(--theme-calendar-days-grid-template-columns, 1fr 1fr 1fr 1fr 1fr 1fr 1fr);
					grid-auto-rows: var(--theme-calendar-days-grid-auto-rows, 36px);
					align-items: center;
					justify-items: center;
					font-size: var(--theme-calendar-days-font-size, 14px);
					text-align: var(--theme-calendar-days-text-align, center);
					color: var(--theme-calendar-days-color, #003652);
					font-weight: var(--theme-calendar-days-font-weight, 500);
					border-top: var(--theme-calendar-days-border-top, 1px solid #e1e1e1);
					width: var(--theme-calendar-days-width, 100%);
					padding: var(--theme-calendar-days-padding, 18px);
					line-height: var(--theme-calendar-days-line-height, 22px);
				}

				.day {
					display: flex;
					width: var(--theme-calendar-day-width, 100%);
					height: var(--theme-calendar-day-height, 100%);
					justify-content: center;
					align-items: center;
				}

				.selectable {
					cursor: var(--theme-calendar-selectable-cursor, pointer);
					color: var(--theme-calendar-selectable-color, #4e6066);
				}

				.not-selectable {
					cursor: var(--theme-calendar-not-selectable-cursor, default);
					color: var(--theme-calendar-not-selectable-color, #b3b5b5);
				}

				.selected {
					width: var(--theme-calendar-selected-width, 24px);
					background-color: var(--theme-calendar-selected-background-color, #009de0 );
					border-radius: var(--theme-calendar-selected-border-radius, 20%);
					color: var(--theme-calendar-selected-color, #ffffff);
				}

				.today {
					width: var(--theme-calendar-today-width, 24px);
					background-color: var(--theme-calendar-today-background-color, #f5f5f5);
					border-radius: var(--theme-calendar-selected-border-radius, 20%);
					color: var(--theme-calendar-today-color, #4e6066);
				}

				.range {
					width: var(--theme-calendar-range-width, 100%);
					background-color: var(--theme-calendar-range-background-color, rgba(0, 131, 187, 0.1));
					display: flex;
					justify-content: center;
				}

				.isolated-range {
					width: var(--theme-calendar-isolated-range-width, 24px);
					border-radius: var(--theme-calendar-selected-border-radius, 20%);
					background-color: var(--theme-calendar-range-background-color, rgba(0, 131, 187, 0.1));
				}

				.start-of-line {
					width: var(--theme-calendar-start-of-line-width, 100%);
					display: flex;
					justify-content: center;
					background-color: var(--theme-calendar-range-background-color, rgba(0, 131, 187, 0.1));
					border-top-left-radius: var(--theme-calendar-selected-border-radius, 20%);
					border-bottom-left-radius: var(--theme-calendar-selected-border-radius, 20%);
					background: var(--theme-calendar-start-of-line-background, linear-gradient(to right, transparent 0%,transparent 25%, rgba(0, 131, 187, 0.1) 50%, rgba(0, 131, 187, 0.1) 100%));
				}

				.end-of-line {
					width: var(--theme-calendar-end-of-line-width, 100%);
					display: flex;
					justify-content: center;
					border-top-right-radius: var(--theme-calendar-selected-border-radius, 20%);
					border-bottom-right-radius: var(--theme-calendar-selected-border-radius, 20%);
					background-color: var(--theme-calendar-range-background-color, rgba(0, 131, 187, 0.1));
					background: var(--theme-calendar-end-of-line-background, linear-gradient(to left, transparent 0%,transparent 25%, rgba(0, 131, 187, 0.1) 50%, rgba(0, 131, 187, 0.1) 100%));
				}

				.first-in-range {
					background: var(--theme-calendar-first-in-range-background, linear-gradient(to right, transparent 0%,transparent 50%, rgba(0, 131, 187, 0.1) 50%, rgba(0, 131, 187, 0.1) 100%));
				}

				.last-in-range {
					background: var(--theme-calendar-last-in-range-background, linear-gradient(to left, transparent 0%,transparent 50%, rgba(0, 131, 187, 0.1) 50%, rgba(0, 131, 187, 0.1) 100%));
				}

				.select-month {
					width: var(--theme-calendar-select-month-width, 132px);
				}

				.select-year {
					width: var(--theme-calendar-select-year-width, 90px);
					--theme-input-padding-right: 16px;
				}

			`
		];
	}

	_mobileTemplate() {
		return this._webTemplate();
	}

	_webTemplate() {
		return html`
			<div class="calendar">
				<div class="month">${this._renderCalendarDropdowns()}</div>
				<div class="days">${this._renderCalendarBody()}</div>
			</div>
		`;
	}

	_kioskTemplate() {
		return this._webTemplate();
	}

	_renderCalendarDropdowns() {
		return html`
			<capitec-select
				mode="inline"
				class="select-month"
				label="Month"
				.items=${this._getMonthDropdownItems()}
				.value=${this._getSelectedMonthItem()}
				display-field="name"
				id-field="month"
				@value-change=${(e) => e.stopPropagation()}
				@value-changed=${(e) => this._handleSelectedMonthChanged(e)}
			>
			</capitec-select>
			<capitec-select
				mode="inline"
				class="select-year"
				label="Year"
				.items=${this._getYearDropdownItems()}
				.value=${this._getSelectedYearItem()}
				display-field="name"
				id-field="year"
				@value-change=${(e) => e.stopPropagation()}
				@value-changed=${(e) => this._handleSelectedYearChanged(e)}
			>
			</capitec-select>
		`;
	}

	_renderDayNameBar() {
		return html`${this.DAYS.map((day) => html`<div class="day-names">${day}</div>`)}`;
	}

	/**
	 * @param  {DateTime} date date to render
	 * @returns {html} day in calendar
	 */
	_renderDay(date) {
		return html`
			<div class="day ${this._getDateStyle(date)}" @click=${() => this._handleDateClicked(date)}>
				<div class="${this._getRangeStyle(date)}">
					<div class="${this._getDateValueStyle(date)}">${date.day}</div>
				</div>
			</div>
		`;
	}

	/**
	 * @param  {DateTime} startDate date to start rendering from
	 * @param  {number} numberOfDays number of days to render from start date
	 * @returns {html} array of days in calendar
	 */
	_renderDays(startDate, numberOfDays) {
		const beginDate = startDate.day;
		const dates = this.getRange(beginDate, beginDate + numberOfDays);

		return dates.map((date) => {
			const currentDate = DateTime.local(
				startDate.year,
				startDate.month,
				date
			);

			return this._renderDay(currentDate);
		});
	}

	_renderCalendarBody() {
		const date = DateTime.local(this.year, this._getCurrentMonthIndex());

		const currentMonthStartDate = date.startOf(`month`);
		const currentMonthFirstDay = currentMonthStartDate.weekday;
		const currentMonthLastDay = date.endOf(`month`).weekday;
		const daysInCurrentMonth = date.daysInMonth;

		const previousMonth = date.minus({ months: 1 });
		const daysInPreviousMonth = previousMonth.daysInMonth;
		let previousMonthDays = currentMonthFirstDay;
		let previousMonthStartDate = DateTime.local(previousMonth.year, previousMonth.month, daysInPreviousMonth - previousMonthDays + 1);

		const nextMonth = date.plus({ months: 1 });
		let nextMonthDays = 6 - currentMonthLastDay;

		const totalDaysInDisplay = previousMonthDays + daysInCurrentMonth + nextMonthDays;

		// adds filler days to either the top or bottom of the calendar to maintain height
		if (totalDaysInDisplay <= 35) {
			if (previousMonthDays < 2) {
				previousMonthDays += 7;
				previousMonthStartDate = DateTime.local(previousMonth.year, previousMonth.month, daysInPreviousMonth - previousMonthDays + 1);
			} else {
				nextMonthDays += 7;
			}
		}

		return html`
			${this._renderDayNameBar()}
			${this._renderDays(previousMonthStartDate, previousMonthDays)}
			${this._renderDays(currentMonthStartDate, daysInCurrentMonth)}
			${this._renderDays(nextMonth, nextMonthDays)}
		`;
	}
}

window.customElements.define(`capitec-calendar`, Calendar);

/**
 * When the year value of the calendar changed.
 *
 * @example
 * <capitec-calendar ... @year-change="${this._handler}"></capitec-calendar>
 *
 * @event Calendar#year-change
 * @type {Object}
 * @property {Object} detail Contains the old year value and new year value.
 * @property {String} detail.old.year - old year value.
 * @property {String} detail.new.year - new year value.
 */

/**
 * When the month value of the calendar changed.
 *
 * @example
 * <capitec-calendar ... @month-change="${this._handler}"></capitec-calendar>
 *
 * @event Calendar#month-change
 * @type {Object}
 * @property {Object} detail Contains old month value and new month value.
 * @property {String} detail.old.month - old month value.
 * @property {String} detail.new.month - new month value.
 */

/**
 * When the value of the calendar changed.
 *
 * @example
 * <capitec-calendar ... @value-change="${this._handler}"></capitec-calendar>
 *
 * @event Calendar#value-change
 * @type {Object}
 * @property {Object} detail Contains the old value and the new value.
 * @property {String} detail.old.date - old calendar value.
 * @property {String} detail.new.date - new calendar value.
 */