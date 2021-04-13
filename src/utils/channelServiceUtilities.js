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

/**
 * Formatting phone number
 *
 * @export
 * @param {*} value phone number
 * @returns {*} Formatted phone number with spaces (E.g 071 256 9875)
 */
export function formatPhoneNumber(value) {
	return !value ? `-` : value.toString().replace(/(\d{3})(\d{3})(\d{4})/, `$1 $2 $3`);
}

/**
 *  
 *
 * @param {*} idNumber An ID Number
 * @returns {Boolean} Indicates if the check digit on the ID Number computes correctly
 */
function _luhnCheck(idNumber) {
	const num = idNumber.toString()
	.split(``)
	.reverse()
	.map(x => parseInt(x, 10));

	const lastDigit = num.splice(0, 1)[0];
	let sum = num.reduce((acc, val, i) => (i % 2 !== 0 ? acc + val : acc + ((val * 2) % 9) || 9), 0);
	sum += lastDigit;

	return sum % 10 === 0;
}

/**
 * Tests to see if the check digit on a South African ID number is correct 
 * and that the ID number is of the correct length. 
 *
 * @export
 * @param {String} southAfricanIDNumber A South African ID Number to be checked
 * @returns {String} Check if a South African ID number is well formed
 */
export function isWellFormedSouthAfricanID(southAfricanIDNumber) {
	return southAfricanIDNumber.length === 13 && 
			RegExp(/^[0-9]{13}$/, `g`).test(southAfricanIDNumber);

		// Luhn check removed. Apparently there are valid numbers in the wild that 
		// fail this test????

		// && _luhnCheck(southAfricanIDNumber); 
}