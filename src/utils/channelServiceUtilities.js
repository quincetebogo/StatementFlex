/*
		Utility functions for extracting UI control flags and other fields from the channel service contract
		
		All these functions assume that field info follows the following basic structure

		{
			enabled 
			visible
			tabindex
			...
			other properties
			...
		}
*/

/**
 * Some channel service contracts have a enabled field as part of the information structure
 * for a field. This value is returned if it exists.
 *
 * @export
 * @param {Object} fieldInfo An object with information about a field
 * @returns {Boolean} True if the input structure indicates a vield is enabled. False otherwise.
 */
export function isDisabled(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in isDisabled is undefined");
		return false;
	}

	if (Object.prototype.hasOwnProperty.call(fieldInfo, `enabled`)) {
		return !fieldInfo.enabled;
	}

	// console.log("fieldInfo in isDisabled does not have an enabled property");
	return false;
}

/**
 * Some channel service contracts have a visible field as part of the information structure
 * for a field. This value is returned if it exists.
 * @export
 * @param {Object} fieldInfo An object with information about a field
 * @returns {Boolean} True if the input structure indicates a vield is visible. False otherwise.
 */
export function isHidden(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in isHidden is undefined");
		return false;
	}

	if (Object.prototype.hasOwnProperty.call(fieldInfo, `visible`)) {
		return !fieldInfo.visible;
	}

	// console.log("fieldInfo in isHidden does not have a visible property");
	return false;
}

/**
 * Some channel service contracts have a tabIndex field as part of the information structure
 * for a field. This value is returned if it exists.
 * @export
 * @param {Object} fieldInfo An object with information about a field
 * @returns {Number} The tab index for the vield (if it is specified), otherwise -1
 */
export function getTabIndex(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getTabIndex is undefined");
		return -1;
	}

	if (Object.prototype.hasOwnProperty.call(fieldInfo, `tabindex`)) {
		return fieldInfo.tabIndex;
	}

	// console.log("fieldInfo in getTabIndex does not have a tabIndex property");
	return -1;
}

/**
 * Some channel service contracts have a value field as part of the information structure
 * for a field. This value is returned if it exists.
 *
 * @export
 * @param {Object} fieldInfo An object with information about a field
 * @returns  {*} The value field of the input structure or an empty string if the value field does not exist
 */
export function getValue(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getValue is undefined");
		return ``;
	}
	if (Object.prototype.hasOwnProperty.call(fieldInfo, `value`)) {
		return !fieldInfo.value ? `` : fieldInfo.value;
	}
	// console.log("fieldInfo in getValue does not have a value property");
	return ``;
}

/**
 * Some channel service contracts have a possibleValues array as part of the information structure
 * for a field. This array is returned if it exists.
 *
 * @export
 * @param {Object} fieldInfo An object with information about a field
 * @returns {Array} An array of possible values or an empty array
 */
export function getPossibleValues(fieldInfo) {
	if (fieldInfo === undefined) {
		// console.log("fieldInfo in getPossibleValues is undefined");
		return [];
	}

	if (Object.prototype.hasOwnProperty.call(fieldInfo, `possibleValues`)) {
		return !fieldInfo.possibleValues ? [] : fieldInfo.possibleValues;
	}

	// console.log("fieldInfo in getPossibleValues does not have a possibleValues property");
	return [];
}

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