/*
	Utility Functions
*/


/**
 * Indicates if a string value is null, undefined or empty
 *
 * @export
 * @param {String} fieldValue A string value
 * @returns {Boolean} True if the input string is null, undefined or empty
 */
export function isNullorEmpty(fieldValue) {
	return fieldValue === `` || fieldValue === null || fieldValue === undefined;
}

/**
 * Validate a field against a regular expression
 *
 * @export
 * @param {*} field A field value to validate
 * @param {*} criteria A regular Expression
 * @returns {*} The field value if the regular expression is a match, 0 otherwise
 */
export function validate(field, criteria) {
	const re = RegExp(criteria);

	if (re.test(field)) {
		return field;
	}

	return 0;
}

/**
 * Determine ordinal(st/nd/rd/th) for input date
 *
 * @export
 * @param {*} date date value
 * @returns {*} Ordinal fot the given date (1st, 2nd..)
 */
export function getDateOrdinal(date) {
	if (date > 3 && date < 21) {
		return `th`;
	}

	switch (date % 10) {
		case 1: return `st`;
		case 2: return `nd`;
		case 3: return `rd`;
		default: return `th`;
	}
}

/**
 * Determine month name for input month
 *
 * @export
 * @param {*} month month value
 * @returns {*} Month name (Jan, Feb..)
 */
export function getMonthName(month) {
	const monthNames = [`Jan`, `Feb`, `Mar`, `Apr`, `May`, `Jun`, `Jul`, `Aug`, `Sep`, `Oct`, `Nov`, `Dec`];
	return monthNames[month];
}

/**
 * Formatting currency
 *
 * @export
 * @param {*} value currency value
 * @returns {*} Formatted currency value (E.g R 250 000)
 */
export function formatCurrency(value) {
	return `${value.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ` `)}`;
}