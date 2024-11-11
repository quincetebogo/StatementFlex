import { Component, classMap, css, html, ifDefined, styleMap } from '../../elements/index.js';
import { DateTime, Interval } from 'luxon';

import { InputLayouts } from '../input-layouts.js';
import { debounceTime } from 'rxjs/operators/index.js';
import { fromEvent } from 'rxjs';

import './Calendar.js';
import '../buttons/Button.js';
import '../inputs/Select.js';

export const DATEVARIANCE = {
	START: `start`,
	END: `end`
};

export const DATEFORMAT = {
	DAY: `dd`,
	MONTH: `mm`,
	YEAR: `yyyy`,
	HOUR: `Hour`,
	MINUTE: `Min`
};

export const DATEMODE = {
	DATE: `date`,
	TIME: `time`,
	DATETIME: `datetime`
};

export const DATETYPE = {
	SINGLE: `single`,
	RANGE: `range`
};

export const INPUTTYPE = {
	CALENDAR: `calendar`,
	INPUT: `input`
};

export const OUTPUTTYPE = {
	STRING: `string`,
	DATE: `date`,
	DATETIME: `datetime`
};

// ----------
// TYPE DEFINITIONS
// ----------

/**
 * @typedef {Object} PredefinedRangeItem
 * @property {string} text - the display text of the dropdown option
 * @property {RangeResult} value - the stored value of the dropdown option
 */

/**
 * An input control that allows a user to select a date, a time, a date range, and various combinations of these.
 *
 * Dates supplied must be a string in ISO 8601 format.
 * The output date type will be a ISO formatted string unless otherwise specified by the consumer, in which it can be a JavaScript Date object.
 *
 * ```js
 * import 'platform/components/inputs/DateTimePicker';
 * ```
 *
 * ```html
 * <capitec-date-time-picker
 *   label='Select Date Range'
 *   errorMessage='This is no longer a required field' (deprecated)
 *   error='This is a required field'
 *   minDate='1919-01-01T00:00:00.00000+02:00'
 *   maxDate='2099-31-31T24:00:00.00000+02:00'
 *   type='single'
 *   date='2019-01-01T13:00:00.00000+02:00'
 *   startDate='2019-01-01T13:00:00.00000+02:00'
 *   endDate='2019-02-01T13:00:00.00000+02:00'
 *   mode='date|time|datetime'
 *   inputType='calendar|input'
 *   outputType='string|date|datetime'
 *   predefinedRanges='[
 *      {"text" : "Today",          "value" : "{ "startDate" : "2019-01-01T00:00:00.00000+02:00", "endDate" : "2019-01-01T23:59:59.99999+02:00" }" },
 *      {"text" : "Last 30 Days",   "value" : "{ "startDate" : "2019-01-01T13:00:00.00000+02:00", "endDate" : "2019-02-01T13:00:00.00000+02:00" }" },
 *      {"text" : "Last 60 Days",   "value" : "{ "startDate" : "2019-01-01T13:00:00.00000+02:00", "endDate" : "2019-02-01T13:00:00.00000+02:00" }" },
 *      {"text" : "Last 90 Days",   "value" : "{ "startDate" : "2019-01-01T13:00:00.00000+02:00", "endDate" : "2019-02-01T13:00:00.00000+02:00" }" }
 *   ]' >
 * </capitec-date-time-picker>
 * ```
 *
 */

export class DateTimePicker extends Component {
	// --------------
	// INITIALISATION
	// --------------

	/**
	 * @hideconstructor
	 */
	constructor() {
		super();

		// Component properties
		this.mode = DATEMODE.DATE;
		this.type = DATETYPE.SINGLE;
		this.inputType = INPUTTYPE.CALENDAR;
		this.outputType = OUTPUTTYPE.STRING;
		this.error = null;
		this.label = null;
		this.date = null;
		this.startDate = null;
		this.endDate = null;
		this.predefinedRanges = [];
		this.minDate = DateTime.local(2000, 1);
		this.maxDate = DateTime.local(DateTime.local().year, 12, 31);
		this.disabled = false;

		this._date = null;
		this._startDate = null;
		this._endDate = null;
		this._minDate = null;
		this._maxDate = null;
		this._showExpander = false;
		this._showStartTime = false;
		this._showEndTime = false;
		this._placeholderDate = null;
		this._placeholderStartDate = null;
		this._placeholderEndDate = null;
		this._isFocussed = false;
		this._isMouseOver = false;
		this._windowWidth = window.innerWidth;

		// Local constants
		this.DATE = `date`;
		this.START_DATE = `startDate`;
		this.END_DATE = `endDate`;
		this.HORIZONTAL_ALIGNMENT_THRESHOLD = 950;

		// Custom event constants
		this.VALUE_CHANGE = `value-change`;
		this.VALUE_CHANGED = `value-changed`;
		this.APPLY_CLICK = `apply-click`;
		this.APPLY_CLICKED = `apply-clicked`;
		this.CANCEL_CLICK = `cancel-click`;
		this.CANCEL_CLICKED = `cancel-clicked`;

		this.addEventListener(`focus`, this._onFocus);
		this.addEventListener(`focusout`, this._onFocusout);
		this.addEventListener(`mouseenter`, () => this._isMouseOver = true);
		this.addEventListener(`mouseleave`, () => this._isMouseOver = false);

		this.$$resize = fromEvent(window, `resize`)
			.pipe(debounceTime(800))
			.subscribe((event) => {
				this._windowWidth = event.target.innerWidth;
			});
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
	 * @property {String} [date] - Provide a preselected date.
	 *
	 * @property {String} [startDate] - Provide a Start Date.
	 * @property {String} [endDate] - Provide an End Date.
	 *
	 * @property {String} [type="range"] - Set the Date time picker type:
	 * - `single` Select a single date.
	 * - `range` Select a data range.
	 *
	 * @property {String} [mode] - Set the Date time picker mode:
	 * - `date` Date selection only
	 * - `time` Time selection only.
	 * - `datetime` Date and Time selection.
	 *
	 * @property {String} [inputType] - Set the input type:
	 * - `input` Select date using input controls.
	 * - `calendar` Selected date using a calendar control.
	 *
	 * @property {PredefinedRangeItem[]} [predefinedRanges] - Source data to render as options.
	 *
	 * @property {String} [outputType] - Set the output value type:
	 * - `string` Date(s) output as UTC ISO string format.
	 * - `date` Date(s) output as pure JS date type.
	 * - `datetime` Date(s) output as luxon DateTime type.
	 * 
	 * @property {Boolean} [disabled] - Disables all inputs and selects, applying the disabled styles as well.
	 *
	 * @property {Boolean} [hideCalendar] - Makes the calendar visible / invisible (deprecated)
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
			date: { type: String, converter: dateConverter },
			startDate: { type: String, converter: dateConverter },
			endDate: { type: String, converter: dateConverter },
			type: { type: String },
			mode: { type: String },
			inputType: { type: String },
			predefinedRanges: { type: Array },
			outputType: { type: String },
			disabled: { type: Boolean },

			_isMouseOver: { type: Boolean },
			_isFocussed: { type: Boolean },
			_windowWidth: { type: Number },
			_showExpander: { type: Boolean },
			_showStartTime: { type: Boolean },
			_showEndTime: { type: Boolean },
			_placeholderDate: { type: Object, attribute: false },
			_placeholderStartDate: { type: Object, attribute: false },
			_placeholderEndDate: { type: Object, attribute: false },

			// deprecated picker properties
			hideCalendar: { type: Boolean },
			minDateCal2: { type: Object },
			maxDateCal1: { type: Object }
		};
	}

	// -------------------
	// LIFECYCLE OVERRIDES
	// -------------------

	disconnectedCallback() {
		this.$$resize.unsubscribe();
		super.disconnectedCallback();
	}

	// n/a

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

	/**
	 * When the select component loses focus.
	 * @param {MouseEvent} e - the event details
	 * @ignore
	 * @returns {void}
	 */
	_onFocusout(e) {
		this._isFocussed = false;

		if (this._showExpander && !this._isMouseOver) {
			this._showExpander = false;
		}
		this.requestUpdate();
	}

	/**
	 * @returns {void}
	 */
	_handleApplyClick() {
		this._showExpander = false;
		const applyEventNames = [this.VALUE_CHANGE, this.APPLY_CLICK, this.VALUE_CHANGED, this.APPLY_CLICKED];
		const dispatchObject = this._getDispatchObject();

		this._dispatchCustomEvents(dispatchObject.oldValue, dispatchObject.newValue, applyEventNames);

		this.date = this._placeholderDate;
		this.startDate = this._placeholderStartDate;
		this.endDate = this._placeholderEndDate;
		this._placeholderDate = null;
	}

	_handleCancelClick() {
		this._showExpander = false;
		const cancelEventNames = [this.CANCEL_CLICK, this.CANCEL_CLICKED];
		const dispatchObject = this._getDispatchObject();

		this._dispatchCustomEvents(null, dispatchObject.newValue, cancelEventNames);

		this._placeholderDate = this.date;
		this._placeholderStartDate = this.startDate;
		this._placeholderEndDate = this.endDate;
	}

	/**
	 * @param  {Event} e event
	 * @param  {String|object} changedProp minute|hour|day|month|year accessor property of date
	 * @param  {String} propName date|startDate|endDate name of prop to be modified
	 * @returns {void}
	 */
	_handleDateChanged(e, changedProp, propName) {
		e.stopPropagation();
		let changeObject = {};

		if (changedProp instanceof Object) {
			changeObject = changedProp;
		} else {
			changeObject = { [changedProp]: e.detail.new[changedProp] };
		}

		const defaultDate = DateTime.fromObject(changeObject);
		const placeholderDate = this._getPlaceholderDate(propName);

		const newDate = placeholderDate ? placeholderDate.set(changeObject) : defaultDate;

		this._updateDate(propName, newDate);
	}

	/**
	 * @param  {Event} e event
	 * @param  {String} propName date|startDate|endDate name of prop to be modified
	 * @returns {void}
	 */
	_handleCalendarDateClicked(e, propName) {
		e.stopPropagation();
		const dateObject = DateTime.fromJSDate(new Date(e.detail.new.date)).toObject();

		this._handleDateChanged(e, dateObject, propName);
		if (this.type === DATETYPE.SINGLE) {
			this._handleApplyClick();
		}
	}

	/**
	 * @param  {Event} e event
	 * @returns {void}
	 */
	_handlePredefinedClick(e) {
		e.stopPropagation();
		if (e.detail.new.value !== `custom`) {
			this._placeholderStartDate = e.detail.new.value.startDate;
			this._placeholderEndDate = e.detail.new.value.endDate;
			this._handleApplyClick();
		}
	}

	// --------------
	// PUBLIC METHODS
	// --------------

	/**
	 * @typedef {Object} DateDropdownObject
	 * @property {string} name - a formatted string variant of a DateTime object
	 * @property {string} index - a uniquely identifyable index of this object
	 */

	/**
	 * Converts a DateTime object into a dropdown option object
	 *
	 * @param  {DateTime} date a selectable date option
	 * @param  {String} propName the property name of the DateTime object to use as the stored option value
	 * @param  {String} format the format in which the DateTime object should render
	 * @returns {DateDropdownObject} a DateTime object in dropdown option format
	 */
	getDateDropdownObject(date, propName, format) {
		return {
			name: date.toFormat(format),
			index: date.get(propName),
			[propName]: date.get(propName)
		};
	}

	/**
	 * Attempts to convert the given input into a DateTime object
	 * - returns null if fail
	 *
	 * @param  {any} value value to convert to type DateTime
	 * @returns {DateTime} DateTime object
	 */
	convertToDateTime(value) {
		if (!(value instanceof DateTime)) {
			const date = value && value !== `null` ? new Date(value) : null;

			if (date) {
				const dateTime = DateTime.fromJSDate(date);

				return dateTime.isValid ? dateTime : null;
			}

			return null;
		}

		return value.isValid ? value : null;
	}

	// ---------------
	// PRIVATE METHODS
	// ---------------

	get date() {
		return this.convertToDateTime(this._date);
	}

	set date(value) {
		this._date = this.convertToDateTime(value);
		this._placeholderDate = null;
		this.requestUpdate(`date`);
	}

	get startDate() {
		return this.convertToDateTime(this._startDate);
	}

	set startDate(value) {
		this._startDate = this.convertToDateTime(value);
		this._placeholderStartDate = null;
		this.requestUpdate(`startDate`);
	}

	get endDate() {
		return this.convertToDateTime(this._endDate);
	}

	set endDate(value) {
		this._endDate = this.convertToDateTime(value);
		this._placeholderEndDate = null;
		this.requestUpdate(`endDate`);
	}

	get minDate() {
		return this.convertToDateTime(this._minDate) || DateTime.local(2000, 1);
	}

	set minDate(value) {
		this._minDate = this.convertToDateTime(value);
		this.requestUpdate(`minDate`);
	}

	get maxDate() {
		return this.convertToDateTime(this._maxDate) || DateTime.local(DateTime.local().year, 12, 31);
	}

	set maxDate(value) {
		this._maxDate = this.convertToDateTime(value);
		this.requestUpdate(`maxDate`);
	}

	/**
	 * @param  {any} oldValue old prop value
	 * @param  {any} newValue new prop value
	 * @param  {string} customEventName name of custom event to dispatch
	 * @returns {void}
	 */
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

	/**
	 * @param  {any} oldValue old prop value
	 * @param  {any} newValue new prop value
	 * @param  {String[]} customEventNames names of custom events to dispatch
	 * @returns {void}
	 */
	_dispatchCustomEvents(oldValue, newValue, customEventNames) {
		customEventNames.forEach(customEventName => {
			this._dispatchCustomEvent(oldValue, newValue, customEventName);
		});
	}

	/**
	 * @typedef {Object} SingleResult
	 * @property {string} date - selected date value as ISO
	 */

	/**
	 * @typedef {Object} RangeResult
	 * @property {number} startDate - selected start date value as ISO
	 * @property {number} endDate - selected end date value as ISO
	 */

	/**
	* @typedef {Object} DispatchObject
	* @property {SingleResult|RangeResult} oldValue - old value
	* @property {SingleResult|RangeResult} newValue - new value
	*/

	/**
	 * @returns {DispatchObject} the range or single dispatch object
	 */
	_getDispatchObject() {
		const dispatchObject = { oldValue: null, newValue: null };

		if (this.type === DATETYPE.RANGE) {
			dispatchObject.oldValue = {
				startDate: this._getDispatchDate(this.startDate),
				endDate: this._getDispatchDate(this.endDate)
			};
			dispatchObject.newValue = {
				startDate: this._getDispatchDate(this._placeholderStartDate),
				endDate: this._getDispatchDate(this._placeholderEndDate)
			};
		} else {
			dispatchObject.oldValue = {
				date: this._getDispatchDate(this.date)
			};
			dispatchObject.newValue = {
				date: this._getDispatchDate(this._placeholderDate)
			};
		}

		return dispatchObject;
	}

	/**
	 * @param  {DateTime} date date to convert
	 * @returns {String|Date} date in ouput format
	 */
	_getDispatchDate(date) {
		if (date) {
			switch (this.outputType) {
				case OUTPUTTYPE.STRING:
					return date.toISO();
				case OUTPUTTYPE.DATE:
					return date.toJSDate();
				case OUTPUTTYPE.DATETIME:
					return date;
				default:
					return null;
			}
		}

		return null;
	}

	_toggleExpander() {
		if (!this.disabled) {
			this._showExpander = !this._showExpander;
			this._isFocussed = this._showExpander;
		}
	}

	_toggleStartTime(e) {
		e.stopPropagation();
		this._showStartTime = !this._showStartTime;
	}

	_toggleEndTime(e) {
		e.stopPropagation();
		this._showEndTime = !this._showEndTime;
	}

	/**
	 * @param  {DateTime} newDate date to limit by min and max date
	 * @returns {DateTime} a valid date limited by min and max date
	 */
	_getValidDate(newDate) {
		let updatedDate = null;

		if (newDate < this.minDate) {
			updatedDate = this.minDate;
		} else if (newDate > this.maxDate) {
			updatedDate = this.maxDate;
		} else {
			updatedDate = newDate;
		}

		return updatedDate;
	}

	/**
	 * @param  {DateTime} beginDate interval begin date
	 * @param  {DateTime} endDate interval end date
	 * @param  {String} intervalSeparator days|months|years the interval separator to use
	 * @returns {DateTime[]} returns an array of DateTime objects from the begin to end date
	 */
	_getValidDates(beginDate, endDate, intervalSeparator) {
		const providedIntervals = Interval.fromDateTimes(beginDate, endDate).splitBy({ [intervalSeparator]: 1 });
		const validDatesInterval = Interval.fromDateTimes(this.minDate, this.maxDate);

		return providedIntervals.flatMap(providedInterval => validDatesInterval.intersection(providedInterval) ? providedInterval.start : []);
	}

	_getLabel() {
		if (this.label) {
			return this.label;
		}
		switch (true) {
			case this.mode === DATEMODE.DATE && this.type === DATETYPE.SINGLE:
				return `Select a date`;
			case this.mode === DATEMODE.TIME && this.type === DATETYPE.SINGLE:
				return `Select a time`;
			case this.mode === DATEMODE.DATETIME && this.type === DATETYPE.SINGLE:
				return `Select a date and time`;
			case this.mode === DATEMODE.DATE && this.type === DATETYPE.RANGE:
				return `Select date range`;
			case this.mode === DATEMODE.TIME && this.type === DATETYPE.RANGE:
				return `Select time range`;
			case this.mode === DATEMODE.DATETIME && this.type === DATETYPE.RANGE:
				return `Select date and time range`;
			default:
				return this.label;
		}
	}

	_getDateFormat() {
		switch (this.mode) {
			case DATEMODE.DATE:
				return `dd/MM/yyyy`;
			case DATEMODE.TIME:
				return `HH:mm`;
			case DATEMODE.DATETIME:
				return `dd/MM/yyyy - HH:mm`;
			default:
				return `dd/MM/yyyy`;
		}
	}

	/**
	 * @param  {string} dateTimeProperty the property to base the offset on
	 * @param  {DateTime} date the date object needed for getting max days in month
	 * @returns {number} offset, max value of provided property
	 */
	_getDateTimeOffset(dateTimeProperty, date) {
		switch (dateTimeProperty) {
			case `minute`:
				return 60;
			case `hour`:
				return 24;
			case `day`:
				return date.daysInMonth;
			case `month`:
				return 30;
			default:
				return 0;
		}
	}

	/**
	 * @param  {string} propName date|startDate|endDate placeholder name to get
	 * @param  {string} value placeholder name to get
	 * @returns {void}
	 */
	_getPlaceholderDate(propName) {
		switch (propName) {
			case this.DATE:
				return this._placeholderDate;
			case this.START_DATE:
				return this._placeholderStartDate;
			case this.END_DATE:
				return this._placeholderEndDate;
			default:
				return null;
		}
	}

	_getSelectedRangeValue() {
		if (this.type === DATETYPE.RANGE) {
			const startDate = this._placeholderStartDate || this.startDate || null;
			const endDate = this._placeholderEndDate || this.endDate || null;
			const startDateISO = startDate ? startDate.toISO() : ``;
			const endDateISO = endDate ? endDate.toISO() : ``;

			if (this.predefinedRanges.length > 0) {
				if (startDate && endDate) {
					const selectedValue = this.predefinedRanges.find(({ value }) => value.startDate === startDateISO && value.endDate === endDateISO);

					if (selectedValue) {
						return selectedValue.text;
					}
				} else {
					return this._getLabel();
				}
			}

			const startDateDisplay = startDate ? startDate.toFormat(this._getDateFormat()) : this._getDateFormat().toLowerCase();
			const endDateDisplay = endDate ? endDate.toFormat(this._getDateFormat()) : this._getDateFormat().toLowerCase();

			return `${startDateDisplay} - ${endDateDisplay}`;
		}

		return ``;
	}

	_getCalendarHeaderText() {
		const startDate = this._placeholderStartDate || this.startDate || null;
		const endDate = this._placeholderEndDate || this.endDate || null;

		if (this.inputType === INPUTTYPE.CALENDAR) {
			if (!startDate && !endDate) {
				return this._getLabel();
			}
			const startDateDisplay = startDate ? startDate.toFormat(`dd MMM, yyyy`) : this._getDateFormat().toLowerCase();
			const endDateDisplay = endDate ? endDate.toFormat(`dd MMM, yyyy`) : this._getDateFormat().toLowerCase();

			return `${startDateDisplay} - ${endDateDisplay}`;
		}

		return ``;
	}

	/**
	 * @param  {String} propName name of prop to update
	 * @param  {DateTime} newDate updated date value
	 * @returns {void}
	 */
	_updateDate(propName, newDate) {
		const updatedDate = this._getValidDate(newDate);

		switch (propName) {
			case this.DATE:
				this._placeholderDate = updatedDate;
				break;
			case this.START_DATE: {
				const endDate = this._placeholderEndDate || this.endDate || null;

				this._placeholderStartDate = endDate && updatedDate > endDate ? endDate : updatedDate;
				break;
			}
			case this.END_DATE: {
				const startDate = this._placeholderStartDate || this.startDate || null;

				this._placeholderEndDate = startDate && updatedDate < startDate ? startDate : updatedDate;
				break;
			}
			default:
				break;
		}
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

				.rangePicker {
					display: flex;
					flex-direction: row;
					background-color: var(--theme-date-time-picker-range-picker-background-color, #e1e1e1);
				}

				.container {
					background-color: var(--theme-date-time-picker-container-background-color, transparent);
				}

				.container > .calendar-icon {
					display: flex;
					top: var(--theme-date-time-picker-container-calendar-icon-top, 0px);
					right: var(--theme-date-time-picker-container-calendar-icon-right, 0px);
					margin: var(--theme-date-time-picker-container-calendar-icon-margin, 1px);
					padding: var(--theme-date-time-picker-container-calendar-icon-padding, 10px 10px);
					height: var(--theme-date-time-picker-container-calendar-icon-height, 46px);
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

				.basicBox {
					box-sizing: border-box;
					border: var(--theme-date-time-picker-basic-container-border, 1px solid #e1e1e1);
					border-radius: var(--theme-date-time-picker-basic-container-width, 4px);
					background-color: var(--theme-date-time-picker-basic-container-background-color, #ffffff);
					box-shadow: var(--theme-date-time-picker-basic-container-background-color, 0 3px 6px 0 rgba(0, 0, 0, 0.11));
					padding-top: var(--theme-date-time-picker-basic-container-padding-top, 16px);
					padding-left: var(--theme-date-time-picker-basic-container-padding-left, 16px);
					padding-right: var(--theme-date-time-picker-basic-container-padding-right, 16px);
					padding-bottom: var(--theme-date-time-picker-basic-container-padding-bottom, 16px);
					position: absolute;
					z-index: var(--theme-date-time-picker-basic-box-z-index, 1107);
				}

				.basicSelect {
					display: flex;
					flex: 1;
					height: var(--theme-date-time-picker-date-select-height, 48px);
				}

				.basicPicker {
					min-width: var(--theme-date-time-picker-basic-picker-min-width, 320px);
					height: var(--theme-date-time-picker-basic-picker-height, 48px);
					cursor: pointer;
				}

				.calendarPicker {
					min-width: var(--theme-date-time-picker-calendar-picker-min-width, 200px);
					height: var(--theme-date-time-picker-calendar-picker-height, 48px);
					cursor: pointer;
				}

				.hrDivider {
					border: var(--theme-date-time-picker-hr-border, 1px solid #efefef);
				}

				.timeGroup {
					margin-top: var(--theme-date-time-picker-end-group-margin-top, 26px);
				}

				.dateSelectGroup {
					display: flex;
					flex: 1;
					margin-bottom: var(--theme-date-time-picker-date-group-margin-bottom, 16px);
				}

				.timeDiv {
					display: flex;
					justify-content: space-between;
				}

				.dateSelectLabel {
					padding-bottom: var(--theme-date-time-picker-date-select-label-padding-bottom, 12px);
				}

				.calendarHeader {
					display: flex;
					justify-content: center;
					padding: var(--theme-date-time-picker-calendar-header-padding, 12px);
					background-color: var(--theme-date-time-picker-calendar-header-background-color, #F7F7F7);
				}

				.rangeCalendar {
					border: var(--theme-date-time-picker-range-calendar-border, 1px solid #e1e1e1);
					border-radius: var(--theme-date-time-picker-range-calendar-border-radius, 4px);
					background-color: var(--theme-date-time-picker-range-calendar-background-color, #FFFFFF);
					min-width: var(--theme-date-time-picker-range-calendar-min-width, max-content);
				}

				.longSelect {
					min-width: var(--theme-date-time-picker-long-select-min-width, 368px);
				}

				.mediumSelect {
					min-width: var(--theme-date-time-picker-medium-select-min-width, 250px);
				}

				.column {
					flex-direction: column;
				}

				.floatingContainer {
					position: absolute;
					z-index: var(--theme-date-time-picker-basic-box-z-index, 1107);
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
		if (this.type === DATETYPE.RANGE && this.predefinedRanges.length > 0) {
			return this._renderPredefinedRangePicker();
		}
		switch (this.inputType) {
			case INPUTTYPE.INPUT:
				return this.type === DATETYPE.SINGLE
					? this._renderSingleInput()
					: this._renderRangeInput();
			case INPUTTYPE.CALENDAR:
				return this.type === DATETYPE.SINGLE
					? this._renderSingleCalendar()
					: this._renderRangeCalendar();
			default:
				return html``;
		}
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
	 * @param  {DateTime} date date to base select on
	 * @param  {String} intervalType minute|hour|day|month|year the intended type of interval
	 * @param  {String} intervalSeparator minutes|hours|days|months|years the interval by which to separate by
	 * @param  {String} dateTimeProperty minute|hour|day|month|year the property to store in the dropdown option
	 * @param  {String} format the format in which to display the dropdown option
	 * @param  {String} classNames an override for the classname of the select
	 * @param  {String} defaultValue the value to place in the dropdown when nothing is selected
	 * @param  {String} propName date|startDate|endDate attached prop
	 * @returns {html} renders a dropdown with options based on the date parameters given
	 */
	_renderDateTimeSelect(date, intervalType, intervalSeparator, dateTimeProperty, format, classNames, defaultValue, propName) {
		const startDate = this._placeholderStartDate || this.startDate || null;
		const endDate = this._placeholderEndDate || this.endDate || null;
		const currentDate = date || this._getValidDate(DateTime.local());
		let minValidDate = currentDate.startOf(intervalType);
		let maxValidDate = currentDate.endOf(intervalType);

		if (endDate && propName === this.START_DATE) {
			if (date) {
				const offset = this._getDateTimeOffset(dateTimeProperty, date);
				const diff = Math.abs(endDate.diff(date, intervalSeparator).toObject()[intervalSeparator]) + date.get(dateTimeProperty) - 1;

				if (diff < offset) {
					maxValidDate = endDate;
				}
			} else if (this.mode === DATEMODE.TIME && dateTimeProperty === `hour`) {
				minValidDate = endDate.startOf(intervalType);
				maxValidDate = endDate;
			}
		}

		if (startDate && propName === this.END_DATE) {
			if (date) {
				const offset = this._getDateTimeOffset(dateTimeProperty, date);
				const diff = Math.abs(date.diff(startDate, intervalSeparator).toObject()[intervalSeparator]);
				const datePropertyValue = date.get(dateTimeProperty);
				const dateDifference = diff + offset - datePropertyValue;

				if (dateDifference < offset) {
					minValidDate = startDate;
				}
			} else if (this.mode === DATEMODE.TIME && dateTimeProperty === `hour`) {
				minValidDate = startDate;
				maxValidDate = startDate.endOf(intervalType);
			}
		}

		const validDateTimes = this._getValidDates(this._getValidDate(minValidDate), this._getValidDate(maxValidDate), intervalSeparator);
		const dropdownObjects = validDateTimes.map(validDateTime => this.getDateDropdownObject(validDateTime, dateTimeProperty, format));
		const selectedValue = date ? this.getDateDropdownObject(date, dateTimeProperty, format) : defaultValue;

		return html`
			<capitec-select
				class="${classNames}"
				.value="${selectedValue}"
				.items="${dropdownObjects}"
				@value-change=${(e) => e.stopPropagation()}
				@value-changed="${(e) => this._handleDateChanged(e, dateTimeProperty, propName)}"
				display-field="name"
				id-field="${dateTimeProperty}"
				?disabled="${this.disabled}"
			></capitec-select>
		`;
	}

	/**
	 * @param  {String} propName date|startDate|endDate attached prop
	 * @returns {html} renders a calendar
	 */
	_renderCalendar(propName) {
		const date = this._placeholderDate || this.date || null;
		const startDate = this._placeholderStartDate || this.startDate || null;
		const endDate = this._placeholderEndDate || this.endDate || null;
		const range = this.type === DATETYPE.RANGE;
		const minValidDate = date && startDate && propName === this.END_DATE ? startDate : this.minDate;
		const maxValidDate = date && endDate && propName === this.START_DATE ? endDate : this.maxDate;
		let currentDate = date || this._getValidDate(DateTime.local());

		if (this.type === DATETYPE.RANGE) {
			if (propName === this.START_DATE) {
				currentDate = startDate || this._getValidDate(DateTime.local().minus({ months: 1 }));
			} else {
				currentDate = endDate || this._getValidDate(DateTime.local());
			}
		}

		return html`
			<capitec-calendar
				month=${currentDate.monthShort}
				year="${currentDate.year}"
				?range=${range}
				date=${date ? date.toISO() : ``}
				startDate=${startDate ? startDate.toISO() : ``}
				endDate=${endDate ? endDate.toISO() : ``}
				minDate=${minValidDate.toISO()}
				maxDate=${maxValidDate.toISO()}
				@value-change=${(e) => e.stopPropagation()}
				@value-changed=${(e) => this._handleCalendarDateClicked(e, propName)}
			></capitec-calendar>
		`;
	}

	/**
	 * @param  {DateTime} date date to base selects on
	 * @param  {String} propName attached prop
	 * @returns {html} renders a hour and minute dropdown select
	 */
	_renderTimeSelects(date, propName) {
		const isDateTimeRange = this.mode === DATEMODE.DATETIME && this.type === DATETYPE.RANGE;

		return html`
			<capitec-group class="dateSelectGroup ${isDateTimeRange ? `timeGroup` : ``}" layout="horizontal" gap="clear" halign="left" valign="top">
				${this._renderDateTimeSelect(date, `day`, `hours`, `hour`, `HH`, `basicSelect`, `Hour`, propName)}
				${this._renderDateTimeSelect(date, `hour`, `minutes`, `minute`, `mm`, `basicSelect`, `Min`, propName)}
			</capitec-group>
		`;
	}

	/**
	 * @param  {DateTime} date date to base selects on
	 * @param  {String} propName attached prop
	 * @returns {html} renders a day, month and year dropdown select
	 */
	_renderDateSelects(date, propName) {
		const rangeMinDate = this._placeholderStartDate || this.startDate || null;
		const rangeMaxDate = this._placeholderEndDate || this.endDate || null;
		const minValidDate = propName === this.END_DATE && rangeMinDate ? rangeMinDate : this.minDate;
		const maxValidDate = propName === this.START_DATE && rangeMaxDate ? rangeMaxDate : this.maxDate;
		const validYears = this._getValidDates(minValidDate.startOf(`year`), maxValidDate.startOf(`year`).plus({ year: 1 }), `years`);
		const years = validYears.map(year => this.getDateDropdownObject(year, `year`, `yyyy`));
		const selectedYear = date ? this.getDateDropdownObject(date, `year`, `yyyy`) : `yyyy`;

		return html`
			<capitec-group class="dateSelectGroup" layout="horizontal" gap="clear" halign="left" valign="top" >
				${this._renderDateTimeSelect(date, `month`, `days`, `day`, `dd`, `basicSelect`, `dd`, propName)}
				${this._renderDateTimeSelect(date, `year`, `months`, `month`, `MMM`, `basicSelect`, `mm`, propName)}
				<capitec-select
					class="basicSelect"
					.value="${selectedYear}"
					.items=${years}
					display-field="name"
					id-field="year"
					@value-change=${(e) => e.stopPropagation()}
					@value-changed="${(e) => this._handleDateChanged(e, `year`, propName)}"
					?disabled="${this.disabled}"
				></capitec-select>
			</capitec-group>
		`;
	}

	_renderChevron() {
		let chevronStyle = ``;

		if (!(this._valueSelected && !this._isFocussed)) {
			chevronStyle = this.error ? `-error` : `-action`;
		}

		return html`
			<div class="icon" @click=${() => this._toggleExpander()}>
				<img
					class="${this._showExpander ? `expanded` : `collapsed`}"
					src="./platform/icons/system/chevron-down${chevronStyle}.svg"
				/>
			</div>
		`;
	}

	/**
	 * @param  {Boolean} shouldShow renders the icon when this is true
	 * @param  {Boolean} isSelected icon in active state
	 * @param  {Function} onClickHandler function to call on click
	 * @returns {html} renders the calendar icon
	 */
	_renderCalendarIcon(shouldShow, isSelected, onClickHandler) {
		const iconStyles = {
			backgroundColor: isSelected && !this.error ? `#0083bb1a` : `transparent`
		};

		return shouldShow ? html`
			<div class="icon calendar-icon ${this.error ? `error` : ``}" style=${styleMap(iconStyles)} @click=${onClickHandler}>
				<img src="./platform/icons/system/calendar${this.error ? `-error` : `-action`}.svg"/>
			</div>` : html``;
	}

	_renderError() {
		return this.error ? html`<div class="error">${this.error}</div>` : ``;
	}

	_renderDateButtons() {
		return html`
			<capitec-group layout="horizontal" gap="clear" halign="right" valign="top">
				<capitec-button
					label="Cancel"
					type="clear"
					@click=${() => this._handleCancelClick()}
				></capitec-button>
				<capitec-button
					label="Apply"
					type="clear"
					@click=${() => this._handleApplyClick()}
				></capitec-button>
			</capitec-group>
		`;
	}

	_renderDateDisplay() {
		let selectedValue = ``;
		let hasValue = false;

		if (this.type === DATETYPE.SINGLE) {
			const date = this._placeholderDate || this.date || null;

			hasValue = date;
			if (!hasValue && !this._showExpander) {
				selectedValue = this._getLabel();
			} else {
				selectedValue = date ? date.toFormat(this._getDateFormat()) : this._getDateFormat().toLowerCase();
			}
		} else {
			const startDate = this._placeholderStartDate || this.startDate || null;
			const endDate = this._placeholderEndDate || this.endDate || null;

			hasValue = startDate || endDate;
			if (!hasValue && !this._showExpander) {
				selectedValue = this._getLabel();
			} else {
				selectedValue = this._getSelectedRangeValue();
			}
		}

		const labelStyles = {
			focussed: this._isFocussed,
			valueSelected: hasValue,
			error: this.error
		};
		const labelValue = this._showExpander || hasValue ? this._getLabel() : null;
		const showCalendar = this.inputType === INPUTTYPE.CALENDAR;

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
				tabindex="${ifDefined(this.disabled ? `-1` : undefined)}"
				@click=${() => this._toggleExpander()}
				?disabled="${this.disabled}"
			/>
			${showCalendar ? this._renderCalendarIcon(showCalendar, this._showExpander && this._isFocussed, this._toggleExpander) : this._renderChevron()}
		`;
	}

	/**
	 * @param  {DateTime} date date to base display on
	 * @param  {String} propName date|startDate|endDate attached prop
	 * @param  {Boolean} toggleValue whether the toggle should be in on or off state
	 * @param  {Function} toggleHandler handler for when toggle is clicked
	 * @return {void}
	 */
	_renderDateInput(date, propName, toggleValue, toggleHandler) {
		if (this._showExpander) {
			switch (this.mode) {
				case DATEMODE.DATE: {
					return this._renderDateSelects(date, propName);
				}
				case DATEMODE.TIME: {
					return this._renderTimeSelects(date, propName);
				}
				case DATEMODE.DATETIME: {
					if (this.type === DATETYPE.RANGE) {
						return html`
							${this._renderDateSelects(date, propName)}
							<hr class="hrDivider">
							<div class="timeDiv">
								<capitec-label type="strong" label="Select time"></capitec-label>
								<capitec-toggle ?checked=${toggleValue} @value-change=${(e) => e.stopPropagation()} @value-changed="${toggleHandler}"></capitec-toggle>
							</div>
							${toggleValue ? this._renderTimeSelects(date, propName) : html``}
							<hr class="hrDivider">
						`;
					}

					return html`
						<capitec-label class="dateSelectLabel" type="strong" label="Select date"></capitec-label>
						${this._renderDateSelects(date, propName)}
						<capitec-label class="dateSelectLabel" type="strong" label="Select time"></capitec-label>
						${this._renderTimeSelects(date, propName)}
					`;
				}
				default:
					return html``;
			}
		}

		return html``;
	}

	_renderSingleInput() {
		const selectedValue = this._placeholderDate || this.date || null;
		const containerStyles = {
			completed: !this._isFocussed,
			basicPicker: true,
			focussed: this._isFocussed,
			valueSelected: selectedValue,
			error: this.error,
			disabled: this.disabled
		};

		return html`
			<div class="select container ${classMap(containerStyles)}">
				${this._renderDateDisplay()}
				${this._showExpander ? html`<div class="basicBox">
					${this._renderDateInput(selectedValue, `date`)}
					${this._renderDateButtons()}
				</div>` : html``}
				${this._renderError()}
			</div>
		`;
	}

	_renderRangeInput() {
		const startDate = this._placeholderStartDate || this.startDate || null;
		const endDate = this._placeholderEndDate || this.endDate || null;
		const valueSelected = startDate || endDate;
		const isDateTime = this.mode === DATEMODE.DATETIME;
		const containerStyles = {
			completed: !this._isFocussed,
			basicPicker: true,
			focussed: this._isFocussed,
			valueSelected: valueSelected,
			longSelect: isDateTime,
			error: this.error,
			disabled: this.disabled

		};

		return html`
			<div class="select container ${classMap(containerStyles)}">
				${this._renderDateDisplay()}
				${this._showExpander ? html`<div class="basicBox ${isDateTime ? `longSelect` : ``}">
					<capitec-label class="dateSelectLabel" type="strong" label="Start date"></capitec-label>
					${this._renderDateInput(startDate, `startDate`, this._showStartTime, this._toggleStartTime)}
					<capitec-label class="dateSelectLabel" type="strong" label="End date"></capitec-label>
					${this._renderDateInput(endDate, `endDate`, this._showEndTime, this._toggleEndTime)}
					${this._renderDateButtons()}
				</div>` : html``}
				${this._renderError()}
			</div>
		`;
	}

	_renderSingleCalendar() {
		const selectedValue = this._placeholderDate || this.date || null;
		const containerStyles = {
			completed: !this._isFocussed,
			basicPicker: true,
			focussed: this._isFocussed,
			valueSelected: selectedValue,
			error: this.error,
			disabled: this.disabled
		};

		return html`
			<div class="select container ${classMap(containerStyles)}">
				${this._renderDateDisplay()}
				${this._showExpander ? html`
						<div class="container floatingContainer">
							${this._renderCalendar(this.DATE)}
						</div>
					` : html``}
				${this._renderError()}
			</div>
		`;
	}

	_renderRangeCalendar() {
		const startDate = this._placeholderStartDate || this.startDate || null;
		const endDate = this._placeholderEndDate || this.endDate || null;
		const valueSelected = startDate || endDate;
		const calendarOrientation = window.innerWidth < this.HORIZONTAL_ALIGNMENT_THRESHOLD ? `column` : ``;
		const containerStyles = {
			completed: !this._isFocussed,
			calendarPicker: true,
			focussed: this._isFocussed,
			valueSelected: valueSelected,
			error: this.error,
			disabled: this.disabled
		};

		return html`
			<div class="select container ${classMap(containerStyles)}">
				${this._renderDateDisplay()}
				${this._showExpander ? html`
					<div class="container rangeCalendar floatingContainer">
						<div class="calendarHeader">
							<capitec-label  type="subtitle" label=${this._getCalendarHeaderText()}></capitec-label>
						</div>
						<div class="rangePicker ${calendarOrientation}">
							${this._renderCalendar(this.START_DATE)}
							${this._renderCalendar(this.END_DATE)}
						</div>
						${this._renderDateButtons()}
					</div>
				` : html``}
				${this._renderError()}
			</div>
		`;
	}

	/**
	 * @param  {PredefinedRangeItem} item a predefined range item
	 * @returns {html} renders an option in the predefined range dropdown
	 */
	_renderPredefinedRangeItem(item) {
		const containerStyles = {
			display: `flex`,
			justifyContent: `space-between`
		};

		return html`
			<div style=${styleMap(containerStyles)} @click=${() => item.value === `custom` && this._toggleExpander()}>
				<capitec-label label=${item.text}></capitec-label>
				${this._renderCalendarIcon(item.value === `custom`)}
			</div>
		`;
	}

	_renderCustomPredefinedRangePicker() {
		if (this._showExpander) {
			const startDate = this._placeholderStartDate || this.startDate || null;
			const endDate = this._placeholderEndDate || this.endDate || null;

			return this.inputType === INPUTTYPE.INPUT
				? html`
					<div class="basicBox">
						<capitec-label class="dateSelectLabel" type="strong" label="Start date"></capitec-label>
						${this._renderDateInput(startDate, `startDate`, this._showStartTime, this._toggleStartTime)}
						<capitec-label class="dateSelectLabel" type="strong" label="End date"></capitec-label>
						${this._renderDateInput(endDate, `endDate`, this._showEndTime, this._toggleEndTime)}
						${this._renderDateButtons()}
					</div>
				`
				: html`
					<capitec-modal
						class="calendar"
						status="info"
						type="free"
						header="${this._getCalendarHeaderText()}"
						header-align="center"
					>
						<div slot="body" class="rangePicker">
							${this._renderCalendar(this.START_DATE)}
							${this._renderCalendar(this.END_DATE)}
						</div>
						<capitec-group slot="footer" layout="horizontal" gap="clear" halign="right" valign="top">
							${this._renderDateButtons()}
						</capitec-group>
					</capitec-modal>
				`;
		}

		return html``;
	}

	_renderPredefinedRangePicker() {
		let options = this.predefinedRanges.map(predefinedRangeItem => {
			const startDate = DateTime.fromISO(predefinedRangeItem.value.startDate);
			const endDate = DateTime.fromISO(predefinedRangeItem.value.endDate);

			return {
				text: predefinedRangeItem.text,
				value: {
					startDate: startDate.isValid ? startDate : null,
					endDate: endDate.isValid ? endDate : null
				}
			};
		});

		options = options.concat({
			text: `Custom Range`,
			value: `custom`
		});

		const selectStyle = {
			mediumSelect: this.mode === DATEMODE.DATE,
			longSelect: this.mode === DATEMODE.DATETIME
		};

		return html`
			<div class="container rangeCalendar">
				<capitec-select
					class="select container basic-picker ${classMap(selectStyle)}"
					.value="${this._getSelectedRangeValue()}"
					.items=${options}
					display-field="text"
					id-field="value"
					.error=${this.error}
					.displayRenderer=${(item) => this._renderPredefinedRangeItem(item)}
					@value-change=${(e) => e.stopPropagation()}
					@value-changed="${(e) => this._handlePredefinedClick(e)}"
					?disabled="${this.disabled}"
				></capitec-select>
				${this._renderCustomPredefinedRangePicker()}
			</div>
		`;
	}

}

window.customElements.define(`capitec-date-time-picker`, DateTimePicker);

/**
 * When the selected value changes.
 *
 * @example
 * <capitec-date-time-picker ... @value-change="${this._handler}"></capitec-date-time-picker>
 *
 * @event DateTimePicker#value-change
 * @type {Object}
 * @property {Object} detail Contains old value and new value.
 * @property {Object} detail.old - old value of the date picker.
 * @property {Object} detail.new - new value selected of the date picker.
 */

/**
* When the apply button is clicked.
*
* @example
* <capitec-date-time-picker ... @apply-click="${this._handler}"></capitec-date-time-picker>
*
* @event DateTimePicker#apply-click
* @type {Object}
* @property {Object} detail Contains old value and new value.
* @property {Object} detail.old - old value of the date picker.
* @property {Object} detail.new - new value selected of the date picker.
*/

/**
* When the apply button is clicked.
*
* @example
* <capitec-date-time-picker ... @cancel-click="${this._handler}"></capitec-date-time-picker>
*
* @event DateTimePicker#cancel-click
* @type {Object}
* @property {Object} detail Contains old value and new value.
* @property {Object} detail.old - old value of the date picker.
* @property {Object} detail.new - new value selected of the date picker.
*/